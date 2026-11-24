/* =====================================================================
 * 고전역학 (2/2) — 중력 · 진동 · 파동 · 유체역학 · 해석역학
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, hypot, floor, atan2 } = Math;
  const add = (law) => PL.add('classical', law);
  const dashCircle = (d, x, y, r, col, lw = 1, dash = [4, 4]) => { d.g.setLineDash(dash); d.circle(x, y, r, null, col, lw); d.g.setLineDash([]); };

  /* ================================================================ 중력 */
  const gravF = (P) => (K.G * P.m1 * P.m2 * 1e30) / (P.r * P.r);
  add({
    id: 'gravitation', cat: '중력', name: '만유인력의 법칙', en: "Newton's Law of Universal Gravitation",
    tex: ['F = G\\frac{m_1 m_2}{r^2}', 'G = 6.674\\times10^{-11}\\ \\mathrm{N\\,m^2/kg^2}'],
    short: 'F = G\\frac{m_1m_2}{r^2}',
    desc: '질량을 가진 모든 물체는 서로 끌어당기며, 그 힘은 두 질량의 곱에 비례하고 거리의 제곱에 반비례한다. 두 천체는 크기가 같고 방향이 반대인 힘(작용·반작용)을 받으며 공통 질량중심(+)을 중심으로 함께 공전한다. 기본값은 지구-달 계이다. 거리가 2배가 되면 힘은 1/4이 된다.',
    params: [R('m1', '질량 m₁', '×10²⁴ kg', 0.1, 100, 0.01, 5.97), R('m2', '질량 m₂', '×10²² kg', 0.1, 500, 0.01, 7.35), R('r', '중심 사이 거리 r', '×10⁸ m', 1, 10, 0.01, 3.84)],
    out: (P) => {
      const F = gravF(P), M1 = P.m1 * 1e24, M2 = P.m2 * 1e22, r = P.r * 1e8;
      return [['만유인력 F', F, 'N'], ['m₁의 가속도 F/m₁', F / M1, 'm/s²'], ['m₂의 가속도 F/m₂', F / M2, 'm/s²'], ['공전 주기 2π√(r³/G(m₁+m₂))', (2 * PI * sqrt(r ** 3 / (K.G * (M1 + M2)))) / 86400, '일'], ['m₁ 중심 ~ 질량중심 거리', (r * M2) / (M1 + M2) / 1000, 'km']];
    },
    sub: (P) => `F = \\frac{(6.674\\times10^{-11})(${ft(P.m1 * 1e24)})(${ft(P.m2 * 1e22)})}{(${ft(P.r * 1e8)})^2} = ${ft(gravF(P))}\\ \\mathrm{N}`,
    init(S) { S.ph = 0.4; },
    step(S, P, dt) { S.ph += (2 * PI * dt) / 8; },
    draw(d, S, P) {
      d.clear();
      const M1 = P.m1 * 1e24, M2 = P.m2 * 1e22, cx = 300, cy = 290, sc = 27;
      const r1 = (P.r * M2) / (M1 + M2), r2 = (P.r * M1) / (M1 + M2);
      dashCircle(d, cx, cy, r1 * sc, 'rgba(90,160,255,0.35)');
      dashCircle(d, cx, cy, r2 * sc, 'rgba(200,210,230,0.3)');
      const ux = cos(S.ph), uy = sin(S.ph);
      const X1 = cx - r1 * sc * ux, Y1 = cy + r1 * sc * uy, X2 = cx + r2 * sc * ux, Y2 = cy - r2 * sc * uy;
      const R1 = 8 + 16 * Math.cbrt(P.m1 / 100), R2 = 4 + 11 * Math.cbrt(P.m2 / 500);
      d.glow(X1, Y1, R1 * 2.4, 'rgba(90,160,255,0.35)');
      d.ball(X1, Y1, R1, '#4d8bff');
      d.ball(X2, Y2, R2, '#c9cfdc');
      const F = gravF(P), L = M.clamp(20 + (Math.log10(F) - 15) * 12, 16, 140);
      const dx = X2 - X1, dy = Y2 - Y1, dd = hypot(dx, dy) || 1, ex = dx / dd, ey = dy / dd;
      d.arrow(X1 + ex * R1, Y1 + ey * R1, X1 + ex * (R1 + L), Y1 + ey * (R1 + L), C.red, 3);
      d.arrow(X2 - ex * R2, Y2 - ey * R2, X2 - ex * (R2 + L), Y2 - ey * (R2 + L), C.red, 3);
      d.line(cx - 6, cy, cx + 6, cy, C.yellow, 2);
      d.line(cx, cy - 6, cx, cy + 6, C.yellow, 2);
      d.text('질량중심', cx + 9, cy + 14, C.yellow, 11);
      d.text('m₁', X1, Y1 - R1 - 10, C.cyan, 13, 'center');
      d.text('m₂', X2, Y2 - R2 - 10, C.text, 13, 'center');
      d.text('두 힘은 크기가 같고 방향이 반대 (작용·반작용)', 20, 30, C.red, 12);
      const Fr = (r) => (K.G * P.m1 * P.m2 * 1e30) / (r * r);
      const p = d.plot({ x: 620, y: 60, w: 250, h: 250, xmin: 0, xmax: 10, ymin: 0, ymax: Fr(1) * 1.05, title: '거리에 따른 힘 F ∝ 1/r²', xl: 'r (×10⁸ m)', yl: 'F (N)' });
      p.fn(Fr, C.red, 2.5, 300, null, 1, 10);
      p.dot(P.r, Fr(P.r), C.red);
      if (2 * P.r <= 10) { p.dot(2 * P.r, Fr(2 * P.r), C.yellow, 4); p.label('2r → F/4', 2 * P.r + 0.25, Fr(2 * P.r) + Fr(1) * 0.07, C.yellow, 11); }
      d.text('F = ' + fmt(F) + ' N', 620, 380, C.red, 15, 'left', 'middle', true);
      d.text('(공전 운동은 실제보다 빠르게 표시)', 620, 405, C.dim, 11);
    },
  });

  const PLANETS = [['수성', 0.387], ['금성', 0.723], ['지구', 1], ['화성', 1.524], ['목성', 5.203], ['토성', 9.537]];
  const keplerE = (Mm, e) => {
    let E = e < 0.8 ? Mm : PI;
    for (let i = 0; i < 40; i++) { const dE = (E - e * sin(E) - Mm) / (1 - e * cos(E)); E -= dE; if (abs(dE) < 1e-12) break; }
    return E;
  };
  add({
    id: 'kepler', cat: '중력', name: '케플러의 행성 운동 법칙', en: "Kepler's Laws of Planetary Motion",
    tex: ['\\text{제1법칙: 행성은 태양을 한 초점으로 하는 타원 궤도를 돈다}', '\\text{제2법칙: } \\frac{dA}{dt} = \\frac{L}{2m} = \\text{일정}', '\\text{제3법칙: } T^2 = \\frac{4\\pi^2}{GM}a^3'],
    short: 'T^2 = \\frac{4\\pi^2}{GM}a^3',
    desc: '행성은 타원 궤도를 돌고(1법칙), 태양과 행성을 잇는 선은 같은 시간 동안 같은 넓이를 쓸고 지나간다(2법칙) — 그래서 태양에 가까울 때 빠르고 멀 때 느리다. 색칠된 12개의 부채꼴은 모두 공전 주기의 1/12 동안 쓴 넓이로, 모양은 달라도 넓이가 같다. 주기의 제곱은 긴반지름의 세제곱에 비례한다(3법칙, 오른쪽 아래 로그 그래프). 1년을 4초로 표시한다.',
    params: [R('a', '긴반지름 a', 'AU', 0.3, 6, 0.01, 1.5), R('e', '이심률 e', '', 0, 0.9, 0.01, 0.6), R('M', '항성 질량 M', 'M☉', 0.5, 3, 0.1, 1)],
    out: (P) => {
      const T = Math.pow(P.a, 1.5) / sqrt(P.M), v = (r) => 29.78 * sqrt(P.M * (2 / r - 1 / P.a));
      return [['공전 주기 T', T, '년'], ['근일점 거리 a(1−e)', P.a * (1 - P.e), 'AU'], ['원일점 거리 a(1+e)', P.a * (1 + P.e), 'AU'], ['근일점 속력', v(P.a * (1 - P.e)), 'km/s'], ['원일점 속력', v(P.a * (1 + P.e)), 'km/s'], ['T²/a³ (= 1/M)', (T * T) / P.a ** 3, '년²/AU³']];
    },
    sub: (P) => `T = \\sqrt{\\frac{a^3}{M}} = \\sqrt{\\frac{(${ft(P.a)})^3}{${ft(P.M)}}} = ${ft(Math.pow(P.a, 1.5) / sqrt(P.M))}\\ \\text{년}`,
    init(S) { S.tau = 0; },
    step(S, P, dt) { S.tau = (S.tau + dt / ((4 * Math.pow(P.a, 1.5)) / sqrt(P.M))) % 1; },
    draw(d, S, P) {
      d.clear();
      const b = P.a * sqrt(1 - P.e * P.e), s = min(265 / P.a, 225 / b), cx = 320, cy = 285, sunX = cx + P.a * P.e * s;
      const pos = (E) => [sunX + P.a * (cos(E) - P.e) * s, cy - b * sin(E) * s];
      const Ek = [];
      for (let k = 0; k <= 12; k++) Ek.push(k === 12 ? 2 * PI : keplerE((2 * PI * k) / 12, P.e));
      const En = keplerE(2 * PI * S.tau, P.e), kc = floor(S.tau * 12);
      for (let k = 0; k < 12; k++) {
        const pts = [[sunX, cy]];
        for (let i = 0; i <= 16; i++) pts.push(pos(Ek[k] + ((Ek[k + 1] - Ek[k]) * i) / 16));
        d.poly(pts, 'rgba(10,16,32,0.6)', 0.6, true, k === kc ? 'rgba(255,216,77,0.38)' : k % 2 ? 'rgba(167,139,250,0.17)' : 'rgba(56,189,248,0.14)');
      }
      const op = [];
      for (let i = 0; i <= 200; i++) op.push(pos((2 * PI * i) / 200));
      d.poly(op, 'rgba(200,210,240,0.75)', 1.5);
      const sr = 10 + 4 * P.M;
      d.glow(sunX, cy, sr * 3.2, 'rgba(255,190,70,0.5)');
      d.ball(sunX, cy, sr, '#ffcc4d');
      if (P.e > 0.02) { d.circle(cx - P.a * P.e * s, cy, 3, null, C.dim, 1); d.text('빈 초점', cx - P.a * P.e * s, cy + 14, C.dim, 10, 'center'); }
      const [px, py] = pos(En), r = P.a * (1 - P.e * cos(En)), v = sqrt(P.M * (2 / r - 1 / P.a));
      d.line(sunX, cy, px, py, 'rgba(255,216,77,0.7)', 1.5);
      let tx = -P.a * sin(En) * s, ty = -b * cos(En) * s;
      const tn = hypot(tx, ty) || 1; tx /= tn; ty /= tn;
      d.arrow(px, py, px + tx * v * 38, py + ty * v * 38, C.green, 2.5);
      d.ball(px, py, 8, C.cyan);
      d.text(fmt(29.78 * v, 3) + ' km/s', px + 12, py - 14, C.green, 12);
      d.text('근일점', sunX + P.a * (1 - P.e) * s + 8, cy - 10, C.dim, 11);
      d.text('원일점', cx - P.a * s - 8, cy - 10, C.dim, 11, 'right');
      d.text('각 부채꼴 = 주기의 1/12 동안 쓴 넓이 (모두 같음)', 20, 28, C.yellow, 12);
      const p = d.plot({ x: 640, y: 300, w: 230, h: 200, xmin: 0.2, xmax: 12, ymin: 0.05, ymax: 60, xlog: true, ylog: true, title: '제3법칙: T² ∝ a³ (로그-로그)', xl: 'a (AU)', yl: 'T (년)' });
      p.fn((a) => Math.pow(a, 1.5), 'rgba(255,216,77,0.6)', 1.5);
      if (abs(P.M - 1) > 0.01) p.fn((a) => Math.pow(a, 1.5) / sqrt(P.M), 'rgba(56,189,248,0.7)', 1.5, 100, [4, 4]);
      PLANETS.forEach(([n, a]) => { p.dot(a, Math.pow(a, 1.5), '#9aa6c4', 3.5); p.label(n, a * 1.15, Math.pow(a, 1.5) * 0.72, C.dim, 10); });
      p.dot(P.a, Math.pow(P.a, 1.5) / sqrt(P.M), C.cyan, 5.5);
    },
  });

  add({
    id: 'orbit', cat: '중력', name: '궤도 속도와 탈출 속도 (뉴턴의 대포)', en: "Orbital & Escape Velocity — Newton's Cannon",
    tex: ['v_{\\text{원}} = \\sqrt{\\frac{GM}{r}},\\qquad v_{\\text{탈출}} = \\sqrt{\\frac{2GM}{r}}', '\\tfrac12 mv^2 - \\frac{GMm}{r} \\ge 0 \\;\\Longrightarrow\\; \\text{탈출}'],
    short: 'v_{\\text{탈출}} = \\sqrt{2GM/r}',
    desc: '뉴턴은 아주 높은 산 위에서 대포를 수평으로 쏘는 사고 실험을 했다. 느리면 땅에 떨어지지만, 속력이 원 궤도 속도에 이르면 지구 표면이 휘어지는 만큼 계속 떨어지며 영원히 돈다(인공위성). 더 빠르면 타원 궤도, 탈출 속도 이상이면 다시 돌아오지 않는다. 값을 바꾸면 이전 궤적이 흐리게 남는다.',
    params: [R('v', '발사 속력 v', 'km/s', 1, 14, 0.05, 7.55), R('h', '발사 고도 h', 'km', 100, 3000, 10, 600), R('Mm', '행성 질량 (지구 = 1)', '', 0.2, 3, 0.05, 1)],
    el(P) {
      const mu = K.G * K.Mearth * P.Mm, r0 = K.Rearth + P.h * 1e3, v0 = P.v * 1e3, eps = (v0 * v0) / 2 - mu / r0;
      const o = { mu, r0, vc: sqrt(mu / r0), ve: sqrt((2 * mu) / r0), bound: eps < 0 };
      if (o.bound) {
        const a = -mu / (2 * eps), r2 = 2 * a - r0;
        o.a = a; o.rp = min(r0, r2); o.ra = max(r0, r2); o.T = 2 * PI * sqrt((a * a * a) / mu);
        o.type = o.rp < K.Rearth ? '지표에 떨어짐 (탄도 궤적)' : abs(v0 - o.vc) / o.vc < 0.004 ? '원 궤도' : '타원 궤도';
      } else o.type = '탈출 (포물선·쌍곡선 궤도)';
      return o;
    },
    out(P) {
      const o = this.el(P);
      return [['원 궤도 속도 √(GM/r)', o.vc / 1e3, 'km/s'], ['탈출 속도 √(2GM/r)', o.ve / 1e3, 'km/s'], ['궤도 종류', o.type, ''], ['공전 주기', o.bound && o.rp >= K.Rearth ? o.T / 60 : '—', '분'], ['근지점 고도', o.bound ? (o.rp - K.Rearth) / 1e3 : P.h, 'km'], ['원지점 고도', o.bound ? (o.ra - K.Rearth) / 1e3 : Infinity, 'km']];
    },
    init(S, P) { S.ghosts = []; this.launch(S, P); },
    launch(S, P) { S.y = [0, K.Rearth + P.h * 1e3, P.v * 1e3, 0]; S.trail = []; S.state = 'fly'; S.wait = 0; S.tt = 0; },
    change(S, P) {
      if (S.trail.length > 10 && S.tt > 0.5) { S.ghosts.push(S.trail); if (S.ghosts.length > 5) S.ghosts.shift(); }
      this.launch(S, P);
    },
    step(S, P, dt) {
      if (S.state !== 'fly') { S.wait += dt; if (S.wait > 1.5) this.launch(S, P); return; }
      S.tt += dt;
      const mu = K.G * K.Mearth * P.Mm;
      const f = (t, y) => { const r = hypot(y[0], y[1]), a = -mu / (r * r * r); return [y[2], y[3], a * y[0], a * y[1]]; };
      let rem = dt * 900;
      while (rem > 0) {
        const h = min(4, rem);
        S.y = M.rk4(f, S.y, 0, h);
        rem -= h;
        const r = hypot(S.y[0], S.y[1]);
        if (r <= K.Rearth) { const k = K.Rearth / r; S.y[0] *= k; S.y[1] *= k; S.state = 'crash'; break; }
        if (r > 9 * K.Rearth) { S.state = 'escape'; break; }
      }
      S.trail.push([S.y[0], S.y[1]]);
      if (S.trail.length > 5000) S.trail.shift();
    },
    draw(d, S, P) {
      d.clear(false, '#050816');
      for (let i = 0; i < 70; i++) d.circle((i * 397) % 900, (i * 211) % 560, (i % 3) * 0.5 + 0.5, 'rgba(255,255,255,0.4)');
      const cx = 450, cy = 285, Rp = 105, s = Rp / K.Rearth, toS = (p) => [cx + p[0] * s, cy - p[1] * s];
      d.glow(cx, cy, Rp * 1.3, 'rgba(80,160,255,0.35)');
      const g = d.g, gr = g.createRadialGradient(cx - 30, cy - 40, 10, cx, cy, Rp);
      gr.addColorStop(0, '#6fb4ff'); gr.addColorStop(0.7, '#1f5fb8'); gr.addColorStop(1, '#0f2f66');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, Rp, 0, 7); g.fill();
      d.circle(cx - 30, cy + 10, 26, 'rgba(74,170,110,0.55)'); d.circle(cx + 35, cy - 30, 18, 'rgba(74,170,110,0.5)'); d.circle(cx + 20, cy + 45, 14, 'rgba(74,170,110,0.45)');
      const r0 = K.Rearth + P.h * 1e3, o = this.el(P);
      dashCircle(d, cx, cy, r0 * s, 'rgba(74,222,128,0.25)', 1, [3, 5]);
      d.poly([[cx - 22, cy - Rp + 3], [cx, cy - r0 * s + 2], [cx + 22, cy - Rp + 3]], null, 0, true, 'rgba(140,120,100,0.85)');
      d.rect(cx - 9, cy - r0 * s - 5, 20, 8, '#cfd8ee', null, 0, 2);
      S.ghosts.forEach((tr, i) => d.poly(tr.map(toS), `rgba(167,139,250,${0.2 + 0.08 * i})`, 1.5));
      d.poly(S.trail.map(toS), C.yellow, 2);
      const [X, Y] = toS(S.y);
      d.ball(X, Y, 5, C.orange);
      if (S.state === 'crash') d.label('지표에 충돌', X, Y - 20, C.red, 12);
      if (S.state === 'escape') d.label('탈출!', X, Y - 20, C.green, 12);
      d.text('궤도 종류: ' + o.type, 20, 28, C.yellow, 13, 'left', 'middle', true);
      const pl = d.plot({ x: 60, y: 505, w: 780, h: 14, xmin: 0, xmax: 14, ymin: 0, ymax: 1, grid: false, yticks: false, nx: 7 });
      const vc = o.vc / 1e3, ve = o.ve / 1e3;
      d.rect(pl.X(0), 505, pl.X(vc) - pl.X(0), 14, 'rgba(255,92,108,0.35)');
      d.rect(pl.X(vc), 505, pl.X(min(ve, 14)) - pl.X(vc), 14, 'rgba(56,189,248,0.35)');
      if (ve < 14) d.rect(pl.X(ve), 505, pl.X(14) - pl.X(ve), 14, 'rgba(74,222,128,0.35)');
      pl.vl(vc, C.cyan, null, 2); pl.vl(min(ve, 14), C.green, null, 2);
      d.text('원 궤도 ' + fmt(vc, 3), pl.X(vc), 496, C.cyan, 11, 'center');
      if (ve < 14) d.text('탈출 ' + fmt(ve, 3), pl.X(ve), 496, C.green, 11, 'center');
      d.poly([[pl.X(P.v), 503], [pl.X(P.v) - 6, 493], [pl.X(P.v) + 6, 493]], null, 0, true, C.yellow);
      d.text('발사 속력 (km/s)', 60, 488, C.dim, 11);
    },
  });

  /* ================================================================ 진동 */
  add({
    id: 'shm', cat: '진동', name: '훅의 법칙과 단순 조화 운동', en: "Hooke's Law & Simple Harmonic Motion",
    tex: ['F = -kx', 'x(t) = A\\cos\\omega t,\\qquad \\omega = \\sqrt{\\frac{k}{m}},\\qquad T = 2\\pi\\sqrt{\\frac{m}{k}}'],
    short: 'F = -kx',
    desc: '용수철의 복원력은 변위에 비례하고 방향은 반대이다(훅의 법칙). 이런 힘을 받는 물체는 사인 함수 모양으로 진동하는 단순 조화 운동을 하며, 주기는 진폭과 무관하고 질량과 용수철 상수로만 정해진다. 아래는 물체의 위치를 시간에 따라 기록한 그래프(위가 현재)이고, 맨 위 막대는 운동 에너지와 탄성 퍼텐셜 에너지의 교환을 보여 준다.',
    params: [R('k', '용수철 상수 k', 'N/m', 1, 100, 1, 20), R('m', '질량 m', 'kg', 0.1, 10, 0.1, 1), R('A', '진폭 A', 'm', 0.1, 1, 0.05, 0.6, { reset: 1 })],
    out: (P, S) => {
      const w = sqrt(P.k / P.m), x = P.A * cos(S.ph), v = -P.A * w * sin(S.ph);
      return [['각진동수 ω = √(k/m)', w, 'rad/s'], ['주기 T = 2π√(m/k)', (2 * PI) / w, 's'], ['진동수 f', w / (2 * PI), 'Hz'], ['최대 속력 Aω', P.A * w, 'm/s'], ['역학적 에너지 ½kA²', 0.5 * P.k * P.A * P.A, 'J'], ['현재 복원력 −kx', -P.k * x, 'N'], ['현재 속도', v, 'm/s']];
    },
    sub: (P) => `T = 2\\pi\\sqrt{\\frac{${ft(P.m)}}{${ft(P.k)}}} = ${ft(2 * PI * sqrt(P.m / P.k))}\\ \\mathrm{s}`,
    init(S) { S.ph = 0; S.hist = []; },
    step(S, P, dt) {
      S.t += dt; S.ph += sqrt(P.k / P.m) * dt;
      S.hist.push([S.t, P.A * cos(S.ph)]);
      if (S.hist.length > 400) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const w = sqrt(P.k / P.m), x = P.A * cos(S.ph), v = -P.A * w * sin(S.ph), X0 = 450, sc = 280, gy = 190;
      d.wall(70, 80, gy, C.dim, -1);
      d.ground(70, 880, gy);
      const Xb = X0 + x * sc;
      d.spring(70, gy - 30, Xb - 35, gy - 30, 14, 12, '#b8c3dd', 2);
      d.rect(Xb - 35, gy - 60, 70, 60, C.orange, '#ffd2a0', 1.5, 6);
      d.text(fmt(P.m) + ' kg', Xb, gy - 30, '#2a1606', 12, 'center', 'middle', true);
      const Fl = -(x / P.A) * 110;
      if (abs(Fl) > 2) d.arrow(Xb, gy - 76, Xb + Fl, gy - 76, C.red, 3);
      d.text('F = −kx = ' + fmt(-P.k * x, 3) + ' N', Xb, gy - 94, C.red, 12, 'center');
      const vl = (v / (P.A * w)) * 90;
      if (abs(vl) > 2) d.arrow(Xb, gy + 14, Xb + vl, gy + 14, C.green, 3);
      d.line(X0, 70, X0, 545, 'rgba(255,255,255,0.18)', 1, [4, 4]);
      d.text('평형 위치', X0, 64, C.dim, 11, 'center');
      const top = 228, pps = 62;
      d.rect(X0 - P.A * sc, top, 2 * P.A * sc, 320, 'rgba(255,255,255,0.025)');
      for (let k = 1; k <= 5; k++) { const Y = top + k * pps; d.line(80, Y, 820, Y, 'rgba(140,160,210,0.08)', 1); d.text(k + ' s 전', 830, Y, C.faint, 10); }
      const pts = S.hist.map((h) => [X0 + h[1] * sc, top + (S.t - h[0]) * pps]).filter((p) => p[1] < 550);
      d.poly(pts, C.cyan, 2.5);
      d.circle(Xb, top, 5, C.cyan);
      d.text('위치 기록 x(t) ↓ 시간', 90, top + 12, C.cyan, 12);
      const Kk = 0.5 * P.m * v * v, E = 0.5 * P.k * P.A * P.A, bw = 300, bx = 560;
      d.text('에너지', bx - 8, 30, C.text, 12, 'right');
      d.rect(bx, 22, bw * (Kk / E), 16, C.green);
      d.rect(bx + bw * (Kk / E), 22, bw * (1 - Kk / E), 16, C.blue);
      d.text('운동 K', bx + 4, 48, C.green, 11); d.text('탄성 퍼텐셜 U = ½kx²', bx + bw, 48, C.blue, 11, 'right');
    },
  });

  add({
    id: 'pendulum', cat: '진동', name: '단진자', en: 'Simple Pendulum',
    tex: ['\\ddot\\theta = -\\frac{g}{L}\\sin\\theta', 'T \\approx 2\\pi\\sqrt{\\frac{L}{g}}\\quad(\\text{작은 진폭}),\\qquad T = 4\\sqrt{\\frac{L}{g}}\\,K\\!\\left(\\sin\\frac{\\theta_0}{2}\\right)'],
    short: 'T = 2\\pi\\sqrt{L/g}',
    desc: '진자의 운동 방정식에는 sinθ가 들어 있어 정확히는 비선형이지만, 진폭이 작으면 sinθ ≈ θ로 근사되어 주기가 진폭과 무관해진다(진자의 등시성, 갈릴레이). 흐린 보라색 진자는 작은 각 근사 모델이며, 진폭을 크게 할수록 실제 진자의 주기가 길어져 점점 뒤처진다. 정확한 주기는 완전 타원 적분 K로 주어진다.',
    params: [R('L', '줄의 길이 L', 'm', 0.2, 3, 0.05, 1.5, { reset: 1 }), R('g', '중력 가속도 g', 'm/s²', 1, 25, 0.01, 9.81, { reset: 1 }), R('th0', '처음 각도 θ₀', '°', 1, 175, 1, 40, { reset: 1 }), Chk('ghost', '작은 각 근사 진자 함께 보기', true)],
    out: (P, S) => {
      const T0 = 2 * PI * sqrt(P.L / P.g), T = 4 * sqrt(P.L / P.g) * M.ellipKE(sin(M.rad(P.th0) / 2))[0];
      return [['근사 주기 2π√(L/g)', T0, 's'], ['정확한 주기', T, 's'], ['근사의 오차', (T / T0 - 1) * 100, '%'], ['최저점 속력 √(2gL(1−cosθ₀))', sqrt(2 * P.g * P.L * (1 - cos(M.rad(P.th0)))), 'm/s'], ['현재 각도 θ', M.deg(S.y[0]), '°']];
    },
    sub: (P) => `T \\approx 2\\pi\\sqrt{\\frac{${ft(P.L)}}{${ft(P.g)}}} = ${ft(2 * PI * sqrt(P.L / P.g))}\\ \\mathrm{s}`,
    init(S, P) { S.y = [M.rad(P.th0), 0]; S.hist = []; },
    step(S, P, dt) {
      const f = (t, y) => [y[1], -(P.g / P.L) * sin(y[0])];
      for (let i = 0; i < 8; i++) S.y = M.rk4(f, S.y, 0, dt / 8);
      S.t += dt;
      S.hist.push([S.t, M.deg(S.y[0]), P.th0 * cos(sqrt(P.g / P.L) * S.t)]);
      if (S.hist.length > 700) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const up = max(0, -cos(M.rad(P.th0))), sc = min(150, 470 / (P.L * (1 + up))), Lp = P.L * sc, px = 280, py = 40 + up * Lp;
      d.g.setLineDash([3, 5]);
      d.arc(px, py, Lp, PI / 2 - M.rad(P.th0), PI / 2 + M.rad(P.th0), 'rgba(255,255,255,0.18)', 1);
      d.g.setLineDash([]);
      if (P.ghost) {
        const tl = M.rad(P.th0) * cos(sqrt(P.g / P.L) * S.t), gx = px + Lp * sin(tl), gyy = py + Lp * cos(tl);
        d.line(px, py, gx, gyy, 'rgba(167,139,250,0.45)', 1.5);
        d.circle(gx, gyy, 13, 'rgba(167,139,250,0.3)', 'rgba(167,139,250,0.8)', 1.5);
      }
      const th = S.y[0], bx = px + Lp * sin(th), by = py + Lp * cos(th);
      d.line(px - 50, py, px + 50, py, '#9aa6c4', 4);
      d.line(px, py, bx, by, '#cfd8ee', 2);
      d.ball(bx, by, 14, C.orange);
      const fl = -sin(th) * 70;
      if (abs(fl) > 2) d.arrow(bx, by, bx + fl * cos(th), by - fl * sin(th), C.red, 3);
      d.text('복원력 mg sinθ', 20, 28, C.red, 12);
      if (P.ghost) d.text('작은 각 근사 (선형)', 20, 48, C.purple, 12);
      const t1 = max(10, S.t), p = d.plot({ x: 570, y: 50, w: 300, h: 200, xmin: t1 - 10, xmax: t1, ymin: -P.th0 * 1.15, ymax: P.th0 * 1.15, title: '각도 θ(t) (°)', xl: 't (s)', yl: 'θ' });
      if (P.ghost) p.pts(S.hist.map((h) => [h[0], h[2]]), 'rgba(167,139,250,0.8)', 1.5, [5, 4]);
      p.pts(S.hist.map((h) => [h[0], h[1]]), C.orange, 2.5);
      const p2 = d.plot({ x: 570, y: 320, w: 300, h: 190, xmin: 0, xmax: 180, ymin: 1, ymax: 3, title: '진폭에 따른 주기 T/T₀', xl: 'θ₀ (°)', yl: 'T/T₀', nx: 6 });
      p2.fn((a) => (2 / PI) * M.ellipKE(sin(M.rad(min(a, 179.5)) / 2))[0], C.yellow, 2, 200, null, 0, 179.5);
      p2.dot(P.th0, (2 / PI) * M.ellipKE(sin(M.rad(P.th0) / 2))[0], C.yellow);
    },
  });

  add({
    id: 'resonance', cat: '진동', name: '감쇠 진동과 공명', en: 'Damped Driven Oscillator & Resonance',
    tex: ['m\\ddot x + b\\dot x + kx = F_0\\cos\\omega t', 'A(\\omega) = \\frac{F_0/m}{\\sqrt{(\\omega_0^2 - \\omega^2)^2 + (b\\omega/m)^2}},\\qquad \\omega_0 = \\sqrt{k/m}'],
    short: 'A(\\omega) = \\frac{F_0/m}{\\sqrt{(\\omega_0^2-\\omega^2)^2 + (b\\omega/m)^2}}',
    desc: '주기적인 외력으로 진동자를 흔들면 처음엔 불규칙한 과도 진동이 나타나다가, 결국 외력과 같은 진동수로 진동하는 정상 상태가 된다. 외력의 진동수가 고유 진동수 ω₀ = √(k/m)에 가까우면 진폭이 크게 커지는 공명이 일어나며, 감쇠가 작을수록 공명 봉우리가 높고 뾰족하다. 다리, 건물, 악기, 라디오 수신기가 모두 이 원리와 관련된다.',
    params: [R('m', '질량 m', 'kg', 0.5, 5, 0.1, 1), R('k', '용수철 상수 k', 'N/m', 1, 50, 0.5, 16), R('b', '감쇠 계수 b', 'kg/s', 0, 5, 0.05, 0.5), R('F0', '외력 진폭 F₀', 'N', 0, 10, 0.1, 2), R('w', '외력 각진동수 ω', 'rad/s', 0.2, 10, 0.05, 3)],
    amp: (P, w) => P.F0 / P.m / sqrt((P.k / P.m - w * w) ** 2 + ((P.b * w) / P.m) ** 2),
    out(P, S) {
      const w0 = sqrt(P.k / P.m);
      return [['고유 각진동수 ω₀', w0, 'rad/s'], ['정상 상태 진폭 A(ω)', this.amp(P, P.w), 'm'], ['측정된 진폭 (최근 한 주기)', S.amp, 'm'], ['감쇠비 ζ = b/(2√(mk))', P.b / (2 * sqrt(P.m * P.k)), ''], ['Q 인자 √(mk)/b', P.b > 0 ? sqrt(P.m * P.k) / P.b : Infinity, ''], ['위상 지연 δ', M.deg(atan2((P.b * P.w) / P.m, P.k / P.m - P.w * P.w)), '°']];
    },
    sub(P) { return `A = \\frac{${ft(P.F0)}/${ft(P.m)}}{\\sqrt{(${ft(P.k / P.m)} - ${ft(P.w * P.w)})^2 + (${ft((P.b * P.w) / P.m)})^2}} = ${ft(this.amp(P, P.w))}\\ \\mathrm{m}`; },
    init(S) { S.y = [0, 0]; S.hist = []; S.amp = 0; },
    step(S, P, dt) {
      const f = (t, y) => [y[1], (P.F0 * cos(P.w * t) - P.b * y[1] - P.k * y[0]) / P.m];
      const n = 10, h = dt / n;
      for (let i = 0; i < n; i++) { S.y = M.rk4(f, S.y, S.t, h); S.t += h; }
      if (abs(S.y[0]) > 50) S.y = [M.clamp(S.y[0], -50, 50), 0];
      S.hist.push([S.t, S.y[0]]);
      if (S.hist.length > 900) S.hist.shift();
      const Tw = (2 * PI) / P.w;
      let mx = 0;
      for (let i = S.hist.length - 1; i >= 0 && S.hist[i][0] > S.t - Tw * 1.05; i--) mx = max(mx, abs(S.hist[i][1]));
      S.amp = mx;
    },
    draw(d, S, P) {
      d.clear();
      const w0 = sqrt(P.k / P.m), wr = sqrt(max(0.04, w0 * w0 - (P.b * P.b) / (2 * P.m * P.m)));
      const peak = min(this.amp(P, wr), 3), lim = max(0.3, peak) * 1.2, ysc = 165 / lim;
      const Y0 = 285, Yb = M.clamp(Y0 + S.y[0] * ysc, 110, 470);
      d.rect(70, 44, 140, 12, '#5d6b8f');
      d.spring(140, 56, 140, Yb - 24, 12, 14, '#b8c3dd', 2);
      d.rect(110, Yb - 24, 60, 48, C.orange, '#ffd2a0', 1.5, 6);
      d.line(60, Y0, 220, Y0, 'rgba(255,255,255,0.2)', 1, [4, 4]);
      const Ft = P.F0 * cos(P.w * S.t);
      if (abs(Ft) > 0.05) d.arrow(200, Yb, 200, Yb + Ft * 12, C.purple, 3);
      d.text('외력 F₀cosωt', 214, Yb, C.purple, 11);
      const t1 = max(12, S.t), p = d.plot({ x: 330, y: 50, w: 540, h: 200, xmin: t1 - 12, xmax: t1, ymin: -lim, ymax: lim, title: '변위 x(t) — 과도 진동 후 정상 상태', xl: 't (s)', yl: 'x (m)' });
      p.pts(S.hist, C.orange, 2);
      const As = this.amp(P, P.w);
      p.hl(As, 'rgba(74,222,128,0.5)'); p.hl(-As, 'rgba(74,222,128,0.5)');
      const wm = 10, am = max(...M.linspace(0.2, wm, 200).map((w) => this.amp(P, w)));
      const p2 = d.plot({ x: 330, y: 320, w: 540, h: 190, xmin: 0, xmax: wm, ymin: 0, ymax: min(am, 8) * 1.1 || 1, title: '공명 곡선: 정상 상태 진폭 A(ω)', xl: 'ω (rad/s)', yl: 'A (m)' });
      p2.area((w) => this.amp(P, w), 'rgba(56,189,248,0.12)', 0.05, wm);
      p2.fn((w) => this.amp(P, w), C.cyan, 2.5, 400, null, 0.05, wm);
      p2.vl(w0, C.yellow); p2.label('ω₀', w0 + 0.1, min(am, 8) * 1.02, C.yellow, 11);
      p2.vl(P.w, C.orange, null, 2);
      p2.dot(P.w, As, C.orange);
      if (S.amp > 0) p2.dot(P.w, min(S.amp, p2.ymax), C.green, 3.5);
    },
  });

  /* ================================================================ 파동 */
  add({
    id: 'travelwave', cat: '파동', name: '진행파와 파동 방정식', en: 'Traveling Waves & the Wave Equation',
    tex: ['\\frac{\\partial^2 y}{\\partial t^2} = v^2\\frac{\\partial^2 y}{\\partial x^2}', 'y(x,t) = A\\sin(kx - \\omega t),\\qquad v = f\\lambda = \\frac{\\omega}{k}'],
    short: 'v = f\\lambda',
    desc: '파동은 매질의 각 점이 제자리에서 진동하면서 모양과 에너지만 전달되는 현상이다. 빨간 점은 위아래로만 움직이지만 마루(▼)는 v = fλ의 속력으로 나아간다. 파장을 늘리거나 진동수를 높이면 전파 속력이 커진다. 아래 그래프는 빨간 점 하나의 시간에 따른 변위로, 한 번 진동하는 데 주기 T = 1/f가 걸린다.',
    params: [R('A', '진폭 A', 'm', 0.1, 1, 0.05, 0.6), R('lam', '파장 λ', 'm', 0.5, 5, 0.1, 2.5), R('f', '진동수 f', 'Hz', 0.1, 2, 0.05, 0.5), Sel('dir', '진행 방향', [[1, '오른쪽 →'], [-1, '← 왼쪽']], 1)],
    out: (P) => [['전파 속력 v = fλ', P.f * P.lam, 'm/s'], ['주기 T = 1/f', 1 / P.f, 's'], ['파수 k = 2π/λ', (2 * PI) / P.lam, 'rad/m'], ['각진동수 ω = 2πf', 2 * PI * P.f, 'rad/s'], ['매질 입자의 최대 속력 Aω', P.A * 2 * PI * P.f, 'm/s']],
    sub: (P) => `v = f\\lambda = (${ft(P.f)})(${ft(P.lam)}) = ${ft(P.f * P.lam)}\\ \\mathrm{m/s}`,
    init(S) { S.ph = 0; S.hist = []; },
    step(S, P, dt) {
      S.t += dt; S.ph += 2 * PI * P.f * dt;
      S.hist.push([S.t, P.A * sin(((2 * PI) / P.lam) * 3 - P.dir * S.ph)]);
      if (S.hist.length > 600) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const k = (2 * PI) / P.lam, X = (x) => 60 + x * 78, y0 = 200, ys = 110;
      const Y = (x) => P.A * sin(k * x - P.dir * S.ph);
      d.line(60, y0, 840, y0, 'rgba(255,255,255,0.15)', 1, [4, 4]);
      const pts = [];
      for (let i = 0; i <= 300; i++) { const x = (10 * i) / 300; pts.push([X(x), y0 - Y(x) * ys]); }
      d.poly(pts, '#7fa3ff', 2.5);
      for (let i = 0; i <= 50; i++) { const x = i * 0.2; d.circle(X(x), y0 - Y(x) * ys, 3, '#c8d4f5'); }
      const xc0 = (PI / 2 + P.dir * S.ph) / k, crests = [];
      for (let n = Math.ceil(-xc0 / P.lam); xc0 + n * P.lam <= 10; n++) crests.push(xc0 + n * P.lam);
      crests.forEach((c) => d.poly([[X(c), y0 - P.A * ys - 10], [X(c) - 6, y0 - P.A * ys - 20], [X(c) + 6, y0 - P.A * ys - 20]], null, 0, true, C.yellow));
      const c0 = crests.find((c) => c + P.lam <= 10);
      if (c0 != null) {
        const yb = y0 - P.A * ys - 34;
        d.line(X(c0), yb, X(c0 + P.lam), yb, C.yellow, 1.5);
        d.line(X(c0), yb - 5, X(c0), yb + 5, C.yellow, 1.5); d.line(X(c0 + P.lam), yb - 5, X(c0 + P.lam), yb + 5, C.yellow, 1.5);
        d.text('λ = ' + fmt(P.lam) + ' m', X(c0 + P.lam / 2), yb - 10, C.yellow, 12, 'center');
      }
      const yr = Y(3);
      d.circle(X(3), y0 - yr * ys, 7, C.red, '#fff', 1.5);
      d.arrow(700, 330, 700 + P.dir * 80, 330, C.green, 3);
      d.text('진행 방향 (v = ' + fmt(P.f * P.lam, 3) + ' m/s)', 700 + P.dir * 40, 312, C.green, 12, 'center');
      d.text('빨간 점: 제자리에서 위아래로만 진동', 60, 330, C.red, 12);
      const t1 = max(8, S.t), p = d.plot({ x: 70, y: 380, w: 790, h: 135, xmin: t1 - 8, xmax: t1, ymin: -1.1, ymax: 1.1, title: '빨간 점의 변위 y(t)', xl: 't (s)', yl: 'y (m)', ny: 2 });
      p.pts(S.hist, C.red, 2);
    },
  });

  const NOTES = ['라(A)', '라#', '시(B)', '도(C)', '도#', '레(D)', '레#', '미(E)', '파(F)', '파#', '솔(G)', '솔#'];
  const noteName = (f) => { const i = Math.round(12 * Math.log2(f / 440)); return NOTES[((i % 12) + 12) % 12] + (4 + floor((i + 9) / 12)); };
  add({
    id: 'standing', cat: '파동', name: '정상파와 현의 진동', en: 'Standing Waves on a String',
    tex: ['y = 2A\\sin(kx)\\cos(\\omega t)', '\\lambda_n = \\frac{2L}{n},\\qquad f_n = \\frac{n}{2L}\\sqrt{\\frac{T}{\\mu}}'],
    short: 'f_n = \\frac{n}{2L}\\sqrt{T/\\mu}',
    desc: '양 끝이 고정된 줄에서 반대 방향으로 진행하는 두 파동(흐린 선)이 겹치면 제자리에서 진동하는 정상파가 된다. 전혀 움직이지 않는 마디(N)와 가장 크게 진동하는 배(A)가 생기며, 줄 길이에 반파장이 정수 개 들어맞는 진동수만 허용된다. 줄을 팽팽하게(T↑) 하거나 가늘게(μ↓) 하면 음이 높아진다. 기본값은 기타 줄과 비슷하다(진동은 느리게 표시).',
    params: [R('n', '조화수 n', '', 1, 10, 1, 3), R('L', '줄의 길이 L', 'm', 0.3, 2, 0.01, 0.65), R('T', '장력 T', 'N', 10, 500, 1, 120), R('mu', '선밀도 μ', 'g/m', 0.5, 20, 0.1, 2), Chk('comp', '두 진행파 성분 보기', true)],
    out: (P) => {
      const v = sqrt(P.T / (P.mu / 1000)), f = (P.n * v) / (2 * P.L);
      return [['파동 속력 v = √(T/μ)', v, 'm/s'], ['파장 λₙ = 2L/n', (2 * P.L) / P.n, 'm'], ['진동수 fₙ', f, 'Hz'], ['기본 진동수 f₁', v / (2 * P.L), 'Hz'], ['가장 가까운 음', noteName(f), ''], ['마디 수 / 배 수', P.n + 1 + ' / ' + P.n, '']];
    },
    sub: (P) => { const v = sqrt(P.T / (P.mu / 1000)); return `f_{${P.n}} = \\frac{${P.n}}{2(${ft(P.L)})}\\sqrt{\\frac{${ft(P.T)}}{${ft(P.mu / 1000)}}} = ${ft((P.n * v) / (2 * P.L))}\\ \\mathrm{Hz}`; },
    init(S) { S.ph = 0; },
    step(S, P, dt) { S.ph += 2 * PI * 0.6 * dt; },
    draw(d, S, P) {
      d.clear();
      const x0 = 80, x1 = 820, y0 = 210, A = 50, k = (P.n * PI) / (x1 - x0);
      const line = (f, col, lw, dash) => { const pts = []; for (let i = 0; i <= 400; i++) { const x = x0 + ((x1 - x0) * i) / 400; pts.push([x, y0 - f(x - x0)]); } d.poly(pts, col, lw, false, null, dash); };
      if (P.comp) {
        line((u) => A * sin(k * u - S.ph), 'rgba(56,189,248,0.45)', 1.5);
        line((u) => A * sin(k * u + S.ph), 'rgba(244,114,182,0.45)', 1.5);
      }
      line((u) => 2 * A * sin(k * u), 'rgba(255,255,255,0.12)', 1, [3, 4]);
      line((u) => -2 * A * sin(k * u), 'rgba(255,255,255,0.12)', 1, [3, 4]);
      line((u) => 2 * A * sin(k * u) * cos(S.ph), C.orange, 3.5);
      d.rect(x0 - 16, y0 - 120, 16, 240, '#5d6b8f'); d.rect(x1, y0 - 120, 16, 240, '#5d6b8f');
      for (let j = 0; j <= P.n; j++) { const X = x0 + ((x1 - x0) * j) / P.n; d.circle(X, y0, 5, C.white); d.text('N', X, y0 + 128, C.dim, 12, 'center'); }
      for (let j = 0; j < P.n; j++) { const X = x0 + ((x1 - x0) * (j + 0.5)) / P.n; d.text('A', X, y0 + 128, C.yellow, 12, 'center'); }
      if (P.comp) { d.text('오른쪽 진행파', 90, 40, C.cyan, 12); d.text('왼쪽 진행파', 200, 40, C.pink, 12); d.text('합 = 정상파', 300, 40, C.orange, 12); }
      d.text('L = ' + fmt(P.L) + ' m  (λ = 2L/' + P.n + ' = ' + fmt((2 * P.L) / P.n, 3) + ' m)', 450, 40, C.text, 12, 'center');
      const v = sqrt(P.T / (P.mu / 1000)), f1 = v / (2 * P.L);
      const p = d.plot({ x: 70, y: 395, w: 790, h: 110, xmin: 0, xmax: f1 * 11, ymin: 0, ymax: 1, yticks: false, grid: false, title: '허용되는 진동수 (조화 진동수 fₙ = n·f₁)', xl: 'f (Hz)' });
      for (let n = 1; n <= 10; n++) { p.vl(n * f1, n === P.n ? C.orange : 'rgba(160,175,210,0.5)', null, n === P.n ? 3 : 1.5); d.text('f' + n, p.X(n * f1), 413, n === P.n ? C.orange : C.dim, 11, 'center'); }
    },
  });

  add({
    id: 'interference', cat: '파동', name: '파동의 간섭 (중첩 원리)', en: 'Superposition & Two-Source Interference',
    tex: ['y = y_1 + y_2', '|r_1 - r_2| = m\\lambda\\ (\\text{보강}),\\qquad |r_1 - r_2| = \\left(m + \\tfrac12\\right)\\lambda\\ (\\text{상쇄})'],
    short: 'y = y_1 + y_2',
    desc: '두 파동이 만나면 변위가 더해진다(중첩 원리). 두 파원까지 거리 차가 파장의 정수배인 곳에서는 마루와 마루가 만나 크게 출렁이고(보강 간섭), 반 파장 어긋난 곳에서는 마루와 골이 만나 잔잔해진다(상쇄 간섭). 물결 통을 위에서 본 모습으로 밝을수록 마루, 파랄수록 골이다. 점선은 보강 간섭이 일어나는 쌍곡선들이다.',
    params: [R('d', '파원 사이 거리 d', 'cm', 1, 10, 0.1, 4), R('lam', '파장 λ', 'cm', 0.5, 3, 0.05, 1.2), R('dphi', '두 파원의 위상차 Δφ', '°', 0, 360, 5, 0), Chk('avg', '시간 평균 세기 보기', false), Chk('lines', '보강 간섭선 표시', true)],
    out: (P) => {
      const m = floor(P.d / P.lam);
      return [['d/λ', P.d / P.lam, ''], ['보강 간섭선 수 (대략 2⌊d/λ⌋+1)', 2 * m + 1, '개'], ['1차 보강 방향 (sinθ = λ/d)', P.lam <= P.d ? M.deg(Math.asin(P.lam / P.d)) : '없음', '°']];
    },
    init(S) { S.ph = 0; S.cv = document.createElement('canvas'); },
    step(S, P, dt) { S.ph += 2 * PI * 1.2 * dt; },
    draw(d, S, P) {
      d.clear(false);
      const nx = 225, ny = 140, cmW = 30, cm = cmW / nx;
      const geo = PL.memo(S, 'geo', P.d, () => {
        const r1 = new Float32Array(nx * ny), r2 = new Float32Array(nx * ny);
        const sx = 3, sy1 = ny * cm * 0.5 - P.d / 2, sy2 = ny * cm * 0.5 + P.d / 2;
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const x = (i + 0.5) * cm, y = (j + 0.5) * cm, q = j * nx + i;
          r1[q] = hypot(x - sx, y - sy1); r2[q] = hypot(x - sx, y - sy2);
        }
        return { r1, r2, sx, sy1, sy2 };
      });
      const k = (2 * PI) / P.lam, dp = M.rad(P.dphi), out = [0, 0, 0, 255];
      PL.raster(nx, ny, (i, j) => {
        const q = j * nx + i, a = geo.r1[q], b = geo.r2[q];
        if (P.avg) {
          const v = cos((k * (a - b) - dp) / 2) ** 2;
          return PL.cmap.inferno(v * 0.95);
        }
        const y = cos(k * a - S.ph) / sqrt(1 + a) + cos(k * b - S.ph + dp) / sqrt(1 + b);
        const c = PL.cmap.div(M.clamp(y / 1.1, -1, 1));
        out[0] = c[0]; out[1] = c[1]; out[2] = c[2];
        return out;
      }, S.cv);
      d.img(S.cv, 0, 0, 900, 560);
      if (P.lines) {
        const gx = 113, gy = 70, grid = new Float32Array(gx * gy), c2 = cmW / gx;
        for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
          const x = i * c2, y = j * c2;
          grid[j * gx + i] = (hypot(x - geo.sx, y - geo.sy1) - hypot(x - geo.sx, y - geo.sy2)) / P.lam + dp / (2 * PI);
        }
        const mm = Math.ceil(P.d / P.lam) + 1;
        d.g.setLineDash([4, 5]);
        for (let m = -mm; m <= mm; m++) d.contour(PL.contour(grid, gx, gy, m), 0, 0, 900 / gx, 900 / gx, 'rgba(255,255,255,0.45)', 1);
        d.g.setLineDash([]);
      }
      const pxc = 900 / cmW;
      d.circle(geo.sx * pxc, geo.sy1 * pxc, 6, C.yellow, '#000', 1.5);
      d.circle(geo.sx * pxc, geo.sy2 * pxc, 6, C.yellow, '#000', 1.5);
      d.label(P.avg ? '시간 평균 세기 (밝을수록 크게 진동)' : '순간 수면 높이 (빨강 = 마루, 파랑 = 골)', 450, 24, C.text, 12);
      d.line(780, 535, 780 + pxc * 5, 535, '#fff', 2);
      d.text('5 cm', 780 + pxc * 2.5, 522, '#fff', 11, 'center');
    },
  });

  add({
    id: 'beats', cat: '파동', name: '맥놀이', en: 'Beats',
    tex: ['A\\sin 2\\pi f_1 t + A\\sin 2\\pi f_2 t = 2A\\cos\\!\\left(2\\pi\\tfrac{f_1 - f_2}{2}t\\right)\\sin\\!\\left(2\\pi\\tfrac{f_1 + f_2}{2}t\\right)', 'f_{\\text{맥놀이}} = |f_1 - f_2|'],
    short: 'f_{\\text{맥놀이}} = |f_1 - f_2|',
    desc: '진동수가 조금 다른 두 소리가 겹치면 두 파동이 같은 위상과 반대 위상을 번갈아 만나면서 소리가 주기적으로 커졌다 작아진다. 이 세기 변동의 진동수는 두 진동수의 차이와 같다. 악기를 조율할 때 맥놀이가 사라질 때까지 줄을 조이는 원리이다. "소리 듣기"를 켜면 실제로 들을 수 있다(음량 주의).',
    params: [R('f1', '진동수 f₁', 'Hz', 200, 800, 0.5, 440), R('f2', '진동수 f₂', 'Hz', 200, 800, 0.5, 443), Chk('snd', '소리 듣기 (스피커)', false)],
    out: (P) => [['맥놀이 진동수 |f₁ − f₂|', abs(P.f1 - P.f2), 'Hz'], ['맥놀이 주기 1/|f₁ − f₂|', P.f1 !== P.f2 ? 1 / abs(P.f1 - P.f2) : Infinity, 's'], ['합성파의 진동수 (f₁ + f₂)/2', (P.f1 + P.f2) / 2, 'Hz']],
    sub: (P) => `f_{\\text{맥놀이}} = |${ft(P.f1)} - ${ft(P.f2)}| = ${ft(abs(P.f1 - P.f2))}\\ \\mathrm{Hz}`,
    audio(S, P) {
      if (!P.snd) { this.stop(S); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!S.ac) {
        S.ac = new AC();
        S.gn = S.ac.createGain(); S.gn.gain.value = 0.05; S.gn.connect(S.ac.destination);
        S.o1 = S.ac.createOscillator(); S.o2 = S.ac.createOscillator();
        S.o1.connect(S.gn); S.o2.connect(S.gn); S.o1.start(); S.o2.start();
      }
      S.o1.frequency.setValueAtTime(P.f1, S.ac.currentTime);
      S.o2.frequency.setValueAtTime(P.f2, S.ac.currentTime);
      if (S.ac.state === 'suspended') S.ac.resume();
    },
    stop(S) { if (S.ac) { try { S.ac.close(); } catch (e) { /* 무시 */ } S.ac = null; } },
    init(S, P) { if (P.snd) this.audio(S, P); },
    change(S, P) { this.audio(S, P); },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const w = 0.02, p1 = d.plot({ x: 70, y: 50, w: 790, h: 140, xmin: 0, xmax: w * 1000, ymin: -1.3, ymax: 1.3, title: '두 소리 (20 ms 확대)', xl: 't (ms)', ny: 2 });
      p1.fn((tm) => sin(2 * PI * P.f1 * (S.t + tm / 1000)), C.cyan, 1.8, 600);
      p1.fn((tm) => sin(2 * PI * P.f2 * (S.t + tm / 1000)), C.pink, 1.8, 600);
      d.text('f₁ = ' + P.f1 + ' Hz', 700, 36, C.cyan, 12); d.text('f₂ = ' + P.f2 + ' Hz', 800, 36, C.pink, 12);
      const T = 2, p2 = d.plot({ x: 70, y: 260, w: 790, h: 250, xmin: -T, xmax: 0, ymin: -2.3, ymax: 2.3, title: '합성파 y₁ + y₂ (최근 2초) — 세기가 주기적으로 변함', xl: '시간 (s, 0 = 지금)', ny: 4 });
      const g = d.g;
      g.strokeStyle = C.orange; g.lineWidth = 1; g.beginPath();
      for (let px = 0; px < p2.w; px++) {
        let lo = 9, hi = -9;
        for (let s = 0; s < 10; s++) {
          const t = S.t - T + ((px + s / 10) / p2.w) * T, y = sin(2 * PI * P.f1 * t) + sin(2 * PI * P.f2 * t);
          lo = min(lo, y); hi = max(hi, y);
        }
        g.moveTo(p2.x + px + 0.5, p2.Y(hi)); g.lineTo(p2.x + px + 0.5, p2.Y(lo));
      }
      g.stroke();
      const df = P.f1 - P.f2;
      p2.fn((tt) => 2 * abs(cos(PI * df * (S.t + tt))), C.yellow, 1.5, 400, [5, 4]);
      p2.fn((tt) => -2 * abs(cos(PI * df * (S.t + tt))), C.yellow, 1.5, 400, [5, 4]);
    },
  });

  add({
    id: 'doppler', cat: '파동', name: '도플러 효과', en: 'Doppler Effect',
    tex: ["f' = f\\,\\frac{v + v_o}{v - v_s}\\ (\\text{다가올 때}),\\qquad f' = f\\,\\frac{v + v_o}{v + v_s}\\ (\\text{멀어질 때})", '\\sin\\theta_{\\text{마하}} = \\frac{v}{v_s}\\quad (v_s > v)'],
    short: "f' = f\\frac{v + v_o}{v - v_s}",
    desc: '음원이 움직이면 진행 방향 앞쪽의 파면은 촘촘해지고(파장 짧음 → 높은 소리), 뒤쪽은 성겨진다(파장 김 → 낮은 소리). 구급차가 다가올 때는 높게, 멀어질 때는 낮게 들리는 이유이다. 음원이 음속(343 m/s)보다 빠르면 파면이 겹쳐 원뿔 모양의 충격파(소닉 붐)가 생긴다.',
    params: [R('vs', '음원 속력 v_s', 'm/s', 0, 600, 1, 150), R('vo', '관찰자 속력 v_o (음원 쪽으로 +)', 'm/s', -150, 150, 1, 0), R('f', '음원 진동수 f', 'Hz', 100, 1000, 1, 440)],
    out: (P) => {
      const v = 343;
      return [['소리의 속력 v', v, 'm/s'], ['앞쪽 관찰자가 듣는 진동수', P.vs < v ? (P.f * (v + P.vo)) / (v - P.vs) : '충격파 (소닉 붐)', 'Hz'], ['뒤쪽 관찰자가 듣는 진동수', (P.f * (v + P.vo)) / (v + P.vs), 'Hz'], ['마하 수 v_s/v', P.vs / v, ''], ['마하각 sin⁻¹(v/v_s)', P.vs > v ? M.deg(Math.asin(v / P.vs)) : '—', '°']];
    },
    sub: (P) => (P.vs < 343 ? `f'_{\\text{앞}} = ${ft(P.f)}\\times\\frac{343 + ${ft(P.vo)}}{343 - ${ft(P.vs)}} = ${ft((P.f * (343 + P.vo)) / (343 - P.vs))}\\ \\mathrm{Hz}` : ''),
    init(S) { S.x = 80; S.waves = []; S.acc = 0; },
    step(S, P, dt) {
      S.t += dt;
      const c = 120, k = c / 343;
      S.x += P.vs * k * dt;
      if (S.x > 980) { S.x = -80; S.waves = []; }
      S.acc += dt;
      const Te = 110 / P.f;
      while (S.acc >= Te) { S.acc -= Te; S.waves.push([S.x, S.t]); }
      S.waves = S.waves.filter((w) => (S.t - w[1]) * c < 1100);
    },
    draw(d, S, P) {
      d.clear();
      const c = 120, y = 280;
      S.waves.forEach((w) => { const r = (S.t - w[1]) * c; d.circle(w[0], y, r, null, `rgba(56,189,248,${M.clamp(0.9 - r / 1100, 0.08, 0.9)})`, 1.6); });
      if (P.vs > 343) {
        const th = Math.asin(343 / P.vs), L = 900;
        d.line(S.x, y, S.x - L * cos(th), y - L * sin(th), C.red, 2.5);
        d.line(S.x, y, S.x - L * cos(th), y + L * sin(th), C.red, 2.5);
        d.label('충격파 (마하 원뿔)', S.x - 160, y - 150, C.red, 12);
      }
      d.ball(S.x, y, 12, C.orange);
      if (P.vs > 0) d.arrow(S.x, y - 22, S.x + 24 + P.vs * 0.12, y - 22, C.orange, 2.5);
      const ear = (x, lbl, f) => { d.circle(x, y, 13, '#2f3b62', C.text, 2); d.text('👂', x, y + 1, C.text, 14, 'center'); d.label(lbl + (typeof f === 'number' ? fmt(f, 4) + ' Hz' : f), x, y + 40, C.text, 12); };
      const v = 343;
      ear(860, '앞: ', P.vs < v ? (P.f * (v + P.vo)) / (v - P.vs) : '소닉 붐');
      ear(40, '뒤: ', (P.f * (v + P.vo)) / (v + P.vs));
      d.text('원래 진동수 ' + P.f + ' Hz · 음원 속력 ' + P.vs + ' m/s (마하 ' + fmt(P.vs / 343, 3) + ')', 450, 30, C.text, 13, 'center');
    },
  });

  /* ================================================================ 유체역학 */
  add({
    id: 'pascal', cat: '유체역학', name: '파스칼의 원리', en: "Pascal's Principle",
    tex: ['P = \\frac{F_1}{A_1} = \\frac{F_2}{A_2}\\;\\Longrightarrow\\; F_2 = F_1\\frac{A_2}{A_1}', 'A_1 d_1 = A_2 d_2\\quad(\\text{부피 보존})'],
    short: 'F_2 = F_1\\frac{A_2}{A_1}',
    desc: '밀폐된 유체의 한 곳에 가한 압력은 유체 모든 곳에 같은 크기로 전달된다(작은 화살표는 모두 같은 크기). 그래서 좁은 피스톤을 작은 힘으로 누르면 넓은 피스톤에는 넓이에 비례하는 큰 힘이 생긴다 — 유압 잭과 자동차 브레이크의 원리이다. 대신 부피가 보존되므로 큰 피스톤은 아주 조금만 올라간다. 힘에서 이득을 보면 거리에서 손해를 본다.',
    params: [R('F1', '작은 피스톤에 가한 힘 F₁', 'N', 10, 500, 1, 100), R('A1', '작은 피스톤 넓이 A₁', 'cm²', 1, 50, 0.5, 5), R('A2', '큰 피스톤 넓이 A₂', 'cm²', 50, 2000, 10, 1000)],
    out: (P) => {
      const pr = P.F1 / (P.A1 * 1e-4), F2 = (P.F1 * P.A2) / P.A1;
      return [['유체 속 압력 P = F₁/A₁', pr / 1000, 'kPa'], ['큰 피스톤의 힘 F₂', F2, 'N'], ['들어 올릴 수 있는 질량 F₂/g', F2 / K.g, 'kg'], ['힘의 배율 A₂/A₁', P.A2 / P.A1, '배'], ['작은 피스톤을 10 cm 누르면 큰 피스톤 이동', (10 * P.A1) / P.A2, 'cm']];
    },
    sub: (P) => `F_2 = ${ft(P.F1)}\\times\\frac{${ft(P.A2)}}{${ft(P.A1)}} = ${ft((P.F1 * P.A2) / P.A1)}\\ \\mathrm{N}`,
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const w1 = 24 + 56 * sqrt(P.A1 / 50), w2 = 120 + 260 * sqrt(P.A2 / 2000), x1 = 200, x2 = 600, base = 250, bot = 480, ch = 70;
      const s = 0.5 - 0.5 * cos(S.t * 1.3), d1 = s * 90, d2 = (d1 * P.A1) / P.A2;
      const fl = 'rgba(56,140,248,0.55)';
      d.rect(x1 - w1 / 2, base + d1, w1, bot - base - d1, fl);
      d.rect(x2 - w2 / 2, base - d2, w2, bot - base + d2, fl);
      d.rect(x1 - w1 / 2, bot - ch, x2 - x1, ch, fl);
      const wall = '#9aa6c4';
      d.line(x1 - w1 / 2, 120, x1 - w1 / 2, bot, wall, 3); d.line(x1 + w1 / 2, 120, x1 + w1 / 2, bot - ch, wall, 3);
      d.line(x2 - w2 / 2, 120, x2 - w2 / 2, bot - ch, wall, 3); d.line(x2 + w2 / 2, 120, x2 + w2 / 2, bot, wall, 3);
      d.line(x1 - w1 / 2, bot, x2 + w2 / 2, bot, wall, 3); d.line(x1 + w1 / 2, bot - ch, x2 - w2 / 2, bot - ch, wall, 3);
      d.rect(x1 - w1 / 2 + 2, base + d1 - 14, w1 - 4, 14, '#cfd8ee');
      d.rect(x2 - w2 / 2 + 2, base - d2 - 14, w2 - 4, 14, '#cfd8ee');
      const L1 = 20 * Math.log10(P.F1), F2 = (P.F1 * P.A2) / P.A1, L2 = 20 * Math.log10(F2);
      d.arrow(x1, base + d1 - 14 - L1 - 10, x1, base + d1 - 16, C.red, 4);
      d.text('F₁ = ' + fmt(P.F1) + ' N', x1, base + d1 - 34 - L1, C.red, 13, 'center', 'middle', true);
      const ty = base - d2 - 14, kg = F2 / K.g;
      d.rect(x2 - 60, ty - 50, 120, 50, '#3a4668', '#7f8db0', 1.5, 6);
      d.text(fmt(kg, 3) + ' kg', x2, ty - 25, C.text, 13, 'center', 'middle', true);
      d.arrow(x2 + 80, ty - 4, x2 + 80, ty - 4 - L2, C.green, 4);
      d.text('F₂ = ' + fmt(F2, 4) + ' N', x2 + 92, ty - 20 - L2 / 2, C.green, 13, 'left', 'middle', true);
      const pts = [[x1, bot - 20], [x1 + 120, bot - 35], [x1 + 260, bot - 35], [x2, bot - 100], [x2 - w2 / 4, base + 60], [x2 + w2 / 4, base + 60], [x1, base + d1 + 70]];
      pts.forEach(([px, py], i) => { const a = (i * 2.1) % (2 * PI); for (let q = 0; q < 4; q++) { const b = a + (q * PI) / 2; d.arrow(px, py, px + 13 * cos(b), py + 13 * sin(b), 'rgba(255,255,255,0.55)', 1.5, 5); } });
      d.text('압력은 유체 어디서나 같다: P = ' + fmt(P.F1 / (P.A1 * 1e-4) / 1000, 4) + ' kPa', 450, 40, C.cyan, 13, 'center');
      d.text('A₁ = ' + P.A1 + ' cm²', x1, bot + 22, C.dim, 12, 'center');
      d.text('A₂ = ' + P.A2 + ' cm²', x2, bot + 22, C.dim, 12, 'center');
      d.text('↓ ' + fmt(d1 / 9, 3) + ' cm', x1 + w1 / 2 + 8, base + d1, C.red, 11);
      d.text('↑ ' + fmt(d2 / 9, 3) + ' cm', x2 + w2 / 2 + 8, base - d2, C.green, 11);
    },
  });

  add({
    id: 'archimedes', cat: '유체역학', name: '아르키메데스의 원리 (부력)', en: "Archimedes' Principle — Buoyancy",
    tex: ['F_B = \\rho_{\\text{유체}}\\,V_{\\text{잠긴}}\\,g', '\\frac{V_{\\text{잠긴}}}{V} = \\frac{\\rho_{\\text{물체}}}{\\rho_{\\text{유체}}}\\quad(\\text{떠 있을 때})'],
    short: 'F_B = \\rho V g',
    desc: '유체에 잠긴 물체는 밀어낸 유체의 무게만큼 위로 뜨는 힘(부력)을 받는다. 물체의 밀도가 유체보다 작으면 일부만 잠긴 채 뜨고, 잠긴 비율은 두 밀도의 비와 같다(빙산이 약 90% 잠기는 이유). 밀도가 더 크면 완전히 잠겨도 부력이 무게보다 작아 가라앉는다. 값을 바꾸면 즉시 반응한다.',
    params: [R('ro', '물체의 밀도 ρ_물체', 'kg/m³', 100, 3000, 10, 600), R('rf', '유체의 밀도 ρ_유체', 'kg/m³', 500, 2000, 10, 1000), R('a', '정육면체 한 변 a', 'm', 0.1, 0.4, 0.01, 0.25)],
    out: (P, S) => {
      const V = P.a ** 3, W = P.ro * V * K.g, Bm = P.rf * V * K.g, sub = M.clamp(S.y, 0, P.a);
      return [['무게 W = ρ_물체Vg', W, 'N'], ['현재 부력 ρ_유체 V_잠긴 g', P.rf * P.a * P.a * sub * K.g, 'N'], ['완전히 잠길 때 최대 부력', Bm, 'N'], ['결과', P.ro < P.rf ? '뜬다' : P.ro > P.rf ? '가라앉는다' : '중성 부력 (어디서나 멈춤)', ''], ['떠 있을 때 잠긴 비율 ρ_물체/ρ_유체', P.ro < P.rf ? (P.ro / P.rf) * 100 : 100, '%']];
    },
    sub: (P, S) => `F_B = (${ft(P.rf)})(${ft(P.a * P.a * M.clamp(S.y, 0, P.a))})(9.81) = ${ft(P.rf * P.a * P.a * M.clamp(S.y, 0, P.a) * K.g)}\\ \\mathrm{N}`,
    init(S) { S.y = -0.3; S.v = 0; S.hold = 0.6; },
    step(S, P, dt) {
      if (S.hold > 0) { S.hold -= dt; return; }
      const a = P.a, m = P.ro * a ** 3, D = 1.0, n = 10, h = dt / n;
      for (let i = 0; i < n; i++) {
        const sub = M.clamp(S.y, 0, a), B = P.rf * a * a * sub * K.g;
        const c = 0.7 * sqrt(P.rf * a * a * K.g * m) * (sub / a) + 0.05 * m;
        S.v += (K.g - B / m - (c * S.v) / m) * h;
        S.y += S.v * h;
        if (S.y > D) { S.y = D; if (S.v > 0) S.v = 0; }
      }
    },
    draw(d, S, P) {
      d.clear();
      const tx = 180, tw = 440, sy = 200, sc = 330, D = 1.0;
      d.rect(tx, sy, tw, D * sc, 'rgba(56,140,248,0.35)');
      d.line(tx, sy, tx + tw, sy, 'rgba(150,200,255,0.8)', 2);
      d.line(tx, 90, tx, sy + D * sc, '#9aa6c4', 3); d.line(tx + tw, 90, tx + tw, sy + D * sc, '#9aa6c4', 3); d.line(tx, sy + D * sc, tx + tw, sy + D * sc, '#9aa6c4', 3);
      const a = P.a, side = a * sc, top = sy + (S.y - a) * sc, cx = tx + tw / 2;
      const col = P.ro < 1000 ? PL.mix('#e0b07a', '#8a5a2b', (P.ro - 100) / 900) : PL.mix('#9aa6c4', '#4a5570', (P.ro - 1000) / 2000);
      d.rect(cx - side / 2, top, side, side, col, '#000', 1);
      const sub = M.clamp(S.y, 0, a);
      if (sub > 0) d.rect(cx - side / 2, sy, side, sub * sc, 'rgba(56,140,248,0.25)');
      const W = P.ro * a ** 3 * K.g, B = P.rf * a * a * sub * K.g, Bm = P.rf * a ** 3 * K.g, sF = 110 / max(W, Bm);
      d.arrow(cx - 18, top + side / 2, cx - 18, top + side / 2 + W * sF, C.red, 3.5);
      d.text('W', cx - 30, top + side / 2 + W * sF, C.red, 13, 'right');
      if (B > 0.01) { d.arrow(cx + 18, top + side, cx + 18, top + side - B * sF, C.cyan, 3.5); d.text('F_B', cx + 30, top + side - B * sF, C.cyan, 13); }
      d.text('유체 ρ = ' + P.rf + ' kg/m³', tx + 10, sy + D * sc - 16, C.cyan, 12);
      d.bars(680, 120, 200, 260, [['무게', W, C.red], ['부력', B, C.cyan]], max(W, Bm) * 1.1, '힘 (N)');
      d.label(P.ro < P.rf ? '물체가 유체보다 가볍다 → 뜬다' : P.ro > P.rf ? '물체가 유체보다 무겁다 → 가라앉는다' : '밀도가 같다 → 중성 부력', 450, 40, C.text, 13);
    },
  });

  add({
    id: 'bernoulli', cat: '유체역학', name: '베르누이 방정식과 연속 방정식', en: "Bernoulli's Equation & Continuity",
    tex: ['P + \\tfrac12\\rho v^2 + \\rho g h = \\text{일정}', 'A_1 v_1 = A_2 v_2\\quad(\\text{연속 방정식})'],
    short: 'P + \\tfrac12\\rho v^2 + \\rho gh = \\text{일정}',
    desc: '비압축성 유체가 관을 흐를 때 같은 시간에 지나가는 부피는 어디서나 같으므로(연속 방정식) 관이 좁아지면 유속이 빨라진다. 에너지 보존(베르누이 방정식)에 따라 유속이 빠른 곳은 압력이 낮다 — 위에 세운 유리관의 수면 높이가 압력을 보여 준다(벤투리관). 비행기 날개의 양력, 분무기, 커튼이 창문 쪽으로 빨려 드는 현상과 관련된다.',
    params: [R('v1', '넓은 관의 유속 v₁', 'm/s', 0.5, 5, 0.1, 2), R('ratio', '넓이 비 A₂/A₁', '', 0.2, 1, 0.01, 0.5), R('P1', '넓은 관의 압력 P₁', 'kPa', 100, 300, 1, 150), R('rho', '유체 밀도 ρ', 'kg/m³', 500, 1500, 10, 1000)],
    out: (P) => {
      const v2 = P.v1 / P.ratio, P2 = P.P1 * 1000 + 0.5 * P.rho * (P.v1 ** 2 - v2 ** 2);
      const r = [['좁은 관의 유속 v₂ = v₁A₁/A₂', v2, 'm/s'], ['좁은 관의 압력 P₂', P2 / 1000, 'kPa'], ['압력 차 P₁ − P₂ = ½ρ(v₂² − v₁²)', (P.P1 * 1000 - P2) / 1000, 'kPa'], ['동압 ½ρv₂²', (0.5 * P.rho * v2 * v2) / 1000, 'kPa']];
      if (P2 < 0) r.push('P₂가 음수 → 실제로는 유체가 끓어 기포가 생긴다(공동 현상).');
      return r;
    },
    sub: (P) => { const v2 = P.v1 / P.ratio; return `P_2 = ${ft(P.P1 * 1000)} + \\tfrac12(${ft(P.rho)})\\left[(${ft(P.v1)})^2 - (${ft(v2)})^2\\right] = ${ft(P.P1 * 1000 + 0.5 * P.rho * (P.v1 ** 2 - v2 ** 2))}\\ \\mathrm{Pa}`; },
    init(S) { S.pts = Array.from({ length: 160 }, () => [Math.random() * 780 + 60, Math.random() * 2 - 1]); },
    step(S, P, dt) {
      const sc = 34;
      S.pts.forEach((p) => {
        p[0] += (P.v1 / this.Aof(p[0], P)) * sc * dt;
        if (p[0] > 840) { p[0] -= 780; p[1] = Math.random() * 2 - 1; }
      });
    },
    Aof(x, P) { const t = M.smooth((x - 300) / 90) - M.smooth((x - 510) / 90); return 1 + (P.ratio - 1) * t; },
    draw(d, S, P) {
      d.clear();
      const cy = 400, h1 = 75, hof = (x) => h1 * sqrt(this.Aof(x, P));
      const v2 = P.v1 / P.ratio, Pof = (x) => P.P1 * 1000 + 0.5 * P.rho * (P.v1 ** 2 - (P.v1 / this.Aof(x, P)) ** 2);
      const P2 = Pof(450), pmin = min(P2, P.P1 * 1000), pmax = P.P1 * 1000;
      for (let x = 60; x < 840; x += 4) {
        const hh = hof(x), tt = pmax > pmin ? (Pof(x) - pmin) / (pmax - pmin) : 1;
        d.rect(x, cy - hh, 4.5, 2 * hh, PL.heatColor(0.15 + 0.7 * tt, 0.55));
      }
      const top = [], bot = [];
      for (let x = 60; x <= 840; x += 5) { top.push([x, cy - hof(x)]); bot.push([x, cy + hof(x)]); }
      d.poly(top, '#cfd8ee', 3); d.poly(bot, '#cfd8ee', 3);
      S.pts.forEach((p) => d.circle(p[0], cy + p[1] * hof(p[0]) * 0.85, 2.2, 'rgba(255,255,255,0.85)'));
      const tube = (x, pr, lbl) => {
        const yt = cy - hof(x), hcol = M.clamp(pr / 1000, 0, 320) * 0.95;
        d.rect(x - 9, yt - 300, 18, 300, 'rgba(255,255,255,0.04)', 'rgba(200,210,235,0.6)', 1.5);
        d.rect(x - 7, yt - hcol, 14, hcol, 'rgba(56,140,248,0.7)');
        d.text(lbl + ' = ' + fmt(pr / 1000, 4) + ' kPa', x, yt - 310 > 10 ? yt - 310 : 12, C.text, 12, 'center');
      };
      tube(180, P.P1 * 1000, 'P₁'); tube(450, P2, 'P₂'); tube(720, P.P1 * 1000, 'P₃');
      d.text('v₁ = ' + fmt(P.v1, 3) + ' m/s', 180, cy + h1 + 26, C.text, 12, 'center');
      d.text('v₂ = ' + fmt(v2, 3) + ' m/s', 450, cy + h1 + 26, C.yellow, 12, 'center', 'middle', true);
      d.text('색: 압력 (빨강 높음 · 파랑 낮음)', 860, 548, C.dim, 11, 'right');
      if (P2 < 0) d.label('P₂ < 0 : 공동 현상', 450, cy, C.red, 12);
    },
  });

  add({
    id: 'stokes', cat: '유체역학', name: '스토크스 법칙과 종단 속도', en: "Stokes' Law & Terminal Velocity",
    tex: ['F_d = 6\\pi\\eta r v', 'v_t = \\frac{2}{9}\\frac{(\\rho_s - \\rho_f)\\,g\\,r^2}{\\eta}'],
    short: 'F_d = 6\\pi\\eta r v',
    desc: '점성 유체 속을 천천히 움직이는 공은 속력에 비례하는 저항력을 받는다. 공이 빨라질수록 저항력이 커져 결국 무게 = 부력 + 저항력이 되면 더 이상 빨라지지 않는 종단 속도에 이른다. 종단 속도는 반지름의 제곱에 비례하므로 반지름이 2배인 공은 4배 빠르게 떨어진다. 기본값은 글리세린 속의 쇠구슬이다(4배속 표시).',
    params: [R('r', '가운데 공의 반지름 r', 'mm', 0.5, 4, 0.1, 1.5, { reset: 1 }), R('rs', '공의 밀도 ρₛ', 'kg/m³', 1000, 8000, 50, 7800, { reset: 1 }), R('rf', '유체 밀도 ρ_f', 'kg/m³', 800, 1500, 10, 1260, { reset: 1 }), R('eta', '점성 계수 η', 'Pa·s', 0.1, 3, 0.05, 1.4, { reset: 1 })],
    vt: (P, r) => ((2 / 9) * (P.rs - P.rf) * K.g * r * r) / P.eta,
    out(P) {
      const r = P.r / 1000, vt = this.vt(P, r), tau = (2 * P.rs * r * r) / (9 * P.eta), Re = (P.rf * abs(vt) * 2 * r) / P.eta;
      return [['종단 속도 v_t (반지름 r)', vt * 100, 'cm/s'], ['반지름 r/2 공', this.vt(P, r / 2) * 100, 'cm/s'], ['반지름 2r 공', this.vt(P, 2 * r) * 100, 'cm/s'], ['종단 속도에 이르는 시간 상수 τ', tau * 1000, 'ms'], ['레이놀즈 수 Re', Re, ''], ['적용 가능성', Re < 1 ? 'Re < 1 → 스토크스 법칙 유효' : 'Re ≥ 1 → 근사가 부정확', '']];
    },
    sub(P) { const r = P.r / 1000; return `v_t = \\frac{2}{9}\\frac{(${ft(P.rs)} - ${ft(P.rf)})(9.81)(${ft(r)})^2}{${ft(P.eta)}} = ${ft(this.vt(P, r))}\\ \\mathrm{m/s}`; },
    init(S) { S.t = 0; },
    step(S, P, dt) {
      S.t += dt * 4;
      const vt = this.vt(P, P.r / 1000);
      if (abs(vt) * S.t > 0.4 + abs(vt) * 2 || S.t > 240) S.t = 0;
    },
    draw(d, S, P) {
      d.clear();
      const top = 70, H = 420, sc = H / 0.4;
      d.rect(140, top - 10, 400, H + 30, 'rgba(255,200,90,0.12)', '#9aa6c4', 2, 8);
      d.text('점성 유체 (η = ' + P.eta + ' Pa·s)', 150, top - 24, C.yellow, 12);
      const rr = [P.r / 2, P.r, P.r * 2], cols = [C.cyan, C.orange, C.pink];
      rr.forEach((rm, i) => {
        const r = rm / 1000, vt = this.vt(P, r), tau = (2 * P.rs * r * r) / (9 * P.eta), t = S.t;
        const y = vt * (t - tau * (1 - exp(-t / tau)));
        const pos = vt >= 0 ? min(0.4, y) : max(-0.4, y), X = 230 + i * 120, Y = vt >= 0 ? top + pos * sc : top + H + pos * sc;
        d.ball(X, Y, 3 + rm * 4, cols[i]);
        d.text('r = ' + fmt(rm, 3) + ' mm', X, top + H + 30, cols[i], 12, 'center');
        d.text(fmt(vt * 100, 3) + ' cm/s', X, top + H + 48, C.dim, 11, 'center');
        if (i === 1) {
          const vol = (4 / 3) * PI * r ** 3, Wt = P.rs * vol * K.g, Bf = P.rf * vol * K.g, Fd = 6 * PI * P.eta * r * vt, s = 60 / Wt;
          d.arrow(X + 40, Y, X + 40, Y + Wt * s, C.red, 2.5);
          d.arrow(X + 52, Y, X + 52, Y - Bf * s, C.cyan, 2.5);
          d.arrow(X + 64, Y, X + 64, Y - Fd * s, C.green, 2.5);
        }
      });
      d.text('무게', 570, 120, C.red, 12); d.text('부력', 570, 140, C.cyan, 12); d.text('점성 저항', 570, 160, C.green, 12);
      const r = P.r / 1000, tau = (2 * P.rs * r * r) / (9 * P.eta);
      const p = d.plot({ x: 600, y: 230, w: 270, h: 220, xmin: 0, xmax: 5 * tau * 1000, ymin: 0, ymax: 1.1, title: '처음 순간의 속도 v(t)/v_t', xl: 't (ms)', yl: 'v/v_t' });
      p.fn((tm) => 1 - exp(-tm / (tau * 1000)), C.orange, 2.5);
      p.hl(1, C.yellow);
      p.vl(tau * 1000, C.dim); p.label('τ', tau * 1000 * 1.05, 0.2, C.dim, 11);
      d.text('반지름 2배 → 종단 속도 4배 (v_t ∝ r²)', 600, 500, C.text, 12);
    },
  });

  /* ================================================================ 해석역학 */
  add({
    id: 'action', cat: '해석역학', name: '최소 작용의 원리 (라그랑주 역학)', en: 'Principle of Least Action — Lagrangian Mechanics',
    tex: ['S = \\int_{t_1}^{t_2} L\\,dt,\\qquad L = T - V', '\\delta S = 0 \\;\\Longleftrightarrow\\; \\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot q} - \\frac{\\partial L}{\\partial q} = 0'],
    short: '\\delta S = 0',
    desc: '물체가 실제로 택하는 경로는 작용 S(라그랑지언 L = 운동 에너지 − 위치 에너지를 시간에 대해 적분한 값)를 극값(여기서는 최솟값)으로 만드는 경로이다. 위로 던져 T초 뒤 같은 높이로 돌아오는 1 kg 공에 대해, 실제 경로(초록)에 ε·sin(nπt/T) 모양의 변형을 더한 경로(주황)의 작용을 계산했다. 어떤 변형을 주어도 ε = 0일 때 S가 가장 작다. 이 원리에서 오일러-라그랑주 방정식, 즉 뉴턴 법칙이 유도된다.',
    params: [R('eps', '경로 변형 크기 ε', 'm', -3, 3, 0.05, 1.5), R('n', '변형 모드 n', '', 1, 4, 1, 1), R('T', '비행 시간 T', 's', 1, 4, 0.1, 2.5)],
    act(P, eps) {
      const g = K.g, N = 400, T = P.T;
      let s = 0;
      for (let i = 0; i <= N; i++) {
        const t = (T * i) / N, y = (g / 2) * t * (T - t) + eps * sin((P.n * PI * t) / T);
        const v = (g / 2) * (T - 2 * t) + eps * ((P.n * PI) / T) * cos((P.n * PI * t) / T);
        const L = 0.5 * v * v - g * y, w = i === 0 || i === N ? 0.5 : 1;
        s += w * L;
      }
      return (s * T) / N;
    },
    out(P) {
      const S0 = this.act(P, 0), S1 = this.act(P, P.eps);
      return [['실제 경로의 작용 S₀', S0, 'J·s'], ['변형 경로의 작용 S(ε)', S1, 'J·s'], ['차이 S(ε) − S₀ (항상 ≥ 0)', S1 - S0, 'J·s'], ['이론값 ε²n²π²/(4T)', (P.eps ** 2 * P.n ** 2 * PI ** 2) / (4 * P.T), 'J·s']];
    },
    sub(P) { return `S(\\varepsilon) - S_0 = \\frac{\\varepsilon^2 n^2\\pi^2}{4T} = \\frac{(${ft(P.eps)})^2(${P.n})^2\\pi^2}{4(${ft(P.T)})} = ${ft((P.eps ** 2 * P.n ** 2 * PI ** 2) / (4 * P.T))}\\ \\mathrm{J\\,s}`; },
    init(S) { S.tau = 0; },
    step(S, P, dt) { S.tau = (S.tau + dt / (P.T * 1.4)) % 1; },
    draw(d, S, P) {
      d.clear();
      const g = K.g, T = P.T, y0 = (t, e) => (g / 2) * t * (T - t) + e * sin((P.n * PI * t) / T);
      const H = (g * T * T) / 8;
      const p = d.plot({ x: 70, y: 50, w: 450, h: 330, xmin: 0, xmax: T, ymin: -3.5, ymax: H + 3.5, title: '높이-시간 경로 y(t)', xl: 't (s)', yl: 'y (m)' });
      for (let e = -3; e <= 3; e += 1) if (e !== 0) p.fn((t) => y0(t, e), 'rgba(167,139,250,0.25)', 1);
      p.fn((t) => y0(t, P.eps), C.orange, 2.5);
      p.fn((t) => y0(t, 0), C.green, 3);
      const t = Math.min(1, S.tau * 1.2) * T;
      p.dot(t, y0(t, 0), C.green, 7); p.dot(t, y0(t, P.eps), C.orange, 7);
      d.text('실제 경로 (ε = 0)', 80, 410, C.green, 12); d.text('변형된 경로', 220, 410, C.orange, 12); d.text('다른 변형들', 330, 410, C.purple, 12);
      const Sof = (e) => this.act(P, e), S0 = Sof(0), Smax = Sof(3);
      const p2 = d.plot({ x: 580, y: 50, w: 290, h: 330, xmin: -3, xmax: 3, ymin: S0 - (Smax - S0) * 0.08, ymax: Smax + (Smax - S0) * 0.08, title: '작용 S(ε) — ε = 0에서 최소', xl: 'ε (m)', yl: 'S (J·s)' });
      p2.fn(Sof, C.cyan, 2.5, 80);
      p2.dot(0, S0, C.green, 6); p2.dot(P.eps, Sof(P.eps), C.orange, 6);
      p2.vl(0, C.green);
      d.text('δS = 0 : 실제 경로에서 작용의 1차 변화가 0', 70, 470, C.text, 13);
      d.text('→ 오일러-라그랑주 방정식  m ÿ = −∂V/∂y = −mg', 70, 495, C.dim, 13);
    },
  });

  add({
    id: 'hamilton', cat: '해석역학', name: '해밀턴 역학과 위상 공간', en: 'Hamiltonian Mechanics & Phase Space',
    tex: ['H(q,p) = \\frac{p^2}{2mL^2} - mgL\\cos q', '\\dot q = \\frac{\\partial H}{\\partial p},\\qquad \\dot p = -\\frac{\\partial H}{\\partial q}'],
    short: '\\dot q = \\frac{\\partial H}{\\partial p},\\ \\dot p = -\\frac{\\partial H}{\\partial q}',
    desc: '해밀턴 역학에서는 위치 q와 운동량 p로 이루어진 위상 공간의 한 점이 계의 상태 전체를 나타낸다. 에너지 H가 보존되므로 상태점은 H = 일정인 등고선 위를 움직인다. 진자의 경우 에너지가 작으면 닫힌 곡선(왕복 진동), 크면 열린 곡선(한 방향으로 계속 회전)이 되고, 그 경계가 분리선(빨강, E = mgL)이다. 분리선에 가까울수록 주기가 길어진다. (m = g = L = 1 단위)',
    params: [R('E', '에너지 E / mgL', '', -0.99, 3, 0.01, 0.6, { reset: 1 })],
    period(E) {
      if (E < 1) { const k = sqrt((1 + E) / 2); return 4 * M.ellipKE(k)[0]; }
      if (E > 1) { const k = sqrt(2 / (1 + E)); return 2 * k * M.ellipKE(k)[0]; }
      return Infinity;
    },
    out(P, S) {
      return [['에너지 H', P.E, 'mgL'], ['운동 종류', P.E < 1 ? '왕복 진동 (닫힌 궤도)' : P.E > 1 ? '회전 (열린 궤도)' : '분리선 (무한히 긴 주기)', ''], ['주기 (√(L/g) 단위)', this.period(P.E), ''], ['최대 각도', P.E < 1 ? M.deg(Math.acos(-P.E)) : 180, '°'], ['현재 H (수치 적분)', (S.y[1] * S.y[1]) / 2 - cos(S.y[0]), 'mgL']];
    },
    init(S, P) { S.y = [0, sqrt(2 * (P.E + 1))]; S.tr = []; },
    step(S, P, dt) {
      const f = (t, y) => [y[1], -sin(y[0])];
      for (let i = 0; i < 10; i++) S.y = M.rk4(f, S.y, 0, (dt * 1.6) / 10);
      S.tr.push([M.wrapAngle(S.y[0]), S.y[1]]);
      if (S.tr.length > 260) S.tr.shift();
    },
    draw(d, S, P) {
      d.clear();
      const cx = 190, cy = 250, Lp = 130, q = S.y[0];
      d.circle(cx, cy, Lp, null, 'rgba(255,255,255,0.08)', 1);
      d.line(cx - 40, cy, cx + 40, cy, '#9aa6c4', 4);
      const bx = cx + Lp * sin(q), by = cy + Lp * cos(q);
      d.line(cx, cy, bx, by, '#cfd8ee', 2.5);
      d.ball(bx, by, 14, C.orange);
      d.text('q = ' + fmt(M.deg(M.wrapAngle(q)), 3) + '°', 40, 440, C.text, 13);
      d.text('p = ' + fmt(S.y[1], 3), 40, 462, C.text, 13);
      const grid = PL.memo(S, 'grid', 1, () => {
        const nx = 181, ny = 121, gr = new Float32Array(nx * ny);
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const qq = -PI + (2 * PI * i) / (nx - 1), pp = 3.2 - (6.4 * j) / (ny - 1); gr[j * nx + i] = (pp * pp) / 2 - cos(qq); }
        return { gr, nx, ny };
      });
      const p = d.plot({ x: 400, y: 40, w: 470, h: 470, xmin: -180, xmax: 180, ymin: -3.2, ymax: 3.2, title: '위상 공간 (q, p) — H의 등고선', xl: 'q (°)', yl: 'p', nx: 6 });
      const sx = p.w / (grid.nx - 1), sy = p.h / (grid.ny - 1);
      d.clip(p.x, p.y, p.w, p.h);
      [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1.5, 2, 2.5, 3].forEach((E) => d.contour(PL.contour(grid.gr, grid.nx, grid.ny, E), p.x, p.y, sx, sy, 'rgba(140,165,220,0.35)', 1));
      d.contour(PL.contour(grid.gr, grid.nx, grid.ny, 1), p.x, p.y, sx, sy, C.red, 2);
      d.contour(PL.contour(grid.gr, grid.nx, grid.ny, P.E), p.x, p.y, sx, sy, C.yellow, 2);
      d.unclip();
      for (let i = 1; i < S.tr.length; i++) {
        const a = S.tr[i - 1], b = S.tr[i];
        if (abs(a[0] - b[0]) > PI) continue;
        d.line(p.X(M.deg(a[0])), p.Y(a[1]), p.X(M.deg(b[0])), p.Y(b[1]), `rgba(255,159,67,${i / S.tr.length})`, 3);
      }
      p.dot(M.deg(M.wrapAngle(q)), S.y[1], C.orange, 6);
      d.text('분리선 E = 1', 410, 528, C.red, 12); d.text('현재 궤도', 520, 528, C.yellow, 12);
    },
  });

  const dpDeriv = (y, m2) => {
    const [a, b, wa, wb] = y, m1 = 1, g = 9.81, dl = a - b, den = 2 * m1 + m2 - m2 * cos(2 * a - 2 * b);
    return [wa, wb,
      (-g * (2 * m1 + m2) * sin(a) - m2 * g * sin(a - 2 * b) - 2 * sin(dl) * m2 * (wb * wb + wa * wa * cos(dl))) / den,
      (2 * sin(dl) * (wa * wa * (m1 + m2) + g * (m1 + m2) * cos(a) + wb * wb * m2 * cos(dl))) / den];
  };
  add({
    id: 'doublependulum', cat: '해석역학', name: '이중 진자와 결정론적 혼돈', en: 'Double Pendulum — Deterministic Chaos',
    tex: ['L = \\tfrac12(m_1+m_2)l_1^2\\dot\\theta_1^2 + \\tfrac12 m_2 l_2^2\\dot\\theta_2^2 + m_2 l_1 l_2\\dot\\theta_1\\dot\\theta_2\\cos(\\theta_1-\\theta_2)', '\\qquad +\\,(m_1+m_2)gl_1\\cos\\theta_1 + m_2 g l_2\\cos\\theta_2', '|\\delta\\theta(t)| \\sim |\\delta\\theta_0|\\,e^{\\lambda t}\\quad(\\lambda > 0)'],
    short: '|\\delta(t)| \\sim |\\delta_0|\\,e^{\\lambda t}',
    desc: '이중 진자의 운동은 라그랑주 방정식으로 완전히 결정되지만(결정론), 처음 각도가 아주 조금만 달라도 그 차이가 지수적으로 커져 얼마 뒤에는 전혀 다른 운동을 한다(나비 효과). 처음 각도가 δ씩 다른 세 진자를 겹쳐 그렸다. 오른쪽 그래프는 두 진자 사이 각도 차이의 로그로, 처음에는 거의 직선으로 증가한다(양의 리아푸노프 지수). 처음 각도를 작게 하면 혼돈이 사라지고 규칙적으로 움직인다.',
    params: [R('th1', '처음 각도 θ₁', '°', -180, 180, 1, 120, { reset: 1 }), R('th2', '처음 각도 θ₂', '°', -180, 180, 1, -20, { reset: 1 }), R('dl', '처음 각도 차이 δ', '°', 0.0001, 1, 0.0001, 0.01, { reset: 1, log: 1 }), R('mr', '질량비 m₂/m₁', '', 0.2, 3, 0.1, 1, { reset: 1 })],
    out: (P, S) => [['경과 시간', S.t, 's'], ['진자 1·2의 각도 차이', S.div, 'rad'], ['차이 증가 배율', S.div / M.rad(P.dl), '배']],
    init(S, P) {
      const b = [M.rad(P.th1), M.rad(P.th2), 0, 0];
      S.ys = [0, 1, 2].map((k) => [b[0] + k * M.rad(P.dl), b[1], 0, 0]);
      S.trails = [[], [], []]; S.hist = []; S.div = M.rad(P.dl);
    },
    step(S, P, dt) {
      const n = 12, h = dt / n, f = (t, y) => dpDeriv(y, P.mr);
      for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) S.ys[k] = M.rk4(f, S.ys[k], 0, h);
      S.t += dt;
      S.ys.forEach((y, k) => { S.trails[k].push([sin(y[0]) + sin(y[1]), cos(y[0]) + cos(y[1])]); if (S.trails[k].length > 420) S.trails[k].shift(); });
      const a = S.ys[0], b = S.ys[1];
      S.div = hypot(M.wrapAngle(a[0] - b[0]), M.wrapAngle(a[1] - b[1])) || 1e-12;
      S.hist.push([S.t, Math.log10(S.div)]);
      if (S.t > 40) this.init(S, P), (S.t = 0);
    },
    draw(d, S, P) {
      d.clear();
      const cx = 290, cy = 250, Lp = 112, cols = [C.orange, C.cyan, C.pink];
      S.trails.forEach((tr, k) => d.poly(tr.map((p) => [cx + p[0] * Lp, cy + p[1] * Lp]), PL.rgba(cols[k], 0.4), 1.5));
      S.ys.forEach((y, k) => {
        const x1 = cx + Lp * sin(y[0]), y1 = cy + Lp * cos(y[0]), x2 = x1 + Lp * sin(y[1]), y2 = y1 + Lp * cos(y[1]);
        d.line(cx, cy, x1, y1, PL.rgba(cols[k], 0.9), 2.5);
        d.line(x1, y1, x2, y2, PL.rgba(cols[k], 0.9), 2.5);
        d.ball(x1, y1, 8, cols[k]);
        d.ball(x2, y2, 8 + 3 * Math.cbrt(P.mr), cols[k]);
      });
      d.circle(cx, cy, 5, C.white);
      d.text('처음 각도 차이: ' + fmt(P.dl) + '° 씩', 20, 28, C.text, 13);
      const p = d.plot({ x: 600, y: 60, w: 270, h: 260, xmin: 0, xmax: 30, ymin: -7, ymax: 1, title: '각도 차이 log₁₀|δθ|', xl: 't (s)', yl: 'log₁₀ rad' });
      p.pts(S.hist, C.yellow, 2);
      p.hl(Math.log10(PI), C.red);
      p.label('최대 차이 ~π', 1, Math.log10(PI) + 0.35, C.red, 10);
      d.text('혼돈: 아주 작은 차이가 지수적으로 커진다', 600, 360, C.text, 12);
      d.text('예측 가능한 시간 ≈ (1/λ)·ln(허용 오차/δ)', 600, 384, C.dim, 12);
    },
  });
})();
