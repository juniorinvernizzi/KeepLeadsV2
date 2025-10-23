<?php

namespace KeepLeads\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Models\User;
use KeepLeads\Models\Lead;

class AdminController {

    private function requireAdmin() {
        if (!isset($_SESSION['user_id'])) {
            throw new \Exception('Unauthorized', 401);
        }
        
        $user = new User();
        if (!$user->findById($_SESSION['user_id']) || $user->role !== 'admin') {
            throw new \Exception('Forbidden', 403);
        }
        
        return $_SESSION['user_id'];
    }

    public function getUsers(Request $request, Response $response) {
        try {
            $this->requireAdmin();

            $database = new \Database();
            $conn = $database->getConnection();

            $query = "SELECT id, email, first_name, last_name, role, credits, created_at, updated_at 
                      FROM users ORDER BY created_at DESC";

            $stmt = $conn->prepare($query);
            $stmt->execute();

            $users = $stmt->fetchAll();

            // Transform data
            $transformedUsers = array_map(function($user) {
                return [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'role' => $user['role'],
                    'credits' => $user['credits'],
                    'createdAt' => $user['created_at'],
                    'updatedAt' => $user['updated_at']
                ];
            }, $users);

            $response->getBody()->write(json_encode($transformedUsers));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to fetch users');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getStats(Request $request, Response $response) {
        try {
            $this->requireAdmin();

            $database = new \Database();
            $conn = $database->getConnection();

            // Get various statistics
            $stats = [];

            // Total users
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
            $stats['totalUsers'] = $stmt->fetch()['count'];

            // Total leads
            $stmt = $conn->query("SELECT COUNT(*) as count FROM leads");
            $stats['totalLeads'] = $stmt->fetch()['count'];

            // Available leads
            $stmt = $conn->query("SELECT COUNT(*) as count FROM leads WHERE status = 'available'");
            $stats['availableLeads'] = $stmt->fetch()['count'];

            // Total purchases
            $stmt = $conn->query("SELECT COUNT(*) as count FROM lead_purchases");
            $stats['totalPurchases'] = $stmt->fetch()['count'];

            // Revenue
            $stmt = $conn->query("SELECT COALESCE(SUM(amount), 0) as total FROM credit_transactions WHERE type = 'deposit'");
            $stats['totalRevenue'] = $stmt->fetch()['total'];

            // Recent activity
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'");
            $stmt->execute();
            $stats['newUsersLast30Days'] = $stmt->fetch()['count'];

            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM lead_purchases WHERE purchased_at >= NOW() - INTERVAL '30 days'");
            $stmt->execute();
            $stats['purchasesLast30Days'] = $stmt->fetch()['count'];

            $response->getBody()->write(json_encode($stats));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            // Only use exception code if it's a valid HTTP status code (401, 403, etc)
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to fetch statistics');
            
            $response->getBody()->write(json_encode(['message' => $message, 'error' => $e->getMessage()]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getLeads(Request $request, Response $response) {
        try {
            $this->requireAdmin();

            $lead = new Lead();
            $leads = $lead->getLeads(); // Get all leads (admin view)

            $response->getBody()->write(json_encode($leads));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to fetch leads');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function createLead(Request $request, Response $response) {
        try {
            $this->requireAdmin();
            $data = json_decode($request->getBody()->getContents(), true);

            // Validate required fields
            $required = ['name', 'email', 'phone', 'age', 'city', 'state', 'price'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $response->getBody()->write(json_encode([
                        'message' => "Field '$field' is required"
                    ]));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }
            }

            $lead = new Lead();
            $lead->name = $data['name'];
            $lead->email = $data['email'];
            $lead->phone = $data['phone'];
            $lead->age = (int)$data['age'];
            $lead->city = $data['city'];
            $lead->state = $data['state'];
            $lead->insurance_company_id = $data['insuranceCompanyId'] ?? null;
            $lead->plan_type = $data['planType'] ?? 'individual';
            $lead->budget_min = $data['budgetMin'] ?? null;
            $lead->budget_max = $data['budgetMax'] ?? null;
            $lead->available_lives = (int)($data['availableLives'] ?? 1);
            $lead->source = $data['source'] ?? 'Manual';
            $lead->campaign = $data['campaign'] ?? null;
            $lead->quality = $data['quality'] ?? 'medium';
            $lead->status = $data['status'] ?? 'available';
            $lead->price = (float)$data['price'];
            $lead->notes = $data['notes'] ?? null;

            if (!$lead->create()) {
                $response->getBody()->write(json_encode([
                    'message' => 'Failed to create lead'
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'id' => $lead->id,
                'message' => 'Lead created successfully'
            ]));

            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to create lead');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function updateLead(Request $request, Response $response, $args) {
        try {
            $this->requireAdmin();
            $leadId = $args['id'];
            $data = json_decode($request->getBody()->getContents(), true);

            $database = new \Database();
            $conn = $database->getConnection();

            // Build update query dynamically
            $setParts = [];
            $params = [':id' => $leadId];

            $allowedFields = [
                'name', 'email', 'phone', 'age', 'city', 'state', 
                'insurance_company_id' => 'insuranceCompanyId',
                'plan_type' => 'planType', 'budget_min' => 'budgetMin', 
                'budget_max' => 'budgetMax', 'available_lives' => 'availableLives',
                'source', 'campaign', 'quality', 'status', 'price', 'notes'
            ];

            foreach ($allowedFields as $dbField => $dataField) {
                $field = is_numeric($dbField) ? $dataField : $dataField;
                $column = is_numeric($dbField) ? $dataField : $dbField;
                
                if (isset($data[$field])) {
                    $setParts[] = "$column = :$column";
                    $params[":$column"] = $data[$field];
                }
            }

            if (empty($setParts)) {
                $response->getBody()->write(json_encode([
                    'message' => 'No valid fields to update'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $setParts[] = "updated_at = NOW()";
            $setClause = implode(', ', $setParts);

            $query = "UPDATE leads SET $setClause WHERE id = :id";
            $stmt = $conn->prepare($query);

            if (!$stmt->execute($params)) {
                $response->getBody()->write(json_encode([
                    'message' => 'Failed to update lead'
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Lead updated successfully'
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to update lead');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function deleteLead(Request $request, Response $response, $args) {
        try {
            $this->requireAdmin();
            $leadId = $args['id'];

            $database = new \Database();
            $conn = $database->getConnection();

            $query = "DELETE FROM leads WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $leadId);

            if (!$stmt->execute()) {
                $response->getBody()->write(json_encode([
                    'message' => 'Failed to delete lead'
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Lead deleted successfully'
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to delete lead');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getIntegrations(Request $request, Response $response) {
        try {
            $this->requireAdmin();

            $settings = [
                'n8nWebhookUrl' => $_ENV['N8N_WEBHOOK_URL'] ?? '',
                'n8nEnabled' => !empty($_ENV['N8N_WEBHOOK_URL']),
                'kommoCrmApiKey' => $_ENV['KOMMO_API_KEY'] ?? '',
                'kommoCrmEnabled' => !empty($_ENV['KOMMO_API_KEY']),
                'mercadoPagoAccessToken' => $_ENV['MERCADO_PAGO_ACCESS_TOKEN'] ?? '',
                'mercadoPagoEnabled' => !empty($_ENV['MERCADO_PAGO_ACCESS_TOKEN'])
            ];

            $response->getBody()->write(json_encode($settings));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to fetch integration settings');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function saveIntegrations(Request $request, Response $response) {
        try {
            $this->requireAdmin();

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Integration settings are read-only. Please update environment variables on the server.'
            ]));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to save integration settings');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function testWebhook(Request $request, Response $response) {
        try {
            $this->requireAdmin();
            $data = json_decode($request->getBody()->getContents(), true);
            $url = $data['url'] ?? '';

            if (empty($url)) {
                $response->getBody()->write(json_encode([
                    'message' => 'Webhook URL is required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Test webhook with sample data
            $testData = [
                'test' => true,
                'name' => 'Test Lead',
                'email' => 'test@example.com',
                'phone' => '11999999999'
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);

            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                $response->getBody()->write(json_encode([
                    'success' => true,
                    'message' => 'Webhook test successful',
                    'httpCode' => $httpCode
                ]));
            } else {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Webhook test failed',
                    'httpCode' => $httpCode
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to test webhook');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getMercadoPagoSettings(Request $request, Response $response) {
        try {
            $this->requireAdmin();

            $settings = \KeepLeads\Models\IntegrationSetting::getAll();
            $mercadoPagoSettings = array_filter($settings, function($s) {
                return $s->provider === 'mercado_pago';
            });

            $result = [
                'test' => null,
                'production' => null,
                'activeEnvironment' => 'test'
            ];

            foreach ($mercadoPagoSettings as $setting) {
                $settingData = [
                    'accessToken' => $setting->access_token ? '***' . substr($setting->access_token, -8) : null,
                    'publicKey' => $setting->public_key ? '***' . substr($setting->public_key, -8) : null,
                    'isActive' => $setting->is_active,
                    'hasToken' => !empty($setting->access_token)
                ];

                if ($setting->environment === 'test') {
                    $result['test'] = $settingData;
                    if ($setting->is_active) {
                        $result['activeEnvironment'] = 'test';
                    }
                } else if ($setting->environment === 'production') {
                    $result['production'] = $settingData;
                    if ($setting->is_active) {
                        $result['activeEnvironment'] = 'production';
                    }
                }
            }

            // Check for env fallback
            $envToken = $_ENV['MERCADO_PAGO_ACCESS_TOKEN'] ?? '';
            if ($envToken && !$result['test'] && !$result['production']) {
                $isTest = strpos($envToken, 'TEST-') === 0;
                $result['activeEnvironment'] = $isTest ? 'test' : 'production';
                $result[$isTest ? 'test' : 'production'] = [
                    'accessToken' => '***' . substr($envToken, -8),
                    'publicKey' => null,
                    'isActive' => true,
                    'hasToken' => true,
                    'source' => 'env'
                ];
            }

            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to fetch Mercado Pago settings');
            
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }

    public function saveMercadoPagoSettings(Request $request, Response $response) {
        try {
            $this->requireAdmin();
            $data = json_decode($request->getBody()->getContents(), true);

            if (!isset($data['environment']) || !in_array($data['environment'], ['test', 'production'])) {
                $response->getBody()->write(json_encode([
                    'message' => 'Invalid environment. Must be "test" or "production"'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $environment = $data['environment'];
            $accessToken = $data['accessToken'] ?? '';
            $publicKey = $data['publicKey'] ?? '';
            $isActive = $data['isActive'] ?? true;

            // Validate test token format
            if ($environment === 'test' && !empty($accessToken) && strpos($accessToken, 'TEST-') !== 0) {
                $response->getBody()->write(json_encode([
                    'message' => 'Token de teste deve começar com "TEST-"'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Validate production token format
            if ($environment === 'production' && !empty($accessToken) && strpos($accessToken, 'APP_USR-') !== 0) {
                $response->getBody()->write(json_encode([
                    'message' => 'Token de produção deve começar com "APP_USR-"'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Save settings to database
            $setting = new \KeepLeads\Models\IntegrationSetting();
            $setting->provider = 'mercado_pago';
            $setting->environment = $environment;
            $setting->access_token = $accessToken;
            $setting->public_key = $publicKey;
            $setting->is_active = $isActive;

            if ($setting->upsert()) {
                // If activating this environment, deactivate the other one
                if ($isActive) {
                    $otherEnv = $environment === 'test' ? 'production' : 'test';
                    $database = new \Database();
                    $conn = $database->getConnection();
                    $query = "UPDATE integration_settings SET is_active = false 
                              WHERE provider = 'mercado_pago' AND environment = :env";
                    $stmt = $conn->prepare($query);
                    $stmt->bindParam(':env', $otherEnv);
                    $stmt->execute();
                }

                $response->getBody()->write(json_encode([
                    'success' => true,
                    'message' => 'Configurações salvas com sucesso',
                    'environment' => $environment
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                $response->getBody()->write(json_encode([
                    'message' => 'Failed to save settings'
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

        } catch (\Exception $e) {
            $code = $e->getCode();
            $statusCode = ($code === 401 || $code === 403) ? $code : 500;
            $message = $code === 401 ? 'Unauthorized' : 
                      ($code === 403 ? 'Forbidden' : 'Failed to save Mercado Pago settings');
            
            error_log("Error saving Mercado Pago settings: " . $e->getMessage());
            $response->getBody()->write(json_encode(['message' => $message]));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        }
    }
}