import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6iuD8BTIYECy@ep-calm-bread-ae4jen49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function createSchema() {
  try {
    console.log('🏗️  Criando schema no branch production...\n');
    
    await pool.query(`
      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

      -- Users table
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

      -- Insurance companies table
      CREATE TABLE IF NOT EXISTS insurance_companies (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR NOT NULL,
        logo VARCHAR,
        color VARCHAR NOT NULL DEFAULT '#7C3AED',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Leads table
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

      -- Lead purchases table
      CREATE TABLE IF NOT EXISTS lead_purchases (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        lead_id VARCHAR REFERENCES leads(id) NOT NULL,
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'active',
        purchased_at TIMESTAMP DEFAULT NOW()
      );

      -- Credit transactions table
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

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_insurance_company ON leads(insurance_company_id);
      CREATE INDEX IF NOT EXISTS idx_lead_purchases_user ON lead_purchases(user_id);
      CREATE INDEX IF NOT EXISTS idx_lead_purchases_lead ON lead_purchases(lead_id);
      CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
    `);
    
    console.log('✅ Schema criado com sucesso!\n');
    
    // Verificar tabelas criadas
    const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    
    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => console.log(`  ✓ ${row.tablename}`));
    
    console.log('\n🎉 Pronto! Agora você pode executar o script de migração de dados.\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erro ao criar schema:', error);
    await pool.end();
    process.exit(1);
  }
}

createSchema();
