<?php

namespace KeepLeads\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use KeepLeads\Models\User;

class AuthController {

    public function login(Request $request, Response $response) {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (!isset($data['email']) || !isset($data['password'])) {
                $response->getBody()->write(json_encode([
                    'message' => 'Email and password required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $user = new User();
            if (!$user->findByEmail($data['email'])) {
                $response->getBody()->write(json_encode([
                    'message' => 'Invalid credentials'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            // Verify password (support both old SHA256 and new bcrypt)
            $isValidPassword = false;
            if (password_verify($data['password'], $user->password)) {
                $isValidPassword = true;
            } elseif (hash('sha256', $data['password']) === $user->password) {
                // Legacy SHA256 support - rehash to bcrypt
                $newHash = password_hash($data['password'], PASSWORD_DEFAULT);
                $user->password = $newHash;
                // Update password in database would go here
                $isValidPassword = true;
            }

            if (!$isValidPassword) {
                $response->getBody()->write(json_encode([
                    'message' => 'Invalid credentials'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            // Set session
            $_SESSION['user_id'] = $user->id;
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
                    'credits' => $user->credits
                ]
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Login failed'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function register(Request $request, Response $response) {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (!isset($data['email']) || !isset($data['password'])) {
                $response->getBody()->write(json_encode([
                    'message' => 'Email and password required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Check if user exists
            $existingUser = new User();
            if ($existingUser->findByEmail($data['email'])) {
                $response->getBody()->write(json_encode([
                    'message' => 'User already exists'
                ]));
                return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
            }

            // Create new user
            $user = new User();
            $user->email = $data['email'];
            $user->password = password_hash($data['password'], PASSWORD_DEFAULT);
            $user->first_name = $data['firstName'] ?? '';
            $user->last_name = $data['lastName'] ?? '';
            $user->role = 'client';
            $user->credits = '0.00';

            if (!$user->create()) {
                $response->getBody()->write(json_encode([
                    'message' => 'Registration failed'
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }

            // Auto-login after registration
            $_SESSION['user_id'] = $user->id;
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
                    'credits' => $user->credits
                ]
            ]));

            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');

        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'message' => 'Registration failed'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getUser(Request $request, Response $response) {
        if (!isset($_SESSION['user_id'])) {
            $response->getBody()->write(json_encode([
                'message' => 'Unauthorized'
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $user = new User();
        if (!$user->findById($_SESSION['user_id'])) {
            $response->getBody()->write(json_encode([
                'message' => 'User not found'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode([
            'id' => $user->id,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'role' => $user->role,
            'credits' => $user->credits
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function logout(Request $request, Response $response) {
        session_destroy();
        
        $response->getBody()->write(json_encode([
            'success' => true
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }
}