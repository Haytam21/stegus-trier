// Pack loading pipeline for Stegus — fetch, merge, filter, sort.
// Returns data only; no DOM, no side effects except fetch.
// Deep module: small interface (cityId, isEU), hides all pipeline complexity.
import { CITIES, mergePacks, filterByProfile, sortByDependency } from './data-model.js';

export async function loadMergedPack(cityId, isEU) {
  const [natRes, ovRes] = await Promise.all([
    fetch('./content/packs/national.json'),
    fetch(`./content/packs/${cityId}.json`),
  ]);

  if (!natRes.ok) {
    throw new Error('National pack not found: ' + natRes.status);
  }

  const national = await natRes.json();

  let overlay;
  if (ovRes.ok) {
    overlay = await ovRes.json();
  } else {
    overlay = { city_overlay: [] };
  }

  const merged = mergePacks(national, overlay);
  const filtered = filterByProfile(merged, isEU);
  const sorted = sortByDependency(filtered);

  const cityInfo = CITIES.find(c => c.id === cityId);

  return { cityInfo, blocks: sorted };
}
