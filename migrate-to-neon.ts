/**
 * Script de Migração para Neon Database
 * 
 * Execute este script para migrar dados de um banco PostgreSQL antigo para o Neon
 * 
 * Como usar:
 * 1. Configure OLD_DATABASE_URL com a URL do banco antigo
 * 2. Execute: npx tsx migrate-to-neon.ts
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { Client } from 'pg'; // Para banco antigo local/outro provider
import * as schema from './shared/schema';

// ===== CONFIGURAÇÃO =====
// URL do banco ANTIGO (Replit - de onde vão sair os dados)
const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL || 'postgresql://neondb_owner:npg_fz4DBqy2RlHC@ep-holy-cake-a5uy7gry.us-east-2.aws.neon.tech/neondb?sslmode=require';

// URL do banco NOVO (Neon - para onde vão os dados)
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL || 'postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  console.log('🚀 Iniciando migração para Neon...\n');

  // Conectar ao banco ANTIGO
  console.log('📡 Conectando ao banco antigo...');
  const oldClient = new Client({ connectionString: OLD_DATABASE_URL });
  await oldClient.connect();
  console.log('✅ Conectado ao banco antigo\n');

  // Conectar ao banco NOVO (Neon)
  console.log('📡 Conectando ao Neon...');
  const neonPool = new NeonPool({ connectionString: NEW_DATABASE_URL });
  const db = drizzle(neonPool, { schema });
  console.log('✅ Conectado ao Neon\n');

  try {
    // 1. Migrar Insurance Companies
    console.log('📦 Migrando empresas de seguro...');
    const companiesResult = await oldClient.query('SELECT * FROM insurance_companies ORDER BY created_at');
    const companies = companiesResult.rows;
    
    if (companies.length > 0) {
      for (const company of companies) {
        await db.insert(schema.insuranceCompanies).values({
          id: company.id,
          name: company.name,
          logo: company.logo,
          color: company.color,
          createdAt: company.created_at
        }).onConflictDoNothing();
      }
      console.log(`✅ ${companies.length} empresas migradas\n`);
    } else {
      console.log('⚠️  Nenhuma empresa encontrada\n');
    }

    // 2. Migrar Users
    console.log('👥 Migrando usuários...');
    const usersResult = await oldClient.query('SELECT * FROM users ORDER BY created_at');
    const users = usersResult.rows;
    
    if (users.length > 0) {
      for (const user of users) {
        await db.insert(schema.users).values({
          id: user.id,
          email: user.email,
          password: user.password,
          firstName: user.first_name,
          lastName: user.last_name,
          profileImageUrl: user.profile_image_url,
          role: user.role,
          status: user.status || 'active',
          credits: user.credits || 0,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }).onConflictDoNothing();
      }
      console.log(`✅ ${users.length} usuários migrados\n`);
    } else {
      console.log('⚠️  Nenhum usuário encontrado\n');
    }

    // 3. Migrar Leads
    console.log('📋 Migrando leads...');
    const leadsResult = await oldClient.query('SELECT * FROM leads ORDER BY created_at');
    const leads = leadsResult.rows;
    
    if (leads.length > 0) {
      for (const lead of leads) {
        await db.insert(schema.leads).values({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          age: lead.age || 30,
          city: lead.city,
          state: lead.state,
          income: lead.income,
          insuranceCompanyId: lead.insurance_company_id,
          planType: lead.plan_type || 'individual',
          category: lead.category || 'health_insurance',
          budgetMin: lead.budget_min,
          budgetMax: lead.budget_max,
          availableLives: lead.available_lives || 1,
          source: lead.source,
          campaign: lead.campaign,
          quality: lead.quality || 'silver',
          status: lead.status,
          price: lead.price,
          notes: lead.notes,
          createdAt: lead.created_at,
          updatedAt: lead.updated_at
        }).onConflictDoNothing();
      }
      console.log(`✅ ${leads.length} leads migrados\n`);
    } else {
      console.log('⚠️  Nenhum lead encontrado\n');
    }

    // 4. Migrar Lead Purchases
    console.log('🛒 Migrando compras de leads...');
    const purchasesResult = await oldClient.query('SELECT * FROM lead_purchases ORDER BY purchased_at');
    const purchases = purchasesResult.rows;
    
    if (purchases.length > 0) {
      for (const purchase of purchases) {
        await db.insert(schema.leadPurchases).values({
          id: purchase.id,
          leadId: purchase.lead_id,
          userId: purchase.user_id,
          price: purchase.price,
          status: purchase.status || 'active',
          purchasedAt: purchase.purchased_at
        }).onConflictDoNothing();
      }
      console.log(`✅ ${purchases.length} compras migradas\n`);
    } else {
      console.log('⚠️  Nenhuma compra encontrada\n');
    }

    // 5. Migrar Credit Transactions
    console.log('💰 Migrando transações de crédito...');
    const transactionsResult = await oldClient.query('SELECT * FROM credit_transactions ORDER BY created_at');
    const transactions = transactionsResult.rows;
    
    if (transactions.length > 0) {
      for (const transaction of transactions) {
        await db.insert(schema.creditTransactions).values({
          id: transaction.id,
          userId: transaction.user_id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          balanceBefore: transaction.balance_before,
          balanceAfter: transaction.balance_after,
          paymentMethod: transaction.payment_method,
          paymentId: transaction.payment_id,
          createdAt: transaction.created_at
        }).onConflictDoNothing();
      }
      console.log(`✅ ${transactions.length} transações migradas\n`);
    } else {
      console.log('⚠️  Nenhuma transação encontrada\n');
    }

    console.log('🎉 Migração concluída com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${companies.length} empresas`);
    console.log(`   - ${users.length} usuários`);
    console.log(`   - ${leads.length} leads`);
    console.log(`   - ${purchases.length} compras`);
    console.log(`   - ${transactions.length} transações\n`);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await oldClient.end();
    await neonPool.end();
  }
}

// Executar
migrate().catch(console.error);
