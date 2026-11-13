
/* ====================================================================== */
/* SOLUTION MODEL: Yardie projects the actual solution onto a table.      */
/* Chapter 0 What we heard, 1 The solution, 2 How we build it, 3 By when. */
/* Each chapter runs its own animation on pieces built from the graph.    */
/* ====================================================================== */
const AMBER = 0xF5A524, OKG = 0x3DDC97, GREY = 0xAEABC4, GREY2 = 0x85819F, WHITE = 0xF8F7FF, LAV = 0x9C95F7, SOFTL = 0xD8F27A, SMINT = 0xBDEFDC;
const TZ = 1.24, TX = 1.9;
function gridTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576; const x = c.getContext('2d');
  const g = x.createRadialGradient(512, 288, 40, 512, 288, 620); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
  for (let i = 0; i <= 40; i++) { x.strokeStyle = i % 5 ? 'rgba(79,70,229,.07)' : 'rgba(79,70,229,.18)'; x.lineWidth = i % 5 ? 1 : 1.6; x.beginPath(); x.moveTo(i * 25.6, 0); x.lineTo(i * 25.6, 576); x.stroke(); }
  for (let j = 0; j <= 22; j++) { x.strokeStyle = j % 5 ? 'rgba(79,70,229,.07)' : 'rgba(79,70,229,.18)'; x.lineWidth = j % 5 ? 1 : 1.6; x.beginPath(); x.moveTo(0, j * 26.2); x.lineTo(1024, j * 26.2); x.stroke(); }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t;
}
function uiTex(kind) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 176; const x = c.getContext('2d');
  if (kind === 'blue') {
    x.fillStyle = '#3F38C9'; x.fillRect(0, 0, 256, 176); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1;
    for (let i = 0; i < 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 176); x.stroke(); } for (let j = 0; j < 176; j += 16) { x.beginPath(); x.moveTo(0, j); x.lineTo(256, j); x.stroke(); }
    x.strokeStyle = '#fff'; x.lineWidth = 3; x.strokeRect(40, 40, 70, 50); x.strokeRect(140, 60, 70, 70); x.beginPath(); x.moveTo(110, 65); x.lineTo(140, 95); x.stroke();
  } else if (kind === 'glitch') {
    x.fillStyle = '#4A4760'; x.fillRect(0, 0, 256, 176);
    for (let i = 0; i < 9; i++) { x.fillStyle = i % 3 ? 'rgba(255,255,255,.18)' : 'rgba(245,165,36,.55)'; x.fillRect(16 + (i * 37) % 120, 14 + i * 17, 60 + (i * 23) % 90, 7); }
  } else {
    x.fillStyle = '#EEEBFF'; x.fillRect(0, 0, 256, 176); x.fillStyle = '#4F46E5'; x.fillRect(14, 14, 60, 10);
    x.fillStyle = '#C9C5F5'; x.fillRect(14, 36, 228, 8); x.fillRect(14, 52, 160, 8);
    [0.5, 0.8, 0.6, 0.95].forEach((h, i) => { x.fillStyle = i % 2 ? '#C6F432' : '#8F88FF'; x.fillRect(24 + i * 50, 160 - h * 80, 32, h * 80); });
  }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
