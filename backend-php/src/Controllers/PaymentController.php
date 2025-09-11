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
                error_log("Webhook ignored - not a payment notification: " . ($data['type'] ?? 'unknown'));
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            $paymentId = $data['data']['id'] ?? null;
            if (!$paymentId) {
                error_log("Webhook ignored - no payment ID found");
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            // Check if we already processed this payment to avoid duplicates
            $database = new \Database();
            $conn = $database->getConnection();
            
            $checkQuery = "SELECT id FROM credit_transactions WHERE payment_id = :payment_id LIMIT 1";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bindParam(':payment_id', $paymentId);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() > 0) {
                error_log("Payment already processed: " . $paymentId);
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            // Get payment details from Mercado Pago API
            try {
                $payment = \MercadoPago\Payment::find_by_id($paymentId);
            } catch (\Exception $e) {
                error_log("Failed to fetch payment from Mercado Pago API: " . $e->getMessage());
                $response->getBody()->write('ERROR');
                return $response->withStatus(500);
            }
            
            if (!$payment) {
                error_log("Payment not found in Mercado Pago: " . $paymentId);
                $response->getBody()->write('OK');
                return $response->withStatus(200);
            }

            error_log("Processing payment $paymentId with status: " . $payment->status);

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

                // Validate amount matches payment to prevent tampering
                if (abs((float)$payment->transaction_amount - $amount) > 0.01) {
                    error_log("Amount mismatch - Expected: $amount, Got: " . $payment->transaction_amount);
                    $response->getBody()->write('ERROR');
                    return $response->withStatus(400);
                }

                // Use database transaction for atomicity
                $conn->beginTransaction();
                
                try {
                    $user = new User();
                    if (!$user->findById($userId)) {
                        throw new \Exception("User not found: " . $userId);
                    }

                    $currentCredits = (float)$user->credits;
                    $newCredits = $currentCredits + $amount;
                    
                    if (!$user->updateCredits($newCredits)) {
                        throw new \Exception("Failed to update user credits");
                    }

                    // Create credit transaction using the CreditTransaction model
                    $creditTransaction = new \KeepLeads\Models\CreditTransaction();
                    $creditTransaction->user_id = $userId;
                    $creditTransaction->type = 'deposit';
                    $creditTransaction->amount = $amount;
                    $creditTransaction->description = 'Depósito via Mercado Pago';
                    $creditTransaction->balance_before = $currentCredits;
                    $creditTransaction->balance_after = $newCredits;
                    $creditTransaction->payment_method = 'mercado_pago';
                    $creditTransaction->payment_id = $paymentId;
                    
                    if (!$creditTransaction->create()) {
                        throw new \Exception("Failed to create credit transaction record");
                    }

                    $conn->commit();
                    error_log("Successfully processed payment $paymentId: Added $amount credits to user $userId (Balance: $currentCredits -> $newCredits)");

                } catch (\Exception $e) {
                    $conn->rollBack();
                    error_log("Transaction failed for payment $paymentId: " . $e->getMessage());
                    $response->getBody()->write('ERROR');
                    return $response->withStatus(500);
                }
                
            } else {
                error_log("Payment not approved - Status: " . $payment->status . " for payment: " . $paymentId);
            }

            $response->getBody()->write('OK');
            return $response->withStatus(200);

        } catch (\Exception $e) {
            error_log("Webhook processing error: " . $e->getMessage());
            $response->getBody()->write('ERROR');
            return $response->withStatus(500);
        }
    }
}