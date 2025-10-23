<?php

namespace KeepLeads\Models;

class IntegrationSetting {
    public $id;
    public $provider;
    public $environment;
    public $access_token;
    public $public_key;
    public $is_active;
    public $created_at;
    public $updated_at;

    public function __construct() {
        $this->is_active = true;
        $this->environment = 'test';
    }

    public function create() {
        $database = new \Database();
        $conn = $database->getConnection();
        
        $query = "INSERT INTO integration_settings 
                  (provider, environment, access_token, public_key, is_active, created_at, updated_at) 
                  VALUES 
                  (:provider, :environment, :access_token, :public_key, :is_active, NOW(), NOW())
                  RETURNING id";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':provider', $this->provider);
        $stmt->bindParam(':environment', $this->environment);
        $stmt->bindParam(':access_token', $this->access_token);
        $stmt->bindParam(':public_key', $this->public_key);
        $stmt->bindParam(':is_active', $this->is_active, \PDO::PARAM_BOOL);
        
        if ($stmt->execute()) {
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            $this->id = $result['id'];
            return true;
        }
        
        return false;
    }

    public function update() {
        $database = new \Database();
        $conn = $database->getConnection();
        
        $query = "UPDATE integration_settings 
                  SET access_token = :access_token,
                      public_key = :public_key,
                      is_active = :is_active,
                      updated_at = NOW()
                  WHERE provider = :provider AND environment = :environment";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':provider', $this->provider);
        $stmt->bindParam(':environment', $this->environment);
        $stmt->bindParam(':access_token', $this->access_token);
        $stmt->bindParam(':public_key', $this->public_key);
        $stmt->bindParam(':is_active', $this->is_active, \PDO::PARAM_BOOL);
        
        return $stmt->execute();
    }

    public function upsert() {
        $database = new \Database();
        $conn = $database->getConnection();
        
        $query = "INSERT INTO integration_settings 
                  (provider, environment, access_token, public_key, is_active, created_at, updated_at) 
                  VALUES 
                  (:provider, :environment, :access_token, :public_key, :is_active, NOW(), NOW())
                  ON CONFLICT (provider, environment) 
                  DO UPDATE SET 
                      access_token = EXCLUDED.access_token,
                      public_key = EXCLUDED.public_key,
                      is_active = EXCLUDED.is_active,
                      updated_at = NOW()
                  RETURNING id";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':provider', $this->provider);
        $stmt->bindParam(':environment', $this->environment);
        $stmt->bindParam(':access_token', $this->access_token);
        $stmt->bindParam(':public_key', $this->public_key);
        $stmt->bindParam(':is_active', $this->is_active, \PDO::PARAM_BOOL);
        
        if ($stmt->execute()) {
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            $this->id = $result['id'];
            return true;
        }
        
        return false;
    }

    public static function findByProvider($provider, $environment = null) {
        $database = new \Database();
        $conn = $database->getConnection();
        
        if ($environment) {
            $query = "SELECT * FROM integration_settings 
                      WHERE provider = :provider AND environment = :environment AND is_active = true
                      LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':provider', $provider);
            $stmt->bindParam(':environment', $environment);
        } else {
            $query = "SELECT * FROM integration_settings 
                      WHERE provider = :provider AND is_active = true
                      ORDER BY CASE WHEN environment = 'production' THEN 1 ELSE 2 END
                      LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':provider', $provider);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($row) {
            $setting = new self();
            $setting->id = $row['id'];
            $setting->provider = $row['provider'];
            $setting->environment = $row['environment'];
            $setting->access_token = $row['access_token'];
            $setting->public_key = $row['public_key'];
            $setting->is_active = $row['is_active'];
            $setting->created_at = $row['created_at'];
            $setting->updated_at = $row['updated_at'];
            return $setting;
        }
        
        return null;
    }

    public static function getAll() {
        $database = new \Database();
        $conn = $database->getConnection();
        
        $query = "SELECT * FROM integration_settings ORDER BY provider, environment";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        
        $settings = [];
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $setting = new self();
            $setting->id = $row['id'];
            $setting->provider = $row['provider'];
            $setting->environment = $row['environment'];
            $setting->access_token = $row['access_token'];
            $setting->public_key = $row['public_key'];
            $setting->is_active = $row['is_active'];
            $setting->created_at = $row['created_at'];
            $setting->updated_at = $row['updated_at'];
            $settings[] = $setting;
        }
        
        return $settings;
    }
}
