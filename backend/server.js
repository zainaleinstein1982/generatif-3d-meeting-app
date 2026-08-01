/**
 * MeshForge backend — a thin, secure proxy in front of the Replicate API.
 *
 * Why this exists:
 *   1. api.replicate.com does not send CORS headers, so a browser cannot call
 *      it directly from a webapp running on another origin.
 *   2. Even if it did, putting your REPLICATE_API_TOKEN in frontend code
 *      would let anyone steal it from "view source".
 *
 * This server holds the token server-side and exposes a small same-purpose
 * API that the MeshForge frontend calls instead.
 *
 * Run locally:
 *   cp .env.example .env   # then paste your token in
 *   npm install
 *   npm start
 *
 * Deploy: Render, Railway, Fly.io, a VPS, etc. all work — see README.md.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 8787;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim());

if (!REPLICATE_API_TOKEN) {
  console.error(
    '\n[meshforge-backend] Missing REPLICATE_API_TOKEN.\n' +
      'Copy .env.example to .env and paste your token from https://replicate.com/account/api-tokens\n'
  );
  process.exit(1);
}

const REPLICATE_BASE = 'https://api.replicate.com/v1';

/**
 * Model registry.
 *
 * IMPORTANT: Replicate model input schemas change over time and differ
 * per model. The field names below (prompt/image/seed/...) are the
 * commonly-used defaults for these models as of writing, but you should
 * double-check the "API" tab on each model's Replicate page before relying
 * on them: https://replicate.com/<owner>/<model>/api
 *
 * The frontend lets the user see and edit the raw JSON `input` object that
 * gets sent, so a schema mismatch is a quick fix in the UI — nothing is
 * hard-coded past this registry.
 */
const MODELS = {
  'hunyuan-3.1': {
    slug: 'tencent/hunyuan-3d-3.1',
    label: 'Hunyuan3D 3.1 (Tencent) — text + image, high quality',
    supports: ['text', 'image'],
    defaultInput: {
      text: (prompt) => ({ prompt, face_count: 500000, should_texture: true }),
      image: (imageDataUri) => ({
        image: imageDataUri,
        face_count: 500000,
        should_texture: true,
      }),
    },
  },
  'hunyuan-2-fast': {
    slug: 'prunaai/hunyuan3d-2',
    label: 'Hunyuan3D-2 (PrunaAI, optimized) — fast, image-focused',
    supports: ['image'],
    defaultInput: {
      image: (imageDataUri) => ({ image: imageDataUri, texture: true }),
    },
  },
  trellis: {
    slug: 'firtoz/trellis',
    label: 'TRELLIS (Microsoft, via firtoz) — image to 3D',
    supports: ['image'],
    defaultInput: {
      image: (imageDataUri) => ({ images: [imageDataUri], texture_size: 2048 }),
    },
  },
  'trellis-2': {
    slug: 'fishwowater/trellis2',
    label: 'TRELLIS.2 4B (Microsoft) — image to 3D, PBR materials',
    supports: ['image'],
    defaultInput: {
      image: (imageDataUri) => ({ image: imageDataUri, texture_size: 2048 }),
    },
  },
};

/**
 * Vision models used by the "Opsi 2 · Otomatis" pipeline in the Text→3D tab.
 * Flow: image -> (optional bg removal) -> vision model turns the image into
 * an optimized text-to-3D prompt -> that prompt is fed into MODELS above.
 */
const VISION_MODELS = {
  moondream2: { slug: 'lucataco/moondream2', label: 'Moondream2 — cepat & murah' },
  'gpt-5.4': { slug: 'openai/gpt-5.4', label: 'GPT-5.4 Vision — lebih detail, lebih mahal' },
};

const BG_REMOVER_SLUG = '851-labs/background-remover';

const VISION_INSTRUCTION = `Look carefully at this image and identify the main object: its type, shape, proportions, material, color, surface texture, and lighting/style. Then write ONE single optimized prompt (in English, 1-3 sentences) for a text-to-3D AI generator, in this style:

"Generate a highly detailed 3D model of a modern white ceramic coffee mug with glossy material, smooth edges, realistic proportions, PBR texture, optimized topology, centered object, watertight mesh, 4K texture, game-ready."

Respond with ONLY the final prompt sentence — no preamble, no explanation, no quotation marks.`;

function extractText(output) {
  if (output == null) return null;
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return output.join('');
  if (typeof output === 'object' && typeof output.text === 'string') return output.text;
  return null;
}

