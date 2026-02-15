const { Pool } = require('@neondatabase/serverless');

// Development (origem dos dados)
const devPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Production (destino)
const prodPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6iuD8BTIYECy@ep-calm-bread-ae4jen49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function importData() {
  try {
    console.log('🚀 Iniciando importação de dados...\n');
    
    // 1. Insurance Companies
    console.log('📊 Importando insurance_companies...');
    const companies = await devPool.query('SELECT * FROM insurance_companies ORDER BY created_at');
    for (const row of companies.rows) {
      await prodPool.query(
        'INSERT INTO insurance_companies (id, name, logo, color, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = $2, logo = $3, color = $4',
        [row.id, row.name, row.logo, row.color, row.created_at]
      );
    }
    console.log(`✅ ${companies.rows.length} empresas importadas\n`);
    
    // 2. Users
    console.log('👥 Importando users...');
    const users = await devPool.query('SELECT * FROM users ORDER BY created_at');
    for (const row of users.rows) {
      await prodPool.query(
        'INSERT INTO users (id, email, password, first_name, last_name, profile_image_url, role, status, credits, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO UPDATE SET email = $2, password = $3, credits = $9',
        [row.id, row.email, row.password, row.first_name, row.last_name, row.profile_image_url, row.role, row.status, row.credits, row.created_at, row.updated_at]
      );
    }
    console.log(`✅ ${users.rows.length} usuários importados\n`);
    
    // 3. Leads
    console.log('🎯 Importando leads...');
    const leads = await devPool.query('SELECT * FROM leads ORDER BY created_at');
    for (const row of leads.rows) {
      await prodPool.query(
        'INSERT INTO leads (id, name, email, phone, age, city, state, income, insurance_company_id, plan_type, category, budget_min, budget_max, available_lives, source, campaign, quality, status, price, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) ON CONFLICT (id) DO NOTHING',
        [row.id, row.name, row.email, row.phone, row.age, row.city, row.state, row.income, row.insurance_company_id, row.plan_type, row.category, row.budget_min, row.budget_max, row.available_lives, row.source, row.campaign, row.quality, row.status, row.price, row.notes, row.created_at, row.updated_at]
      );
    }
    console.log(`✅ ${leads.rows.length} leads importados\n`);
    
    // 4. Lead Purchases
    console.log('💳 Importando lead_purchases...');
    const purchases = await devPool.query('SELECT * FROM lead_purchases ORDER BY purchased_at');
    for (const row of purchases.rows) {
      await prodPool.query(
        'INSERT INTO lead_purchases (id, lead_id, user_id, price, status, purchased_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [row.id, row.lead_id, row.user_id, row.price, row.status, row.purchased_at]
      );
    }
    console.log(`✅ ${purchases.rows.length} compras importadas\n`);
    
    // 5. Credit Transactions
    console.log('💰 Importando credit_transactions...');
    const transactions = await devPool.query('SELECT * FROM credit_transactions ORDER BY created_at');
    for (const row of transactions.rows) {
      await prodPool.query(
        'INSERT INTO credit_transactions (id, user_id, type, amount, description, balance_before, balance_after, payment_method, payment_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
        [row.id, row.user_id, row.type, row.amount, row.description, row.balance_before, row.balance_after, row.payment_method, row.payment_id, row.created_at]
      );
    }
    console.log(`✅ ${transactions.rows.length} transações importadas\n`);
    
    console.log('🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!\n');
    
    await devPool.end();
    await prodPool.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await devPool.end();
    await prodPool.end();
    process.exit(1);
  }
}

importData();