let TEX = null;
function piece(type) {
  if (!TEX) TEX = { blue: uiTex('blue'), glitch: uiTex('glitch'), ui: uiTex('ui') };
  const g = new Group(), mats = [], tick = [];
  const mk = (geo, color, o = {}) => {
    const m = new Mesh(geo, o.basic ? new MeshBasicMaterial({ color, map: o.map || null, transparent: true, side: o.side || 0 }) : new MeshPhysicalMaterial({ color, map: o.map || null, emissive: o.em || 0x000000, emissiveIntensity: o.ei || 0, roughness: o.r == null ? 0.32 : o.r, metalness: o.mt || 0, clearcoat: 0.55, clearcoatRoughness: 0.25, transparent: true, opacity: o.op == null ? 1 : o.op, side: o.side || 0 }));
    m.castShadow = !o.basic && (o.op == null || o.op > 0.6); m.material.userData.base = o.op == null ? 1 : o.op; mats.push(m.material); g.add(m); return m;
  };
  const fig = (x, z, col) => { const b = mk(new CapsuleGeometry(0.06, 0.12, 4, 8), col); b.position.set(x, 0.13, z); const h = mk(new SphereGeometry(0.06, 12, 10), col); h.position.set(x, 0.3, z); };
  switch (type) {
    case 'screen': { const st = mk(new CylinderGeometry(0.03, 0.06, 0.16, 10), GREY2); st.position.y = 0.08; const f = mk(new RoundedBoxGeometry(0.58, 0.4, 0.05, 2, 0.03), GREY); f.position.y = 0.36; const s = mk(new PlaneGeometry(0.5, 0.32), 0xffffff, { basic: 1, map: TEX.glitch }); s.position.set(0, 0.36, 0.027); tick.push(t => { s.material.opacity = 0.75 + (Math.sin(t * 23) > 0.85 ? -0.4 : 0); }); break; }
    case 'server': { for (let i = 0; i < 3; i++) { const b = mk(new RoundedBoxGeometry(0.42, 0.15, 0.42, 2, 0.03), i % 2 ? GREY : 0xC2BFD5); b.position.y = 0.08 + i * 0.16; const l = mk(new SphereGeometry(0.022, 8, 6), 0xF0554E, { em: 0xF0554E, ei: 1 }); l.position.set(0.14, 0.08 + i * 0.16, 0.215); tick.push(t => { l.material.emissiveIntensity = Math.sin(t * 5 + i * 2) > 0 ? 1.2 : 0.1; }); } break; }
    case 'paper': { for (let i = 0; i < 5; i++) { const p = mk(new BoxGeometry(0.42, 0.018, 0.3), i % 2 ? 0xCFCBE0 : 0xBDB9D2); p.position.set((i % 3 - 1) * 0.03, 0.02 + i * 0.03, (i % 2) * 0.02); p.rotation.y = (i * 0.37) % 0.6 - 0.3; } const f = mk(new BoxGeometry(0.3, 0.018, 0.22), 0xCFCBE0); f.position.set(0.12, 0.3, 0); tick.push(t => { f.position.y = 0.3 + Math.sin(t * 2) * 0.05; f.rotation.z = Math.sin(t * 1.4) * 0.4; }); break; }
    case 'people': fig(-0.14, 0, GREY); fig(0.02, 0.08, GREY2); fig(0.16, -0.04, GREY); break;
    case 'chat': { [[-0.08, 0.2, 0.36], [0.1, 0.4, 0.28]].forEach(([x, y, w], i) => { const b = mk(new RoundedBoxGeometry(w, 0.17, 0.08, 2, 0.06), i ? 0xBDB9D2 : GREY); b.position.set(x, y, 0); const c = mk(new ConeGeometry(0.05, 0.08, 6), i ? 0xBDB9D2 : GREY); c.position.set(x + (i ? 0.08 : -0.08), y - 0.11, 0); c.rotation.z = Math.PI; tick.push(t => { b.position.y = y + Math.sin(t * 3 + i) * 0.02; c.position.y = b.position.y - 0.11; }); }); break; }
    case 'app': { const b = mk(new RoundedBoxGeometry(0.46, 0.05, 0.3, 2, 0.02), WHITE); b.position.y = 0.025; const f = mk(new RoundedBoxGeometry(0.56, 0.4, 0.04, 2, 0.03), WHITE); f.position.set(0, 0.32, -0.04); f.rotation.x = -0.12; const s = mk(new PlaneGeometry(0.5, 0.34), 0xffffff, { basic: 1, map: TEX.ui }); s.position.set(0, 0.32, -0.017); s.rotation.x = -0.12; break; }
    case 'service': { for (let i = 0; i < 3; i++) { const b = mk(new RoundedBoxGeometry(0.4, 0.12, 0.4, 3, 0.04), i === 1 ? LAV : 0x7A72F0); b.position.y = 0.07 + i * 0.14; const r = mk(new BoxGeometry(0.41, 0.012, 0.41), SOFTL, { em: SOFTL, ei: 0.7 }); r.position.y = 0.135 + i * 0.14; tick.push(t => { r.material.emissiveIntensity = 0.4 + Math.max(0, Math.sin(t * 3 - i)) * 0.8; }); } break; }
    case 'store': { for (let i = 0; i < 3; i++) { const c = mk(new CylinderGeometry(0.2, 0.2, 0.11, 28), i % 2 ? 0xB8B3FF : LAV); c.position.y = 0.06 + i * 0.13; const r = mk(new TorusGeometry(0.2, 0.012, 6, 28), WHITE); r.rotation.x = Math.PI / 2; r.position.y = 0.115 + i * 0.13; } break; }
    case 'pipe': { const p = mk(new CylinderGeometry(0.09, 0.09, 0.62, 18, 1, true), SMINT, { op: 0.55, side: 2 }); p.rotation.z = Math.PI / 2; p.position.y = 0.2; [-1, 1].forEach(s => { const r = mk(new TorusGeometry(0.095, 0.02, 6, 18), WHITE); r.rotation.y = Math.PI / 2; r.position.set(s * 0.31, 0.2, 0); });
      for (let i = 0; i < 4; i++) { const d = mk(new SphereGeometry(0.04, 10, 8), 0x2FBF8F, { em: 0x2FBF8F, ei: 0.8 }); tick.push(t => { d.position.set(((t * 0.35 + i / 4) % 1 - 0.5) * 0.56, 0.2, 0); }); } const st = mk(new BoxGeometry(0.05, 0.11, 0.05), GREY2); st.position.set(0, 0.055, 0); break; }
    case 'ai': { const core = mk(new SphereGeometry(0.15, 28, 20), SOFTL, { em: SOFTL, ei: 0.9 }); core.position.y = 0.34; const ring = mk(new TorusGeometry(0.25, 0.012, 6, 40), LAV); ring.position.y = 0.34; ring.rotation.x = 1.2; const base = mk(new CylinderGeometry(0.12, 0.16, 0.08, 20), WHITE); base.position.y = 0.04;
      for (let i = 0; i < 3; i++) { const n = mk(new SphereGeometry(0.04, 10, 8), 0x4F46E5, { em: 0x4F46E5, ei: 0.4 }); tick.push(t => { const a = t * 1.6 + i * 2.09; n.position.set(Math.cos(a) * 0.25, 0.34 + Math.sin(a) * 0.08, Math.sin(a) * 0.25); }); } tick.push(t => { core.material.emissiveIntensity = 0.6 + Math.sin(t * 2.4) * 0.3; ring.rotation.z = t * 0.6; }); break; }
    case 'connector': { [-1, 1].forEach(s => { const hub = mk(new RoundedBoxGeometry(0.2, 0.22, 0.24, 3, 0.05), s < 0 ? LAV : 0x7A72F0); hub.position.set(s * 0.2, 0.11, 0); const pin = mk(new CylinderGeometry(0.035, 0.035, 0.06, 12), WHITE); pin.rotation.z = Math.PI / 2; pin.position.set(s * 0.08, 0.13, 0); }); const link = mk(new CylinderGeometry(0.03, 0.03, 0.12, 14), SOFTL, { em: SOFTL, ei: 0.8 }); link.rotation.z = Math.PI / 2; link.position.set(0, 0.13, 0); tick.push(t => { link.material.emissiveIntensity = 0.5 + Math.max(0, Math.sin(t * 4)) * 0.8; }); break; }
    case 'cloud': { const s = mk(new RoundedBoxGeometry(0.58, 0.07, 0.46, 2, 0.03), WHITE); s.position.y = 0.035; [[-0.1, 0.22, 0.11], [0.06, 0.26, 0.13], [0.18, 0.2, 0.09]].forEach(([x, y, r], i) => { const p = mk(new SphereGeometry(r, 18, 14), 0xffffff); p.position.set(x, y, 0); tick.push(t => { p.position.y = y + Math.sin(t * 1.5 + i) * 0.015; }); }); break; }
    case 'conveyor': { const b = mk(new RoundedBoxGeometry(0.62, 0.06, 0.24, 2, 0.02), 0x7A72F0); b.position.y = 0.12; [-0.24, 0, 0.24].forEach(x => { const r = mk(new CylinderGeometry(0.03, 0.03, 0.26, 10), WHITE); r.rotation.x = Math.PI / 2; r.position.set(x, 0.08, 0); });
      for (let i = 0; i < 2; i++) { const bx = mk(new RoundedBoxGeometry(0.1, 0.08, 0.1, 2, 0.02), SOFTL); tick.push(t => { bx.position.set(((t * 0.25 + i / 2) % 1 - 0.5) * 0.56, 0.19, 0); }); } break; }
    case 'shield': { const d = mk(new SphereGeometry(0.28, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), SMINT, { op: 0.42, r: 0.2 }); d.position.y = 0.02; const r = mk(new TorusGeometry(0.28, 0.018, 6, 36), 0x2FBF8F); r.rotation.x = Math.PI / 2; r.position.y = 0.02; const k = mk(new RoundedBoxGeometry(0.12, 0.12, 0.12, 2, 0.03), 0x2FBF8F); k.position.y = 0.1; tick.push(t => { d.material.opacity = d.material.userData.base * (0.8 + Math.sin(t * 2) * 0.2) * (d.material.userData.k || 1); }); break; }
    case 'gate': { [-1, 1].forEach(s => { const p = mk(new BoxGeometry(0.05, 0.3, 0.05), WHITE); p.position.set(s * 0.22, 0.15, 0); }); const a = mk(new TorusGeometry(0.22, 0.03, 8, 30, Math.PI), 0x4F46E5); a.position.y = 0.3; const c = mk(new SphereGeometry(0.05, 12, 10), OKG, { em: OKG, ei: 0.8 }); c.position.y = 0.55; const sc = mk(new BoxGeometry(0.4, 0.01, 0.04), SOFTL, { em: SOFTL, ei: 1 }); tick.push(t => { sc.position.y = 0.04 + ((t * 0.6) % 1) * 0.5; }); break; }
    case 'monitor': { const p = mk(new CylinderGeometry(0.025, 0.04, 0.26, 10), GREY2); p.position.y = 0.13; const d = mk(new CylinderGeometry(0.2, 0.05, 0.08, 24, 1, true), WHITE, { side: 2 }); d.position.y = 0.3; d.rotation.x = -0.6; const r = mk(new RingGeometry(0.06, 0.08, 24), 0x4F46E5, { basic: 1, side: 2 }); r.position.set(0, 0.36, 0.06); r.rotation.x = -0.6; tick.push(t => { const k = (t * 0.8) % 1; r.scale.setScalar(1 + k * 3); r.material.opacity = 1 - k; d.rotation.z = Math.sin(t * 0.7) * 0.5; }); break; }
    case 'people_c': fig(-0.14, 0, 0x4F46E5); fig(0.02, 0.08, SOFTL); fig(0.16, -0.04, 0x2FBF8F); break;
    case 'docs': { for (let i = 0; i < 3; i++) { const p = mk(new BoxGeometry(0.34, 0.02, 0.26), WHITE); p.position.set(0, 0.02 + i * 0.025, 0); p.rotation.y = i * 0.12; } const cd = mk(new RoundedBoxGeometry(0.28, 0.36, 0.02, 2, 0.01), WHITE); cd.position.set(0.05, 0.25, -0.06); cd.rotation.x = -0.25; const ln = mk(new PlaneGeometry(0.2, 0.2), 0xffffff, { basic: 1, map: TEX.ui }); ln.position.set(0.05, 0.26, -0.047); ln.rotation.x = -0.25; break; }
    case 'scan': { const doc = mk(new BoxGeometry(0.36, 0.02, 0.28), WHITE); doc.position.y = 0.02; const r = mk(new TorusGeometry(0.13, 0.025, 8, 28), LAV); r.position.y = 0.26; const gl = mk(new CircleGeometry(0.12, 24), 0xffffff, { op: 0.4 }); gl.position.y = 0.26; const h = mk(new CylinderGeometry(0.022, 0.022, 0.16, 8), 0x4F46E5); h.position.set(0.14, 0.12, 0); h.rotation.z = 0.8;
      const grp = [r, gl, h]; tick.push(t => { const ox = Math.sin(t * 1.3) * 0.06, oz = Math.cos(t * 1.1) * 0.05; r.position.set(ox, 0.26, oz); gl.position.set(ox, 0.26, oz); h.position.set(0.14 + ox, 0.12, oz); }); break; }
    case 'blueprint': { [-1, 1].forEach(s => { const l = mk(new CylinderGeometry(0.015, 0.015, 0.36, 6), GREY2); l.position.set(s * 0.18, 0.17, 0.05); l.rotation.x = 0.25; }); const bd = mk(new PlaneGeometry(0.5, 0.34), 0xffffff, { basic: 1, map: TEX.blue, side: 2 }); bd.position.set(0, 0.3, 0); bd.rotation.x = -0.35; break; }
  }
  g.userData = { mats, tick, type };
  return g;
}
function setOp(p, a) { p.userData.mats.forEach(m => { m.opacity = m.userData.base * a; m.userData.k = a; m.depthWrite = a > 0.95; }); p.visible = a > 0.01; }

