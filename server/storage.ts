import {
  users,
  leads,
  leadPurchases,
  creditTransactions,
  insuranceCompanies,
  type User,
  type UpsertUser,
  type Lead,
  type InsertLead,
  type LeadPurchase,
  type InsertLeadPurchase,
  type CreditTransaction,
  type InsertCreditTransaction,
  type InsuranceCompany,
  type InsertInsuranceCompany,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lead operations
  getLeads(filters?: {
    search?: string;
    insuranceCompany?: string;
    ageRange?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Lead[]>;
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: InsertLead): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  updateLeadStatus(id: string, status: string): Promise<void>;
  
  // Lead purchase operations
  purchaseLead(purchase: InsertLeadPurchase): Promise<LeadPurchase>;
  getUserPurchases(userId: string): Promise<LeadPurchase[]>;
  
  // Credit operations
  addCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getUserTransactions(userId: string): Promise<CreditTransaction[]>;
  updateUserCredits(userId: string, newBalance: string): Promise<void>;
  
  // Insurance company operations
  getInsuranceCompanies(): Promise<InsuranceCompany[]>;
  createInsuranceCompany(company: InsertInsuranceCompany): Promise<InsuranceCompany>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalLeads: number;
    soldLeads: number;
    totalRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lead operations  
  async getAllLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async updateLead(id: string, data: InsertLead): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return result.rowCount > 0;
  }

  async getLeads(filters?: {
    search?: string;
    insuranceCompany?: string;
    ageRange?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Lead[]> {
    let query = db.select().from(leads);
    const conditions: any[] = [];

    if (filters) {
      if (filters.search) {
        conditions.push(
          or(
            like(leads.name, `%${filters.search}%`),
            like(leads.email, `%${filters.search}%`),
            like(leads.phone, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.insuranceCompany && filters.insuranceCompany !== "all") {
        conditions.push(eq(leads.insuranceCompanyId, filters.insuranceCompany));
      }
      
      if (filters.city && filters.city !== "all") {
        conditions.push(eq(leads.city, filters.city));
      }
      
      if (filters.minPrice) {
        conditions.push(gte(leads.price, filters.minPrice.toString()));
      }
      
      if (filters.maxPrice) {
        conditions.push(lte(leads.price, filters.maxPrice.toString()));
      }
      
      if (filters.status) {
        conditions.push(eq(leads.status, filters.status));
      } else {
        conditions.push(eq(leads.status, "available"));
      }
      
      if (filters.ageRange && filters.ageRange !== "all") {
        const [min, max] = filters.ageRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          conditions.push(and(gte(leads.age, min), lte(leads.age, max)));
        }
      }
    } else {
      conditions.push(eq(leads.status, "available"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(leads.createdAt));
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLeadStatus(id: string, status: string): Promise<void> {
    await db.update(leads).set({ status }).where(eq(leads.id, id));
  }

  // Lead purchase operations
  async purchaseLead(purchase: InsertLeadPurchase): Promise<LeadPurchase> {
    const [newPurchase] = await db.insert(leadPurchases).values(purchase).returning();
    
    // Update lead status to sold
    await this.updateLeadStatus(purchase.leadId, "sold");
    
    return newPurchase;
  }

  async getUserPurchases(userId: string): Promise<LeadPurchase[]> {
    return db
      .select()
      .from(leadPurchases)
      .where(eq(leadPurchases.userId, userId))
      .orderBy(desc(leadPurchases.purchasedAt));
  }

  // Credit operations
  async addCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<CreditTransaction[]> {
    return db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  async updateUserCredits(userId: string, newBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ credits: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Insurance company operations
  async getInsuranceCompanies(): Promise<InsuranceCompany[]> {
    return db.select().from(insuranceCompanies).orderBy(asc(insuranceCompanies.name));
  }

  async createInsuranceCompany(company: InsertInsuranceCompany): Promise<InsuranceCompany> {
    const [newCompany] = await db.insert(insuranceCompanies).values(company).returning();
    return newCompany;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalLeads: number;
    soldLeads: number;
    totalRevenue: string;
  }> {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const [leadCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads);
    
    const [soldLeadCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, "sold"));
    
    const [revenueSum] = await db
      .select({ sum: sql<string>`coalesce(sum(price), '0')` })
      .from(leadPurchases);
    
    return {
      totalUsers: userCount.count,
      activeUsers: userCount.count, // Simplified - could be enhanced with last login tracking
      totalLeads: leadCount.count,
      soldLeads: soldLeadCount.count,
      totalRevenue: revenueSum.sum,
    };
  }
}

export const storage = new DatabaseStorage();
