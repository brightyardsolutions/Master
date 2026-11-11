/* BrightYard 3D scenes. Source file: bundled with three.js into assets/js/scenes.js (see README). */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, Group, Mesh, Points, Line, Sprite,
  BufferGeometry, BufferAttribute, Float32BufferAttribute, SphereGeometry, BoxGeometry, PlaneGeometry,
  TorusGeometry, RingGeometry, CapsuleGeometry, CylinderGeometry, InstancedMesh, Object3D,
  ShaderMaterial, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial, LineBasicMaterial, SpriteMaterial,
  CanvasTexture, AmbientLight, DirectionalLight, PointLight, Vector2, Vector3, Raycaster, Plane,
  QuadraticBezierCurve3, DoubleSide, AdditiveBlending, SRGBColorSpace, ACESFilmicToneMapping, MathUtils, LinearFilter
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const LIME = 0xC6F432, IND = 0x4F46E5, MINT = 0x8FF2CC;
const clamp = MathUtils.clamp, lerp = MathUtils.lerp;
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const ease = t => t * t * (3 - 2 * t);
const low = () => innerWidth < 820 || (navigator.deviceMemory && navigator.deviceMemory < 4);

export function supported() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}

/* ---------- helpers ---------- */
function label(text, o = {}) {
  const fs = o.size || 46, pad = o.bg ? 22 : 6, c = document.createElement('canvas'), x = c.getContext('2d');
  const font = (o.weight || 600) + ' ' + fs + 'px ' + (o.font || 'Inter, system-ui, sans-serif');
  x.font = font; const w = Math.ceil(x.measureText(text).width) + pad * 2, h = fs + pad * 1.5;
  c.width = w; c.height = h; x.font = font;
  if (o.bg) { x.fillStyle = o.bg; const r = h / 2; x.beginPath(); x.moveTo(r, 0); x.arcTo(w, 0, w, h, r); x.arcTo(w, h, 0, h, r); x.arcTo(0, h, 0, 0, r); x.arcTo(0, 0, w, 0, r); x.fill(); }
  x.fillStyle = o.color || '#fff'; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(text, w / 2, h / 2 + 2);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.minFilter = LinearFilter;
  const s = new Sprite(new SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false }));
  const k = (o.scale || 1) * 0.0082; s.scale.set(w * k, h * k, 1); s.renderOrder = 10; s.userData.base = s.scale.clone();
  return s;
}
function show(s, a) { s.visible = a > 0.01; if (s.material) s.material.opacity = a; if (s.userData.base) s.scale.copy(s.userData.base).multiplyScalar(0.7 + 0.3 * a); }
function tile(bodyColor, dotColor, pattern) {
  const g = new Group();
  const body = new Mesh(new RoundedBoxGeometry(3.6, 3.6, 0.8, 6, 0.75), new MeshPhysicalMaterial({ color: bodyColor, roughness: 0.32, metalness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.25 }));
  g.add(body); g.userData.dots = [];
  const geo = new SphereGeometry(0.27, 28, 20);
  for (let i = 0; i < 9; i++) {
    const on = pattern.indexOf(i) > -1;
    const m = on ? new MeshStandardMaterial({ color: dotColor, emissive: dotColor, emissiveIntensity: 0.85, roughness: 0.4 })
      : new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.6 });
    const d = new Mesh(geo, m); d.position.set((i % 3 - 1) * 0.87, (1 - Math.floor(i / 3)) * 0.87, 0.36); d.userData.on = on;
    g.add(d); g.userData.dots.push(d);
  }
  return g;
}
class Beam {
  constructor(parent, color, n = 3) {
    this.geo = new BufferGeometry(); this.geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(41 * 3), 3));
    this.line = new Line(this.geo, new LineBasicMaterial({ color, transparent: true, opacity: 0 }));
    this.curve = new QuadraticBezierCurve3(new Vector3(), new Vector3(), new Vector3());
    this.pulses = []; const pg = new SphereGeometry(0.075, 10, 8);
    for (let i = 0; i < n; i++) { const m = new Mesh(pg, new MeshBasicMaterial({ color, transparent: true })); this.pulses.push(m); parent.add(m); }
    parent.add(this.line); this.a = 0;
  }
  set(a, b, lift = 2) {
    this.curve.v0.copy(a); this.curve.v2.copy(b); this.curve.v1.copy(a).lerp(b, 0.5); this.curve.v1.y += lift;
    const pos = this.geo.attributes.position; for (let i = 0; i <= 40; i++) { const v = this.curve.getPoint(i / 40); pos.setXYZ(i, v.x, v.y, v.z); } pos.needsUpdate = true; return this;
  }
  update(t, a, speed = 0.45) {
    this.a = a; this.line.visible = a > 0.01; this.line.material.opacity = a * 0.4;
    this.pulses.forEach((m, i) => { m.visible = a > 0.01; const u = (t * speed + i / this.pulses.length) % 1; m.position.copy(this.curve.getPoint(u)); m.material.opacity = a * Math.sin(Math.PI * u); });
  }
}

/* ---------- base stage ---------- */
class Stage {
  constructor(canvas, o) {
    this.canvas = canvas; this.low = low();
    this.r = new WebGLRenderer({ canvas, antialias: !this.low, powerPreference: 'high-performance' });
    this.r.setPixelRatio(Math.min(devicePixelRatio || 1, this.low ? 1.25 : 1.75));
    this.r.toneMapping = ACESFilmicToneMapping; this.r.toneMappingExposure = 1.05;
    this.scene = new Scene(); this.scene.background = new Color(o.bg); this.scene.fog = new Fog(o.bg, o.fog[0], o.fog[1]);
    this.cam = new PerspectiveCamera(o.fov || 36, 1, 0.1, 200);
    this.scene.add(new AmbientLight(0xffffff, o.ambient || 0.9));
    const d = new DirectionalLight(0xffffff, 1.6); d.position.set(6, 12, 9); this.scene.add(d);
    if (!this.low) {
      this.comp = new EffectComposer(this.r); this.comp.addPass(new RenderPass(this.scene, this.cam));
      this.bloom = new UnrealBloomPass(new Vector2(256, 256), o.bloom || 0.3, 0.55, 0.92); this.comp.addPass(this.bloom); this.comp.addPass(new OutputPass());
    }
    this.t0 = performance.now(); this.vis = false; this.on = false; this.offset = 0; this.W = 1; this.H = 1;
    this.io = new IntersectionObserver(e => { this.vis = e[0].isIntersecting; }); this.io.observe(canvas);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(canvas.parentNode);
    this.tick = this.tick.bind(this);
  }
  resize() {
    const p = this.canvas.parentNode, w = p.clientWidth, h = p.clientHeight; if (!w || !h) return;
    this.W = w; this.H = h; this.r.setSize(w, h, false); if (this.comp) this.comp.setSize(w, h);
    this.cam.aspect = w / h;
    if (this.offset && w > 900) this.cam.setViewOffset(w, h, -w * this.offset, 0, w, h); else this.cam.clearViewOffset();
    this.cam.updateProjectionMatrix(); this.layout && this.layout(w, h);
  }
  start() { if (this.on) return; this.on = true; this.resize(); requestAnimationFrame(this.tick); }
  stop() { this.on = false; }
  tick() {
    if (!this.on) return; requestAnimationFrame(this.tick);
    if (!this.vis || document.hidden) return;
    const now = performance.now(), dt = Math.min(0.1, (now - (this.ln || now)) / 1000); this.ln = now; if (!this.paused) this.time = (this.time || 0) + dt; this.update(this.time || 0);
    if (this.comp) this.comp.render(); else this.r.render(this.scene, this.cam);
  }
  renderOnce() { this.resize(); this.update(2); if (this.comp) this.comp.render(); else this.r.render(this.scene, this.cam); }
}