Object.assign(Buddy.prototype, {
  showPlan(S) {
    this.hidePlan(true);
    const g = this.board = new Group(); this.scene.add(g); this.plan = S; this.chapter = 0; this.chT = this.now(); this.drag = 0; this.planOut = -1; this.hover = -1; this.planT = this.now();
    const top = new Mesh(new RoundedBoxGeometry(5.2, 0.1, 2.8, 3, 0.05), new MeshPhysicalMaterial({ color: 0xF1EFFF, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
    top.position.y = 0.05; g.add(top);
    const rim = new Mesh(new RoundedBoxGeometry(5.34, 0.05, 2.94, 3, 0.025), new MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 })); rim.position.y = 0.02; g.add(rim);
    const grid = new Mesh(new PlaneGeometry(5.0, 2.6), new MeshBasicMaterial({ map: gridTex(), transparent: true, depthWrite: false })); grid.rotation.x = -Math.PI / 2; grid.position.y = 0.102; g.add(grid);
    /* layout: up to 4 hero pieces in the middle, an outcome piece, and a protected zone for checks */
    top.receiveShadow = true;
    const core = S.comps.map((c, i) => i).filter(i => S.comps[i].lane !== 'outcome'), outc = S.comps.map((c, i) => i).filter(i => S.comps[i].lane === 'outcome');
    const SLOTS = { 1: [[0.2, -0.1]], 2: [[-0.45, -0.1], [0.8, -0.1]], 3: [[-0.6, 0.2], [0.3, -0.5], [1.05, 0.3]], 4: [[-0.5, -0.5], [0.65, -0.5], [-0.5, 0.45], [0.65, 0.45]] };
    const pos = [], sl = SLOTS[Math.max(1, Math.min(4, core.length))];
    core.forEach((id, k) => { pos[id] = new Vector3(sl[k][0], 0.1, sl[k][1]); });
    outc.forEach(id => { pos[id] = new Vector3(1.95, 0.1, -0.85); });
    this.comps = S.comps.map((c, i) => { const p = piece(c.viz === 'people' ? 'people_c' : c.viz); p.position.copy(pos[i]); p.userData.s = c.lane === 'outcome' ? 1.2 : 1.95; p.scale.setScalar(0.001); g.add(p);
      const hit = new Mesh(new BoxGeometry(0.62, 0.6, 0.62), new MeshBasicMaterial({ visible: false })); hit.position.y = 0.3; p.add(hit); p.userData.hit = hit; return { p, c, i }; });
    this.zone = null;
    if (S.zone && core.length) {
      const xs = core.map(i => pos[i].x), zs = core.map(i => pos[i].z), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 0.85, rz = (Math.max(...zs) - Math.min(...zs)) / 2 + 0.75;
      const zg = new Group(); zg.position.set(cx, 0.1, cz); g.add(zg);
      const ring = new Mesh(new TorusGeometry(1, 0.025, 8, 80), new MeshStandardMaterial({ color: 0x2FBF8F, emissive: 0x2FBF8F, emissiveIntensity: 0.5, transparent: true })); ring.rotation.x = Math.PI / 2; ring.scale.set(rx, rz, 1); ring.position.y = 0.02; zg.add(ring);
      const wall = new Mesh(new CylinderGeometry(1, 1, 0.3, 80, 1, true), new MeshBasicMaterial({ color: SMINT, transparent: true, opacity: 0.22, side: DoubleSide, depthWrite: false })); wall.scale.set(rx, 1, rz); wall.position.y = 0.15; zg.add(wall);
      const gate = piece('gate'); gate.position.set(-rx, 0, 0); gate.rotation.y = Math.PI / 2; gate.scale.setScalar(1.2); zg.add(gate);
      const shield = piece('shield'); shield.position.set(rx * 0.72, 0, -rz * 0.72); shield.scale.setScalar(0.9); zg.add(shield);
      zg.scale.setScalar(0.001); this.zone = { g: zg, ring, wall, gate, shield, rx, rz };
    }
    const spread = (n, a, b) => n === 1 ? [(a + b) / 2] : Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
    const tl = S.today.length, tz = spread(tl, -0.75, 0.75), tc = spread(tl, -1.55, 0.35);
    this.today = S.today.map((t, i) => { const p = piece(t.shape); p.userData.col = new Vector3(-2.05, 0.1, tz[i]); p.userData.mid = new Vector3(tl > 1 ? tc[i] * 0.85 : -0.3, 0.1, tl > 1 ? (i % 2 ? 0.35 : -0.35) : 0); p.position.copy(p.userData.mid); p.scale.setScalar(0.001); g.add(p); return { p, t, i }; });
    this.cables = [];
    for (let i = 0; i < tl; i++) for (let j = i + 1; j < tl; j++) this.cables.push({ b: new Beam(g, GREY2, 1), i, j, ph: Math.random() * 6 });
    this.marks = S.problems.map((pr, k) => {
      const m = new Group(), stated = pr.stated;
      const o = new Mesh(new OctahedronGeometry(0.1, 0), new MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.7, wireframe: !stated, transparent: true })); m.add(o);
      const r = new Mesh(new RingGeometry(0.13, 0.16, 32), new MeshBasicMaterial({ color: AMBER, transparent: true, side: DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = -0.14; m.add(r);
      m.scale.setScalar(0.001); g.add(m); return { m, o, r, pr, k, fixedAt: -1, c: new Color(AMBER) };
    });
    this.flows = S.edges.map(([a, b]) => { const bm = new Beam(g, 0x4F46E5, 1); bm.pulses.forEach(p => p.scale.setScalar(0.5)); return { b: bm, a, bb: b }; });
    /* chapter 2: build timeline, agents, gates */
    const tr = this.track = new Group(); g.add(tr);
    const bar = new Mesh(new RoundedBoxGeometry(TX * 2, 0.025, 0.07, 2, 0.012), new MeshStandardMaterial({ color: 0xDCD7FA, transparent: true })); bar.position.set(0, 0.115, TZ); tr.add(bar);
    this.fill = new Mesh(new RoundedBoxGeometry(1, 0.03, 0.075, 2, 0.012), new MeshStandardMaterial({ color: SOFTL, emissive: SOFTL, emissiveIntensity: 0.4, transparent: true })); this.fill.position.set(-TX, 0.118, TZ); tr.add(this.fill);
    this.cursor = new Mesh(new SphereGeometry(0.06, 16, 12), new MeshStandardMaterial({ color: 0x4F46E5, emissive: 0x4F46E5, emissiveIntensity: 0.5 })); this.cursor.position.set(-TX, 0.16, TZ); tr.add(this.cursor);
    tr.visible = false;
    this.swarm = [0, 1, 2, 3, 4, 5].map(i => { const m = new Mesh(new SphereGeometry(0.045, 12, 10), new MeshStandardMaterial({ color: [SOFTL, LAV, 0x2FBF8F][i % 3], emissive: [SOFTL, LAV, 0x2FBF8F][i % 3], emissiveIntensity: 0.9 })); m.visible = false; g.add(m); return m; });
    this.gateMarks = S.gates.map(gt => { const gg = new Group(); const a = new Mesh(new TorusGeometry(0.12, 0.022, 8, 24, Math.PI), new MeshStandardMaterial({ color: 0x4F46E5 })); a.position.y = 0.12; gg.add(a); const h = new Mesh(new SphereGeometry(0.05, 12, 10), new MeshStandardMaterial({ color: WHITE })); h.position.y = 0.2; gg.add(h); const b = new Mesh(new CapsuleGeometry(0.035, 0.06, 4, 8), new MeshStandardMaterial({ color: WHITE })); b.position.y = 0.1; gg.add(b);
      gg.position.set(-TX + (gt.day / S.days) * TX * 2, 0.12, TZ - 0.02); gg.scale.setScalar(0.001); g.add(gg); return { g: gg, gt }; });
    /* chapter 3: milestone road */
    this.flags = S.milestones.map((ms, k) => { const f = new Group(); const pole = new Mesh(new CylinderGeometry(0.012, 0.012, 0.42, 6), new MeshStandardMaterial({ color: WHITE })); pole.position.y = 0.21; f.add(pole);
      const live = ms.live, cl = new Mesh(new PlaneGeometry(0.2, 0.12), new MeshStandardMaterial({ color: live ? SOFTL : LAV, emissive: live ? SOFTL : LAV, emissiveIntensity: 0.3, side: DoubleSide })); cl.position.set(0.1, 0.36, 0); f.add(cl);
      f.position.set(-TX + Math.min(1, ms.day / S.days) * TX * 2, 0.11, TZ); f.scale.setScalar(0.001); g.add(f); return { f, ms, cl }; });
    const N = this.low ? 60 : 120, pp = new Float32Array(N * 3), pr = [];
    for (let i = 0; i < N; i++) pr.push([(Math.random() - 0.5) * 5, Math.random(), (Math.random() - 0.5) * 2.6, 0.2 + Math.random() * 0.5]);
    const pg = new BufferGeometry(); pg.setAttribute('position', new BufferAttribute(pp, 3));
    this.parts = new Points(pg, new PointsMaterial({ color: 0x8F88FF, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false })); this.partsR = pr; g.add(this.parts);
    const bN = 90, bp = new Float32Array(bN * 3), bv = []; for (let i = 0; i < bN; i++) { const a = Math.random() * 6.283, s = 0.6 + Math.random() * 1.6; bv.push([Math.cos(a) * s, 1 + Math.random() * 2, Math.sin(a) * s * 0.6]); }
    const bgeo = new BufferGeometry(); bgeo.setAttribute('position', new BufferAttribute(bp, 3));
    this.burst = new Points(bgeo, new PointsMaterial({ color: 0xA8D420, size: 0.06, transparent: true, opacity: 0, depthWrite: false })); this.burstV = bv; g.add(this.burst);
    this.proj = new Mesh(new CylinderGeometry(0.02, 0.6, 1, 32, 1, true), new MeshBasicMaterial({ color: 0xB8B3FF, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false })); this.scene.add(this.proj);
    g.scale.setScalar(0.001);
  },
  hidePlan(now) {
    if (!this.board) return;
    if (!now) { this.planOut = this.now(); return; }
    const g = this.board; this.scene.remove(g); if (this.proj) this.scene.remove(this.proj);
    [g, this.proj].forEach(o => o && o.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material) { if (n.material.map && !Object.values(TEX || {}).includes(n.material.map)) n.material.map.dispose(); n.material.dispose(); } }));
    this.board = null; this.proj = null; this.plan = null;
  },
  yardiePos() { return [2.3, 0.55, -0.55]; },
  setChapter(i, replay) { if (i !== this.chapter || replay) { this.chapter = i; this.chT = this.now(); } this.drag = 0; this.lastActive = this.now(); },
  setView(i) { this.setChapter(i); },
  dragBy(dx) { this.drag = clamp(this.drag + dx * 0.006, -0.9, 0.9); },
  hoverAt(nx, ny) {
    if (!this.board || this.chapter === 0) { this.hover = -1; return -1; }
    if (!this._ray) this._ray = new Raycaster();
    this._ray.setFromCamera({ x: nx, y: ny }, this.cam);
    const hit = this._ray.intersectObjects(this.comps.map(c => c.p.userData.hit), false)[0];
    this.hover = hit ? this.comps.findIndex(c => c.p.userData.hit === hit.object) : -1; return this.hover;
  },
  day() { const S = this.plan, el = this.now() - this.chT; return this.chapter === 2 ? clamp((el - 0.8) / 7.5, 0, 1) * S.days : this.chapter === 3 ? S.days : this.chapter === 1 ? 0 : 0; },
  anchors() {
    if (!this.board || !this.W) return null;
    const out = [], v = new Vector3(), g = this.board, W = this.W, H = this.H;
    const put = (k, obj, dy, extra) => { v.copy(obj.position); v.y += dy; g.localToWorld(v); v.project(this.cam); out.push(Object.assign({ k, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z }, extra || {})); };
    const day = this.day();
    this.today.forEach(t => put('t' + t.i, t.p, -0.02, { below: 1 }));
    this.comps.forEach(c => put('c' + c.i, c.p, 0.5 * (c.p.userData.s || 1), { building: this.chapter === 2 && day >= c.c.start && day < c.c.end, built: day >= c.c.end }));
    this.marks.forEach(m => put('p' + m.k, m.m, 0.16, { fixed: m.fixedAt > 0 }));
    this.gateMarks.forEach((gm, i) => put('g' + i, gm.g, 0.32, { shown: gm.g.scale.x > 0.5 }));
    this.flags.forEach((f, i) => put('m' + i, f.f, 0.5, { shown: f.f.scale.x > 0.5 }));
    if (this.zone) { const zp = { position: this.zone.g.position.clone().add(new Vector3(0, 0, this.zone.rz)) }; put('z', zp, 0.32, { shown: !!this.zoneOn }); }
    put('w', this.cursor, 0.12);
    return out;
  },
  yardieRect() {
    if (!this.rig || !this.W) return null;
    const c = new Vector3(), v = new Vector3(); this.rig.getWorldPosition(c); const s = this.rig.scale.x || 1;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    [-0.85, 0.85].forEach(dx => [0, 3.7].forEach(dy => [-0.6, 0.6].forEach(dz => { v.set(c.x + dx * s, c.y + dy * s, c.z + dz * s).project(this.cam); const x = (v.x * 0.5 + 0.5) * this.W, y = (-v.y * 0.5 + 0.5) * this.H; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); })));
    return [x0, y0, x1, y1];
  },
  planFrame(o) { this.frameOff = o; this.resize(); },
  fitPts(i) {
    const P = [], V3 = (x, y, z) => P.push(new Vector3(x, y, z));
    if (i === 0) { V3(-1.9, 0.1, -0.85); V3(0.7, 0.1, 0.85); (this.today || []).forEach(t => { const m = t.p.userData.mid; V3(m.x - 0.45, 0.1, m.z - 0.35); V3(m.x + 0.45, 0.1, m.z + 0.35); V3(m.x, 1.05, m.z); }); }
    else { [-2.62, 2.62].forEach(x => [-1.42, 1.42].forEach(z => V3(x, 0.1, z))); (this.comps || []).forEach(c => V3(c.p.position.x, 0.95, c.p.position.z)); }
    const Y = this.yardiePos(); for (let y = 0; y <= 1.7; y += 0.425) [-0.45, 0.45].forEach(dx => [-0.4, 0.4].forEach(dz => V3(Y[0] + dx, y, Y[1] + dz)));
    return P;
  },
  fitCam(i) {
    const D = [[-0.9, 3.4, 5.2], [1.4, 4.2, 7.8], [0.2, 3.6, 7.6], [0.9, 2.6, 7.4]][i], key = i + '|' + this.W + 'x' + this.H + '|' + (this.comps ? this.comps.length : 0) + (this.today ? this.today.length : 0);
    if (this._fk === key) return this._fit;
    const cam = this.cam, sp = cam.position.clone(), sq = cam.quaternion.clone(), pts = this.fitPts(i), v = new Vector3();
    const dir = new Vector3(D[0], D[1], D[2]).normalize(), tgt = new Vector3(0, 0.4, 0); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / (pts.length + 1));
    const right = new Vector3(), up = new Vector3(), fov = cam.fov * Math.PI / 180, asp = this.W / this.H; let d = 8;
    for (let it = 0; it < 6; it++) {
      cam.position.copy(tgt).addScaledVector(dir, d); cam.lookAt(tgt); cam.updateMatrixWorld();
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9; pts.forEach(p => { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); });
      const hh = d * Math.tan(fov / 2), hw = hh * asp; right.setFromMatrixColumn(cam.matrixWorld, 0); up.setFromMatrixColumn(cam.matrixWorld, 1);
      tgt.addScaledVector(right, (x0 + x1) / 2 * hw * 0.9).addScaledVector(up, (y0 + y1) / 2 * hh * 0.9);
      d *= Math.max((x1 - x0) / 2 / 0.86, (y1 - y0) / 2 / 0.8);
    }
    cam.position.copy(sp); cam.quaternion.copy(sq); cam.updateMatrixWorld();
    this._fit = { p: tgt.clone().addScaledVector(dir, d), t: tgt }; this._fk = key; return this._fit;
  },
  updatePlan(t, dt) {
    const g = this.board; if (!g) return;
    const S = this.plan, ch = this.chapter, el = t - this.chT, pt = t - this.planT, out = this.planOut > 0 ? seg(t - this.planOut, 0, 0.5) : 0;
    if (this.planOut > 0 && out >= 1) { this.hidePlan(true); return; }
    const sIn = ease(seg(pt, 0.1, 0.8));
    g.scale.setScalar(Math.max(0.001, sIn * (1 - ease(out))));
    g.rotation.y = lerp(g.rotation.y, this.drag + Math.sin(t * 0.25) * 0.02, 1 - Math.exp(-dt * 5));
    const k = 1 - Math.exp(-dt * 5), day = this.day();
    let projTarget = null;
    /* today systems */
    this.today.forEach((o, i) => {
      const p = o.p, toCol = ch > 0, tp = toCol ? p.userData.col : p.userData.mid;
      p.position.lerp(tp, k * 0.8);
      const s = ch === 0 ? 1.45 : 0.72, pop = ease(seg(ch === 0 ? el : pt, 0.2 + i * 0.12, 0.6 + i * 0.12));
      p.scale.setScalar(Math.max(0.001, lerp(p.scale.x, s * pop, k)));
      p.rotation.z = ch === 0 ? Math.sin(t * 3 + i) * 0.05 : lerp(p.rotation.z, 0, k);
      setOp(p, ch === 0 ? 1 : lerp(p.userData.mats[0].userData.k == null ? 1 : p.userData.mats[0].userData.k, 0.38, k));
      p.userData.tick.forEach(f => f(t));
    });
    this.cables.forEach(c => { const a = this.today[c.i].p.position, b = this.today[c.j].p.position; c.b.set(a.clone().setY(0.25), b.clone().setY(0.25), 0.25 + Math.sin(t * 2 + c.ph) * 0.15); c.b.update(t, ch === 0 ? 0.9 * seg(el, 0.5, 1.2) : 0, 0.3); });
    /* components */
    this.comps.forEach((o, i) => {
      const p = o.p, c = o.c, base = p.userData.s || 1, hv = this.hover === i ? 1 : 0;
      let s = 0, op = 1, y = 0.1;
      if (ch === 1) { const st = 0.9 + i * 0.45, kk = seg(el, st, st + 0.7); s = ease(kk); y = 0.1 + (1 - ease(kk)) * 1.3 + Math.sin(Math.PI * kk) * 0.1; if (kk >= 1 && !o.landed) o.landed = t; if (kk < 1) o.landed = 0; }
      else if (ch === 2) { const f = clamp((day - c.start) / Math.max(1, c.end - c.start), 0, 1); s = 1; op = 0.16 + 0.84 * f; p.scale.y; o.f = f; }
      else if (ch === 3) { s = 1; o.landed = o.landed || t; }
      p.position.y = lerp(p.position.y, y, ch === 1 ? 1 : k);
      const sy = ch === 2 ? 0.35 + 0.65 * (o.f || 0) : 1;
      p.scale.set(Math.max(0.001, s * base * (1 + hv * 0.08)), Math.max(0.001, s * base * sy * (1 + hv * 0.08)), Math.max(0.001, s * base * (1 + hv * 0.08)));
      setOp(p, ch === 0 ? 0 : op);
      p.userData.tick.forEach(f => f(t));
      if (ch === 1 && el > 0.9 + i * 0.45 && el < 0.9 + i * 0.45 + 0.75) projTarget = p.position;
    });
    /* problem markers: amber in chapter 0, turn green when their fixing component lands */
    this.marks.forEach(m => {
      const ti = m.pr.today >= 0 ? this.today[m.pr.today] : null, host = ti ? ti.p.position : new Vector3(-1, 0.1, 0);
      const stackY = 0.78 + (m.pr.slot || 0) * 0.3;
      m.m.position.set(host.x + (m.pr.slot || 0) * 0.12, host.y + stackY * (ch === 0 ? 1.2 : 0.9), host.z);
      const appear = ch === 0 ? ease(seg(el, 0.7 + m.k * 0.7, 1.1 + m.k * 0.7)) : 1;
      const fix = m.pr.fix >= 0 ? this.comps[m.pr.fix] : null;
      const fixed = ch >= 2 || (ch === 1 && ((fix && fix.landed && t - fix.landed > 0.2) || (m.pr.fix === -2 && this.zoneOn)));
      if (fixed && m.fixedAt < 0) m.fixedAt = t; if (!fixed) m.fixedAt = -1;
      m.c.lerp(new Color(fixed ? OKG : AMBER), k); m.o.material.color.copy(m.c); m.o.material.emissive.copy(m.c); m.r.material.color.copy(m.c);
      const popF = m.fixedAt > 0 ? Math.sin(Math.PI * seg(t - m.fixedAt, 0, 0.45)) * 0.5 : 0;
      m.m.scale.setScalar(Math.max(0.001, appear * (1 + popF + Math.sin(t * 4 + m.k) * 0.05) * (ch >= 2 ? 0 : 1)));
      m.o.rotation.y = t * 1.5; const rr = (t * 0.8 + m.k * 0.3) % 1; m.r.scale.setScalar(1 + rr * 1.4); m.r.material.opacity = (1 - rr) * 0.8;
      if (ch === 0 && el > 0.7 + m.k * 0.7 && el < 1.4 + m.k * 0.7) projTarget = m.m.position;
    });
    if (ch === 0 && !projTarget && this.marks.length) projTarget = this.marks[Math.floor(t * 0.6) % this.marks.length].m.position;
    /* protected zone: quality and security checks around the build */
    if (this.zone) {
      const Z = this.zone, zIn = ch === 0 ? 0 : ch === 1 ? ease(seg(el, 1.2 + this.comps.length * 0.45, 2.0 + this.comps.length * 0.45)) : 1;
      const zf = ch === 2 ? clamp((day - S.zone.start) / Math.max(1, S.zone.end - S.zone.start), 0, 1) : 1;
      Z.g.scale.setScalar(Math.max(0.001, zIn)); Z.ring.material.opacity = 0.35 + 0.65 * zf; Z.wall.material.opacity = (0.08 + 0.16 * zf) * (0.85 + Math.sin(t * 1.6) * 0.15);
      Z.ring.material.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15 + zf * 0.3; setOp(Z.gate, 0.3 + 0.7 * zf); setOp(Z.shield, 0.3 + 0.7 * zf);
      Z.gate.userData.tick.forEach(f => f(t)); Z.shield.userData.tick.forEach(f => f(t)); this.zoneOn = zIn > 0.5;
    }
    /* flows */
    this.flows.forEach(f => {
      const node = id => id.charAt(0) === 'T' ? this.today[+id.slice(1)] && this.today[+id.slice(1)].p : (this.comps.find(c => c.c.id === id) || {}).p;
      const A = node(f.a), B = node(f.bb); if (!A || !B) return;
      const la = f.a.charAt(0) === 'T' || (this.comps.find(c => c.c.id === f.a) || {}).landed, lb = (this.comps.find(c => c.c.id === f.bb) || {}).landed;
      const on = ch === 1 ? (la && lb ? 0.8 : 0) : ch === 3 ? 0.6 : 0;
      f.b.set(A.position.clone().setY(0.3), B.position.clone().setY(0.3), 0.35); f.b.update(t, on, ch === 3 && this.boom ? 1.6 : 0.6);
    });
    /* chapter 2: time track, building swarm, review gates */
    this.track.visible = ch >= 2; const fr = S.days ? day / S.days : 0;
    this.fill.scale.x = Math.max(0.001, fr * TX * 2); this.fill.position.x = -TX + fr * TX;
    this.cursor.position.x = -TX + fr * TX * 2;
    const building = ch === 2 ? this.comps.filter(o => o.f > 0 && o.f < 1).slice(0, 1) : [];
    this.swarm.forEach((m, i) => { const o = building[i % Math.max(1, building.length)]; m.visible = !!o && i < 3; m.scale.setScalar(0.7); if (!m.visible) return; const a = t * 3 + i * 1.7; m.position.set(o.p.position.x + Math.cos(a) * 0.5, 0.75 + Math.sin(t * 5 + i) * 0.06, o.p.position.z + Math.sin(a) * 0.5); });
    this.gateMarks.forEach(gm => { const on = ch === 2 ? day >= gm.gt.day : ch === 3; gm.g.scale.setScalar(lerp(gm.g.scale.x, on ? 1 : 0.001, k * 1.5)); });
    /* chapter 3: milestones and go-live */
    this.flags.forEach((f, i) => { const on = ch === 3 && el > 0.6 + i * 0.55; f.f.scale.setScalar(lerp(f.f.scale.x, on ? 1 : 0.001, k * 1.5)); f.cl.rotation.y = Math.sin(t * 3 + i) * 0.3; });
    const liveT = 0.6 + this.flags.length * 0.55 + 0.2; this.boom = ch === 3 && el > liveT;
    const be = ch === 3 ? seg(el, liveT, liveT + 2.4) : 0, bpos = this.burst.geometry.attributes.position;
    this.burstV.forEach((b, i) => bpos.setXYZ(i, b[0] * be, 0.3 + b[1] * be - be * be * 0.9, b[2] * be)); bpos.needsUpdate = true; this.burst.material.opacity = be > 0 && be < 1 ? (1 - be) : 0;
    if (ch === 3) this.comps.forEach(o => o.p.userData.mats.forEach(m => { if (m.emissive) m.emissiveIntensity = (m.userData.ei0 == null ? (m.userData.ei0 = m.emissiveIntensity) : m.userData.ei0) + (this.boom ? Math.max(0, Math.sin((el - liveT) * 3)) * 0.4 : 0); }));
    /* ambience and projector */
    const pa = this.parts.geometry.attributes.position; this.partsR.forEach((p, i) => { const y = (p[1] + t * p[3] * 0.25) % 1; pa.setXYZ(i, p[0], 0.12 + y * 1.6, p[2]); }); pa.needsUpdate = true;
    this.parts.material.opacity = 0.4 * sIn * (1 - out);
    if (this.proj) {
      const show = projTarget && out === 0 ? 1 : 0; this._pv = lerp(this._pv || 0, show, k);
      if (projTarget) { this.head.getWorldPosition(this._v); const hd = this._v.clone(); hd.y += 0.5; const tg = projTarget.clone(); g.localToWorld(tg); const dir = hd.clone().sub(tg), len = dir.length(); this.proj.position.copy(tg).addScaledVector(dir, 0.5); this.proj.scale.set(1, len, 1); this.proj.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize()); }
      this.proj.material.opacity = 0; this.proj.visible = this._pv > 0.01;
    }
  }
});
