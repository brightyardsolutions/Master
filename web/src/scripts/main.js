// brightyard.in: every page runs these features, in the order the old app.js ran them. A page adds its own
// features (passed in by its entry in pages/) in their old place in that order, so behaviour stays the same.
import { run } from './lib/boot.js';
import draft from './features/draft.js';
import demos from './features/demos.js';
import megamenu from './features/megamenu.js';
import signature from './features/signature.js';
import briefHandoff from './features/brief-handoff.js';
import core from './features/core.js';
import pointerFx from './features/pointer-fx.js';
import assistant from './features/assistant.js';
import a11y from './features/a11y.js';
import serviceRouter from './features/service-router.js';
import productCards from './features/product-cards.js';

export function startMain(p = {}) {
  run([
    draft, p.cases, demos, p.contactForm,
    megamenu,
    p.blueprint, signature,
    p.lead || briefHandoff,
    core, p.heroCopy, p.codeDemo, pointerFx, p.caseFilters, assistant,
    a11y,
    serviceRouter, productCards,
  ]);
}
