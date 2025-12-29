import 'dotenv/config';
import express from "express";
import { registerRoutes } from "../server/routes";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Add JSON and URL-encoded body parsing middleware with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize server promise
let initialized = false;

async function initServer() {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
}

// Export as Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initServer();
  
  // Convert Vercel request to Express request format
  (req as any).url = req.url?.replace(/^\/api/, '') || '/';
  
  return app(req as any, res as any);
}
