import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertCreditTransactionSchema, insertUserSchema } from "@shared/schema";
import { sendLeadPurchaseNotification, sendAdminPurchaseNotification } from "./emailService";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";

interface ReplitAuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

// Note: Using 'any' for middleware parameters to avoid Express type conflicts

// Simple auth middleware
const isSimpleAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Secure password hashing functions
const SALT_ROUNDS = 12;

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  // Try bcrypt first (new format)
  try {
    const bcryptMatch = await bcrypt.compare(password, hash);
    if (bcryptMatch) return true;
  } catch (e) {
    // Not a bcrypt hash, try SHA256
  }
  
  // Try SHA256 (legacy format)
  const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
  return sha256Hash === hash;
};

// Admin access middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const currentUser = await storage.getUser(req.session.userId);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.currentUser = currentUser;
    return next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({ message: "Failed to verify admin access" });
  }
};

// Helper function to sanitize user data (remove sensitive fields)
const sanitizeUser = (user: any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Credit handling helper functions for type consistency
const parseCredits = (credits: string | number): number => {
  if (typeof credits === 'number') return credits;
  const parsed = parseFloat(credits || '0');
  return isNaN(parsed) ? 0 : parsed;
};

const formatCredits = (amount: number): string => {
  return amount.toFixed(2);
};

const addCredits = (currentCredits: string, amount: number): string => {
  const current = parseCredits(currentCredits);
  return formatCredits(current + amount);
};

const subtractCredits = (currentCredits: string, amount: number): string => {
  const current = parseCredits(currentCredits);
  return formatCredits(Math.max(0, current - amount));
};

// CSRF Protection Middleware
const csrfProtection = (req: any, res: any, next: any) => {
  const method = req.method;
  
  // Only apply CSRF protection to state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return next();
  }

  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // Get host information
  const host = req.get('Host');
  const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'https';
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000', 
    'http://127.0.0.1:5000',
    'http://127.0.0.1:3000'
  ];
  
  // Add current host to allowed origins if available
  if (host) {
    allowedOrigins.push(`${protocol}://${host}`);
    allowedOrigins.push(`https://${host}`);
    allowedOrigins.push(`http://${host}`);
  }
  
  // Check Origin header first (more reliable)
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return next();
    }
  }
  
  // Fallback to Referer header if Origin is not present
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (allowedOrigins.includes(refererOrigin)) {
      return next();
    }
  }
  
  // Special handling for webhooks and external API calls
  const path = req.path;
  if (path === '/api/payment/webhook') {
    // Allow webhooks from external sources (MercadoPago)
    return next();
  }
  
  // Log the blocked request for debugging
  console.warn(`CSRF: Blocked request to ${method} ${path} from origin: ${origin || 'none'}, referer: ${referer || 'none'}`);
  
  return res.status(403).json({ 
    message: "CSRF protection: Invalid origin",
    code: "CSRF_ERROR"
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Simple login routes
  app.post('/api/simple-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await comparePassword(password, user.password || '');
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;
      
      res.json({ 
        success: true, 
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/simple-register', csrfProtection, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'client'
      });

      // Set session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = newUser;

      res.json({ 
        success: true, 
        user: sanitizeUser(newUser)
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/simple-logout', csrfProtection, (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/simple-auth/user', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Auth routes (original)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile update route
  app.put('/api/profile', isSimpleAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, email } = req.body;
      
      await storage.updateUserProfile(userId, { firstName, lastName, email });
      
      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Mercado Pago payment routes
  app.post('/api/payment/create-preference', isSimpleAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      // Validate Mercado Pago token
      const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpToken || mpToken.trim() === '') {
        console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não está configurado');
        return res.status(500).json({ 
          message: "Mercado Pago não está configurado. Entre em contato com o administrador.",
          code: "MP_TOKEN_NOT_CONFIGURED"
        });
      }

      // Validate request body
      const { amount, paymentMethod } = req.body;
      if (!amount || typeof amount !== 'number' || amount < 10) {
        console.error('❌ Valor inválido:', amount);
        return res.status(400).json({ 
          message: "Valor inválido. O valor mínimo é R$ 10,00",
          code: "INVALID_AMOUNT"
        });
      }

      if (!paymentMethod) {
        console.error('❌ Método de pagamento não especificado');
        return res.status(400).json({ 
          message: "Método de pagamento não especificado",
          code: "PAYMENT_METHOD_REQUIRED"
        });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('✅ Iniciando criação de preferência Mercado Pago');
      console.log('   - Usuário:', user.email);
      console.log('   - Valor:', amount);
      console.log('   - Método:', paymentMethod);

      const { MercadoPagoConfig, Preference } = await import('mercadopago');
      
      const client = new MercadoPagoConfig({
        accessToken: mpToken,
        options: { timeout: 5000 }
      });

      const preference = new Preference(client);

      // Get current host to build dynamic URLs with fallback
      // Mercado Pago requires public URLs (not localhost) in production mode
      const replitDomain = process.env.REPLIT_DOMAINS;
      let baseUrl: string;
      
      if (replitDomain) {
        // Use Replit public domain (HTTPS required for Mercado Pago)
        baseUrl = `https://${replitDomain}`;
      } else {
        // Fallback to request host (might be localhost in dev)
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
        baseUrl = `${protocol}://${host}`;
      }
      
      console.log('🌐 Base URL para Mercado Pago:', baseUrl);

      const preferenceData: any = {
        items: [
          {
            id: `credits_${Date.now()}`,
            title: `Créditos KeepLeads - R$ ${amount.toFixed(2)}`,
            unit_price: amount,
            quantity: 1,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: user.email || 'user@keepleads.com',
          first_name: user.firstName || 'Usuario',
          last_name: user.lastName || 'KeepLeads',
        },
        payment_methods: {
          excluded_payment_types: paymentMethod === 'credit_card' ? [{ id: 'ticket' }] : [],
          excluded_payment_methods: [],
          installments: 12,
        },
        back_urls: {
          success: `${baseUrl}/credits?status=success`,
          failure: `${baseUrl}/credits?status=failure`,
          pending: `${baseUrl}/credits?status=pending`,
        },
        auto_return: 'approved',
        external_reference: `user_${userId}_credits_${Date.now()}`,
        notification_url: `${baseUrl}/api/payment/webhook`,
      };

      console.log('📋 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
      
      const result = await preference.create({ body: preferenceData });
      
      console.log('✅ Preferência criada com sucesso:', result.id);
      
      res.json({
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
      });
    } catch (error: any) {
      console.error("❌ Erro ao criar preferência Mercado Pago:");
      console.error("   - Mensagem:", error.message);
      console.error("   - Código de status:", error.status);
      console.error("   - Resposta da API:", JSON.stringify(error.cause, null, 2));
      console.error("   - Stack:", error.stack);
      
      // Return detailed error to frontend
      res.status(500).json({ 
        message: error.message || "Erro ao criar preferência de pagamento",
        details: error.cause || error.response?.data || "Sem detalhes adicionais",
        code: "MP_CREATE_PREFERENCE_ERROR"
      });
    }
  });

  // Check Mercado Pago configuration
  app.get('/api/payment/config', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      const mpPublicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
      const isConfigured = mpToken && mpToken.trim() !== '' && mpPublicKey && mpPublicKey.trim() !== '';
      
      res.json({
        configured: isConfigured,
        publicKey: mpPublicKey || '',
        message: isConfigured 
          ? "Mercado Pago está configurado e pronto para uso" 
          : "Mercado Pago não está configurado. Configure MERCADO_PAGO_ACCESS_TOKEN e MERCADO_PAGO_PUBLIC_KEY."
      });
    } catch (error) {
      res.status(500).json({ 
        configured: false,
        publicKey: '',
        message: "Erro ao verificar configuração do Mercado Pago" 
      });
    }
  });

  // Process credit card payment (transparent checkout)
  app.post('/api/payment/process-card', isSimpleAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpToken || mpToken.trim() === '') {
        return res.status(500).json({ 
          message: "Mercado Pago não está configurado",
          code: "MP_TOKEN_NOT_CONFIGURED"
        });
      }

      const { amount, token, paymentMethodId, installments, payer } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount < 10) {
        return res.status(400).json({ 
          message: "Valor inválido. O valor mínimo é R$ 10,00",
          code: "INVALID_AMOUNT"
        });
      }

      if (!token || !paymentMethodId) {
        return res.status(400).json({ 
          message: "Dados do cartão inválidos",
          code: "INVALID_CARD_DATA"
        });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('💳 Processando pagamento com cartão');
      console.log('   - Usuário:', user.email);
      console.log('   - Valor:', amount);
      console.log('   - Parcelas:', installments);

      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      
      const client = new MercadoPagoConfig({
        accessToken: mpToken,
        options: { timeout: 5000 }
      });

      const payment = new Payment(client);

      const paymentData: any = {
        transaction_amount: amount,
        token,
        description: `Créditos KeepLeads - R$ ${amount.toFixed(2)}`,
        installments: installments || 1,
        payment_method_id: paymentMethodId,
        payer: {
          email: payer?.email || user.email,
          first_name: payer?.firstName || user.firstName,
          last_name: payer?.lastName || user.lastName,
        },
        external_reference: `user_${userId}_credits_${Date.now()}`,
      };

      console.log('📋 Criando pagamento:', JSON.stringify(paymentData, null, 2));

      const result = await payment.create({ body: paymentData });

      console.log('✅ Pagamento criado:', result.id, 'Status:', result.status);

      // If payment is approved, add credits immediately
      if (result.status === 'approved') {
        const newBalance = addCredits(user.credits, amount);
        await storage.updateUserCredits(userId, newBalance);
        
        await storage.addCreditTransaction({
          userId,
          type: 'deposit',
          amount: amount.toString(),
          description: `Depósito via Mercado Pago - Cartão de Crédito`,
          balanceBefore: user.credits,
          balanceAfter: newBalance,
          paymentMethod: 'credit_card',
          paymentId: result.id?.toString() || null,
        });
      }

      res.json({
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        approved: result.status === 'approved'
      });
    } catch (error: any) {
      console.error("❌ Erro ao processar pagamento com cartão:", error);
      console.error("   - Mensagem:", error.message);
      console.error("   - Causa:", JSON.stringify(error.cause, null, 2));
      
      res.status(500).json({ 
        message: error.message || "Erro ao processar pagamento",
        details: error.cause || {},
        code: "CARD_PAYMENT_ERROR"
      });
    }
  });

  // Create PIX payment (transparent checkout)
  app.post('/api/payment/create-pix', isSimpleAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpToken || mpToken.trim() === '') {
        return res.status(500).json({ 
          message: "Mercado Pago não está configurado",
          code: "MP_TOKEN_NOT_CONFIGURED"
        });
      }

      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount < 10) {
        return res.status(400).json({ 
          message: "Valor inválido. O valor mínimo é R$ 10,00",
          code: "INVALID_AMOUNT"
        });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('📱 Criando pagamento PIX');
      console.log('   - Usuário:', user.email);
      console.log('   - Valor:', amount);

      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      
      const client = new MercadoPagoConfig({
        accessToken: mpToken,
        options: { timeout: 5000 }
      });

      const payment = new Payment(client);

      const paymentData: any = {
        transaction_amount: amount,
        description: `Créditos KeepLeads - R$ ${amount.toFixed(2)}`,
        payment_method_id: 'pix',
        payer: {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        external_reference: `user_${userId}_credits_${Date.now()}`,
      };

      const result = await payment.create({ body: paymentData });

      console.log('✅ Pagamento PIX criado:', result.id);
      console.log('   - QR Code:', result.point_of_interaction?.transaction_data?.qr_code ? 'Sim' : 'Não');

      res.json({
        paymentId: result.id,
        status: result.status,
        qrCode: result.point_of_interaction?.transaction_data?.qr_code || '',
        qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64 || '',
        ticketUrl: result.point_of_interaction?.transaction_data?.ticket_url || ''
      });
    } catch (error: any) {
      console.error("❌ Erro ao criar pagamento PIX:", error);
      console.error("   - Mensagem:", error.message);
      console.error("   - Causa:", JSON.stringify(error.cause, null, 2));
      
      res.status(500).json({ 
        message: error.message || "Erro ao criar pagamento PIX",
        details: error.cause || {},
        code: "PIX_PAYMENT_ERROR"
      });
    }
  });

  // Get payment status
  app.get('/api/payment/status/:paymentId', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!mpToken || mpToken.trim() === '') {
        return res.status(500).json({ 
          message: "Mercado Pago não está configurado",
          code: "MP_TOKEN_NOT_CONFIGURED"
        });
      }

      const { paymentId } = req.params;

      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      
      const client = new MercadoPagoConfig({
        accessToken: mpToken,
        options: { timeout: 5000 }
      });

      const payment = new Payment(client);
      const result = await payment.get({ id: paymentId });

      // If payment just got approved, add credits
      if (result.status === 'approved') {
        const externalReference = result.external_reference;
        const userId = externalReference?.split('_')[1];
        const amount = result.transaction_amount;
        
        if (userId && userId === req.session.userId && amount) {
          const user = await storage.getUser(userId);
          if (user) {
            // Check if transaction already exists to avoid duplicates
            const transactions = await storage.getUserTransactions(userId);
            const existingTx = transactions.find(tx => tx.paymentId === paymentId);
            
            if (!existingTx) {
              const newBalance = addCredits(user.credits, amount);
              await storage.updateUserCredits(userId, newBalance);
              
              // Identify payment method for better description
              const paymentType = result.payment_method?.type || 'desconhecido';
              const paymentMethodId = result.payment_method?.id || '';
              let paymentDescription = 'Depósito via Mercado Pago';
              
              if (paymentType === 'credit_card' || paymentType === 'debit_card') {
                paymentDescription = 'Depósito via Mercado Pago - Cartão de Crédito';
              } else if (paymentType === 'pix' || paymentMethodId === 'pix') {
                paymentDescription = 'Depósito via Mercado Pago - PIX';
              } else if (paymentType === 'ticket') {
                paymentDescription = 'Depósito via Mercado Pago - Boleto';
              }
              
              await storage.addCreditTransaction({
                userId,
                type: 'deposit',
                amount: amount.toString(),
                description: paymentDescription,
                balanceBefore: user.credits,
                balanceAfter: newBalance,
                paymentMethod: result.payment_method?.type || null,
                paymentId: paymentId,
              });
              
              console.log('✅ Créditos adicionados após confirmação do pagamento:', paymentId);
            }
          }
        }
      }

      res.json({
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        approved: result.status === 'approved'
      });
    } catch (error: any) {
      console.error("❌ Erro ao consultar status do pagamento:", error);
      res.status(500).json({ 
        message: error.message || "Erro ao consultar pagamento",
        code: "PAYMENT_STATUS_ERROR"
      });
    }
  });

  // Webhook to handle payment notifications
  app.post('/api/payment/webhook', async (req, res) => {
    try {
      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
        options: { timeout: 5000 }
      });

      const payment = new Payment(client);
      
      const { type, data } = req.body;
      
      if (type === 'payment' && data?.id) {
        const paymentInfo = await payment.get({ id: data.id });
        
        if (paymentInfo.status === 'approved') {
          const externalReference = paymentInfo.external_reference;
          const userId = externalReference?.split('_')[1];
          const amount = paymentInfo.transaction_amount;
          
          if (userId && amount) {
            const user = await storage.getUser(userId);
            if (user) {
              // Check if transaction already exists to avoid duplicates
              const transactions = await storage.getUserTransactions(userId);
              const existingTx = transactions.find(tx => tx.paymentId === data.id);
              
              if (!existingTx) {
                const newBalance = addCredits(user.credits, amount);
                
                // Update user credits
                await storage.updateUserCredits(userId, newBalance);
                
                // Identify payment method for better description
                const paymentType = paymentInfo.payment_method?.type || 'desconhecido';
                const paymentMethodId = paymentInfo.payment_method?.id || '';
                let paymentDescription = 'Depósito via Mercado Pago';
                
                if (paymentType === 'credit_card' || paymentType === 'debit_card') {
                  paymentDescription = 'Depósito via Mercado Pago - Cartão de Crédito';
                } else if (paymentType === 'pix' || paymentMethodId === 'pix') {
                  paymentDescription = 'Depósito via Mercado Pago - PIX';
                } else if (paymentType === 'ticket') {
                  paymentDescription = 'Depósito via Mercado Pago - Boleto';
                }
                
                // Add transaction record
                await storage.addCreditTransaction({
                  userId,
                  type: 'deposit',
                  amount: amount.toString(),
                  description: paymentDescription,
                  balanceBefore: user.credits,
                  balanceAfter: newBalance,
                  paymentMethod: paymentInfo.payment_method?.type || null,
                  paymentId: paymentInfo.id?.toString() || null,
                });
                
                console.log('✅ Webhook: Créditos adicionados via webhook:', data.id);
              }
            }
          }
        }
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Manual credit addition (for development/testing)
  app.post('/api/credits/add', isSimpleAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { amount, paymentMethod, paymentId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newBalance = addCredits(user.credits, amount);
      
      // Update user credits
      await storage.updateUserCredits(userId, newBalance);
      
      // Add transaction record
      await storage.addCreditTransaction({
        userId,
        type: 'deposit',
        amount: amount.toString(),
        description: `Depósito via ${paymentMethod}`,
        balanceBefore: user.credits,
        balanceAfter: newBalance,
        paymentMethod,
        paymentId,
      });
      
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error adding credits:", error);
      res.status(500).json({ message: "Failed to add credits" });
    }
  });

  // Lead routes
  app.get('/api/leads', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        city: req.query.city as string,
        planType: req.query.planType as string,
        livesCount: req.query.livesCount as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        quality: req.query.quality as string,
        status: req.query.status as string,
      };
      
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/:id', async (req, res) => {
    try {
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Purchase lead
  app.post('/api/leads/:id/purchase', isSimpleAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const leadId = req.params.id;
      
      // Get lead details
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      if (lead.status !== "available") {
        return res.status(400).json({ message: "Lead is not available for purchase" });
      }
      
      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has sufficient credits
      const userCredits = parseCredits(user.credits);
      const leadPrice = parseCredits(lead.price);
      
      if (userCredits < leadPrice) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      
      // Create purchase
      const purchase = await storage.purchaseLead({
        leadId,
        userId,
        price: lead.price,
      });
      
      // Deduct credits
      const newBalance = subtractCredits(user.credits, leadPrice);
      await storage.updateUserCredits(userId, newBalance);
      
      // Add credit transaction
      await storage.addCreditTransaction({
        userId,
        type: "purchase",
        amount: `-${lead.price}`,
        description: `Lead purchase - ${lead.name}`,
        balanceBefore: user.credits,
        balanceAfter: newBalance,
      });
      
      // Send email notifications
      try {
        // Get company details for email
        const companies = await storage.getInsuranceCompanies();
        const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
          id: lead.insuranceCompanyId || '',
          name: lead.insuranceCompanyId || '',
          color: "#7C3AED"
        };
        
        // Update user object with new balance for email
        const updatedUser = { 
          ...user, 
          credits: newBalance,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        };
        
        // Convert lead to email-compatible format
        const emailCompatibleLead = {
          ...lead,
          age: lead.age || 30,
          insuranceCompanyId: lead.insuranceCompanyId || '',
          budgetMin: lead.budgetMin || '',
          budgetMax: lead.budgetMax || '',
          campaign: lead.campaign || '',
          notes: lead.notes || '',
          income: lead.income || '3000.00',
          planType: lead.planType || 'individual',
          category: lead.category || 'health_insurance',
          quality: lead.quality || 'silver',
          status: lead.status || 'available',
          availableLives: lead.availableLives || 1,
          createdAt: lead.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: lead.updatedAt?.toISOString() || new Date().toISOString()
        };
        
        // Send notification to user (async, don't wait)
        sendLeadPurchaseNotification(updatedUser, emailCompatibleLead, company).catch(error => {
          console.error('Failed to send user email notification:', error);
        });
        
        // Send notification to admin (async, don't wait)
        sendAdminPurchaseNotification(updatedUser, emailCompatibleLead, company).catch(error => {
          console.error('Failed to send admin email notification:', error);
        });
      } catch (emailError) {
        console.error('Error preparing email notifications:', emailError);
        // Don't fail the purchase if email fails
      }
      
      res.json(purchase);
    } catch (error) {
      console.error("Error purchasing lead:", error);
      res.status(500).json({ message: "Failed to purchase lead" });
    }
  });

  // Get user's purchased leads
  app.get('/api/my-leads', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const purchases = await storage.getUserPurchases(userId);
      
      // Get lead details for each purchase and merge them
      const purchasesWithLeads = await Promise.all(
        purchases.map(async (purchase) => {
          const lead = await storage.getLeadById(purchase.leadId);
          if (!lead) {
            return null;
          }
          // Merge purchase info with lead data
          return {
            ...lead,
            price: purchase.price,
            purchasedAt: purchase.purchasedAt,
            status: purchase.status || 'active',
          };
        })
      );
      
      // Filter out any null values (leads that weren't found)
      const validPurchases = purchasesWithLeads.filter(p => p !== null);
      
      res.json(validPurchases);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchased leads" });
    }
  });

  // Credit routes
  app.post('/api/credits/add', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { amount, paymentMethod, paymentId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newBalance = addCredits(user.credits, amount);
      await storage.updateUserCredits(userId, newBalance);
      
      await storage.addCreditTransaction({
        userId,
        type: "deposit",
        amount: amount.toFixed(2),
        description: `Credit deposit via ${paymentMethod}`,
        balanceBefore: user.credits,
        balanceAfter: newBalance,
        paymentMethod,
        paymentId,
      });
      
      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error adding credits:", error);
      res.status(500).json({ message: "Failed to add credits" });
    }
  });

  app.get('/api/transactions', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Insurance company routes
  app.get('/api/insurance-companies', async (req, res) => {
    try {
      const companies = await storage.getInsuranceCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
      res.status(500).json({ message: "Failed to fetch insurance companies" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(user => sanitizeUser(user));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/users', requireAdmin, csrfProtection, async (req: any, res) => {
    try {
      
      const { email, password, firstName, lastName, role, credits } = req.body;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password securely
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        credits: credits || "0",
      });
      
      res.json(sanitizeUser(newUser));
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user (admin only)
  app.put('/api/admin/users/:id', requireAdmin, csrfProtection, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      
      const { email, firstName, lastName, role, credits } = req.body;
      
      // Check if target user exists
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(targetUserId, {
        email: email || targetUser.email,
        firstName: firstName || targetUser.firstName,
        lastName: lastName || targetUser.lastName,
        role: role || targetUser.role,
        credits: credits !== undefined ? credits : targetUser.credits,
      });
      
      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get('/api/admin/stats', requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin lead management routes
  app.get('/api/admin/leads', requireAdmin, async (req: any, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      res.json(allLeads);
    } catch (error) {
      console.error("Error fetching admin leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post('/api/admin/leads', requireAdmin, csrfProtection, async (req: any, res) => {
    try {
      console.log("Received lead data:", JSON.stringify(req.body, null, 2));
      
      const validatedData = insertLeadSchema.parse(req.body);
      console.log("Validated lead data:", JSON.stringify(validatedData, null, 2));
      
      const lead = await storage.createLead(validatedData);
      console.log("Lead created successfully:", lead.id);
      
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      
      res.status(500).json({ message: "Erro ao criar lead. Verifique os dados e tente novamente." });
    }
  });

  app.put('/api/admin/leads/:id', requireAdmin, csrfProtection, async (req: any, res) => {
    try {
      console.log("Updating lead:", req.params.id, JSON.stringify(req.body, null, 2));
      
      const validatedData = insertLeadSchema.parse(req.body);
      console.log("Validated data - quality:", validatedData.quality, "status:", validatedData.status);
      
      const lead = await storage.updateLead(req.params.id, validatedData);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead não encontrado" });
      }
      
      console.log("Lead updated successfully - quality:", lead.quality, "status:", lead.status);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      
      res.status(500).json({ message: "Erro ao atualizar lead. Verifique os dados e tente novamente." });
    }
  });

  app.delete('/api/admin/leads/:id', requireAdmin, csrfProtection, async (req: any, res) => {
    try {
      
      const success = await storage.deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Integration settings routes
  app.get('/api/admin/integrations', requireAdmin, async (req: any, res) => {
    try {
      
      const settings = {
        n8nWebhookUrl: "",
        n8nEnabled: false,
        kommoCrmApiKey: "",
        kommoCrmEnabled: false,
        mercadoPagoAccessToken: "",
        mercadoPagoEnabled: false,
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching integration settings:", error);
      res.status(500).json({ message: "Failed to fetch integration settings" });
    }
  });

  app.post('/api/admin/integrations', requireAdmin, csrfProtection, async (req: any, res) => {
    try {
      
      res.json({ message: "Integration settings saved successfully" });
    } catch (error) {
      console.error("Error saving integration settings:", error);
      res.status(500).json({ message: "Failed to save integration settings" });
    }
  });

  app.post('/api/admin/integrations/test-webhook', requireAdmin, async (req: any, res) => {
    try {
      
      const { url } = req.body;
      
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: "Test webhook from KeepLeads"
      };
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload),
        });
        
        if (response.ok) {
          res.json({ message: "Webhook tested successfully" });
        } else {
          res.status(400).json({ message: `Webhook test failed: ${response.statusText}` });
        }
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        res.status(400).json({ message: `Webhook test failed: ${errorMessage}` });
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      res.status(500).json({ message: "Failed to test webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