/* ====================================================================== */
/* HERO: the yard at work. Agents read a brief, write and test the code,  */
/* an engineer approves it, and the finished product ships. On a loop.    */
/* ====================================================================== */
const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const CODE = [
  [['// build-agent · PR #128', 'c']],
  [['export async function ', 'k'], ['cartTotal', 'f'], ['(cart) {', 'd']],
  [['  const ', 'k'], ['key = ', 'd'], ['`total:${cart.id}`', 's'], [';', 'd']],
  [['  const ', 'k'], ['hit = ', 'd'], ['await ', 'k'], ['cache.', 'd'], ['get', 'f'], ['(key);', 'd']],
  [['  if ', 'k'], ['(hit) ', 'd'], ['return ', 'k'], ['hit;', 'd']],
  [['  const ', 'k'], ['total = ', 'd'], ['sum', 'f'], ['(cart.items);', 'd']],
  [['  await ', 'k'], ['cache.', 'd'], ['set', 'f'], ['(key, total, { ttl: ', 'd'], ['60', 'n'], [' });', 'd']],
  [['  return ', 'k'], ['total;', 'd']],
  [['}', 'd']]
];
const CC = { c: '#7A77A8', k: '#A39DFF', f: '#C6F432', s: '#8FF2CC', n: '#F6C453', d: '#E6E4FF' };
const CODE_LEN = CODE.map(l => l.reduce((s, t) => s + t[0].length, 0));
const CODE_TOTAL = CODE_LEN.reduce((a, b) => a + b, 0);
const CW = 1024, CH = 704, PW = 4.0, PH = 2.75, LH = 56, LY = 118, GX = 84, FS = 27;
const CYCLE = 16;

function rrect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

function productTexture() {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH; const x = c.getContext('2d');
  x.fillStyle = '#FBFAFF'; x.fillRect(0, 0, CW, CH);
  x.fillStyle = '#4F46E5'; rrect(x, 44, 34, 44, 44, 12); x.fill();
  x.fillStyle = '#C6F432'; [[56, 46], [76, 46], [66, 56], [66, 66]].forEach(p => { x.beginPath(); x.arc(p[0], p[1], 4, 0, 7); x.fill(); });
  x.fillStyle = '#D9D4FA'; [[610, 70], [700, 70], [790, 60]].forEach(p => { rrect(x, p[0], 48, p[1], 16, 8); x.fill(); });
  x.fillStyle = '#22C55E'; rrect(x, 884, 38, 96, 36, 18); x.fill();
  x.fillStyle = '#fff'; x.font = '600 20px Inter, system-ui, sans-serif'; x.textBaseline = 'middle'; x.fillText('● Live', 902, 57);
  x.fillStyle = '#1E1B4B'; rrect(x, 44, 132, 430, 44, 10); x.fill(); rrect(x, 44, 190, 330, 44, 10); x.fill();
  x.fillStyle = '#B9B5DE'; rrect(x, 44, 262, 400, 16, 8); x.fill(); rrect(x, 44, 290, 300, 16, 8); x.fill();
  x.fillStyle = '#C6F432'; rrect(x, 44, 340, 190, 58, 16); x.fill();
  x.fillStyle = '#1E1B4B'; rrect(x, 78, 362, 122, 14, 7); x.fill();
  x.fillStyle = '#F1EEFF'; rrect(x, 560, 124, 420, 290, 26); x.fill();
  [[0.45, '#4F46E5'], [0.7, '#C6F432'], [0.55, '#4F46E5'], [0.85, '#C6F432'], [0.65, '#4F46E5'], [1, '#C6F432']].forEach((b, i) => { x.fillStyle = b[1]; const h = 210 * b[0]; rrect(x, 596 + i * 60, 384 - h, 40, h, 8); x.fill(); });
  [0, 1, 2].forEach(i => {
    x.fillStyle = '#fff'; rrect(x, 44 + i * 316, 462, 300, 200, 22); x.fill(); x.strokeStyle = '#E4E0FB'; x.lineWidth = 2; x.stroke();
    x.fillStyle = i === 1 ? '#C6F432' : '#EEEDFF'; rrect(x, 68 + i * 316, 486, 56, 56, 16); x.fill();
    x.fillStyle = '#1E1B4B'; rrect(x, 68 + i * 316, 566, 180, 16, 8); x.fill();
    x.fillStyle = '#C9C5E8'; rrect(x, 68 + i * 316, 598, 230, 12, 6); x.fill(); rrect(x, 68 + i * 316, 622, 160, 12, 6); x.fill();
  });
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t;
}
function briefTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 328; const x = c.getContext('2d');
  x.fillStyle = '#FBFAFF'; rrect(x, 0, 0, 256, 328, 22); x.fill();
  x.fillStyle = '#4F46E5'; x.font = '700 24px Inter, system-ui, sans-serif'; x.fillText('BRIEF', 26, 50);
  x.fillStyle = '#1E1B4B'; rrect(x, 26, 76, 180, 16, 8); x.fill();
  x.fillStyle = '#C9C5E8'; [110, 136, 162, 198, 224, 250, 276].forEach((y, i) => { rrect(x, 26, y, [204, 170, 190, 204, 150, 184, 120][i], 11, 5); x.fill(); });
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

