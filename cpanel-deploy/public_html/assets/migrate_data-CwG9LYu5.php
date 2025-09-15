<?php
/**
 * Script para migrar dados de PostgreSQL para MySQL
 * Execute este script depois de configurar o banco MySQL
 */

require_once 'config/database.php';
require_once 'vendor/autoload.php';

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== KeepLeads Data Migration ===\n";
echo "PostgreSQL → MySQL\n\n";

// Configuração PostgreSQL (dados atuais)
$pgHost = 'ep-holy-cake-a5uy7gry.us-east-2.aws.neon.tech'; // Atualize conforme necessário
$pgDb = 'neondb';
$pgUser = 'neondb_owner';  
$pgPass = 'sua_senha_postgres'; // Configure a senha

// Conectar ao PostgreSQL
try {
    $pgDsn = "pgsql:host=$pgHost;dbname=$pgDb";
    $pgConn = new PDO($pgDsn, $pgUser, $pgPass);
    $pgConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Conectado ao PostgreSQL\n";
} catch (PDOException $e) {
    die("✗ Erro PostgreSQL: " . $e->getMessage() . "\n");
}

// Conectar ao MySQL
try {
    $mysqlDb = new Database();
    $mysqlConn = $mysqlDb->getConnection();
    echo "✓ Conectado ao MySQL\n";
} catch (Exception $e) {
    die("✗ Erro MySQL: " . $e->getMessage() . "\n");
}

// Migrar usuários
echo "\n--- Migrando usuários ---\n";
try {
    $stmt = $pgConn->query("SELECT * FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $user) {
        $query = "INSERT IGNORE INTO users 
                  (id, email, password, first_name, last_name, role, credits, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqlConn->prepare($query);
        $stmt->execute([
            $user['id'],
            $user['email'],
            $user['password'],
            $user['first_name'],
            $user['last_name'],
            $user['role'],
            $user['credits'],
            $user['created_at'],
            $user['updated_at']
        ]);
    }
    echo "✓ " . count($users) . " usuários migrados\n";
} catch (Exception $e) {
    echo "✗ Erro migrando usuários: " . $e->getMessage() . "\n";
}

// Migrar empresas de seguro  
echo "\n--- Migrando empresas de seguro ---\n";
try {
    $stmt = $pgConn->query("SELECT * FROM insurance_companies");
    $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($companies as $company) {
        $query = "INSERT IGNORE INTO insurance_companies 
                  (id, name, logo, color, created_at) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $mysqlConn->prepare($query);
        $stmt->execute([
            $company['id'],
            $company['name'],
            $company['logo'] ?? null,
            $company['color'],
            $company['created_at']
        ]);
    }
    echo "✓ " . count($companies) . " empresas migradas\n";
} catch (Exception $e) {
    echo "✗ Erro migrando empresas: " . $e->getMessage() . "\n";
}

// Migrar leads
echo "\n--- Migrando leads ---\n";  
try {
    $stmt = $pgConn->query("SELECT * FROM leads");
    $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($leads as $lead) {
        $query = "INSERT IGNORE INTO leads 
                  (id, name, email, phone, age, city, state, insurance_company_id, 
                   plan_type, budget_min, budget_max, available_lives, source, 
                   campaign, quality, status, price, notes, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqlConn->prepare($query);
        $stmt->execute([
            $lead['id'],
            $lead['name'],
            $lead['email'],
            $lead['phone'],
            $lead['age'],
            $lead['city'],
            $lead['state'],
            $lead['insurance_company_id'],
            $lead['plan_type'] ?? 'individual',
            $lead['budget_min'],
            $lead['budget_max'],
            $lead['available_lives'] ?? 1,
            $lead['source'] ?? 'Manual',
            $lead['campaign'],
            $lead['quality'] ?? 'medium',
            $lead['status'],
            $lead['price'],
            $lead['notes'],
            $lead['created_at'],
            $lead['updated_at']
        ]);
    }
    echo "✓ " . count($leads) . " leads migrados\n";
} catch (Exception $e) {
    echo "✗ Erro migrando leads: " . $e->getMessage() . "\n";
}

// Migrar compras de leads
echo "\n--- Migrando compras ---\n";
try {
    $stmt = $pgConn->query("SELECT * FROM lead_purchases");
    $purchases = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($purchases as $purchase) {
        $query = "INSERT IGNORE INTO lead_purchases 
                  (id, lead_id, user_id, price, status, purchased_at) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqlConn->prepare($query);
        $stmt->execute([
            $purchase['id'],
            $purchase['lead_id'],
            $purchase['user_id'],
            $purchase['price'],
            $purchase['status'] ?? 'active',
            $purchase['purchased_at']
        ]);
    }
    echo "✓ " . count($purchases) . " compras migradas\n";
} catch (Exception $e) {
    echo "✗ Erro migrando compras: " . $e->getMessage() . "\n";
}

// Migrar transações de crédito
echo "\n--- Migrando transações ---\n";
try {
    $stmt = $pgConn->query("SELECT * FROM credit_transactions");
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($transactions as $transaction) {
        $query = "INSERT IGNORE INTO credit_transactions 
                  (id, user_id, type, amount, description, balance_before, balance_after,
                   payment_method, payment_id, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysqlConn->prepare($query);
        $stmt->execute([
            $transaction['id'],
            $transaction['user_id'],
            $transaction['type'],
            $transaction['amount'],
            $transaction['description'],
            $transaction['balance_before'],
            $transaction['balance_after'],
            $transaction['payment_method'],
            $transaction['payment_id'],
            $transaction['created_at']
        ]);
    }
    echo "✓ " . count($transactions) . " transações migradas\n";
} catch (Exception $e) {
    echo "✗ Erro migrando transações: " . $e->getMessage() . "\n";
}

echo "\n=== Migração concluída! ===\n";
echo "Configure o frontend React para usar a nova API PHP\n";
echo "Atualize a variável de ambiente da API no cliente se necessário\n";