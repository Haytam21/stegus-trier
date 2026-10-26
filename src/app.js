async function loadPack(lang) {
  const res = await fetch('/content/packs/trier.json');
  const pack = await res.json();
  const root = document.getElementById('app');
  root.innerHTML = '';
  for (const b of pack.blocks) {
    const el = document.createElement('article');
    el.className = 'card';
    const title = (b.title && typeof b.title === 'object') ? (b.title[lang] || b.title.en) : b.title;
    const steps = b.steps.map(s => `<li>${lang === 'de' && s.text_de ? s.text_de : (s.text_en || s.text_en || '')}</li>`).join('');
    const disclaimer = lang === 'de' ? (b.disclaimer_de || b.disclaimer_en) : b.disclaimer_en;
    el.innerHTML = `<h2>${title}</h2><ul>${steps}</ul>${disclaimer ? `<p class="disclaimer">${disclaimer}</p>` : ''}`;
    root.appendChild(el);
  }
}
const langSel = document.getElementById('lang');
langSel.addEventListener('change', e => loadPack(e.target.value));
loadPack('en');
