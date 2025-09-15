<?php

namespace KeepLeads\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Models\Lead;
use KeepLeads\Models\User;
use KeepLeads\Models\Purchase;
use KeepLeads\Models\CreditTransaction;

class LeadController {

    public function getLeads(Request $request, Response $response) {
        try {
            $queryParams = $request->getQueryParams();
            
            $filters = [
                'search' => $queryParams['search'] ?? '',
                'insuranceCompany' => $queryParams['insuranceCompany'] ?? 'all',
                'ageRange' => $queryParams['ageRange'] ?? 'all',
                'city' => $queryParams['city'] ?? 'all',
                'minPrice' => $queryParams['minPrice'] ?? '',
                'maxPrice' => $queryParams['maxPrice'] ?? ''
            ];

            $lead = new Lead();
            $leads = $lead->getLeads($filters);

            // Transform data to match frontend expectations
            $transformedLeads = array_map(function($lead) {
                return [
                    'id' => $lead['id'],
                    'name' => $lead['name'],
                    'email' => $lead['email'],
                    'phone' => $lead['phone'],
                    'age' => (int)$lead['age'],
                    'city' => $lead['city'],
                    'state' => $lead['state'],
                    'insuranceCompanyId' => $lead['insurance_company_id'],
                    'planType' => $lead['plan_type'],
                    'budgetMin' => $lead['budget_min'],
                    'budgetMax' => $lead['budget_max'],
                    'availableLives' => (int)$lead['available_lives'],
                    'source' => $lead['source'],
                    'campaign' => $lead['campaign'],
                    'quality' => $lead['quality'],
                    'status' => $lead['status'],
                    'price' => $lead['price'],
                    'notes' => $lead['notes'],
                    'createdAt' => $lead['created_at'],
                    'updatedAt' => $lead['updated_at']
                ];
            }, $leads);

            $response->getBody()->write(json_encode($transformedLeads));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (Exception $e) {
            error_log("Error fetching leads: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to fetch leads'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getLead(Request $request, Response $response, $args) {
        try {
            $leadId = $args['id'];
            
            $lead = new Lead();
            $leadData = $lead->findById($leadId);

            if (!$leadData) {
                $response->getBody()->write(json_encode([
                    'message' => 'Lead not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // Transform data to match frontend expectations
            $transformedLead = [
                'id' => $leadData['id'],
                'name' => $leadData['name'],
                'email' => $leadData['email'],
                'phone' => $leadData['phone'],
                'age' => (int)$leadData['age'],
                'city' => $leadData['city'],
                'state' => $leadData['state'],
                'insuranceCompanyId' => $leadData['insurance_company_id'],
                'planType' => $leadData['plan_type'],
                'budgetMin' => $leadData['budget_min'],
                'budgetMax' => $leadData['budget_max'],
                'availableLives' => (int)$leadData['available_lives'],
                'source' => $leadData['source'],
                'campaign' => $leadData['campaign'],
                'quality' => $leadData['quality'],
                'status' => $leadData['status'],
                'price' => $leadData['price'],
                'notes' => $leadData['notes'],
                'createdAt' => $leadData['created_at'],
                'updatedAt' => $leadData['updated_at']
            ];

            $response->getBody()->write(json_encode($transformedLead));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (Exception $e) {
            error_log("Error fetching lead: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to fetch lead'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function purchaseLead(Request $request, Response $response, $args) {
        // Authentication check
        if (!isset($_SESSION['user_id'])) {
            $response->getBody()->write(json_encode([
                'message' => 'Unauthorized'
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        try {
            $userId = $_SESSION['user_id'];
            $leadId = $args['id'];

            // Get lead details
            $lead = new Lead();
            $leadData = $lead->findById($leadId);

            if (!$leadData) {
                $response->getBody()->write(json_encode([
                    'message' => 'Lead not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            if ($leadData['status'] !== 'available') {
                $response->getBody()->write(json_encode([
                    'message' => 'Lead is not available for purchase'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Get user details
            $user = new User();
            if (!$user->findById($userId)) {
                $response->getBody()->write(json_encode([
                    'message' => 'User not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // Check if user has sufficient credits
            $userCredits = (float)$user->credits;
            $leadPrice = (float)$leadData['price'];

            if ($userCredits < $leadPrice) {
                $response->getBody()->write(json_encode([
                    'message' => 'Insufficient credits'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Create purchase (implementation would go in Purchase model)
            // Update lead status
            $lead->updateStatus($leadId, 'sold');
            
            // Deduct credits
            $newBalance = $userCredits - $leadPrice;
            $user->updateCredits($newBalance);

            // Add credit transaction (implementation would go in CreditTransaction model)
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Lead purchased successfully',
                'newBalance' => number_format($newBalance, 2)
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (Exception $e) {
            error_log("Error purchasing lead: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to purchase lead'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getInsuranceCompanies(Request $request, Response $response) {
        try {
            $database = new \Database();
            $conn = $database->getConnection();

            $query = "SELECT id, name, logo, color FROM insurance_companies ORDER BY name";
            $stmt = $conn->prepare($query);
            $stmt->execute();

            $companies = $stmt->fetchAll();

            $response->getBody()->write(json_encode($companies));
            return $response->withHeader('Content-Type', 'application/json');

        } catch (Exception $e) {
            error_log("Error fetching insurance companies: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Failed to fetch insurance companies'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}