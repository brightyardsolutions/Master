import main from './main/site.mjs';
import allocivo from './allocivo/site.mjs';
import xessly from './xessly/site.mjs';

export const SITES = { main, allocivo, xessly };
export const PRODUCTS = { allocivo, xessly };

export function siteKey(value) {
  const key = (value || 'main').trim().toLowerCase();
  if (!SITES[key]) throw new Error(`ASTRO_SITE must be one of ${Object.keys(SITES).join(', ')} (got "${value}")`);
  return key;
}
