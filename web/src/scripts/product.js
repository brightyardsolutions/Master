// allocivo.brightyard.in and xessly.brightyard.in: the features the product pages ran in the old app.js, in order.
import { run } from './lib/boot.js';
import draft from './features/draft.js';
import demos from './features/demos.js';
import productForms from './features/product-forms.js';
import liveDemos from './features/live-demos.js';
import core from './features/core.js';
import pointerFx from './features/pointer-fx.js';
import a11y from './features/a11y.js';

run([draft, demos, productForms, liveDemos, core, pointerFx, a11y]);
