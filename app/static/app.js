// ============================================================
// TANAH-HAIR-GEN — front-end controller
// Single-page UI for the focused image-generator microservice.
// Visual language harmonized with ABBYCRM/CLINICA-TANAH.
// All user-facing strings flow through window.tanahI18n.t().
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
const modelName    = document.getElementById('model-name');
const densityInput = document.getElementById('density');
const densityValue = document.getElementById('density-value');
const hamburger    = document.getElementById('hamburger');
const topnav       = document.getElementById('topnav');

const fields = ['hairline', 'zone', 'length', 'color', 'curl', 'fullness', 'technique', 'sessions', 'graftScenario'];
const buttons = form.querySelectorAll('button[data-action]');

// Shortcuts to the i18n module
const i18n = window.tanahI18n;

// --- State ---
let photoBase64 = null;
let photoMime   = null;
let presets     = null;

// ===========================================================
// Boot: i18n + presets + health
// ===========================================================
window.tanahI18n.init();  // detect locale, apply translations, wire pills

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

  // Re-apply translations when the user switches language (preset options
  // need to be rebuilt because their visible labels are locale-specific).
  window.addEventListener('tanah-locale-change', () => {
    if (presets) populateSelects();
    refreshStaticMessages();
  });

  // Initial health check
  try {
    const r = await fetch('/api/health');
    const h = await r.json();
    setHealth(h);
  } catch (e) {
    setHealth(null);
  }

  // Load presets + populate selects
  try {
    const r = await fetch('/api/presets');
    presets = await r.json();
    populateSelects();
  } catch (e) {
    showError(i18n.t('err.noPresets'));
  }

  // Default: load sample photo so the user can press Generate immediately
  await loadSamplePhoto();
})();

// After a locale change, refresh the parts of the UI that hold
// runtime state (status chips, meta badge, error states).
function refreshStaticMessages() {
  if (status.textContent === i18n.t('chip.aiReady') || status.dataset.state === 'ready') {
    setHealth({ gemini: { configured: true, model: modelName.textContent } });
  } else if (status.dataset.state === 'offline') {
    setHealth(null);
  }
  if (photoStatus.dataset.state) {
    setPhotoStatus(photoStatus.dataset.state, photoStatus.dataset.badge);
  }
  if (resultMeta.dataset.state === 'error') {
    showError(resultMeta.dataset.lastError || i18n.t('err.generic'));
  }
}

// ===========================================================
// Health status
// ===========================================================
function setHealth(h) {
  if (h && h.gemini && h.gemini.configured) {
    status.textContent = i18n.t('chip.aiReady');
    status.className = 'chip chip-green';
    status.dataset.state = 'ready';
  } else {
    status.textContent = i18n.t('chip.offline');
    status.className = 'chip chip-rose';
    status.dataset.state = 'offline';
  }
  if (h && h.gemini && h.gemini.model) {
    modelName.textContent = h.gemini.model;
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
    const current = sel.value;  // preserve selection across locale changes
    sel.innerHTML = cats[id].map(o => {
      const label = presetLabel(catKeyFor(id), o.id) || o.label;
      return `<option value="${escapeAttr(o.id)}">${escapeHtml(label)}</option>`;
    }).join('');
    if (current && cats[id].some(o => o.id === current)) sel.value = current;
  }
}

// Map select id -> preset category key in the i18n table
function catKeyFor(selectId) {
  const map = {
    hairline: 'hairlines',
    zone: 'zones',
    length: 'lengths',
    color: 'colors',
    curl: 'curls',
    fullness: 'fullnesses',
    technique: 'techniques',
    sessions: 'sessions',
    graftScenario: 'graftScenarios'
  };
  return map[selectId] || selectId;
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
    setPhotoStatus('noPhoto', 'badge-slate');
  }
}

function handlePhotoSelected(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) { showError(i18n.t('err.tooLarge')); return; }
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
  setPhotoStatus('noPhoto', 'badge-slate');
}

function showPhoto(b64, mime) {
  before.src = `data:${mime};base64,${b64}`;
  photoEmpty.style.display = 'none';
  photoReset.hidden = false;
}

function setPhotoStatus(state, badgeClass) {
  photoStatus.textContent = i18n.t('photo.' + state);
  photoStatus.className = 'badge ' + badgeClass;
  photoStatus.dataset.state = state;
  photoStatus.dataset.badge = badgeClass;
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
  if (!photoBase64) { showError(i18n.t('err.noPhoto')); return; }
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
      let detail = text;
      try {
        const parsed = JSON.parse(text);
        detail = parsed.detail || parsed.title || text;
      } catch {}
      throw new Error(i18n.t('err.http', { status: r.status, detail: detail.slice(0, 200) }));
    }
    const body = JSON.parse(text);
    renderFn(body, performance.now() - t0);
  } catch (e) {
    showError(e.message || i18n.t('err.generic'));
  } finally {
    setBusy(false);
  }
}