export class Hero extends Stage {
  constructor(canvas) {
    super(canvas, { bg: 0x0B0A24, fog: [16, 52], fov: 38, ambient: 0.9, bloom: 0.3 });
    this.p = 0; this.ptr = new Vector3(0, 0, 999); this.mouse = new Vector2(); this.tm = new Vector2(); this.ts = 1; this.home = new Vector3(4.4, 3.5, 0);
    const S = this.scene;

    /* the yard: a field of signals */
    const NX = this.low ? 90 : 150, NZ = this.low ? 46 : 70, sp = 0.5, pos = new Float32Array(NX * NZ * 3), rnd = new Float32Array(NX * NZ);
    let k = 0;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { pos[k * 3] = (i - NX / 2) * sp; pos[k * 3 + 1] = 0; pos[k * 3 + 2] = (j - NZ + 14) * sp; rnd[k] = Math.random(); k++; }
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(pos, 3)); g.setAttribute('aR', new BufferAttribute(rnd, 1));
    this.fm = new ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uT: { value: 0 }, uP: { value: this.ptr }, uPx: { value: 1 }, uIn: { value: 0 } },
      vertexShader: `uniform float uT;uniform vec3 uP;uniform float uPx;uniform float uIn;attribute float aR;varying float vG;varying float vF;varying float vR;
        void main(){vec3 p=position;
        float w=sin(p.x*.42+uT*.7)*.3+cos(p.z*.5+uT*.5)*.28+sin((p.x+p.z)*.2+uT*.3)*.4;
        float d=distance(p.xz,uP.xz);float g=smoothstep(5.,0.,d);
        float ripple=sin(d*1.6-uT*2.4)*.18*smoothstep(11.,0.,d);
        p.y+=(w+g*1.2+ripple)*uIn;vG=g;vR=aR;
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=uPx*(1.3+g*2.6+aR*.9)*(26./-mv.z);
        vF=smoothstep(52.,14.,-mv.z)*uIn;}`,
      fragmentShader: `varying float vG;varying float vF;varying float vR;
        void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,.2,d);
        vec3 c=mix(vec3(.42,.38,1.),vec3(.776,.957,.196),clamp(vG*1.3+step(.985,vR),0.,1.));
        gl_FragColor=vec4(c,a*vF*(.6+vG*.5+step(.985,vR)*.4));}`
    });
    S.add(new Points(g, this.fm));

    /* the workshop */
    const W = this.ws = new Group(); S.add(W);
    this.tile = tile(IND, LIME, [0, 2, 4, 7]); this.tile.scale.setScalar(0.24); this.tile.position.set(0, 2.55, -0.2); W.add(this.tile);

    const P = this.panel = new Group(); W.add(P);
    P.add(new Mesh(new RoundedBoxGeometry(4.24, 2.99, 0.12, 4, 0.06), new MeshPhysicalMaterial({ color: 0x6C63FF, emissive: 0x4F46E5, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.2, clearcoat: 0.7 })));
    this.cc = document.createElement('canvas'); this.cc.width = CW; this.cc.height = CH; this.cx = this.cc.getContext('2d');
    this.ct = new CanvasTexture(this.cc); this.ct.colorSpace = SRGBColorSpace; this.ct.anisotropy = 4;
    const front = new Mesh(new PlaneGeometry(PW, PH), new MeshBasicMaterial({ map: this.ct })); front.position.z = 0.066; P.add(front);
    const back = new Mesh(new PlaneGeometry(PW, PH), new MeshBasicMaterial({ map: productTexture(), color: 0xB4B4C2 })); back.position.z = -0.066; back.rotation.y = Math.PI; P.add(back);
    this.ripples = [0, 1, 2].map(() => { const m = new Mesh(new RingGeometry(1.5, 1.56, 80), new MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false })); m.position.z = -0.12; P.add(m); return m; });
    this.pglow = new PointLight(LIME, 0, 9); W.add(this.pglow);

    const agent = (name, x, y, z) => {
      const a = new Group(), head = new Group();
      head.add(new Mesh(new SphereGeometry(0.31, 32, 24), new MeshPhysicalMaterial({ color: 0x5A52F0, emissive: 0x4F46E5, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.2, clearcoat: 1 })));
      const eyeM = new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 0.25 });
      const eye = new Mesh(new SphereGeometry(0.1, 18, 14), eyeM); eye.position.z = 0.262; head.add(eye);
      const visM = new MeshStandardMaterial({ color: 0xffffff, emissive: 0xB8B3FF, emissiveIntensity: 0.5 });
      const vis = new Mesh(new TorusGeometry(0.2, 0.026, 8, 40), visM); vis.position.z = 0.2; head.add(vis);
      const halo = new Mesh(new TorusGeometry(0.48, 0.014, 6, 64), new MeshBasicMaterial({ color: 0xC6F432, transparent: true, opacity: 0.3 })); halo.rotation.x = Math.PI / 2;
      const l = label(name, { size: 30, bg: 'rgba(11,10,36,.88)', color: '#C6F432', font: MONO, weight: 500 }); l.position.y = -0.62;
      a.add(head, halo, l); a.position.set(x, y, z); a.userData = { head, eyeM, visM, halo, l, home: new Vector3(x, y, z), k: 0 }; W.add(a); return a;
    };
    this.agents = [agent('plan-agent', -2.7, 1.55, 0.8), agent('build-agent', -2.85, -0.55, 1.0), agent('test-agent', -1.25, -2.2, 1.1), agent('a11y-agent', 1.15, -2.2, 1.1), agent('ship-agent', 2.7, 1.45, 0.8)];
    const E = this.eng = new Group(), em = new MeshStandardMaterial({ color: 0xE6E4FF, emissive: 0xE6E4FF, emissiveIntensity: 0.1, roughness: 0.5 });
    const eb = new Mesh(new CapsuleGeometry(0.15, 0.3, 4, 12), em); eb.position.y = -0.12; const eh = new Mesh(new SphereGeometry(0.13, 20, 14), em); eh.position.y = 0.33;
    const el = label('engineer', { size: 30, bg: '#E6E4FF', color: '#1E1B4B', font: MONO, weight: 500 }); el.position.y = -0.66;
    E.add(eb, eh, el); E.position.set(2.8, -0.7, 1.0); E.userData = { m: em, home: E.position.clone(), l: el, k: 0 }; W.add(E);

    this.brief = new Mesh(new PlaneGeometry(0.92, 1.18), new MeshBasicMaterial({ map: briefTexture(), transparent: true, color: 0xB8B8C6 })); W.add(this.brief);
    this.bscan = new Mesh(new PlaneGeometry(0.92, 0.035), new MeshBasicMaterial({ color: LIME, transparent: true })); this.bscan.position.z = 0.01; this.brief.add(this.bscan);

    const pill = (t, bg, color) => { const s = label(t, { size: 34, bg, color }); W.add(s); show(s, 0); return s; };
    this.caps = [pill('Reading the brief', '#C6F432', '#0B0A24'), pill('Writing code', '#C6F432', '#0B0A24'), pill('448 tests passed', '#3DDC97', '#0B0A24'), pill('0 accessibility issues', '#8FF2CC', '#0B0A24'), pill('Shipped to production', '#C6F432', '#0B0A24'), pill('Approved by an engineer', '#E6E4FF', '#1E1B4B')];
    this.beam = new Beam(S, LIME, 3); this.ebeam = new Beam(S, 0xffffff, 3); this.link = new Beam(S, 0x8F88FF, 2);

    this.sig = []; const sg = new SphereGeometry(0.06, 10, 8), N = this.low ? 8 : 14;
    for (let i = 0; i < N; i++) {
      const c = new QuadraticBezierCurve3(new Vector3((Math.random() - 0.5) * 34, 0.2, -18 + Math.random() * 22), new Vector3(), new Vector3());
      const m = new Mesh(sg, new MeshBasicMaterial({ color: LIME, transparent: true }));
      const lg = new BufferGeometry(); lg.setAttribute('position', new Float32BufferAttribute(new Float32Array(31 * 3), 3));
      const ln = new Line(lg, new LineBasicMaterial({ color: 0x8F88FF, transparent: true, opacity: 0.08 }));
      S.add(m, ln); this.sig.push({ c, m, ln, o: Math.random(), s: 0.09 + Math.random() * 0.1, d: [0, 2, 4, 7][i % 4] });
    }
    this.ray = new Raycaster(); this.plane = new Plane(new Vector3(0, 1, 0), 0); this.hit = new Vector3();
    this._a = new Vector3(); this._b = new Vector3(); this._t = new Vector3(); this.key = '';
    this.draw(0, 0, -1, 0, true);
  }
  layout(w, h) {
    const wide = w / h > 1.05, a = w / h;
    this.home.set(wide ? Math.min(3.85, a * 2.2) : 0, wide ? 3.55 : 5.35, wide ? 0 : -1.5);
    this.ts = wide ? Math.min(0.9, 0.52 + a * 0.22) : 0.45;
    this.fm.uniforms.uPx.value = this.r.getPixelRatio() * (wide ? 1 : 0.8);
  }
  pointer(nx, ny) { this.tm.set(nx, ny); }
  setScroll(p) { this.p = p; }

  /* code panel texture: redrawn only when its state changes */
  draw(chars, ticks, scan, foot, blink) {
    const key = chars + '|' + ticks + '|' + Math.round(scan * 40) + '|' + foot + '|' + (blink ? 1 : 0); if (key === this.key) return; this.key = key;
    const x = this.cx; x.fillStyle = '#15123C'; x.fillRect(0, 0, CW, CH);
    x.fillStyle = '#221E5E'; x.fillRect(0, 0, CW, 64);
    ['#F0554E', '#F6C453', '#3DDC97'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(38 + i * 30, 32, 8, 0, 7); x.fill(); });
    x.textBaseline = 'middle'; x.font = '500 22px ' + MONO; x.fillStyle = '#A9A5DC'; x.fillText('checkout/cart-total.ts', 140, 33);
    x.fillStyle = 'rgba(198,244,50,.16)'; rrect(x, CW - 160, 15, 130, 34, 17); x.fill(); x.fillStyle = '#C6F432'; x.fillText('PR #128', CW - 141, 33);
    if (scan >= 0) { x.fillStyle = 'rgba(143,242,204,.14)'; x.fillRect(0, LY - LH / 2 + scan * LH * CODE.length - 30, CW, 60); x.fillStyle = '#8FF2CC'; x.fillRect(0, LY - LH / 2 + scan * LH * CODE.length, CW, 3); }
    x.font = FS + 'px ' + MONO; const cw = x.measureText('M').width; let left = chars; this.cur = null;
    for (let i = 0; i < CODE.length; i++) {
      const y = LY + i * LH;
      if (i < ticks) { x.fillStyle = '#3DDC97'; x.fillText('✓', 34, y); } else if (left > 0 || i === 0) { x.fillStyle = '#4B4880'; x.fillText(String(i + 1), 34, y); }
      if (left <= 0) continue;
      let cx = GX;
      for (const tk of CODE[i]) { if (left <= 0) break; const s = tk[0].slice(0, left); x.fillStyle = CC[tk[1]]; x.fillText(s, cx, y); cx += s.length * cw; left -= s.length; }
      if (left <= 0 || i === CODE.length - 1) this.cur = [cx, y];
    }
    if (this.cur && blink && chars < CODE_TOTAL) { x.fillStyle = '#C6F432'; x.fillRect(this.cur[0] + 3, this.cur[1] - 15, 13, 30); }
    const F = [['✓ 448 tests passed', '#3DDC97'], ['✓ 0 accessibility issues', '#8FF2CC'], ['✓ Approved by an engineer', '#E6E4FF']];
    x.font = '500 21px ' + MONO; let fx = 34;
    for (let i = 0; i < foot; i++) { x.fillStyle = F[i][1]; x.fillText(F[i][0], fx, CH - 38); fx += x.measureText(F[i][0]).width + 34; }
    this.ct.needsUpdate = true;
  }
  /* canvas pixel on the code panel -> world position */
  at(px, py, out) { out.set((px / CW - 0.5) * PW, (0.5 - py / CH) * PH, 0.1); return this.panel.localToWorld(out); }

  update(t) {
    const p = this.p, intro = ease(seg(t, 0.1, 1.8)), W = this.ws;
    this.mouse.lerp(this.tm, 0.06);
    this.fm.uniforms.uT.value = t; this.fm.uniforms.uIn.value = intro;
    this.cam.position.set(this.mouse.x * 0.5, 3.3 - p * 1.5 + this.mouse.y * 0.2, 13.5 - p * 5.5);
    this.cam.lookAt(0, 2.3 - p * 0.6, 0);
    this.ray.setFromCamera(this.mouse, this.cam);
    if (this.ray.ray.intersectPlane(this.plane, this.hit)) this.ptr.lerp(this.hit, 0.12);

    const u = t < 1.6 ? 0 : (t - 1.6) % CYCLE, live = t >= 1.6;
    const end = u > 15.3;
    const chars = end ? 0 : Math.floor(CODE_TOTAL * seg(u, 2.3, 6.8)), ticks = end ? 0 : Math.floor(CODE.length * seg(u, 7.25, 8.85) + 0.001);
    const scan = u > 7.1 && u < 8.95 ? seg(u, 7.1, 8.95) : -1, foot = end ? 0 : (u > 8.95 ? 1 : 0) + (u > 9.9 ? 1 : 0) + (u > 11.5 ? 1 : 0);
    const flip = ease(seg(u, 12.3, 13.3)) - ease(seg(u, 15.3, 15.95)), served = ease(seg(u, 13.3, 13.9)) * (1 - seg(u, 15.1, 15.5));
    const act = !live ? -1 : u < 2.25 ? 0 : u < 7.0 ? 1 : u < 9.1 ? 2 : u < 10.6 ? 3 : u < 12.25 ? 5 : u < 15.2 ? 4 : -1;
    if (flip < 0.5) this.draw(chars, ticks, scan, foot, Math.floor(t * 2.5) % 2 === 0);

    W.position.set(this.home.x, this.home.y + Math.sin(t * 0.7) * 0.1 + p * 4.5, this.home.z);
    W.scale.setScalar(Math.max(0.001, this.ts * (1 - p * 0.3) * ease(seg(t, 0.25, 1.5))));
    W.rotation.set(-this.mouse.y * 0.1 + p * 0.5, this.mouse.x * 0.18 + p * 1.1, 0);
    const P = this.panel;
    P.rotation.set(Math.sin(t * 0.6) * 0.02 - 0.03, -0.3 + flip * Math.PI + Math.sin(t * 0.45) * 0.035, 0);
    P.position.set(0, served * 0.12, served * 1.0); P.scale.setScalar(1 + served * 0.07);
    this.pglow.position.set(0, 0, 2.2); this.pglow.intensity = served * 4;
    this.ripples.forEach((m, i) => { const on = u > 13.5 && u < 15.3, rr = (u * 0.55 + i / 3) % 1; m.material.opacity = on ? (1 - rr) * 0.4 : 0; m.visible = on; m.scale.setScalar(0.6 + rr * 1.1); });
    this.tile.rotation.set(-0.1, Math.sin(t * 0.5) * 0.4, 0);
    this.tile.userData.dots.forEach((d, i) => { if (d.userData.on) d.material.emissiveIntensity = 0.7 + Math.sin(t * 3 + i) * 0.25; });
    W.updateMatrixWorld(true);

    /* the brief arrives and is read */
    const bin = ease(seg(u, 0.1, 0.9)), mg = ease(seg(u, 1.75, 2.3)), B = this.brief;
    B.visible = live && u < 2.32;
    this._a.set(-5.6, 3.6, 1.6).lerp(this._b.set(-1.75, 1.45, 0.95), bin).lerp(this._b.set(-0.7, 0.3, 0.12), mg);
    B.position.copy(this._a); B.rotation.set(0, -0.3 + (1 - bin) * 0.9, (1 - bin) * 0.5 - 0.06); B.scale.setScalar(Math.max(0.001, (1 - mg * 0.85) * (0.4 + 0.6 * bin)));
    B.material.opacity = 1 - seg(u, 2.1, 2.3);
    const bs = seg(u, 0.9, 1.7); this.bscan.visible = bs > 0 && bs < 1; this.bscan.position.y = 0.55 - bs * 1.1;

    /* who is working, and on what */
    const tg = this._t; let has = act > -1;
    if (act === 0) B.getWorldPosition(tg);
    else if (act === 1) this.at(this.cur ? this.cur[0] : GX, this.cur ? this.cur[1] : LY, tg);
    else if (act === 2) this.at(CW * (0.3 + 0.4 * Math.abs(Math.sin(t * 2))), LY - LH / 2 + Math.max(0, scan) * LH * CODE.length, tg);
    else if (act === 3) this.at(CW * 0.5 + Math.sin(t * 2.2) * 300, CH * 0.5 + Math.cos(t * 1.7) * 200, tg);
    else if (act === 5) this.at(CW * 0.72, CH - 38, tg);
    else if (act === 4) P.getWorldPosition(tg);
    const actors = this.agents.concat([this.eng]); let who = null;
    actors.forEach((a, i) => {
      const d = a.userData, on = i === act; d.k += ((on ? 1 : 0) - d.k) * 0.09;
      a.position.copy(d.home).lerp(this._a.set(0, 0, 0.9), d.k * 0.16); a.position.y += Math.sin(t * 1.3 + i * 1.7) * 0.07;
      a.scale.setScalar(1 + d.k * 0.22);
      if (i < 5) {
        d.eyeM.emissiveIntensity = 0.45 + d.k * 0.75 + (on ? Math.sin(t * 9) * 0.15 : 0); d.visM.emissiveIntensity = 0.3 + d.k * 0.6;
        d.halo.rotation.z = t * (0.4 + d.k * 2.2); d.halo.material.opacity = 0.25 + d.k * 0.55; d.halo.rotation.x = Math.PI / 2 + Math.sin(t * 0.8 + i) * 0.35;
        if (has && on) d.head.lookAt(tg); else { P.getWorldPosition(this._b); d.head.lookAt(this._b); }
      } else d.m.emissiveIntensity = 0.1 + d.k * 0.25;
      if (on) who = a;
    });
    W.updateMatrixWorld(true);
    if (who) who.getWorldPosition(this._a);
    const ag = who && act !== 5 ? 1 : 0, eg = act === 5 ? 1 : 0;
    if (who && act !== 5) this.beam.set(this._a, tg, 0.25); this.beam.update(t, ag * intro * (1 - p), 1.4);
    if (act === 5) this.ebeam.set(this._a, tg, 0.25); this.ebeam.update(t, eg * (1 - p), 1.4);
    if (who) { this.tile.getWorldPosition(this._b); this.link.set(this._b, this._a, 0.5); } this.link.update(t, (who ? 0.9 : 0) * (1 - p), 0.8);
    const cs = [seg(u, 0.9, 1.2) * (1 - seg(u, 2.0, 2.25)), seg(u, 2.5, 2.8) * (1 - seg(u, 6.8, 7.0)), seg(u, 8.7, 8.95) * (1 - seg(u, 9.0, 9.15)), seg(u, 9.75, 9.95) * (1 - seg(u, 10.4, 10.6)), seg(u, 13.5, 13.9) * (1 - seg(u, 15.0, 15.3)), seg(u, 11.4, 11.6) * (1 - seg(u, 12.1, 12.3))];
    const owner = [0, 1, 2, 3, 4, 5];
    this.caps.forEach((c, i) => { const a = actors[owner[i]]; c.position.copy(a.position); c.position.y += 0.74; c.position.z += 0.2; if (a.position.x > 2) c.position.x -= 0.95; show(c, live ? cs[i] : 0); });

    /* signals from the yard feed the orchestrator */
    this.sig.forEach(q => {
      this.tile.userData.dots[q.d].getWorldPosition(this._b);
      q.c.v2.copy(this._b); q.c.v1.copy(q.c.v0).lerp(this._b, 0.55); q.c.v1.y += 4.5;
      const v = (t * q.s + q.o) % 1; q.m.position.copy(q.c.getPoint(v)); q.m.material.opacity = Math.sin(Math.PI * v) * intro * (1 - p);
      const pos = q.ln.geometry.attributes.position; for (let i = 0; i <= 30; i++) { const w = q.c.getPoint(i / 30); pos.setXYZ(i, w.x, w.y, w.z); } pos.needsUpdate = true;
      q.ln.material.opacity = 0.07 * intro * (1 - p);
    });
  }
}

