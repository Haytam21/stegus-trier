// Stegus app wiring — city/geo/profile persistence, pack loading, rendering,
// .ics export, error reporting, service worker registration.
// All event handlers live here; data loading lives in pack-loader, rendering in renderer.
import {
  CITIES, nearestCity, formatDeadline
} from './data-model.js';
import { loadMergedPack } from './pack-loader.js';
import { renderChecklist } from './renderer.js';
import { escapeHtml, generateIcs, downloadIcs } from './ics-export.js';
import { loadProgress, saveProgress } from './progress.js';

const PACK_ID = 'national-2026q4-v0';

// Current screen state, kept so the card-button handler can re-render after a toggle.
let currentBlocks = [];
let currentLang = 'en';
let currentProfile = { eu: 'eu', arrival: '' };

// ---- Persistence helpers ----

function loadCityKey(cityId) {
  return `stegus:city:${cityId}`;
}

function saveCity(cityId) {
  localStorage.setItem(loadCityKey(cityId), cityId);
}

function loadCity() {
  return localStorage.getItem(loadCityKey('selected')) || 'trier';
}

function loadProfile() {
  const eu = localStorage.getItem('stegus:profile:eu') || 'eu';
  const arrival = localStorage.getItem('stegus:profile:arrival') || '';
  return { eu, arrival };
}

function saveProfile(eu, arrival) {
  localStorage.setItem('stegus:profile:eu', eu);
  localStorage.setItem('stegus:profile:arrival', arrival);
}

// ---- Direction / language ----

