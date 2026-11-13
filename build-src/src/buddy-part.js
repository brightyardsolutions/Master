
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
    const key = new DirectionalLight(0xffffff, 1.5); key.position.set(3, 6, 7); S.add(key); this.key = key;
    if (!this.low) {
      this.r.shadowMap.enabled = true; this.r.shadowMap.type = PCFSoftShadowMap; key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
      const sc = key.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 1; sc.far = 20; key.shadow.radius = 5; key.shadow.bias = -0.0006;
      try { const pm = new PMREMGenerator(this.r); S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; S.environmentIntensity = 0.55; pm.dispose(); } catch (e) {}
    }
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
    const a = w / h; this.far = a < 0.75 ? 9.6 : a < 1 ? 8.4 : 7.4; this.vk = a < 0.75 ? 1.6 : a < 1 ? 1.3 : a > 1.9 ? 0.74 : a > 1.5 ? 0.86 : 1;
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
    const YP = this.yardiePos ? this.yardiePos() : [2.3, 0.55, -0.55];
    const bx = spring(P, 'bx', onB ? YP[0] : 0, dt, 40, 11), by = spring(P, 'by', onB ? 0.1 : 0, dt, 40, 11), bz = spring(P, 'bz', onB ? YP[1] : 0, dt, 40, 11), bs = spring(P, 'bs', onB ? 0.44 : 1, dt, 40, 11), br = spring(P, 'br', onB ? YP[2] : 0, dt, 40, 11);
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
    this.glow.intensity = (this.board ? 0.6 : 2.5) + f.glow * (this.board ? 1 : 4); this.glow.position.set(bx, 0.25 + by, bz + 0.9 * bs);
    const V = this.board && this.planOut < 0, k = this.vk || 1, ce = 1 - Math.exp(-dt * 2.6);
    if (V) {
      const F = this.fitCam(this.chapter || 0); this.cpos.lerp(F.p, ce); this.ctgt.lerp(F.t, ce);
    }
    else { this.cpos.lerp(this._v.set(0, 1.95, this.far || 7.4), ce); this.ctgt.lerp(this._v.set(0, 1.55, 0), ce); }
    this.cam.position.copy(this.cpos); this.cam.lookAt(this.ctgt);
    this.updatePlan(t, dt);
    this.drawFace(f);
  }
}
