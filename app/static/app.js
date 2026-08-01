// ============================================================
// TANAH-HAIR-GEN — front-end controller
// Single-page UI for the focused image-generator microservice.
// Visual language harmonized with ABBYCRM/CLINICA-TANAH.
// ============================================================

// --- DOM refs ---
const form         = document.getElementById('gen-form');
const photoInput   = document.getElementById('photo-input');
const photoReset   = document.getElementById('photo-reset');
const useSample    = document.getElementById('use-sample');
const photoStatus  = document.getElementById('photo-status');
const before       = document.getElementById('before');
const photoEmpty   = document.getElementById('photo-empty');
const resultWrap   = document.getElementById('result-wrap');
const resultMeta   = document.getElementById('result-meta');
const status       = document.getElementById('ai-chip');
const modelChip    = document.getElementById('model-chip');
const densityInput = document.getElementById('density');
const densityValue = document.getElementById('density-value');
const hamburger    = document.getElementById('hamburger');
const topnav       = document.getElementById('topnav');

const fields = ['hairline', 'zone', 'length', 'color', 'curl', 'fullness', 'technique', 'sessions', 'graftScenario'];
const buttons = form.querySelectorAll('button[data-action]');

// --- State ---
let photoBase64 = null;
let photoMime   = null;
let presets     = null;

// ===========================================================
// Boot: load presets + health
// ===========================================================
(async function boot() {
  // Wire hamburger
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', open ? 'false' : 'true');
    topnav.hidden = open;
  });
  // Close menu on link tap (mobile UX)
  topnav.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      hamburger.setAttribute('aria-expanded', 'false');
      topnav.hidden = true;
    }
  });

  // Wire density label
  densityInput.addEventListener('input', () => {
    densityValue.textContent = Number(densityInput.value).toFixed(2);
  });

  // Wire photo controls
  photoInput.addEventListener('change', handlePhotoSelected);
  useSample.addEventListener('click', loadSamplePhoto);
  photoReset.addEventListener('click', clearPhoto);

  // Wire action buttons
  form.querySelector('[data-action=generate]').addEventListener('click', () => callApi('/api/generate', renderSingle));
  form.querySelector('[data-action=variants]').addEventListener('click', () => callApi('/api/variants', renderVariants));
  form.querySelector('[data-action=multi-view]').addEventListener('click', () => callApi('/api/multi-view', renderMultiView));
  form.querySelector('[data-action=parametric]').addEventListener('click', () => callApi('/api/parametric', renderSingle));

  // Initial health check
  try {
    const r = await fetch('/api/health');
    const h = await r.json();
    setHealth(h);
  } catch (e) {
    status.textContent = 'offline';
    status.className = 'chip chip-rose';
  }

  // Load presets + populate selects
  try {
    const r = await fetch('/api/presets');
    presets = await r.json();
    populateSelects();
  } catch (e) {
    showError('Failed to load parameter catalog. Is the service online?');
  }

  // Default: load sample photo so the user can press Generate immediately
  await loadSamplePhoto();
})();

// ===========================================================
// Health status
// ===========================================================
function setHealth(h) {
  if (h.gemini?.configured) {
    status.textContent = 'AI ready';
    status.className = 'chip chip-green';
  } else {
    status.textContent = 'offline';
    status.className = 'chip chip-rose';
  }
  if (h.gemini?.model) {
    modelChip.textContent = 'model: ' + h.gemini.model;
    modelChip.className = 'chip chip-slate';
  }
}

// ===========================================================
// Populate parameter selects
// ===========================================================
function populateSelects() {
  const cats = {
    hairline:      presets.hairlines,
    zone:          presets.zones,
    length:        presets.lengths,
    color:         presets.colors,
    curl:          presets.curls,
    fullness:      presets.fullnesses,
    technique:     presets.techniques,
    sessions:      presets.sessions,
    graftScenario: presets.graftScenarios
  };
  for (const id of fields) {
    const sel = document.getElementById(id);
    if (!sel || !cats[id]) continue;
    sel.innerHTML = cats[id].map(o =>
      `<option value="${escapeAttr(o.id)}">${escapeHtml(o.label)}</option>`
    ).join('');
  }
}

// ===========================================================
// Photo handling
// ===========================================================
async function loadSamplePhoto() {
  try {
    const r = await fetch('/api/sample-photo');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const blob = await r.blob();
    photoMime = blob.type || 'image/webp';
    photoBase64 = await blobToBase64(blob);
    showPhoto(photoBase64, photoMime);
    setPhotoStatus('sample', 'badge-blue');
  } catch (e) {
    setPhotoStatus('no photo', 'badge-slate');
  }
}

function handlePhotoSelected(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) { showError('Photo > 12 MB. Please pick a smaller image.'); return; }
  photoMime = file.type || 'image/jpeg';
  const reader = new FileReader();
  reader.onload = () => {
    photoBase64 = String(reader.result).split(',')[1];
    showPhoto(photoBase64, photoMime);
    setPhotoStatus('uploaded', 'badge-green');
  };
  reader.readAsDataURL(file);
}

