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
import { db } from "./db.js";
import { eq, desc, asc, and, or, like, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updateData: { email?: string; firstName?: string; lastName?: string; role?: string; credits?: string; status?: string }): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lead operations
  getLeads(filters?: {
    search?: string;
    city?: string;
    planType?: string;
    livesCount?: string;
    minPrice?: number;
    maxPrice?: number;
    quality?: string;
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
  getReportsData(fromDate: Date, toDate: Date): Promise<{
    sales: {
      totalSold: number;
      totalRevenue: string;
      averageTicket: string;
      salesByDay: { date: string; count: number; revenue: string }[];
    };
    insertions: {
      totalCreated: number;
      byQuality: { quality: string; count: number }[];
      byPlan: { planType: string; count: number }[];
      insertionsByDay: { date: string; count: number }[];
    };
    system: {
      totalUsers: number;
      activeClients: number;
      availableLeads: number;
      reservedLeads: number;
      expiredLeads: number;
      totalCreditsDeposited: string;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lead operations

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
    return (result.rowCount ?? 0) > 0;
  }

  async getLeads(filters?: {
    search?: string;
    city?: string;
    planType?: string;
    livesCount?: string;
    minPrice?: number;
    maxPrice?: number;
    quality?: string;
    status?: string;
  }): Promise<Lead[]> {
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
      
      if (filters.city && filters.city !== "all") {
        conditions.push(eq(leads.city, filters.city));
      }
      
      if (filters.planType && filters.planType !== "all") {
        conditions.push(eq(leads.planType, filters.planType));
      }
      
      if (filters.livesCount && filters.livesCount !== "all") {
        // Handle lives count ranges
        if (filters.livesCount.includes('-')) {
          const [min, max] = filters.livesCount.split('-').map(Number);
          if (!isNaN(min) && !isNaN(max)) {
            conditions.push(and(gte(leads.availableLives, min), lte(leads.availableLives, max)));
          }
        } else if (filters.livesCount.endsWith('+')) {
          const min = parseInt(filters.livesCount);
          if (!isNaN(min)) {
            conditions.push(gte(leads.availableLives, min));
          }
        } else {
          const exact = parseInt(filters.livesCount);
          if (!isNaN(exact)) {
            conditions.push(eq(leads.availableLives, exact));
          }
        }
      }
      
      if (filters.minPrice) {
        conditions.push(gte(leads.price, filters.minPrice.toString()));
      }
      
      if (filters.maxPrice) {
        conditions.push(lte(leads.price, filters.maxPrice.toString()));
      }
      
      if (filters.quality && filters.quality !== "all") {
        conditions.push(eq(leads.quality, filters.quality));
      }
      
      if (filters.status && filters.status !== "all") {
        conditions.push(eq(leads.status, filters.status));
      } else {
        // If no status filter provided, default to showing only available leads
        // This ensures marketplace and public pages only show available leads
        conditions.push(eq(leads.status, "available"));
      }
    } else {
      // No filters object at all - default to only showing available leads
      conditions.push(eq(leads.status, "available"));
    }

    if (conditions.length > 0) {
      return await db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
    }

    return await db.select().from(leads).orderBy(desc(leads.createdAt));
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

  async updateUser(userId: string, updateData: { email?: string; firstName?: string; lastName?: string; role?: string; credits?: string; status?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        ...updateData, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return (result.rowCount ?? 0) > 0;
  }

  async updateUserProfile(userId: string, profileData: { firstName?: string; lastName?: string; email?: string; profileImageUrl?: string }): Promise<void> {
    await db
      .update(users)
      .set({ ...profileData, updatedAt: new Date() })
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

  async getAllLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
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
      activeUsers: userCount.count,
      totalLeads: leadCount.count,
      soldLeads: soldLeadCount.count,
      totalRevenue: revenueSum.sum,
    };
  }

  async getReportsData(fromDate: Date, toDate: Date): Promise<{
    sales: {
      totalSold: number;
      totalRevenue: string;
      averageTicket: string;
      salesByDay: { date: string; count: number; revenue: string }[];
    };
    insertions: {
      totalCreated: number;
      byQuality: { quality: string; count: number }[];
      byPlan: { planType: string; count: number }[];
      insertionsByDay: { date: string; count: number }[];
    };
    system: {
      totalUsers: number;
      activeClients: number;
      availableLeads: number;
      reservedLeads: number;
      expiredLeads: number;
      totalCreditsDeposited: string;
    };
  }> {
    // Sales metrics
    const salesData = await db
      .select({
        count: sql<number>`count(*)`,
        revenue: sql<string>`coalesce(sum(price), '0')`,
      })
      .from(leadPurchases)
      .where(and(
        gte(leadPurchases.purchasedAt, fromDate),
        lte(leadPurchases.purchasedAt, toDate)
      ));

    const totalSold = salesData[0]?.count || 0;
    const totalRevenue = salesData[0]?.revenue || "0";
    const averageTicket = totalSold > 0 ? (parseFloat(totalRevenue) / totalSold).toFixed(2) : "0";

    // Sales by day
    const salesByDayData = await db
      .select({
        date: sql<string>`to_char(purchased_at, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
        revenue: sql<string>`coalesce(sum(price), '0')`,
      })
      .from(leadPurchases)
      .where(and(
        gte(leadPurchases.purchasedAt, fromDate),
        lte(leadPurchases.purchasedAt, toDate)
      ))
      .groupBy(sql`to_char(purchased_at, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(purchased_at, 'YYYY-MM-DD')`);

    // Insertions metrics
    const insertionsData = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, fromDate),
        lte(leads.createdAt, toDate)
      ));

    const totalCreated = insertionsData[0]?.count || 0;

    // By quality
    const byQualityData = await db
      .select({
        quality: leads.quality,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, fromDate),
        lte(leads.createdAt, toDate)
      ))
      .groupBy(leads.quality);

    // By plan type
    const byPlanData = await db
      .select({
        planType: leads.planType,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, fromDate),
        lte(leads.createdAt, toDate)
      ))
      .groupBy(leads.planType);

    // Insertions by day
    const insertionsByDayData = await db
      .select({
        date: sql<string>`to_char(created_at, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, fromDate),
        lte(leads.createdAt, toDate)
      ))
      .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM-DD')`);

    // System metrics
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [clientCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "client"), eq(users.status, "active")));

    const [availableCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, "available"));

    const [reservedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, "reserved"));

    const [expiredCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, "expired"));

    const [creditsDeposited] = await db
      .select({
        total: sql<string>`coalesce(sum(amount), '0')`,
      })
      .from(creditTransactions)
      .where(and(
        eq(creditTransactions.type, "deposit"),
        gte(creditTransactions.createdAt, fromDate),
        lte(creditTransactions.createdAt, toDate)
      ));

    return {
      sales: {
        totalSold,
        totalRevenue,
        averageTicket,
        salesByDay: salesByDayData.map((d: { date: string; count: number; revenue: string }) => ({
          date: d.date as string,
          count: d.count as number,
          revenue: d.revenue as string,
        })),
      },
      insertions: {
        totalCreated,
        byQuality: byQualityData.map((d: { quality: string | null; count: number }) => ({
          quality: (d.quality || "silver") as string,
          count: d.count as number,
        })),
        byPlan: byPlanData.map((d: { planType: string | null; count: number }) => ({
          planType: (d.planType || "pf") as string,
          count: d.count as number,
        })),
        insertionsByDay: insertionsByDayData.map((d: { date: string; count: number }) => ({
          date: d.date as string,
          count: d.count as number,
        })),
      },
      system: {
        totalUsers: userCount.count,
        activeClients: clientCount.count,
        availableLeads: availableCount.count,
        reservedLeads: reservedCount.count,
        expiredLeads: expiredCount.count,
        totalCreditsDeposited: creditsDeposited.total,
      },
    };
  }
}

export const storage = new DatabaseStorage();
