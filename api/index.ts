import express from "express";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from "../server/routes.js";

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Add JSON and URL-encoded body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize server promise
let initialized = false;

async function initServer() {
  if (!initialized) {
    console.log('Initializing Vercel handler...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
    
    await registerRoutes(app);
    initialized = true;
    console.log('✓ Vercel handler initialized with all routes');
  }
}

// Export as Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure environment variables are set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not set!');
      return res.status(500).json({ 
        message: 'Database configuration error',
        error: 'DATABASE_URL environment variable is not set'
      });
    }

    await initServer();
    
    // Remove /api prefix for Express routing
    const originalUrl = req.url || '/';
    (req as any).url = originalUrl.replace(/^\/api/, '') || '/';
    
    console.log('Request:', req.method, originalUrl, '->', (req as any).url);
    
    return app(req as any, res as any);
  } catch (error) {
    console.error('Handler error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}
