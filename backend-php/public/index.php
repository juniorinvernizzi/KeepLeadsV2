<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Create Container
$container = new Container();

// Set container to create App with on AppFactory
AppFactory::setContainer($container);

// Create App
$app = AppFactory::create();

// Add error middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Configure CORS
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    
    // Get origin from request
    $origin = $request->getHeaderLine('Origin');
    
    // Allow specific origins for development and production
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
    ];
    
    // Check if origin is allowed or default to localhost for development
    $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : 'http://localhost:5000';
    
    return $response
        ->withHeader('Access-Control-Allow-Origin', $allowOrigin)
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cookie')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('Vary', 'Origin');
});

// Configure session cookies for cross-origin compatibility
$isProduction = ($_ENV['APP_ENV'] ?? 'development') === 'production';
$isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';

session_set_cookie_params([
    'lifetime' => 0,           // Session expires when browser closes
    'path' => '/',
    'domain' => '',            // Let PHP determine the domain
    'secure' => $isProduction && $isHttps, // Require HTTPS in production
    'httponly' => true,        // Prevent JavaScript access for security
    'samesite' => $isProduction ? 'None' : 'Lax' // Allow cross-origin in production, Lax for dev
]);

// Start session
session_start();

// CSRF Protection Middleware
$app->add(function ($request, $handler) {
    $method = $request->getMethod();
    $path = $request->getUri()->getPath();
    
    // Apply CSRF protection only to state-changing methods
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        // Exclude webhook endpoint from CSRF protection
        if ($path !== '/api/payment/webhook') {
            $origin = $request->getHeaderLine('Origin');
            $referer = $request->getHeaderLine('Referer');
            
            // Use Origin header (more reliable) or fallback to Referer
            $sourceOrigin = $origin ?: ($referer ? parse_url($referer, PHP_URL_SCHEME) . '://' . parse_url($referer, PHP_URL_HOST) . ':' . parse_url($referer, PHP_URL_PORT) : '');
            
            $allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:5000',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5000',
                'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
            ];
            
            if (!in_array($sourceOrigin, $allowedOrigins)) {
                error_log("CSRF: Blocked request to $method $path from origin: $sourceOrigin, referer: $referer");
                
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode([
                    'message' => 'CSRF protection: Invalid or missing origin header'
                ]));
                return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
            }
        }
    }
    
    return $handler->handle($request);
});

// Import routes
require __DIR__ . '/../src/routes.php';

$app->run();