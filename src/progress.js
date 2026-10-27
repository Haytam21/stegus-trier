const key = (packId, code) => `stegus:${packId}:${code}`;

export function loadProgress(packId, itemCodes) {
  const out = {};
  for (const code of itemCodes) {
    const v = localStorage.getItem(key(packId, code));
    out[code] = v === 'done' ? 'done' : 'not_done';
  }
  return out;
}

export function saveProgress(packId, code, status) {
  localStorage.setItem(key(packId, code), status);
}
