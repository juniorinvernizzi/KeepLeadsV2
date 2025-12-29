import 'dotenv/config';
import express from "express";
import { registerRoutes } from "../server/routes";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();

// Add JSON and URL-encoded body parsing middleware with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize server promise
let initialized = false;
let initPromise: Promise<void> | null = null;

async function initServer() {
  if (!initialized && !initPromise) {
    initPromise = (async () => {
      try {
        console.log('🔄 Initializing Vercel serverless function...');
        await registerRoutes(app);
        initialized = true;
        console.log('✓ Serverless function initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize serverless function:', error);
        throw error;
      }
    })();
  }
  return initPromise;
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