const app = express();
app.use(express.json({ limit: '25mb' })); // images arrive as base64 data URIs
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        ALLOWED_ORIGINS.includes('*') ||
        !origin ||
        ALLOWED_ORIGINS.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed`));
    },
  })
);

function replicateHeaders() {
  return {
    Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

// List available models + which modes they support (frontend uses this to
// populate the dropdowns instead of hard-coding model names client-side).
app.get('/api/models', (_req, res) => {
  const list = Object.entries(MODELS).map(([key, m]) => ({
    key,
    label: m.label,
    supports: m.supports,
  }));
  res.json({ models: list });
});

// List vision models available for the "Opsi 2 · Otomatis" pipeline.
app.get('/api/vision-models', (_req, res) => {
  const list = Object.entries(VISION_MODELS).map(([key, m]) => ({ key, label: m.label }));
  res.json({ models: list });
});

// Step 1 (optional) of the auto pipeline: remove the background from a
// reference image before analysis, so the vision model focuses on the
// subject. Uses Prefer:wait so simple cases return in one round trip; if the
// model takes longer than the wait window, the raw (still-running)
// prediction is returned and the frontend polls /api/predictions/:id.
app.post('/api/remove-background', async (req, res) => {
  try {
    const { image } = req.body || {};
    if (!image) return res.status(400).json({ error: 'image (data URI or URL) is required' });

    const r = await fetch(`${REPLICATE_BASE}/models/${BG_REMOVER_SLUG}/predictions`, {
      method: 'POST',
      headers: { ...replicateHeaders(), Prefer: 'wait=55' },
      body: JSON.stringify({ input: { image } }),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.detail || 'Replicate request failed', raw: data });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Step 2-3 of the auto pipeline: a vision model looks at the (optionally
// background-removed) image and writes an optimized text-to-3D prompt.
// The frontend then drops that prompt straight into the normal
// /api/generate (mode: 'text') call — no separate "image mode" model needed.
app.post('/api/vision-prompt', async (req, res) => {
  try {
    const { image, visionModel } = req.body || {};
    if (!image) return res.status(400).json({ error: 'image (data URI or URL) is required' });

    const modelKey = visionModel && VISION_MODELS[visionModel] ? visionModel : 'moondream2';
    const model = VISION_MODELS[modelKey];

    const r = await fetch(`${REPLICATE_BASE}/models/${model.slug}/predictions`, {
      method: 'POST',
      headers: { ...replicateHeaders(), Prefer: 'wait=55' },
      body: JSON.stringify({ input: { image, prompt: VISION_INSTRUCTION } }),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.detail || 'Replicate request failed', raw: data });
    }
    // Convenience field: pre-extracted plain text, if the prediction already
    // finished within the wait window. Frontend re-extracts itself after
    // polling if this is null (still running).
    res.json({ ...data, extractedText: extractText(data.output) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Kick off a generation. body: { modelKey, mode: 'text'|'image', prompt?, image?, input? }
// `input`, if provided, overrides the auto-built default input entirely —
// this is what the "advanced JSON" editor in the UI sends.
app.post('/api/generate', async (req, res) => {
  try {
    const { modelKey, mode, prompt, image, input } = req.body || {};
    const model = MODELS[modelKey];
    if (!model) {
      return res.status(400).json({ error: `Unknown modelKey "${modelKey}"` });
    }
    if (!model.supports.includes(mode)) {
      return res
        .status(400)
        .json({ error: `Model "${modelKey}" does not support mode "${mode}"` });
    }

    let finalInput;
    if (input && typeof input === 'object') {
      finalInput = input;
    } else if (mode === 'text') {
      if (!prompt) return res.status(400).json({ error: 'prompt is required for text mode' });
      finalInput = model.defaultInput.text(prompt);
    } else {
      if (!image) return res.status(400).json({ error: 'image (data URI) is required for image mode' });
      finalInput = model.defaultInput.image(image);
    }

    const r = await fetch(`${REPLICATE_BASE}/models/${model.slug}/predictions`, {
      method: 'POST',
      headers: replicateHeaders(),
      body: JSON.stringify({ input: finalInput }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.detail || 'Replicate request failed', raw: data });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Poll prediction status. Frontend calls this every ~2s until status is
// "succeeded" | "failed" | "canceled".
app.get('/api/predictions/:id', async (req, res) => {
  try {
    const r = await fetch(`${REPLICATE_BASE}/predictions/${req.params.id}`, {
      headers: replicateHeaders(),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.detail || 'Replicate request failed', raw: data });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Cancel a running prediction.
app.post('/api/predictions/:id/cancel', async (req, res) => {
  try {
    const r = await fetch(`${REPLICATE_BASE}/predictions/${req.params.id}/cancel`, {
      method: 'POST',
      headers: replicateHeaders(),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[meshforge-backend] listening on :${PORT}`);
});
