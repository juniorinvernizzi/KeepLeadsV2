<?php

namespace KeepLeads\Models;

require_once __DIR__ . '/../../config/database.php';

class Lead {
    private $conn;
    private $table = 'leads';

    public $id;
    public $name;
    public $email;
    public $phone;
    public $age;
    public $city;
    public $state;
    public $insurance_company_id;
    public $plan_type;
    public $budget_min;
    public $budget_max;
    public $available_lives;
    public $source;
    public $campaign;
    public $quality;
    public $status;
    public $price;
    public $notes;
    public $created_at;
    public $updated_at;

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

    public function getLeads($filters = []) {
        $query = "SELECT l.*, ic.name as insurance_company_name, ic.color as insurance_company_color 
                  FROM " . $this->table . " l 
                  LEFT JOIN insurance_companies ic ON l.insurance_company_id = ic.id 
                  WHERE l.status = 'available'";

        $params = [];

        // Apply filters
        if (!empty($filters['search'])) {
            $query .= " AND (l.name LIKE :search OR l.email LIKE :search OR l.city LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['insuranceCompany']) && $filters['insuranceCompany'] !== 'all') {
            $query .= " AND l.insurance_company_id = :insurance_company";
            $params[':insurance_company'] = $filters['insuranceCompany'];
        }

        if (!empty($filters['city']) && $filters['city'] !== 'all') {
            $query .= " AND l.city = :city";
            $params[':city'] = $filters['city'];
        }

        if (!empty($filters['ageRange']) && $filters['ageRange'] !== 'all') {
            $ageRanges = explode('-', $filters['ageRange']);
            if (count($ageRanges) == 2) {
                $query .= " AND l.age BETWEEN :age_min AND :age_max";
                $params[':age_min'] = (int)$ageRanges[0];
                $params[':age_max'] = (int)$ageRanges[1];
            }
        }

        if (!empty($filters['minPrice'])) {
            $query .= " AND l.price >= :min_price";
            $params[':min_price'] = (float)$filters['minPrice'];
        }

        if (!empty($filters['maxPrice'])) {
            $query .= " AND l.price <= :max_price";
            $params[':max_price'] = (float)$filters['maxPrice'];
        }

        $query .= " ORDER BY l.created_at DESC";

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function findById($id) {
        $query = "SELECT l.*, ic.name as insurance_company_name, ic.color as insurance_company_color 
                  FROM " . $this->table . " l 
                  LEFT JOIN insurance_companies ic ON l.insurance_company_id = ic.id 
                  WHERE l.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $row = $stmt->fetch();

        if ($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->age = $row['age'];
            $this->city = $row['city'];
            $this->state = $row['state'];
            $this->insurance_company_id = $row['insurance_company_id'];
            $this->plan_type = $row['plan_type'];
            $this->budget_min = $row['budget_min'];
            $this->budget_max = $row['budget_max'];
            $this->available_lives = $row['available_lives'];
            $this->source = $row['source'];
            $this->campaign = $row['campaign'];
            $this->quality = $row['quality'];
            $this->status = $row['status'];
            $this->price = $row['price'];
            $this->notes = $row['notes'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return $row;
        }

        return false;
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table . " SET status = :status, updated_at = NOW() WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function create() {
        // Generate UUID for the new lead
        if (!$this->id) {
            $this->id = $this->generateUUID();
        }

        $query = "INSERT INTO " . $this->table . " 
                  SET id=:id, name=:name, email=:email, phone=:phone, age=:age, city=:city, 
                      state=:state, insurance_company_id=:insurance_company_id, 
                      plan_type=:plan_type, budget_min=:budget_min, budget_max=:budget_max,
                      available_lives=:available_lives, source=:source, campaign=:campaign,
                      quality=:quality, status=:status, price=:price, notes=:notes,
                      created_at=NOW(), updated_at=NOW()";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":age", $this->age);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":state", $this->state);
        $stmt->bindParam(":insurance_company_id", $this->insurance_company_id);
        $stmt->bindParam(":plan_type", $this->plan_type);
        $stmt->bindParam(":budget_min", $this->budget_min);
        $stmt->bindParam(":budget_max", $this->budget_max);
        $stmt->bindParam(":available_lives", $this->available_lives);
        $stmt->bindParam(":source", $this->source);
        $stmt->bindParam(":campaign", $this->campaign);
        $stmt->bindParam(":quality", $this->quality);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":notes", $this->notes);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}