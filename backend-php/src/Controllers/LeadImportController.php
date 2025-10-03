<?php

namespace KeepLeads\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Models\Lead;

class LeadImportController {
    
    /**
     * Import lead from external sources (N8N, KommoCRM, etc)
     * POST /api/leads/import
     */
    public function importLead(Request $request, Response $response) {
        try {
            $body = $request->getParsedBody();
            
            // Log incoming data for debugging
            error_log("Lead Import Request: " . json_encode($body));
            
            // Validate required fields
            $requiredFields = ['name', 'email', 'phone'];
            $missingFields = [];
            
            foreach ($requiredFields as $field) {
                if (empty($body[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Missing required fields: ' . implode(', ', $missingFields)
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            
            // Create new Lead instance
            $lead = new Lead();
            
            // Map incoming data to Lead model
            $lead->name = $this->sanitize($body['name']);
            $lead->email = $this->sanitize($body['email']);
            $lead->phone = $this->sanitize($body['phone']);
            
            // Optional fields with defaults
            $lead->age = isset($body['age']) ? (int)$body['age'] : 30;
            $lead->city = $this->sanitize($body['city'] ?? 'São Paulo');
            $lead->state = $this->sanitize($body['state'] ?? 'SP');
            
            // Insurance company mapping
            $lead->insurance_company_id = $this->mapInsuranceCompany($body['insuranceCompanyId'] ?? $body['insurance_company'] ?? 'unimed');
            
            // Plan type mapping
            $lead->plan_type = $this->mapPlanType($body['planType'] ?? $body['plan_type'] ?? 'individual');
            
            // Budget range
            $lead->budget_min = isset($body['budgetMin']) ? (string)$body['budgetMin'] : '200.00';
            $lead->budget_max = isset($body['budgetMax']) ? (string)$body['budgetMax'] : '500.00';
            
            // Income (required field)
            $lead->income = isset($body['income']) ? (string)$body['income'] : '3000.00';
            
            // Category (required field)
            $lead->category = isset($body['category']) ? $this->sanitize($body['category']) : 'health_insurance';
            
            // Additional fields
            $lead->available_lives = isset($body['availableLives']) ? (int)$body['availableLives'] : 1;
            $lead->source = $this->sanitize($body['source'] ?? 'KommoCRM');
            $lead->campaign = $this->sanitize($body['campaign'] ?? '');
            
            // Quality scoring
            $lead->quality = $this->calculateQuality($body);
            
            // Status and price
            $lead->status = 'available';
            $lead->price = $this->calculatePrice($lead->quality, $lead->available_lives);
            
            // Notes
            $lead->notes = $this->sanitize($body['notes'] ?? '');
            
            // Create the lead
            if ($lead->create()) {
                $response->getBody()->write(json_encode([
                    'success' => true,
                    'message' => 'Lead imported successfully',
                    'leadId' => $lead->id,
                    'data' => [
                        'id' => $lead->id,
                        'name' => $lead->name,
                        'email' => $lead->email,
                        'phone' => $lead->phone,
                        'quality' => $lead->quality,
                        'price' => $lead->price,
                        'source' => $lead->source
                    ]
                ]));
                return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            } else {
                throw new \Exception('Failed to create lead in database');
            }
            
        } catch (\Exception $e) {
            error_log("Lead Import Error: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Failed to import lead: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    /**
     * Sanitize input data
     */
    private function sanitize($value) {
        if ($value === null) {
            return '';
        }
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Map insurance company names to IDs
     */
    private function mapInsuranceCompany($value) {
        $mapping = [
            'amil' => 'amil',
            'bradesco' => 'bradesco',
            'sulamerica' => 'sulamérica',
            'sulamérica' => 'sulamérica',
            'unimed' => 'unimed',
            'porto seguro' => 'porto-seguro',
            'porto-seguro' => 'porto-seguro',
            'portoseguro' => 'porto-seguro'
        ];
        
        $normalized = strtolower(trim($value));
        return $mapping[$normalized] ?? 'unimed';
    }
    
    /**
     * Map plan type names
     */
    private function mapPlanType($value) {
        $mapping = [
            'individual' => 'individual',
            'familiar' => 'family',
            'family' => 'family',
            'empresarial' => 'business',
            'business' => 'business',
            'pme' => 'business'
        ];
        
        $normalized = strtolower(trim($value));
        return $mapping[$normalized] ?? 'individual';
    }
    
    /**
     * Calculate lead quality based on available data
     */
    private function calculateQuality($data) {
        // Simple quality scoring algorithm
        $score = 0;
        
        // Has email
        if (!empty($data['email'])) {
            $score += 30;
        }
        
        // Has phone
        if (!empty($data['phone'])) {
            $score += 30;
        }
        
        // Has age
        if (!empty($data['age'])) {
            $score += 10;
        }
        
        // Has budget range
        if (!empty($data['budgetMin']) && !empty($data['budgetMax'])) {
            $score += 20;
        }
        
        // Has city/state
        if (!empty($data['city']) && !empty($data['state'])) {
            $score += 10;
        }
        
        // Quality thresholds
        if ($score >= 80) {
            return 'high';
        } elseif ($score >= 50) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    /**
     * Calculate lead price based on quality and lives
     */
    private function calculatePrice($quality, $lives) {
        $basePrice = [
            'high' => 150.00,
            'medium' => 100.00,
            'low' => 50.00
        ];
        
        $price = $basePrice[$quality] ?? 100.00;
        
        // Add 20% per additional life
        if ($lives > 1) {
            $price += ($price * 0.20 * ($lives - 1));
        }
        
        return number_format($price, 2, '.', '');
    }
}
