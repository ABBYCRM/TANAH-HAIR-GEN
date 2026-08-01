// API layer for the hair-transplant image generator.
// One Express router. Endpoints:
//   GET  /api/health         — liveness check (DO health check target)
//   GET  /api/presets        — full parameter catalog
//   POST /api/generate       — single AI image generation
//   POST /api/variants       — 3 looks at the same params
//   POST /api/multi-view     — 4 perspectives (front/top/left/right)
//   POST /api/parametric     — deterministic SVG fallback (no AI)
//
// All endpoints accept JSON unless noted. The /api/generate endpoint
// also accepts multipart/form-data with a 'photo' file field for
// direct file upload (the test UI uses this). Identity-preservation
// prompt engineering is in gemini.mjs.

import express from 'express';
import multer from 'multer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildEditPrompt, sanitizeParams, assertSafe, callGemini,
  GEMINI_MODELS, MODEL_DEFAULT, VIEW_PROSE
} from './gemini.mjs';
import {
  HAIRLINE_PRESETS, ZONE_PRESETS, LENGTH_PRESETS, COLOR_PRESETS,
  CURL_PRESETS, FULLNESS_PRESETS, TECHNIQUE_PRESETS, SESSION_PRESETS,
  GRAFT_SCENARIOS, VIEW_CATALOG
} from './presets.mjs';
import { watermarkedImageDataUrl } from './watermark.mjs';
import { renderParametricSvg } from './parametric.mjs';
import { randomId } from './security.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const assetRoot = path.resolve(__dirname, 'assets');
const publicRoot = path.resolve(__dirname, 'static');

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;  // 12 MB
const ALLOWED_PHOTO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PHOTO_BYTES } });

function sendProblem(res, status, code, title, detail) {
  res.status(status).type('application/problem+json').send({
    type: `about:blank`,
    title, status, code, detail: detail || title
  });
}

// Load the bundled sample photo once at boot, base64-encode it, and
// reuse it for requests that don't include their own photo.
let SAMPLE_PHOTO_BASE64 = null;
let SAMPLE_PHOTO_MIME = 'image/webp';
async function loadSamplePhoto() {
  try {
    const buf = await readFile(path.join(assetRoot, 'sample-patient.webp'));
    SAMPLE_PHOTO_BASE64 = buf.toString('base64');
    SAMPLE_PHOTO_MIME = 'image/webp';
  } catch {
    SAMPLE_PHOTO_BASE64 = null;
  }
}
loadSamplePhoto();

// Pull the photo + parameters from a request, regardless of whether
// the caller used JSON (base64 photo) or multipart (file upload).
async function extractInputs(req) {
  if (req.is('multipart/form-data') || req.is('application/x-www-form-urlencoded')) {
    const photo = req.file;
    if (photo) {
      if (!ALLOWED_PHOTO_MIME.has(photo.mimetype)) {
        const err = new Error(`Unsupported photo MIME type: ${photo.mimetype}. Use JPEG, PNG, or WebP.`);
        err.status = 415; throw err;
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        const err = new Error(`Photo is larger than ${MAX_PHOTO_BYTES / 1024 / 1024} MB.`);
        err.status = 413; throw err;
      }
      return {
        photoBase64: photo.buffer.toString('base64'),
        photoMime: photo.mimetype,
        params: sanitizeParams(req.body || {})
      };
    }
    return {
      photoBase64: SAMPLE_PHOTO_BASE64,
      photoMime: SAMPLE_PHOTO_MIME,
      params: sanitizeParams(req.body || {})
    };
  }
  const body = req.body || {};
  if (body.photoBase64) {
    return {
      photoBase64: body.photoBase64,
      photoMime: body.photoMime || 'image/jpeg',
      params: sanitizeParams(body.params || body)
    };
  }
  return {
    photoBase64: SAMPLE_PHOTO_BASE64,
    photoMime: SAMPLE_PHOTO_MIME,
    params: sanitizeParams(body.params || body)
  };
}

