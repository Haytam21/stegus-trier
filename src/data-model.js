// Data model utilities for Stegus — pure, testable functions.
// City data, pack merging, profile filtering, dependency sorting, deadline formatting.

// City data with coordinates for on-device nearest-city computation.
// No coordinates are stored or sent anywhere; nearest city is computed client-side only.
export const CITIES = [
  { id: 'trier', name: 'Trier', lat: 49.7567, lon: 6.6424, status: 'verified' },
  { id: 'berlin', name: 'Berlin', lat: 52.5200, lon: 13.4050, status: 'verified' },
  { id: 'munich', name: 'Munich', lat: 48.1351, lon: 11.5820, status: 'national-only' },
  { id: 'hamburg', name: 'Hamburg', lat: 53.5511, lon: 9.9937, status: 'national-only' }
];

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestCity(lat, lon) {
  let best = null;
  let bestDist = Infinity;
  for (const c of CITIES) {
    const d = haversine(lat, lon, c.lat, c.lon);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

export function mergePacks(national, overlay) {
  const merged = [...national.national_baseline];
  for (const block of overlay.city_overlay) {
    const idx = merged.findIndex(b => b.id === block.id);
    if (idx >= 0) {
      merged[idx] = block;
    } else {
      merged.push(block);
    }
  }
  return merged;
}

export function filterByProfile(blocks, isEU) {
  if (isEU) {
    return blocks.filter(b => b.id !== 'residence-permit');
  }
  return blocks;
}

export function sortByDependency(blocks) {
  const result = [];
  const done = new Set();
  let remaining = [...blocks];

  while (remaining.length > 0) {
    const next = [];
    let progressed = false;
    for (const block of remaining) {
      const depsMet = (block.depends_on || []).every(d => done.has(d));
      if (depsMet) {
        result.push(block);
        done.add(block.id);
        progressed = true;
      } else {
        next.push(block);
      }
    }
    if (!progressed) break;
    remaining = next;
  }
  return result;
}

export function isLocked(block, progress) {
  return (block.depends_on || []).some(d => progress[d] !== 'done');
}

export function formatDeadline(arrivalDate, deadlineDays) {
  if (!arrivalDate || deadlineDays === null || deadlineDays === undefined) return '';
  const arrival = new Date(arrivalDate);
  const deadline = new Date(arrival);
  deadline.setDate(arrival.getDate() + deadlineDays);
  const now = new Date();
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  return `Due in ${diffDays} days`;
}
