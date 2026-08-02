// ============================================================
// TANAH-HAIR-GEN — i18n module
// Three locales: English (en), Portuguese Brazilian (pt-BR), Spanish (es).
// The UI auto-detects browser language on first load; user can override
// via the language pills in the topbar. Choice persists in localStorage.
//
// Exposed globals (no module bundler; loaded as a regular <script>):
//   window.tanahI18n = { t(key, params), setLocale(loc), getLocale(),
//                        SUPPORTED, applyTo(root) }
// ============================================================

const I18N = {
  // ---- English ----
  en: {
    'meta.title': 'TANAH-HAIR-GEN · Hair Transplant Image Generator',
    'lang.label': 'Language',
    'meta.description': 'Hair-transplant image generator microservice. AI-powered photorealistic before/after visualization. Embeddable CRM component.',
    'aria.toggleMenu': 'Toggle menu',
    'brand.tag': 'Hair-transplant image generator · embeddable CRM component',
    'chip.model': 'model:',
    'chip.modelTitle': 'Active Gemini model',
    'chip.checking': 'checking…',
    'chip.aiReady': 'AI ready',
    'chip.offline': 'offline',
    'nav.input': 'Input',
    'nav.parameters': 'Parameters',
    'nav.output': 'Output',
    'nav.api': 'API for CRM integrators',
    'page.title': 'Generate',
    'page.subtitle': 'Photo + parameters in. Watermarked photorealistic preview out. Every response carries the spec-mandated clinical disclaimer.',
    'card.patientPhoto': 'Patient photo',
    'card.parameters': 'Parameters',
    'card.fieldsCount': '{n} fields',
    'card.result': 'Result',
    'card.apiIntegrators': 'API for CRM integrators',
    'photo.noPhoto': 'no photo',
    'photo.sample': 'sample',
    'photo.uploaded': 'uploaded',
    'photo.emptyTitle': 'Upload a photo to begin',
    'photo.emptySub': 'JPG / PNG / WebP / HEIC · max 12 MB',
    'photo.upload': 'Upload photo',
    'photo.useSample': 'Use sample',
    'photo.clear': 'Clear',
    'photo.demoHint': 'Demo patient is a stock photo (no real patient data). Upload your own to test with a real face.',
    'photo.altBefore': 'Patient before',
    'param.hairline': 'Hairline',
    'param.zone': 'Zone',
    'param.density': 'Density',
    'param.densityHint': 'Visual hair count (no clinical graft estimate).',
    'param.length': 'Length',
    'param.color': 'Color',
    'param.curl': 'Curl / texture',
    'param.fullness': 'Fullness',
    'param.technique': 'Technique',
    'param.sessions': 'Sessions',
    'param.graftScenario': 'Graft scenario',
    'action.generate': 'Generate (AI)',
    'action.variants': '3 alternatives',
    'action.multiview': '4 views',
    'action.offline': 'Offline (SVG)',
    'result.noRender': 'no render yet',
    'result.altPreview': 'Generated preview',
    'result.placeholderTitle1': 'Press',
    'result.placeholderTitle2': 'Generate (AI)',
    'result.placeholderTitle3': 'to render a photorealistic before/after preview.',
    'result.placeholderSub1': 'Or try',
    'result.placeholderSub2': 'Offline (SVG)',
    'result.placeholderSub3': 'for an instant preview while a real key is being set up.',
    'result.busyTitle': 'Gemini is analyzing the head shape and rendering the simulation. Typical time: 5–15 seconds.',
    'result.errorLabel': 'error',
    'result.modelMeta': 'Model: {model} · view: {view} · {ms}s · id: {id}',
    'result.variantsMeta': '{ok}/{total} variants · {ms}s',
    'result.multiviewMeta': '{ok}/{total} views · {ms}s',
    'result.failed': 'Failed',
    'api.description': 'POST a photo + parameters. Get back a watermarked image data URL. All endpoints accept JSON or multipart/form-data. Every response carries the spec-mandated watermark. The AI preserves identity, skin, age, head shape, lighting, and background — only the scalp hair changes.',
    'footer.brand': 'TANAH-HAIR-GEN · single-purpose image generator',
    'footer.github': 'github',
    'err.noPhoto': 'Upload a photo or use the sample first.',
    'err.tooLarge': 'Photo > 12 MB. Please pick a smaller image.',
    'err.noPresets': 'Failed to load parameter catalog. Is the service online?',
    'err.generic': 'Request failed',
    'err.http': 'HTTP {status}: {detail}',
    'preset.hairlines': {
      conservative: 'Mature conservative',
      balanced: 'Balanced natural',
      restorative: 'Restorative youthful',
      feminine: 'Feminine rounded'
    },
    'preset.zones': {
      temples: 'Temples + frontal',
      frontal: 'Frontal band',
      midscalp: 'Frontal + mid-scalp',
      crown: 'Frontal + crown',
      full: 'Full scalp'
    },
    'preset.lengths': {
      buzz: 'Buzz (3 mm)',
      short: 'Short (15 mm)',
      medium: 'Medium (40 mm)',
      long: 'Long (80 mm)'
    },
    'preset.colors': {
      black: 'Black',
      darkBrown: 'Dark brown',
      mediumBrown: 'Medium brown',
      lightBrown: 'Light brown',
      blonde: 'Blonde',
      saltPepper: 'Salt & pepper'
    },
    'preset.curls': {
      straight: 'Straight',
      slight: 'Slight wave',
      wavy: 'Wavy',
      curly: 'Curly / coily'
    },
    'preset.fullnesses': {
      conservative: 'Conservative',
      moderate: 'Moderate',
      fuller: 'Fuller density'
    },
    'preset.techniques': {
      fue: 'FUE (Follicular Unit Extraction)',
      fut: 'FUT (Strip)',
      dhi: 'DHI (Direct Hair Implantation)'
    },
    'preset.sessions': {
      single: 'Single session',
      multi: 'Multi-session'
    },
    'preset.graftScenarios': {
      light: 'Light',
      moderate: 'Moderate',
      restorative: 'Restorative',
      extensive: 'Extensive (multi-session)'
    },
    'preset.views': {
      front: 'Frontal',
      top:   'Top (vertex)',
      left:  'Left lateral',
      right: 'Right lateral',
      crown: 'Crown (donor)',
      back:  'Posterior'
    }
  },

  // ---- Portuguese (Brazilian) ----
  'pt-BR': {
    'meta.title': 'TANAH-HAIR-GEN · Gerador de Imagem de Transplante Capilar',
    'lang.label': 'Idioma',
    'meta.description': 'Microsserviço gerador de imagem de transplante capilar. Visualização fotorrealista antes/depois com IA. Componente CRM embarcável.',
    'aria.toggleMenu': 'Alternar menu',
    'brand.tag': 'Gerador de imagem de transplante capilar · componente CRM embarcável',
    'chip.model': 'modelo:',
    'chip.modelTitle': 'Modelo Gemini ativo',
    'chip.checking': 'verificando…',
    'chip.aiReady': 'IA pronta',
    'chip.offline': 'offline',
    'nav.input': 'Entrada',
    'nav.parameters': 'Parâmetros',
    'nav.output': 'Resultado',
    'nav.api': 'API para integradores',
    'page.title': 'Gerar',
    'page.subtitle': 'Foto + parâmetros. Pré-visualização fotorrealista com marca d\'água. Toda resposta carrega o aviso clínico obrigatório da especificação.',
    'card.patientPhoto': 'Foto do paciente',
    'card.parameters': 'Parâmetros',
    'card.fieldsCount': '{n} campos',
    'card.result': 'Resultado',
    'card.apiIntegrators': 'API para integradores de CRM',
    'photo.noPhoto': 'sem foto',
    'photo.sample': 'exemplo',
    'photo.uploaded': 'enviado',
    'photo.emptyTitle': 'Envie uma foto para começar',
    'photo.emptySub': 'JPG / PNG / WebP / HEIC · máx. 12 MB',
    'photo.upload': 'Enviar foto',
    'photo.useSample': 'Usar exemplo',
    'photo.clear': 'Limpar',
    'photo.demoHint': 'Paciente de demonstração é uma foto de banco de imagens (sem dados reais de paciente). Envie a sua para testar com um rosto real.',
    'photo.altBefore': 'Paciente antes',
    'param.hairline': 'Linha frontal',
    'param.zone': 'Zona',
    'param.density': 'Densidade',
    'param.densityHint': 'Contagem visual de cabelo (sem estimativa clínica de enxertos).',
    'param.length': 'Comprimento',
    'param.color': 'Cor',
    'param.curl': 'Ondulação / textura',
    'param.fullness': 'Volume',
    'param.technique': 'Técnica',
    'param.sessions': 'Sessões',
    'param.graftScenario': 'Cenário de enxertia',
    'action.generate': 'Gerar (IA)',
    'action.variants': '3 alternativas',
    'action.multiview': '4 vistas',
    'action.offline': 'Offline (SVG)',
    'result.noRender': 'sem renderização',
    'result.altPreview': 'Pré-visualização gerada',
    'result.placeholderTitle1': 'Pressione',
    'result.placeholderTitle2': 'Gerar (IA)',
    'result.placeholderTitle3': 'para renderizar uma pré-visualização fotorrealista antes/depois.',
    'result.placeholderSub1': 'Ou tente',
    'result.placeholderSub2': 'Offline (SVG)',
    'result.placeholderSub3': 'para uma pré-visualização instantânea enquanto a chave real é configurada.',
    'result.busyTitle': 'A Gemini está analisando o formato da cabeça e renderizando a simulação. Tempo típico: 5–15 segundos.',
    'result.errorLabel': 'erro',
    'result.modelMeta': 'Modelo: {model} · vista: {view} · {ms}s · id: {id}',
    'result.variantsMeta': '{ok}/{total} alternativas · {ms}s',
    'result.multiviewMeta': '{ok}/{total} vistas · {ms}s',
    'result.failed': 'Falhou',
    'api.description': 'Envie uma foto + parâmetros. Receba de volta um data URL de imagem com marca d\'água. Todos os endpoints aceitam JSON ou multipart/form-data. Toda resposta carrega a marca d\'água obrigatória da especificação. A IA preserva identidade, pele, idade, formato da cabeça, iluminação e fundo — apenas o cabelo do couro cabeludo muda.',
    'footer.brand': 'TANAH-HAIR-GEN · gerador de imagem de propósito único',
    'footer.github': 'github',
    'err.noPhoto': 'Envie uma foto ou use o exemplo primeiro.',
    'err.tooLarge': 'Foto > 12 MB. Escolha uma imagem menor.',
    'err.noPresets': 'Falha ao carregar o catálogo de parâmetros. O serviço está online?',
    'err.generic': 'Falha na requisição',
    'err.http': 'HTTP {status}: {detail}',
    'preset.hairlines': {
      conservative: 'Conservadora madura',
      balanced: 'Natural equilibrada',
      restorative: 'Restauradora jovem',
      feminine: 'Feminina arredondada'
    },
    'preset.zones': {
      temples: 'Têmporas + frontal',
      frontal: 'Banda frontal',
      midscalp: 'Frontal + meio do couro',
      crown: 'Frontal + coroa',
      full: 'Couro cabeludo inteiro'
    },
    'preset.lengths': {
      buzz: 'Raspado (3 mm)',
      short: 'Curto (15 mm)',
      medium: 'Médio (40 mm)',
      long: 'Longo (80 mm)'
    },
    'preset.colors': {
      black: 'Preto',
      darkBrown: 'Castanho escuro',
      mediumBrown: 'Castanho médio',
      lightBrown: 'Castanho claro',
      blonde: 'Loiro',
      saltPepper: 'Sal e pimenta'
    },
    'preset.curls': {
      straight: 'Liso',
      slight: 'Onda leve',
      wavy: 'Ondulado',
      curly: 'Cacheado / Crespo'
    },
    'preset.fullnesses': {
      conservative: 'Conservador',
      moderate: 'Moderado',
      fuller: 'Mais cheio'
    },
    'preset.techniques': {
      fue: 'FUE (Extração de Unidades Foliculares)',
      fut: 'FUT (Tira)',
      dhi: 'DHI (Implante Capilar Direto)'
    },
    'preset.sessions': {
      single: 'Sessão única',
      multi: 'Multi-sessão'
    },
    'preset.graftScenarios': {
      light: 'Leve',
      moderate: 'Moderado',
      restorative: 'Restaurador',
      extensive: 'Extensivo (multi-sessão)'
    },
    'preset.views': {
      front: 'Frontal',
      top:   'Topo (vértex)',
      left:  'Lateral esquerda',
      right: 'Lateral direita',
      crown: 'Coroa (doador)',
      back:  'Posterior'
    }
  },

  // ---- Spanish ----
  es: {
    'meta.title': 'TANAH-HAIR-GEN · Generador de Imágenes de Trasplante Capilar',
    'lang.label': 'Idioma',
    'meta.description': 'Microservicio generador de imágenes de trasplante capilar. Visualización fotorrealista antes/después con IA. Componente CRM integrable.',
    'aria.toggleMenu': 'Alternar menú',
    'brand.tag': 'Generador de imágenes de trasplante capilar · componente CRM integrable',
    'chip.model': 'modelo:',
    'chip.modelTitle': 'Modelo Gemini activo',
    'chip.checking': 'verificando…',
    'chip.aiReady': 'IA lista',
    'chip.offline': 'sin conexión',
    'nav.input': 'Entrada',
    'nav.parameters': 'Parámetros',
    'nav.output': 'Resultado',
    'nav.api': 'API para integradores',
    'page.title': 'Generar',
    'page.subtitle': 'Foto + parámetros. Vista previa fotorrealista con marca de agua. Cada respuesta lleva el aviso clínico obligatorio de la especificación.',
    'card.patientPhoto': 'Foto del paciente',
    'card.parameters': 'Parámetros',
    'card.fieldsCount': '{n} campos',
    'card.result': 'Resultado',
    'card.apiIntegrators': 'API para integradores de CRM',
    'photo.noPhoto': 'sin foto',
    'photo.sample': 'ejemplo',
    'photo.uploaded': 'cargada',
    'photo.emptyTitle': 'Cargue una foto para empezar',
    'photo.emptySub': 'JPG / PNG / WebP / HEIC · máx. 12 MB',
    'photo.upload': 'Cargar foto',
    'photo.useSample': 'Usar ejemplo',
    'photo.clear': 'Limpiar',
    'photo.demoHint': 'El paciente de demostración es una foto de banco de imágenes (sin datos reales de paciente). Cargue la suya para probar con un rostro real.',
    'photo.altBefore': 'Paciente antes',
    'param.hairline': 'Línea frontal',
    'param.zone': 'Zona',
    'param.density': 'Densidad',
    'param.densityHint': 'Cantidad visual de cabello (sin estimación clínica de injertos).',
    'param.length': 'Largo',
    'param.color': 'Color',
    'param.curl': 'Ondulación / textura',
    'param.fullness': 'Volumen',
    'param.technique': 'Técnica',
    'param.sessions': 'Sesiones',
    'param.graftScenario': 'Escenario de injerto',
    'action.generate': 'Generar (IA)',
    'action.variants': '3 alternativas',
    'action.multiview': '4 vistas',
    'action.offline': 'Sin conexión (SVG)',
    'result.noRender': 'sin renderizar',
    'result.altPreview': 'Vista previa generada',
    'result.placeholderTitle1': 'Pulse',
    'result.placeholderTitle2': 'Generar (IA)',
    'result.placeholderTitle3': 'para obtener una vista previa fotorrealista antes/después.',
    'result.placeholderSub1': 'O pruebe',
    'result.placeholderSub2': 'Sin conexión (SVG)',
    'result.placeholderSub3': 'para una vista previa instantánea mientras se configura la clave real.',
    'result.busyTitle': 'Gemini está analizando la forma de la cabeza y renderizando la simulación. Tiempo típico: 5–15 segundos.',
    'result.errorLabel': 'error',
    'result.modelMeta': 'Modelo: {model} · vista: {view} · {ms}s · id: {id}',
    'result.variantsMeta': '{ok}/{total} alternativas · {ms}s',
    'result.multiviewMeta': '{ok}/{total} vistas · {ms}s',
    'result.failed': 'Falló',
    'api.description': 'Envíe una foto + parámetros. Reciba un data URL de imagen con marca de agua. Todos los endpoints aceptan JSON o multipart/form-data. Cada respuesta lleva la marca de agua obligatoria de la especificación. La IA preserva identidad, piel, edad, forma de la cabeza, iluminación y fondo — solo cambia el cabello del cuero cabelludo.',
    'footer.brand': 'TANAH-HAIR-GEN · generador de imágenes de propósito único',
    'footer.github': 'github',
    'err.noPhoto': 'Cargue una foto o use el ejemplo primero.',
    'err.tooLarge': 'Foto > 12 MB. Elija una imagen más pequeña.',
    'err.noPresets': 'No se pudo cargar el catálogo de parámetros. ¿El servicio está en línea?',
    'err.generic': 'Solicitud fallida',
    'err.http': 'HTTP {status}: {detail}',
    'preset.hairlines': {
      conservative: 'Conservadora madura',
      balanced: 'Natural equilibrada',
      restorative: 'Restauradora juvenil',
      feminine: 'Femenina redondeada'
    },
    'preset.zones': {
      temples: 'Sienes + frontal',
      frontal: 'Banda frontal',
      midscalp: 'Frontal + medio cuero',
      crown: 'Frontal + coronilla',
      full: 'Cuero cabelludo completo'
    },
    'preset.lengths': {
      buzz: 'Rapado (3 mm)',
      short: 'Corto (15 mm)',
      medium: 'Medio (40 mm)',
      long: 'Largo (80 mm)'
    },
    'preset.colors': {
      black: 'Negro',
      darkBrown: 'Castaño oscuro',
      mediumBrown: 'Castaño medio',
      lightBrown: 'Castaño claro',
      blonde: 'Rubio',
      saltPepper: 'Sal y pimienta'
    },
    'preset.curls': {
      straight: 'Liso',
      slight: 'Onda suave',
      wavy: 'Ondulado',
      curly: 'Rizado / Crespo'
    },
    'preset.fullnesses': {
      conservative: 'Conservador',
      moderate: 'Moderado',
      fuller: 'Más lleno'
    },
    'preset.techniques': {
      fue: 'FUE (Extracción de Unidades Foliculares)',
      fut: 'FUT (Tira)',
      dhi: 'DHI (Implante Capilar Directo)'
    },
    'preset.sessions': {
      single: 'Sesión única',
      multi: 'Múltiples sesiones'
    },
    'preset.graftScenarios': {
      light: 'Ligero',
      moderate: 'Moderado',
      restorative: 'Restaurador',
      extensive: 'Extensivo (múltiples sesiones)'
    },
    'preset.views': {
      front: 'Frontal',
      top:   'Top (vértice)',
      left:  'Lateral izquierdo',
      right: 'Lateral derecho',
      crown: 'Coronilla (donante)',
      back:  'Posterior'
    }
  }
};