export function buildApi({ apiKey, model = MODEL_DEFAULT, fetchImpl = fetch }) {
  const router = express.Router();
  router.use(express.json({ limit: '15mb' }));
  router.use(express.urlencoded({ limit: '15mb', extended: true }));

  // ---- Health check ----
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'tanah-hair-gen',
      time: new Date().toISOString(),
      gemini: {
        configured: Boolean(apiKey),
        model,
        available: GEMINI_MODELS
      }
    });
  });

  // ---- Bundled sample photo (used by the test UI's default "before" image) ----
  router.get('/sample-photo', async (_req, res) => {
    try {
      const buf = await readFile(path.join(assetRoot, 'sample-patient.webp'));
      res.writeHead(200, { 'content-type': 'image/webp', 'cache-control': 'public, max-age=300' });
      res.end(buf);
    } catch (error) {
      if (error.code === 'ENOENT') return sendProblem(res, 404, 'SAMPLE_NOT_FOUND', 'Sample photo missing', 'The bundled sample photo is not present in the build.');
      throw error;
    }
  });

  // ---- Presets catalog ----
  router.get('/presets', (_req, res) => {
    res.json({
      hairlines: Object.values(HAIRLINE_PRESETS),
      zones: Object.values(ZONE_PRESETS),
      lengths: Object.values(LENGTH_PRESETS),
      colors: Object.values(COLOR_PRESETS),
      curls: Object.values(CURL_PRESETS),
      fullnesses: Object.values(FULLNESS_PRESETS),
      techniques: Object.values(TECHNIQUE_PRESETS),
      sessions: Object.values(SESSION_PRESETS),
      graftScenarios: Object.values(GRAFT_SCENARIOS),
      views: VIEW_CATALOG
    });
  });

  // ---- Single generate ----
  router.post('/generate', upload.single('photo'), async (req, res) => {
    try {
      const { photoBase64, photoMime, params } = await extractInputs(req);
      if (!photoBase64) return sendProblem(res, 503, 'NO_PHOTO', 'No photo available', 'Upload a photo or include photoBase64 in the JSON body.');
      const prompt = buildEditPrompt(params);
      assertSafe(prompt);
      const { image } = await callGemini({ apiKey, model, prompt, photoBase64, photoMime, fetchImpl });
      const watermarked = watermarkedImageDataUrl({ image, view: params.view });
      res.status(201).json({
        id: randomId(),
        model,
        view: params.view,
        outputDataUrl: watermarked,
        rawImageDataUrl: `data:${image.mimeType};base64,${image.data}`,
        params,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      const status = Number(err?.status) || 500;
      if (status >= 500) console.error('[generate]', err?.stack || err);
      return sendProblem(res, status, err?.code || 'GENERATION_FAILED', 'Generation failed', err?.message || 'The image generator failed.');
    }
  });

  // ---- 3 variants at the same parameters ----
  router.post('/variants', upload.single('photo'), async (req, res) => {
    try {
      const { photoBase64, photoMime, params } = await extractInputs(req);
      if (!photoBase64) return sendProblem(res, 503, 'NO_PHOTO', 'No photo available', 'Upload a photo or include photoBase64 in the JSON body.');
      const variants = ['conservative', 'balanced', 'restorative'];
      const artifacts = await Promise.all(variants.map(async (hairline) => {
        const variantParams = { ...params, hairline };
        const prompt = buildEditPrompt(variantParams);
        assertSafe(prompt);
        try {
          const { image } = await callGemini({ apiKey, model, prompt, photoBase64, photoMime, fetchImpl });
          return {
            hairline,
            outputDataUrl: watermarkedImageDataUrl({ image, view: variantParams.view }),
            rawImageDataUrl: `data:${image.mimeType};base64,${image.data}`,
            params: variantParams
          };
        } catch (error) {
          return { hairline, error: error?.message || 'Gemini failed', code: error?.code || 'GEMINI_FAILED' };
        }
      }));
      res.json({ variants: artifacts, params });
    } catch (err) {
      const status = Number(err?.status) || 500;
      if (status >= 500) console.error('[variants]', err?.stack || err);
      return sendProblem(res, status, err?.code || 'VARIANTS_FAILED', 'Variant generation failed', err?.message);
    }
  });

  // ---- 4 perspectives (front / top / left / right) ----
  router.post('/multi-view', upload.single('photo'), async (req, res) => {
    try {
      const { photoBase64, photoMime, params } = await extractInputs(req);
      if (!photoBase64) return sendProblem(res, 503, 'NO_PHOTO', 'No photo available', 'Upload a photo or include photoBase64 in the JSON body.');
      const concurrency = 2;
      const views = ['front', 'top', 'left', 'right'];
      const results = new Array(views.length);
      let cursor = 0;
      async function worker() {
        while (cursor < views.length) {
          const idx = cursor++;
          const view = views[idx];
          const viewParams = { ...params, view };
          const basePrompt = buildEditPrompt(viewParams);
          const viewPrompt = basePrompt + `\n- CAMERA: ${VIEW_PROSE[view] || ''}`;
          assertSafe(viewPrompt);
          try {
            const { image } = await callGemini({ apiKey, model, prompt: viewPrompt, photoBase64, photoMime, fetchImpl });
            results[idx] = {
              view,
              outputDataUrl: watermarkedImageDataUrl({ image, view }),
              rawImageDataUrl: `data:${image.mimeType};base64,${image.data}`,
              params: viewParams
            };
          } catch (error) {
            results[idx] = { view, error: error?.message || 'Gemini failed', code: error?.code || 'GEMINI_FAILED' };
          }
        }
      }
      await Promise.all(Array.from({ length: concurrency }, worker));
      res.json({ views: results, params, model });
    } catch (err) {
      const status = Number(err?.status) || 500;
      if (status >= 500) console.error('[multi-view]', err?.stack || err);
      return sendProblem(res, status, err?.code || 'MULTIVIEW_FAILED', 'Multi-view generation failed', err?.message);
    }
  });

  // ---- Deterministic SVG fallback (no AI) ----
  // Always returns. Use this for fast previews or when Gemini is down.
  router.post('/parametric', upload.single('photo'), async (req, res) => {
    try {
      const { photoBase64, photoMime, params } = await extractInputs(req);
      const seed = Number.isInteger(req.body?.seed) ? req.body.seed : undefined;
      const svg = renderParametricSvg({ params, photoBase64, photoMime, seed });
      const base64 = Buffer.from(svg).toString('base64');
      res.status(201).json({
        id: randomId(),
        // Echo model + view so the front-end meta line is consistent
        // with /api/generate (the UI shows the same fields for both paths).
        model: 'parametric-svg',
        view: params.view,
        outputDataUrl: `data:image/svg+xml;base64,${base64}`,
        seed: seed !== undefined ? seed : null,
        params: sanitizeParams(params),
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      const status = Number(err?.status) || 500;
      if (status >= 500) console.error('[parametric]', err?.stack || err);
      return sendProblem(res, status, 'PARAMETRIC_FAILED', 'Parametric render failed', err?.message);
    }
  });

  return router;
}
