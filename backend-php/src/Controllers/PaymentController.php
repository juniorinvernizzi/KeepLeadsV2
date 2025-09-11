<?php

namespace KeepLeads\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Models\User;
use MercadoPago\SDK as MercadoPago;
use MercadoPago\Preference;
use MercadoPago\Item;

class PaymentController {

    public function __construct() {
        // Initialize Mercado Pago SDK
        $accessToken = $_ENV['MERCADO_PAGO_ACCESS_TOKEN'] ?? '';
        if ($accessToken) {
            MercadoPago::setAccessToken($accessToken);
        }
    }

    private function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            throw new \Exception('Unauthorized', 401);
        }
        return $_SESSION['user_id'];
    }

    public function createPreference(Request $request, Response $response) {
        try {
            $userId = $this->requireAuth();
            $data = json_decode($request->getBody()->getContents(), true);

            if (!isset($data['amount']) || !isset($data['description'])) {
                $response->getBody()->write(json_encode([
                    'message' => 'Amount and description are required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Get user info
            $user = new User();
            if (!$user->findById($userId)) {
                $response->getBody()->write(json_encode([
                    'message' => 'User not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // Create Mercado Pago preference
            $preference = new Preference();

            $item = new Item();
            $item->title = $data['description'];
            $item->quantity = 1;
            $item->unit_price = (float)$data['amount'];
            $item->description = 'Créditos KeepLeads';

            $preference->items = array($item);

            // Set payer info
            $payer = array(
                "name" => $user->first_name,
                "surname" => $user->last_name,
                "email" => $user->email
            );
            $preference->payer = $payer;

            // Set URLs
            $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
            
            $preference->back_urls = array(
                "success" => $baseUrl . "/credits?status=approved",
                "failure" => $baseUrl . "/credits?status=failure",
                "pending" => $baseUrl . "/credits?status=pending"
            );
            
            $preference->auto_return = "approved";
            
            // Set notification URL for webhooks
            $preference->notification_url = $baseUrl . "/api/payment/webhook";

            // Set external reference to track the user
            $preference->external_reference = $userId . '|' . $data['amount'];

            $preference->save();

            $response->getBody()->write(json_encode([
                'preferenceId' => $preference->id,
                'initPoint' => $preference->init_point,
                'sandboxInitPoint' => $preference->sandbox_init_point
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            if ($e->getCode() === 401) {
                $response->getBody()->write(json_encode([
                    'message' => 'Unauthorized'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            error_log("Error creating payment preference: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to create payment preference'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function webhook(Request $request, Response $response) {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            error_log("Mercado Pago webhook received: " . json_encode($data));

            if (!isset($data['type']) || $data['type'] !== 'payment') {
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            $paymentId = $data['data']['id'] ?? null;
            if (!$paymentId) {
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            // Get payment details from Mercado Pago
            $payment = \MercadoPago\Payment::find_by_id($paymentId);
            
            if (!$payment) {
                error_log("Payment not found: " . $paymentId);
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            // Process only approved payments
            if ($payment->status === 'approved') {
                $externalReference = $payment->external_reference;
                if (!$externalReference) {
                    error_log("No external reference found for payment: " . $paymentId);
                    $response->getBody()->write('OK');
                    return $response->withStatus(200);
                }

                // Parse external reference (userId|amount)
                $parts = explode('|', $externalReference);
                if (count($parts) !== 2) {
                    error_log("Invalid external reference format: " . $externalReference);
                    $response->getBody()->write('OK');
                    return $response->withStatus(200);
                }

                $userId = $parts[0];
                $amount = (float)$parts[1];

                // Update user credits
                $user = new User();
                if ($user->findById($userId)) {
                    $currentCredits = (float)$user->credits;
                    $newCredits = $currentCredits + $amount;
                    
                    if ($user->updateCredits($newCredits)) {
                        // Add credit transaction
                        $database = new \Database();
                        $conn = $database->getConnection();

                        $query = "INSERT INTO credit_transactions 
                                  SET user_id = :user_id, type = 'deposit', amount = :amount, 
                                      description = :description, balance_before = :balance_before,
                                      balance_after = :balance_after, payment_method = 'mercado_pago',
                                      payment_id = :payment_id, created_at = NOW()";

                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(':user_id', $userId);
                        $stmt->bindParam(':amount', $amount);
                        $stmt->bindValue(':description', 'Depósito via Mercado Pago');
                        $stmt->bindParam(':balance_before', $currentCredits);
                        $stmt->bindParam(':balance_after', $newCredits);
                        $stmt->bindParam(':payment_id', $paymentId);
                        
                        $stmt->execute();

                        error_log("Credits added successfully for user $userId: $amount");
                    }
                }
            }

            $response->getBody()->write('OK');
            return $response->withStatus(200);

        } catch (\Exception $e) {
            error_log("Webhook error: " . $e->getMessage());
            $response->getBody()->write('ERROR');
            return $response->withStatus(500);
        }
    }
}