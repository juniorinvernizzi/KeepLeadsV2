<?php

namespace KeepLeads\Models;

require_once __DIR__ . '/../../config/database.php';

class User {
    private $conn;
    private $table = 'users';

    public $id;
    public $email;
    public $password;
    public $first_name;
    public $last_name;
    public $profile_image_url;
    public $role;
    public $credits;
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

    public function create() {
        $this->id = $this->generateUUID();
        
        $query = "INSERT INTO " . $this->table . " 
                  SET id=:id, email=:email, password=:password, first_name=:first_name, 
                      last_name=:last_name, role=:role, credits=:credits, 
                      created_at=NOW(), updated_at=NOW()";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":credits", $this->credits);

        return $stmt->execute();
    }

    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        
        $row = $stmt->fetch();
        
        if ($row) {
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->profile_image_url = $row['profile_image_url'];
            $this->role = $row['role'];
            $this->credits = $row['credits'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    public function findById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch();
        
        if ($row) {
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->profile_image_url = $row['profile_image_url'];
            $this->role = $row['role'];
            $this->credits = $row['credits'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    public function updateCredits($newBalance) {
        $query = "UPDATE " . $this->table . " SET credits = :credits, updated_at = NOW() WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":credits", $newBalance);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    public function updateProfile() {
        $query = "UPDATE " . $this->table . " 
                  SET first_name = :first_name, last_name = :last_name, 
                      profile_image_url = :profile_image_url, updated_at = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":profile_image_url", $this->profile_image_url);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    public function updatePassword($newPassword) {
        $query = "UPDATE " . $this->table . " SET password = :password, updated_at = NOW() WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":password", $newPassword);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
}