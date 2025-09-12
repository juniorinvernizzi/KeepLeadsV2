<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Controllers\AuthController;
use KeepLeads\Controllers\LeadController;
use KeepLeads\Controllers\UserController;
use KeepLeads\Controllers\PaymentController;
use KeepLeads\Controllers\AdminController;

// Initialize controllers
$authController = new AuthController();
$leadController = new LeadController();
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

// API Health check for compatibility with frontend
$app->get('/api', function (Request $request, Response $response) {
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

$app->map(['HEAD'], '/api', function (Request $request, Response $response) {
    return $response->withHeader('Content-Type', 'application/json');
});

// Authentication routes  
$app->post('/api/simple-login', [$authController, 'login']);
$app->post('/api/simple-register', [$authController, 'register']);
$app->post('/api/simple-logout', [$authController, 'logout']);
$app->get('/api/simple-auth/user', [$authController, 'getUser']);

// Leads routes
$app->get('/api/leads', [$leadController, 'getLeads']);
$app->get('/api/leads/{id}', [$leadController, 'getLead']);
$app->post('/api/leads/{id}/purchase', [$leadController, 'purchaseLead']);

// User routes
$app->get('/api/my-leads', [$userController, 'getMyLeads']); 
$app->get('/api/transactions', [$userController, 'getTransactions']);
$app->put('/api/user/profile', [$userController, 'updateProfile']);
$app->put('/api/profile', [$userController, 'updateProfile']); // Alias for frontend compatibility

// Insurance companies
$app->get('/api/insurance-companies', [$leadController, 'getInsuranceCompanies']);

// Payment routes
$app->post('/api/payment/create-preference', [$paymentController, 'createPreference']);
$app->post('/api/payment/webhook', [$paymentController, 'webhook']);

// Admin routes (protected)
$app->get('/api/admin/users', [$adminController, 'getUsers']);
$app->get('/api/admin/stats', [$adminController, 'getStats']);
$app->get('/api/admin/leads', [$adminController, 'getLeads']);
$app->post('/api/admin/leads', [$adminController, 'createLead']);
$app->put('/api/admin/leads/{id}', [$adminController, 'updateLead']);
$app->delete('/api/admin/leads/{id}', [$adminController, 'deleteLead']);