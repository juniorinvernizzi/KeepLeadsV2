<?php

namespace KeepLeads\Models;

require_once __DIR__ . '/../../config/database.php';

class Purchase {
    private $conn;
    private $table = 'lead_purchases';

    public $id;
    public $lead_id;
    public $user_id;
    public $price;
    public $status;
    public $purchased_at;

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
                  SET id=:id, lead_id=:lead_id, user_id=:user_id, 
                      price=:price, status=:status, purchased_at=NOW()";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":lead_id", $this->lead_id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":status", $this->status);

        return $stmt->execute();
    }

    public function findByUserAndLead($userId, $leadId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id AND lead_id = :lead_id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":lead_id", $leadId);
        $stmt->execute();
        
        $row = $stmt->fetch();
        
        if ($row) {
            $this->id = $row['id'];
            $this->lead_id = $row['lead_id'];
            $this->user_id = $row['user_id'];
            $this->price = $row['price'];
            $this->status = $row['status'];
            $this->purchased_at = $row['purchased_at'];
            return true;
        }
        
        return false;
    }

    public function getByUserId($userId) {
        $query = "SELECT lp.*, l.*, ic.name as insurance_company_name, ic.color as insurance_company_color
                  FROM " . $this->table . " lp
                  JOIN leads l ON lp.lead_id = l.id
                  LEFT JOIN insurance_companies ic ON l.insurance_company_id = ic.id
                  WHERE lp.user_id = :user_id
                  ORDER BY lp.purchased_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}