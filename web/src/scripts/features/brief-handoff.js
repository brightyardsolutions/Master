// Yardie in the menu (features/service-router.js) on any page but home: the brief goes with the visitor to the
// generator on the home page, which runs it (features/lead.js). On the home page lead.js runs it in place.
import { href, stash } from '../lib/site.js';
import { navigate } from '../lib/nav.js';

export default function init() {
  window.BYRunBrief = function (text) {
    const t = String(text || '').trim().slice(0, 4000);
    if (t.length < 4) return;
    stash('by-brief', t);
    navigate(href('home/bpgen'));
  };
}
