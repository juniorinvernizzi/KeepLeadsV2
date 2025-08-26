import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertCreditTransactionSchema } from "@shared/schema";
import { z } from "zod";

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lead routes
  app.get('/api/leads', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        insuranceCompany: req.query.insuranceCompany as string,
        ageRange: req.query.ageRange as string,
        city: req.query.city as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        status: req.query.status as string,
      };
      
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/:id', async (req, res) => {
    try {
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Purchase lead
  app.post('/api/leads/:id/purchase', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const leadId = req.params.id;
      
      // Get lead details
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      if (lead.status !== "available") {
        return res.status(400).json({ message: "Lead is not available for purchase" });
      }
      
      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has sufficient credits
      const userCredits = parseFloat(user.credits);
      const leadPrice = parseFloat(lead.price);
      
      if (userCredits < leadPrice) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      
      // Create purchase
      const purchase = await storage.purchaseLead({
        leadId,
        userId,
        price: lead.price,
      });
      
      // Deduct credits
      const newBalance = (userCredits - leadPrice).toFixed(2);
      await storage.updateUserCredits(userId, newBalance);
      
      // Add credit transaction
      await storage.addCreditTransaction({
        userId,
        type: "purchase",
        amount: `-${lead.price}`,
        description: `Lead purchase - ${lead.name}`,
        balanceBefore: user.credits,
        balanceAfter: newBalance,
      });
      
      res.json(purchase);
    } catch (error) {
      console.error("Error purchasing lead:", error);
      res.status(500).json({ message: "Failed to purchase lead" });
    }
  });

  // Get user's purchased leads
  app.get('/api/my-leads', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      
      // Get lead details for each purchase
      const purchasesWithLeads = await Promise.all(
        purchases.map(async (purchase) => {
          const lead = await storage.getLeadById(purchase.leadId);
          return { ...purchase, lead };
        })
      );
      
      res.json(purchasesWithLeads);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchased leads" });
    }
  });

  // Credit routes
  app.post('/api/credits/add', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { amount, paymentMethod, paymentId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newBalance = (parseFloat(user.credits) + amount).toFixed(2);
      await storage.updateUserCredits(userId, newBalance);
      
      await storage.addCreditTransaction({
        userId,
        type: "deposit",
        amount: amount.toFixed(2),
        description: `Credit deposit via ${paymentMethod}`,
        balanceBefore: user.credits,
        balanceAfter: newBalance,
        paymentMethod,
        paymentId,
      });
      
      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error adding credits:", error);
      res.status(500).json({ message: "Failed to add credits" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Insurance company routes
  app.get('/api/insurance-companies', async (req, res) => {
    try {
      const companies = await storage.getInsuranceCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
      res.status(500).json({ message: "Failed to fetch insurance companies" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post('/api/admin/leads', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
