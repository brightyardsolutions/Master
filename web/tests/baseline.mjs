// The reference the comparison tests (compare.mjs, behaviour.mjs, axe.mjs) check against: the three sites as they
// were before the move to Astro, built by the old build-src/ and live until 14 November 2026. Those files were removed
// from the repository in step 5, so they are taken from git history (the commit that switched the sites to web/,
// which still contained them) into tests/.baseline/ (not committed) the first time a test needs them.
// These tests prove the new sites look and behave like the old ones; after a deliberate design change they will
// report that change as a difference.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASELINE_COMMIT = '049e41e15e824064f52230a546eb9203a560b45c';

export function baseline() {
  const dir = fileURLToPath(new URL('./.baseline/', import.meta.url));
  if (!existsSync(join(dir, 'index.html'))) {
    mkdirSync(dir, { recursive: true });
    execSync(`git archive ${BASELINE_COMMIT} index.html assets vendor sites favicon.svg | tar -x -C "${dir}"`, { cwd: fileURLToPath(new URL('../..', import.meta.url)), stdio: 'inherit' });   // run from the repository root
  }
  return dir;
}
