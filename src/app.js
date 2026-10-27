import { loadProgress, saveProgress } from './progress.js';

async function loadPack(lang) {
  const root = document.getElementById('app');
  root.innerHTML = '';
  try {
    const res = await fetch('/content/packs/trier.json');
    if (!res.ok) throw new Error('Pack not found: ' + res.status);
    const pack = await res.json();
    const codes = pack.blocks.map(b => b.id);
    const progress = loadProgress(pack.pack_id, codes);

    pack.blocks.forEach(b => {
      const card = document.createElement('article');
      card.className = 'card';

      const title = (b.title && typeof b.title === 'object')
        ? (b.title[lang] || b.title.en)
        : b.title;
      const steps = b.steps.map(s => `<li>${lang === 'de' && s.text_de ? s.text_de : (s.text_en || '')}</li>`).join('');
      const disclaimer = lang === 'de' ? (b.disclaimer_de || b.disclaimer_en) : b.disclaimer_en;
      const isDone = progress[b.id] === 'done';

      card.innerHTML = `
        <h2>${title} ${isDone ? '✓' : ''}</h2>
        <ul>${steps}</ul>
        ${disclaimer ? `<p class="disclaimer">${disclaimer}</p>` : ''}
        <button data-code="${b.id}" data-state="${isDone ? 'done' : 'not_done'}">
          ${isDone ? 'Mark undone' : 'Mark done'}
        </button>`;
      root.appendChild(card);
    });

    root.querySelectorAll('button[data-code]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const next = btn.dataset.state === 'done' ? 'not_done' : 'done';
        saveProgress(pack.pack_id, code, next);
        loadPack(lang);
      });
    });
  } catch (err) {
    root.innerHTML = `<div class="disclaimer" style="color:#b00020">⚠️ Failed to load checklist: ${err.message}. Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R).</div>`;
    console.error(err);
  }
}

const sel = document.querySelector('#lang');
sel.addEventListener('change', () => loadPack(sel.value));
loadPack('en');
