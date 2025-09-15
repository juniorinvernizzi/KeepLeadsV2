<?php

namespace KeepLeads\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Models\User;

class UserController {

    private function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            throw new \Exception('Unauthorized', 401);
        }
        return $_SESSION['user_id'];
    }

    public function getMyLeads(Request $request, Response $response) {
        try {
            $userId = $this->requireAuth();

            $database = new \Database();
            $conn = $database->getConnection();

            $query = "SELECT l.*, lp.purchased_at, lp.price as purchase_price, lp.status as purchase_status,
                            ic.name as insurance_company_name, ic.color as insurance_company_color
                      FROM lead_purchases lp
                      JOIN leads l ON lp.lead_id = l.id
                      LEFT JOIN insurance_companies ic ON l.insurance_company_id = ic.id
                      WHERE lp.user_id = :user_id
                      ORDER BY lp.purchased_at DESC";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();

            $purchases = $stmt->fetchAll();

            // Transform data to match frontend expectations
            $transformedPurchases = array_map(function($purchase) {
                return [
                    'id' => $purchase['id'],
                    'name' => $purchase['name'],
                    'email' => $purchase['email'],
                    'phone' => $purchase['phone'],
                    'age' => (int)$purchase['age'],
                    'city' => $purchase['city'],
                    'state' => $purchase['state'],
                    'insuranceCompanyId' => $purchase['insurance_company_id'],
                    'planType' => $purchase['plan_type'],
                    'budgetMin' => $purchase['budget_min'],
                    'budgetMax' => $purchase['budget_max'],
                    'availableLives' => (int)$purchase['available_lives'],
                    'source' => $purchase['source'],
                    'campaign' => $purchase['campaign'],
                    'quality' => $purchase['quality'],
                    'status' => $purchase['purchase_status'] ?? 'active',
                    'price' => $purchase['purchase_price'],
                    'notes' => $purchase['notes'],
                    'purchasedAt' => $purchase['purchased_at'],
                    'createdAt' => $purchase['created_at'],
                    'updatedAt' => $purchase['updated_at']
                ];
            }, $purchases);

            $response->getBody()->write(json_encode($transformedPurchases));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            if ($e->getCode() === 401) {
                $response->getBody()->write(json_encode([
                    'message' => 'Unauthorized'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            error_log("Error fetching user purchases: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to fetch purchased leads'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getTransactions(Request $request, Response $response) {
        try {
            $userId = $this->requireAuth();

            $database = new \Database();
            $conn = $database->getConnection();

            $query = "SELECT * FROM credit_transactions 
                      WHERE user_id = :user_id 
                      ORDER BY created_at DESC";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();

            $transactions = $stmt->fetchAll();

            // Transform data to match frontend expectations
            $transformedTransactions = array_map(function($transaction) {
                return [
                    'id' => $transaction['id'],
                    'userId' => $transaction['user_id'],
                    'type' => $transaction['type'],
                    'amount' => $transaction['amount'],
                    'description' => $transaction['description'],
                    'balanceBefore' => $transaction['balance_before'],
                    'balanceAfter' => $transaction['balance_after'],
                    'paymentMethod' => $transaction['payment_method'],
                    'paymentId' => $transaction['payment_id'],
                    'createdAt' => $transaction['created_at']
                ];
            }, $transactions);

            $response->getBody()->write(json_encode($transformedTransactions));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            if ($e->getCode() === 401) {
                $response->getBody()->write(json_encode([
                    'message' => 'Unauthorized'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            error_log("Error fetching transactions: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to fetch transactions'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function updateProfile(Request $request, Response $response) {
        try {
            $userId = $this->requireAuth();
            $data = json_decode($request->getBody()->getContents(), true);

            $user = new User();
            if (!$user->findById($userId)) {
                $response->getBody()->write(json_encode([
                    'message' => 'User not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // Update user data
            if (isset($data['firstName'])) {
                $user->first_name = $data['firstName'];
            }
            if (isset($data['lastName'])) {
                $user->last_name = $data['lastName'];
            }
            if (isset($data['profileImageUrl'])) {
                $user->profile_image_url = $data['profileImageUrl'];
            }

            if (!$user->updateProfile()) {
                $response->getBody()->write(json_encode([
                    'message' => 'Failed to update profile'
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            // Update session data
            $_SESSION['user'] = [
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role,
                'credits' => $user->credits
            ];

            $response->getBody()->write(json_encode([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'role' => $user->role,
                    'credits' => $user->credits,
                    'profileImageUrl' => $user->profile_image_url
                ]
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            if ($e->getCode() === 401) {
                $response->getBody()->write(json_encode([
                    'message' => 'Unauthorized'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            error_log("Error updating profile: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to update profile'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}