/* ---------- shared story camera ---------- */
class Story extends Stage {
  constructor(canvas, o) { super(canvas, o); this.p = 0; this.tp = 0; this.cp = new Vector3(); this.ct = new Vector3(); this._a = new Vector3(); this._b = new Vector3(); this.offset = 0.19; }
  setProgress(p) { this.tp = p; }
  step(t) { const dt = Math.min(0.12, Math.max(0, t - (this.lt == null ? t : this.lt))); this.lt = t; this.p += (this.tp - this.p) * (1 - Math.exp(-dt * 6.5)); }
  camera(t) {
    const K = this.K, p = clamp(this.p, 0, K.length - 1), i = Math.min(Math.floor(p), K.length - 2), f = ease(ease(p - i)), a = K[i], b = K[i + 1];
    const z = this.W < 900 ? (this.W / this.H < 1.1 ? (this.pz || 1.5) : 1.3) : 1.2;
    this._a.set(lerp(a.p[0], b.p[0], f), lerp(a.p[1], b.p[1], f), lerp(a.p[2], b.p[2], f));
    this._b.set(lerp(a.t[0], b.t[0], f), lerp(a.t[1], b.t[1], f), lerp(a.t[2], b.t[2], f));
    this._a.sub(this._b).multiplyScalar(z).add(this._b);
    this._a.x += Math.sin(t * 0.25) * 0.5; this._a.y += Math.cos(t * 0.2) * 0.22;
    this.cam.position.copy(this._a); this.cam.lookAt(this._b);
  }
}

