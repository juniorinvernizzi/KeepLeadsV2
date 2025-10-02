import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { spawn } from "child_process";
import path from "path";
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Start PHP server on internal port 5001
console.log("🔄 Starting PHP backend server on port 5001...");
const phpProcess = spawn("php", ["-S", "127.0.0.1:5001", "-t", "public"], {
  cwd: path.join(process.cwd(), "backend-php"),
  stdio: ["ignore", "pipe", "pipe"]
});

phpProcess.stdout?.on('data', (data) => {
  console.log(`[PHP] ${data.toString().trim()}`);
});

phpProcess.stderr?.on('data', (data) => {
  console.error(`[PHP Error] ${data.toString().trim()}`);
});

phpProcess.on("error", (err) => {
  console.error("❌ Failed to start PHP server:", err);
});

console.log("✅ PHP backend started on port 5001");

// Setup API proxy BEFORE Vite to intercept /api requests
app.use('/api', createProxyMiddleware({
    target: 'http://127.0.0.1:5001',
    changeOrigin: false,
    secure: false,
    pathRewrite: {
      '^/api': '' // Remove /api prefix
    },
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Backend service unavailable' });
      }
    },
    onProxyReq: (proxyReq, req) => {
      // Set Origin header for CSRF protection
      const origin = req.headers.origin || 'http://localhost:5000';
      proxyReq.setHeader('Origin', origin);
      
      // Forward cookies
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
      
      // Forward referer
      if (req.headers.referer) {
        proxyReq.setHeader('Referer', req.headers.referer);
      }
      
      // Set forwarded headers for PHP
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
      proxyReq.setHeader('X-Forwarded-Host', 'fc09caa2-6723-48de-ac2d-2e5743aa8b86-00-13sj9i4zh2zds.picard.replit.dev');
      
      console.log(`[Proxy] ${req.method} ${req.url} -> http://127.0.0.1:5001${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    }
  }));

(async () => {
  // Setup vite in development and serve static in production AFTER proxy
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Start Node.js server on port 5000
  const port = parseInt(process.env.PORT || '5000', 10);
  const server = app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.log("🚀 Frontend (Node.js) + Backend (PHP) running successfully!");
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    server.close();
    phpProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    server.close();
    phpProcess.kill('SIGTERM');
    process.exit(0);
  });
})();