function setDirAndLang(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

// ---- City info for status banner ----

function setCityStatus(cityId) {
  const statusEl = document.getElementById('city-status');
  const cityInfo = CITIES.find(c => c.id === cityId);
  if (!cityInfo) return;

  if (cityInfo.status === 'verified') {
    statusEl.textContent = `${cityInfo.name} — local info available`;
    statusEl.style.color = '#059669';
  } else {
    statusEl.textContent = `${cityInfo.name} — national baseline only (no local info yet)`;
    statusEl.style.color = '#d97706';
  }
}

// ---- Core load: fetch via pack-loader + render via renderer ----

async function loadPack(cityId, lang, profile, root) {
  root.innerHTML = '';

  try {
    const { cityInfo, blocks } = await loadMergedPack(cityId, profile.eu === 'eu');
    currentBlocks = blocks;
    currentLang = lang;

    setCityStatus(cityId);

    if (cityInfo && cityInfo.status !== 'verified') {
      const notice = document.createElement('div');
      notice.className = 'no-local-info';
      notice.textContent = `No verified local info for ${cityInfo.name} yet. Showing national baseline only.`;
      root.appendChild(notice);
    }

    const progress = loadProgress(PACK_ID, blocks.map(b => b.id));
    renderChecklist(blocks, lang, progress, profile.arrival, root);

  } catch (err) {
    root.innerHTML = `
      <div class="error-banner" role="alert">
        <svg class="icon icon-sm" aria-hidden="true" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>Failed to load checklist: ${escapeHtml(err.message)}.</div>
        <button type="button" id="retry-btn" class="retry-btn">Retry</button>
      </div>
    `;
    document.getElementById('retry-btn').addEventListener('click', () => {
      const city = document.getElementById('city').value;
      const lang = document.getElementById('lang').value;
      loadPack(city, lang, profile, root);
    });
  }
}

// ---- Card button delegation (single listener on stable root element) ----

function setupCardButtons(profile) {
  const root = document.getElementById('app');
  root.addEventListener('click', async (event) => {
    const btn = event.target.closest('.card-btn');
    if (!btn) return;

    const code = btn.dataset.code;
    const isDone = btn.dataset.state === 'done';
    const next = isDone ? 'not_done' : 'done';

    saveProgress(PACK_ID, code, next);

    const cityId = document.getElementById('city').value;
    const lang = document.getElementById('lang').value;

    try {
      const { blocks } = await loadMergedPack(cityId, profile.eu === 'eu');
      currentBlocks = blocks;
      currentLang = lang;

      const progress = loadProgress(PACK_ID, blocks.map(b => b.id));
      const rootEl = document.getElementById('app');
      renderChecklist(blocks, lang, progress, profile.arrival, rootEl);
    } catch (err) {
      // Silent fail on re-render; progress is already saved.
    }
  });
}

// ---- .ics export ----

async function exportIcs(cityId, lang, profile) {
  const cityInfo = CITIES.find(c => c.id === cityId);

  try {
    const { blocks } = await loadMergedPack(cityId, profile.eu === 'eu');

    const events = [];
    blocks.forEach(b => {
      b.steps.forEach(s => {
        if (!s.deadline_days) return;
        const arrival = new Date(profile.arrival);
        if (!arrival || isNaN(arrival.getTime())) return;
        const deadline = new Date(arrival);
        deadline.setDate(arrival.getDate() + s.deadline_days);
        const title = (b.title && typeof b.title === 'object')
          ? (b.title[lang] || b.title.en)
          : b.title;
        const textField = `text_${lang}`;
        const stepText = s[textField] || s.text_en || '';
        events.push({
          start: deadline,
          summary: `Stegus: ${title} — ${stepText.slice(0, 60)}`,
          description: `City: ${cityInfo ? cityInfo.name : cityId}\nBlock: ${title}\nStep: ${stepText}\nSource: Stegus arrival hub`,
        });
      });
    });

    if (events.length === 0) {
      alert('No deadlines to export. Set an arrival date first.');
      return;
    }

    const ics = generateIcs(events);
    downloadIcs(ics, `stegus-deadlines-${cityId}.ics`);
  } catch (err) {
    alert('Failed to export deadlines: ' + escapeHtml(err.message));
  }
}

// ---- Report an error ----

function reportError(cityId, lang, profile) {
  const subject = encodeURIComponent('[Stegus] Error report: ' + (cityId || 'unknown'));
  const body = encodeURIComponent(
    'Stegus error report\n' +
    '====================\n' +
    'City: ' + cityId + '\n' +
    'Language: ' + lang + '\n' +
    'Profile: ' + profile.eu + ', arrival: ' + profile.arrival + '\n' +
    'Time: ' + new Date().toISOString() + '\n\n' +
    'Please describe the incorrect or missing information:\n\n' +
    '---\n' +
    'No personal data is collected by Stegus. Only include details you want to share.\n'
  );
  const mailto = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = mailto;
}

// ---- Initialise ----

export function init() {
  const citySel = document.getElementById('city');
  const langSel = document.getElementById('lang');
  const euSel = document.getElementById('eu-status');
  const arrivalInput = document.getElementById('arrival-date');
  const geoBtn = document.getElementById('geo-btn');
  const root = document.getElementById('app');

  const profile = loadProfile();
  currentProfile = profile;
  const savedCity = loadCity();

  citySel.value = savedCity;
  euSel.value = profile.eu;
  if (profile.arrival) arrivalInput.value = profile.arrival;
  setDirAndLang(langSel.value);
  currentLang = langSel.value;

  // Initial load
  loadPack(savedCity, langSel.value, profile, root);

  // Card button delegation — wired once, survives re-renders
  setupCardButtons(profile);

  // City change
  citySel.addEventListener('change', () => {
    saveCity(citySel.value);
    loadPack(citySel.value, langSel.value, profile, root);
  });

  // Geo button
  geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      document.getElementById('city-status').textContent = 'Geolocation not supported';
      return;
    }
    geoBtn.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestCity(pos.coords.latitude, pos.coords.longitude);
        citySel.value = nearest.id;
        saveCity(nearest.id);
        loadPack(nearest.id, langSel.value, profile, root);
        geoBtn.textContent = 'Use my location';
      },
      () => {
        geoBtn.textContent = 'Use my location';
        document.getElementById('city-status').textContent = 'Location access denied — use manual picker';
      }
    );
  });

  // Language change
  langSel.addEventListener('change', () => {
    setDirAndLang(langSel.value);
    currentLang = langSel.value;
    loadPack(citySel.value, langSel.value, profile, root);
  });

  // Profile change
  euSel.addEventListener('change', () => {
    profile.eu = euSel.value;
    currentProfile = profile;
    saveProfile(profile.eu, profile.arrival);
    loadPack(citySel.value, langSel.value, profile, root);
  });

  // Arrival date change
  arrivalInput.addEventListener('change', () => {
    profile.arrival = arrivalInput.value;
    currentProfile = profile;
    saveProfile(profile.eu, profile.arrival);
    loadPack(citySel.value, langSel.value, profile, root);
  });

  // ---- .ics export ----
  const icsExportBtn = document.getElementById('ics-export');
  icsExportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!profile.arrival) {
      alert('Please set your arrival date first to export deadlines.');
      return;
    }
    exportIcs(citySel.value, langSel.value, profile);
  });

  // ---- Report an error ----
  const reportErrorBtn = document.getElementById('report-error');
  reportErrorBtn.addEventListener('click', (e) => {
    e.preventDefault();
    reportError(citySel.value, langSel.value, profile);
  });

  // Register service worker for offline-first PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      // Silent fail — SW is optional enhancement
    });
  }
}
