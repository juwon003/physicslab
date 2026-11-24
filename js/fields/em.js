/* =====================================================================
 * 전자기학 · 광학 — 정전기학 · 전류와 회로 · 자기장 · 전자기 유도 · 전자기파 · 광학
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, log, hypot, floor, atan2 } = Math;
  const add = (law) => PL.add('em', law);

  /* ---------- 점전하 전기장 도구 (화면 좌표) ---------- */
  function efield(ch, x, y) {
    let ex = 0, ey = 0;
    for (const c of ch) {
      const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy + 1e-6, r3 = r2 * sqrt(r2);
      ex += (c.q * dx) / r3; ey += (c.q * dy) / r3;
    }
    return [ex, ey];
  }
  function pot(ch, x, y) { let v = 0; for (const c of ch) v += c.q / (hypot(x - c.x, y - c.y) + 1e-3); return v; }
  function fieldLines(ch, dens = 4, rad = 13) {
    ch = ch.filter((c) => c.q !== 0);
    const tot = ch.reduce((s, c) => s + c.q, 0), sg = tot >= 0 ? 1 : -1, src = ch.filter((c) => c.q * sg > 0), lines = [];
    for (const c of src) {
      const n = max(1, Math.round(abs(c.q) * dens));
      for (let k = 0; k < n; k++) {
        const a = (2 * PI * (k + 0.5)) / n;
        let x = c.x + rad * cos(a), y = c.y + rad * sin(a);
        const pts = [[x, y]];
        for (let s = 0; s < 800; s++) {
          let [ex, ey] = efield(ch, x, y), m = hypot(ex, ey) || 1e-12;
          const mx = x + (sg * ex * 2) / m, my = y + (sg * ey * 2) / m;
          [ex, ey] = efield(ch, mx, my); m = hypot(ex, ey) || 1e-12;
          x += (sg * ex * 4) / m; y += (sg * ey * 4) / m;
          pts.push([x, y]);
          if (x < -60 || x > 960 || y < -60 || y > 620) break;
          if (ch.some((o) => o !== c && o.q * c.q < 0 && hypot(x - o.x, y - o.y) < rad - 3)) break;
        }
        lines.push(pts);
      }
    }
    lines.sg = sg;
    return lines;
  }
  function drawLines(d, lines, col = 'rgba(255,216,77,0.55)') {
    lines.forEach((pts) => {
      d.poly(pts, col, 1.4);
      const i = floor(pts.length * 0.45);
      if (pts.length > 12) {
        const a = pts[i], b = pts[i + 2], dir = lines.sg;
        const ax = dir > 0 ? a : b, bx = dir > 0 ? b : a;
        d.arrow(ax[0], ax[1], bx[0] + (bx[0] - ax[0]) * 2, bx[1] + (bx[1] - ax[1]) * 2, col, 1.4, 7);
      }
    });
  }
  function equipot(d, ch, x0, y0, w, h, step = 6) {
    const nx = floor(w / step) + 1, ny = floor(h / step) + 1, g = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g[j * nx + i] = pot(ch, x0 + i * step, y0 + j * step);
    const segs = [];
    for (let k = 0; k < 7; k++) { const L = 0.004 * Math.pow(2, k); segs.push([PL.contour(g, nx, ny, L), C.red], [PL.contour(g, nx, ny, -L), C.blue]); }
    return segs.map(([s, col]) => ({ s, col, x0, y0, step }));
  }
  function dragList(type, x, y, S, list, rad = 20) {
    if (type === 'move') { S.mx = x; S.my = y; }
    if (type === 'down') { const i = list.findIndex((c) => hypot(c.x - x, c.y - y) < rad); if (i >= 0) { S.drag = i; return true; } return false; }
    if (type === 'move' && S.drag != null) { list[S.drag].x = M.clamp(x, 20, 880); list[S.drag].y = M.clamp(y, 20, 540); S.ver = (S.ver || 0) + 1; }
    if (type === 'up' || type === 'leave') S.drag = null;
    return false;
  }

  /* ================================================================ 정전기학 */
  add({
    id: 'coulomb', cat: '정전기학', name: '쿨롱 법칙', en: "Coulomb's Law",
    tex: ['F = k\\frac{q_1 q_2}{r^2},\\qquad k = \\frac{1}{4\\pi\\varepsilon_0} = 8.99\\times10^9\\ \\mathrm{N\\,m^2/C^2}'],
    short: 'F = k\\frac{q_1q_2}{r^2}',
    desc: '두 점전하 사이의 전기력은 두 전하량의 곱에 비례하고 거리의 제곱에 반비례한다. 같은 부호면 서로 밀어내고(척력) 다른 부호면 끌어당긴다(인력). 만유인력과 같은 역제곱 법칙이지만 훨씬 강하다 — 양성자와 전자 사이의 전기력은 중력의 약 10³⁹배이다. 오른쪽 전하를 마우스로 끌어 거리를 바꿀 수 있다.',
    hint: '오른쪽 전하(q₂)를 좌우로 끌어 보세요.',
    params: [R('q1', '전하 q₁', 'μC', -10, 10, 0.1, 3), R('q2', '전하 q₂', 'μC', -10, 10, 0.1, -2), R('r', '거리 r', 'm', 0.05, 1, 0.01, 0.4)],
    F: (P) => (K.ke * P.q1 * P.q2 * 1e-12) / (P.r * P.r),
    out(P) { const F = this.F(P); return [['힘의 크기 |F|', abs(F), 'N'], ['종류', F < 0 ? '인력 (끌어당김)' : F > 0 ? '척력 (밀어냄)' : '힘 없음', ''], ['q₁이 만드는 전기장 (q₂ 위치)', (K.ke * abs(P.q1) * 1e-6) / (P.r * P.r), 'N/C'], ['위치 에너지 U = kq₁q₂/r', (K.ke * P.q1 * P.q2 * 1e-12) / P.r, 'J']]; },
    sub(P) { return `F = (8.99\\times10^9)\\frac{(${ft(P.q1 * 1e-6)})(${ft(P.q2 * 1e-6)})}{(${ft(P.r)})^2} = ${ft(this.F(P))}\\ \\mathrm{N}`; },
    pointer(type, x, y, S, P, api) {
      const X2 = 330 + P.r * 300;
      if (type === 'down') { if (hypot(x - X2, y - 280) < 34) { S.drag = true; return true; } return false; }
      if (type === 'move' && S.drag) api.set('r', +M.clamp((x - 330) / 300, 0.05, 1).toFixed(2));
      if (type === 'up' || type === 'leave') S.drag = false;
      return false;
    },
    draw(d, S, P) {
      d.clear();
      const X1 = 330 - P.r * 300, X2 = 330 + P.r * 300, Y = 280;
      const ch = [{ x: X1, y: Y, q: P.q1 }, { x: X2, y: Y, q: P.q2 }];
      const key = [X1, X2, P.q1, P.q2].join();
      const lines = PL.memo(S, 'fl', key, () => fieldLines(ch, 1.6, 10 + 1.6 * 4));
      d.clip(0, 0, 640, 560); drawLines(d, lines, 'rgba(255,216,77,0.3)'); d.unclip();
      const F = this.F(P), L = M.clamp(25 + 28 * Math.log10(1 + abs(F) * 10), 18, 160), rep = F > 0;
      const r1 = 10 + 1.6 * abs(P.q1), r2 = 10 + 1.6 * abs(P.q2);
      if (P.q1 !== 0 && P.q2 !== 0) {
        d.arrow(X1 + (rep ? -r1 - 4 : r1 + 4), Y - 0, X1 + (rep ? -r1 - 4 - L : r1 + 4 + L), Y, C.green, 4);
        d.arrow(X2 + (rep ? r2 + 4 : -r2 - 4), Y, X2 + (rep ? r2 + 4 + L : -r2 - 4 - L), Y, C.green, 4);
      }
      if (P.q1 !== 0) d.charge(X1, Y, P.q1, r1);
      if (P.q2 !== 0) d.charge(X2, Y, P.q2, r2);
      d.text('q₁ = ' + P.q1 + ' μC', X1, Y + r1 + 22, C.text, 13, 'center');
      d.text('q₂ = ' + P.q2 + ' μC', X2, Y + r2 + 22, C.text, 13, 'center');
      d.line(X1, Y + 70, X2, Y + 70, C.dim, 1.5);
      d.text('r = ' + P.r + ' m', (X1 + X2) / 2, Y + 86, C.dim, 12, 'center');
      d.label(F < 0 ? '다른 부호 → 인력' : F > 0 ? '같은 부호 → 척력' : '전하가 0이면 힘이 없다', 330, 40, C.green, 14);
      const p = d.plot({ x: 670, y: 60, w: 200, h: 230, xmin: 0, xmax: 1, ymin: 0, ymax: (K.ke * abs(P.q1 * P.q2) * 1e-12) / 0.0225 + 1e-9, title: '|F| vs r', xl: 'r (m)', yl: 'N', nx: 2 });
      p.fn((r) => (K.ke * abs(P.q1 * P.q2) * 1e-12) / (r * r), C.green, 2.5, 200, null, 0.05, 1);
      p.dot(P.r, abs(F), C.green);
      d.text('F = ' + fmt(F) + ' N', 670, 340, C.green, 15, 'left', 'middle', true);
      d.text('(+ 척력, − 인력)', 670, 362, C.dim, 11);
    },
  });

  add({
    id: 'efield', cat: '정전기학', name: '전기장과 전기력선', en: 'Electric Field & Field Lines',
    tex: ['\\vec E = \\frac{\\vec F}{q} = \\frac{1}{4\\pi\\varepsilon_0}\\sum_i \\frac{q_i}{r_i^2}\\hat r_i'],
    short: '\\vec E = k\\sum \\frac{q_i}{r_i^2}\\hat r_i',
    desc: '전하는 주위 공간에 전기장을 만들고, 다른 전하는 그 자리의 전기장에서 힘을 받는다. 전기력선은 (+)전하에서 나와 (−)전하로 들어가며, 선의 방향은 그 점의 전기장 방향, 선의 밀도는 세기를 나타낸다. 여러 전하의 전기장은 벡터로 더해진다(중첩 원리). 빨강·파랑 곡선은 전위가 같은 등전위선으로, 전기력선과 항상 수직이다.',
    hint: '전하를 마우스로 끌어 옮겨 보세요. 마우스 위치의 전기장 세기가 결과에 표시됩니다.',
    params: [R('q1', '전하 q₁', 'nC', -5, 5, 0.5, 3), R('q2', '전하 q₂', 'nC', -5, 5, 0.5, -3), R('q3', '전하 q₃', 'nC', -5, 5, 0.5, 0), Chk('eq', '등전위선 표시', true), Chk('vec', '전기장 벡터 격자', false)],
    init(S) { S.ch = [{ x: 300, y: 300 }, { x: 600, y: 300 }, { x: 450, y: 140 }]; S.ver = 0; S.mx = 450; S.my = 450; },
    out(P, S) {
      const ch = S.ch.map((c, i) => ({ x: c.x, y: c.y, q: P['q' + (i + 1)] })), [ex, ey] = efield(ch, S.mx, S.my);
      const sc = (K.ke * 1e-9) / (0.005 * 0.005), Ev = hypot(ex, ey) * sc, V = (pot(ch, S.mx, S.my) * K.ke * 1e-9) / 0.005;
      return [['마우스 위치의 전기장 |E|', Ev, 'N/C'], ['마우스 위치의 전위 V', V, 'V'], ['총 전하', P.q1 + P.q2 + P.q3, 'nC'], '축척: 화면 1칸(30 px) = 15 cm'];
    },
    pointer(type, x, y, S) { return dragList(type, x, y, S, S.ch, 24); },
    draw(d, S, P) {
      d.clear();
      const ch = S.ch.map((c, i) => ({ x: c.x, y: c.y, q: P['q' + (i + 1)] })).filter((c) => c.q !== 0);
      const key = S.ver + '|' + P.q1 + ',' + P.q2 + ',' + P.q3;
      if (P.eq) {
        const segs = PL.memo(S, 'eq', key, () => equipot(d, ch, 0, 0, 900, 560, 6));
        segs.forEach((g) => d.contour(g.s, g.x0, g.y0, g.step, g.step, PL.rgba(g.col, 0.38), 1));
      }
      if (P.vec) {
        for (let y = 20; y < 560; y += 40) for (let x = 20; x < 900; x += 40) {
          const [ex, ey] = efield(ch, x, y), m = hypot(ex, ey);
          if (m < 1e-9) continue;
          const L = M.clamp(Math.log10(m * 1e5) * 6, 3, 17);
          d.arrow(x - (ex / m) * L, y - (ey / m) * L, x + (ex / m) * L, y + (ey / m) * L, 'rgba(200,215,245,0.5)', 1.2, 5);
        }
      }
      const lines = PL.memo(S, 'fl', key, () => fieldLines(ch, 4, 15));
      drawLines(d, lines);
      ch.forEach((c) => d.charge(c.x, c.y, c.q, 9 + 1.6 * abs(c.q)));
      S.ch.forEach((c, i) => { const q = P['q' + (i + 1)]; d.text('q' + (i + 1) + ' = ' + q + ' nC', c.x, c.y + 32, q ? C.text : C.faint, 12, 'center'); });
      const [ex, ey] = efield(ch, S.mx, S.my), m = hypot(ex, ey);
      if (m > 0) d.arrow(S.mx, S.my, S.mx + (ex / m) * 30, S.my + (ey / m) * 30, C.green, 2.5, 9);
    },
  });

  add({
    id: 'gauss', cat: '정전기학', name: '가우스 법칙', en: "Gauss's Law",
    tex: ['\\oint_S \\vec E\\cdot d\\vec A = \\frac{Q_{\\text{내부}}}{\\varepsilon_0}', '\\nabla\\cdot\\vec E = \\frac{\\rho}{\\varepsilon_0}'],
    short: '\\oint \\vec E\\cdot d\\vec A = \\frac{Q_{\\text{in}}}{\\varepsilon_0}',
    desc: '닫힌 곡면을 뚫고 나가는 전기선속(전기력선의 순 개수)은 곡면 안에 있는 전하량에만 비례하고, 곡면의 모양이나 밖에 있는 전하와는 무관하다. 바깥 전하의 전기력선은 곡면으로 들어왔다가 반드시 다시 나가므로 기여가 0이 된다. 원(구 모양 가우스 곡면)과 전하를 끌어 보면 선속이 안쪽 전하가 바뀔 때만 변한다. 둘레의 화살표는 E·n(빨강 = 나감, 파랑 = 들어옴)이다.',
    hint: '가우스 곡면(점선 원)의 중심이나 전하를 끌어 보세요.',
    params: [R('q1', '전하 q₁', 'nC', -5, 5, 0.5, 3), R('q2', '전하 q₂', 'nC', -5, 5, 0.5, -2), R('q3', '전하 q₃', 'nC', -5, 5, 0.5, 2), R('Rg', '가우스 곡면 반지름', 'px', 40, 260, 1, 130)],
    init(S) { S.ch = [{ x: 380, y: 260 }, { x: 470, y: 330 }, { x: 720, y: 180 }]; S.gc = { x: 420, y: 290 }; S.ver = 0; },
    pointer(type, x, y, S) {
      if (type === 'down' && !S.ch.some((c) => hypot(c.x - x, c.y - y) < 22) && hypot(S.gc.x - x, S.gc.y - y) < 30) { S.dg = true; return true; }
      if (type === 'move' && S.dg) { S.gc.x = M.clamp(x, 40, 860); S.gc.y = M.clamp(y, 40, 520); S.ver++; return false; }
      if (type === 'up' || type === 'leave') S.dg = false;
      return dragList(type, x, y, S, S.ch, 22);
    },
    flux(S, P) {
      const ch = S.ch.map((c, i) => ({ x: c.x, y: c.y, q: P['q' + (i + 1)] })), Rg = P.Rg, nt = 48, np = 96;
      let f = 0;
      for (let a = 0; a < nt; a++) {
        const th = ((a + 0.5) * PI) / nt, st = sin(th), ct = cos(th);
        for (let b = 0; b < np; b++) {
          const ph = ((b + 0.5) * 2 * PI) / np, nx = st * cos(ph), ny = st * sin(ph), nz = ct;
          const px = S.gc.x + Rg * nx, py = S.gc.y + Rg * ny, pz = Rg * nz;
          let en = 0;
          for (const c of ch) { const dx = px - c.x, dy = py - c.y, dz = pz, r2 = dx * dx + dy * dy + dz * dz, r3 = r2 * sqrt(r2); en += (c.q * (dx * nx + dy * ny + dz * nz)) / r3; }
          f += en * Rg * Rg * st * (PI / nt) * ((2 * PI) / np);
        }
      }
      return f / (4 * PI);
    },
    out(P, S) {
      const qin = S.ch.reduce((s, c, i) => s + (hypot(c.x - S.gc.x, c.y - S.gc.y) < P.Rg ? P['q' + (i + 1)] : 0), 0);
      const fl = PL.memo(S, 'flux', S.ver + '|' + P.q1 + P.q2 + P.q3 + '|' + P.Rg, () => this.flux(S, P));
      return [['곡면 안의 전하 Q_내부', qin, 'nC'], ['전기선속 Φ = Q/ε₀', (qin * 1e-9) / K.eps0, 'N·m²/C'], ['수치 적분한 선속 (Q 단위 환산)', fl, 'nC'], ['곡면 밖의 전하', P.q1 + P.q2 + P.q3 - qin, 'nC']];
    },
    draw(d, S, P) {
      d.clear();
      const ch = S.ch.map((c, i) => ({ x: c.x, y: c.y, q: P['q' + (i + 1)] })).filter((c) => c.q !== 0);
      const key = S.ver + '|' + P.q1 + ',' + P.q2 + ',' + P.q3;
      drawLines(d, PL.memo(S, 'fl', key, () => fieldLines(ch, 3, 15)), 'rgba(255,216,77,0.42)');
      d.g.setLineDash([7, 6]);
      d.circle(S.gc.x, S.gc.y, P.Rg, 'rgba(167,139,250,0.08)', C.purple, 2.5);
      d.g.setLineDash([]);
      d.circle(S.gc.x, S.gc.y, 5, C.purple);
      for (let k = 0; k < 36; k++) {
        const a = (2 * PI * k) / 36, nx = cos(a), ny = sin(a), px = S.gc.x + P.Rg * nx, py = S.gc.y + P.Rg * ny;
        const [ex, ey] = efield(ch, px, py), en = ex * nx + ey * ny, L = M.clamp(en * 1800, -26, 26);
        if (abs(L) > 1.5) d.arrow(px, py, px + nx * L, py + ny * L, L > 0 ? C.red : C.cyan, 2, 6);
      }
      ch.forEach((c) => d.charge(c.x, c.y, c.q, 9 + 1.6 * abs(c.q)));
      const qin = S.ch.reduce((s, c, i) => s + (hypot(c.x - S.gc.x, c.y - S.gc.y) < P.Rg ? P['q' + (i + 1)] : 0), 0);
      d.label('곡면 안 전하 = ' + qin + ' nC  →  선속 ∝ ' + qin, 450, 30, C.purple, 13);
    },
  });

  add({
    id: 'potential', cat: '정전기학', name: '전위와 등전위면', en: 'Electric Potential',
    tex: ['V = \\frac{1}{4\\pi\\varepsilon_0}\\sum_i\\frac{q_i}{r_i},\\qquad \\vec E = -\\nabla V', '\\Delta U = q\\,\\Delta V'],
    short: '\\vec E = -\\nabla V',
    desc: '전위는 단위 전하가 가지는 전기적 위치 에너지로, 높이에 대응한다. (+)전하 주변은 언덕, (−)전하 주변은 구덩이처럼 솟거나 꺼진 "전위 지형"을 이루고, 전기장은 이 지형의 내리막 방향(E = −∇V)을 가리킨다. 양전하는 공이 언덕을 굴러 내려가듯 전위가 낮은 곳으로 움직인다. 화면을 끌어 지형을 돌려 보자. 아래 그래프는 두 전하를 지나는 직선 위의 전위이다.',
    hint: '캔버스를 드래그하면 3차원 지형을 회전할 수 있습니다.',
    params: [R('q1', '전하 q₁', 'nC', -5, 5, 0.5, 3), R('q2', '전하 q₂', 'nC', -5, 5, 0.5, -3), R('d', '전하 사이 거리', 'cm', 2, 8, 0.1, 5)],
    out: (P) => {
      const Vm = (K.ke * (P.q1 + P.q2) * 1e-9) / ((P.d / 2) * 0.01);
      return [['두 전하 가운데의 전위', Vm, 'V'], ['가운데 전기장 (축 방향)', (K.ke * (P.q1 - P.q2) * 1e-9) / ((P.d / 2) * 0.01) ** 2, 'N/C'], ['두 전하의 상호 위치 에너지', (K.ke * P.q1 * P.q2 * 1e-18) / (P.d * 0.01), 'J']];
    },
    init(S) { S.yaw = 0.6; S.pitch = 0.65; },
    pointer(type, x, y, S) { return PL.dragRotate(type, x, y, S); },
    step(S, P, dt) { if (!S._drag) S.yaw += dt * 0.15; },
    draw(d, S, P) {
      d.clear(false);
      const n = 44, L = 6, cam = PL.cam(S.yaw, S.pitch, 30, 450, 250), a = P.d / 2 / 1.2;
      const V = (x, y) => P.q1 / sqrt((x + a) ** 2 + y * y + 0.12) + P.q2 / sqrt((x - a) ** 2 + y * y + 0.12);
      const zc = (v) => M.clamp(v * 0.55, -4, 4);
      const pts = [];
      for (let j = 0; j <= n; j++) { const row = []; for (let i = 0; i <= n; i++) { const x = -L + (2 * L * i) / n, y = -L + (2 * L * j) / n, v = V(x, y); row.push([cam(x, y, zc(v)), v]); } pts.push(row); }
      const g = d.g, NB = 24, buckets = Array.from({ length: NB }, () => []);
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
        const [p, v] = pts[j][i], b = buckets[Math.round(((M.clamp(v / 4, -1, 1) + 1) / 2) * (NB - 1))];
        if (i < n) b.push(p, pts[j][i + 1][0]);
        if (j < n) b.push(p, pts[j + 1][i][0]);
      }
      g.lineWidth = 1.1;
      buckets.forEach((segs, k) => {
        if (!segs.length) return;
        const col = PL.cmap.div((k / (NB - 1)) * 2 - 1);
        g.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},0.9)`;
        g.beginPath();
        for (let s = 0; s < segs.length; s += 2) { g.moveTo(segs[s][0], segs[s][1]); g.lineTo(segs[s + 1][0], segs[s + 1][1]); }
        g.stroke();
      });
      [[-a, P.q1], [a, P.q2]].forEach(([x, q]) => { if (!q) return; const p = cam(x, 0, zc(V(x, 0.25)) + 0.6); d.text((q > 0 ? '+' : '') + q + ' nC', p[0], p[1], q > 0 ? C.red : C.cyan, 13, 'center', 'middle', true); });
      d.text('전위 지형 V(x, y) — 높을수록 전위가 높다', 20, 24, C.text, 13);
      const pl = d.plot({ x: 70, y: 440, w: 790, h: 90, xmin: -L, xmax: L, ymin: -6, ymax: 6, title: '두 전하를 잇는 직선 위의 전위 V(x)', xl: 'x', ny: 2, xticks: false });
      pl.fn((x) => V(x, 0), C.yellow, 2, 500);
    },
  });

  add({
    id: 'capacitor', cat: '정전기학', name: '축전기와 전기 용량', en: 'Capacitors & Capacitance',
    tex: ['C = \\kappa\\varepsilon_0\\frac{A}{d},\\qquad Q = CV', 'U = \\tfrac12 CV^2,\\qquad E = \\frac{V}{d}'],
    short: 'C = \\kappa\\varepsilon_0\\frac{A}{d}',
    desc: '마주 보는 두 금속판은 전하를 저장하는 축전기가 된다. 전기 용량 C는 판이 넓을수록, 간격이 좁을수록 커지고, 판 사이에 유전체를 넣으면 κ배가 된다. 전압 V를 걸면 Q = CV의 전하가 모이고, 판 사이에는 거의 균일한 전기장 E = V/d가 생기며 에너지 ½CV²이 저장된다. 유전체 안의 작은 쌍극자들은 분극을 나타낸다.',
    params: [R('A', '판의 넓이 A', 'cm²', 10, 500, 5, 100), R('d', '판 사이 간격 d', 'mm', 0.5, 10, 0.1, 2), R('V', '전압 V', 'V', 0, 100, 1, 12), R('k', '유전 상수 κ', '', 1, 10, 0.1, 1)],
    C: (P) => (P.k * K.eps0 * P.A * 1e-4) / (P.d * 1e-3),
    out(P) { const Cc = this.C(P), Q = Cc * P.V; return [['전기 용량 C', Cc * 1e12, 'pF'], ['저장된 전하 Q = CV', Q * 1e9, 'nC'], ['판 사이 전기장 E = V/d', P.V / (P.d * 1e-3), 'V/m'], ['저장된 에너지 ½CV²', 0.5 * Cc * P.V * P.V * 1e9, 'nJ'], ['표면 전하 밀도 σ = Q/A', Q / (P.A * 1e-4), 'C/m²']]; },
    sub(P) { return `C = (${ft(P.k)})(8.85\\times10^{-12})\\frac{${ft(P.A * 1e-4)}}{${ft(P.d * 1e-3)}} = ${ft(this.C(P))}\\ \\mathrm{F}`; },
    init(S) { S.qd = 0; },
    step(S, P, dt) { S.t += dt; const Q = this.C(P) * P.V; S.qd += (Q - S.qd) * min(1, dt * 3); },
    draw(d, S, P) {
      d.clear();
      const w = 140 + 420 * sqrt(P.A / 500), gap = 30 + 26 * P.d, cx = 380, cy = 280, top = cy - gap / 2, bot = cy + gap / 2;
      if (P.k > 1) {
        d.rect(cx - w / 2, top + 4, w, gap - 8, PL.rgba(C.purple, 0.12 + 0.03 * P.k));
        const nd = floor(w / 34);
        for (let i = 0; i < nd; i++) for (let j = 0; j < max(1, floor((gap - 8) / 30)); j++) {
          const x = cx - w / 2 + 17 + i * 34, y = top + 18 + j * 30;
          if (y > bot - 10) continue;
          const sh = min(5, (P.V / 100) * 6 * (1 - 1 / P.k) + 1);
          d.rect(x - 4, y - 9, 8, 18, 'rgba(255,255,255,0.06)', 'rgba(167,139,250,0.5)', 1, 4);
          d.text('−', x, y - 3 - sh, C.cyan, 10, 'center'); d.text('+', x, y + 4 + sh, C.red, 10, 'center');
        }
      }
      const nl = M.clamp(Math.round((P.V / (P.d)) * 1.2), 0, 26);
      for (let i = 0; i < nl; i++) { const x = cx - w / 2 + ((i + 0.5) * w) / nl; d.arrow(x, top + 6, x, bot - 6, 'rgba(255,216,77,0.6)', 1.4, 7); }
      d.rect(cx - w / 2 - 6, top - 14, w + 12, 14, '#c9d3ea');
      d.rect(cx - w / 2 - 6, bot, w + 12, 14, '#c9d3ea');
      const nq = S.qd > 0 ? M.clamp(Math.round(2 + 6 * Math.log10(1 + S.qd * 1e9 * 5)), 0, floor(w / 12)) : 0;
      for (let i = 0; i < nq; i++) { const x = cx - w / 2 + ((i + 0.5) * w) / nq; d.text('+', x, top - 22, C.red, 13, 'center', 'middle', true); d.text('−', x, bot + 24, C.cyan, 15, 'center', 'middle', true); }
      d.line(cx, top - 14, cx, 70, '#cfd8ee', 2); d.line(cx, bot + 14, cx, 500, '#cfd8ee', 2);
      d.line(cx, 70, 780, 70, '#cfd8ee', 2); d.line(cx, 500, 780, 500, '#cfd8ee', 2);
      d.line(780, 70, 780, 255, '#cfd8ee', 2); d.line(780, 305, 780, 500, '#cfd8ee', 2);
      d.line(755, 255, 805, 255, '#fff', 3); d.line(767, 305, 793, 305, '#fff', 5);
      d.text('+', 812, 255, C.red, 14); d.text(P.V + ' V', 812, 282, C.text, 13);
      d.text('d = ' + P.d + ' mm', cx + w / 2 + 14, cy, C.dim, 12);
      d.text('E = V/d = ' + fmt(P.V / (P.d * 1e-3)) + ' V/m', 40, 530, C.yellow, 13);
      d.text('C = ' + fmt(this.C(P) * 1e12, 4) + ' pF', 40, 30, C.text, 15, 'left', 'middle', true);
    },
  });

  /* ================================================================ 전류와 회로 */
  const along = (path, s) => {
    let L = 0; const seg = [];
    for (let i = 0; i < path.length - 1; i++) { const l = hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); seg.push(l); L += l; }
    s = ((s % L) + L) % L;
    for (let i = 0; i < seg.length; i++) { if (s <= seg[i]) { const f = s / seg[i]; return [path[i][0] + (path[i + 1][0] - path[i][0]) * f, path[i][1] + (path[i + 1][1] - path[i][1]) * f]; } s -= seg[i]; }
    return path[path.length - 1];
  };
  const pathLen = (path) => { let L = 0; for (let i = 0; i < path.length - 1; i++) L += hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); return L; };
  function resistorV(d, x, y1, y2, col = '#e9d3a9', w = 12) {
    const pts = [[x, y1]], n = 8, h = (y2 - y1) / n;
    for (let i = 0; i < n; i++) pts.push([x + (i % 2 ? -w : w), y1 + h * (i + 0.5)]);
    pts.push([x, y2]);
    d.poly(pts, col, 3);
  }
  function resistorH(d, x1, x2, y, col = '#e9d3a9', w = 12) {
    const pts = [[x1, y]], n = 8, h = (x2 - x1) / n;
    for (let i = 0; i < n; i++) pts.push([x1 + h * (i + 0.5), y + (i % 2 ? -w : w)]);
    pts.push([x2, y]);
    d.poly(pts, col, 3);
  }
  function battery(d, x, yTop, yBot, V) {
    const m = (yTop + yBot) / 2;
    d.line(x, yTop, x, m - 10, '#cfd8ee', 3); d.line(x, m + 10, x, yBot, '#cfd8ee', 3);
    d.line(x - 26, m - 10, x + 26, m - 10, '#fff', 3); d.line(x - 14, m + 10, x + 14, m + 10, '#fff', 6);
    d.text('+', x + 32, m - 12, C.red, 15, 'left', 'middle', true); d.text('−', x + 32, m + 12, C.cyan, 17, 'left', 'middle', true);
    d.text(fmt(V) + ' V', x - 34, m, C.text, 13, 'right', 'middle', true);
  }

  add({
    id: 'ohm', cat: '전류와 회로', name: '옴의 법칙과 전력', en: "Ohm's Law & Electric Power",
    tex: ['V = IR', 'P = VI = I^2R = \\frac{V^2}{R}'],
    short: 'V = IR',
    desc: '도선 양 끝에 전압을 걸면 전류가 흐르며, 많은 도체에서 전류는 전압에 비례하고 저항에 반비례한다(옴의 법칙). 저항에서는 전기 에너지가 열로 바뀌며 그 일률이 P = VI이다(줄 발열). 노란 점은 전류(양전하가 흐르는 방향)이고 실제 전자는 반대 방향으로 움직인다. 저항이 밝게 빛날수록 소비 전력이 크다.',
    params: [R('V', '전압 V', 'V', 0, 24, 0.5, 12), R('R', '저항 R', 'Ω', 1, 100, 1, 10)],
    out: (P) => [['전류 I = V/R', P.V / P.R, 'A'], ['소비 전력 P = VI', (P.V * P.V) / P.R, 'W'], ['1분 동안 발생한 열', ((P.V * P.V) / P.R) * 60, 'J'], ['전도도 G = 1/R', 1 / P.R, 'S']],
    sub: (P) => `I = \\frac{V}{R} = \\frac{${ft(P.V)}}{${ft(P.R)}} = ${ft(P.V / P.R)}\\ \\mathrm{A}`,
    init(S) { S.s = 0; },
    step(S, P, dt) { S.s += min(420, 60 * (P.V / P.R)) * dt; },
    draw(d, S, P) {
      d.clear();
      const path = [[110, 330], [110, 110], [600, 110], [600, 450], [110, 450], [110, 330]];
      d.poly(path, '#8fa0c9', 3);
      d.rect(560, 210, 80, 140, '#0a1020');
      const Pw = (P.V * P.V) / P.R;
      d.glow(600, 280, 40 + Pw * 0.6, `rgba(255,120,50,${min(0.85, Pw / 60)})`);
      resistorV(d, 600, 210, 350, PL.mix('#e9d3a9', '#ff7a33', min(1, Pw / 60)));
      d.rect(80, 240, 60, 80, '#0a1020');
      battery(d, 110, 240, 320, P.V);
      const I = P.V / P.R, L = pathLen(path);
      if (I > 0) for (let k = 0; k < 28; k++) { const [x, y] = along(path, S.s + (k * L) / 28); d.circle(x, y, 4, C.yellow); }
      d.text('전류 I = ' + fmt(I, 3) + ' A →', 280, 92, C.yellow, 14, 'left', 'middle', true);
      d.text('R = ' + P.R + ' Ω', 655, 280, C.text, 14, 'left', 'middle', true);
      d.text('P = ' + fmt(Pw, 3) + ' W', 655, 304, C.orange, 13);
      const p = d.plot({ x: 690, y: 380, w: 180, h: 130, xmin: 0, xmax: 24, ymin: 0, ymax: 3, title: 'I-V 그래프', xl: 'V', yl: 'I (A)', nx: 3, ny: 3 });
      [5, 20, 50].forEach((r) => p.fn((v) => v / r, 'rgba(160,175,210,0.3)', 1));
      p.fn((v) => v / P.R, C.yellow, 2.5);
      p.dot(P.V, I, C.yellow);
    },
  });

  add({
    id: 'kirchhoff', cat: '전류와 회로', name: '키르히호프 법칙 (직렬·병렬 회로)', en: "Kirchhoff's Circuit Laws",
    tex: ['\\sum I_{\\text{들어옴}} = \\sum I_{\\text{나감}}\\ \\ (\\text{접합점}),\\qquad \\sum_{\\text{폐회로}} \\Delta V = 0', 'R_{\\text{등가}} = R_1 + \\frac{R_2R_3}{R_2 + R_3}'],
    short: '\\sum I = 0,\\ \\sum \\Delta V = 0',
    desc: '접합점으로 들어오는 전류의 합은 나가는 전류의 합과 같고(전하 보존), 닫힌 고리를 한 바퀴 돌 때 전압 변화의 합은 0이다(에너지 보존). R₁은 직렬로, R₂와 R₃은 병렬로 연결되어 있다. 병렬 가지에서는 전압이 같고 전류가 저항에 반비례해 나뉜다. 점의 속력이 각 도선의 전류에 비례한다.',
    params: [R('V', '전원 전압 V', 'V', 1, 24, 0.5, 12), R('R1', '저항 R₁ (직렬)', 'Ω', 1, 100, 1, 10), R('R2', '저항 R₂ (병렬)', 'Ω', 1, 100, 1, 20), R('R3', '저항 R₃ (병렬)', 'Ω', 1, 100, 1, 30)],
    sol(P) { const Rp = (P.R2 * P.R3) / (P.R2 + P.R3), Req = P.R1 + Rp, I1 = P.V / Req, Vp = I1 * Rp; return { Rp, Req, I1, I2: Vp / P.R2, I3: Vp / P.R3, V1: I1 * P.R1, Vp }; },
    out(P) { const s = this.sol(P); return [['등가 저항 R_eq', s.Req, 'Ω'], ['전체 전류 I₁', s.I1, 'A'], ['R₂ 전류 I₂', s.I2, 'A'], ['R₃ 전류 I₃', s.I3, 'A'], ['접합점: I₂ + I₃', s.I2 + s.I3, 'A'], ['R₁ 전압 V₁', s.V1, 'V'], ['병렬부 전압 V₂ = V₃', s.Vp, 'V'], ['고리 규칙: V − V₁ − V₂', P.V - s.V1 - s.Vp, 'V']]; },
    sub(P) { const s = this.sol(P); return `I_1 = \\frac{V}{R_{eq}} = \\frac{${ft(P.V)}}{${ft(P.R1)} + \\frac{(${ft(P.R2)})(${ft(P.R3)})}{${ft(P.R2)}+${ft(P.R3)}}} = ${ft(s.I1)}\\ \\mathrm{A}`; },
    init(S) { S.a = 0; S.b = 0; S.c = 0; },
    step(S, P, dt) { const s = this.sol(P), k = 90; S.a += min(500, s.I1 * k) * dt; S.b += min(500, s.I2 * k) * dt; S.c += min(500, s.I3 * k) * dt; },
    draw(d, S, P) {
      d.clear();
      const s = this.sol(P), wire = '#8fa0c9';
      const main1 = [[100, 250], [100, 100], [480, 100]], main2 = [[480, 470], [100, 470], [100, 330]];
      const br2 = [[480, 100], [480, 470]], br3 = [[480, 100], [740, 100], [740, 470], [480, 470]];
      [main1, main2, br2, br3].forEach((p) => d.poly(p, wire, 3));
      d.rect(210, 80, 160, 40, '#0a1020'); resistorH(d, 210, 370, 100);
      d.rect(460, 220, 40, 140, '#0a1020'); resistorV(d, 480, 220, 360);
      d.rect(720, 220, 40, 140, '#0a1020'); resistorV(d, 740, 220, 360);
      d.rect(70, 250, 60, 80, '#0a1020'); battery(d, 100, 250, 330, P.V);
      const dots = (path, s0, n) => { const L = pathLen(path); for (let k = 0; k < n; k++) { const [x, y] = along(path, s0 + (k * L) / n); d.circle(x, y, 3.6, C.yellow); } };
      const L1 = pathLen(main1), L2 = pathLen(main2);
      dots(main1, S.a % L1, 9); dots(main2, S.a % L2, 9);
      dots(br2, S.b, 8); dots(br3, S.c, 18);
      d.circle(480, 100, 6, C.white); d.circle(480, 470, 6, C.white);
      d.text('R₁ = ' + P.R1 + ' Ω', 290, 60, C.text, 13, 'center');
      d.text('R₂ = ' + P.R2 + ' Ω', 420, 290, C.text, 13, 'right');
      d.text('R₃ = ' + P.R3 + ' Ω', 770, 290, C.text, 13);
      d.label('I₁ = ' + fmt(s.I1, 3) + ' A', 160, 180, C.yellow, 12);
      d.label('I₂ = ' + fmt(s.I2, 3) + ' A', 540, 410, C.yellow, 12);
      d.label('I₃ = ' + fmt(s.I3, 3) + ' A', 800, 410, C.yellow, 12);
      d.label('V₁ = ' + fmt(s.V1, 3) + ' V', 290, 150, C.orange, 12);
      d.label('V₂ = V₃ = ' + fmt(s.Vp, 3) + ' V', 610, 200, C.orange, 12);
      d.text('접합점 규칙: ' + fmt(s.I1, 3) + ' = ' + fmt(s.I2, 3) + ' + ' + fmt(s.I3, 3) + ' (A)', 100, 525, C.text, 13);
      d.text('고리 규칙: ' + fmt(P.V, 3) + ' − ' + fmt(s.V1, 3) + ' − ' + fmt(s.Vp, 3) + ' = 0 (V)', 520, 525, C.text, 13);
    },
  });

  add({
    id: 'rc', cat: '전류와 회로', name: 'RC 회로의 충전과 방전', en: 'RC Circuit — Charging & Discharging',
    tex: ['V_C(t) = V_0\\left(1 - e^{-t/RC}\\right),\\qquad I(t) = \\frac{V_0}{R}e^{-t/RC}', '\\tau = RC\\quad(\\text{시간 상수})'],
    short: '\\tau = RC',
    desc: '저항을 통해 축전기를 충전하면 처음에는 큰 전류가 흐르다가, 축전기에 전하가 쌓여 전압이 오를수록 전류가 지수적으로 줄어든다. 시간 상수 τ = RC 동안 최종 전압의 약 63%까지 충전되고, 5τ면 거의 완전히 충전된다. 스위치를 바꾸면 같은 시간 상수로 방전된다. 카메라 플래시, 심장 박동 조율기, 타이머 회로에 쓰인다. (5τ를 4초에 표시)',
    params: [R('V0', '전원 전압 V₀', 'V', 1, 20, 0.5, 10), R('Rk', '저항 R', 'kΩ', 1, 100, 1, 10, { reset: 1 }), R('Cu', '전기 용량 C', 'μF', 10, 1000, 10, 100, { reset: 1 })],
    out: (P, S) => { const tau = P.Rk * 1e3 * P.Cu * 1e-6; return [['시간 상수 τ = RC', tau, 's'], ['현재 상태', S.ch ? '충전 중' : '방전 중', ''], ['축전기 전압 V_C', S.vc, 'V'], ['전류 I', S.cur * 1000, 'mA'], ['저장 에너지 ½CV_C²', 0.5 * P.Cu * 1e-6 * S.vc * S.vc, 'J'], ['실제 경과 시간', S.tr, 's']]; },
    sub: (P) => `\\tau = RC = (${ft(P.Rk * 1e3)})(${ft(P.Cu * 1e-6)}) = ${ft(P.Rk * P.Cu * 1e-3)}\\ \\mathrm{s}`,
    init(S) { S.ch = true; S.tr = 0; S.vc = 0; S.cur = 0; S.hist = []; S.s = 0; },
    step(S, P, dt) {
      const tau = P.Rk * 1e3 * P.Cu * 1e-6, warp = (5 * tau) / 4, h = dt * warp;
      S.tr += h;
      if (S.tr > 5 * tau) { S.tr = 0; S.ch = !S.ch; S.hist = []; }
      const tg = S.ch ? P.V0 : 0;
      S.vc = tg + (S.vc - tg) * exp(-h / tau);
      S.cur = (S.ch ? P.V0 - S.vc : -S.vc) / (P.Rk * 1e3);
      S.hist.push([S.tr / tau, S.vc, S.cur]);
      S.s += min(300, ((abs(S.cur) * 1000) / max(1e-3, P.V0 / P.Rk)) * 160) * dt;
    },
    draw(d, S, P) {
      d.clear();
      const wire = '#8fa0c9';
      d.poly([[100, 100], [330, 100]], wire, 3);
      d.poly([[100, 100], [100, 230]], wire, 3); d.poly([[100, 310], [100, 420], [380, 420]], wire, 3);
      d.poly([[380, 100], [460, 100]], wire, 3); d.poly([[560, 100], [640, 100], [640, 230]], wire, 3); d.poly([[640, 290], [640, 420], [380, 420]], wire, 3);
      d.rect(70, 230, 60, 80, '#0a1020'); battery(d, 100, 230, 310, P.V0);
      d.circle(330, 100, 5, C.white); d.circle(380, 100, 5, C.white); d.circle(355, 160, 5, C.white);
      d.line(355, 160, 355, 420, wire, 3);
      if (S.ch) d.line(380, 100, 335, 104, '#fff', 4); else d.line(380, 100, 358, 156, '#fff', 4);
      d.text(S.ch ? '스위치: 충전' : '스위치: 방전', 360, 70, C.yellow, 12, 'center');
      d.rect(470, 80, 80, 40, '#0a1020'); resistorH(d, 460, 560, 100);
      d.text('R = ' + P.Rk + ' kΩ', 510, 62, C.text, 12, 'center');
      d.line(610, 230, 670, 230, '#fff', 4); d.line(610, 290, 670, 290, '#fff', 4);
      const fr = S.vc / max(P.V0, 0.1), nq = Math.round(fr * 7);
      for (let i = 0; i < nq; i++) { d.text('+', 612 + i * 9, 220, C.red, 12, 'center'); d.text('−', 612 + i * 9, 302, C.cyan, 14, 'center'); }
      if (fr > 0.02) for (let i = 0; i < 4; i++) d.arrow(620 + i * 15, 236, 620 + i * 15, 284, `rgba(255,216,77,${fr * 0.7})`, 1.2, 6);
      d.text('C = ' + P.Cu + ' μF', 690, 260, C.text, 12);
      const path = S.ch ? [[100, 230], [100, 100], [380, 100], [640, 100], [640, 230]] : [[640, 230], [640, 100], [380, 100], [355, 160], [355, 420], [640, 420], [640, 290]];
      const L = pathLen(path);
      if (abs(S.cur) * P.Rk * 1e3 > P.V0 * 0.01) for (let k = 0; k < 12; k++) { const [x, y] = along(path, S.s + (k * L) / 12); d.circle(x, y, 3.5, C.yellow); }
      const p = d.plot({ x: 70, y: 455, w: 380, h: 80, xmin: 0, xmax: 5, ymin: 0, ymax: P.V0 * 1.1, title: '축전기 전압 V_C(t)', xl: 't / τ', ny: 2 });
      p.vl(1, C.dim); p.hl(P.V0 * (S.ch ? 0.632 : 0.368), 'rgba(255,216,77,0.4)');
      p.pts(S.hist.map((h) => [h[0], h[1]]), C.cyan, 2.5);
      const Im = (P.V0 / (P.Rk * 1e3)) * 1000;
      const q = d.plot({ x: 500, y: 455, w: 370, h: 80, xmin: 0, xmax: 5, ymin: -Im * 1.1, ymax: Im * 1.1, title: '전류 I(t) (mA)', xl: 't / τ', ny: 2 });
      q.pts(S.hist.map((h) => [h[0], h[2] * 1000]), C.yellow, 2.5);
    },
  });

  /* ================================================================ 자기장 */
  add({
    id: 'lorentz', cat: '자기장', name: '로런츠 힘 (전기장·자기장 속 하전 입자)', en: 'Lorentz Force',
    tex: ['\\vec F = q\\left(\\vec E + \\vec v\\times\\vec B\\right)', 'r = \\frac{mv}{|q|B},\\qquad \\omega_c = \\frac{|q|B}{m},\\qquad \\vec v_d = \\frac{\\vec E\\times\\vec B}{B^2}'],
    short: '\\vec F = q(\\vec E + \\vec v\\times\\vec B)',
    desc: '자기장은 움직이는 전하에 속도와 수직인 힘(v × B)을 가해 방향만 바꾸므로, 균일한 자기장 속 하전 입자는 등속 원운동을 한다(사이클로트론 운동). 반지름은 운동량에 비례하고 전하와 자기장에 반비례하며, 전하의 부호에 따라 도는 방향이 반대이다. 전기장을 함께 걸면 입자가 E × B 방향으로 표류한다. 질량 분석기, 오로라, 입자 가속기의 원리이다. (단위는 임의 단위)',
    params: [R('q', '전하 q', '', -2, 2, 0.1, 1, { reset: 1 }), R('m', '질량 m', '', 0.5, 5, 0.1, 1, { reset: 1 }), R('v', '처음 속력 v', '', 0.5, 5, 0.1, 2, { reset: 1 }), R('B', '자기장 B (+ = 화면 밖으로)', '', -2, 2, 0.05, 1), R('E', '전기장 E (+ = 위쪽)', '', -2, 2, 0.05, 0)],
    out: (P, S) => [['회전 반지름 r = mv/|q|B', P.q && P.B ? (P.m * P.v) / abs(P.q * P.B) : Infinity, ''], ['회전 주기 2πm/|q|B', P.q && P.B ? (2 * PI * P.m) / abs(P.q * P.B) : Infinity, ''], ['사이클로트론 각진동수 |q|B/m', abs(P.q * P.B) / P.m, ''], ['표류 속도 E/B', P.B ? P.E / P.B : '—', ''], ['현재 속력', hypot(S.v[0], S.v[1]), ''], ['회전 방향', P.q * P.B > 0 ? '시계 방향' : P.q * P.B < 0 ? '반시계 방향' : '직진', '']],
    sub: (P) => (P.q && P.B ? `r = \\frac{mv}{|q|B} = \\frac{(${ft(P.m)})(${ft(P.v)})}{|${ft(P.q)}|\\,|${ft(P.B)}|} = ${ft((P.m * P.v) / abs(P.q * P.B))}` : ''),
    init(S, P) { S.x = [-4, 0]; S.v = [P.v, 0]; S.tr = []; },
    step(S, P, dt) {
      const n = 20, h = (dt * 1.5) / n, qm = P.q / P.m;
      for (let i = 0; i < n; i++) {
        const vm = [S.v[0], S.v[1] + qm * P.E * h * 0.5], t = qm * P.B * h * 0.5, s = (2 * t) / (1 + t * t);
        const vp1 = [vm[0] + vm[1] * t, vm[1] - vm[0] * t];
        const vpl = [vm[0] + vp1[1] * s, vm[1] - vp1[0] * s];
        S.v = [vpl[0], vpl[1] + qm * P.E * h * 0.5];
        S.x[0] += S.v[0] * h; S.x[1] += S.v[1] * h;
      }
      S.tr.push([S.x[0], S.x[1]]);
      if (S.tr.length > 1600) S.tr.shift();
      if (abs(S.x[0]) > 12 || abs(S.x[1]) > 7.5) this.init(S, P);
    },
    draw(d, S, P) {
      d.clear();
      const sc = 38, cx = 450, cy = 280, X = (x) => cx + x * sc, Y = (y) => cy - y * sc;
      if (P.B !== 0) for (let y = 30; y < 560; y += 50) for (let x = 25; x < 900; x += 50) d.perp(x, y, 6, P.B > 0, `rgba(160,175,210,${0.15 + 0.2 * abs(P.B)})`, 1.2);
      if (P.E !== 0) for (let x = 60; x < 900; x += 120) d.arrow(x, P.E > 0 ? 540 : 20, x, P.E > 0 ? 20 : 540, `rgba(255,159,67,${0.12 + 0.15 * abs(P.E)})`, 1.5, 9);
      d.poly(S.tr.map((p) => [X(p[0]), Y(p[1])]), PL.rgba(P.q >= 0 ? C.red : C.cyan, 0.75), 2);
      const F = [P.q * S.v[1] * P.B, P.q * (P.E - S.v[0] * P.B)];
      const px = X(S.x[0]), py = Y(S.x[1]);
      d.arrow(px, py, px + S.v[0] * 18, py - S.v[1] * 18, C.green, 2.5);
      d.arrow(px, py, px + F[0] * 14, py - F[1] * 14, C.yellow, 2.5);
      d.charge(px, py, P.q || 0.0001, 10);
      d.text('속도 v', 20, 24, C.green, 12); d.text('힘 F = q(E + v×B)', 90, 24, C.yellow, 12);
      d.text(P.B > 0 ? 'B: ⊙ 화면 밖으로' : P.B < 0 ? 'B: ⊗ 화면 안으로' : 'B = 0', 880, 24, C.dim, 12, 'right');
    },
  });

  add({
    id: 'ampere', cat: '자기장', name: '앙페르 법칙 (직선 전류의 자기장)', en: "Ampère's Law — Field of a Straight Wire",
    tex: ['\\oint \\vec B\\cdot d\\vec\\ell = \\mu_0 I_{\\text{내부}}', 'B = \\frac{\\mu_0 I}{2\\pi r},\\qquad \\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}'],
    short: 'B = \\frac{\\mu_0 I}{2\\pi r}',
    desc: '전류가 흐르는 직선 도선 둘레에는 동심원 모양의 자기장이 생긴다. 방향은 오른손 엄지를 전류 방향으로 할 때 네 손가락이 감기는 방향이고(⊙ = 화면 밖으로 나오는 전류), 세기는 거리에 반비례한다. 나침반 바늘(빨간 끝 = N극)이 자기력선을 따라 정렬한다. 두 번째 도선에 전류를 흘리면 같은 방향의 평행 전류는 서로 끌어당기고, 반대 방향은 밀어낸다.',
    params: [R('I', '도선 1의 전류 I₁ (+ = 화면 밖)', 'A', -20, 20, 0.5, 10), R('I2', '도선 2의 전류 I₂', 'A', -20, 20, 0.5, 0), R('dd', '도선 사이 거리 d', 'cm', 5, 30, 0.5, 15), R('r', '측정 거리 r (도선 1에서)', 'cm', 1, 20, 0.5, 6)],
    out: (P) => {
      const B = (K.mu0 * abs(P.I)) / (2 * PI * P.r * 0.01), F = (K.mu0 * P.I * P.I2) / (2 * PI * P.dd * 0.01);
      return [['r에서 도선 1의 자기장 B', B * 1e6, 'μT'], ['지구 자기장(약 50 μT) 대비', (B * 1e6) / 50, '배'], ['도선 사이 힘 (단위 길이당)', abs(F) * 1000, 'mN/m'], ['도선 사이 힘의 종류', P.I2 === 0 || P.I === 0 ? '없음' : F > 0 ? '인력 (같은 방향 전류)' : '척력 (반대 방향 전류)', '']];
    },
    sub: (P) => `B = \\frac{\\mu_0 I}{2\\pi r} = \\frac{(4\\pi\\times10^{-7})(${ft(abs(P.I))})}{2\\pi(${ft(P.r * 0.01)})} = ${ft((K.mu0 * abs(P.I)) / (2 * PI * P.r * 0.01))}\\ \\mathrm{T}`,
    draw(d, S, P) {
      d.clear();
      const pc = 12, w1 = { x: 220, y: 280, I: P.I }, w2 = { x: 220 + P.dd * pc, y: 280, I: P.I2 }, ws = [w1, w2].filter((w) => w.I !== 0);
      const nx = 106, ny = 94, st = 6, key = [P.I, P.I2, P.dd].join();
      const segs = PL.memo(S, 'A', key, () => {
        const g = new Float32Array(nx * ny);
        let lo = 1e9, hi = -1e9;
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          let a = 0; for (const w of ws) a -= w.I * log(max(5, hypot(i * st - w.x, j * st - w.y)));
          g[j * nx + i] = a; lo = min(lo, a); hi = max(hi, a);
        }
        const out = [], dA = 3;
        if (ws.length) for (let L = Math.ceil(lo / dA) * dA; L <= hi; L += dA) out.push(PL.contour(g, nx, ny, L + 0.001));
        return out;
      });
      d.clip(0, 0, 640, 560);
      segs.forEach((s) => d.contour(s, 0, 0, st, st, 'rgba(56,189,248,0.45)', 1.2));
      for (let y = 40; y < 560; y += 60) for (let x = 40; x < 640; x += 60) {
        if (ws.some((w) => hypot(x - w.x, y - w.y) < 25)) continue;
        let bx = 0, by = 0;
        for (const w of ws) { const dx = x - w.x, dy = y - w.y, r2 = dx * dx + dy * dy; bx += (w.I * dy) / r2; by -= (w.I * dx) / r2; }
        const m = hypot(bx, by);
        if (m < 1e-9) continue;
        const ux = bx / m, uy = by / m;
        d.line(x - ux * 12, y - uy * 12, x, y, '#cfd8ee', 3); d.line(x, y, x + ux * 12, y + uy * 12, C.red, 3);
        d.circle(x, y, 2, '#000');
      }
      d.unclip();
      [w1, w2].forEach((w, k) => {
        if (k === 1 && P.I2 === 0) { d.circle(w.x, w.y, 13, null, 'rgba(160,175,210,0.3)', 1.5); return; }
        d.circle(w.x, w.y, 15, '#3a4668', '#cfd8ee', 2);
        if (w.I) d.perp(w.x, w.y, 10, w.I > 0, C.yellow, 2.2);
        d.text('I' + (k ? '₂' : '₁') + ' = ' + w.I + ' A', w.x, w.y + 30, C.yellow, 12, 'center');
      });
      if (P.I && P.I2) {
        const att = P.I * P.I2 > 0, L = 40;
        d.arrow(w1.x + (att ? 18 : -18), w1.y - 40, w1.x + (att ? 18 + L : -18 - L), w1.y - 40, C.pink, 3);
        d.arrow(w2.x + (att ? -18 : 18), w2.y - 40, w2.x + (att ? -18 - L : 18 + L), w2.y - 40, C.pink, 3);
        d.text(att ? '인력' : '척력', (w1.x + w2.x) / 2, w1.y - 64, C.pink, 13, 'center', 'middle', true);
      }
      d.g.setLineDash([5, 5]); d.circle(w1.x, w1.y, P.r * pc, null, C.green, 1.5); d.g.setLineDash([]);
      d.circle(w1.x + P.r * pc * 0.707, w1.y - P.r * pc * 0.707, 5, C.green);
      d.text('앙페르 고리 r = ' + P.r + ' cm', w1.x, w1.y + P.r * pc + 16, C.green, 11, 'center');
      const p = d.plot({ x: 680, y: 60, w: 190, h: 230, xmin: 0, xmax: 20, ymin: 0, ymax: (K.mu0 * 20) / (2 * PI * 0.01) * 1e6 * 0.6, title: '도선 1의 B(r)', xl: 'r (cm)', yl: 'μT', nx: 2 });
      p.fn((r) => ((K.mu0 * abs(P.I)) / (2 * PI * r * 0.01)) * 1e6, C.cyan, 2.5, 200, null, 0.5, 20);
      p.dot(P.r, ((K.mu0 * abs(P.I)) / (2 * PI * P.r * 0.01)) * 1e6, C.green);
      d.text('나침반: 빨간 끝 = N극', 680, 340, C.red, 12);
      d.text('파란 곡선: 자기력선', 680, 362, C.cyan, 12);
    },
  });

  add({
    id: 'solenoid', cat: '자기장', name: '비오-사바르 법칙과 솔레노이드', en: 'Biot–Savart Law & the Solenoid',
    tex: ['d\\vec B = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\vec\\ell\\times\\hat r}{r^2}', 'B_{\\text{내부}} \\approx \\mu_0 n I,\\qquad n = \\frac{N}{L}'],
    short: 'B = \\mu_0 n I',
    desc: '비오-사바르 법칙에 따르면 전류의 작은 조각 하나하나가 자기장에 기여하고, 전체 자기장은 이를 모두 더한 것이다. 원형 고리를 여러 개 촘촘히 감은 솔레노이드에서는 각 고리의 자기장이 내부에서 보강되어 거의 균일한 자기장 μ₀nI가 생기고, 바깥에서는 막대자석과 같은 모양이 된다. 그림은 각 고리의 정확한 자기장(타원 적분)을 더해 그린 자기력선이다. 감은 수를 늘려 보자.',
    params: [R('N', '감은 수 N', '회', 2, 30, 1, 12), R('L', '솔레노이드 길이 L', 'cm', 5, 30, 0.5, 18), R('I', '전류 I', 'A', 0.1, 5, 0.1, 2), R('a', '반지름 a', 'cm', 1.5, 5, 0.1, 3)],
    Bc(P) { let b = 0; const a = P.a * 0.01; for (let i = 0; i < P.N; i++) { const z = P.N > 1 ? (-P.L / 2 + (P.L * i) / (P.N - 1)) * 0.01 : 0; b += (K.mu0 * P.I * a * a) / (2 * Math.pow(a * a + z * z, 1.5)); } return b; },
    out(P) { const n = P.N / (P.L * 0.01); return [['단위 길이당 감은 수 n', n, '회/m'], ['이상적 솔레노이드 B = μ₀nI', K.mu0 * n * P.I * 1000, 'mT'], ['중심의 실제 B (고리 합)', this.Bc(P) * 1000, 'mT'], ['L/a (클수록 이상적)', P.L / P.a, '']]; },
    sub: (P) => `B = \\mu_0 n I = (4\\pi\\times10^{-7})(${ft(P.N / (P.L * 0.01))})(${ft(P.I)}) = ${ft(K.mu0 * (P.N / (P.L * 0.01)) * P.I)}\\ \\mathrm{T}`,
    draw(d, S, P) {
      d.clear();
      const pc = 15, cx = 450, cy = 220, nx = 151, ny = 75, sx = 6, sy = 6;
      const loops = Array.from({ length: P.N }, (_, i) => (P.N > 1 ? -P.L / 2 + (P.L * i) / (P.N - 1) : 0));
      const key = [P.N, P.L, P.a].join();
      const res = PL.memo(S, 'psi', key, () => {
        const g = new Float32Array(nx * ny), a = P.a;
        let ref = 0;
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const z = (i * sx - cx) / pc, rho = max(1e-3, abs(j * sy - cy) / pc);
          let psi = 0;
          for (const zi of loops) {
            const k2 = (4 * a * rho) / ((a + rho) ** 2 + (z - zi) ** 2), k = sqrt(min(k2, 0.999999)), [Kk, Ek] = M.ellipKE(k);
            psi += (sqrt(a * rho) / k) * ((1 - k2 / 2) * Kk - Ek);
          }
          g[j * nx + i] = psi;
        }
        ref = g[Math.round((cy - P.a * 0.85 * pc) / sy) * nx + Math.round(cx / sx)];
        const levels = [];
        for (let k = 1; k <= 9; k++) levels.push(PL.contour(g, nx, ny, (ref * k) / 8));
        return levels;
      });
      res.forEach((s) => d.contour(s, 0, 0, sx, sy, 'rgba(56,189,248,0.6)', 1.3));
      const a = P.a * pc;
      d.rect(cx - (P.L / 2) * pc - 10, cy - a - 3, P.L * pc + 20, 6, 'rgba(255,159,67,0.15)');
      d.rect(cx - (P.L / 2) * pc - 10, cy + a - 3, P.L * pc + 20, 6, 'rgba(255,159,67,0.15)');
      loops.forEach((zi) => { const X = cx + zi * pc; d.perp(X, cy - a, 5, true, C.orange, 1.6); d.perp(X, cy + a, 5, false, C.orange, 1.6); });
      d.arrow(cx - 60, cy, cx + 60, cy, C.yellow, 3);
      d.text('B', cx + 70, cy - 10, C.yellow, 14, 'left', 'middle', true);
      d.text('N극', cx + (P.L / 2) * pc + 30, cy - a - 20, C.red, 13, 'center'); d.text('S극', cx - (P.L / 2) * pc - 30, cy - a - 20, C.cyan, 13, 'center');
      d.text('⊙ / ⊗ : 고리 단면의 전류 방향', 20, 24, C.orange, 12);
      const Bax = (zc) => { let b = 0; const aa = P.a * 0.01; for (const zi of loops) b += (K.mu0 * P.I * aa * aa) / (2 * Math.pow(aa * aa + ((zc - zi) * 0.01) ** 2, 1.5)); return b * 1000; };
      const ideal = K.mu0 * (P.N / (P.L * 0.01)) * P.I * 1000;
      const p = d.plot({ x: 70, y: 455, w: 790, h: 75, xmin: -cx / pc, xmax: cx / pc, ymin: 0, ymax: max(ideal, Bax(0)) * 1.25, title: '중심축 위의 자기장 B(z) (mT) — 점선: μ₀nI', xl: 'z (cm)', ny: 2 });
      p.hl(ideal, C.yellow); p.fn(Bax, C.cyan, 2.5, 300);
    },
  });

  /* ================================================================ 전자기 유도 */
  add({
    id: 'faraday', cat: '전자기 유도', name: '패러데이 전자기 유도 법칙과 렌츠 법칙', en: "Faraday's Law of Induction & Lenz's Law",
    tex: ['\\mathcal{E} = -N\\frac{d\\Phi_B}{dt},\\qquad \\Phi_B = \\int \\vec B\\cdot d\\vec A', '\\nabla\\times\\vec E = -\\frac{\\partial\\vec B}{\\partial t}'],
    short: '\\mathcal E = -N\\frac{d\\Phi_B}{dt}',
    desc: '코일을 지나는 자기 선속이 변하면 코일에 기전력이 유도된다(패러데이). 자석이 가만히 있으면 선속이 커도 전류가 흐르지 않고, 빠르게 움직일수록 큰 전압이 생긴다. 유도 전류는 선속의 변화를 방해하는 방향으로 흐른다(렌츠 법칙): 자석이 다가오면 코일이 같은 극을 만들어 밀어내고, 멀어지면 반대 극을 만들어 붙잡는다. 발전기, 변압기, 무선 충전, 인덕션 레인지의 원리이다.',
    params: [R('N', '코일 감은 수 N', '회', 1, 200, 1, 50), R('f', '자석 왕복 진동수', 'Hz', 0.1, 2, 0.05, 0.4), R('B0', '자석 세기 B₀', 'T', 0.05, 1, 0.01, 0.4), Sel('pol', '코일을 향하는 극', [[1, 'N극'], [-1, 'S극']], 1)],
    flux: (P, x) => P.pol * P.B0 * 0.002 / Math.pow(1 + (x / 0.05) ** 2, 1.5),
    out(P, S) { return [['코일을 지나는 선속 Φ', this.flux(P, S.x || 0.15) * 1e3, 'mWb'], ['유도 기전력 ε', S.emf, 'V'], ['최대 기전력 (근사)', S.emax, 'V'], ['자석 위치', (S.x || 0) * 100, 'cm']]; },
    init(S) { S.hist = []; S.emf = 0; S.emax = 0; S.x = 0.15; },
    step(S, P, dt) {
      S.t += dt;
      const A = 0.16, x = A * cos(2 * PI * P.f * S.t), v = -A * 2 * PI * P.f * sin(2 * PI * P.f * S.t);
      const e = 1e-4, dphi = (this.flux(P, x + v * e) - this.flux(P, x - v * e)) / (2 * e);
      S.x = x; S.emf = -P.N * dphi;
      S.emax = max(S.emax * 0.999, abs(S.emf));
      S.hist.push([S.t, this.flux(P, x) * 1e3, S.emf]);
      if (S.hist.length > 700) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const cx = 520, cy = 160, sc = 1100, X = cx + S.x * sc;
      for (let k = 0; k < 9; k++) { const x = cx - 40 + k * 10; d.g.beginPath(); d.g.ellipse(x, cy, 12, 62, 0, 0, 2 * PI); d.g.strokeStyle = '#d4925a'; d.g.lineWidth = 3; d.g.stroke(); }
      const nm = P.pol > 0 ? 'N' : 'S', sm = P.pol > 0 ? 'S' : 'N';
      d.rect(X - 200, cy - 22, 100, 44, sm === 'N' ? C.red : C.blue);
      d.rect(X - 100, cy - 22, 100, 44, nm === 'N' ? C.red : C.blue);
      d.text(sm, X - 150, cy, '#fff', 18, 'center', 'middle', true);
      d.text(nm, X - 50, cy, '#fff', 18, 'center', 'middle', true);
      const em = S.emf, eM = max(S.emax, 1e-6);
      if (abs(em) > eM * 0.05) {
        const dir = Math.sign(em);
        for (let k = 0; k < 3; k++) { const x = cx - 30 + k * 25; d.arrow(x, cy + (dir > 0 ? 50 : -50), x, cy + (dir > 0 ? -50 : 50), C.yellow, 2, 8); }
        const opp = Math.sign(em) * P.pol;
        d.arrow(cx + (opp > 0 ? -60 : 60), cy - 90, cx + (opp > 0 ? 60 : -60), cy - 90, C.green, 3);
        d.text('유도 전류가 만든 자기장 (변화를 방해)', cx, cy - 110, C.green, 12, 'center');
      }
      d.line(cx - 40, cy + 62, cx - 40, 300, '#d4925a', 2); d.line(cx + 40, cy + 62, cx + 40, 300, '#d4925a', 2);
      d.line(cx - 40, 300, cx - 20, 300, '#d4925a', 2); d.line(cx + 40, 300, cx + 20, 300, '#d4925a', 2);
      d.circle(cx, 300, 22, '#1b2440', '#cfd8ee', 2);
      const ang = M.clamp(em / eM, -1, 1) * 1.1;
      d.line(cx, 312, cx + 20 * sin(ang), 312 - 20 * cos(ang), C.red, 2.5);
      d.text('검류계', cx + 30, 300, C.dim, 11);
      const p = d.plot({ x: 70, y: 370, w: 370, h: 150, xmin: S.t - 6, xmax: S.t, ymin: -2.2 * P.B0, ymax: 2.2 * P.B0, title: '선속 Φ(t) (mWb)', xl: 't (s)', ny: 2 });
      p.pts(S.hist.map((h) => [h[0], h[1]]), C.cyan, 2.5);
      const q = d.plot({ x: 500, y: 370, w: 370, h: 150, xmin: S.t - 6, xmax: S.t, ymin: -eM * 1.2, ymax: eM * 1.2, title: '유도 기전력 ε = −N dΦ/dt (V)', xl: 't (s)', ny: 2 });
      q.pts(S.hist.map((h) => [h[0], h[2]]), C.yellow, 2.5);
    },
  });

  add({
    id: 'rlc', cat: '전자기 유도', name: 'RLC 회로와 공진', en: 'RLC Circuit & Resonance',
    tex: ['Z = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2},\\qquad I_0 = \\frac{V_0}{Z}', '\\omega_0 = \\frac{1}{\\sqrt{LC}},\\qquad \\tan\\phi = \\frac{\\omega L - 1/\\omega C}{R}'],
    short: '\\omega_0 = \\frac{1}{\\sqrt{LC}}',
    desc: '교류 회로에서 코일(L)은 진동수가 높을수록, 축전기(C)는 낮을수록 전류를 방해한다(리액턴스). 두 리액턴스가 같아지는 공진 진동수에서는 서로 상쇄되어 임피던스가 R로 최소가 되고 전류가 최대가 된다. 왼쪽 위상자 도표에서 각 소자의 전압이 회전하는 화살표로 표시되며, 코일 전압은 전류보다 90° 앞서고 축전기 전압은 90° 뒤진다. 라디오가 원하는 방송국을 고르는 원리이다.',
    params: [R('R', '저항 R', 'Ω', 1, 100, 1, 10), R('L', '인덕턴스 L', 'mH', 1, 100, 1, 10), R('C', '전기 용량 C', 'μF', 1, 100, 1, 10), R('f', '전원 진동수 f', 'Hz', 50, 2000, 1, 400, { log: 1 })],
    calc(P) { const w = 2 * PI * P.f, XL = w * P.L * 1e-3, XC = 1 / (w * P.C * 1e-6), Z = hypot(P.R, XL - XC); return { w, XL, XC, Z, I0: 10 / Z, ph: atan2(XL - XC, P.R), f0: 1 / (2 * PI * sqrt(P.L * 1e-3 * P.C * 1e-6)) }; },
    out(P) { const c = this.calc(P); return [['공진 진동수 f₀ = 1/(2π√LC)', c.f0, 'Hz'], ['유도 리액턴스 X_L = ωL', c.XL, 'Ω'], ['용량 리액턴스 X_C = 1/ωC', c.XC, 'Ω'], ['임피던스 Z', c.Z, 'Ω'], ['전류 진폭 I₀ (V₀ = 10 V)', c.I0, 'A'], ['위상차 φ (전압 − 전류)', M.deg(c.ph), '°'], ['Q 인자 (1/R)√(L/C)', (1 / P.R) * sqrt((P.L * 1e-3) / (P.C * 1e-6)), '']]; },
    sub(P) { const c = this.calc(P); return `Z = \\sqrt{(${ft(P.R)})^2 + (${ft(c.XL)} - ${ft(c.XC)})^2} = ${ft(c.Z)}\\ \\Omega`; },
    init(S) { S.th = 0; },
    step(S, P, dt) { S.th += 2 * PI * 0.4 * dt; },
    draw(d, S, P) {
      d.clear();
      const c = this.calc(P), cx = 200, cy = 230, sc = 150 / max(10, c.I0 * max(P.R, c.XL, c.XC));
      const I0 = c.I0, th = S.th;
      const vec = (len, a, col, lbl, ox = 0, oy = 0) => { const x2 = cx + ox + len * cos(th + a), y2 = cy + oy - len * sin(th + a); d.arrow(cx + ox, cy + oy, x2, y2, col, 3); d.text(lbl, x2 + 6, y2, col, 12); return [x2 - cx, y2 - cy]; };
      d.circle(cx, cy, 160, null, 'rgba(255,255,255,0.07)', 1);
      vec(I0 * P.R * sc, 0, C.green, 'V_R');
      vec(I0 * c.XL * sc, PI / 2, C.orange, 'V_L');
      vec(I0 * c.XC * sc, -PI / 2, C.cyan, 'V_C');
      vec(I0 * c.Z * sc, c.ph, C.white, 'V');
      d.text('위상자 도표 (I는 V_R 방향)', 40, 30, C.text, 13);
      const p = d.plot({ x: 430, y: 50, w: 440, h: 170, xmin: 0, xmax: 2, ymin: -1.2, ymax: 1.2, title: '전압(흰색)과 전류(노랑) — 위상차 φ = ' + fmt(M.deg(c.ph), 3) + '°', xl: '주기', ny: 2 });
      p.fn((x) => cos(2 * PI * x - th), C.white, 2);
      p.fn((x) => cos(2 * PI * x - th - c.ph) * 0.8, C.yellow, 2);
      const fl = 50, fh = 2000;
      const Iof = (f) => { const w = 2 * PI * f; return 10 / hypot(P.R, w * P.L * 1e-3 - 1 / (w * P.C * 1e-6)); };
      const q = d.plot({ x: 430, y: 290, w: 440, h: 220, xmin: fl, xmax: fh, ymin: 0, ymax: (10 / P.R) * 1.1, xlog: true, title: '공진 곡선: 전류 진폭 I₀(f)', xl: 'f (Hz, 로그)', yl: 'A' });
      q.area(Iof, 'rgba(255,216,77,0.15)', fl, fh, 300);
      q.fn(Iof, C.yellow, 2.5, 400);
      q.vl(c.f0, C.red); q.label('f₀', c.f0 * 1.05, (10 / P.R) * 1.02, C.red, 11);
      q.vl(P.f, C.green, null, 2); q.dot(P.f, c.I0, C.green);
      d.text('X_L > X_C: 유도성', 60, 440, C.orange, 12); d.text('X_L < X_C: 용량성', 60, 462, C.cyan, 12);
      d.text(c.XL > c.XC * 1.02 ? '현재: 유도성 (전압이 전류보다 앞섬)' : c.XC > c.XL * 1.02 ? '현재: 용량성 (전류가 전압보다 앞섬)' : '현재: 공진! (Z = R)', 60, 495, C.text, 13, 'left', 'middle', true);
    },
  });

  /* ================================================================ 전자기파 */
  add({
    id: 'maxwelleq', cat: '전자기파', name: '맥스웰 방정식과 전자기파', en: "Maxwell's Equations & Electromagnetic Waves",
    tex: ['\\nabla\\cdot\\vec E = \\frac{\\rho}{\\varepsilon_0}\\qquad \\nabla\\cdot\\vec B = 0', '\\nabla\\times\\vec E = -\\frac{\\partial\\vec B}{\\partial t}\\qquad \\nabla\\times\\vec B = \\mu_0\\vec J + \\mu_0\\varepsilon_0\\frac{\\partial\\vec E}{\\partial t}', 'c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}},\\qquad B_0 = \\frac{E_0}{c}'],
    short: 'c = 1/\\sqrt{\\mu_0\\varepsilon_0}',
    desc: '맥스웰 방정식 네 개는 모든 전기·자기 현상을 기술한다. 변하는 자기장은 전기장을 만들고(패러데이), 변하는 전기장은 자기장을 만든다(맥스웰의 변위 전류). 두 장이 서로를 만들며 빈 공간을 퍼져 나가는 것이 전자기파이며, 그 속력 1/√(μ₀ε₀)가 빛의 속력과 정확히 같다는 발견으로 빛이 전자기파임이 밝혀졌다. 빨강 = 전기장 E, 파랑 = 자기장 B, 진행 방향은 E × B 방향이다.',
    hint: '캔버스를 드래그하면 시점을 돌릴 수 있습니다.',
    params: [R('lam', '파장 λ', 'm', 1e-12, 1000, 1, 550e-9, { log: 1 }), R('E0', '전기장 진폭 E₀', 'V/m', 1, 1000, 1, 100)],
    out: (P) => {
      const f = K.c / P.lam;
      return [['빛의 속력 1/√(μ₀ε₀)', 1 / sqrt(K.mu0 * K.eps0), 'm/s'], ['진동수 f = c/λ', f, 'Hz'], ['영역', PL.wlName(P.lam * 1e9), ''], ['광자 에너지 hf', (K.h * f) / K.eV, 'eV'], ['자기장 진폭 B₀ = E₀/c', (P.E0 / K.c) * 1e9, 'nT'], ['세기 I = ½cε₀E₀²', 0.5 * K.c * K.eps0 * P.E0 * P.E0, 'W/m²']];
    },
    sub: (P) => `f = \\frac{c}{\\lambda} = \\frac{3.00\\times10^8}{${ft(P.lam)}} = ${ft(K.c / P.lam)}\\ \\mathrm{Hz}`,
    init(S) { S.yaw = -0.55; S.pitch = 0.35; S.ph = 0; },
    pointer(type, x, y, S) { return PL.dragRotate(type, x, y, S); },
    step(S, P, dt) { S.ph += 2 * PI * 0.5 * dt; },
    draw(d, S, P) {
      d.clear(false);
      const cam = PL.cam(S.yaw, S.pitch, 52, 450, 250), A = 1.6, k = (2 * PI) / 4.2;
      const nm = P.lam * 1e9, vis = nm >= 380 && nm <= 780, ecol = vis ? PL.wlCss(nm) : C.red;
      const ax0 = cam(-6, 0, 0), ax1 = cam(6, 0, 0);
      d.arrow(ax0[0], ax0[1], ax1[0], ax1[1], 'rgba(255,255,255,0.5)', 1.5);
      const t1 = cam(6.4, 0, 0); d.text('진행 방향', t1[0], t1[1], C.dim, 12);
      const ep = [], bp = [];
      for (let i = 0; i <= 120; i++) {
        const x = -6 + i * 0.1, e = A * sin(k * x - S.ph);
        const o = cam(x, 0, 0), pe = cam(x, 0, e), pb = cam(x, e, 0);
        ep.push(pe); bp.push(pb);
        if (i % 4 === 0) { d.line(o[0], o[1], pe[0], pe[1], ecol, 1.2); d.line(o[0], o[1], pb[0], pb[1], 'rgba(106,141,255,0.8)', 1.2); }
      }
      d.poly(ep, ecol, 2.5); d.poly(bp, C.blue, 2.5);
      const le = cam(-6, 0, A + 0.4), lb = cam(-6, A + 0.5, 0);
      d.text('E (전기장)', le[0], le[1], ecol, 13, 'center', 'middle', true);
      d.text('B (자기장)', lb[0], lb[1], C.blue, 13, 'center', 'middle', true);
      const spec = d.plot({ x: 70, y: 470, w: 790, h: 28, xmin: 1e-13, xmax: 1e4, ymin: 0, ymax: 1, xlog: true, yticks: false, grid: false, title: '전자기파 스펙트럼 (파장, m)' });
      [[1e-13, 1e-11, '감마선'], [1e-11, 1e-8, 'X선'], [1e-8, 3.8e-7, '자외선'], [3.8e-7, 7.8e-7, '가시광'], [7.8e-7, 1e-3, '적외선'], [1e-3, 1, '마이크로파'], [1, 1e4, '전파']].forEach(([a, b, n], i) => {
        const x0 = spec.X(a), x1 = spec.X(b);
        if (n === '가시광') { for (let w = 380; w < 780; w += 10) d.rect(spec.X(w * 1e-9), 470, spec.X((w + 10) * 1e-9) - spec.X(w * 1e-9) + 0.5, 28, PL.wlCss(w)); }
        else d.rect(x0, 470, x1 - x0, 28, `hsla(${220 + i * 25},40%,${22 + (i % 2) * 6}%,1)`);
        d.text(n, (x0 + x1) / 2, 520, C.dim, 10, 'center');
      });
      const X = spec.X(P.lam);
      d.poly([[X, 466], [X - 7, 456], [X + 7, 456]], null, 0, true, C.yellow);
    },
  });

  add({
    id: 'dipole', cat: '전자기파', name: '진동하는 쌍극자의 복사 (안테나)', en: 'Oscillating Dipole Radiation',
    tex: ['P = \\frac{\\mu_0 p_0^2\\omega^4}{12\\pi c},\\qquad \\frac{dP}{d\\Omega} \\propto \\sin^2\\theta', 'P_{\\text{라머}} = \\frac{q^2a^2}{6\\pi\\varepsilon_0c^3}\\quad(\\text{가속하는 전하})'],
    short: 'dP/d\\Omega \\propto \\sin^2\\theta',
    desc: '가속하는 전하는 전자기파를 복사한다. 안테나 속 전하가 위아래로 진동하면 그 주변의 전기력선이 끊어져 고리 모양으로 떨어져 나가며 빛의 속력으로 퍼져 나간다(헤르츠의 그림). 복사는 진동 방향과 수직인 쪽(옆)으로 가장 강하고 진동 방향(위·아래)으로는 전혀 나가지 않는다(sin²θ). 복사 일률은 진동수의 네제곱에 비례해, 하늘이 파란 이유(레일리 산란)도 설명한다.',
    params: [R('f', '진동수 f', 'MHz', 10, 1000, 1, 100, { log: 1 }), R('p0', '쌍극자 모멘트 진폭 p₀', 'nC·m', 0.1, 10, 0.1, 1)],
    out: (P) => { const w = 2 * PI * P.f * 1e6, p0 = P.p0 * 1e-9; return [['파장 λ = c/f', K.c / (P.f * 1e6), 'm'], ['총 복사 일률', (K.mu0 * p0 * p0 * w ** 4) / (12 * PI * K.c), 'W'], ['θ = 45° 방향 상대 세기', 0.5, '']]; },
    sub: (P) => { const w = 2 * PI * P.f * 1e6, p0 = P.p0 * 1e-9; return `P = \\frac{\\mu_0(${ft(p0)})^2(${ft(w)})^4}{12\\pi c} = ${ft((K.mu0 * p0 * p0 * w ** 4) / (12 * PI * K.c))}\\ \\mathrm{W}`; },
    init(S) { S.ph = 0; },
    step(S, P, dt) { S.ph += 2 * PI * 0.35 * dt; },
    draw(d, S, P) {
      d.clear();
      const nx = 150, ny = 94, st = 6, cx = 450, cy = 280, lam = 260, k = (2 * PI) / lam, g = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = i * st - cx, y = cy - j * st, r = max(hypot(x, y), 8), s2 = (x * x) / (r * r), kr = max(k * r, 0.35);
        g[j * nx + i] = s2 * (cos(kr - S.ph) / kr + sin(kr - S.ph));
      }
      [-1.5, -1, -0.6, -0.3, -0.12, 0.12, 0.3, 0.6, 1, 1.5].forEach((L) => d.contour(PL.contour(g, nx, ny, L), 0, 0, st, st, L > 0 ? 'rgba(255,92,108,0.7)' : 'rgba(56,189,248,0.7)', 1.4));
      const z = 26 * cos(S.ph);
      d.line(cx, cy - 40, cx, cy + 40, '#cfd8ee', 4);
      d.charge(cx, cy - z, 1, 8); d.charge(cx, cy + z, -1, 8);
      d.text('안테나 (쌍극자)', cx + 16, cy + 56, C.text, 12);
      const px = 800, py = 470, rr = 60;
      d.circle(px, py, rr + 10, 'rgba(5,9,22,0.85)', 'rgba(160,180,225,0.3)', 1);
      const pts = []; for (let a = 0; a <= 360; a += 4) { const t = M.rad(a), r2 = rr * sin(t) ** 2; pts.push([px + r2 * sin(t), py - r2 * cos(t)]); }
      d.poly(pts, C.yellow, 2, true, 'rgba(255,216,77,0.2)');
      d.line(px, py - rr, px, py + rr, 'rgba(255,255,255,0.3)', 1, [3, 3]);
      d.text('복사 세기 ∝ sin²θ', px, py - rr - 18, C.yellow, 11, 'center');
      d.text('전기력선 (빨강/파랑은 방향)', 20, 24, C.text, 13);
      d.text('λ', cx + lam / 2, cy - 8, C.dim, 12);
    },
  });

  /* ================================================================ 광학 */
  add({
    id: 'snell', cat: '광학', name: '스넬의 법칙 (굴절과 전반사)', en: "Snell's Law — Refraction & Total Internal Reflection",
    tex: ['n_1\\sin\\theta_1 = n_2\\sin\\theta_2', '\\sin\\theta_c = \\frac{n_2}{n_1}\\quad(n_1 > n_2),\\qquad v = \\frac{c}{n}'],
    short: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2',
    desc: '빛은 매질에 따라 속력이 달라(v = c/n) 경계면에서 꺾인다. 굴절률이 큰 매질로 들어가면 법선 쪽으로, 작은 매질로 나가면 법선에서 멀어지게 꺾인다. 굴절률이 큰 쪽에서 입사각이 임계각보다 크면 빛이 전혀 빠져나가지 못하고 모두 반사된다(전반사, 광섬유의 원리). 선의 점무늬 간격은 매질 속 파장이고, 밝기는 반사·투과 비율(프레넬 식)이다.',
    params: [R('n1', '위쪽 매질 굴절률 n₁', '', 1, 2.5, 0.01, 1), R('n2', '아래쪽 매질 굴절률 n₂', '', 1, 2.5, 0.01, 1.5), R('th', '입사각 θ₁', '°', 0, 89, 0.5, 40)],
    calc(P) {
      const t1 = M.rad(P.th), s2 = (P.n1 * sin(t1)) / P.n2;
      if (s2 > 1) return { tir: true, R: 1, T: 0 };
      const t2 = Math.asin(s2), c1 = cos(t1), c2 = cos(t2);
      const rs = (P.n1 * c1 - P.n2 * c2) / (P.n1 * c1 + P.n2 * c2), rp = (P.n2 * c1 - P.n1 * c2) / (P.n2 * c1 + P.n1 * c2), Rr = (rs * rs + rp * rp) / 2;
      return { tir: false, t2, R: Rr, T: 1 - Rr };
    },
    out(P) { const c = this.calc(P); return [['굴절각 θ₂', c.tir ? '전반사' : M.deg(c.t2), '°'], ['임계각', P.n1 > P.n2 ? M.deg(Math.asin(P.n2 / P.n1)) : '없음 (n₁ < n₂)', '°'], ['반사율 R', c.R * 100, '%'], ['투과율 T', c.T * 100, '%'], ['위쪽 매질 속 빛의 속력', K.c / P.n1, 'm/s'], ['아래쪽 매질 속 빛의 속력', K.c / P.n2, 'm/s']]; },
    sub(P) { const c = this.calc(P); return c.tir ? `\\sin\\theta_2 = \\frac{${ft(P.n1)}\\sin ${ft(P.th)}^\\circ}{${ft(P.n2)}} > 1\\ \\Rightarrow\\ \\text{전반사}` : `\\theta_2 = \\sin^{-1}\\!\\left(\\frac{${ft(P.n1)}\\sin ${ft(P.th)}^\\circ}{${ft(P.n2)}}\\right) = ${ft(M.deg(c.t2))}^\\circ`; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear(false);
      const ox = 450, oy = 280, L = 330, c = this.calc(P), t1 = M.rad(P.th);
      d.rect(0, 0, 900, oy, `rgba(80,140,255,${(P.n1 - 1) * 0.14})`);
      d.rect(0, oy, 900, 280, `rgba(80,140,255,${(P.n2 - 1) * 0.14})`);
      d.line(0, oy, 900, oy, '#cfd8ee', 2);
      d.line(ox, 30, ox, 530, 'rgba(255,255,255,0.3)', 1, [5, 5]);
      d.text('n₁ = ' + P.n1, 20, 30, C.text, 14, 'left', 'middle', true); d.text('n₂ = ' + P.n2, 20, 530, C.text, 14, 'left', 'middle', true);
      const ray = (x1, y1, x2, y2, n, a, dir) => {
        const g = d.g, lw = 4, wl = 26 / n;
        g.save(); g.globalAlpha = max(0.08, a);
        g.strokeStyle = '#ffe680'; g.lineWidth = lw; g.setLineDash([wl * 0.5, wl * 0.5]); g.lineDashOffset = -dir * ((S.t * 70) / n);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
        d.g.globalAlpha = max(0.08, a) * 0.35; d.line(x1, y1, x2, y2, '#ffe680', 9); d.g.globalAlpha = 1;
      };
      ray(ox - L * sin(t1), oy - L * cos(t1), ox, oy, P.n1, 1, 1);
      ray(ox, oy, ox + L * sin(t1), oy - L * cos(t1), P.n1, c.R, 1);
      if (!c.tir) ray(ox, oy, ox + L * sin(c.t2), oy + L * cos(c.t2), P.n2, c.T, 1);
      d.arc(ox, oy, 60, -PI / 2 - t1, -PI / 2, C.yellow, 1.5); d.text('θ₁', ox - 30 * sin(t1 / 2) - 14, oy - 75, C.yellow, 13);
      if (!c.tir) { d.arc(ox, oy, 60, PI / 2 - c.t2, PI / 2, C.cyan, 1.5); d.text('θ₂', ox + 22, oy + 80, C.cyan, 13); }
      if (c.tir) d.label('전반사! 빛이 모두 반사된다', ox + 200, oy - 40, C.red, 13);
      d.text('반사 ' + fmt(c.R * 100, 3) + '%', ox + L * sin(t1) * 0.7, oy - L * cos(t1) * 0.7 - 14, C.text, 12, 'center');
      if (!c.tir) d.text('굴절 ' + fmt(c.T * 100, 3) + '%', ox + L * sin(c.t2) * 0.6 + 30, oy + L * cos(c.t2) * 0.6, C.text, 12);
      const p = d.plot({ x: 680, y: 360, w: 190, h: 150, xmin: 0, xmax: 90, ymin: 0, ymax: 1, title: '입사각에 따른 반사율 R', xl: 'θ₁ (°)', nx: 3, ny: 2 });
      p.fn((a) => this.calc({ ...P, th: a }).R, C.orange, 2, 200, null, 0, 89.9);
      p.dot(P.th, c.R, C.orange);
    },
  });

  add({
    id: 'lens', cat: '광학', name: '얇은 렌즈 공식', en: 'Thin Lens Equation',
    tex: ['\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}', 'm = -\\frac{d_i}{d_o} = \\frac{h_i}{h_o}'],
    short: '\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}',
    desc: '볼록 렌즈(f > 0)는 평행광을 초점에 모으고, 오목 렌즈(f < 0)는 퍼뜨린다. 물체에서 나온 특별한 세 광선 — 광축에 평행한 광선은 초점을 지나고, 렌즈 중심을 지나는 광선은 꺾이지 않으며, 초점을 지난 광선은 평행하게 나간다 — 이 만나는 곳에 상이 생긴다. 물체가 초점 밖에 있으면 거꾸로 선 실상(스크린에 맺힘), 초점 안에 있으면 바로 선 확대된 허상(돋보기)이 생긴다.',
    hint: '물체(주황 화살표)를 끌어 위치를 바꿀 수 있습니다.',
    params: [R('f', '초점 거리 f (− = 오목 렌즈)', 'cm', -30, 30, 0.5, 10), R('do', '물체 거리 d_o', 'cm', 2, 60, 0.5, 25), R('ho', '물체 높이 h_o', 'cm', 1, 8, 0.5, 4)],
    fix(P) { if (abs(P.f) < 2) P.f = P.f < 0 ? -2 : 2; },
    img(P) { const di = abs(P.do - P.f) < 1e-9 ? Infinity : (P.f * P.do) / (P.do - P.f); return { di, m: -di / P.do }; },
    out(P) {
      const { di, m } = this.img(P);
      return [['상의 거리 d_i', di, 'cm'], ['배율 m = −d_i/d_o', isFinite(m) ? m : Infinity, '배'], ['상의 종류', !isFinite(di) ? '상이 생기지 않음 (무한대)' : di > 0 ? '실상 (렌즈 뒤, 스크린에 맺힘)' : '허상 (렌즈 앞, 눈으로만 보임)', ''], ['방향', !isFinite(m) ? '—' : m < 0 ? '도립 (거꾸로)' : '정립 (바로)', ''], ['크기', !isFinite(m) ? '—' : abs(m) > 1 ? '확대' : '축소', ''], ['굴절력 1/f', 100 / P.f, 'D (디옵터)']];
    },
    sub(P) { const { di } = this.img(P); return `\\frac{1}{d_i} = \\frac{1}{${ft(P.f)}} - \\frac{1}{${ft(P.do)}}\\ \\Rightarrow\\ d_i = ${ft(di)}\\ \\mathrm{cm}`; },
    pointer(type, x, y, S, P, api) {
      const X = 450 - P.do * 6;
      if (type === 'down') { if (abs(x - X) < 18 && y > 260 - P.ho * 12 - 15 && y < 292) { S.drag = true; return true; } return false; }
      if (type === 'move' && S.drag) api.set('do', +M.clamp((450 - x) / 6, 2, 60).toFixed(1));
      if (type === 'up' || type === 'leave') S.drag = false;
      return false;
    },
    draw(d, S, P) {
      d.clear();
      const cx = 450, ay = 280, s = 6, hs = 12, X = (cm) => cx + cm * s;
      d.line(20, ay, 880, ay, 'rgba(255,255,255,0.35)', 1.5);
      const conv = P.f > 0;
      d.g.beginPath();
      if (conv) { d.g.ellipse(cx, ay, 12, 150, 0, 0, 2 * PI); } else { d.g.moveTo(cx - 14, ay - 150); d.g.lineTo(cx + 14, ay - 150); d.g.quadraticCurveTo(cx + 2, ay, cx + 14, ay + 150); d.g.lineTo(cx - 14, ay + 150); d.g.quadraticCurveTo(cx - 2, ay, cx - 14, ay - 150); }
      d.g.fillStyle = 'rgba(120,190,255,0.22)'; d.g.fill(); d.g.strokeStyle = 'rgba(160,210,255,0.8)'; d.g.lineWidth = 1.5; d.g.stroke();
      [P.f, -P.f].forEach((f, i) => { d.circle(X(f), ay, 4, C.yellow); d.text(i ? "F'" : 'F', X(f), ay + 18, C.yellow, 12, 'center'); });
      [2 * P.f, -2 * P.f].forEach((f) => d.circle(X(f), ay, 2.5, 'rgba(255,216,77,0.5)'));
      const ox = X(-P.do), oy = ay - P.ho * hs;
      d.arrow(ox, ay, ox, oy, C.orange, 4);
      const { di, m } = this.img(P), ix = X(di), iy = ay - m * P.ho * hs, fin = isFinite(di) && abs(di) < 200;
      d.clip(0, 0, 900, 560);
      const ext = (x1, y1, x2, y2, col, dash) => { const dx = x2 - x1, dy = y2 - y1, k = 2000 / (hypot(dx, dy) || 1); d.line(x1, y1, x1 + dx * k, y1 + dy * k, col, 1.6, dash); };
      const sg = Math.sign(P.f);
      d.line(ox, oy, cx, oy, C.red, 1.8);
      ext(cx, oy, cx + sg * (X(P.f) - cx), oy + sg * (ay - oy), C.red);
      if (di < 0 && fin) d.line(cx, oy, ix, iy, 'rgba(255,92,108,0.6)', 1.3, [5, 4]);
      if (!conv) d.line(cx, oy, X(P.f), ay, 'rgba(255,92,108,0.6)', 1.3, [5, 4]);
      ext(ox, oy, cx, ay, C.green);
      if (di < 0 && fin) d.line(cx, ay, ix, iy, 'rgba(74,222,128,0.6)', 1.3, [5, 4]);
      const xf = X(-P.f);
      if (abs(P.do - P.f) > 0.3 && abs(xf - ox) > 1) {
        const yl = oy + ((ay - oy) * (cx - ox)) / (xf - ox);
        if (abs(yl - ay) < 600) {
          d.line(ox, oy, cx, yl, C.cyan, 1.8);
          d.line(cx, yl, 900, yl, C.cyan, 1.8);
          if (di < 0 && fin) d.line(cx, yl, ix, yl, 'rgba(56,189,248,0.6)', 1.3, [5, 4]);
        }
      }
      d.unclip();
      if (fin) {
        const col = di > 0 ? C.purple : 'rgba(167,139,250,0.6)';
        if (di < 0) d.g.setLineDash([5, 4]);
        d.arrow(ix, ay, ix, iy, col, 4);
        d.g.setLineDash([]);
        d.text(di > 0 ? '실상' : '허상', ix, iy + (m < 0 ? 18 : -14), C.purple, 13, 'center', 'middle', true);
      } else d.label('물체가 초점에 있음 → 광선이 평행 (상 없음)', 450, 40, C.yellow, 13);
      d.text('물체', ox, ay + 20, C.orange, 12, 'center');
      d.text(conv ? '볼록 렌즈 f = ' + P.f + ' cm' : '오목 렌즈 f = ' + P.f + ' cm', cx, 110, C.cyan, 13, 'center');
      d.text('평행 광선 → 초점', 20, 500, C.red, 12); d.text('중심 광선 → 직진', 160, 500, C.green, 12); d.text('초점 광선 → 평행', 300, 500, C.cyan, 12);
    },
  });

  add({
    id: 'diffraction', cat: '광학', name: '회절과 간섭 (이중 슬릿 · 회절 격자)', en: 'Diffraction & Interference — Multiple Slits',
    tex: ['I(\\theta) = I_0\\left(\\frac{\\sin\\beta}{\\beta}\\right)^2\\left(\\frac{\\sin N\\alpha}{N\\sin\\alpha}\\right)^2', '\\alpha = \\frac{\\pi d\\sin\\theta}{\\lambda},\\qquad \\beta = \\frac{\\pi a\\sin\\theta}{\\lambda},\\qquad d\\sin\\theta = m\\lambda\\ (\\text{밝은 무늬})'],
    short: 'd\\sin\\theta = m\\lambda',
    desc: '빛이 좁은 틈(슬릿)을 지나면 퍼져 나가고(회절), 여러 슬릿에서 나온 빛이 겹치면 경로차에 따라 보강·상쇄 간섭이 일어나 스크린에 밝고 어두운 무늬가 생긴다. 영의 이중 슬릿 실험(N = 2)은 빛이 파동임을 보였다. 슬릿 수 N을 늘리면 밝은 무늬가 점점 날카로워지는데, 이것이 분광기에 쓰이는 회절 격자이다. 점선은 슬릿 하나의 폭 a에 의한 회절 포락선이다.',
    params: [R('lam', '파장 λ', 'nm', 380, 750, 1, 532), R('N', '슬릿 수 N', '개', 1, 12, 1, 2), R('dd', '슬릿 간격 d', 'μm', 2, 50, 0.5, 15), R('a', '슬릿 폭 a', 'μm', 0.5, 20, 0.1, 3), R('L', '스크린까지 거리 L', 'm', 0.5, 3, 0.1, 1)],
    fix(P) { if (P.a > P.dd * 0.95) P.a = +(P.dd * 0.95).toFixed(1); },
    I(P, y) {
      const st = y / hypot(y, P.L), al = (PI * P.dd * 1e-6 * st) / (P.lam * 1e-9), be = (PI * P.a * 1e-6 * st) / (P.lam * 1e-9);
      const env = abs(be) < 1e-9 ? 1 : (sin(be) / be) ** 2;
      const sa = sin(al), arr = abs(sa) < 1e-9 ? 1 : (sin(P.N * al) / (P.N * sa)) ** 2;
      return env * arr;
    },
    out: (P) => { const dy = ((P.lam * 1e-9 * P.L) / (P.dd * 1e-6)) * 1000; return [['밝은 무늬 간격 Δy = λL/d', dy, 'mm'], ['중앙 회절 봉우리 폭 2λL/a', ((2 * P.lam * 1e-9 * P.L) / (P.a * 1e-6)) * 1000, 'mm'], ['중앙 봉우리 안의 밝은 무늬 수', 2 * floor(P.dd / P.a) + 1, '개 (대략)'], ['1차 밝은 무늬 각도', M.deg(Math.asin(min(1, (P.lam * 1e-3) / P.dd))), '°']]; },
    sub: (P) => `\\Delta y = \\frac{\\lambda L}{d} = \\frac{(${ft(P.lam * 1e-9)})(${ft(P.L)})}{${ft(P.dd * 1e-6)}} = ${ft((P.lam * 1e-9 * P.L) / (P.dd * 1e-6))}\\ \\mathrm{m}`,
    draw(d, S, P) {
      d.clear(false);
      const Y = max((2.4 * P.lam * 1e-9 * P.L) / (P.a * 1e-6), (3.5 * P.lam * 1e-9 * P.L) / (P.dd * 1e-6)), col = PL.wl2rgb(P.lam);
      d.text('스크린에 보이는 무늬', 70, 40, C.text, 13, 'left', 'middle', true);
      for (let px = 0; px < 790; px++) { const y = -Y + (2 * Y * px) / 790, I = this.I(P, y); d.rect(70 + px, 56, 1.2, 80, PL.rgb(col, min(1, I * 1.1))); }
      d.rect(70, 56, 790, 80, null, 'rgba(255,255,255,0.2)', 1);
      const p = d.plot({ x: 70, y: 190, w: 790, h: 300, xmin: -Y * 1000, xmax: Y * 1000, ymin: 0, ymax: 1.08, title: '세기 분포 I(y)', xl: '스크린 위치 y (mm)', yl: 'I/I₀' });
      p.fn((ym) => { const st = ym / 1000 / hypot(ym / 1000, P.L), be = (PI * P.a * 1e-6 * st) / (P.lam * 1e-9); return abs(be) < 1e-9 ? 1 : (sin(be) / be) ** 2; }, 'rgba(255,255,255,0.45)', 1.5, 600, [5, 4]);
      p.fn((ym) => this.I(P, ym / 1000), PL.rgb(col), 2.5, 1500);
      d.text('슬릿 ' + P.N + '개 (간격 ' + P.dd + ' μm, 폭 ' + P.a + ' μm)', 450, 530, C.dim, 12, 'center');
    },
  });

  add({
    id: 'malus', cat: '광학', name: '말뤼스의 법칙 (편광)', en: "Malus's Law — Polarization",
    tex: ['I = I_0\\cos^2\\theta', 'I_1 = \\tfrac12 I_{\\text{편광 안 된 빛}}'],
    short: 'I = I_0\\cos^2\\theta',
    desc: '빛은 진행 방향에 수직으로 진동하는 횡파이다. 편광판은 한 방향의 진동만 통과시키므로 자연광은 처음 편광판을 지나며 세기가 절반이 되고, 두 번째 편광판에서는 두 편광축 사이 각의 cos² 만큼만 통과한다. 두 편광판을 수직(90°)으로 놓으면 빛이 완전히 차단되지만, 그 사이에 45° 편광판을 하나 끼우면 오히려 빛이 다시 나온다! 편광 선글라스와 LCD 화면의 원리이다.',
    params: [R('a', '편광판 1 각도', '°', 0, 180, 1, 0), R('c', '편광판 2 (마지막) 각도', '°', 0, 180, 1, 90), Chk('mid', '사이에 편광판 끼우기', true), R('b', '가운데 편광판 각도', '°', 0, 180, 1, 45)],
    I(P) { const I1 = 0.5; if (P.mid) { const I2 = I1 * cos(M.rad(P.b - P.a)) ** 2; return [I1, I2, I2 * cos(M.rad(P.c - P.b)) ** 2]; } return [I1, I1, I1 * cos(M.rad(P.c - P.a)) ** 2]; },
    out(P) { const I = this.I(P); return [['편광판 1 통과 후', I[0] * 100, '%'], ['가운데 편광판 통과 후', P.mid ? I[1] * 100 : '—', '%'], ['마지막 통과 후', I[2] * 100, '%'], ['가운데 판이 없을 때', 50 * cos(M.rad(P.c - P.a)) ** 2, '%']]; },
    sub(P) { return P.mid ? `I = \\tfrac12 I_0\\cos^2(${ft(P.b - P.a)}^\\circ)\\cos^2(${ft(P.c - P.b)}^\\circ) = ${ft(this.I(P)[2])}\\,I_0` : `I = \\tfrac12 I_0\\cos^2(${ft(P.c - P.a)}^\\circ) = ${ft(this.I(P)[2])}\\,I_0`; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const y0 = 230, rx = 26, ry = 80, I = this.I(P);
      const pols = [[220, P.a, I[0]], ...(P.mid ? [[450, P.b, I[1]]] : []), [680, P.c, I[2]]];
      d.line(30, y0, 880, y0, 'rgba(255,255,255,0.2)', 1);
      const seg = (x0, x1, ang, amp, rnd) => {
        for (let x = x0; x < x1; x += 6) {
          const ph = (x - S.t * 120) / 22, A = 60 * sqrt(amp) * cos(ph);
          let th = M.rad(ang);
          if (rnd) th = ((x * 13.7 + floor(S.t * 8) * 31.1) % 360) * (PI / 180);
          d.line(x, y0, x + A * sin(th) * (rx / ry), y0 - A * cos(th), rnd ? 'rgba(255,230,128,0.55)' : 'rgba(255,216,77,0.9)', 1.6);
        }
      };
      seg(30, pols[0][0] - 10, 0, 1, true);
      for (let k = 0; k < pols.length; k++) seg(pols[k][0] + 10, k + 1 < pols.length ? pols[k + 1][0] - 10 : 880, pols[k][1], pols[k][2] * 2, false);
      pols.forEach(([x, ang, Iout], k) => {
        d.g.beginPath(); d.g.ellipse(x, y0, rx, ry, 0, 0, 2 * PI); d.g.fillStyle = 'rgba(150,170,220,0.18)'; d.g.fill(); d.g.strokeStyle = '#cfd8ee'; d.g.lineWidth = 2; d.g.stroke();
        const th = M.rad(ang);
        for (let s = -3; s <= 3; s++) { const o = s * 0.13; d.line(x + (sin(th) * -1 + cos(th) * o) * rx, y0 - (cos(th) * -1 - sin(th) * o) * ry, x + (sin(th) + cos(th) * o) * rx, y0 - (cos(th) - sin(th) * o) * ry, 'rgba(207,216,238,0.35)', 1); }
        d.line(x - sin(th) * rx, y0 + cos(th) * ry, x + sin(th) * rx, y0 - cos(th) * ry, C.cyan, 3);
        d.text(ang + '°', x, y0 + ry + 18, C.cyan, 13, 'center', 'middle', true);
        d.text(fmt(Iout * 100, 3) + '%', x + 40, y0 - ry - 6, C.yellow, 12, 'center');
      });
      d.text('자연광 (모든 방향)', 40, y0 - 100, C.dim, 12);
      const p = d.plot({ x: 70, y: 380, w: 790, h: 130, xmin: 0, xmax: 180, ymin: 0, ymax: 1.05, title: '말뤼스 법칙: 두 편광판 사이 각 θ에 따른 통과율 cos²θ', xl: 'θ (°)', nx: 6, ny: 2 });
      p.fn((t) => cos(M.rad(t)) ** 2, C.yellow, 2.5);
      const dth = P.mid ? P.c - P.b : P.c - P.a, ad = ((abs(dth) % 180) + 180) % 180;
      p.dot(ad, cos(M.rad(ad)) ** 2, C.cyan);
    },
  });
})();
