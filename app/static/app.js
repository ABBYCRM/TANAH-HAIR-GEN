// Front-end controller for the single-page test UI.
// All actions hit the same JSON-or-multipart API endpoints. No auth —
// this UI is the CRM integrator's playground, not a production app.

const form = document.getElementById('gen-form');
const photoInput = document.getElementById('photo-input');
const photoReset = document.getElementById('photo-reset');
const before = document.getElementById('before');
const resultWrap = document.getElementById('result-wrap');
const resultMeta = document.getElementById('result-meta');
const status = document.getElementById('status');
const modelChip = document.getElementById('model-chip');
const aiChip = document.getElementById('ai-chip');
const buttons = form.querySelectorAll('button');

let customPhoto = null;  // { dataUrl, mimeType, base64 } once user uploads

function setStatus(text, kind) {
  status.textContent = text || '';
  status.className = 'status' + (kind ? ' ' + kind : '');
}

function setButtonsDisabled(disabled) {
  buttons.forEach(b => { b.disabled = disabled; });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function base64FromDataUrl(dataUrl) {
  return dataUrl.split(',')[1];
}

photoInput?.addEventListener('change', async () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) {
    setStatus('Photo is larger than 12 MB.', 'error');
    return;
  }
  const dataUrl = await readFileAsDataURL(file);
  customPhoto = { dataUrl, mimeType: file.type, base64: base64FromDataUrl(dataUrl), name: file.name };
  before.src = dataUrl;
  setStatus(`Photo loaded: ${file.name} (${Math.round(file.size / 1024)} KB)`, '');
});

photoReset?.addEventListener('click', () => {
  customPhoto = null;
  before.src = '/api/sample-photo';
  setStatus('Reset to bundled sample photo.', '');
});

async function callEndpoint(path, action) {
  const fd = new FormData(form);
  fd.delete('photo');
  if (customPhoto) {
    const blob = await (await fetch(customPhoto.dataUrl)).blob();
    fd.append('photo', blob, customPhoto.name || 'upload.jpg');
  }
  setButtonsDisabled(true);
  setStatus('Generating with Gemini 2.5 Flash Image…  (5–15 seconds)', 'working');
  resultWrap.innerHTML = `<div class="placeholder"><span>⏳</span><p>Gemini is analyzing the head shape and rendering the simulation. Typical time: 5–15 seconds.</p></div>`;
  try {
    const response = await fetch(path, { method: 'POST', body: fd });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail || data?.title || `Request failed (${response.status})`);
    return data;
  } finally {
    setButtonsDisabled(false);
  }
}

function renderImage({ dataUrl, label, caption }) {
  resultWrap.innerHTML = `<img src="${dataUrl}" alt="${label || 'Result'}">`;
  resultMeta.textContent = caption || '';
}

function renderVariants(variants) {
  if (!variants?.length) { resultWrap.innerHTML = '<div class="placeholder"><span>!</span><p>No variants returned.</p></div>'; return; }
  const cards = variants.map(v => v.error
    ? `<figure class="variant-card error"><div class="placeholder" style="min-height:160px"><span>!</span><p>${escapeHtml(v.error)}</p></div><figcaption><strong>${escapeHtml(v.hairline)}</strong><span>Failed</span></figcaption></figure>`
    : `<figure class="variant-card"><img src="${v.outputDataUrl}" alt="${escapeHtml(v.hairline)}"/><figcaption><strong>${escapeHtml(v.hairline)}</strong><span>${v.params ? escapeHtml(v.params.length) + ' · ' + escapeHtml(v.params.color) : ''}</span></figcaption></figure>`).join('');
  resultWrap.innerHTML = `<div class="variants-grid">${cards}</div>`;
  resultMeta.textContent = `${variants.length} variants rendered.`;
}

function renderMultiView(views) {
  if (!views?.length) { resultWrap.innerHTML = '<div class="placeholder"><span>!</span><p>No views returned.</p></div>'; return; }
  const cards = views.map(v => v.error
    ? `<figure class="variant-card error"><div class="placeholder" style="min-height:160px"><span>!</span><p>${escapeHtml(v.error)}</p></div><figcaption><strong>${escapeHtml(v.view.toUpperCase())}</strong><span>Failed</span></figcaption></figure>`
    : `<figure class="variant-card"><img src="${v.outputDataUrl}" alt="${escapeHtml(v.view)}"/><figcaption><strong>${escapeHtml(v.view.toUpperCase())}</strong><span>${escapeHtml(v.model || 'gemini')}</span></figcaption></figure>`).join('');
  resultWrap.innerHTML = `<div class="multi-view-grid">${cards}</div>`;
  resultMeta.textContent = `${views.length} views rendered in parallel.`;
}

function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await callEndpoint('/api/generate', 'generate');
    renderImage({ dataUrl: data.outputDataUrl, label: 'Generated', caption: `Model: ${data.model} · view: ${data.view} · id: ${data.id}` });
    setStatus('Done.', '');
  } catch (err) {
    setStatus(err.message || 'Generation failed.', 'error');
    resultWrap.innerHTML = `<div class="placeholder"><span>!</span><p>${escapeHtml(err.message || 'Failed')}</p></div>`;
  }
});

form.querySelector('[data-action=variants]')?.addEventListener('click', async () => {
  try {
    const data = await callEndpoint('/api/variants', 'variants');
    renderVariants(data.variants);
    setStatus('3 variants rendered.', '');
  } catch (err) { setStatus(err.message || 'Variant generation failed.', 'error'); }
});

form.querySelector('[data-action=multi-view]')?.addEventListener('click', async () => {
  try {
    const data = await callEndpoint('/api/multi-view', 'multi-view');
    renderMultiView(data.views);
    setStatus('4 views rendered in parallel.', '');
  } catch (err) { setStatus(err.message || 'Multi-view failed.', 'error'); }
});

form.querySelector('[data-action=parametric]')?.addEventListener('click', async () => {
  setButtonsDisabled(true);
  setStatus('Rendering offline SVG fallback…', 'working');
  try {
    const fd = new FormData(form);
    if (customPhoto) {
      const blob = await (await fetch(customPhoto.dataUrl)).blob();
      fd.append('photo', blob, customPhoto.name || 'upload.jpg');
    }
    const response = await fetch('/api/parametric', { method: 'POST', body: fd });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail || 'Failed');
    renderImage({ dataUrl: data.outputDataUrl, label: 'Parametric SVG', caption: `Offline render (no AI). seed: ${data.seed ?? 'auto'}` });
    setStatus('Done (offline SVG fallback).', '');
  } catch (err) {
    setStatus(err.message || 'Parametric render failed.', 'error');
  } finally {
    setButtonsDisabled(false);
  }
});

// Health check + model display on boot
fetch('/api/health').then(r => r.json()).then(info => {
  if (info.gemini?.configured) {
    modelChip.textContent = `model: ${info.gemini.model}`;
    aiChip.textContent = 'AI ready';
    aiChip.className = 'chip';
  } else {
    modelChip.textContent = 'AI not configured';
    aiChip.textContent = 'set GEMINI_API_KEY';
    aiChip.className = 'chip warning';
  }
}).catch(() => {
  modelChip.textContent = 'offline';
  aiChip.textContent = 'API unreachable';
  aiChip.className = 'chip warning';
});
