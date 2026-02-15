import { Pool } from '@neondatabase/serverless';

// Development branch connection (já tem os dados)
const devPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Production branch connection (será populado)
const prodPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6iuD8BTIYECy@ep-calm-bread-ae4jen49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function copyData() {
  try {
    console.log('🏗️  Criando tabelas no production...');
    
    // Criar schema no production
    await prodPool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR NOT NULL DEFAULT 'client',
        status VARCHAR NOT NULL DEFAULT 'active',
        credits DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS insurance_companies (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        logo VARCHAR,
        color VARCHAR NOT NULL DEFAULT '#7C3AED',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone VARCHAR NOT NULL,
        age INTEGER DEFAULT 30,
        city VARCHAR,
        state VARCHAR NOT NULL,
        income VARCHAR DEFAULT '3000.00',
        insurance_company_id VARCHAR REFERENCES insurance_companies(id),
        plan_type VARCHAR DEFAULT 'individual',
        category VARCHAR DEFAULT 'health_insurance',
        budget_min DECIMAL(10,2),
        budget_max DECIMAL(10,2),
        available_lives INTEGER DEFAULT 1,
        source VARCHAR NOT NULL,
        campaign VARCHAR,
        quality VARCHAR DEFAULT 'silver',
        status VARCHAR DEFAULT 'available',
        price DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lead_purchases (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        lead_id VARCHAR REFERENCES leads(id) NOT NULL,
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'active',
        purchased_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS credit_transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        type VARCHAR NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR NOT NULL,
        balance_before DECIMAL(10,2) NOT NULL,
        balance_after DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR,
        payment_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_insurance_company ON leads(insurance_company_id);
      CREATE INDEX IF NOT EXISTS idx_lead_purchases_user ON lead_purchases(user_id);
      CREATE INDEX IF NOT EXISTS idx_lead_purchases_lead ON lead_purchases(lead_id);
      CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
    `);
    
    console.log('✅ Tabelas criadas no production!');
    
    console.log('\n📊 Copiando insurance_companies...');
    const companies = await devPool.query('SELECT * FROM insurance_companies');
    for (const row of companies.rows) {
      await prodPool.query(
        `INSERT INTO insurance_companies (id, name, logo, color, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO UPDATE SET name = $2, logo = $3, color = $4`,
        [row.id, row.name, row.logo, row.color, row.created_at]
      );
    }
    console.log(`✅ ${companies.rows.length} empresas copiadas`);
    
    console.log('\n👥 Copiando users...');
    const users = await devPool.query('SELECT * FROM users');
    for (const row of users.rows) {
      await prodPool.query(
        `INSERT INTO users (id, email, password, first_name, last_name, profile_image_url, role, status, credits, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         ON CONFLICT (id) DO UPDATE SET email = $2, password = $3, first_name = $4, last_name = $5, credits = $9`,
        [row.id, row.email, row.password, row.first_name, row.last_name, row.profile_image_url, row.role, row.status, row.credits, row.created_at, row.updated_at]
      );
    }
    console.log(`✅ ${users.rows.length} usuários copiados`);
    
    console.log('\n🎯 Copiando leads...');
    const leads = await devPool.query('SELECT * FROM leads');
    for (const row of leads.rows) {
      await prodPool.query(
        `INSERT INTO leads (id, name, email, phone, age, city, state, income, insurance_company_id, plan_type, category, budget_min, budget_max, available_lives, source, campaign, quality, status, price, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
         ON CONFLICT (id) DO NOTHING`,
        [row.id, row.name, row.email, row.phone, row.age, row.city, row.state, row.income, row.insurance_company_id, row.plan_type, row.category, row.budget_min, row.budget_max, row.available_lives, row.source, row.campaign, row.quality, row.status, row.price, row.notes, row.created_at, row.updated_at]
      );
    }
    console.log(`✅ ${leads.rows.length} leads copiados`);
    
    console.log('\n💳 Copiando lead_purchases...');
    const purchases = await devPool.query('SELECT * FROM lead_purchases');
    for (const row of purchases.rows) {
      await prodPool.query(
        `INSERT INTO lead_purchases (id, lead_id, user_id, price, status, purchased_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`,
        [row.id, row.lead_id, row.user_id, row.price, row.status, row.purchased_at]
      );
    }
    console.log(`✅ ${purchases.rows.length} compras copiadas`);
    
    console.log('\n💰 Copiando credit_transactions...');
    const transactions = await devPool.query('SELECT * FROM credit_transactions');
    for (const row of transactions.rows) {
      await prodPool.query(
        `INSERT INTO credit_transactions (id, user_id, type, amount, description, balance_before, balance_after, payment_method, payment_id, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         ON CONFLICT (id) DO NOTHING`,
        [row.id, row.user_id, row.type, row.amount, row.description, row.balance_before, row.balance_after, row.payment_method, row.payment_id, row.created_at]
      );
    }
    console.log(`✅ ${transactions.rows.length} transações copiadas`);
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('Agora configure a DATABASE_URL na Vercel com a connection string do production.');
    
    await devPool.end();
    await prodPool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    await devPool.end();
    await prodPool.end();
    process.exit(1);
  }
}

copyData();
