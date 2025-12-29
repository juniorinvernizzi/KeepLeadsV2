import 'dotenv/config';
import express, { type Express } from "express";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setupAuth } from "../server/replitAuth";
import { storage } from "../server/storage";
import bcrypt from "bcrypt";
import crypto from "crypto";

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Add JSON and URL-encoded body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize server promise
let initialized = false;

// Extend Express session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
    user: any;
  }
}

// Secure password hashing functions
const SALT_ROUNDS = 12;

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    const bcryptMatch = await bcrypt.compare(password, hash);
    if (bcryptMatch) return true;
  } catch (e) {
    // Not a bcrypt hash, try SHA256
  }

  const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
  return sha256Hash === hash;
};

const sanitizeUser = (user: any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

async function initServer() {
  if (!initialized) {
    // Setup auth/session middleware
    await setupAuth(app);
    
    // Simple login route - handle both with and without /api prefix
    const loginHandler = async (req: any, res: any) => {
      try {
        console.log('Login attempt:', { email: req.body?.email, url: req.url });
        
        const { email, password } = req.body;

        if (!email || !password) {
          console.log('Missing credentials');
          return res.status(400).json({ message: "Email and password required" });
        }

        console.log('Looking up user:', email);
        const user = await storage.getUserByEmail(email);
        if (!user) {
          console.log('User not found:', email);
          return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('Verifying password for user:', user.id);
        const isPasswordValid = await comparePassword(
          password,
          user.password || "",
        );
        if (!isPasswordValid) {
          console.log('Invalid password for user:', user.id);
          return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('Password verified, setting session for user:', user.id);
        req.session.userId = user.id;
        req.session.user = user;
        
        console.log('Saving session...');
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Failed to save session" });
          }
          
          console.log('Session saved successfully for user:', user.id);
          return res.json({
            success: true,
            user: sanitizeUser(user),
          });
        });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
          message: "Login failed", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    };
    
    app.post("/simple-login", loginHandler);
    app.post("/api/simple-login", loginHandler);
    
    initialized = true;
    console.log('✓ Vercel handler initialized');
  }
}

// Export as Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initServer();
    
    // Convert Vercel request to Express request format
    (req as any).url = req.url?.replace(/^\/api/, '') || '/';
    
    return app(req as any, res as any);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
