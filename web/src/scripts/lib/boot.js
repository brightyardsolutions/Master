// Runs a page's features in order. Each one runs on its own, so one failing never stops the rest
// (the old app.js wrapped each part in try/catch for the same reason).
export function run(features) {
  for (const f of features) {
    if (!f) continue;
    try { f(); } catch (e) { console.error(e); }
  }
}
