/* BrightYard 3D scenes. Source file: bundled with three.js into assets/js/scenes.js (see README). */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, Group, Mesh, Points, Line, Sprite,
  BufferGeometry, BufferAttribute, Float32BufferAttribute, SphereGeometry, BoxGeometry, PlaneGeometry,
  TorusGeometry, RingGeometry, CapsuleGeometry, CylinderGeometry, InstancedMesh, Object3D,
  ShaderMaterial, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial, LineBasicMaterial, SpriteMaterial,
  CanvasTexture, EdgesGeometry, LineSegments, OctahedronGeometry, PointsMaterial, AmbientLight, DirectionalLight, PointLight, Vector2, Vector3, Raycaster, Plane,
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
    this.r = new WebGLRenderer({ canvas, antialias: !this.low || o.alpha, alpha: !!o.alpha, powerPreference: 'high-performance' });
    this.r.setPixelRatio(Math.min(devicePixelRatio || 1, this.low ? 1.25 : 1.75));
    this.r.toneMapping = ACESFilmicToneMapping; this.r.toneMappingExposure = 1.05;
    this.scene = new Scene(); if (!o.alpha) { this.scene.background = new Color(o.bg); this.scene.fog = new Fog(o.bg, o.fog[0], o.fog[1]); }
    this.cam = new PerspectiveCamera(o.fov || 36, 1, 0.1, 200);
    this.scene.add(new AmbientLight(0xffffff, o.ambient || 0.9));
    const d = new DirectionalLight(0xffffff, 1.6); d.position.set(6, 12, 9); this.scene.add(d);
    if (!this.low && !o.noPost) {
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
/* HERO: the yard. A field of signals flowing into the BrightYard mark.   */
/* ====================================================================== */
export class Hero extends Stage {
  constructor(canvas) {
    super(canvas, { bg: 0x0B0A24, fog: [16, 52], fov: 38, ambient: 0.8, bloom: 0.34 });
    this.p = 0; this.ptr = new Vector3(0, 0, 999); this.mouse = new Vector2(); this.tm = new Vector2();
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
        gl_FragColor=vec4(c,a*vF*(.75+vG*.5+step(.985,vR)*.4));}`
    });
    this.field = new Points(g, this.fm); this.scene.add(this.field);

    this.tile = tile(IND, LIME, [0, 2, 4, 7]); this.scene.add(this.tile);
    this.glow = new PointLight(LIME, 5, 12); this.scene.add(this.glow);
    this.home = new Vector3(4.2, 3.5, 0);

    this.sig = []; const sg = new SphereGeometry(0.07, 10, 8);
    const N = this.low ? 14 : 30;
    for (let i = 0; i < N; i++) {
      const c = new QuadraticBezierCurve3(new Vector3((Math.random() - 0.5) * 34, 0.2, -18 + Math.random() * 24), new Vector3(), new Vector3());
      const m = new Mesh(sg, new MeshBasicMaterial({ color: LIME, transparent: true }));
      const lg = new BufferGeometry(); lg.setAttribute('position', new Float32BufferAttribute(new Float32Array(31 * 3), 3));
      const ln = new Line(lg, new LineBasicMaterial({ color: 0x8F88FF, transparent: true, opacity: 0.1 }));
      this.scene.add(m, ln); this.sig.push({ c, m, ln, o: Math.random(), s: 0.1 + Math.random() * 0.12, d: [0, 2, 4, 7][i % 4] });
    }
    this.ray = new Raycaster(); this.plane = new Plane(new Vector3(0, 1, 0), 0); this.hit = new Vector3();
    this.tmpV = new Vector3(); this.ts = 1;
  }
  layout(w, h) {
    const wide = w / h > 1.05;
    this.home.set(wide ? Math.min(4.6, 1.6 + w / h * 1.3) : 0, wide ? 4.5 : 5.3, wide ? 0 : -3);
    this.ts = wide ? 0.68 : 0.4; this.fm.uniforms.uPx.value = this.r.getPixelRatio() * (wide ? 1 : 0.8);
  }
  pointer(nx, ny) { this.tm.set(nx, ny); }
  setScroll(p) { this.p = p; }
  update(t) {
    const p = this.p, intro = ease(seg(t, 0.1, 1.8));
    this.mouse.lerp(this.tm, 0.06);
    this.fm.uniforms.uT.value = t; this.fm.uniforms.uIn.value = intro;
    this.cam.position.set(this.mouse.x * 0.6, 3.3 - p * 1.5 + this.mouse.y * 0.25, 13.5 - p * 5.5);
    this.cam.lookAt(0, 2.3 - p * 0.6, 0);
    this.ray.setFromCamera(this.mouse, this.cam);
    if (this.ray.ray.intersectPlane(this.plane, this.hit)) this.ptr.lerp(this.hit, 0.12);
    const T = this.tile, s = this.ts * (1 - p * 0.35) * (0.001 + ease(seg(t, 0.3, 1.5)));
    T.position.set(this.home.x, this.home.y + Math.sin(t * 0.8) * 0.16 + p * 4.5, this.home.z);
    T.scale.setScalar(s);
    T.rotation.set(-0.08 - this.mouse.y * 0.22 + p * 0.9, -0.38 + Math.sin(t * 0.4) * 0.14 + this.mouse.x * 0.4 + p * 1.6, Math.sin(t * 0.3) * 0.03);
    T.userData.dots.forEach((d, i) => { const k = ease(seg(t, 1 + i * 0.08, 1.5 + i * 0.08)); d.scale.setScalar(k * (d.userData.on ? 1 + Math.sin(t * 2 + i) * 0.06 : 1)); });
    this.glow.position.copy(T.position); this.glow.position.z += 2; this.glow.intensity = 5 * intro * (1 - p);
    T.updateMatrixWorld();
    this.sig.forEach(q => {
      const dot = T.userData.dots[q.d]; dot.getWorldPosition(this.tmpV);
      q.c.v2.copy(this.tmpV); q.c.v1.copy(q.c.v0).lerp(this.tmpV, 0.55); q.c.v1.y += 4.5;
      const u = (t * q.s + q.o) % 1; q.m.position.copy(q.c.getPoint(u)); q.m.material.opacity = Math.sin(Math.PI * u) * intro * (1 - p);
      const pos = q.ln.geometry.attributes.position; for (let i = 0; i <= 30; i++) { const v = q.c.getPoint(i / 30); pos.setXYZ(i, v.x, v.y, v.z); } pos.needsUpdate = true;
      q.ln.material.opacity = 0.09 * intro * (1 - p);
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

/* ====================================================================== */
/* YARDIE: the blueprint buddy. A small robot with a glowing screen face, */
/* driven by states (idle, focus, typing, ponder, work, present, confused)*/
/* and one-shot reactions (nod, hop, absorb, boop).                       */
/* ====================================================================== */
const FACE_W = 512, FACE_H = 300;
function spring(o, k, target, dt, stiff, damp) {
  const v = o.v[k] || 0, x = o.s[k] == null ? target : o.s[k];
  const a = (target - x) * stiff - v * damp, nv = v + a * dt;
  o.v[k] = nv; o.s[k] = x + nv * dt; return o.s[k];
}
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(30,27,75,.38)'); g.addColorStop(1, 'rgba(30,27,75,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

export class Buddy extends Stage {
  constructor(canvas) {
    super(canvas, { alpha: true, noPost: true, fov: 30, ambient: 1.25 });
    const S = this.scene;
    const key = new DirectionalLight(0xffffff, 1.5); key.position.set(3, 6, 7); S.add(key);
    const rim = new DirectionalLight(0xB8B3FF, 1.6); rim.position.set(-6, 3, -5); S.add(rim);
    this.glow = new PointLight(LIME, 3, 4); this.glow.position.set(0, 0.25, 0.9); S.add(this.glow);

    const white = new MeshPhysicalMaterial({ color: 0xF8F7FF, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.25 });
    const ind = new MeshPhysicalMaterial({ color: IND, roughness: 0.3, clearcoat: 0.7 });
    const dark = new MeshStandardMaterial({ color: 0x24205C, roughness: 0.45, metalness: 0.35 });
    const lime = new MeshPhysicalMaterial({ color: LIME, roughness: 0.4, clearcoat: 0.5 });
    const R = this.rig = new Group(); S.add(R);

    const sh = new Mesh(new PlaneGeometry(2.4, 1.2), new MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.005; S.add(sh); this.shadow = sh;

    this.feet = [-1, 1].map(s => { const f = new Mesh(new RoundedBoxGeometry(0.6, 0.4, 0.84, 4, 0.16), lime); f.position.set(s * 0.46, 0.2, 0.06); R.add(f); return f; });
    const B = this.body = new Group(); B.position.y = 0.42; R.add(B);
    const hip = new Mesh(new RoundedBoxGeometry(0.82, 0.2, 0.5, 3, 0.08), dark); hip.position.y = 0.06; B.add(hip);
    const torso = new Mesh(new RoundedBoxGeometry(1.02, 0.74, 0.76, 5, 0.24), white); torso.position.y = 0.5; B.add(torso);
    this.chest = [];
    const cg = new SphereGeometry(0.042, 12, 10);
    for (let i = 0; i < 9; i++) {
      const on = [0, 2, 4, 7].indexOf(i) > -1;
      const m = new Mesh(cg, new MeshStandardMaterial({ color: on ? LIME : 0xC9C4F2, emissive: on ? LIME : 0x000000, emissiveIntensity: on ? 0.6 : 0 }));
      m.position.set((i % 3 - 1) * 0.11, 0.56 + (1 - Math.floor(i / 3)) * 0.11, 0.385); m.userData.on = on; B.add(m); this.chest.push(m);
    }
    const plate = new Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.04, 3, 0.1), ind); plate.position.set(0, 0.56, 0.37); B.add(plate);
    this.arms = [-1, 1].map(s => {
      const g = new Group(); g.position.set(s * 0.6, 0.72, 0.02);
      const a = new Mesh(new CapsuleGeometry(0.09, 0.26, 4, 10), ind); a.position.y = -0.2; g.add(a);
      const hnd = new Mesh(new SphereGeometry(0.11, 16, 12), white); hnd.position.y = -0.4; g.add(hnd);
      B.add(g); return g;
    });
    const N = this.neck = new Group(); N.position.y = 0.86; B.add(N);
    const n1 = new Mesh(new CylinderGeometry(0.09, 0.11, 0.36, 14), dark); n1.position.y = 0.18; N.add(n1);
    const j = new Mesh(new SphereGeometry(0.13, 18, 14), ind); j.position.y = 0.38; N.add(j);
    const NU = this.neckU = new Group(); NU.position.y = 0.38; N.add(NU);
    const n2 = new Mesh(new CylinderGeometry(0.08, 0.09, 0.3, 14), dark); n2.position.y = 0.15; NU.add(n2);
    const H = this.head = new Group(); H.position.y = 0.3; NU.add(H);
    const shell = new Mesh(new RoundedBoxGeometry(1.58, 1.02, 1.04, 6, 0.34), white); shell.position.y = 0.48; H.add(shell);
    const lip = new Mesh(new RoundedBoxGeometry(1.6, 0.16, 1.06, 3, 0.07), ind); lip.position.y = 0.02; H.add(lip);
    const visor = new Mesh(new RoundedBoxGeometry(1.26, 0.72, 0.12, 4, 0.22), new MeshPhysicalMaterial({ color: 0x0B0A24, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 }));
    visor.position.set(0, 0.5, 0.48); H.add(visor);
    this.fc = document.createElement('canvas'); this.fc.width = FACE_W; this.fc.height = FACE_H; this.fx = this.fc.getContext('2d');
    this.ft = new CanvasTexture(this.fc); this.ft.colorSpace = SRGBColorSpace;
    const face = new Mesh(new PlaneGeometry(1.16, 0.68), new MeshBasicMaterial({ map: this.ft, transparent: true, depthWrite: false }));
    face.position.set(0, 0.5, 0.546); H.add(face);
    [-1, 1].forEach(s => {
      const e = new Mesh(new CylinderGeometry(0.22, 0.22, 0.14, 24), ind); e.rotation.z = Math.PI / 2; e.position.set(s * 0.81, 0.48, 0); H.add(e);
      const r = new Mesh(new TorusGeometry(0.12, 0.03, 8, 24), lime); r.rotation.y = Math.PI / 2; r.position.set(s * 0.885, 0.48, 0); H.add(r);
    });
    const A = this.ant = new Group(); A.position.set(0.32, 0.98, -0.05); H.add(A);
    const st = new Mesh(new CylinderGeometry(0.022, 0.026, 0.36, 8), dark); st.position.y = 0.18; A.add(st);
    this.tipM = new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 0.5 });
    const tip = new Mesh(new SphereGeometry(0.085, 18, 14), this.tipM); tip.position.y = 0.4; A.add(tip);

    this.orbs = [LIME, 0x8F88FF, MINT].map((c, i) => {
      const m = new Mesh(new SphereGeometry(0.1, 20, 14), new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 }));
      S.add(m); return { m, c, i, flash: 0 };
    });

    this.sp = { s: {}, v: {} };
    this.state = 'idle'; this.since = 0; this.ptr = { x: 0, y: 0, on: false }; this.inDir = { x: -1, y: 0 };
    this.imp = { nod: -9, hop: -9, boop: -9, absorb: -9, wave: -9 }; this.boopKind = 0;
    this.blinkAt = 2; this.pingAt = 2.5; this.ping = 0; this.lastActive = 0;
    this.faceKey = ''; this._v = new Vector3(); this.layout(1, 1);
  }
  layout(w, h) {
    const a = w / h; this.far = a < 0.75 ? 9.6 : a < 1 ? 8.4 : 7.4; this.vk = a < 0.75 ? 1.6 : a < 1 ? 1.3 : 1;
    if (!this.cpos) { this.cpos = new Vector3(0, 1.95, this.far); this.ctgt = new Vector3(0, 1.55, 0); }
  }
  resize() {
    super.resize(); const o = this.frameOff;
    if (o && (o.x || o.y)) this.cam.setViewOffset(this.W, this.H, -this.W * o.x, this.H * o.y, this.W, this.H); else this.cam.clearViewOffset();
    this.cam.updateProjectionMatrix();
  }
  now() { return this.time || 0; }
  setState(s) { if (s !== this.state) { this.state = s; this.since = this.now(); } this.lastActive = this.now(); }
  setPointer(x, y, on) { this.ptr.x = x; this.ptr.y = y; this.ptr.on = on; if (on) this.lastActive = this.now(); }
  setInputDir(x, y) { this.inDir.x = x; this.inDir.y = y; }
  keystroke() { this.imp.nod = this.now(); this.lastActive = this.now(); }
  absorb() { this.imp.absorb = this.now(); this.imp.hop = this.now(); }
  boop() { this.imp.boop = this.now(); this.boopKind = (this.boopKind + 1) % 3; this.lastActive = this.now(); }
  wave() { this.imp.wave = this.now(); }

  drawFace(f) {
    const k = [f.eye, f.mouth, Math.round(f.open * 10), Math.round(f.px * 12), Math.round(f.py * 12), Math.round(f.glow * 4)].join('|');
    if (k === this.faceKey) return; this.faceKey = k;
    const x = this.fx; x.clearRect(0, 0, FACE_W, FACE_H);
    x.shadowColor = 'rgba(198,244,50,.95)'; x.shadowBlur = 26 + f.glow * 18; x.fillStyle = '#C6F432'; x.strokeStyle = '#C6F432'; x.lineCap = 'round';
    const ox = f.px * 40, oy = f.py * 22, cy = 124 + oy;
    const rr = (cx, cy, w, h, r) => { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(cx - w / 2 + r, cy - h / 2); x.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r); x.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r); x.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r); x.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r); x.fill(); };
    [-1, 1].forEach(s => {
      const cx = 256 + s * 104 + ox;
      if (f.eye === 'happy') { x.lineWidth = 22; x.beginPath(); x.lineWidth = 26; x.arc(cx, cy + 26, 46, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); return; }
      if (f.eye === 'spin') { x.lineWidth = 16; x.beginPath(); const a0 = this.now() * 9 + s; x.arc(cx, cy, 34, a0, a0 + Math.PI * 1.4); x.stroke(); return; }
      let w = 92, h = 120;
      if (f.eye === 'focus') { h = 86; }
      if (f.eye === 'surprise') { w = 104; h = 140; }
      if (f.eye === 'think') { h = s < 0 ? 70 : 110; }
      if (f.eye === 'confused') { if (s < 0) { h = 30; w = 88; } else { w = 100; h = 128; } }
      rr(cx, cy, w, Math.max(12, h * f.open), 40);
    });
    x.shadowBlur = 0; x.fillStyle = 'rgba(255,140,190,.22)';
    [-1, 1].forEach(s => { x.beginPath(); x.ellipse(256 + s * 150 + ox * 0.6, 214 + oy * 0.4, 30, 14, 0, 0, 7); x.fill(); });
    x.shadowBlur = 16; x.lineWidth = 12; x.strokeStyle = '#C6F432'; x.fillStyle = '#C6F432';
    const my = 238 + oy * 0.5, mx = 256 + ox * 0.7;
    x.beginPath();
    if (f.mouth === 'smile') { x.arc(mx, my - 18, 30, Math.PI * 0.2, Math.PI * 0.8); x.stroke(); }
    else if (f.mouth === 'grin') { x.arc(mx, my - 24, 40, Math.PI * 0.12, Math.PI * 0.88); x.closePath(); x.fill(); }
    else if (f.mouth === 'o') { x.ellipse(mx, my, 14, 16, 0, 0, 7); x.fill(); }
    else if (f.mouth === 'flat') { x.moveTo(mx - 20, my); x.lineTo(mx + 20, my); x.stroke(); }
    else if (f.mouth === 'wavy') { x.moveTo(mx - 30, my); x.quadraticCurveTo(mx - 15, my - 12, mx, my); x.quadraticCurveTo(mx + 15, my + 12, mx + 30, my); x.stroke(); }
    this.ft.needsUpdate = true;
  }

  update(t) {
    const dt = Math.min(0.05, Math.max(0.001, t - (this.lt == null ? t : this.lt))); this.lt = t;
    const P = this.sp, st = this.state, el = t - this.since, I = this.imp, ago = k => t - I[k];
    let yaw = 0, pitch = 0, roll = 0, lean = 0, aL = 0.18, aR = -0.18, aLx = 0, aRx = 0, lift = 0, spin = 0;
    const f = { eye: 'round', mouth: 'smile', open: 1, px: 0, py: 0, glow: 0 };
    const idleFor = t - this.lastActive;

    if (st === 'idle') {
      yaw = Math.sin(t * 0.45) * 0.28; pitch = Math.sin(t * 0.31) * 0.06; roll = Math.sin(t * 0.37) * 0.05;
      f.px = Math.sin(t * 0.45) * 0.5;
      if (t > this.pingAt) { this.ping = (this.ping + 1) % 3; this.orbs[this.ping].flash = 1; this.pingAt = t + 2.2 + Math.random() * 1.2; }
      const o = this.orbs[this.ping]; if (o.flash > 0.25) { o.m.getWorldPosition(this._v); yaw = Math.atan2(this._v.x, 3) * 0.9; pitch = -(this._v.y - 2.2) * 0.15; f.px = this._v.x * 0.4; f.py = -(this._v.y - 2.2) * 0.5; f.mouth = 'o'; }
      if (idleFor > 9 && ago('wave') > 10) this.wave();
      if (this.ptr.on) { yaw = this.ptr.x * 0.55; pitch = -this.ptr.y * 0.3; f.px = this.ptr.x; f.py = -this.ptr.y; f.mouth = 'smile'; }
    } else if (st === 'focus' || st === 'typing') {
      yaw = clamp(this.inDir.x * 0.75, -0.8, 0.8); pitch = clamp(-this.inDir.y * 0.4, -0.45, 0.4); lean = 0.08;
      f.eye = 'focus'; f.px = clamp(this.inDir.x, -1, 1); f.py = clamp(-this.inDir.y, -1, 1) * 0.8; f.mouth = st === 'typing' ? 'o' : 'smile';
      if (st === 'typing') f.px += Math.sin(t * 7) * 0.08;
    } else if (st === 'ponder') {
      yaw = 0.22 + Math.sin(t * 0.8) * 0.06; pitch = 0.22; roll = 0.2 + Math.sin(t * 1.3) * 0.04;
      aR = -1.9; aRx = -0.9; f.eye = 'think'; f.px = 0.55; f.py = -0.9; f.mouth = 'flat';
    } else if (st === 'work') {
      spin = ease(seg(el, 0.15, 1.05)) * Math.PI * 2; lift = Math.sin(Math.PI * seg(el, 0.05, 0.75)) * 0.55;
      aL = 1.2; aR = -1.2; f.eye = el < 1.1 ? 'spin' : 'happy'; f.mouth = 'grin'; f.glow = 1;
    } else if (st === 'present') {
      yaw = 0.25 + Math.sin(t * 0.6) * 0.08; pitch = 0.12; roll = -0.06;
      aR = -0.35; aL = 1.55 + Math.sin(t * 3) * 0.08; aLx = -0.35; f.eye = 'happy'; f.mouth = 'grin';
    } else if (st === 'confused') {
      roll = Math.sin(el * 3) * 0.16; yaw = Math.sin(el * 1.7) * 0.2;
      const sh = ease(seg(el, 0, 0.35)) * (1 - ease(seg(el, 1.4, 1.9)) * 0.6);
      aL = 0.18 + sh * 1.1; aR = -0.18 - sh * 1.1; lift = sh * 0.04; f.eye = 'confused'; f.mouth = 'wavy';
    }

    /* one-shot reactions */
    const nod = Math.exp(-ago('nod') * 9) * Math.sin(ago('nod') * 26) * 0.12; pitch += nod;
    const hop = ago('hop') < 0.6 ? Math.sin(Math.PI * ago('hop') / 0.6) * 0.32 : 0; lift += hop;
    if (ago('absorb') < 0.9) { f.eye = 'happy'; f.mouth = 'grin'; f.glow = 1; }
    const wv = ago('wave'); if (wv < 1.8 && (st === 'idle' || st === 'present')) { aR = -2.5 + Math.sin(wv * 14) * 0.35; f.eye = 'happy'; }
    const bp = ago('boop');
    if (bp < 1.2) {
      f.eye = this.boopKind === 1 ? 'surprise' : 'happy'; f.mouth = this.boopKind === 1 ? 'o' : 'grin';
      if (this.boopKind === 0) spin += ease(seg(bp, 0, 0.9)) * Math.PI * 2;
      if (this.boopKind === 1) { lift += Math.sin(Math.PI * seg(bp, 0, 0.5)) * 0.4; aL = aR = 0; aL = 1.3; aR = -1.3; }
      if (this.boopKind === 2) { roll += Math.sin(bp * 18) * 0.25 * (1 - bp / 1.2); }
    }
    /* blink */
    if (t > this.blinkAt) { if (t > this.blinkAt + 0.13) this.blinkAt = t + 2 + Math.random() * 3.5; else f.open = 0.08; }

    /* springs */
    const H = this.head;
    H.rotation.y = spring(P, 'yaw', yaw, dt, 90, 13); H.rotation.x = spring(P, 'pitch', -pitch, dt, 90, 13); H.rotation.z = spring(P, 'roll', roll, dt, 80, 11);
    this.neckU.rotation.x = spring(P, 'nk', -pitch * 0.5 + lean, dt, 70, 11); this.neck.rotation.z = spring(P, 'nkz', -roll * 0.4, dt, 70, 11);
    this.body.rotation.x = spring(P, 'lean', lean * 0.6, dt, 60, 10);
    const sq = spring(P, 'sq', hop > 0.05 ? -0.06 : lift > 0.1 ? 0.04 : 0, dt, 160, 12);
    this.body.scale.set(1 - sq, 1 + sq, 1 - sq);
    this.arms[0].rotation.z = spring(P, 'aL', aL, dt, 120, 12); this.arms[1].rotation.z = spring(P, 'aR', aR, dt, 120, 12);
    this.arms[0].rotation.x = spring(P, 'aLx', aLx, dt, 120, 12); this.arms[1].rotation.x = spring(P, 'aRx', aRx, dt, 120, 12);
    const R = this.rig, ly = spring(P, 'lift', lift, dt, 140, 13), onB = !!this.board && this.planOut < 0 && st === 'present';
    const bx = spring(P, 'bx', onB ? 2.2 : 0, dt, 40, 11), by = spring(P, 'by', onB ? 0.1 : 0, dt, 40, 11), bz = spring(P, 'bz', onB ? -0.75 : 0, dt, 40, 11), bs = spring(P, 'bs', onB ? 0.44 : 1, dt, 40, 11), br = spring(P, 'br', onB ? -0.85 : 0, dt, 40, 11);
    R.position.set(bx, by + (ly + Math.sin(t * 2.1) * 0.03) * bs, bz); R.scale.setScalar(bs); R.rotation.y = spin + br;
    this.shadow.position.set(bx, by + 0.005, bz);
    this.feet.forEach((ft, i) => { ft.position.y = 0.2 - Math.min(ly, 0.6) * 0 + (st === 'idle' ? Math.max(0, Math.sin(t * 2.1 + i * Math.PI)) * 0.02 : 0); });
    this.shadow.scale.setScalar((1 - Math.min(0.45, ly * 0.6)) * bs); this.shadow.material.opacity = 1 - Math.min(0.6, ly);
    const av = (P.v.yaw || 0) + (P.v.roll || 0);
    this.ant.rotation.z = spring(P, 'ant', -av * 0.08 - roll * 0.6 + Math.sin(t * 3) * 0.04, dt, 50, 4);
    this.ant.rotation.x = spring(P, 'antx', (P.v.pitch || 0) * 0.05 + nod, dt, 50, 4);

    /* agent orbs */
    const work = st === 'work', head = this._v;
    this.head.getWorldPosition(head); head.y += 0.5;
    this.orbs.forEach((o, i) => {
      const sp = work ? 4.2 : 0.55, rad = work ? Math.max(0.15, 1.35 * (1 - seg(el, 0.2, 1.2))) : 1.35 + Math.sin(t * 0.7 + i) * 0.08;
      const a = t * sp + i * Math.PI * 2 / 3;
      o.m.position.set(head.x + Math.cos(a) * rad, head.y + 0.15 + Math.sin(a * 1.3 + i) * 0.22, head.z + Math.sin(a) * rad * 0.55);
      o.flash = Math.max(0, o.flash - dt * 1.4);
      o.m.scale.setScalar((work ? 1 - seg(el, 0.9, 1.25) : 1) * (1 + o.flash * 0.6) + 0.0001);
      o.m.material.emissiveIntensity = 0.5 + o.flash * 2.2;
      o.m.visible = !(work && el > 1.25) && st !== 'present';
    });
    this.tipM.emissiveIntensity = 0.45 + this.orbs.reduce((m, o) => Math.max(m, o.flash), 0) * 2 + (st === 'ponder' ? (Math.sin(t * 6) * 0.5 + 0.5) : 0) + f.glow;
    const ch = ago('absorb') < 0.9 || st === 'work';
    this.chest.forEach((d, i) => { d.material.emissiveIntensity = d.userData.on ? 0.5 + (ch ? Math.sin(t * 20 + i) * 0.5 + 0.6 : 0) : 0; });
    this.glow.intensity = 2.5 + f.glow * 4; this.glow.position.set(bx, 0.25 + by, bz + 0.9 * bs);
    const V = this.board && this.planOut < 0 ? VIEWS[this.view] : null, k = this.vk || 1, ce = 1 - Math.exp(-dt * 2.6);
    if (V) { this._v.set(V.t[0] + (V.p[0] - V.t[0]) * k, V.t[1] + (V.p[1] - V.t[1]) * k, V.t[2] + (V.p[2] - V.t[2]) * k); this.cpos.lerp(this._v, ce); this.ctgt.lerp(this._v.set(V.t[0], V.t[1], V.t[2]), ce); }
    else { this.cpos.lerp(this._v.set(0, 1.95, this.far || 7.4), ce); this.ctgt.lerp(this._v.set(0, 1.55, 0), ce); }
    this.cam.position.copy(this.cpos); this.cam.lookAt(this.ctgt);
    this.updatePlan(t, dt);
    this.drawFace(f);
  }
}

/* ====================================================================== */
/* HOLOGRAPHIC BLUEPRINT TABLE: Yardie projects the plan as a 3D model.   */
/* Stages are blocks (length = weeks, height = effort), agents are orbs,  */
/* risks are beacons, launch is a flag. Four camera views tour the model. */
/* ====================================================================== */
const AMBER = 0xF5A524, TL = 3.9, TX0 = -2.35;
function gridTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576; const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(0, 0, 1024, 576);
  for (let i = 0; i <= 40; i++) { x.strokeStyle = i % 5 ? 'rgba(143,136,255,.22)' : 'rgba(198,244,50,.45)'; x.lineWidth = i % 5 ? 1 : 2; x.beginPath(); x.moveTo(i * 25.6, 0); x.lineTo(i * 25.6, 576); x.stroke(); }
  for (let j = 0; j <= 22; j++) { x.strokeStyle = j % 5 ? 'rgba(143,136,255,.22)' : 'rgba(198,244,50,.45)'; x.lineWidth = j % 5 ? 1 : 2; x.beginPath(); x.moveTo(0, j * 26.2); x.lineTo(1024, j * 26.2); x.stroke(); }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t;
}
const VIEWS = [
  { p: [1.9, 4.6, 9.0], t: [0.3, 0.3, 0] },
  { p: [-1.5, 3.3, 6.9], t: [0.45, 0.3, 0] },
  { p: [0.9, 3.1, 6.4], t: [0.2, 0.85, 0] },
  { p: [5.2, 2.5, 4.9], t: [1.2, 0.5, -0.1] }
];
Object.assign(Buddy.prototype, {
  showPlan(P) {
    this.hidePlan(true);
    const g = this.board = new Group(); this.scene.add(g); this.plan = P; this.planT = this.now(); this.view = 0; this.drag = 0; this.planOut = -1; this.hover = -1;
    const top = new Mesh(new RoundedBoxGeometry(5.2, 0.1, 2.8, 3, 0.05), new MeshPhysicalMaterial({ color: 0x15123F, roughness: 0.22, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15 }));
    top.position.y = 0.05; g.add(top);
    const rim = new Mesh(new RoundedBoxGeometry(5.34, 0.05, 2.94, 3, 0.025), new MeshBasicMaterial({ color: 0x8F88FF })); rim.position.y = 0.02; g.add(rim);
    const grid = new Mesh(new PlaneGeometry(5.0, 2.6), new MeshBasicMaterial({ map: gridTex(), transparent: true, depthWrite: false }));
    grid.rotation.x = -Math.PI / 2; grid.position.y = 0.102; g.add(grid); this.grid = grid;
    this.blocks = P.stages.map((s, i) => {
      const len = Math.max(0.28, (s.b - s.a) / P.W * TL), x = TX0 + s.a / P.W * TL + len / 2, z = 0.72 - i * 0.29, h = 0.12 + s.e * 0.55;
      const col = s.kind === 'build' ? LIME : s.kind === 'run' ? MINT : s.kind === 'ship' ? 0xB8B3FF : IND;
      const pv = new Group(); pv.position.set(x, 0.1, z); g.add(pv);
      const m = new Mesh(new RoundedBoxGeometry(len, 1, 0.42, 2, 0.04), new MeshPhysicalMaterial({ color: col, emissive: col, emissiveIntensity: 0.22, roughness: 0.28, clearcoat: 0.8, transparent: true, opacity: 0.9 }));
      m.position.y = 0.5; pv.add(m);
      const ed = new LineSegments(new EdgesGeometry(new BoxGeometry(len, 1, 0.42)), new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
      ed.position.y = 0.5; pv.add(ed);
      pv.scale.y = 0.001; pv.userData = { m, ed, h, i };
      return { pv, m, h, len, x, z, top: new Vector3(x, 0.1 + h, z), col };
    });
    this.path = [];
    for (let i = 0; i < this.blocks.length - 1; i++) {
      const a = this.blocks[i], b = this.blocks[i + 1], bm = new Beam(g, LIME, 2);
      bm.set(a.top.clone().setY(a.top.y + 0.04), b.top.clone().setY(b.top.y + 0.04), 0.35); this.path.push(bm);
    }
    const pal = [LIME, 0x8F88FF, MINT, 0xFFFFFF, 0xF6C453, 0xFF8FB1];
    this.aorbs = P.agents.map((a, k) => {
      const b = this.blocks[Math.min(a.s, this.blocks.length - 1)], c = pal[k % pal.length];
      const m = new Mesh(new SphereGeometry(0.085, 18, 12), new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9 }));
      g.add(m); const ring = new Mesh(new RingGeometry(0.11, 0.13, 32), new MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: DoubleSide })); ring.rotation.x = -Math.PI / 2; g.add(ring);
      return { m, ring, b, k, off: (k % 3 - 1) * 0.3, lift: (k % 3) * 0.22, ph: Math.random() * 6 };
    });
    this.beacons = P.risks.map((r, k) => {
      const b = this.blocks[Math.min(r.s, this.blocks.length - 1)], bg = new Group();
      const cone = new Mesh(new OctahedronGeometry(0.1, 0), new MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 1 })); bg.add(cone);
      const ring = new Mesh(new RingGeometry(0.14, 0.17, 32), new MeshBasicMaterial({ color: AMBER, transparent: true, side: DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = -0.12; bg.add(ring);
      bg.position.copy(b.top); bg.position.x += b.len * 0.3 * (k ? -1 : 1); bg.position.y += 0.3; bg.scale.setScalar(0.001); g.add(bg); return { g: bg, cone, ring, b };
    });
    const last = this.blocks[this.blocks.length - 1], fx = TX0 + TL + 0.3, fz = last.z;
    const flag = this.flag = new Group(); flag.position.set(fx, 0.1, fz); g.add(flag);
    const pole = new Mesh(new CylinderGeometry(0.018, 0.018, 1.1, 8), new MeshStandardMaterial({ color: 0xF8F7FF })); pole.position.y = 0.55; flag.add(pole);
    const cloth = new Mesh(new PlaneGeometry(0.46, 0.28, 8, 2), new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 0.35, side: DoubleSide })); cloth.position.set(0.24, 0.95, 0); flag.add(cloth); this.cloth = cloth;
    const pad = new Mesh(new RingGeometry(0.14, 0.2, 36), new MeshBasicMaterial({ color: LIME, transparent: true, side: DoubleSide })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.01; flag.add(pad); this.pad = pad;
    flag.scale.setScalar(0.001);
    const N = this.low ? 70 : 140, pp = new Float32Array(N * 3), pr = [];
    for (let i = 0; i < N; i++) { pr.push([(Math.random() - 0.5) * 5, Math.random(), (Math.random() - 0.5) * 2.6, 0.2 + Math.random() * 0.5]); }
    const pg = new BufferGeometry(); pg.setAttribute('position', new BufferAttribute(pp, 3));
    this.parts = new Points(pg, new PointsMaterial({ color: LIME, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false })); this.partsR = pr; g.add(this.parts);
    const beam = this.proj = new Mesh(new CylinderGeometry(0.02, 1.15, 1, 40, 1, true), new MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false, blending: AdditiveBlending }));
    this.scene.add(beam);
    g.scale.setScalar(0.001);
  },
  hidePlan(now) {
    if (!this.board) return;
    if (!now) { this.planOut = this.now(); return; }
    const g = this.board; this.scene.remove(g); if (this.proj) this.scene.remove(this.proj);
    [g, this.proj].forEach(o => o && o.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material) { if (n.material.map) n.material.map.dispose(); n.material.dispose(); } }));
    this.board = null; this.proj = null; this.plan = null;
  },
  setView(i) { this.view = i; this.drag = 0; this.lastActive = this.now(); },
  dragBy(dx) { this.drag = clamp(this.drag + dx * 0.006, -0.9, 0.9); },
  hoverAt(nx, ny) {
    if (!this.board) return -1;
    if (!this._ray) this._ray = new Raycaster();
    this._ray.setFromCamera({ x: nx, y: ny }, this.cam);
    const hit = this._ray.intersectObjects(this.blocks.map(b => b.m), false)[0];
    this.hover = hit ? this.blocks.findIndex(b => b.m === hit.object) : -1; return this.hover;
  },
  anchors() {
    if (!this.board || !this.W) return null;
    const out = [], v = new Vector3(), g = this.board, W = this.W, H = this.H;
    const put = (k, p, dy) => { v.copy(p); v.y += dy || 0; g.localToWorld(v); v.project(this.cam); out.push({ k, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z }); };
    this.blocks.forEach((b, i) => put('s' + i, b.top, 0.12));
    this.aorbs.forEach(o => { v.copy(o.m.position); g.localToWorld(v); v.project(this.cam); out.push({ k: 'a' + o.k, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H - 14, z: v.z }); });
    this.beacons.forEach((b, i) => put('r' + i, b.g.position, 0.2));
    put('f', this.flag.position, 1.35);
    return out;
  },
  planFrame(o) { this.frameOff = o; this.resize(); },
  updatePlan(t, dt) {
    const g = this.board; if (!g) return;
    const pt = t - this.planT, out = this.planOut > 0 ? seg(t - this.planOut, 0, 0.5) : 0;
    if (this.planOut > 0 && out >= 1) { this.hidePlan(true); return; }
    const sIn = ease(seg(pt, 0.15, 0.95));
    g.scale.setScalar(Math.max(0.001, (sIn + Math.sin(Math.PI * seg(pt, 0.15, 0.95)) * 0.06) * (1 - ease(out))));
    g.rotation.y = lerp(g.rotation.y, this.drag + Math.sin(t * 0.25) * 0.03, 1 - Math.exp(-dt * 5));
    this.grid.material.opacity = 0.75 + Math.sin(t * 1.4) * 0.2;
    this.blocks.forEach((b, i) => {
      const k = ease(seg(pt, 0.7 + i * 0.16, 1.25 + i * 0.16)), hv = this.hover === i ? 1 : 0;
      b.pv.scale.y = Math.max(0.001, k * b.h * (1 + Math.sin(Math.PI * seg(pt, 0.7 + i * 0.16, 1.25 + i * 0.16)) * 0.15));
      b.pv.position.y = 0.1 + hv * 0.06;
      b.m.material.emissiveIntensity = 0.2 + hv * 0.45 + (this.view === 1 ? Math.max(0, Math.sin(t * 2 - i * 0.6)) * 0.25 : 0);
      b.pv.userData.ed.material.opacity = 0.35 + hv * 0.6;
    });
    this.path.forEach((bm, i) => bm.update(t, seg(pt, 1.6 + i * 0.1, 2.0 + i * 0.1) * (1 - out), 0.6));
    const team = this.view === 2 ? 1 : 0; this._tm = lerp(this._tm || 0, team, 1 - Math.exp(-dt * 4));
    this.aorbs.forEach(o => {
      const k = ease(seg(pt, 1.9 + o.k * 0.12, 2.7 + o.k * 0.12)), b = o.b;
      const hx = b.x + o.off, hy = b.top.y + 0.32 + this._tm * (0.5 + o.lift) + Math.sin(t * 2 + o.ph) * 0.05, hz = b.z + Math.cos(t + o.ph) * 0.08;
      const sx = 2.25, sy = 1.3, sz = -0.6;
      o.m.position.set(lerp(sx, hx, k), lerp(sy, hy, k) + Math.sin(Math.PI * k) * 0.8, lerp(sz, hz, k));
      o.m.scale.setScalar(Math.max(0.001, seg(pt, 1.85 + o.k * 0.12, 2.0 + o.k * 0.12) * (1 + this._tm * 0.25)));
      o.ring.position.set(hx, b.top.y + 0.01, b.z); const rr = (t * 0.7 + o.k * 0.3) % 1; o.ring.material.opacity = k >= 1 ? (1 - rr) * 0.6 : 0; o.ring.scale.setScalar(1 + rr * 1.6);
    });
    this.beacons.forEach((b, i) => {
      const k = ease(seg(pt, 2.6 + i * 0.15, 3.0 + i * 0.15)); b.g.scale.setScalar(Math.max(0.001, k * (1 + Math.sin(t * 5) * 0.08)));
      b.cone.rotation.y = t * 2; const rr = (t * 0.9 + i * 0.5) % 1; b.ring.material.opacity = (1 - rr) * 0.8; b.ring.scale.setScalar(1 + rr * 1.5);
      b.cone.material.emissiveIntensity = 0.7 + Math.sin(t * 6) * 0.4;
    });
    const fk = ease(seg(pt, 2.9, 3.4)); this.flag.scale.setScalar(Math.max(0.001, fk));
    const cp = this.cloth.geometry.attributes.position; if (!this.cloth.userData.base) this.cloth.userData.base = Float32Array.from(cp.array);
    const base = this.cloth.userData.base; for (let i = 0; i < cp.count; i++) { const x0 = base[i * 3]; cp.setZ(i, Math.sin(x0 * 9 - t * 6) * 0.04 * (x0 + 0.23)); } cp.needsUpdate = true;
    const rr = (t * 0.6) % 1; this.pad.material.opacity = (1 - rr) * 0.8; this.pad.scale.setScalar(1 + rr * 2.2);
    const pa = this.parts.geometry.attributes.position;
    this.partsR.forEach((p, i) => { const y = (p[1] + t * p[3] * 0.25) % 1; pa.setXYZ(i, p[0], 0.12 + y * 1.6, p[2]); });
    pa.needsUpdate = true; this.parts.material.opacity = 0.55 * sIn * (1 - out);
    const pb = Math.sin(Math.PI * seg(pt, 0, 1.6)) * (1 - out);
    if (this.proj) {
      this.head.getWorldPosition(this._v); const hy = this._v.y + 0.5, h = Math.max(0.1, hy - 0.12);
      const hd = this._v.clone(); hd.y += 0.5; const tg = new Vector3(0, 0.12, 0); this.board.localToWorld(tg);
      const dir = hd.clone().sub(tg), len = dir.length(); this.proj.position.copy(tg).addScaledVector(dir, 0.5); this.proj.scale.set(1, len, 1);
      this.proj.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize()); this.proj.material.opacity = pb * 0.11; this.proj.visible = pb > 0.01;
    }
  }
});
