-- KeepLeads PostgreSQL Schema for Neon
-- Execute este script no SQL Editor do Neon: https://console.neon.tech

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_insurance_company ON leads(insurance_company_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_user ON lead_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_lead ON lead_purchases(lead_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);

-- Insert default admin user (senha: admin123)
INSERT INTO users (id, email, password, first_name, last_name, role, credits)
VALUES (
    gen_random_uuid()::text,
    'carol.cura@keepthefuture.com.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWVYBaZu', -- senha: admin123
    'Carol',
    'Cura',
    'admin',
    1000.00
)
ON CONFLICT (email) DO NOTHING;

-- Insert some insurance companies
INSERT INTO insurance_companies (name, color) VALUES
    ('Bradesco Saúde', '#CC092F'),
    ('SulAmérica', '#00A3E0'),
    ('Amil', '#0066B2'),
    ('Unimed', '#00965E'),
    ('Porto Seguro', '#005DAA'),
    ('NotreDame Intermédica', '#E30613')
ON CONFLICT DO NOTHING;
