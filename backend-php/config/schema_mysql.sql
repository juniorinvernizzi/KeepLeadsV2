-- KeepLeads Database Schema for MySQL (cPanel compatible)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(100),
    role ENUM('client', 'admin') DEFAULT 'client',
    credits INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insurance companies table
CREATE TABLE IF NOT EXISTS insurance_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    age INT,
    gender ENUM('M', 'F', 'Other'),
    state VARCHAR(2),
    city VARCHAR(100),
    insurance_company_id INT,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id),
    INDEX idx_price (price),
    INDEX idx_state (state),
    INDEX idx_available (is_available),
    INDEX idx_company (insurance_company_id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lead_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    INDEX idx_user (user_id),
    INDEX idx_lead (lead_id),
    INDEX idx_status (status)
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL,
    type ENUM('purchase', 'refund', 'bonus') NOT NULL,
    description TEXT,
    payment_id VARCHAR(100),
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
);

-- Insert default insurance companies
INSERT IGNORE INTO insurance_companies (id, name, logo_url) VALUES
(1, 'Bradesco Seguros', '/images/bradesco-logo.jpg'),
(2, 'SulAmérica', '/images/logo-sulamerica.png'),
(3, 'Unimed', '/images/unimed-logo.png'),
(4, 'Porto Seguro', '/images/porto-logo.png'),
(5, 'Allianz', '/images/allianz-logo.png');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, credits) VALUES
('admin@admin.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sistema', 'admin', 1000);

-- Insert sample leads
INSERT IGNORE INTO leads (name, email, phone, age, gender, state, city, insurance_company_id, price) VALUES
('João Silva', 'joao@email.com', '11987654321', 35, 'M', 'SP', 'São Paulo', 1, 50.00),
('Maria Santos', 'maria@email.com', '11976543210', 42, 'F', 'RJ', 'Rio de Janeiro', 2, 75.00),
('Pedro Costa', 'pedro@email.com', '11965432109', 28, 'M', 'MG', 'Belo Horizonte', 3, 60.00),
('Ana Oliveira', 'ana@email.com', '11954321098', 31, 'F', 'RS', 'Porto Alegre', 4, 65.00),
('Carlos Ferreira', 'carlos@email.com', '11943210987', 45, 'M', 'PR', 'Curitiba', 5, 55.00);