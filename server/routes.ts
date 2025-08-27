import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertCreditTransactionSchema, insertUserSchema } from "@shared/schema";
import { sendLeadPurchaseNotification, sendAdminPurchaseNotification } from "./emailService";
import { z } from "zod";
import crypto from "crypto";

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

// Simple auth middleware
const isSimpleAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Hash password function
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Simple login routes
  app.post('/api/simple-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          credits: user.credits
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/simple-register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = hashPassword(password);
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'client'
      });

      // Set session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = newUser;

      res.json({ 
        success: true, 
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          credits: newUser.credits
        } 
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/simple-logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/simple-auth/user', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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

  // Auth routes (original)
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
      
      // Send email notifications
      try {
        // Get company details for email
        const companies = await storage.getInsuranceCompanies();
        const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
          id: lead.insuranceCompanyId,
          name: lead.insuranceCompanyId,
          color: "#7C3AED"
        };
        
        // Update user object with new balance for email
        const updatedUser = { ...user, credits: newBalance };
        
        // Send notification to user (async, don't wait)
        sendLeadPurchaseNotification(updatedUser, lead, company).catch(error => {
          console.error('Failed to send user email notification:', error);
        });
        
        // Send notification to admin (async, don't wait)
        sendAdminPurchaseNotification(updatedUser, lead, company).catch(error => {
          console.error('Failed to send admin email notification:', error);
        });
      } catch (emailError) {
        console.error('Error preparing email notifications:', emailError);
        // Don't fail the purchase if email fails
      }
      
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

  // Admin lead management routes
  app.get('/api/admin/leads', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allLeads = await storage.getAllLeads();
      res.json(allLeads);
    } catch (error) {
      console.error("Error fetching admin leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
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

  app.put('/api/admin/leads/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.updateLead(req.params.id, validatedData);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete('/api/admin/leads/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const success = await storage.deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Integration settings routes
  app.get('/api/admin/integrations', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = {
        n8nWebhookUrl: "",
        n8nEnabled: false,
        kommoCrmApiKey: "",
        kommoCrmEnabled: false,
        mercadoPagoAccessToken: "",
        mercadoPagoEnabled: false,
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching integration settings:", error);
      res.status(500).json({ message: "Failed to fetch integration settings" });
    }
  });

  app.post('/api/admin/integrations', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      res.json({ message: "Integration settings saved successfully" });
    } catch (error) {
      console.error("Error saving integration settings:", error);
      res.status(500).json({ message: "Failed to save integration settings" });
    }
  });

  app.post('/api/admin/integrations/test-webhook', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { url } = req.body;
      
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: "Test webhook from KeepLeads"
      };
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload),
        });
        
        if (response.ok) {
          res.json({ message: "Webhook tested successfully" });
        } else {
          res.status(400).json({ message: `Webhook test failed: ${response.statusText}` });
        }
      } catch (fetchError) {
        res.status(400).json({ message: `Webhook test failed: ${fetchError.message}` });
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      res.status(500).json({ message: "Failed to test webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