/* ====================================================================== */
/* ALLOCIVO: a cutaway hotel. Signals in, decisions out.                  */
/* ====================================================================== */
const RS = { ready: 0x2FBF8F, dirty: 0x56737A, clean: LIME, insp: 0x5B8DEF, block: 0xF0554E, risk: 0xF5A524 };
export class Allocivo extends Story {
  constructor(canvas) {
    super(canvas, { bg: 0x06262A, fog: [26, 70], fov: 34, ambient: 1.0, bloom: 0.26 });
    this.K = [
      { p: [15, 9.5, 17], t: [0, 2.6, 0] }, { p: [3, 7.5, 21], t: [-4, 2.6, 0] }, { p: [12, 9.5, 14.5], t: [0.5, 2.9, 0] },
      { p: [14, 7, 13], t: [3.2, 2.7, 0.3] }, { p: [8, 12, 27], t: [-1, 5.8, 0] }, { p: [7, 11, 17], t: [0, 6.6, 0] },
      { p: [13.5, 7.5, 13.5], t: [2.6, 2.8, 0.2] }, { p: [2, 12.5, 23], t: [0, 5.6, 0] }, { p: [16, 10.5, 18], t: [0, 2.9, 0] }, { p: [19, 12.5, 23], t: [0, 3.2, 0] }
    ];
    this.pz = 1.55;
    const S = this.scene, FY = [0, 2.1, 4.2], FN = [2, 4, 5];
    this.rooms = {}; this.all = [];
    const rg = new RoundedBoxGeometry(1.2, 0.86, 1.5, 3, 0.12);
    const slab = new BoxGeometry(13.6, 0.14, 4.7), slabM = new MeshStandardMaterial({ color: 0x0E4A50, roughness: 0.8 });
    const cor = new BoxGeometry(13.6, 0.02, 0.95), corM = new MeshStandardMaterial({ color: 0x17666D, roughness: 0.9 });
    FY.forEach((y, fi) => {
      const sm = new Mesh(slab, slabM); sm.position.set(0, y - 0.07, 0); S.add(sm);
      const cm = new Mesh(cor, corM); cm.position.set(0, y + 0.012, 0); S.add(cm);
      const fl = label('Floor ' + FN[fi], { size: 40, color: '#9DBCB9', weight: 500 }); fl.position.set(-7.9, y + 0.5, 0); S.add(fl);
      for (let r = 1; r <= 18; r++) {
        const i = (r - 1) % 9, row = r <= 9 ? -1 : 1, id = FN[fi] * 100 + r, h = (id * 7919) % 10;
        const st = h < 5 ? 'ready' : h < 7 ? 'dirty' : h < 9 ? 'clean' : 'insp';
        const m = new Mesh(rg, new MeshStandardMaterial({ color: RS[st], emissive: RS[st], emissiveIntensity: 0.18, roughness: 0.45 }));
        m.position.set((i - 4) * 1.42, y + 0.43, row * 1.42); S.add(m);
        const o = { m, base: st, id, c: new Color(RS[st]), tc: new Color(RS[st]) }; this.rooms[id] = o; this.all.push(o);
      }
    });
    [512, 418, 206].forEach(id => { this.rooms[id].base = 'dirty'; this.rooms[id].key = true; const l = label(String(id), { size: 44, bg: 'rgba(6,38,42,.85)' }); l.position.copy(this.rooms[id].m.position); l.position.y += 0.95; S.add(l); this.rooms[id].num = l; });
    const tag = (id, text, bg, color) => { const l = label(text, { size: 38, bg, color: color || '#06262A' }); l.position.copy(this.rooms[id].m.position); l.position.y += 1.7; S.add(l); return l; };
    this.tPri = tag(512, 'Early arrival 12:30', '#C6F432');
    this.tBlk = tag(206, 'Blocked: maintenance', '#F0554E', '#fff');
    this.tRisk = tag(418, 'At risk: ready by 14:00', '#F5A524');
    this.tOk = tag(418, 'On track', '#2FBF8F');

    const person = (name, color, x, y, z) => {
      const g = new Group(), m = new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.4, transparent: true });
      const b = new Mesh(new CapsuleGeometry(0.15, 0.3, 4, 10), m); b.position.y = 0.32; g.add(b);
      if (name) { const l = label(name, { size: 36, bg: '#DCE6E5', color: '#06262A' }); l.position.y = 1.0; g.add(l); g.userData.l = l; }
      g.position.set(x, y, z); g.userData.m = m; S.add(g); return g;
    };
    this.asha = person('Asha', 0xffffff, -3.6, FY[1], 0);
    this.daniel = person('Daniel', 0xffffff, 3.4, FY[1], 0.1);
    this.dLate = label('Daniel: 25 min late', { size: 36, bg: '#F5A524', color: '#06262A' }); this.dLate.position.set(3.0, FY[1] + 0.75, 1.2); S.add(this.dLate);
    this.mei = person('Mei', 0xffffff, 0.2, FY[1], -0.1);
    this.extras = [person(null, 0xBFE3DF, -2, FY[2], 0), person(null, 0xBFE3DF, 4, FY[2], 0), person(null, 0xBFE3DF, 1, FY[0], 0), person(null, 0xBFE3DF, -4.5, FY[0], 0)];

    this.src = ['PMS', 'Attendance', 'Task tool'].map((n, i) => {
      const g = new Group(), m = new Mesh(new RoundedBoxGeometry(1.0, 2.6, 1.0, 3, 0.14), new MeshStandardMaterial({ color: 0x0E4A50, emissive: 0x8FF2CC, emissiveIntensity: 0.12, roughness: 0.3, metalness: 0.3 }));
      m.position.y = 1.3; g.add(m);
      const cap = new Mesh(new BoxGeometry(0.7, 0.06, 0.7), new MeshBasicMaterial({ color: 0xffffff })); cap.position.y = 2.64; g.add(cap);
      const l = label(n, { size: 40, bg: '#DCE6E5', color: '#06262A' }); l.position.y = 3.3; g.add(l);
      g.position.set(-10.6, 0, (i - 1) * 2.4); g.userData = { m, l, top: new Vector3(-10.6, 2.7, (i - 1) * 2.4) }; S.add(g); return g;
    });
    this.gap = label('no shared decision', { size: 34, color: '#F8B4A6', weight: 500 }); this.gap.position.set(-8.6, 4.5, 0); S.add(this.gap);

    this.core = tile(0x0C3A3F, LIME, [1, 3, 4, 5, 6, 8]); this.core.position.set(0, 7.4, 0); S.add(this.core);
    this.coreL = label('Allocivo agents', { size: 40, bg: '#C6F432', color: '#06262A' }); this.coreL.position.set(0, 9.9, 0); S.add(this.coreL);
    this.coreLight = new PointLight(LIME, 0, 16); this.coreLight.position.set(0, 7.4, 2); S.add(this.coreLight);
    const cp = new Vector3(0, 7.4, 0), at = (o, dy) => o.position.clone().setY(o.position.y + dy);
    this.bOld = [new Beam(S, 0xffffff, 2).set(this.src[0].userData.top, at(this.rooms[418].m, 0.5), 2.5), new Beam(S, 0xffffff, 2).set(this.src[1].userData.top, new Vector3(3.4, FY[1] + 0.6, 0.1), 3.2), new Beam(S, 0xffffff, 2).set(this.src[2].userData.top, at(this.rooms[206].m, 0.5), 1.6)];
    this.bIn = this.src.map(s => new Beam(S, LIME, 3).set(s.userData.top, cp, 4));
    this.bOut = [new Beam(S, LIME, 3).set(cp, at(this.rooms[512].m, 0.6), 0.5), new Beam(S, LIME, 3).set(cp, at(this.rooms[418].m, 0.6), 0.5)];
    this.bAsha = new Beam(S, 0xffffff, 3);

    this.loop = ['Sense', 'Understand', 'Decide', 'Adapt'].map(n => {
      const m = new Mesh(new SphereGeometry(0.2, 20, 14), new MeshStandardMaterial({ color: 0xffffff, emissive: LIME, emissiveIntensity: 0 }));
      const l = label(n, { size: 36, bg: 'rgba(6,38,42,.9)' }); S.add(m, l); return { m, l };
    });
    this.loopRing = new Mesh(new TorusGeometry(3.3, 0.012, 6, 90), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); this.loopRing.rotation.x = Math.PI / 2; this.loopRing.position.copy(cp); S.add(this.loopRing);
    this.rings = [[LIME, 2.9, 'Automatic'], [0xF6C453, 3.6, 'Approval'], [0xE8806F, 4.3, 'Sign-off']].map(([c, r, n]) => {
      const m = new Mesh(new TorusGeometry(r, 0.045, 8, 100), new MeshBasicMaterial({ color: c, transparent: true, opacity: 0 })); m.rotation.x = Math.PI / 2; m.position.copy(cp);
      const l = label(n, { size: 36, bg: '#' + new Color(c).getHexString(), color: '#06262A' }); l.position.set(r * 0.72, 7.4, r * 0.72); S.add(m, l); return { m, l };
    });
    this._c = new Color(); this._dk = new Color(0x0B3338); this._v = new Vector3();
  }
  status(o, p) {
    if (o.id === 512) return p < 1.7 ? 'dirty' : p < 8.3 ? 'clean' : 'ready';
    if (o.id === 206) return p < 1.85 ? 'dirty' : 'block';
    if (o.id === 418) return p < 2.7 ? 'dirty' : p < 6.35 ? 'risk' : p < 8.2 ? 'clean' : 'ready';
    if (p > 7.9 && o.base !== 'ready' && ((o.id * 31) % 10) / 10 < seg(p, 7.9, 8.9)) return 'ready';
    return o.base;
  }
  update(t) {
    this.step(t); const p = this.p; this.camera(t);
    this.all.forEach(o => {
      const st = this.status(o, p); o.tc.setHex(RS[st]); o.c.lerp(o.tc, 0.08);
      const pulse = o.key && (st === 'risk' || st === 'block' || (o.id === 512 && st === 'clean')) ? 0.45 + Math.sin(t * 3.2) * 0.3 : (st === 'clean' ? 0.4 : 0.16);
      const dim = o.key ? 0 : seg(p, 1.6, 2.2) * (1 - seg(p, 7.6, 8.1)) * 0.62;
      this._c.copy(o.c).lerp(this._dk, dim); o.m.material.color.copy(this._c); o.m.material.emissive.copy(this._c); o.m.material.emissiveIntensity = pulse * (1 - dim);
      o.m.scale.y = 1 + (o.key ? 0 : Math.sin(t * 0.8 + o.id) * 0.03);
    });
    const kv = seg(p, 1.5, 2); [512, 418, 206].forEach(id => show(this.rooms[id].num, kv));
    show(this.tPri, seg(p, 1.7, 2.1) * (1 - seg(p, 3.5, 3.9)));
    show(this.tBlk, seg(p, 1.9, 2.3) * (1 - seg(p, 3.5, 3.9)));
    show(this.tRisk, seg(p, 2.7, 3.1) * (1 - seg(p, 6.3, 6.5)));
    show(this.tOk, seg(p, 6.5, 6.9) * (1 - seg(p, 8.6, 9)));
    const late = seg(p, 1.8, 2.3);
    this.daniel.userData.m.opacity = 1 - late * 0.75; show(this.daniel.userData.l, 1 - late); show(this.dLate, late * (1 - seg(p, 6.6, 7)));
    const mv = ease(seg(p, 5.55, 6.4)); this.asha.position.x = lerp(-3.6, 5.1, mv); this.asha.position.z = lerp(0, 0.35, mv); this.asha.position.y = 2.1 + Math.abs(Math.sin(t * 6)) * 0.05 * (mv > 0.02 && mv < 0.98 ? 1 : 0);
    this.asha.userData.m.emissive.setHex(p > 4 ? LIME : 0xffffff); this.asha.userData.m.color.setHex(p > 4 ? LIME : 0xffffff);
    this.mei.position.x = 0.2 + Math.sin(t * 0.4) * 0.5;
    this.extras.forEach((e, i) => { e.position.x += Math.sin(t * 0.5 + i * 2) * 0.006; });
    const sv = seg(p, 0.5, 1.1);
    this.src.forEach((s, i) => { const k = ease(seg(p, 0.5 + i * 0.12, 1 + i * 0.12)); s.scale.set(1, Math.max(0.001, k), 1); s.visible = k > 0.01; show(s.userData.l, k); s.userData.m.material.emissiveIntensity = 0.12 + seg(p, 3.6, 4.2) * 0.5 + Math.sin(t * 2 + i) * 0.05; });
    const old = sv * (1 - seg(p, 3.4, 3.9)); this.bOld.forEach(b => b.update(t, old * 0.7, 0.25));
    show(this.gap, seg(p, 0.9, 1.3) * (1 - seg(p, 1.7, 2)));
    const cv = ease(seg(p, 3.5, 4.2)), cs = cv * (1 - seg(p, 8.7, 9.2) * 0.25);
    this.core.visible = cv > 0.01; this.core.scale.setScalar(Math.max(0.001, cs * 0.62));
    this.core.rotation.set(-0.3 + Math.sin(t * 0.6) * 0.06, 0.5 + Math.sin(t * 0.45) * 0.55, 0); this.core.position.y = 7.4 + Math.sin(t * 0.9) * 0.12;
    this.core.userData.dots.forEach((d, i) => { if (d.userData.on) d.material.emissiveIntensity = 0.8 + Math.sin(t * 3 + i) * 0.3; });
    show(this.coreL, cv * (1 - seg(p, 4.6, 5))); this.coreLight.intensity = cv * 8;
    this.bIn.forEach(b => b.update(t, cv, 0.5));
    const ov = seg(p, 3.9, 4.4); this.bOut[0].update(t, ov * (1 - seg(p, 7.5, 8)), 0.6); this.bOut[1].update(t, ov * (1 - seg(p, 7.5, 8)), 0.6);
    this._v.copy(this.asha.position).setY(this.asha.position.y + 0.8); this.bAsha.set(this.core.position, this._v, 0.4); this.bAsha.update(t, seg(p, 5.3, 5.7) * (1 - seg(p, 6.6, 7)), 0.9);
    const lv = seg(p, 4.6, 5.1) * (1 - seg(p, 6.5, 6.9)), act = Math.floor((t * 0.7) % 4);
    this.loopRing.material.opacity = lv * 0.25;
    this.loop.forEach((n, i) => { const a = t * 0.35 + i * Math.PI / 2; n.m.position.set(Math.cos(a) * 3.3, 7.4, Math.sin(a) * 3.3); n.l.position.copy(n.m.position).setY(8.05); n.m.visible = lv > 0.01; n.m.scale.setScalar(lv * (i === act ? 1.5 : 1)); n.m.material.emissiveIntensity = i === act ? 1.2 : 0.1; show(n.l, lv); });
    const rv = seg(p, 6.6, 7.1) * (1 - seg(p, 7.7, 8.1));
    this.rings.forEach((r, i) => { r.m.material.opacity = rv * 0.9; r.m.visible = rv > 0.01; r.m.rotation.z = t * 0.2 * (i % 2 ? -1 : 1); r.m.scale.setScalar(0.6 + 0.4 * ease(seg(p, 6.6 + i * 0.1, 7.1 + i * 0.1))); show(r.l, rv); });
  }
}

