// The 3D scenes (and three.js with them) load only when a page asks for them, and never with reduced motion.
import { reduced } from './dom.js';
let scenes = null;
export function loadScenes() {
  if (!scenes) scenes = reduced ? Promise.resolve(null) : import('../scenes/scenes.js').then(S => (S.supported() ? S : null), () => null);
  return scenes;
}
