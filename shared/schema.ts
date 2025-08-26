import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("client"), // 'admin' or 'client'
  credits: decimal("credits", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insurance companies
export const insuranceCompanies = pgTable("insurance_companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  logo: varchar("logo"),
  color: varchar("color").notNull().default("#7C3AED"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  age: integer("age").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  insuranceCompanyId: varchar("insurance_company_id").references(() => insuranceCompanies.id),
  planType: varchar("plan_type").notNull().default("individual"),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  availableLives: integer("available_lives").notNull().default(1), // Quantidade de vidas disponíveis
  source: varchar("source").notNull(), // 'Google Ads', 'Facebook', etc.
  campaign: varchar("campaign"),
  quality: varchar("quality").notNull().default("medium"), // 'high', 'medium', 'low'
  status: varchar("status").notNull().default("available"), // 'available', 'reserved', 'sold', 'expired'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead purchases
export const leadPurchases = pgTable("lead_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("active"), // 'active', 'contacted', 'converted', 'expired'
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Credit transactions
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'deposit', 'purchase', 'refund'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description").notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method"), // 'credit_card', 'pix'
  paymentId: varchar("payment_id"), // External payment reference
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leadPurchases: many(leadPurchases),
  creditTransactions: many(creditTransactions),
}));

export const insuranceCompaniesRelations = relations(insuranceCompanies, ({ many }) => ({
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  insuranceCompany: one(insuranceCompanies, {
    fields: [leads.insuranceCompanyId],
    references: [insuranceCompanies.id],
  }),
  purchases: many(leadPurchases),
}));

export const leadPurchasesRelations = relations(leadPurchases, ({ one }) => ({
  lead: one(leads, {
    fields: [leadPurchases.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [leadPurchases.userId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadPurchaseSchema = createInsertSchema(leadPurchases).omit({
  id: true,
  purchasedAt: true,
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertInsuranceCompanySchema = createInsertSchema(insuranceCompanies).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadPurchase = typeof leadPurchases.$inferSelect;
export type InsertLeadPurchase = z.infer<typeof insertLeadPurchaseSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type InsuranceCompany = typeof insuranceCompanies.$inferSelect;
export type InsertInsuranceCompany = z.infer<typeof insertInsuranceCompanySchema>;
