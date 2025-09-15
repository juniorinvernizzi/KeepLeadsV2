<?php

namespace KeepLeads\Controllers;

require_once __DIR__ . '/../../config/database_mysql.php';

class BaseController {
    protected $db;

    public function __construct() {
        try {
            $database = new \DatabaseMySQL();
            $this->db = $database->getConnection();
            
            // Initialize tables if they don't exist
            $database->initTables();
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw $e;
        }
    }

    protected function sendResponse($data, $statusCode = 200) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode($data));
        return $response
            ->withStatus($statusCode)
            ->withHeader('Content-Type', 'application/json');
    }

    protected function sendError($message, $statusCode = 400) {
        return $this->sendResponse(['error' => $message], $statusCode);
    }
}