// ===========================================================
// Render functions
// ===========================================================
function renderSingle(body, ms) {
  const modelLabel = body.model || 'svg';
  const viewLabel = body.view || 'front';
  const meta = i18n.t('result.modelMeta', { model: modelLabel, view: viewLabel, ms: (ms/1000).toFixed(1), id: body.id });
  setResultMeta(meta, 'badge-green', null);
  resultWrap.innerHTML = `<img class="result-image" src="${body.outputDataUrl}" alt="${escapeAttr(i18n.t('result.altPreview'))}"/>`;
  // Scroll into view on mobile
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderVariants(body, ms) {
  const total = (body.variants || []).length;
  const ok = (body.variants || []).filter(v => !v.error).length;
  setResultMeta(i18n.t('result.variantsMeta', { ok, total, ms: (ms/1000).toFixed(1) }), 'badge-green', null);
  const failedLabel = i18n.t('result.failed');
  const cards = (body.variants || []).map(v => {
    if (v.error) {
      const hairLabel = i18n.presetLabel('hairlines', v.hairline) || v.hairline;
      return `<figure class="variant-card error"><div class="placeholder" style="min-height:160px"><div class="placeholder-icon">!</div><div class="placeholder-text">${escapeHtml(v.error)}</div></div><figcaption><strong>${escapeHtml(hairLabel)}</strong><span>${escapeHtml(failedLabel)}</span></figcaption></figure>`;
    }
    const hairLabel = i18n.presetLabel('hairlines', v.hairline) || v.hairline;
    return `<figure class="variant-card"><img src="${v.outputDataUrl}" alt="${escapeAttr(hairLabel)}"/><figcaption><strong>${escapeHtml(hairLabel)}</strong><span>${(ms/1000).toFixed(1)}s</span></figcaption></figure>`;
  }).join('');
  resultWrap.innerHTML = `<div class="variants-grid">${cards}</div>`;
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderMultiView(body, ms) {
  const total = (body.views || []).length;
  const ok = (body.views || []).filter(v => !v.error).length;
  setResultMeta(i18n.t('result.multiviewMeta', { ok, total, ms: (ms/1000).toFixed(1) }), 'badge-green', null);
  const failedLabel = i18n.t('result.failed');
  const cards = (body.views || []).map(v => {
    if (v.error) {
      const viewLabel = i18n.presetLabel('views', v.view) || (v.view || '').toUpperCase();
      return `<figure class="variant-card error"><div class="placeholder" style="min-height:160px"><div class="placeholder-icon">!</div><div class="placeholder-text">${escapeHtml(v.error)}</div></div><figcaption><strong>${escapeHtml(viewLabel)}</strong><span>${escapeHtml(failedLabel)}</span></figcaption></figure>`;
    }
    const viewLabel = i18n.presetLabel('views', v.view) || (v.view || '').toUpperCase();
    return `<figure class="variant-card"><img src="${v.outputDataUrl}" alt="${escapeAttr(viewLabel)}"/><figcaption><strong>${escapeHtml(viewLabel)}</strong><span>${escapeHtml(v.model || 'gemini')}</span></figcaption></figure>`;
  }).join('');
  resultWrap.innerHTML = `<div class="multi-view-grid">${cards}</div>`;
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(msg) {
  setResultMeta(i18n.t('result.errorLabel'), 'badge-red', msg);
  resultWrap.innerHTML = `<div class="placeholder" style="border-color: var(--rose-100); background: #fff5f5; color: var(--rose-700);"><div class="placeholder-icon">!</div><div class="placeholder-text">${escapeHtml(msg)}</div></div>`;
}

function setResultMeta(text, badgeClass, lastError) {
  resultMeta.textContent = text;
  resultMeta.className = 'badge ' + badgeClass;
  resultMeta.dataset.state = badgeClass === 'badge-red' ? 'error' : 'ok';
  if (lastError) resultMeta.dataset.lastError = lastError;
}

function setBusy(busy) {
  for (const btn of buttons) btn.disabled = busy;
  for (const btn of [photoReset, useSample]) btn.disabled = busy;
  if (busy) {
    setResultMeta('…', 'badge-yellow', null);
    resultWrap.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⏳</div><div class="placeholder-text">${escapeHtml(i18n.t('result.busyTitle'))}</div></div>`;
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
