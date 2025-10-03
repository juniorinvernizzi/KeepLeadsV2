<?php

namespace KeepLeads\Models;

require_once __DIR__ . '/../../config/database.php';

class CreditTransaction {
    private $conn;
    private $table = 'credit_transactions';

    public $id;
    public $user_id;
    public $type;
    public $amount;
    public $description;
    public $balance_before;
    public $balance_after;
    public $payment_method;
    public $payment_id;
    public $created_at;

    public function __construct() {
        $database = new \Database();
        $this->conn = $database->getConnection();
    }

    private function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public function create() {
        $this->id = $this->generateUUID();
        
        $query = "INSERT INTO " . $this->table . " 
                  (id, user_id, type, amount, description, balance_before, 
                   balance_after, payment_method, payment_id, created_at) 
                  VALUES (:id, :user_id, :type, :amount, :description, :balance_before,
                          :balance_after, :payment_method, :payment_id, NOW())";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":amount", $this->amount);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":balance_before", $this->balance_before);
        $stmt->bindParam(":balance_after", $this->balance_after);
        $stmt->bindParam(":payment_method", $this->payment_method);
        $stmt->bindParam(":payment_id", $this->payment_id);

        return $stmt->execute();
    }

    public function getByUserId($userId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    public static function createTransaction($userId, $type, $amount, $description, $balanceBefore, $balanceAfter, $paymentMethod = null, $paymentId = null) {
        $transaction = new self();
        $transaction->user_id = $userId;
        $transaction->type = $type;
        $transaction->amount = $amount;
        $transaction->description = $description;
        $transaction->balance_before = $balanceBefore;
        $transaction->balance_after = $balanceAfter;
        $transaction->payment_method = $paymentMethod;
        $transaction->payment_id = $paymentId;
        
        return $transaction->create();
    }
}