function clearPhoto() {
  photoBase64 = null; photoMime = null;
  before.removeAttribute('src');
  photoEmpty.style.display = '';
  photoReset.hidden = true;
  photoInput.value = '';
  setPhotoStatus('no photo', 'badge-slate');
}

function showPhoto(b64, mime) {
  before.src = `data:${mime};base64,${b64}`;
  photoEmpty.style.display = 'none';
  photoReset.hidden = false;
}

function setPhotoStatus(text, badgeClass) {
  photoStatus.textContent = text;
  photoStatus.className = 'badge ' + badgeClass;
}

// ===========================================================
// API calls
// ===========================================================
function collectParams() {
  const params = {};
  for (const id of fields) {
    const el = document.getElementById(id);
    if (el) params[id] = el.value;
  }
  params.density = Number(densityInput.value);
  params.view = 'front';
  return params;
}

async function callApi(endpoint, renderFn) {
  if (!photoBase64) { showError('Upload a photo or use the sample first.'); return; }
  setBusy(true);
  const t0 = performance.now();
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photoBase64, photoMime, params: collectParams() })
    });
    const text = await r.text();
    if (!r.ok) {
      let err = text;
      try { err = JSON.parse(text).message || text; } catch {}
      throw new Error(`HTTP ${r.status}: ${err}`);
    }
    const body = JSON.parse(text);
    renderFn(body, performance.now() - t0);
  } catch (e) {
    showError(e.message || 'Request failed');
  } finally {
    setBusy(false);
  }
}

// ===========================================================
// Render functions
// ===========================================================
function renderSingle(body, ms) {
  const meta = `Model: ${body.model} · view: ${body.view} · ${(ms/1000).toFixed(1)}s · id: ${body.id}`;
  resultMeta.textContent = meta;
  resultMeta.className = 'badge badge-green';
  resultWrap.innerHTML = `<img class="result-image" src="${body.outputDataUrl}" alt="Generated preview"/>`;
  // Scroll into view on mobile
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderVariants(body, ms) {
  const ok = (body.variants || []).filter(v => !v.error).length;
  resultMeta.textContent = `${ok}/${(body.variants||[]).length} variants · ${(ms/1000).toFixed(1)}s`;
  resultMeta.className = 'badge badge-green';
  const cards = (body.variants || []).map(v => {
    if (v.error) {
      return `<figure class="variant-card error"><div class="placeholder" style="min-height:160px"><div class="placeholder-icon">!</div><div class="placeholder-text">${escapeHtml(v.error)}</div></div><figcaption><strong>${escapeHtml(v.hairline)}</strong><span>Failed</span></figcaption></figure>`;
    }
    return `<figure class="variant-card"><img src="${v.outputDataUrl}" alt="${escapeHtml(v.hairline)}"/><figcaption><strong>${escapeHtml(v.hairline)}</strong><span>${(ms/1000).toFixed(1)}s</span></figcaption></figure>`;
  }).join('');
  resultWrap.innerHTML = `<div class="variants-grid">${cards}</div>`;
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderMultiView(body, ms) {
  const ok = (body.views || []).filter(v => !v.error).length;
  resultMeta.textContent = `${ok}/${(body.views||[]).length} views · ${(ms/1000).toFixed(1)}s`;
  resultMeta.className = 'badge badge-green';
  const cards = (body.views || []).map(v => {
    if (v.error) {
      return `<figure class="variant-card error"><div class="placeholder" style="min-height:160px"><div class="placeholder-icon">!</div><div class="placeholder-text">${escapeHtml(v.error)}</div></div><figcaption><strong>${escapeHtml((v.view||'').toUpperCase())}</strong><span>Failed</span></figcaption></figure>`;
    }
    return `<figure class="variant-card"><img src="${v.outputDataUrl}" alt="${escapeHtml(v.view)}"/><figcaption><strong>${escapeHtml((v.view||'').toUpperCase())}</strong><span>${escapeHtml(v.model || 'gemini')}</span></figcaption></figure>`;
  }).join('');
  resultWrap.innerHTML = `<div class="multi-view-grid">${cards}</div>`;
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(msg) {
  resultMeta.textContent = 'error';
  resultMeta.className = 'badge badge-red';
  resultWrap.innerHTML = `<div class="placeholder" style="border-color: var(--rose-100); background: #fff5f5; color: var(--rose-700);"><div class="placeholder-icon">!</div><div class="placeholder-text">${escapeHtml(msg)}</div></div>`;
}

function setBusy(busy) {
  for (const btn of buttons) btn.disabled = busy;
  for (const btn of [photoReset, useSample]) btn.disabled = busy;
  if (busy) {
    resultMeta.textContent = 'rendering…';
    resultMeta.className = 'badge badge-yellow';
    resultWrap.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⏳</div><div class="placeholder-text">Gemini is analyzing the head shape and rendering the simulation. Typical time: 5–15 seconds.</div></div>`;
  }
}

// ===========================================================
// Helpers
// ===========================================================
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
