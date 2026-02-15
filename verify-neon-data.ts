/**
 * Script para verificar dados migrados no Neon
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './shared/schema';

const DATABASE_URL = 'postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function verify() {
  console.log('🔍 Verificando dados no Neon...\n');

  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    // Verificar empresas
    console.log('📦 Empresas de Seguro:');
    const companies = await db.select().from(schema.insuranceCompanies);
    companies.forEach(c => console.log(`   - ${c.name} (${c.color})`));
    console.log(`   Total: ${companies.length}\n`);

    // Verificar usuários
    console.log('👥 Usuários:');
    const users = await db.select({
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      role: schema.users.role,
      status: schema.users.status,
      credits: schema.users.credits
    }).from(schema.users);
    users.forEach(u => console.log(`   - ${u.email} | ${u.firstName} ${u.lastName} | ${u.role} | Status: ${u.status} | Créditos: R$ ${u.credits}`));
    console.log(`   Total: ${users.length}\n`);

    // Verificar leads por status
    console.log('📋 Leads por Status:');
    const leadsByStatus = await db.select({
      status: schema.leads.status,
      count: schema.leads.id
    }).from(schema.leads);
    
    const statusCount: Record<string, number> = {};
    for (const lead of await db.select().from(schema.leads)) {
      statusCount[lead.status] = (statusCount[lead.status] || 0) + 1;
    }
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });
    console.log(`   Total: ${leadsByStatus.length} leads\n`);

    // Verificar leads por qualidade
    console.log('🏅 Leads por Qualidade:');
    const qualityCount: Record<string, number> = {};
    for (const lead of await db.select().from(schema.leads)) {
      qualityCount[lead.quality] = (qualityCount[lead.quality] || 0) + 1;
    }
    Object.entries(qualityCount).forEach(([quality, count]) => {
      console.log(`   - ${quality}: ${count}`);
    });
    console.log();

    // Verificar transações
    console.log('💰 Transações de Crédito:');
    const transactions = await db.select({
      type: schema.creditTransactions.type,
      amount: schema.creditTransactions.amount,
      description: schema.creditTransactions.description
    }).from(schema.creditTransactions);
    transactions.forEach(t => console.log(`   - ${t.type}: R$ ${t.amount} - ${t.description}`));
    console.log(`   Total: ${transactions.length}\n`);

    // Verificar compras
    console.log('🛒 Compras de Leads:');
    const purchases = await db.select().from(schema.leadPurchases);
    console.log(`   Total: ${purchases.length}\n`);

    console.log('✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

verify().catch(console.error);
