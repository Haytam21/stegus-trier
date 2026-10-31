// Card rendering for Stegus — pure DOM building, no fetch, testable without network.
// Deep module: renderCard(block, lang, progress, arrivalDate) -> HTMLElement.
import { formatDeadline, isLocked } from './data-model.js';

const ICON_CHECK = '<svg class="icon icon-sm status-icon" aria-hidden="true" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';
const ICON_LOCK = '<svg class="icon icon-sm status-icon" aria-hidden="true" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" rx="2" ry="2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11V7a5 5 0 0110 0v4"/></svg>';

export function renderCard(block, lang, progress, arrivalDate) {
  const card = document.createElement('article');
  card.className = 'card';

  const locked = isLocked(block, progress);
  if (locked) {
    card.classList.add('locked');
  }

  const isDone = progress[block.id] === 'done';

  const title = (block.title && typeof block.title === 'object')
    ? (block.title[lang] || block.title.en)
    : block.title;

  const textField = `text_${lang}`;
  const disclaimerField = `disclaimer_${lang}`;
  const disclaimer = block[disclaimerField] || block.disclaimer_en;

  // Card header with title and status badge
  const header = document.createElement('div');
  header.className = 'card-header';

  const h2 = document.createElement('h2');
  h2.textContent = title;
  header.appendChild(h2);

  const status = document.createElement('span');
  status.className = 'card-status';
  if (isDone) {
    status.className = 'card-status status-done';
    status.innerHTML = ICON_CHECK + ' <span class="status-text">Done</span>';
  } else if (locked) {
    status.className = 'card-status status-locked';
    status.innerHTML = ICON_LOCK + ' <span class="status-text">Locked</span>';
  }
  header.appendChild(status);

  card.appendChild(header);

  // Steps list
  const ul = document.createElement('ul');
  block.steps.forEach(s => {
    const li = document.createElement('li');
    let stepText = s[textField] || s.text_en || '';
    const deadline = formatDeadline(arrivalDate, s.deadline_days);
    if (deadline) {
      stepText += ` — ${deadline}`;
    }
    li.textContent = stepText;

    if (s.what_to_bring && s.what_to_bring.length > 0) {
      const bring = document.createElement('div');
      bring.className = 'bring';
      bring.textContent = 'Bring: ' + s.what_to_bring.join(', ');
      li.appendChild(bring);
    }

    if (s.german_phrase) {
      const say = document.createElement('div');
      say.className = 'say';
      say.textContent = 'Say: "' + s.german_phrase + '"';
      li.appendChild(say);
    }

    ul.appendChild(li);
  });
  card.appendChild(ul);

  if (disclaimer) {
    const p = document.createElement('p');
    p.className = 'card-disclaimer';
    p.textContent = disclaimer;
    card.appendChild(p);
  }

  // Card action button — wired by caller via dataset.code
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'card-btn';
  btn.dataset.code = block.id;
  btn.dataset.state = isDone ? 'done' : 'not_done';
  btn.disabled = locked;
  if (locked) {
    btn.textContent = 'Locked — complete dependencies first';
    const depNames = (block.depends_on || []).map(d => {
      // Caller resolves dependency names; renderer only renders the button.
      return d;
    });
    btn.title = 'Complete first: ' + depNames.join(', ');
  } else {
    btn.textContent = isDone ? 'Mark undone' : 'Mark done';
  }
  card.appendChild(btn);

  return card;
}

export function renderChecklist(blocks, lang, progress, arrivalDate, root) {
  root.innerHTML = '';
  blocks.forEach(b => {
    root.appendChild(renderCard(b, lang, progress, arrivalDate));
  });
}