/* ====================================================================== */
/* XESSLY: a web page taken apart, fixed and proven by five agents.       */
/* ====================================================================== */
export class Xessly extends Story {
  constructor(canvas) {
    super(canvas, { bg: 0x10161D, fog: [22, 60], fov: 34, ambient: 1.15, bloom: 0.24 });
    this.K = [
      { p: [0.5, 0.4, 14.5], t: [0, 0, 0] }, { p: [-2.6, 0.6, 13.5], t: [0, 0, 0] }, { p: [-1.5, 1.2, 14], t: [0, 0, 0] },
      { p: [0, 1.4, 18], t: [0, -0.2, 0] }, { p: [6, 1.6, 16], t: [0, -0.9, 1.2] }, { p: [5.6, 0.8, 14.5], t: [0, -0.3, 1.2] },
      { p: [5.4, -0.2, 13.5], t: [0.2, -0.8, 1.4] }, { p: [5.6, 1.2, 14.5], t: [0, -0.4, 1.2] }, { p: [4.6, 1.4, 14], t: [0, 0, 1] }, { p: [0.5, 0.3, 15], t: [0, 0, 0] }
    ];
    this.pz = 1.1;
    const S = this.scene; this.page = new Group(); S.add(this.page); this.layers = [];
    const box = (w, h, color, x, y, layer, o = {}) => {
      const m = new Mesh(new RoundedBoxGeometry(w, h, o.d || 0.05, 2, Math.min(o.r == null ? 0.06 : o.r, h / 2 - 0.001)), new MeshStandardMaterial({ color, roughness: 0.6, transparent: true, opacity: o.a == null ? 1 : o.a }));
      m.position.set(x, y, 0); m.userData = { layer, z: o.z || 0 }; this.page.add(m); this.layers.push(m); return m;
    };
    box(5.2, 7, 0xF4F6FA, 0, 0, 0, { r: 0.22, d: 0.08 });
    box(4.7, 0.52, 0xffffff, 0, 2.95, 1, { r: 0.12 });
    box(0.55, 0.22, 0x5146E5, -1.95, 2.95, 1, { z: 0.04 });
    this.links = [-0.7, 0.05, 0.8].map(x => box(0.55, 0.1, 0xC9CFE0, x, 2.95, 1, { z: 0.04, r: 0.05 }));
    this.icon = box(0.32, 0.32, 0xE4E7EE, 2.05, 2.95, 1, { z: 0.04, r: 0.08 });
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 220; const cx = cv.getContext('2d');
    const gr = cx.createLinearGradient(0, 0, 512, 220); gr.addColorStop(0, '#C9D2F5'); gr.addColorStop(1, '#8FF2CC'); cx.fillStyle = gr; cx.fillRect(0, 0, 512, 220);
    cx.fillStyle = 'rgba(81,70,229,.55)'; cx.beginPath(); cx.moveTo(60, 220); cx.lineTo(210, 70); cx.lineTo(330, 220); cx.fill();
    cx.fillStyle = 'rgba(23,33,43,.35)'; cx.beginPath(); cx.moveTo(240, 220); cx.lineTo(370, 110); cx.lineTo(480, 220); cx.fill();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(400, 60, 26, 0, 7); cx.fill();
    const ht = new CanvasTexture(cv); ht.colorSpace = SRGBColorSpace;
    const hero = new Mesh(new PlaneGeometry(4.7, 2.0), new MeshBasicMaterial({ map: ht })); hero.position.set(0, 1.5, 0); hero.userData = { layer: 2, z: 0.03 }; this.page.add(hero); this.layers.push(hero);
    box(2.9, 0.17, 0x17212B, -0.9, 0.2, 3, { r: 0.05 }); box(2.1, 0.1, 0x9AA4AE, -1.3, -0.1, 3, { r: 0.05 });
    this.lbl = [box(0.75, 0.11, 0x17212B, -1.97, -0.52, 4, { r: 0.05, a: 0, z: 0.02 }), box(1.0, 0.11, 0x17212B, -1.85, -1.42, 4, { r: 0.05, a: 0, z: 0.02 })];
    box(4.7, 0.46, 0xffffff, 0, -0.86, 4, { r: 0.1 }); box(4.7, 0.46, 0xffffff, 0, -1.76, 4, { r: 0.1 });
    this.btn = box(4.7, 0.54, 0x9C97E8, 0, -2.7, 5, { r: 0.12 }); box(1.1, 0.12, 0xffffff, 0, -2.7, 5, { z: 0.04, r: 0.05 });

    const pinAt = [[0.05, 3.3, 1], [1.6, 2.1, 2], [2.0, -0.6, 4], [2.05, 3.3, 1]];
    this.pins = pinAt.map((a, i) => {
      const g = new Group(), m = new MeshStandardMaterial({ color: 0xE5484D, emissive: 0xE5484D, emissiveIntensity: 0.45 });
      g.add(new Mesh(new SphereGeometry(0.2, 24, 16), m)); const n = label(String(i + 1), { size: 40, color: '#fff' }); n.position.z = 0.25; n.userData.base.multiplyScalar(0.8); g.add(n);
      const ring = new Mesh(new RingGeometry(0.26, 0.3, 40), new MeshBasicMaterial({ color: 0x3DDC97, transparent: true, opacity: 0, side: DoubleSide })); g.add(ring);
      g.userData = { m, ring, x: a[0], y: a[1], layer: a[2], c: new Color(0xE5484D), tc: new Color() }; this.page.add(g); return g;
    });
    const mk = (i, text, bg, color) => { const l = label(text, { size: 34, bg, color }); this.page.add(l); l.userData.pin = i; return l; };
    this.tags = ['1.4.3 Contrast ×12', '1.1.1 Alt text ×18', '1.3.1 Label ×6', '4.1.2 Name ×3'].map((s, i) => mk(i, s, '#DCE3EA', '#17212B'));
    this.oks = ['Verified', 'Flagged: draft ready', 'Verified', 'Verified'].map((s, i) => mk(i, s, i === 1 ? '#7C3AED' : '#3DDC97', i === 1 ? '#fff' : '#10161D'));

    const N = 46, dm = new InstancedMesh(new SphereGeometry(0.11, 10, 8), new MeshBasicMaterial({ color: 0xF0554E }), N); this.noise = dm; this.nd = [];
    for (let i = 0; i < N; i++) this.nd.push([(Math.random() - 0.5) * 4.6, (Math.random() - 0.5) * 6.2, Math.random()]);
    this.page.add(dm); this.o3 = new Object3D();

    this.people = ['Product lead', 'Designer', 'Developer', 'Everyone'].map((n, i) => {
      const g = new Group(); g.add(new Mesh(new SphereGeometry(0.36, 24, 16), new MeshStandardMaterial({ color: 0x9AA4AE, roughness: 0.5, transparent: true })));
      const l = label(n, { size: 36, bg: '#DCE6E5', color: '#17212B' }); l.position.y = 0.75; g.add(l); g.userData.l = l;
      g.position.set(i % 2 ? 4.6 : -4.6, i < 2 ? 2.6 : -2.6, 0.6); S.add(g); return g;
    });
    this.ball = new Mesh(new SphereGeometry(0.2, 20, 14), new MeshStandardMaterial({ color: 0xE5484D, emissive: 0xE5484D, emissiveIntensity: 1 })); S.add(this.ball);

    this.agents = ['Scan', 'Triage', 'Fix', 'Test', 'Verify'].map((n, i) => {
      const g = new Group(), m = new MeshStandardMaterial({ color: 0x2A3642, emissive: MINT, emissiveIntensity: 0.05, roughness: 0.35 });
      g.add(new Mesh(new SphereGeometry(0.34, 28, 18), m)); const l = label(n, { size: 36, bg: 'rgba(16,22,29,.9)' }); l.position.y = -0.7; g.add(l);
      g.position.set((i - 2) * 1.7, -4.4, 1.6); g.userData = { m, l }; S.add(g); return g;
    });
    this.beam = new Beam(S, MINT, 3);
    this.scan = new Group();
    const sl = new Mesh(new PlaneGeometry(6, 0.05), new MeshBasicMaterial({ color: MINT, transparent: true }));
    const sgw = new Mesh(new PlaneGeometry(6, 1.3), new MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.08, blending: AdditiveBlending, depthWrite: false })); sgw.position.y = 0.65;
    this.scan.add(sl, sgw); this.scan.userData = { sl, sgw }; S.add(this.scan);
    const pl = new PointLight(0x5146E5, 60, 20); pl.position.set(-5, 4, 6); S.add(pl);
    this.c1 = new Color(); this.c2 = new Color(); this._v = new Vector3(); this._w = new Vector3();
    this.page.rotation.y = -0.08;
  }
  update(t) {
    this.step(t); const p = this.p; this.camera(t);
    const ex = ease(seg(p, 3.6, 4.4)) * (1 - ease(seg(p, 8.5, 9.1)) * 0.82), gap = 0.7;
    this.page.position.y = Math.sin(t * 0.7) * 0.08; this.page.rotation.y = -0.08 + Math.sin(t * 0.3) * 0.04; this.page.rotation.x = Math.sin(t * 0.25) * 0.02;
    this.layers.forEach(m => { m.position.z = m.userData.layer * gap * ex + m.userData.z + 0.03 * m.userData.layer; });
    const f = ease(seg(p, 5.75, 6.3));
    this.links.forEach(l => l.material.color.copy(this.c1.setHex(0xC9CFE0)).lerp(this.c2.setHex(0x3E4A57), f));
    this.lbl.forEach(l => { l.material.opacity = f; l.visible = f > 0.01; });
    this.btn.material.color.copy(this.c1.setHex(0x9C97E8)).lerp(this.c2.setHex(0x4F46E5), f);
    this.icon.material.color.copy(this.c1.setHex(0xE4E7EE)).lerp(this.c2.setHex(0x17212B), f);
    const nv = seg(p, 0.5, 1.1) * (1 - seg(p, 2.5, 3));
    this.nd.forEach((d, i) => { const k = clamp(nv * 1.6 - d[2] * 0.6, 0, 1); this.o3.position.set(d[0], d[1], 0.12 + Math.sin(t * 2 + i) * 0.03); this.o3.scale.setScalar(Math.max(0.0001, k)); this.o3.updateMatrix(); this.noise.setMatrixAt(i, this.o3.matrix); });
    this.noise.instanceMatrix.needsUpdate = true; this.noise.visible = nv > 0.01;
    const pv = ease(seg(p, 2.5, 3)) * (1 - seg(p, 3.5, 3.9));
    this.people.forEach(g => { g.visible = pv > 0.01; g.scale.setScalar(Math.max(0.001, pv)); show(g.userData.l, pv); });
    const u = (t * 0.55) % 4, a = this.people[Math.floor(u)].position, b = this.people[(Math.floor(u) + 1) % 4].position, ff = ease(u % 1);
    this.ball.visible = pv > 0.01; this.ball.position.lerpVectors(a, b, ff); this.ball.position.z += 1.2 + Math.sin(Math.PI * ff) * 1.2; this.ball.scale.setScalar(Math.max(0.001, pv));
    const scanOn = seg(p, 4.4, 4.7) * (1 - seg(p, 5.35, 5.6));
    this.scan.visible = scanOn > 0.01; this.scan.position.set(0, 3.7 - ((t * 0.32) % 1) * 7.4, 3); this.scan.userData.sl.material.opacity = scanOn; this.scan.userData.sgw.material.opacity = scanOn * 0.08;
    this.pins.forEach((g, i) => {
      const d = g.userData, pop = ease(seg(p, 4.6 + i * 0.1, 4.95 + i * 0.1));
      g.visible = pop > 0.01; g.position.set(d.x, d.y, d.layer * gap * ex + 0.3); g.scale.setScalar(Math.max(0.001, pop * (1 + Math.sin(t * 3 + i) * 0.05)));
      d.tc.setHex(p < 5.75 ? 0xE5484D : p < 6.7 ? 0xF5A524 : (i === 1 && p > 7.6 ? 0x7C3AED : 0x3DDC97)); d.c.lerp(d.tc, 0.1); d.m.color.copy(d.c); d.m.emissive.copy(d.c);
      const tv = seg(p, 6.6, 6.9) * (1 - seg(p, 7.6, 7.9)), rr = (t * 0.8 + i * 0.25) % 1; d.ring.material.opacity = tv * (1 - rr); d.ring.scale.setScalar(1 + rr * 3.2);
      const tg = this.tags[i], ok = this.oks[i], side = d.x > 1 ? 1 : -1;
      tg.position.set(d.x + side * 0.2, d.y + 0.52, g.position.z + 0.1); show(tg, seg(p, 5 + i * 0.06, 5.3 + i * 0.06) * (1 - seg(p, 5.7, 5.95)));
      ok.position.copy(tg.position); show(ok, seg(p, 7.65 + i * 0.07, 8 + i * 0.07) * (1 - seg(p, 8.7, 9)));
    });
    const av = ease(seg(p, 3.6, 4.2)) * (1 - seg(p, 8.8, 9.2));
    const act = p < 4.4 ? -1 : p < 5.0 ? 0 : p < 5.75 ? 1 : p < 6.6 ? 2 : p < 7.6 ? 3 : p < 8.7 ? 4 : -1;
    this.agents.forEach((g, i) => { g.visible = av > 0.01; const on = i === act; g.scale.setScalar(Math.max(0.001, av * (on ? 1.25 + Math.sin(t * 4) * 0.05 : 1))); g.position.y = -4.4 + Math.sin(t * 1.2 + i) * 0.08 + (on ? 0.25 : 0); g.userData.m.emissiveIntensity = on ? 0.7 : 0.06; g.userData.m.color.setHex(on ? MINT : 0x2A3642); show(g.userData.l, av); });
    if (act > -1) { this._v.copy(this.agents[act].position); this._w.set(0, -1.2, 3 * ex + 0.4); this.beam.set(this._v, this._w, 0.2); }
    this.beam.update(t, act > -1 ? av : 0, 0.9);
  }
}
