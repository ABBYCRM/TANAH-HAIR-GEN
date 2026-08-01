// Server entry point. Minimal: serves the static UI, mounts the API
// router, listens on the port DO App Platform expects (8080).
// One env var matters: GEMINI_API_KEY. If it's not set, the API
// still works for /api/health, /api/presets, and /api/parametric;
// the AI endpoints return a 503 explaining how to configure the key.

import express from 'express';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApi } from './api.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const publicRoot = resolve(__dirname, 'static');

const port = Number(process.env.PORT) || 8080;
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

// Minimal security headers. CSP is loose because the UI is the only
// thing the browser executes; we allow inline styles for the demo UI.
app.use((_req, res, next) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('permissions-policy', 'camera=(self), microphone=(), geolocation=()');
  next();
});

app.use('/api', buildApi({ apiKey, model }));
app.use(express.static(publicRoot, { extensions: ['html'], index: 'index.html', maxAge: '1h' }));

// Always serve the UI on / (and any unmatched path) so deep links
// into the test page work.
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(resolve(publicRoot, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  const aiStatus = apiKey ? `AI: ${model}` : 'AI: NOT CONFIGURED (set GEMINI_API_KEY)';
  console.log(`TANAH-HAIR-GEN listening on http://0.0.0.0:${port}  [${aiStatus}]`);
});