const SUPPORTED = Object.keys(I18N);
const STORAGE_KEY = 'tanah-hair-gen-locale';
const DEFAULT_LOCALE = 'en';

function detectLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (nav.startsWith('pt')) return 'pt-BR';
  if (nav.startsWith('es')) return 'es';
  return DEFAULT_LOCALE;
}

let currentLocale = DEFAULT_LOCALE;

function interpolate(template, params) {
  if (!params) return template;
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`));
}

function t(key, params) {
  const table = I18N[currentLocale] || I18N[DEFAULT_LOCALE];
  if (table[key] !== undefined) return interpolate(table[key], params);
  if (I18N[DEFAULT_LOCALE][key] !== undefined) return interpolate(I18N[DEFAULT_LOCALE][key], params);
  return key;  // missing translation → return the key so it's visible
}

function presetLabel(category, id) {
  const table = I18N[currentLocale] || I18N[DEFAULT_LOCALE];
  const group = table['preset.' + category];
  if (group && group[id]) return group[id];
  return I18N[DEFAULT_LOCALE]['preset.' + category]?.[id] || id;
}

function setLocale(loc) {
  if (!SUPPORTED.includes(loc)) return;
  currentLocale = loc;
  try { localStorage.setItem(STORAGE_KEY, loc); } catch {}
  document.documentElement.lang = loc;
  applyTo(document);
  // Notify listeners (e.g. the param select options need to rebuild labels)
  window.dispatchEvent(new CustomEvent('tanah-locale-change', { detail: { locale: loc } }));
}

function getLocale() { return currentLocale; }

// Walk the DOM and replace text/attributes for every data-i18n hook.
function applyTo(root) {
  // text content — only for elements whose data-i18n is intended for
  // the element's own text (i.e. no data-i18n-attr set). Elements that
  // only declare data-i18n-attr (e.g. a wrapper that translates its
  // aria-label or title) keep their inner text untouched.
  for (const el of root.querySelectorAll('[data-i18n]')) {
    if (el.dataset.i18nAttr) continue;
    const params = el.dataset.i18nParams ? safeParseJSON(el.dataset.i18nParams) : null;
    el.textContent = t(el.dataset.i18n, params);
  }
  // element attributes (e.g. aria-label, title, content)
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    const attr = el.dataset.i18nAttr;
    const key = el.dataset.i18n;
    el.setAttribute(attr, t(key));
  }
  // language pills active state
  for (const pill of root.querySelectorAll('.lang-pill')) {
    pill.classList.toggle('active', pill.dataset.lang === currentLocale);
  }
}

function safeParseJSON(s) {
  try { return JSON.parse(s); } catch { return null; }
}

window.tanahI18n = {
  t, setLocale, getLocale, applyTo, SUPPORTED, presetLabel,
  // boot-time auto-detect
  init() {
    currentLocale = detectLocale();
    document.documentElement.lang = currentLocale;
    applyTo(document);
    // wire pills
    for (const pill of document.querySelectorAll('.lang-pill')) {
      pill.addEventListener('click', () => setLocale(pill.dataset.lang));
    }
  }
};
