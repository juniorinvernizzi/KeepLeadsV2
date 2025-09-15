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

// Proxy API requests to PHP server
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:5001',
  changeOrigin: false, // Keep original host
  secure: false,
  pathRewrite: {
    '^/api': '/api' // Keep /api prefix for PHP routes
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Backend service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req) => {
    // Forward all relevant headers
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    if (req.headers.origin) {
      proxyReq.setHeader('Origin', req.headers.origin);
    }
    if (req.headers['x-forwarded-for']) {
      proxyReq.setHeader('X-Forwarded-For', req.headers['x-forwarded-for']);
    }
    if (req.headers['x-forwarded-proto']) {
      proxyReq.setHeader('X-Forwarded-Proto', req.headers['x-forwarded-proto']);
    }
    if (req.headers['x-forwarded-host']) {
      proxyReq.setHeader('X-Forwarded-Host', req.headers['x-forwarded-host']);
    }
    // Set forwarded headers for PHP to detect correct protocol/host
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
    proxyReq.setHeader('X-Forwarded-Host', 'fc09caa2-6723-48de-ac2d-2e5743aa8b86-00-13sj9i4zh2zds.picard.replit.dev');
  }
}));

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

(async () => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup vite in development and serve static in production
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

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