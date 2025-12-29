import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Configure WebSocket only in Node.js environment (not in Vercel Edge)
if (typeof WebSocket === 'undefined') {
  try {
    const ws = await import('ws');
    neonConfig.webSocketConstructor = ws.default;
  } catch (error) {
    console.warn('⚠️ ws module not available, using native WebSocket');
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set! Please configure it in environment variables.');
  console.error('   The application will not work without a database connection.');
  // Don't throw to prevent serverless function crash, let routes handle the error
}

export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null as any;
  
export const db = process.env.DATABASE_URL
  ? drizzle({ client: pool, schema })
  : null as any;