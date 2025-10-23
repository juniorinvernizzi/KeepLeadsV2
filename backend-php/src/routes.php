<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Controllers\AuthController;
use KeepLeads\Controllers\LeadController;
use KeepLeads\Controllers\LeadImportController;
use KeepLeads\Controllers\UserController;
use KeepLeads\Controllers\PaymentController;
use KeepLeads\Controllers\AdminController;

// This file expects $app to be defined in the including context

// Initialize controllers
$authController = new AuthController();
$leadController = new LeadController();
$leadImportController = new LeadImportController();
$userController = new UserController();
$paymentController = new PaymentController();
$adminController = new AdminController();

// Health check
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode([
        'message' => 'KeepLeads API PHP',
        'status' => 'running',
        'version' => '1.0.0'
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Handle HEAD requests for health checks
$app->map(['HEAD'], '/', function (Request $request, Response $response) {
    return $response->withHeader('Content-Type', 'application/json');
});

// Authentication routes (without /api prefix - proxy removes it)
$app->post('/simple-login', [$authController, 'login']);
$app->post('/simple-register', [$authController, 'register']);
$app->post('/simple-logout', [$authController, 'logout']);
$app->get('/simple-auth/user', [$authController, 'getUser']);

// Leads routes
$app->get('/leads', [$leadController, 'getLeads']);
$app->get('/leads/{id}', [$leadController, 'getLead']);
$app->post('/leads/{id}/purchase', [$leadController, 'purchaseLead']);

// Lead import from external sources (N8N, KommoCRM)
$app->post('/leads/import', [$leadImportController, 'importLead']);

// User routes
$app->get('/my-leads', [$userController, 'getMyLeads']); 
$app->get('/transactions', [$userController, 'getTransactions']);
$app->put('/user/profile', [$userController, 'updateProfile']);
$app->put('/profile', [$userController, 'updateProfile']); // Alias for frontend compatibility

// Insurance companies
$app->get('/insurance-companies', [$leadController, 'getInsuranceCompanies']);

// Payment routes
$app->get('/payment/config', [$paymentController, 'getConfig']);
$app->post('/payment/create-preference', [$paymentController, 'createPreference']);
$app->post('/payment/webhook', [$paymentController, 'webhook']);

// Admin routes (protected)
$app->get('/admin/users', [$adminController, 'getUsers']);
$app->get('/admin/stats', [$adminController, 'getStats']);
$app->get('/admin/leads', [$adminController, 'getLeads']);
$app->post('/admin/leads', [$adminController, 'createLead']);
$app->put('/admin/leads/{id}', [$adminController, 'updateLead']);
$app->delete('/admin/leads/{id}', [$adminController, 'deleteLead']);

// Admin integration routes
$app->get('/admin/integrations', [$adminController, 'getIntegrations']);
$app->post('/admin/integrations', [$adminController, 'saveIntegrations']);
$app->post('/admin/integrations/test-webhook', [$adminController, 'testWebhook']);
$app->get('/admin/integrations/mercadopago', [$adminController, 'getMercadoPagoSettings']);
$app->put('/admin/integrations/mercadopago', [$adminController, 'saveMercadoPagoSettings']);