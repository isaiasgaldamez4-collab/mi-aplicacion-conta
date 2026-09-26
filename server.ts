import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API router mounted on /api and root (for Vercel serverless rewrites)
app.use('/api', apiRouter);

// Serve static assets
app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));

// Export app for Vercel Serverless Function native support
export default app;

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite in middleware mode for local development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ContaSoftware-2TB] Backend & UI running at http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone HTTP server when not running in Vercel Serverless runtime
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}
