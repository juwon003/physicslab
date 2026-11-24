/* =====================================================================
 * 고전역학 (1/2) — 뉴턴의 운동 법칙 · 운동학 · 운동량과 충돌 · 일과 에너지 · 회전 운동
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, hypot, floor, atan2 } = Math;
  const add = (law) => PL.add('classical', law);
  const niceUp = (x) => {
    const e = Math.pow(10, floor(Math.log10(x)));
    for (const m of [1, 2, 5, 10]) if (m * e >= x) return m * e;
    return 10 * e;
  };

  /* ================================================================ 뉴턴의 운동 법칙 */
  add({
    id: 'newton1', cat: '뉴턴의 운동 법칙', name: '관성의 법칙 (뉴턴 제1법칙)', en: "Newton's First Law — Inertia",
    tex: '\\sum \\vec F = 0 \\;\\Longleftrightarrow\\; \\vec v = \\text{일정}',
    desc: '물체에 작용하는 알짜힘이 0이면 정지한 물체는 계속 정지해 있고, 움직이는 물체는 같은 속도로 직선 운동을 계속한다. 마찰 계수를 0으로 두면 퍽은 속력을 전혀 잃지 않고, 마찰이 있으면 마찰력이 알짜힘이 되어 속도가 일정하게 줄어든다. 카메라가 퍽을 따라가므로 흘러가는 바닥 눈금으로 속력을 읽을 수 있다.',
    params: [R('v0', '초기 속도 v₀', 'm/s', 0, 10, 0.1, 4, { reset: 1 }), R('mu', '운동 마찰 계수 μ', '', 0, 0.5, 0.01, 0), R('m', '질량 m', 'kg', 0.5, 10, 0.5, 2)],
    out: (P, S) => [
      ['알짜힘 (마찰력) F = μmg', S.v > 0 ? P.mu * P.m * K.g : 0, 'N'],
      ['가속도 a = −μg', S.v > 0 ? -P.mu * K.g : 0, 'm/s²'],
      ['현재 속도 v', S.v, 'm/s'],
      ['정지까지 거리 v₀²/(2μg)', P.mu > 0 ? (P.v0 * P.v0) / (2 * P.mu * K.g) : Infinity, 'm'],
      ['지금까지 이동 거리', S.x, 'm'],
    ],
    init(S, P) { S.x = 0; S.v = P.v0; S.hist = [[0, P.v0]]; },
    step(S, P, dt) {
      S.t += dt;
      if (S.v > 0) S.v = max(0, S.v - P.mu * K.g * dt);
      S.x += S.v * dt;
      S.hist.push([S.t, S.v]);
      if (S.hist.length > 1500) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const sc = 50, cx = 260, gy = 250;
      d.rect(0, gy, 900, 46, '#121d36');
      d.line(0, gy, 900, gy, '#7f8db0', 2);
      for (let i = floor(S.x - cx / sc) - 1; i <= S.x + (900 - cx) / sc + 1; i++) {
        const X = cx + (i - S.x) * sc, big = i % 5 === 0;
        d.line(X, gy, X, gy + (big ? 16 : 8), big ? C.text : C.dim, big ? 2 : 1);
        if (big) d.text(i + ' m', X, gy + 30, C.dim, 11, 'center');
      }
      const w = 44 + 12 * Math.cbrt(P.m), h = 26 + 5 * Math.cbrt(P.m);
      d.rect(cx - w / 2, gy - h, w, h, C.orange, '#ffd2a0', 1.5, 8);
      d.text(fmt(P.m) + ' kg', cx, gy - h / 2, '#2a1606', 12, 'center', 'middle', true);
      if (S.v > 0.001) {
        d.arrow(cx, gy - h - 24, cx + S.v * 22, gy - h - 24, C.green, 3);
        d.text('v = ' + fmt(S.v, 3) + ' m/s', cx, gy - h - 44, C.green, 13);
      }
      if (P.mu > 0 && S.v > 0.001) {
        const F = P.mu * P.m * K.g;
        d.arrow(cx - w / 2, gy - 8, cx - w / 2 - min(200, 10 + F * 3), gy - 8, C.red, 3);
        d.text('마찰력 ' + fmt(F, 3) + ' N', cx - w / 2 - 12, gy - 26, C.red, 12, 'right');
      }
      const msg = P.mu === 0 && S.v > 0 ? '알짜힘 = 0  →  속도가 변하지 않는다 (등속 직선 운동)'
        : S.v > 0.001 ? '알짜힘 = 마찰력  →  속도가 일정하게 줄어든다' : '정지 — 알짜힘이 0이므로 계속 정지해 있다';
      d.label(msg, 450, 46, P.mu === 0 || S.v <= 0.001 ? C.green : C.yellow, 14);
      const t1 = max(10, S.t), t0 = t1 - 10;
      const p = d.plot({ x: 70, y: 350, w: 790, h: 165, xmin: t0, xmax: t1, ymin: 0, ymax: max(1, P.v0) * 1.25, title: '속도-시간 그래프 v(t)', xl: '시간 t (s)', yl: 'v (m/s)' });
      p.pts(S.hist, C.green, 2.5);
    },
  });

  add({
    id: 'newton2', cat: '뉴턴의 운동 법칙', name: '가속도의 법칙 (뉴턴 제2법칙)', en: "Newton's Second Law",
    tex: ['\\vec F_{\\text{알짜}} = m\\vec a', 'a = \\frac{F - \\mu m g}{m}'],
    short: '\\vec F = m\\vec a',
    desc: '물체의 가속도는 알짜힘에 비례하고 질량에 반비례한다. 같은 힘이라도 질량이 크면 덜 가속되며(관성이 큼), 마찰이 있으면 미는 힘에서 마찰력을 뺀 알짜힘만 가속에 쓰인다. 아래 그래프에서 v(t)의 기울기가 가속도이다. 값을 바꾸면 이전 결과가 점선으로 남는다(8초마다 다시 시작).',
    params: [R('F', '미는 힘 F', 'N', 0, 60, 0.5, 20), R('m', '질량 m', 'kg', 0.5, 20, 0.5, 4), R('mu', '마찰 계수 μ', '', 0, 0.5, 0.01, 0)],
    out: (P, S) => {
      const fr = P.mu * P.m * K.g, net = max(0, P.F - fr);
      return [['마찰력 f', min(P.F, fr), 'N'], ['알짜힘 F − f', net, 'N'], ['가속도 a', net / P.m, 'm/s²'], ['현재 속도 v', S.v, 'm/s'], ['이동 거리 x', S.x, 'm']];
    },
    sub: (P) => {
      const net = max(0, P.F - P.mu * P.m * K.g);
      return `a = \\frac{${ft(P.F)} - ${ft(P.mu)}\\cdot ${ft(P.m)}\\cdot 9.81}{${ft(P.m)}} = ${ft(net / P.m)}\\ \\mathrm{m/s^2}`;
    },
    init(S) { S.x = 0; S.v = 0; S.hist = [[0, 0]]; S.ghost = null; },
    change(S) { if (S.t > 0.5) S.ghost = S.hist; S.t = 0; S.x = 0; S.v = 0; S.hist = [[0, 0]]; },
    step(S, P, dt) {
      S.t += dt;
      if (S.t > 8) { S.ghost = S.hist; S.t = 0; S.x = 0; S.v = 0; S.hist = [[0, 0]]; return; }
      const a = max(0, P.F - P.mu * P.m * K.g) / P.m;
      S.v += a * dt; S.x += S.v * dt;
      S.hist.push([S.t, S.v]);
    },
    draw(d, S, P) {
      d.clear();
      const sc = 6, gy = 240, cam = max(0, S.x - 80), bx = 120 + (S.x - cam) * sc;
      d.rect(0, gy, 900, 46, '#121d36');
      d.line(0, gy, 900, gy, '#7f8db0', 2);
      for (let i = floor(cam / 10) * 10 - 20; i <= cam + 160; i += 10) {
        const X = 120 + (i - cam) * sc;
        if (X < -20 || X > 920) continue;
        const big = i % 50 === 0;
        d.line(X, gy, X, gy + (big ? 16 : 8), big ? C.text : C.dim, 1.5);
        if (big) d.text(i + ' m', X, gy + 30, C.dim, 11, 'center');
      }
      const s3 = Math.cbrt(P.m / 4), w = 54 * s3 + 10, h = 36 * s3 + 6;
      const fr = P.mu * P.m * K.g, net = max(0, P.F - fr), a = net / P.m;
      d.rect(bx - w / 2, gy - h, w, h, C.orange, '#ffd2a0', 1.5, 6);
      d.text(fmt(P.m) + ' kg', bx, gy - h / 2, '#2a1606', 13, 'center', 'middle', true);
      if (P.F > 0) {
        const L = P.F * 2.6;
        d.arrow(bx - w / 2 - L - 2, gy - h / 2, bx - w / 2 - 2, gy - h / 2, C.red, 4);
        d.text('F = ' + fmt(P.F) + ' N', bx - w / 2 - L / 2, gy - h / 2 - 16, C.red, 12, 'center');
      }
      if (P.mu > 0 && P.F > 0) {
        const f = min(P.F, fr);
        d.arrow(bx, gy - 5, bx - f * 2.6, gy - 5, C.yellow, 3);
        d.text('마찰력 ' + fmt(f, 3) + ' N', bx - 6, gy + 22, C.yellow, 11, 'right');
      }
      if (a > 0) {
        d.arrow(bx, gy - h - 22, bx + min(230, 10 + a * 12), gy - h - 22, C.green, 3);
        d.text('a = ' + fmt(a, 3) + ' m/s²', bx, gy - h - 40, C.green, 13);
      } else d.label('미는 힘 ≤ 최대 정지 마찰력 → 알짜힘 0, 움직이지 않음', 450, 60, C.yellow, 13);
      const p = d.plot({ x: 70, y: 345, w: 790, h: 170, xmin: 0, xmax: 8, ymin: 0, ymax: 50, title: '속도-시간 그래프 (기울기 = 가속도 a = F/m)', xl: '시간 t (s)', yl: 'v (m/s)' });
      if (S.ghost) p.pts(S.ghost, 'rgba(160,175,210,0.45)', 2, [6, 5]);
      p.pts(S.hist, C.green, 2.5);
      p.dot(S.t, S.v, C.green);
    },
  });

  function person(d, x, gy, m, col, face, handX) {
    const s = Math.cbrt(m / 60);
    const hip = gy - 8 - 44 * s, sh = hip - 48 * s, hr = 11 * s;
    d.line(x - 17 * s, gy - 3, x + 17 * s, gy - 3, '#a9b6d6', 2.5);
    d.line(x, hip, x - 9 * s, gy - 8, col, 5 * s + 1);
    d.line(x, hip, x + 9 * s, gy - 8, col, 5 * s + 1);
    d.line(x, hip, x, sh, col, 9 * s + 3);
    d.circle(x, sh - hr - 4, hr, col);
    if (handX != null) d.line(x, sh + 6, handX, sh + 6, col, 4 * s + 1);
    else d.line(x, sh + 6, x - 9 * s * face, hip - 2, col, 4 * s + 1);
    return sh;
  }
  add({
    id: 'newton3', cat: '뉴턴의 운동 법칙', name: '작용·반작용 법칙 (뉴턴 제3법칙)', en: "Newton's Third Law",
    tex: ['\\vec F_{A\\to B} = -\\vec F_{B\\to A}', 'm_A v_A + m_B v_B = 0'],
    short: '\\vec F_{AB} = -\\vec F_{BA}',
    desc: '두 물체가 서로 힘을 주고받을 때 두 힘은 크기가 같고 방향이 반대이다. 빙판 위의 두 사람이 서로 밀면 같은 크기의 힘을 같은 시간 동안 받지만, 질량이 작은 쪽이 더 크게 가속된다. 처음에 정지해 있었으므로 두 운동량의 합은 언제나 0이다.',
    params: [R('m1', 'A의 질량 m_A', 'kg', 20, 120, 1, 80, { reset: 1 }), R('m2', 'B의 질량 m_B', 'kg', 20, 120, 1, 40, { reset: 1 }), R('F', '서로 미는 힘 F', 'N', 50, 600, 10, 200, { reset: 1 }), R('dt', '미는 시간 Δt', 's', 0.1, 1, 0.05, 0.5, { reset: 1 })],
    out: (P, S) => [
      ['A가 받는 힘 (B→A)', -P.F, 'N'], ['B가 받는 힘 (A→B)', P.F, 'N'],
      ['A의 가속도 −F/m_A', -P.F / P.m1, 'm/s²'], ['B의 가속도 F/m_B', P.F / P.m2, 'm/s²'],
      ['A의 최종 속도 −FΔt/m_A', (-P.F * P.dt) / P.m1, 'm/s'], ['B의 최종 속도 FΔt/m_B', (P.F * P.dt) / P.m2, 'm/s'],
      ['총 운동량 p_A + p_B', P.m1 * S.v1 + P.m2 * S.v2, 'kg·m/s'],
    ],
    init(S) { S.x1 = -0.35; S.x2 = 0.35; S.v1 = 0; S.v2 = 0; S.done = false; S.push = false; S.h1 = [[0, 0]]; S.h2 = [[0, 0]]; },
    step(S, P, dt) {
      S.t += dt;
      const t0 = 0.8;
      S.push = S.t > t0 && S.t < t0 + P.dt;
      if (S.push) { S.v1 -= (P.F / P.m1) * dt; S.v2 += (P.F / P.m2) * dt; }
      if (S.t >= t0 + P.dt && !S.done) { S.v1 = (-P.F * P.dt) / P.m1; S.v2 = (P.F * P.dt) / P.m2; S.done = true; }
      S.x1 += S.v1 * dt; S.x2 += S.v2 * dt;
      S.h1.push([S.t, S.v1]); S.h2.push([S.t, S.v2]);
      if (max(abs(S.x1), abs(S.x2)) > 9.3 || S.t > 10) { const t = 0; this.init(S, P); S.t = t; }
    },
    draw(d, S, P) {
      d.clear();
      const sc = 45, cx = 450, gy = 290, t0 = 0.8;
      d.rect(0, gy, 900, 26, 'rgba(150,200,255,0.10)');
      d.line(0, gy, 900, gy, '#9cc7f0', 2);
      d.text('빙판 (마찰 없음)', 16, gy + 14, C.dim, 11);
      const X1 = cx + S.x1 * sc, X2 = cx + S.x2 * sc, contact = S.t < t0 + P.dt, mid = (X1 + X2) / 2;
      const sh1 = person(d, X1, gy, P.m1, C.orange, -1, contact ? mid : null);
      person(d, X2, gy, P.m2, C.cyan, 1, contact ? mid : null);
      d.text('A ' + P.m1 + ' kg', X1, gy + 42, C.orange, 13, 'center', 'middle', true);
      d.text('B ' + P.m2 + ' kg', X2, gy + 42, C.cyan, 13, 'center', 'middle', true);
      if (S.push) {
        const L = 18 + P.F * 0.2, y = sh1 - 40;
        d.arrow(mid - 3, y, mid - 3 - L, y, C.red, 4);
        d.arrow(mid + 3, y, mid + 3 + L, y, C.red, 4);
        d.text('B가 A를 미는 힘 ' + P.F + ' N', mid - 8 - L, y - 18, C.red, 12, 'left');
        d.text('A가 B를 미는 힘 ' + P.F + ' N', mid + 8 + L, y - 18, C.red, 12, 'right');
      }
      if (S.done) {
        d.arrow(X1, gy + 62, X1 + M.clamp(S.v1 * 30, -220, 220), gy + 62, C.green, 3);
        d.arrow(X2, gy + 62, X2 + M.clamp(S.v2 * 30, -220, 220), gy + 62, C.green, 3);
        d.text(fmt(S.v1, 3) + ' m/s', X1, gy + 78, C.green, 11, 'center');
        d.text(fmt(S.v2, 3) + ' m/s', X2, gy + 78, C.green, 11, 'center');
      }
      const msg = S.t < t0 ? '준비 — 두 사람이 손을 맞대고 정지' : S.push ? '서로 미는 중: 두 힘은 크기가 같고 방향이 반대' : '밀기 끝 — 가벼운 쪽이 더 빠르게 멀어진다';
      d.label(msg, 450, 36, S.push ? C.red : C.text, 14);
      const vmax = max(P.F * P.dt / P.m1, P.F * P.dt / P.m2) * 1.25;
      const p = d.plot({ x: 70, y: 410, w: 420, h: 110, xmin: 0, xmax: 10, ymin: -vmax, ymax: vmax, title: '속도 v(t)', xl: 't (s)', yl: 'v (m/s)', ny: 2 });
      p.pts(S.h1, C.orange, 2); p.pts(S.h2, C.cyan, 2);
      const pm = P.F * P.dt;
      d.bars(560, 380, 310, 160, [['p_A', P.m1 * S.v1, C.orange], ['p_B', P.m2 * S.v2, C.cyan], ['합', P.m1 * S.v1 + P.m2 * S.v2, C.yellow]], pm * 1.1, '운동량 (kg·m/s)');
    },
  });

  add({
    id: 'incline', cat: '뉴턴의 운동 법칙', name: '마찰력과 빗면', en: 'Friction on an Inclined Plane',
    tex: ['N = mg\\cos\\theta,\\quad f_s \\le \\mu_s N,\\quad f_k = \\mu_k N', 'a = g(\\sin\\theta - \\mu_k\\cos\\theta)\\quad (\\tan\\theta > \\mu_s\\ \\text{이면 미끄러짐})'],
    short: 'f = \\mu N',
    desc: '빗면 위 물체의 중력은 빗면에 나란한 성분 mg sinθ와 수직 성분 mg cosθ로 나뉜다. 수직항력 N이 마찰력의 크기를 정하고, 나란한 성분이 최대 정지 마찰력 μₛN을 넘으면(tanθ > μₛ) 물체가 미끄러지기 시작한다. 경사각을 조금씩 올려 임계각을 찾아보자. 왼쪽 위 그래프는 각도에 따른 마찰력의 변화이다.',
    params: [R('th', '경사각 θ', '°', 0, 60, 0.5, 25), R('ms', '정지 마찰 계수 μₛ', '', 0, 1, 0.01, 0.5), R('mk', '운동 마찰 계수 μₖ', '', 0, 1, 0.01, 0.3), R('m', '질량 m', 'kg', 1, 10, 0.5, 2)],
    fix(P) { if (P.mk > P.ms) P.mk = P.ms; },
    out: (P, S) => {
      const th = M.rad(P.th), mg = P.m * K.g, N = mg * cos(th);
      const slide = S.v > 0 || Math.tan(th) > P.ms;
      return [
        ['수직항력 N = mg cosθ', N, 'N'], ['빗면 방향 중력 mg sinθ', mg * sin(th), 'N'],
        ['최대 정지 마찰력 μₛN', P.ms * N, 'N'], ['상태', slide ? '미끄러짐' : '정지 (정지 마찰)', ''],
        ['가속도 a', slide ? max(0, K.g * (sin(th) - P.mk * cos(th))) : 0, 'm/s²'],
        ['임계각 tan⁻¹μₛ', M.deg(Math.atan(P.ms)), '°'],
      ];
    },
    init(S) { S.s = 0; S.v = 0; S.wait = 0; },
    step(S, P, dt) {
      const th = M.rad(P.th), LEN = 5;
      if (S.s >= LEN) { S.wait += dt; if (S.wait > 0.8) { S.s = 0; S.v = 0; S.wait = 0; } return; }
      if (S.v > 0) {
        S.v += K.g * (sin(th) - P.mk * cos(th)) * dt;
        if (S.v <= 0) S.v = 0;
      } else if (Math.tan(th) > P.ms) S.v = 1e-6;
      S.s = min(LEN, S.s + S.v * dt);
    },
    draw(d, S, P) {
      d.clear();
      const th = M.rad(P.th), Bx = 850, By = 500, LEN = 5;
      const Lp = min(560, 300 / max(sin(th), 0.01)), Tx = Bx - Lp * cos(th), Ty = By - Lp * sin(th);
      d.poly([[Tx, Ty], [Bx, By], [Tx, By]], '#6b7aa0', 2, true, 'rgba(93,107,143,0.22)');
      d.ground(40, 880, By);
      if (P.th > 0.5) { d.arc(Bx, By, 50, PI, PI + th, C.yellow, 2); d.text('θ = ' + P.th + '°', Bx - 58, By - 14, C.yellow, 13, 'right'); }
      const ux = cos(th), uy = sin(th), nx = sin(th), ny = -cos(th), bw = 56, bh = 34;
      const sp = 34 + (S.s / LEN) * (Lp - 68);
      const X = Tx + ux * sp + nx * (bh / 2), Y = Ty + uy * sp + ny * (bh / 2);
      const g = d.g;
      g.save(); g.translate(X, Y); g.rotate(th);
      d.rect(-bw / 2, -bh / 2, bw, bh, C.orange, '#ffd2a0', 1.5, 4);
      d.text(fmt(P.m) + ' kg', 0, 0, '#2a1606', 12, 'center', 'middle', true);
      g.restore();
      const mg = P.m * K.g, N = mg * cos(th), par = mg * sin(th), moving = S.v > 0;
      const fric = moving ? P.mk * N : min(par, P.ms * N), sc = 85 / mg;
      d.line(X, Y, X + ux * par * sc, Y + uy * par * sc, PL.rgba(C.red, 0.6), 2, [5, 4]);
      d.line(X, Y, X - nx * N * sc, Y - ny * N * sc, PL.rgba(C.red, 0.6), 2, [5, 4]);
      d.arrow(X, Y, X, Y + mg * sc, C.red, 3);
      d.arrow(X, Y, X + nx * N * sc, Y + ny * N * sc, C.cyan, 3);
      if (fric > 0.01) d.arrow(X, Y, X - ux * fric * sc, Y - uy * fric * sc, C.yellow, 3);
      d.text('mg', X + 6, Y + mg * sc + 4, C.red, 12);
      d.text('N', X + nx * N * sc + 6, Y + ny * N * sc - 4, C.cyan, 12);
      if (fric > 0.01) d.text(moving ? 'fₖ' : 'fₛ', X - ux * fric * sc - 14, Y - uy * fric * sc - 6, C.yellow, 12);
      d.label(moving ? '미끄러지는 중 (운동 마찰)' : Math.tan(th) > P.ms ? '미끄러지기 시작' : '정지 — 정지 마찰력이 mg sinθ와 평형', 620, 32, moving ? C.orange : C.green, 13);
      const thc = M.deg(Math.atan(P.ms));
      const p = d.plot({ x: 60, y: 56, w: 270, h: 150, xmin: 0, xmax: 60, ymin: 0, ymax: mg * 1.05, title: '경사각에 따른 마찰력', xl: 'θ (°)', yl: 'f (N)', ny: 3 });
      p.fn((a) => (a <= thc ? mg * sin(M.rad(a)) : P.mk * mg * cos(M.rad(a))), C.yellow, 2);
      p.fn((a) => P.ms * mg * cos(M.rad(a)), 'rgba(255,216,77,0.35)', 1.5, 200, [4, 4]);
      p.vl(thc, C.red);
      p.dot(P.th, P.th <= thc && !moving ? mg * sin(th) : P.mk * mg * cos(th), C.yellow);
    },
  });

  /* ================================================================ 운동학 */
  add({
    id: 'kinematics', cat: '운동학', name: '등가속도 직선 운동', en: 'Uniformly Accelerated Motion',
    tex: ['v = v_0 + at', 'x = x_0 + v_0 t + \\tfrac12 a t^2', 'v^2 - v_0^2 = 2a(x - x_0)'],
    short: 'x = v_0 t + \\tfrac12 a t^2',
    desc: '가속도가 일정하면 속도는 시간에 대해 직선으로, 위치는 포물선으로 변한다. 속도-시간 그래프 아래 넓이(색칠된 부분)가 변위이고, 위치-시간 그래프의 기울기가 속도이다. 초기 속도와 가속도의 부호가 반대이면 물체는 잠시 멈췄다가 반대 방향으로 되돌아온다.',
    params: [R('v0', '초기 속도 v₀', 'm/s', -10, 20, 0.5, 2), R('a', '가속도 a', 'm/s²', -5, 5, 0.1, 1.5), R('T', '관찰 시간', 's', 2, 10, 0.5, 8)],
    out: (P, S) => {
      const t = S.t, rows = [['시간 t', t, 's'], ['속도 v = v₀ + at', P.v0 + P.a * t, 'm/s'], ['위치 x', P.v0 * t + 0.5 * P.a * t * t, 'm'], ['관찰 끝 위치 x(T)', P.v0 * P.T + 0.5 * P.a * P.T * P.T, 'm']];
      if (P.a !== 0 && P.v0 * P.a < 0) rows.push(['방향이 바뀌는 시각 −v₀/a', -P.v0 / P.a, 's']);
      return rows;
    },
    sub: (P, S) => `x(${ft(S.t, 2)}) = (${ft(P.v0)})(${ft(S.t, 2)}) + \\tfrac12(${ft(P.a)})(${ft(S.t, 2)})^2 = ${ft(P.v0 * S.t + 0.5 * P.a * S.t * S.t)}\\ \\mathrm{m}`,
    init(S) { S.t = 0; S.wait = 0; },
    step(S, P, dt) {
      if (S.t >= P.T) { S.wait += dt; if (S.wait > 1.2) { S.t = 0; S.wait = 0; } }
      else S.t = min(P.T, S.t + dt);
    },
    draw(d, S, P) {
      d.clear();
      const X = (t) => P.v0 * t + 0.5 * P.a * t * t, V = (t) => P.v0 + P.a * t;
      const cand = [0, X(P.T)];
      if (P.a !== 0) { const tt = -P.v0 / P.a; if (tt > 0 && tt < P.T) cand.push(X(tt)); }
      let x0 = Math.min(...cand), x1 = Math.max(...cand);
      if (x1 - x0 < 5) { const c = (x0 + x1) / 2; x0 = c - 2.5; x1 = c + 2.5; }
      const pad = (x1 - x0) * 0.08; x0 -= pad; x1 += pad;
      d.text('도로 위의 위치 x (m)', 60, 36, C.text, 12, 'left', 'middle', true);
      const road = d.plot({ x: 60, y: 60, w: 780, h: 80, xmin: x0, xmax: x1, ymin: 0, ymax: 1, grid: false, bg: false, frame: false, nx: 8, yticks: false });
      d.rect(60, 104, 780, 36, '#1a2440');
      d.line(60, 122, 840, 122, 'rgba(255,255,255,0.35)', 2, [14, 12]);
      const cx = road.X(X(S.t)), v = V(S.t), dir = v >= 0 ? 1 : -1;
      d.rect(cx - 22, 96, 44, 22, C.orange, null, 0, 6);
      d.rect(cx - 12 + dir * 4, 90, 24, 10, '#ffc788', null, 0, 4);
      d.circle(cx - 13, 118, 6, '#222'); d.circle(cx + 13, 118, 6, '#222');
      road.vl(0, C.dim, [3, 3]);
      if (abs(v) > 0.01) { d.arrow(cx, 68, cx + v * 6, 68, C.green, 3); d.text('v = ' + fmt(v, 3), cx + v * 6 + (v > 0 ? 6 : -6), 68, C.green, 12, v > 0 ? 'left' : 'right'); }
      const xs = [], vs = [];
      for (let i = 0; i <= 200; i++) { const t = (P.T * i) / 200; xs.push(X(t)); vs.push(V(t)); }
      const pxmin = Math.min(...xs), pxmax = Math.max(...xs), pvmin = Math.min(0, ...vs), pvmax = Math.max(0, ...vs);
      const p1 = d.plot({ x: 70, y: 230, w: 360, h: 270, xmin: 0, xmax: P.T, ymin: pxmin - 0.08 * (pxmax - pxmin + 1), ymax: pxmax + 0.08 * (pxmax - pxmin + 1), title: '위치-시간 x(t)  (기울기 = 속도)', xl: 't (s)', yl: 'x (m)' });
      p1.fn(X, 'rgba(56,189,248,0.3)', 2);
      p1.fn(X, C.cyan, 3, 120, null, 0, max(S.t, 1e-6));
      p1.dot(S.t, X(S.t), C.cyan);
      const sl = V(S.t), dx = P.T * 0.12;
      p1.pts([[S.t - dx, X(S.t) - sl * dx], [S.t + dx, X(S.t) + sl * dx]], C.yellow, 1.5, [4, 3]);
      const p2 = d.plot({ x: 510, y: 230, w: 360, h: 270, xmin: 0, xmax: P.T, ymin: pvmin - 0.1 * (pvmax - pvmin + 1), ymax: pvmax + 0.1 * (pvmax - pvmin + 1), title: '속도-시간 v(t)  (넓이 = 변위)', xl: 't (s)', yl: 'v (m/s)' });
      p2.area(V, 'rgba(74,222,128,0.22)', 0, max(S.t, 1e-6));
      p2.fn(V, C.green, 3);
      p2.dot(S.t, V(S.t), C.green);
    },
  });

  add({
    id: 'projectile', cat: '운동학', name: '포물선 운동', en: 'Projectile Motion',
    tex: ['x = v_0\\cos\\theta\\,t,\\qquad y = v_0\\sin\\theta\\,t - \\tfrac12 g t^2', 'R = \\frac{v_0^2\\sin 2\\theta}{g},\\qquad H = \\frac{v_0^2\\sin^2\\theta}{2g}'],
    short: 'R = \\frac{v_0^2\\sin 2\\theta}{g}',
    desc: '수평 방향으로는 힘이 없어 등속 운동을, 수직 방향으로는 중력 때문에 등가속도 운동을 한다. 두 운동을 합치면 포물선 궤적이 된다. 공기 저항이 없으면 수평 도달 거리는 45°에서 최대이고, 30°와 60°처럼 합이 90°인 두 각도는 같은 지점에 떨어진다. 값을 바꾸면 이전 궤적이 흐리게 남아 비교할 수 있다.',
    params: [R('v0', '초기 속력 v₀', 'm/s', 1, 50, 0.5, 20), R('th', '발사각 θ', '°', 0, 90, 1, 45), R('g', '중력 가속도 g', 'm/s²', 1, 25, 0.01, 9.81), Chk('drag', '공기 저항이 있을 때 궤적 비교 (k = 0.1/s)', false)],
    out: (P, S) => {
      const th = M.rad(P.th), T = (2 * P.v0 * sin(th)) / P.g, t = min(S.t, T);
      return [['수평 도달 거리 R', (P.v0 ** 2 * sin(2 * th)) / P.g, 'm'], ['최고 높이 H', (P.v0 * sin(th)) ** 2 / (2 * P.g), 'm'], ['체공 시간 2v₀sinθ/g', T, 's'], ['vₓ (항상 일정)', P.v0 * cos(th), 'm/s'], ['현재 v_y = v₀sinθ − gt', P.v0 * sin(th) - P.g * t, 'm/s'], ['최대 사거리 (45°)', P.v0 ** 2 / P.g, 'm']];
    },
    sub: (P) => `R = \\frac{(${ft(P.v0)})^2\\,\\sin(2\\times${ft(P.th)}^\\circ)}{${ft(P.g)}} = ${ft((P.v0 ** 2 * sin(2 * M.rad(P.th))) / P.g)}\\ \\mathrm{m}`,
    init(S) { S.t = 0; S.ghosts = []; S.wait = 0; },
    change(S, P, k) {
      if (k === 'drag') return;
      if (S.last && S.t > 0.4) { S.ghosts.push(S.last); if (S.ghosts.length > 4) S.ghosts.shift(); }
      S.t = 0; S.wait = 0;
    },
    step(S, P, dt) {
      const th = M.rad(P.th), T = (2 * P.v0 * sin(th)) / P.g, warp = max(1, T / 3);
      S.last = { v0: P.v0, th: P.th, g: P.g };
      if (S.t >= T) { S.wait += dt; if (S.wait > 1) { S.t = 0; S.wait = 0; } }
      else S.t = min(T, S.t + dt * warp);
    },
    draw(d, S, P) {
      d.clear();
      const Rm = P.v0 ** 2 / P.g, Wm = niceUp(Rm * 1.08), s = 760 / Wm, ox = 70, oy = 490;
      const sx = (x) => ox + x * s, sy = (y) => oy - y * s;
      for (const v of PL.ticks(0, 440 / s, 5)) {
        if (v === 0) continue;
        d.line(ox, sy(v), 880, sy(v), 'rgba(140,160,210,0.07)', 1);
        d.text(fmt(v), ox - 8, sy(v), C.dim, 10, 'right');
      }
      d.ground(40, 885, oy);
      for (const v of PL.ticks(0, Wm, 8)) { d.line(sx(v), oy, sx(v), oy + 6, C.dim, 1); d.text(fmt(v) + ' m', sx(v), oy + 18, C.dim, 10, 'center'); }
      const path = (q, tmax) => {
        const th = M.rad(q.th), T = (2 * q.v0 * sin(th)) / q.g, pts = [], te = tmax == null ? T : min(tmax, T);
        for (let i = 0; i <= 120; i++) { const t = (te * i) / 120; pts.push([sx(q.v0 * cos(th) * t), sy(q.v0 * sin(th) * t - 0.5 * q.g * t * t)]); }
        return pts;
      };
      d.clip(0, 0, 900, oy + 1);
      S.ghosts.forEach((q, i) => d.poly(path(q), `rgba(167,139,250,${0.25 + 0.1 * i})`, 2, false, null, [5, 5]));
      if (P.drag) {
        const k = 0.1, th = M.rad(P.th), vx = P.v0 * cos(th), vy = P.v0 * sin(th), pts = [];
        for (let i = 0; i <= 400; i++) {
          const t = i * 0.02 * max(1, P.v0 / P.g), e = 1 - exp(-k * t);
          const x = (vx / k) * e, y = ((vy + P.g / k) / k) * e - (P.g / k) * t;
          pts.push([sx(x), sy(y)]);
          if (y < 0 && i > 0) break;
        }
        d.poly(pts, C.pink, 2, false, null, [3, 4]);
        d.text('공기 저항 있음', pts[pts.length - 1][0], oy - 14, C.pink, 11, 'center');
      }
      d.poly(path(P), 'rgba(255,159,67,0.3)', 2);
      d.poly(path(P, S.t), C.orange, 3);
      d.unclip();
      const th = M.rad(P.th), T = (2 * P.v0 * sin(th)) / P.g, t = min(S.t, T);
      const x = P.v0 * cos(th) * t, y = P.v0 * sin(th) * t - 0.5 * P.g * t * t, vx = P.v0 * cos(th), vy = P.v0 * sin(th) - P.g * t;
      const H = (P.v0 * sin(th)) ** 2 / (2 * P.g), R = P.v0 * cos(th) * T;
      d.line(sx(R / 2), sy(H), sx(R / 2), oy, 'rgba(255,216,77,0.4)', 1, [3, 4]);
      d.text('H = ' + fmt(H, 3) + ' m', sx(R / 2) + 6, sy(H) - 10, C.yellow, 11);
      d.text('R = ' + fmt(R, 3) + ' m', sx(R), oy - 12, C.orange, 11, 'center');
      const X = sx(x), Y = sy(y), k = 2.6;
      d.arrow(X, Y, X + vx * k, Y, C.cyan, 2.5);
      d.arrow(X, Y, X, Y - vy * k, C.pink, 2.5);
      d.arrow(X, Y, X + vx * k, Y - vy * k, C.yellow, 2);
      d.ball(X, Y, 9, C.orange);
      d.text('vₓ', X + vx * k + 4, Y + 10, C.cyan, 12);
      d.text('v_y', X + 8, Y - vy * k, C.pink, 12);
      d.arc(ox, oy, 36, -th, 0, C.yellow, 1.5);
      d.text(P.th + '°', ox + 42, oy - 12, C.yellow, 11);
    },
  });

  add({
    id: 'circular', cat: '운동학', name: '등속 원운동과 구심력', en: 'Uniform Circular Motion',
    tex: ['a_c = \\frac{v^2}{r} = \\omega^2 r,\\qquad F_c = m\\frac{v^2}{r}', 'T = \\frac{2\\pi r}{v},\\qquad \\omega = \\frac{v}{r}'],
    short: 'a_c = \\frac{v^2}{r}',
    desc: '속력이 일정해도 방향이 계속 바뀌므로 원운동은 가속도 운동이다. 가속도(빨강)는 항상 원의 중심을 향하며 이를 만드는 힘이 구심력이다. "줄 끊기"를 켜면 구심력이 사라져 물체가 그 순간 속도(초록)의 방향, 즉 접선 방향으로 곧게 날아간다. 오른쪽 그래프는 원운동을 옆에서 보면 단진동임을 보여 준다.',
    params: [R('r', '반지름 r', 'm', 0.5, 5, 0.1, 3), R('v', '속력 v', 'm/s', 0.5, 10, 0.1, 4), R('m', '질량 m', 'kg', 0.1, 10, 0.1, 1), Chk('cut', '줄 끊기 (구심력 제거)', false)],
    out: (P) => [['각속도 ω = v/r', P.v / P.r, 'rad/s'], ['주기 T = 2πr/v', (2 * PI * P.r) / P.v, 's'], ['진동수 f', P.v / (2 * PI * P.r), 'Hz'], ['구심 가속도 v²/r', P.v ** 2 / P.r, 'm/s²'], ['구심력 F_c = mv²/r', (P.m * P.v ** 2) / P.r, 'N']],
    sub: (P) => `F_c = \\frac{(${ft(P.m)})(${ft(P.v)})^2}{${ft(P.r)}} = ${ft((P.m * P.v ** 2) / P.r)}\\ \\mathrm{N}`,
    init(S) { S.phi = 0.6; S.free = null; S.hist = []; S.wait = 0; },
    change(S, P, k) { if (k === 'cut' && !P.cut) S.free = null; },
    step(S, P, dt) {
      S.t += dt;
      if (P.cut) {
        if (!S.free) {
          if (S.wait > 0) { S.wait -= dt; S.phi += (P.v / P.r) * dt; }
          else S.free = { x: P.r * cos(S.phi), y: P.r * sin(S.phi), vx: -P.v * sin(S.phi), vy: P.v * cos(S.phi), trail: [] };
        } else {
          const f = S.free;
          f.x += f.vx * dt; f.y += f.vy * dt; f.trail.push([f.x, f.y]);
          if (hypot(f.x, f.y) > 7.5) { S.free = null; S.wait = 0.8; S.phi += 1.4; }
        }
      } else S.phi += (P.v / P.r) * dt;
      const x = S.free ? S.free.x : P.r * cos(S.phi), y = S.free ? S.free.y : P.r * sin(S.phi);
      S.hist.push([S.t, x, y]);
      if (S.hist.length > 700) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const cx = 255, cy = 285, sc = 44, rp = P.r * sc;
      d.circle(cx, cy, rp, null, 'rgba(160,180,225,0.3)', 1.5);
      d.circle(cx, cy, 5, C.text);
      let x, y, vx, vy;
      const att = !S.free;
      if (att) { x = P.r * cos(S.phi); y = P.r * sin(S.phi); vx = -P.v * sin(S.phi); vy = P.v * cos(S.phi); }
      else { x = S.free.x; y = S.free.y; vx = S.free.vx; vy = S.free.vy; d.poly(S.free.trail.map((p) => [cx + p[0] * sc, cy - p[1] * sc]), 'rgba(74,222,128,0.5)', 2, false, null, [4, 4]); }
      const X = cx + x * sc, Y = cy - y * sc;
      if (att) d.line(cx, cy, X, Y, '#9aa6c4', 1.5);
      d.arrow(X, Y, X + vx * 13, Y - vy * 13, C.green, 3);
      if (att) {
        const L = min(140, 12 + ((P.v * P.v) / P.r) * 5);
        d.arrow(X, Y, X - (x / P.r) * L, Y + (y / P.r) * L, C.red, 3);
      }
      d.ball(X, Y, 9 + 4 * Math.cbrt(P.m), C.orange);
      d.text('속도 v (접선 방향)', 20, 30, C.green, 12);
      d.text('구심 가속도 a_c (중심 방향)', 20, 50, C.red, 12);
      if (!att) d.label('구심력이 사라짐 → 관성에 의해 접선 방향으로 직진', 255, 530, C.yellow, 13);
      const t1 = max(6, S.t), p = d.plot({ x: 560, y: 60, w: 310, h: 200, xmin: t1 - 6, xmax: t1, ymin: -5.5, ymax: 5.5, title: '옆에서 본 위치: x(t), y(t)', xl: 't (s)', yl: 'm' });
      p.pts(S.hist.map((h) => [h[0], h[1]]), C.cyan, 2);
      p.pts(S.hist.map((h) => [h[0], h[2]]), C.pink, 2);
      d.text('x(t) = r cos ωt', 570, 290, C.cyan, 12);
      d.text('y(t) = r sin ωt', 720, 290, C.pink, 12);
      const p2 = d.plot({ x: 560, y: 340, w: 310, h: 170, xmin: 0, xmax: 10, ymin: 0, ymax: (P.m * 100) / P.r, title: '구심력 F_c와 속력 v (F_c ∝ v²)', xl: 'v (m/s)', yl: 'F_c (N)' });
      p2.fn((v) => (P.m * v * v) / P.r, C.red, 2);
      p2.dot(P.v, (P.m * P.v * P.v) / P.r, C.red);
    },
  });

  /* ================================================================ 운동량과 충돌 */
  add({
    id: 'momentum', cat: '운동량과 충돌', name: '운동량', en: 'Linear Momentum',
    tex: '\\vec p = m\\vec v',
    desc: '운동량은 질량과 속도의 곱으로, 물체가 가진 "운동의 양"을 나타내는 벡터이다. 아래 레인의 공은 질량이 4배, 속력이 1/4로 위의 공과 운동량은 같지만 운동 에너지는 1/4이다. 공이 벽에 부딪혀 튕겨 나오면 운동량의 방향이 뒤집히며, 그 변화량 2mv가 벽이 공에 준 충격량이다.',
    params: [R('m', '질량 m', 'kg', 0.1, 10, 0.1, 2), R('v', '속도 v', 'm/s', -10, 10, 0.1, 3)],
    out: (P, S) => [['운동량 p = mv', P.m * P.v, 'kg·m/s'], ['현재 운동량 (방향 포함)', P.m * S.v, 'kg·m/s'], ['운동 에너지 K = p²/2m', 0.5 * P.m * P.v * P.v, 'J'], ['벽 충돌 시 운동량 변화 2mv', 2 * P.m * abs(P.v), 'kg·m/s'], ['아래 공 (4m, v/4)의 운동 에너지', 0.5 * 4 * P.m * (P.v / 4) ** 2, 'J']],
    sub: (P) => `p = (${ft(P.m)}\\ \\mathrm{kg})(${ft(P.v)}\\ \\mathrm{m/s}) = ${ft(P.m * P.v)}\\ \\mathrm{kg\\cdot m/s}`,
    init(S, P) { S.x = -2; S.v = P.v; S.x2 = 2; S.v2 = P.v / 4; S.hist = []; S.fl = 0; },
    change(S, P, k) {
      if (k === 'v') { S.v = P.v; S.v2 = P.v / 4; }
      else { S.v = Math.sign(S.v || 1) * abs(P.v); S.v2 = Math.sign(S.v2 || 1) * abs(P.v / 4); }
    },
    step(S, P, dt) {
      S.t += dt;
      const r1 = 0.22 * Math.cbrt(P.m) + 0.12, r2 = 0.22 * Math.cbrt(4 * P.m) + 0.12, L = 8;
      S.x += S.v * dt; S.x2 += S.v2 * dt;
      if (S.x + r1 > L && S.v > 0) { S.v = -S.v; S.fl = 0.25; S.fx = 1; }
      if (S.x - r1 < -L && S.v < 0) { S.v = -S.v; S.fl = 0.25; S.fx = -1; }
      if (S.x2 + r2 > L && S.v2 > 0) S.v2 = -S.v2;
      if (S.x2 - r2 < -L && S.v2 < 0) S.v2 = -S.v2;
      S.fl = max(0, S.fl - dt);
      S.hist.push([S.t, P.m * S.v]);
      if (S.hist.length > 900) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const sc = 45, cx = 450, r1 = 0.22 * Math.cbrt(P.m) + 0.12, r2 = 0.22 * Math.cbrt(4 * P.m) + 0.12;
      const lane = (y, x, v, r, m, col, label) => {
        d.rect(cx - 8 * sc, y + r * sc, 16 * sc, 6, '#1e2a48');
        d.wall(cx - 8 * sc, y - 60, y + r * sc + 6, C.dim, -1);
        d.wall(cx + 8 * sc, y - 60, y + r * sc + 6, C.dim, 1);
        const X = cx + x * sc;
        d.ball(X, y, r * sc, col);
        const p = m * v, L = M.clamp(p * 12, -330, 330);
        if (abs(L) > 2) d.arrow(X, y - r * sc - 14, X + L, y - r * sc - 14, C.yellow, 3);
        d.text(`${label}  m = ${fmt(m, 3)} kg,  v = ${fmt(v, 3)} m/s,  p = ${fmt(p, 3)} kg·m/s`, cx - 8 * sc + 10, y - 62, C.text, 12);
      };
      lane(140, S.x, S.v, r1, P.m, C.orange, '공 A');
      lane(275, S.x2, S.v2, r2, 4 * P.m, C.cyan, '공 B (4m, v/4)');
      if (S.fl > 0) d.label('충돌! 운동량 변화 Δp = 2mv = ' + fmt(2 * P.m * abs(P.v), 3) + ' kg·m/s', cx + S.fx * 200, 60, C.red, 12);
      const pm = max(1, abs(P.m * P.v)) * 1.35, t1 = max(10, S.t);
      const p = d.plot({ x: 70, y: 365, w: 790, h: 150, xmin: t1 - 10, xmax: t1, ymin: -pm, ymax: pm, title: '공 A의 운동량 p(t) — 벽에 부딪힐 때마다 부호가 바뀜', xl: 't (s)', yl: 'p (kg·m/s)', ny: 4 });
      p.pts(S.hist, C.yellow, 2.5);
    },
  });

  add({
    id: 'impulse', cat: '운동량과 충돌', name: '충격량-운동량 정리', en: 'Impulse–Momentum Theorem',
    tex: ['\\vec J = \\int \\vec F\\,dt = \\bar F\\,\\Delta t = \\Delta\\vec p', '\\Delta p = m(1+e)v'],
    short: 'J = \\bar F\\Delta t = \\Delta p',
    desc: '물체가 받은 충격량(힘 × 시간)은 운동량의 변화량과 같다. 같은 운동량 변화라도 충돌 시간이 길어지면 평균 힘이 줄어든다 — 에어백, 낙법, 무릎을 굽혀 착지하는 동작이 모두 이 원리이다. 그래프에서 실선과 점선(충돌 시간 5배)은 넓이, 즉 충격량이 같다. 충돌 장면은 슬로 모션이다.',
    params: [R('m', '공의 질량 m', 'kg', 0.05, 5, 0.05, 0.5), R('v', '충돌 전 속력 v', 'm/s', 1, 30, 0.5, 12), R('dt', '충돌 시간 Δt', 's', 0.002, 0.2, 0.001, 0.02), R('e', '반발 계수 e', '', 0, 1, 0.05, 0.8)],
    out: (P) => {
      const J = P.m * P.v * (1 + P.e);
      return [['운동량 변화 Δp = m(1+e)v', J, 'kg·m/s'], ['충격량 J', J, 'N·s'], ['평균 힘 F̄ = J/Δt', J / P.dt, 'N'], ['최대 힘 (반사인 모양) πF̄/2', ((PI / 2) * J) / P.dt, 'N'], ['튀어나오는 속력 ev', P.e * P.v, 'm/s'], ['충돌 시간 5배일 때 평균 힘', J / (5 * P.dt), 'N']];
    },
    sub: (P) => { const J = P.m * P.v * (1 + P.e); return `\\bar F = \\frac{\\Delta p}{\\Delta t} = \\frac{${ft(J)}}{${ft(P.dt)}} = ${ft(J / P.dt)}\\ \\mathrm{N}`; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const D = 0.4 + 5 * P.dt, tA = 1.1, tB = tA + D, tC = tB + 1.2, ph = S.t % tC;
      const wx = 760, r = 26, gy = 170;
      d.rect(wx, 60, 30, 220, '#3a4668');
      d.wall(wx, 60, 280, C.dim, 1);
      d.text('벽', wx + 15, 50, C.dim, 12, 'center');
      let X, sq = 0, phase;
      const depth = M.clamp(0.12 + P.v * P.dt * 1.6, 0.12, 0.5);
      if (ph < tA) { X = wx - r - (tA - ph) * 330; phase = '접근'; }
      else if (ph < tB) { const s = (ph - tA) / D; sq = depth * sin(PI * s); X = wx - r * (1 - sq); phase = '충돌 중'; }
      else { X = wx - r - (ph - tB) * 330 * P.e; phase = '튀어나감'; }
      const g = d.g;
      g.save(); g.translate(X, gy); g.scale(1 - sq, 1 + sq * 0.6);
      d.ball(0, 0, r, C.orange);
      g.restore();
      d.line(40, gy + r * 1.3 + 2, wx, gy + r * 1.3 + 2, '#2a3658', 2);
      if (ph < tA) d.arrow(X - r - 6, gy, X - r - 6 - P.v * 6, gy, C.green, 3);
      if (ph >= tB) d.arrow(X - r - 6, gy, X - r - 6 - P.e * P.v * 6, gy, C.green, 3);
      d.label(phase + (ph >= tA && ph < tB ? ' — 벽이 공에 힘을 가함 (슬로 모션)' : ''), 400, 40, ph >= tA && ph < tB ? C.red : C.text, 13);
      const J = P.m * P.v * (1 + P.e), Fp = ((PI / 2) * J) / P.dt, t2 = 5 * P.dt;
      const p = d.plot({ x: 70, y: 320, w: 790, h: 190, xmin: 0, xmax: 5.6 * P.dt * 1000, ymin: 0, ymax: Fp * 1.15, title: '충돌하는 동안 벽이 공에 가한 힘 F(t)', xl: 't (ms)', yl: 'F (N)' });
      const F1 = (tm) => (tm >= 0 && tm <= P.dt * 1000 ? Fp * sin((PI * tm) / (P.dt * 1000)) : 0);
      const F2 = (tm) => (tm >= 0 && tm <= t2 * 1000 ? (Fp / 5) * sin((PI * tm) / (t2 * 1000)) : 0);
      p.area(F1, 'rgba(255,159,67,0.3)', 0, P.dt * 1000);
      p.fn(F1, C.orange, 2.5, 400);
      p.area(F2, 'rgba(56,189,248,0.12)', 0, t2 * 1000);
      p.fn(F2, C.cyan, 2, 400, [5, 4]);
      p.pts([[0, J / P.dt], [P.dt * 1000, J / P.dt]], C.yellow, 1.5, [3, 3]);
      p.label('평균 힘 F̄', P.dt * 1000 + 0.05 * P.dt * 1000, J / P.dt, C.yellow, 11);
      p.label('충돌 시간 5배 (같은 넓이 = 같은 충격량)', t2 * 1000 * 0.55, Fp / 5 + Fp * 0.08, C.cyan, 11, 'center');
      if (ph >= tA && ph < tB) p.vl(((ph - tA) / D) * P.dt * 1000, C.red, null, 2);
    },
  });

  add({
    id: 'collision', cat: '운동량과 충돌', name: '운동량 보존과 충돌', en: 'Conservation of Momentum in Collisions',
    tex: ["m_1v_1 + m_2v_2 = m_1v_1' + m_2v_2'", "e = -\\frac{v_1' - v_2'}{v_1 - v_2}\\quad(e = 1\\ \\text{탄성},\\ e = 0\\ \\text{완전 비탄성})"],
    short: "m_1v_1+m_2v_2 = m_1v_1'+m_2v_2'",
    desc: '외력이 없으면 충돌 전후 운동량의 총합은 보존된다. 반발 계수 e가 1이면 운동 에너지도 보존되는 탄성 충돌, 0이면 두 물체가 한 덩어리로 붙어 움직이는 완전 비탄성 충돌이다. 노란 삼각형으로 표시한 질량중심은 충돌과 관계없이 같은 속도로 움직인다.',
    params: [R('m1', '수레 1 질량 m₁', 'kg', 0.5, 10, 0.5, 2, { reset: 1 }), R('m2', '수레 2 질량 m₂', 'kg', 0.5, 10, 0.5, 1, { reset: 1 }), R('v1', '수레 1 속도 v₁', 'm/s', -5, 5, 0.1, 3, { reset: 1 }), R('v2', '수레 2 속도 v₂', 'm/s', -5, 5, 0.1, -1, { reset: 1 }), R('e', '반발 계수 e', '', 0, 1, 0.05, 1, { reset: 1 })],
    after(P) {
      const s = P.m1 + P.m2, p = P.m1 * P.v1 + P.m2 * P.v2;
      return [(p + P.m2 * P.e * (P.v2 - P.v1)) / s, (p + P.m1 * P.e * (P.v1 - P.v2)) / s];
    },
    out(P, S) {
      const [a, b] = this.after(P), K0 = 0.5 * P.m1 * P.v1 ** 2 + 0.5 * P.m2 * P.v2 ** 2, K1 = 0.5 * P.m1 * a * a + 0.5 * P.m2 * b * b;
      return [["충돌 후 v₁'", a, 'm/s'], ["충돌 후 v₂'", b, 'm/s'], ['총 운동량 (전)', P.m1 * P.v1 + P.m2 * P.v2, 'kg·m/s'], ['총 운동량 (후)', P.m1 * a + P.m2 * b, 'kg·m/s'], ['운동 에너지 (전 → 후)', fmt(K0) + ' → ' + fmt(K1), 'J'], ['손실된 운동 에너지', K0 - K1, 'J'], ['상태', P.v1 > P.v2 ? (S.hit ? '충돌 후' : '충돌 전') : '서로 가까워지지 않아 충돌하지 않음', '']];
    },
    init(S, P) { S.x1 = -3; S.x2 = 3; S.u1 = P.v1; S.u2 = P.v2; S.hit = false; },
    step(S, P, dt) {
      S.t += dt;
      const w1 = 0.35 * Math.cbrt(P.m1) + 0.25, w2 = 0.35 * Math.cbrt(P.m2) + 0.25;
      S.x1 += S.u1 * dt; S.x2 += S.u2 * dt;
      if (!S.hit && S.x2 - S.x1 <= (w1 + w2) / 2 && S.u1 > S.u2) {
        const [a, b] = this.after(P);
        S.u1 = a; S.u2 = b; S.hit = true;
        const ov = (w1 + w2) / 2 - (S.x2 - S.x1);
        S.x1 -= ov / 2; S.x2 += ov / 2;
      }
      if ((abs(S.x1) > 9 && abs(S.x2) > 9) || S.t > 9) { this.init(S, P); S.t = 0; }
    },
    draw(d, S, P) {
      d.clear();
      const sc = 48, cx = 450, gy = 210;
      d.rect(0, gy + 22, 900, 8, '#2a3658');
      for (let i = -9; i <= 9; i++) d.line(cx + i * sc, gy + 30, cx + i * sc, gy + 36, C.faint, 1);
      const cart = (x, m, col, u, nm) => {
        const w = (0.35 * Math.cbrt(m) + 0.25) * sc, h = 22 + 12 * Math.cbrt(m), X = cx + x * sc;
        d.rect(X - w / 2, gy - h + 12, w, h, col, null, 0, 6);
        d.circle(X - w / 3, gy + 16, 7, '#1b2236', '#9aa6c4', 1.5);
        d.circle(X + w / 3, gy + 16, 7, '#1b2236', '#9aa6c4', 1.5);
        d.text(nm, X, gy - h / 2 + 12, '#0a1020', 13, 'center', 'middle', true);
        if (abs(u) > 0.01) d.arrow(X, gy - h - 6, X + u * 30, gy - h - 6, C.green, 3);
        d.text(fmt(u, 3) + ' m/s', X, gy - h - 24, C.green, 11, 'center');
      };
      cart(S.x1, P.m1, C.orange, S.u1, '1');
      cart(S.x2, P.m2, C.cyan, S.u2, '2');
      const xc = (P.m1 * S.x1 + P.m2 * S.x2) / (P.m1 + P.m2), Xc = cx + xc * sc;
      d.poly([[Xc, gy + 40], [Xc - 7, gy + 52], [Xc + 7, gy + 52]], null, 0, true, C.yellow);
      d.text('질량중심', Xc, gy + 64, C.yellow, 11, 'center');
      d.label(P.v1 > P.v2 ? (S.hit ? '충돌 후 — 운동량의 합은 그대로' : '충돌 전') : '수레가 서로 가까워지지 않음 (충돌 없음)', 450, 40, S.hit ? C.green : C.text, 14);
      const [a, b] = this.after(P);
      const u1 = S.hit ? a : P.v1, u2 = S.hit ? b : P.v2, pm = max(abs(P.m1 * P.v1), abs(P.m2 * P.v2), abs(P.m1 * a), abs(P.m2 * b), 1) * 1.1;
      d.bars(60, 330, 380, 200, [['p₁', P.m1 * u1, C.orange], ['p₂', P.m2 * u2, C.cyan], ['합', P.m1 * u1 + P.m2 * u2, C.yellow]], pm, '운동량 ' + (S.hit ? '(충돌 후)' : '(충돌 전)') + '  kg·m/s');
      const K0 = 0.5 * P.m1 * P.v1 ** 2 + 0.5 * P.m2 * P.v2 ** 2;
      const k1 = 0.5 * P.m1 * u1 * u1, k2 = 0.5 * P.m2 * u2 * u2;
      d.bars(470, 330, 380, 200, [['K₁', k1, C.orange], ['K₂', k2, C.cyan], ['합', k1 + k2, C.yellow], ['손실', K0 - k1 - k2, C.red]], max(K0, 0.1) * 1.1, '운동 에너지 (J)');
    },
  });

  add({
    id: 'rocket', cat: '운동량과 충돌', name: '로켓 방정식 (치올코프스키)', en: 'Tsiolkovsky Rocket Equation',
    tex: ['\\Delta v = v_e \\ln\\frac{m_0}{m_f}', 'F_{\\text{추력}} = v_e\\,\\dot m'],
    short: '\\Delta v = v_e\\ln\\frac{m_0}{m_f}',
    desc: '로켓은 연료를 뒤로 빠르게 내뿜고 그 반작용(운동량 보존)으로 앞으로 가속한다. 얻는 속도 변화는 배기 속도와 질량비의 로그에 비례하므로, 질량비를 두 배로 늘려도 Δv는 vₑ·ln2만큼만 늘어난다. 중력을 켜면 수직 발사에서 중력 손실(약 g·t)만큼 덜 빨라지고, 추력이 무게보다 작으면 이륙하지 못한다.',
    params: [R('ve', '배기 속도 vₑ', 'm/s', 500, 4500, 50, 3000, { reset: 1 }), R('m0', '초기 질량 m₀', 't', 10, 500, 5, 100, { reset: 1 }), R('mf', '연료 소진 후 질량 m_f', 't', 1, 100, 1, 20, { reset: 1 }), R('tb', '연소 시간', 's', 10, 300, 5, 120, { reset: 1 }), Chk('grav', '지표면 중력 포함 (수직 발사)', false, { reset: 1 })],
    fix(P) { if (P.mf > floor(P.m0 * 0.95)) P.mf = max(1, floor(P.m0 * 0.95)); },
    out: (P, S) => {
      const md = ((P.m0 - P.mf) * 1000) / P.tb;
      return [['이상적 Δv = vₑ ln(m₀/m_f)', P.ve * Math.log(P.m0 / P.mf), 'm/s'], ['질량비 m₀/m_f', P.m0 / P.mf, ''], ['추력 vₑṁ', P.ve * md, 'N'], ['처음 가속도 (추력/m₀)', (P.ve * md) / (P.m0 * 1000) - (P.grav ? K.g : 0), 'm/s²'], ['현재 속도', S.v, 'm/s'], ['현재 질량', S.m / 1000, 't'], ['고도', S.h / 1000, 'km']];
    },
    sub: (P) => `\\Delta v = ${ft(P.ve)}\\,\\ln\\frac{${ft(P.m0)}}{${ft(P.mf)}} = ${ft(P.ve * Math.log(P.m0 / P.mf))}\\ \\mathrm{m/s}`,
    init(S, P) {
      S.m = P.m0 * 1000; S.v = 0; S.h = 0; S.tr = 0; S.hist = [[0, 0]];
      S.stars = Array.from({ length: 90 }, () => [Math.random() * 420, Math.random() * 560, Math.random()]);
    },
    step(S, P, dt) {
      const warp = P.tb / 6, total = P.tb * 1.5, md = ((P.m0 - P.mf) * 1000) / P.tb, n = 20, h = (dt * warp) / n;
      for (let i = 0; i < n; i++) {
        const burning = S.tr < P.tb;
        let a = (burning ? (P.ve * md) / S.m : 0) - (P.grav ? K.g : 0);
        if (S.h <= 0 && a < 0 && S.v <= 0) a = 0;
        S.v += a * h; S.h = max(0, S.h + S.v * h);
        if (S.h <= 0 && S.v < 0) S.v = 0;
        if (burning) S.m = max(P.mf * 1000, S.m - md * h);
        S.tr += h;
      }
      S.hist.push([S.tr, S.v]);
      const sp = min(1800, S.v * 0.25);
      S.stars.forEach((s) => { s[1] += sp * (0.4 + s[2]) * dt; if (s[1] > 560) { s[1] -= 560; s[0] = Math.random() * 420; } });
      if (S.tr > total) this.init(S, P);
    },
    draw(d, S, P) {
      d.clear(false, '#050816');
      S.stars.forEach((s) => d.circle(s[0], s[1], 0.6 + s[2] * 1.2, `rgba(255,255,255,${0.35 + 0.5 * s[2]})`));
      const X = 210, Y = 250, burning = S.tr < P.tb;
      if (burning) {
        const fl = 40 + 40 * Math.random() + 50 * ((P.m0 - P.mf) / P.m0);
        d.glow(X, Y + 80, 60, 'rgba(255,160,60,0.6)');
        d.poly([[X - 14, Y + 62], [X, Y + 62 + fl], [X + 14, Y + 62]], null, 0, true, 'rgba(255,190,80,0.9)');
        d.poly([[X - 7, Y + 62], [X, Y + 62 + fl * 0.6], [X + 7, Y + 62]], null, 0, true, '#fff7d6');
      }
      d.poly([[X, Y - 80], [X + 20, Y - 40], [X + 20, Y + 60], [X - 20, Y + 60], [X - 20, Y - 40]], '#cfd8ee', 1.5, true, '#e9eef9');
      d.poly([[X - 20, Y + 20], [X - 38, Y + 64], [X - 20, Y + 58]], null, 0, true, C.red);
      d.poly([[X + 20, Y + 20], [X + 38, Y + 64], [X + 20, Y + 58]], null, 0, true, C.red);
      d.circle(X, Y - 30, 7, '#5b8cff', '#2a3558', 2);
      const frac = (S.m / 1000 - P.mf) / (P.m0 - P.mf);
      d.rect(X - 12, Y - 12, 24, 68, '#2a3558');
      d.rect(X - 12, Y - 12 + 68 * (1 - frac), 24, 68 * frac, C.orange);
      d.text('연료', X + 30, Y + 20, C.orange, 11);
      d.text(fmt(S.tr, 3) + ' s ' + (burning ? '(연소 중)' : '(관성 비행)'), 30, 30, C.text, 13);
      d.text('v = ' + fmt(S.v, 4) + ' m/s', 30, 52, C.green, 14, 'left', 'middle', true);
      const tot = P.tb * 1.5, dv = P.ve * Math.log(P.m0 / P.mf);
      const p = d.plot({ x: 500, y: 50, w: 370, h: 300, xmin: 0, xmax: tot, ymin: 0, ymax: dv * 1.15, title: '속도 v(t)', xl: 't (s)', yl: 'v (m/s)' });
      const md = ((P.m0 - P.mf) * 1000) / P.tb;
      p.fn((t) => P.ve * Math.log((P.m0 * 1000) / (P.m0 * 1000 - md * min(t, P.tb))), 'rgba(255,216,77,0.8)', 2, 200, [6, 4]);
      p.pts(S.hist, C.green, 2.5);
      p.hl(dv, C.yellow, [2, 4], 1);
      p.label('이상적: vₑ ln(m₀/m)', tot * 0.04, dv * 1.07, C.yellow, 11);
      d.text('실선: 시뮬레이션 ' + (P.grav ? '(중력 포함)' : '(중력 없음)'), 510, 400, C.green, 12);
      d.text('질량비가 2배가 되어도 Δv는 vₑ ln2 = ' + fmt(P.ve * Math.LN2) + ' m/s 만큼만 증가', 510, 424, C.dim, 12);
    },
  });

  /* ================================================================ 일과 에너지 */
  add({
    id: 'workenergy', cat: '일과 에너지', name: '일-운동 에너지 정리', en: 'Work–Energy Theorem',
    tex: ['W = \\vec F\\cdot\\Delta\\vec x = Fd\\cos\\theta', 'W_{\\text{알짜}} = \\Delta K = \\tfrac12 mv^2 - \\tfrac12 mv_0^2'],
    short: 'W = Fd\\cos\\theta = \\Delta K',
    desc: '힘이 물체에 한 일은 힘의 이동 방향 성분과 이동 거리의 곱이다. 각도 θ로 당기면 수직 성분 F sinθ는 일을 하지 않고 수평 성분 F cosθ만 일을 한다. 마찰 없는 바닥에서 알짜힘이 한 일은 그대로 운동 에너지 증가량이 된다. θ = 90°이면 아무리 세게 당겨도 한 일은 0이다.',
    params: [R('F', '당기는 힘 F', 'N', 0, 50, 0.5, 20), R('th', '당기는 각도 θ', '°', 0, 90, 1, 30), R('d', '힘을 가하는 거리 d', 'm', 1, 10, 0.5, 6), R('m', '질량 m', 'kg', 1, 20, 0.5, 4)],
    out: (P, S) => {
      const th = M.rad(P.th), W = P.F * P.d * cos(th), rows = [['수평 성분 F cosθ (일을 함)', P.F * cos(th), 'N'], ['수직 성분 F sinθ (일을 안 함)', P.F * sin(th), 'N'], ['총 일 W = Fd cosθ', W, 'J'], ['최종 속력 √(2W/m)', sqrt((2 * max(W, 0)) / P.m), 'm/s'], ['지금까지 한 일', S.W, 'J'], ['현재 운동 에너지 ½mv²', 0.5 * P.m * S.v * S.v, 'J']];
      if (P.F * sin(th) > P.m * K.g) rows.push('주의: F sinθ > mg 이므로 실제로는 물체가 바닥에서 들린다.');
      return rows;
    },
    sub: (P) => `W = (${ft(P.F)})(${ft(P.d)})\\cos ${ft(P.th)}^\\circ = ${ft(P.F * P.d * cos(M.rad(P.th)))}\\ \\mathrm{J}`,
    init(S) { S.x = 0; S.v = 0; S.W = 0; S.wait = 0; },
    change(S) { S.x = 0; S.v = 0; S.W = 0; S.wait = 0; },
    step(S, P, dt) {
      const Fx = P.F * cos(M.rad(P.th));
      if (S.x < P.d) {
        const a = Fx / P.m;
        const xn = S.x + S.v * dt + 0.5 * a * dt * dt;
        S.v += a * dt;
        S.W += Fx * (min(xn, P.d) - S.x);
        S.x = xn;
        if (S.x >= P.d) S.v = sqrt((2 * Fx * P.d) / P.m);
        if (Fx <= 0) { S.wait += dt; if (S.wait > 2) S.wait = 0; }
      } else {
        S.x += S.v * dt; S.wait += dt;
        if (S.wait > 1.5 || S.x > P.d + 1.5) { S.x = 0; S.v = 0; S.W = 0; S.wait = 0; }
      }
    },
    draw(d, S, P) {
      d.clear();
      const s = 640 / (P.d + 1.5), ox = 110, gy = 250, th = M.rad(P.th);
      d.rect(ox, gy, P.d * s, 10, 'rgba(255,159,67,0.25)');
      d.ground(30, 880, gy);
      d.text('힘을 가하는 구간 d = ' + P.d + ' m', ox + (P.d * s) / 2, gy + 26, C.orange, 12, 'center');
      const X = ox + min(S.x, P.d + 1.5) * s, bw = 56, bh = 40;
      d.rect(X - bw / 2, gy - bh, bw, bh, C.orange, '#ffd2a0', 1.5, 5);
      d.text(fmt(P.m) + ' kg', X, gy - bh / 2, '#2a1606', 12, 'center', 'middle', true);
      if (S.x < P.d && P.F > 0) {
        const L = 40 + P.F * 2.4, ax = X + bw / 2, ay = gy - bh + 6;
        d.line(ax, ay, ax + cos(th) * L, ay - sin(th) * L, '#c9b48a', 2);
        d.arrow(ax, ay, ax + cos(th) * L, ay - sin(th) * L, C.red, 3);
        d.line(ax, ay, ax + cos(th) * L, ay, C.green, 2.5, [5, 3]);
        d.line(ax + cos(th) * L, ay, ax + cos(th) * L, ay - sin(th) * L, C.purple, 2.5, [5, 3]);
        d.text('F', ax + cos(th) * L + 8, ay - sin(th) * L, C.red, 13);
        d.text('F cosθ', ax + (cos(th) * L) / 2, ay + 14, C.green, 11, 'center');
        if (P.th > 5) d.text('F sinθ', ax + cos(th) * L + 6, ay - (sin(th) * L) / 2, C.purple, 11);
        if (P.th > 0) d.arc(ax, ay, 26, -th, 0, C.yellow, 1.5);
      }
      if (S.v > 0.01) { d.arrow(X, gy - bh - 26, X + S.v * 12, gy - bh - 26, C.cyan, 3); d.text('v = ' + fmt(S.v, 3) + ' m/s', X, gy - bh - 44, C.cyan, 12); }
      const Fx = P.F * cos(th), W = Fx * P.d;
      const p = d.plot({ x: 70, y: 330, w: 470, h: 180, xmin: 0, xmax: P.d + 1.5, ymin: 0, ymax: max(5, P.F * 1.1), title: '힘의 수평 성분 F cosθ — 넓이 = 한 일 W', xl: '위치 x (m)', yl: 'Fₓ (N)' });
      const fx = (x) => (x <= P.d ? Fx : 0);
      p.area(fx, 'rgba(74,222,128,0.28)', 0, min(S.x, P.d) || 1e-6);
      p.fn(fx, C.green, 2.5, 400);
      p.vl(S.x, C.orange);
      d.bars(600, 300, 270, 230, [['한 일 W', S.W, C.orange], ['운동 에너지 K', 0.5 * P.m * S.v * S.v, C.cyan]], max(1, W) * 1.15, '에너지 (J)');
    },
  });

  const hb = (x) => 0.1 * x * x + 2.2 * exp(-x * x / 2);
  const hbp = (x) => 0.2 * x - 2.2 * x * exp(-x * x / 2);
  const hbpp = (x) => 0.2 - 2.2 * exp(-x * x / 2) * (1 - x * x);
  add({
    id: 'energycons', cat: '일과 에너지', name: '역학적 에너지 보존', en: 'Conservation of Mechanical Energy',
    tex: ['E = K + U = \\tfrac12 mv^2 + mgh = \\text{일정}', 'v = \\sqrt{2g(h_0 - h)}'],
    short: 'E = \\tfrac12mv^2 + mgh',
    desc: '마찰이 없으면 운동 에너지와 위치 에너지는 서로 바뀔 뿐 합은 일정하다. 공은 처음 높이(점선 = 총에너지)까지만 올라갈 수 있고, 가장 낮은 곳에서 가장 빠르다. 처음 높이를 가운데 언덕(2.2 m)보다 낮추면 공은 넘어가지 못하고 한쪽 골짜기에 갇힌다. 마찰을 켜면 역학적 에너지 일부가 열(Q)로 바뀌어 공이 점점 낮게 올라간다.',
    params: [R('h0', '처음 높이 h₀', 'm', 1, 10, 0.1, 7, { reset: 1 }), R('m', '질량 m', 'kg', 0.5, 10, 0.5, 1), R('mu', '마찰 계수 μ', '', 0, 0.3, 0.005, 0)],
    out: (P, S) => {
      const U = P.m * K.g * hb(S.x), Kk = 0.5 * P.m * S.v * S.v;
      return [['운동 에너지 K', Kk, 'J'], ['위치 에너지 U = mgh', U, 'J'], ['열로 바뀐 에너지 Q', S.Q * P.m, 'J'], ['K + U + Q (= 처음 mgh₀)', Kk + U + S.Q * P.m, 'J'], ['현재 높이 h', hb(S.x), 'm'], ['현재 속력 |v|', abs(S.v), 'm/s'], ['최저점 최대 속력 (마찰 없을 때)', sqrt(2 * K.g * (P.h0 - 0.68)), 'm/s']];
    },
    init(S, P) { S.x = M.bisect((x) => hb(x) - P.h0, -10, -2.19); S.v = 0; S.Q = 0; S.stuck = false; },
    step(S, P, dt) {
      const n = 40, h = dt / n;
      for (let i = 0; i < n; i++) {
        const fp = hbp(S.x), ca = 1 / sqrt(1 + fp * fp), sa = fp * ca, kap = hbpp(S.x) * ca * ca * ca;
        const Nm = max(0, K.g * ca + S.v * S.v * kap);
        if (abs(S.v) < 0.03 && abs(sa) <= P.mu * ca + 1e-9 && P.mu > 0) { S.v = 0; S.stuck = true; continue; }
        S.stuck = false;
        let at = -K.g * sa;
        if (P.mu > 0) at -= Math.sign(S.v || -sa) * P.mu * Nm;
        S.v += at * h;
        S.Q += P.mu * Nm * abs(S.v) * h;
        S.x += S.v * ca * h;
        if (S.x < -10) { S.x = -10; S.v = abs(S.v); }
        if (S.x > 10) { S.x = 10; S.v = -abs(S.v); }
      }
      if (P.mu === 0) {
        const vv = 2 * K.g * (P.h0 - hb(S.x));
        if (vv > 0) S.v = Math.sign(S.v || 1) * sqrt(vv);
        S.Q = 0;
      }
    },
    draw(d, S, P) {
      d.clear();
      const X = (x) => 360 + x * 30, Y = (h) => 470 - h * 38;
      const pts = [];
      for (let i = 0; i <= 200; i++) { const x = -10 + i * 0.1; pts.push([X(x), Y(hb(x))]); }
      d.poly(pts.concat([[X(10), 500], [X(-10), 500]]), null, 0, true, 'rgba(93,107,143,0.18)');
      d.poly(pts, '#8fa0c9', 3);
      for (let h = 0; h <= 10; h += 2) { d.line(X(-10) - 6, Y(h), X(-10), Y(h), C.dim, 1); d.text(h + ' m', X(-10) - 10, Y(h), C.dim, 10, 'right'); }
      const hE = hb(S.x) + (S.v * S.v) / (2 * K.g);
      d.line(X(-10), Y(hE), X(10), Y(hE), 'rgba(255,216,77,0.7)', 1.5, [6, 5]);
      d.text('총에너지 높이 E/mg = ' + fmt(hE, 3) + ' m', X(10), Y(hE) - 10, C.yellow, 11, 'right');
      d.line(X(-10), Y(P.h0), X(10), Y(P.h0), 'rgba(255,255,255,0.15)', 1, [2, 4]);
      const fp = hbp(S.x), sx = 30, sy = -38 * fp, nn = hypot(sx, sy), tx = sx / nn, ty = sy / nn, nx = ty, ny = -tx, rr = 13;
      const bx = X(S.x) + nx * rr, by = Y(hb(S.x)) + ny * rr;
      d.ball(bx, by, rr, C.orange);
      if (abs(S.v) > 0.05) d.arrow(bx, by, bx + tx * S.v * 9 * Math.sign(1), by + ty * S.v * 9, C.green, 2.5);
      d.text('v = ' + fmt(abs(S.v), 3) + ' m/s', 40, 40, C.green, 13);
      if (S.stuck) d.label('정지 마찰로 멈춤', X(S.x), Y(hb(S.x)) - 40, C.yellow, 12);
      const Kk = 0.5 * P.m * S.v * S.v, U = P.m * K.g * hb(S.x), E0 = P.m * K.g * P.h0;
      d.bars(712, 60, 176, 330, [['K', Kk, C.green], ['U', U, C.blue], ['Q', S.Q * P.m, C.red], ['합', Kk + U + S.Q * P.m, C.yellow]], E0 * 1.08, '에너지 (J)');
    },
  });

  /* ================================================================ 회전 운동 */
  add({
    id: 'torque', cat: '회전 운동', name: '돌림힘과 회전 운동 방정식', en: 'Torque & Rotational Dynamics',
    tex: ['\\tau = rF\\sin\\phi = I\\alpha', 'I_{\\text{원판}} = \\tfrac12 MR^2'],
    short: '\\tau = rF\\sin\\phi = I\\alpha',
    desc: '회전을 일으키는 능력인 돌림힘(토크)은 회전축에서 힘의 작용점까지의 거리 r, 힘의 크기 F, 두 방향 사이 각 φ의 사인 값의 곱이다. 점선은 회전축에서 힘의 작용선까지의 수직 거리(지레 팔 r sinφ)이다. 힘을 축에서 멀리, 수직으로 가할수록 바퀴가 빨리 돌기 시작하고, 각가속도는 관성 모멘트 I에 반비례한다.',
    params: [R('r', '작용점 거리 r', 'm', 0.1, 1, 0.05, 0.8), R('F', '힘 F', 'N', 0, 50, 0.5, 10), R('phi', '각 φ (r과 F 사이)', '°', 0, 180, 1, 90), R('Mw', '바퀴 질량 M (반지름 R = 1 m)', 'kg', 1, 20, 0.5, 5)],
    out: (P, S) => {
      const tau = P.r * P.F * sin(M.rad(P.phi)), I = 0.5 * P.Mw;
      return [['돌림힘 τ', tau, 'N·m'], ['지레 팔 r sinφ', P.r * sin(M.rad(P.phi)), 'm'], ['관성 모멘트 I = ½MR²', I, 'kg·m²'], ['각가속도 α = τ/I', tau / I, 'rad/s²'], ['현재 각속도 ω', S.w, 'rad/s'], ['회전 운동 에너지 ½Iω²', 0.5 * I * S.w * S.w, 'J']];
    },
    sub: (P) => `\\tau = (${ft(P.r)})(${ft(P.F)})\\sin ${ft(P.phi)}^\\circ = ${ft(P.r * P.F * sin(M.rad(P.phi)))}\\ \\mathrm{N\\cdot m}`,
    init(S) { S.th = 0; S.w = 0; S.hist = [[0, 0]]; },
    change(S) { S.t = 0; S.th = 0; S.w = 0; S.hist = [[0, 0]]; },
    step(S, P, dt) {
      S.t += dt;
      if (S.t > 6) { S.t = 0; S.th = 0; S.w = 0; S.hist = [[0, 0]]; return; }
      const a = (P.r * P.F * sin(M.rad(P.phi))) / (0.5 * P.Mw);
      S.w += a * dt; S.th += S.w * dt;
      S.hist.push([S.t, S.w]);
    },
    draw(d, S, P) {
      d.clear();
      const cx = 260, cy = 290, Rp = 190, ang = -S.th;
      d.circle(cx, cy, Rp, 'rgba(60,72,110,0.35)', '#8fa0c9', 4);
      for (let k = 0; k < 6; k++) { const a = ang + (k * PI) / 3; d.line(cx, cy, cx + Rp * cos(a), cy + Rp * sin(a), 'rgba(143,160,201,0.5)', 3); }
      d.circle(cx, cy, 12, '#cfd8ee');
      const px = cx + P.r * Rp * cos(ang), py = cy + P.r * Rp * sin(ang);
      d.line(cx, cy, px, py, C.orange, 4);
      d.text('r', (cx + px) / 2 + 8 * sin(ang), (cy + py) / 2 - 8 * cos(ang), C.orange, 14, 'center', 'middle', true);
      const fa = ang - M.rad(P.phi), L = P.F * 3.2, fx = px + L * cos(fa), fy = py + L * sin(fa);
      if (P.F > 0) {
        d.line(px - 400 * cos(fa), py - 400 * sin(fa), px + 400 * cos(fa), py + 400 * sin(fa), 'rgba(255,92,108,0.25)', 1, [4, 6]);
        const t = (cx - px) * cos(fa) + (cy - py) * sin(fa), qx = px + t * cos(fa), qy = py + t * sin(fa);
        d.line(cx, cy, qx, qy, C.yellow, 2, [5, 4]);
        d.text('r sinφ', (cx + qx) / 2 + 8, (cy + qy) / 2, C.yellow, 12);
        d.arrow(px, py, fx, fy, C.red, 4);
        d.text('F', fx + 8, fy, C.red, 14, 'left', 'middle', true);
      }
      d.circle(px, py, 6, C.white);
      const tau = P.r * P.F * sin(M.rad(P.phi));
      if (abs(tau) > 1e-6) {
        const a0 = -PI / 2 - 0.9, a1 = -PI / 2 + 0.9, rr = Rp + 26, ccw = tau > 0;
        d.arc(cx, cy, rr, a0, a1, C.green, 3);
        const ea = ccw ? a0 : a1, dx = ccw ? sin(ea) : -sin(ea), dy = ccw ? -cos(ea) : cos(ea);
        const ex = cx + rr * cos(ea), ey = cy + rr * sin(ea);
        d.arrow(ex - dx * 14, ey - dy * 14, ex + dx * 4, ey + dy * 4, C.green, 3, 12);
        d.text(ccw ? '반시계 방향 회전' : '시계 방향 회전', cx, cy - rr - 16, C.green, 12, 'center');
      }
      const I = 0.5 * P.Mw, al = tau / I, wmax = max(1, abs(al) * 6) * 1.1;
      const p = d.plot({ x: 560, y: 50, w: 310, h: 200, xmin: 0, xmax: 6, ymin: min(0, -wmax * (al < 0 ? 1 : 0.05)), ymax: al < 0 ? wmax * 0.05 : wmax, title: '각속도 ω(t) — 기울기 = α', xl: 't (s)', yl: 'ω (rad/s)' });
      p.pts(S.hist, C.green, 2.5);
      const p2 = d.plot({ x: 560, y: 320, w: 310, h: 190, xmin: 0, xmax: 180, ymin: 0, ymax: max(1, P.r * P.F) * 1.1, title: '각도 φ에 따른 돌림힘 τ = rF sinφ', xl: 'φ (°)', yl: 'τ (N·m)', nx: 6 });
      p2.fn((a) => P.r * P.F * sin(M.rad(a)), C.red, 2);
      p2.dot(P.phi, tau, C.red);
    },
  });

  const SHAPES = [
    { n: '상자 (마찰 없이 미끄러짐)', b: 0, col: '#9aa6c4' },
    { n: '속 찬 구  I = ⅖mR²', b: 0.4, col: C.orange },
    { n: '원판  I = ½mR²', b: 0.5, col: C.green },
    { n: '속 빈 구  I = ⅔mR²', b: 2 / 3, col: C.cyan },
    { n: '고리  I = mR²', b: 1, col: C.pink },
  ];
  add({
    id: 'rolling', cat: '회전 운동', name: '관성 모멘트와 굴림 운동', en: 'Moment of Inertia & the Rolling Race',
    tex: ['a = \\frac{g\\sin\\theta}{1 + I/(mR^2)}', 'I = \\beta mR^2:\\ \\ \\text{고리}\\ 1,\\ \\text{속 빈 구}\\ \\tfrac23,\\ \\text{원판}\\ \\tfrac12,\\ \\text{속 찬 구}\\ \\tfrac25'],
    short: 'a = \\frac{g\\sin\\theta}{1 + I/mR^2}',
    desc: '빗면을 미끄러짐 없이 굴러 내려가는 물체는 위치 에너지의 일부를 회전 운동 에너지로 써야 한다. 질량이 회전축에서 멀리 분포할수록(관성 모멘트가 클수록) 회전에 더 많은 에너지가 들어가 느리게 내려간다. 결과는 질량이나 반지름과 무관하고 모양(β = I/mR²)만으로 정해진다. 각 레인은 빗면을 따라 내려간 거리를 나타낸다.',
    params: [R('th', '빗면 각도 θ', '°', 2, 60, 1, 20, { reset: 1 }), R('L', '빗면 길이 L', 'm', 1, 10, 0.5, 4, { reset: 1 })],
    out: (P) => SHAPES.map((s) => [s.n.split(' ')[0] + ' 도착 시간 (a = ' + fmt((K.g * sin(M.rad(P.th))) / (1 + s.b), 3) + ' m/s²)', sqrt((2 * P.L) / ((K.g * sin(M.rad(P.th))) / (1 + s.b))), 's']),
    init(S) { S.t = 0; S.wait = 0; },
    step(S, P, dt) {
      const a = (K.g * sin(M.rad(P.th))) / 2, tmax = sqrt((2 * P.L) / a);
      S.t += dt;
      if (S.t > tmax + 1.5) S.t = 0;
    },
    draw(d, S, P) {
      d.clear();
      const x0 = 210, x1 = 840, th = M.rad(P.th);
      const hg = min(46, 100 * Math.tan(th)), bs = hg / Math.tan(th);
      d.poly([[150 - bs, 76], [150, 76], [150, 76 - hg]], '#8fa0c9', 1.5, true, 'rgba(93,107,143,0.3)');
      d.text('θ = ' + P.th + '°', 160, 68, C.yellow, 12);
      d.text('모든 물체가 같은 높이에서 동시에 출발 → 빗면 길이 ' + P.L + ' m 경주', 260, 40, C.text, 13);
      SHAPES.forEach((s, i) => {
        const y = 125 + i * 86, a = (K.g * sin(th)) / (1 + s.b), T = sqrt((2 * P.L) / a);
        const dist = min(P.L, 0.5 * a * S.t * S.t), X = x0 + (dist / P.L) * (x1 - x0), Rr = 18, phi = (X - x0) / Rr;
        d.line(x0 - 20, y + Rr, x1 + 20, y + Rr, '#3b4870', 3);
        d.line(x1, y - 26, x1, y + Rr + 6, C.yellow, 2, [4, 3]);
        d.text(s.n, 20, y, s.col, 12);
        if (s.b === 0) d.rect(X - Rr, y - Rr, 2 * Rr, 2 * Rr, s.col, null, 0, 3);
        else if (s.b === 1) {
          d.circle(X, y, Rr - 3, null, s.col, 6);
          d.line(X, y, X + (Rr - 3) * cos(phi), y + (Rr - 3) * sin(phi), s.col, 1.5);
        } else {
          if (s.b === 0.5) d.circle(X, y, Rr, s.col);
          else d.ball(X, y, Rr, s.col);
          if (s.b > 0.6) d.circle(X, y, Rr - 4, null, 'rgba(255,255,255,0.5)', 2);
          d.line(X, y, X + Rr * cos(phi), y + Rr * sin(phi), '#0a1020', 2.5);
          d.line(X, y, X - Rr * cos(phi), y - Rr * sin(phi), '#0a1020', 1.5);
        }
        if (S.t >= T) d.text('도착 ' + fmt(T, 3) + ' s', x1 - 10, y - 30, s.col, 12, 'right', 'middle', true);
      });
      d.text('t = ' + fmt(S.t, 3) + ' s', 840, 545, C.text, 12, 'right');
    },
  });

  add({
    id: 'angmom', cat: '회전 운동', name: '각운동량 보존', en: 'Conservation of Angular Momentum',
    tex: ['L = I\\omega = \\text{일정}\\quad(\\tau_{\\text{외부}} = 0)', 'I_1\\omega_1 = I_2\\omega_2,\\qquad I = I_0 + 2mr^2'],
    short: 'I_1\\omega_1 = I_2\\omega_2',
    desc: '외부 돌림힘이 없으면 각운동량 L = Iω는 보존된다. 피겨 스케이터가 팔을 오므리면(질량을 축 가까이 모으면) 관성 모멘트가 줄어 회전이 빨라지고, 팔을 펴면 느려진다. 위에서 내려다본 모습이다. 팔을 당길 때 스케이터가 일을 하므로 회전 운동 에너지는 오히려 증가한다.',
    params: [R('r', '팔(추)의 반지름 r', 'm', 0.15, 1.2, 0.01, 1), R('w0', 'r = 1 m일 때 각속도 ω₀', 'rad/s', 0.5, 6, 0.1, 2, { reset: 1 }), R('m', '양손 추의 질량 (각각)', 'kg', 1, 10, 0.5, 4, { reset: 1 }), R('I0', '몸통의 관성 모멘트 I₀', 'kg·m²', 0.2, 3, 0.1, 1, { reset: 1 })],
    out: (P, S) => {
      const I = P.I0 + 2 * P.m * S.r * S.r, L = S.L;
      return [['관성 모멘트 I = I₀ + 2mr²', I, 'kg·m²'], ['각속도 ω = L/I', L / I, 'rad/s'], ['각운동량 L (보존)', L, 'kg·m²/s'], ['초당 회전수', L / I / (2 * PI), '회/s'], ['회전 운동 에너지 L²/2I', (L * L) / (2 * I), 'J']];
    },
    sub: (P, S) => { const I = P.I0 + 2 * P.m * S.r * S.r; return `\\omega = \\frac{L}{I} = \\frac{${ft(S.L)}}{${ft(P.I0)} + 2(${ft(P.m)})(${ft(S.r)})^2} = ${ft(S.L / I)}\\ \\mathrm{rad/s}`; },
    init(S, P) { S.r = P.r; S.L = (P.I0 + 2 * P.m) * P.w0; S.th = 0; S.w = S.L / (P.I0 + 2 * P.m * S.r * S.r); },
    step(S, P, dt) {
      S.r += (P.r - S.r) * min(1, dt * 4);
      S.w = S.L / (P.I0 + 2 * P.m * S.r * S.r);
      S.th += S.w * dt;
    },
    draw(d, S, P) {
      d.clear();
      const cx = 250, cy = 285, sc = 175, th = S.th, rr = S.r * sc, rb = 10 + 3 * Math.cbrt(P.m);
      d.circle(cx, cy, 225, null, 'rgba(160,180,225,0.12)', 1);
      for (const sg of [1, -1]) {
        const ca = cos(th) * sg, sa = sin(th) * sg, X = cx + rr * ca, Y = cy - rr * sa;
        for (let k = 6; k >= 1; k--) {
          const a = th - S.w * 0.03 * k, X2 = cx + rr * cos(a) * sg, Y2 = cy - rr * sin(a) * sg;
          d.circle(X2, Y2, rb * (1 - k * 0.08), `rgba(255,159,67,${0.06 * (7 - k)})`);
        }
        d.line(cx + 40 * ca, cy - 40 * sa, X, Y, '#e7c39a', 7);
        d.ball(X, Y, rb, C.orange);
      }
      d.circle(cx, cy, 44, '#2f3b62', '#7f8db0', 2);
      d.circle(cx + 24 * cos(th + PI / 2), cy - 24 * sin(th + PI / 2), 9, C.yellow);
      d.text('위에서 본 모습', 20, 30, C.dim, 12);
      d.text('ω = ' + fmt(S.w, 3) + ' rad/s', 20, 52, C.green, 14, 'left', 'middle', true);
      const Iof = (r) => P.I0 + 2 * P.m * r * r;
      const p = d.plot({ x: 560, y: 50, w: 310, h: 200, xmin: 0, xmax: 1.25, ymin: 0, ymax: (S.L / Iof(0.15)) * 1.1, title: '반지름에 따른 각속도 ω = L/I(r)', xl: 'r (m)', yl: 'ω (rad/s)' });
      p.fn((r) => S.L / Iof(r), C.green, 2.5, 200, null, 0.15, 1.2);
      p.dot(S.r, S.L / Iof(S.r), C.green);
      const p2 = d.plot({ x: 560, y: 320, w: 310, h: 190, xmin: 0, xmax: 1.25, ymin: 0, ymax: ((S.L * S.L) / (2 * Iof(0.15))) * 1.1, title: '회전 운동 에너지 L²/2I', xl: 'r (m)', yl: 'K (J)' });
      p2.fn((r) => (S.L * S.L) / (2 * Iof(r)), C.orange, 2.5, 200, null, 0.15, 1.2);
      p2.dot(S.r, (S.L * S.L) / (2 * Iof(S.r)), C.orange);
    },
  });
})();
