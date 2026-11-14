// Turns the old hash targets ("services/svc-eng", "allocivo/al-demo", "home/bpgen") into real addresses.
// Components write link('contact') instead of hard-coding paths, so one table decides where every link goes.
// The same table drives the forwarder that sends old brightyard.in/#/... addresses to the new pages.
import { SITES, PRODUCTS } from '../sites/index.mjs';

const MAIN = SITES.main;
const MAIN_PATH = Object.fromEntries(MAIN.routes.filter(r => r.hash).map(r => [r.hash, r.path]));

// brightyard.in -> product sites: the same map the old app.js used (PMAP) (it differs slightly from the
// product sites' own anchors, e.g. xs-who goes to #xs-routes), kept exactly so links land where they land today.
export const PRODUCT_LINKS = {
  allocivo: { 'al-problem': 'how-it-works/#al-problem', 'al-how': 'how-it-works/#al-how', 'al-uses': 'how-it-works/#al-uses', 'al-systems': 'integrations/', 'al-demo': 'demo/', 'al-value': '#al-value', 'al-calc': '#al-calc' },
  xessly: { 'xs-problem': '#xs-problem', 'xs-routes': '#xs-routes', 'xs-who': '#xs-routes', 'xs-how': 'agent-flow/', 'xs-where': 'where-fixes-land/', 'xs-faq': 'early-access/#xs-faq', 'xs-access': 'early-access/' },
};

/** Address of a brightyard.in page (path only, or absolute when `absolute` is true). */
export function mainLink(target, absolute = false) {
  const [id, anchor] = String(target).replace(/^#?\/?/, '').split('/');
  const path = MAIN_PATH[id || 'home'] || '/';
  return (absolute ? MAIN.url : '') + path + (anchor ? '#' + anchor : '');
}

/** Address for an old hash target, as seen from the site being built (`here` = main | allocivo | xessly). */
export function link(target, here = 'main') {
  const t = String(target).replace(/^#?\/?/, '');
  const [id, anchor] = t.split('/');
  const product = PRODUCTS[id];
  if (here === 'main') {
    if (product) return product.url + '/' + ((anchor && PRODUCT_LINKS[id][anchor]) || '');
    return mainLink(t);
  }
  // on a product site: the rules of the old product build
  if (product) {
    const base = id === here ? '/' : product.url + '/';
    if (!anchor) return base;
    return base + (product.anchors[anchor] ?? '') + '#' + anchor;
  }
  return mainLink(t, true);
}
