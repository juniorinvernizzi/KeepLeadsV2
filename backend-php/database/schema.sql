-- KeepLeads MySQL Database Schema
-- Migrated from PostgreSQL to MySQL

CREATE DATABASE IF NOT EXISTS keepleads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE keepleads;

-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    credits DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Sessions table (for PHP session storage if needed)
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    data TEXT,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insurance companies table
CREATE TABLE insurance_companies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    color VARCHAR(7) NOT NULL DEFAULT '#7C3AED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(10) NOT NULL,
    insurance_company_id CHAR(36),
    plan_type VARCHAR(50) NOT NULL DEFAULT 'individual',
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    available_lives INT NOT NULL DEFAULT 1,
    source VARCHAR(100) NOT NULL DEFAULT 'Manual',
    campaign VARCHAR(255),
    quality VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id) ON DELETE SET NULL,
    INDEX idx_leads_status (status),
    INDEX idx_leads_city (city),
    INDEX idx_leads_state (state),
    INDEX idx_leads_price (price),
    INDEX idx_leads_created_at (created_at),
    INDEX idx_leads_insurance_company (insurance_company_id)
);

-- Lead purchases table
CREATE TABLE lead_purchases (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lead_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_purchases_user_id (user_id),
    INDEX idx_purchases_lead_id (lead_id),
    INDEX idx_purchases_purchased_at (purchased_at)
);

-- Credit transactions table  
CREATE TABLE credit_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(500) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transactions_user_id (user_id),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_created_at (created_at)
);

-- Insert default insurance companies
INSERT INTO insurance_companies (id, name, color) VALUES
('amil-123', 'Amil', '#E74C3C'),
('bradesco-456', 'Bradesco Saúde', '#003A8C'),  
('sulamerica-789', 'SulAmérica', '#0B7EC8'),
('unimed-012', 'Unimed', '#228B22');

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, credits) VALUES
('admin@admin.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sistema', 'admin', 1000.00);

-- Insert default client user (password: cliente123) 
INSERT INTO users (email, password, first_name, last_name, role, credits) VALUES
('cliente@cliente.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cliente', 'Teste', 'client', 100.00);