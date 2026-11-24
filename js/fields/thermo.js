/* =====================================================================
 * 열역학 · 통계역학 — 열역학 법칙 · 이상 기체 · 열기관과 열전달 · 통계역학
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, log, hypot, floor } = Math;
  const add = (law) => PL.add('thermo', law);
  const heat = (T, lo = 0, hi = 100, a = 1) => PL.heatColor((T - lo) / (hi - lo), a);

  /* 상자 속 2차원 입자들 */
  function moveParticles(ps, dt, x0, x1, y0, y1, onWall) {
    for (const p of ps) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < x0) { p.x = 2 * x0 - p.x; p.vx = abs(p.vx); if (onWall) onWall(p, 'x'); }
      if (p.x > x1) { p.x = 2 * x1 - p.x; p.vx = -abs(p.vx); if (onWall) onWall(p, 'x'); }
      if (p.y < y0) { p.y = 2 * y0 - p.y; p.vy = abs(p.vy); if (onWall) onWall(p, 'y'); }
      if (p.y > y1) { p.y = 2 * y1 - p.y; p.vy = -abs(p.vy); if (onWall) onWall(p, 'y'); }
    }
  }

  /* ================================================================ 열역학 법칙 */
  add({
    id: 'zeroth', cat: '열역학 법칙', name: '열역학 제0법칙 (열평형)', en: 'Zeroth Law of Thermodynamics',
    tex: ['T_A = T_C,\\ \\ T_B = T_C \\;\\Longrightarrow\\; T_A = T_B', 'T_f = \\frac{C_A T_A + C_B T_B}{C_A + C_B}'],
    short: 'T_A = T_C,\\ T_B = T_C \\Rightarrow T_A = T_B',
    desc: '온도가 다른 두 물체를 접촉시키면 뜨거운 쪽에서 차가운 쪽으로 열이 흘러 결국 같은 온도(열평형)가 된다. 두 물체가 각각 세 번째 물체(온도계)와 열평형이면 두 물체끼리도 열평형이다 — 당연해 보이는 이 사실이 온도라는 개념과 온도계를 가능하게 한다. 최종 온도는 열용량으로 가중한 평균이다.',
    params: [R('TA', 'A의 처음 온도 T_A', '°C', 0, 100, 1, 90, { reset: 1 }), R('TB', 'B의 처음 온도 T_B', '°C', 0, 100, 1, 10, { reset: 1 }), R('CA', 'A의 열용량 C_A', 'J/K', 100, 5000, 50, 1000, { reset: 1 }), R('CB', 'B의 열용량 C_B', 'J/K', 100, 5000, 50, 2000, { reset: 1 }), R('G', '접촉면의 열전도도', 'W/K', 1, 100, 1, 20, { reset: 1 })],
    out: (P, S) => {
      const Tf = (P.CA * P.TA + P.CB * P.TB) / (P.CA + P.CB);
      return [['최종 온도 T_f', Tf, '°C'], ['현재 T_A', S.a, '°C'], ['현재 T_B', S.b, '°C'], ['열 흐름 G(T_A − T_B)', P.G * (S.a - S.b), 'W'], ['A가 잃은 열량', P.CA * (P.TA - S.a), 'J'], ['시간 상수 τ', (P.CA * P.CB) / (P.G * (P.CA + P.CB)), 's'], ['경과 시간 (빠르게 표시)', S.tt, 's']];
    },
    sub: (P) => `T_f = \\frac{(${ft(P.CA)})(${ft(P.TA)}) + (${ft(P.CB)})(${ft(P.TB)})}{${ft(P.CA)} + ${ft(P.CB)}} = ${ft((P.CA * P.TA + P.CB * P.TB) / (P.CA + P.CB))}\\ ^\\circ\\mathrm{C}`,
    init(S, P) { S.a = P.TA; S.b = P.TB; S.tt = 0; S.hist = [[0, P.TA, P.TB]]; S.dots = []; S.wait = 0; },
    step(S, P, dt) {
      const tau = (P.CA * P.CB) / (P.G * (P.CA + P.CB)), warp = (6 * tau) / 8;
      if (S.tt > 6 * tau) { S.wait += dt; if (S.wait > 2) this.init(S, P); return; }
      const h = (dt * warp) / 10;
      for (let i = 0; i < 10; i++) { const q = P.G * (S.a - S.b) * h; S.a -= q / P.CA; S.b += q / P.CB; }
      S.tt += dt * warp;
      S.hist.push([S.tt, S.a, S.b]);
      const flow = (S.a - S.b) / 80;
      if (Math.random() < abs(flow) * 6) S.dots.push({ x: flow > 0 ? 380 : 520, y: 150 + Math.random() * 150, d: Math.sign(flow) });
      S.dots.forEach((p) => (p.x += p.d * 140 * dt));
      S.dots = S.dots.filter((p) => p.x > 330 && p.x < 570);
    },
    draw(d, S, P) {
      d.clear();
      const block = (x, T, lbl, Cc) => {
        d.rect(x, 130, 230, 190, heat(T), 'rgba(255,255,255,0.5)', 1.5, 10);
        d.text(lbl, x + 115, 225, '#0a1020', 22, 'center', 'middle', true);
        d.text('C = ' + Cc + ' J/K', x + 115, 252, '#0a1020', 12, 'center');
        const tx = x + 115;
        d.rect(tx - 7, 30, 14, 80, '#1b2440', '#cfd8ee', 1.5, 7);
        d.rect(tx - 4, 30 + 77 * (1 - T / 100), 8, 77 * (T / 100), C.red);
        d.circle(tx, 112, 10, C.red);
        d.text(fmt(T, 3) + ' °C', tx + 16, 70, C.text, 13, 'left', 'middle', true);
      };
      block(220, S.a, 'A', P.CA);
      block(450, S.b, 'B', P.CB);
      S.dots.forEach((p) => d.glow(p.x, p.y, 7, 'rgba(255,170,60,0.9)'));
      if (abs(S.a - S.b) > 0.2) d.text(S.a > S.b ? '열 →' : '← 열', 450, 345, C.orange, 14, 'center', 'middle', true);
      else d.label('열평형 도달 — 두 물체의 온도가 같다', 450, 345, C.green, 13);
      const tau = (P.CA * P.CB) / (P.G * (P.CA + P.CB)), Tf = (P.CA * P.TA + P.CB * P.TB) / (P.CA + P.CB);
      const p = d.plot({ x: 70, y: 395, w: 790, h: 125, xmin: 0, xmax: 6 * tau, ymin: 0, ymax: 100, title: '온도 변화 T(t)', xl: 't (s)', yl: '°C', ny: 2 });
      p.hl(Tf, C.yellow); p.label('T_f', 6 * tau * 0.98, Tf + 7, C.yellow, 11, 'right');
      p.pts(S.hist.map((h) => [h[0], h[1]]), C.red, 2.5);
      p.pts(S.hist.map((h) => [h[0], h[2]]), C.cyan, 2.5);
    },
  });

  add({
    id: 'first', cat: '열역학 법칙', name: '열역학 제1법칙 (에너지 보존)', en: 'First Law of Thermodynamics',
    tex: ['\\Delta U = Q - W', 'U = \\tfrac32 nRT\\quad(\\text{단원자 이상 기체})'],
    short: '\\Delta U = Q - W',
    desc: '계에 들어온 열 Q는 계의 내부 에너지를 늘리거나(ΔU) 계가 바깥에 일 W를 하는 데 쓰인다. 에너지는 생기거나 사라지지 않고 형태만 바뀐다. 기체에 열을 넣으면서 피스톤을 밀게 하면(W > 0) 온도가 덜 오르고, 열 없이 압축하면(W < 0) 온도가 오른다. 분자의 빠르기와 색이 내부 에너지(온도)를 나타낸다. (피스톤 이동량은 개념적 표시)',
    params: [R('Q', '가한 열 Q', 'J', -3000, 3000, 50, 1500, { reset: 1 }), R('W', '기체가 한 일 W', 'J', -3000, 3000, 50, 600, { reset: 1 }), R('n', '기체의 양 n (단원자)', 'mol', 0.5, 3, 0.1, 1, { reset: 1 })],
    out: (P) => {
      const dU = P.Q - P.W, dT = dU / (1.5 * P.n * K.R), T2 = 300 + dT;
      const r = [['내부 에너지 변화 ΔU = Q − W', dU, 'J'], ['온도 변화 ΔT = ΔU/(3/2·nR)', dT, 'K'], ['처음 온도 → 나중 온도', '300 → ' + fmt(T2, 4), 'K'], ['분자 rms 속력 변화', T2 > 0 ? (sqrt(T2 / 300) - 1) * 100 : '—', '%']];
      if (T2 <= 0) r.push('불가능한 조합: 내부 에너지를 0 아래로 줄일 수 없다 (T < 0).');
      return r;
    },
    sub: (P) => `\\Delta U = Q - W = ${ft(P.Q)} - (${ft(P.W)}) = ${ft(P.Q - P.W)}\\ \\mathrm{J}`,
    init(S) { S.tc = 0; S.ps = Array.from({ length: 70 }, () => { const a = Math.random() * 2 * PI, v = 60 + 60 * Math.random(); return { x: 170 + Math.random() * 300, y: 160 + Math.random() * 200, vx: v * cos(a), vy: v * sin(a), f: 0.6 + 0.8 * Math.random() }; }); S.hq = []; },
    step(S, P, dt) {
      S.tc = (S.tc + dt) % 5.5;
      const s = M.smooth((S.tc - 0.8) / 3), T2 = max(20, 300 + (P.Q - P.W) / (1.5 * P.n * K.R)), T = 300 + (T2 - 300) * s;
      const xp = 520 + (P.W / 3000) * 140 * s;
      const f = sqrt(T / 300);
      S.ps.forEach((p) => { const sp = hypot(p.vx, p.vy) || 1, tgt = 95 * f * p.f; p.vx *= tgt / sp; p.vy *= tgt / sp; });
      moveParticles(S.ps, dt, 160, xp - 6, 150, 370);
      S.xp = xp; S.T = T; S.s = s;
      if (S.tc > 0.8 && S.tc < 3.8 && P.Q !== 0 && Math.random() < abs(P.Q) / 1500) S.hq.push({ x: 180 + Math.random() * (xp - 220), y: P.Q > 0 ? 450 : 380, d: P.Q > 0 ? -1 : 1 });
      S.hq.forEach((q) => (q.y += q.d * 90 * dt));
      S.hq = S.hq.filter((q) => q.y > 370 && q.y < 460);
    },
    draw(d, S, P) {
      d.clear();
      const xp = S.xp || 520, T = S.T || 300;
      d.rect(160, 150, xp - 160, 220, PL.heatColor((T - 150) / 600, 0.18));
      d.line(150, 140, 150, 380, '#cfd8ee', 4); d.line(150, 380, 700, 380, '#cfd8ee', 4); d.line(150, 140, 700, 140, '#cfd8ee', 4);
      d.rect(xp - 6, 144, 16, 232, '#9aa6c4');
      d.rect(xp + 10, 250, 150, 14, '#7f8db0');
      S.ps.forEach((p) => d.circle(p.x, p.y, 4, PL.heatColor((T - 150) / 600)));
      if (P.Q > 0) { d.glow(330, 420, 70, 'rgba(255,120,40,0.6)'); d.text('🔥 열 공급 Q = ' + P.Q + ' J', 330, 470, C.orange, 13, 'center'); }
      if (P.Q < 0) { d.rect(220, 395, 220, 30, 'rgba(120,200,255,0.4)', null, 0, 6); d.text('❄ 열 방출 Q = ' + P.Q + ' J', 330, 470, C.cyan, 13, 'center'); }
      S.hq.forEach((q) => d.glow(q.x, q.y, 6, P.Q > 0 ? 'rgba(255,150,50,0.9)' : 'rgba(100,190,255,0.9)'));
      if (P.W !== 0 && S.s > 0.02) d.arrow(xp + 40, 220, xp + 40 + Math.sign(P.W) * 60, 220, C.green, 3);
      d.text(P.W > 0 ? '기체가 피스톤을 밀어 일을 함' : P.W < 0 ? '외부가 기체를 압축 (W < 0)' : '부피 일정 (W = 0)', 430, 115, C.green, 13, 'center');
      d.text('T = ' + fmt(T, 4) + ' K', 170, 130, C.text, 13);
      const dU = P.Q - P.W, mx = max(abs(P.Q), abs(P.W), abs(dU), 1) * 1.1;
      d.bars(720, 140, 170, 300, [['Q', P.Q, C.orange], ['ΔU', dU, C.red], ['W', P.W, C.green]], mx, 'Q = ΔU + W  (J)');
    },
  });

  add({
    id: 'second', cat: '열역학 법칙', name: '열역학 제2법칙 (엔트로피 증가)', en: 'Second Law of Thermodynamics — Entropy',
    tex: ['\\Delta S_{\\text{고립계}} \\ge 0', 'S = k_B\\ln\\Omega,\\qquad \\Omega = \\binom{N}{N_L} = \\frac{N!}{N_L!\\,N_R!}'],
    short: '\\Delta S \\ge 0',
    desc: '칸막이를 걷어 내면 왼쪽에 모여 있던 기체가 저절로 퍼져 양쪽에 고르게 분포한다. 모든 분자가 저절로 다시 한쪽으로 모이는 일은 확률적으로 가능하지만 사실상 일어나지 않는다. 고르게 퍼진 상태에 해당하는 미시 상태의 수 Ω가 압도적으로 많기 때문이다. 엔트로피 S = k ln Ω가 증가하는 방향이 곧 자연 현상이 일어나는 방향(시간의 화살)이다.',
    params: [R('N', '분자 수 N', '', 10, 400, 10, 150, { reset: 1 }), Chk('wall', '칸막이 다시 끼우기', false)],
    out: (P, S) => [['왼쪽 분자 수 N_L', S.nl, ''], ['오른쪽 분자 수 N_R', P.N - S.nl, ''], ['현재 엔트로피 S/k = ln Ω', M.lnC(P.N, S.nl), ''], ['최대 엔트로피 S/k (반반)', M.lnC(P.N, floor(P.N / 2)), ''], ['모두 왼쪽에 모일 확률 2⁻ᴺ', Math.pow(2, -P.N), ''], ['자유 팽창의 ΔS ≈ N k ln2', P.N * Math.LN2, 'k']],
    init(S, P) {
      S.ps = Array.from({ length: P.N }, () => { const a = Math.random() * 2 * PI, v = 80 + 90 * Math.random(); return { x: 70 + Math.random() * 250, y: 80 + Math.random() * 300, vx: v * cos(a), vy: v * sin(a) }; });
      S.hist = []; S.nl = P.N; S.open = false;
    },
    step(S, P, dt) {
      S.t += dt;
      S.open = S.t > 1.2 && !P.wall;
      const mid = 330;
      for (const p of S.ps) {
        const ox = p.x;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (!S.open && (ox - mid) * (p.x - mid) < 0) { p.x = 2 * mid - p.x; p.vx = -p.vx; }
      }
      moveParticles(S.ps, 0, 64, 596, 74, 386);
      S.nl = S.ps.filter((p) => p.x < mid).length;
      S.hist.push([S.t, M.lnC(P.N, S.nl)]);
      if (S.hist.length > 1500) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      d.rect(60, 70, 540, 320, 'rgba(255,255,255,0.03)', '#cfd8ee', 2.5, 6);
      if (!S.open) d.line(330, 70, 330, 390, C.orange, 4);
      else d.line(330, 70, 330, 390, 'rgba(255,159,67,0.25)', 1, [4, 6]);
      S.ps.forEach((p) => d.circle(p.x, p.y, 3.2, p.x < 330 ? C.cyan : C.pink));
      d.text(S.open ? '칸막이 제거됨 — 기체가 퍼진다' : S.t < 1.2 ? '1초 뒤 칸막이를 걷어 냅니다' : '칸막이 설치됨', 330, 50, S.open ? C.green : C.orange, 13, 'center');
      const fl = S.nl / P.N;
      d.rect(60, 410, 540 * fl, 22, C.cyan); d.rect(60 + 540 * fl, 410, 540 * (1 - fl), 22, C.pink);
      d.text('왼쪽 ' + S.nl, 66, 421, '#0a1020', 12, 'left', 'middle', true);
      d.text('오른쪽 ' + (P.N - S.nl), 594, 421, '#0a1020', 12, 'right', 'middle', true);
      const Smax = M.lnC(P.N, floor(P.N / 2)), t1 = max(15, S.t);
      const p = d.plot({ x: 650, y: 60, w: 220, h: 200, xmin: t1 - 15, xmax: t1, ymin: 0, ymax: Smax * 1.1 + 1, title: '엔트로피 S/k = ln Ω', xl: 't (s)' });
      p.hl(Smax, C.yellow); p.pts(S.hist, C.green, 2);
      const q = d.plot({ x: 650, y: 320, w: 220, h: 180, xmin: 0, xmax: P.N, ymin: 0, ymax: 1.05, title: '거시 상태별 미시 상태 수 Ω(N_L)', xl: 'N_L', yl: 'Ω / Ω_max', ny: 2 });
      q.area((n) => exp(M.lnC(P.N, Math.round(n)) - Smax), 'rgba(167,139,250,0.35)', 0, P.N, 300);
      q.vl(S.nl, C.cyan, null, 2);
    },
  });

  add({
    id: 'third', cat: '열역학 법칙', name: '열역학 제3법칙', en: 'Third Law of Thermodynamics',
    tex: ['\\lim_{T\\to 0} S = 0\\quad(\\text{완전한 결정})', '\\frac{S}{Nk_B} = \\ln(1+e^{-x}) + \\frac{x\\,e^{-x}}{1+e^{-x}},\\qquad x = \\frac{\\varepsilon}{k_BT}'],
    short: '\\lim_{T\\to 0} S = 0',
    desc: '온도가 절대 0도에 가까워지면 계는 유일한 바닥 상태로 가라앉아 미시 상태의 수가 1이 되고 엔트로피는 0으로 간다. 에너지 간격이 ε인 두 준위 원자로 이루어진 계에서, 온도가 낮을수록 들뜬 원자(노란 점)가 사라지고 엔트로피와 열용량이 함께 0으로 떨어진다. 그래서 유한한 횟수의 과정으로는 절대 0도에 도달할 수 없다.',
    params: [R('T', '온도 T', 'K', 0.1, 60, 0.1, 15), R('eps', '에너지 간격 ε/k_B', 'K', 1, 50, 1, 10)],
    fS: (x) => log(1 + exp(-x)) + (x * exp(-x)) / (1 + exp(-x)),
    fC: (x) => (x > 300 ? 0 : (x * x * exp(x)) / (1 + exp(x)) ** 2),
    out(P) {
      const x = P.eps / P.T, p = 1 / (1 + exp(x));
      return [['엔트로피 S/(Nk)', this.fS(x), ''], ['고온 극한 ln 2', Math.LN2, ''], ['열용량 C/(Nk)', this.fC(x), ''], ['들뜬 원자의 비율', p * 100, '%'], ['원자 100개의 미시 상태 수 ~ e^{S/k}', exp(100 * this.fS(x)), '']];
    },
    init(S) { S.st = new Uint8Array(120); },
    step(S, P, dt) {
      const p = 1 / (1 + exp(P.eps / P.T));
      for (let i = 0; i < 120; i++) if (Math.random() < dt * 3) S.st[i] = Math.random() < p ? 1 : 0;
    },
    draw(d, S, P) {
      d.clear();
      d.text('두 준위 원자 120개 (노랑 = 들뜬 상태)', 60, 50, C.text, 13);
      for (let i = 0; i < 120; i++) {
        const X = 80 + (i % 12) * 34, Y = 90 + floor(i / 12) * 34;
        if (S.st[i]) { d.glow(X, Y, 16, 'rgba(255,216,77,0.6)'); d.circle(X, Y, 7, C.yellow); } else d.circle(X, Y, 6, '#33406a');
      }
      const x = P.eps / P.T;
      d.text('T = ' + fmt(P.T, 3) + ' K,  ε/kT = ' + fmt(x, 3), 60, 460, C.text, 13);
      d.text(P.T < P.eps / 5 ? '저온: 거의 모든 원자가 바닥 상태 → S → 0' : '고온: 두 상태가 거의 반반 → S → Nk ln2', 60, 485, P.T < P.eps / 5 ? C.cyan : C.orange, 13);
      const p = d.plot({ x: 560, y: 50, w: 310, h: 190, xmin: 0, xmax: 60, ymin: 0, ymax: 0.8, title: '엔트로피 S/Nk', xl: 'T (K)' });
      p.hl(Math.LN2, 'rgba(255,216,77,0.4)');
      p.fn((T) => this.fS(P.eps / max(T, 0.01)), C.green, 2.5);
      p.dot(P.T, this.fS(x), C.green);
      const q = d.plot({ x: 560, y: 310, w: 310, h: 190, xmin: 0, xmax: 60, ymin: 0, ymax: 0.5, title: '열용량 C/Nk (쇼트키 봉우리)', xl: 'T (K)' });
      q.fn((T) => this.fC(P.eps / max(T, 0.01)), C.orange, 2.5);
      q.dot(P.T, this.fC(x), C.orange);
    },
  });

  /* ================================================================ 이상 기체 */
  add({
    id: 'idealgas', cat: '이상 기체', name: '이상 기체 상태 방정식', en: 'Ideal Gas Law',
    tex: ['PV = nRT = Nk_BT', 'P = \\frac{1}{3}\\frac{N}{V}m\\langle v^2\\rangle\\quad(\\text{기체 분자 운동론})'],
    short: 'PV = nRT',
    desc: '기체의 압력은 수많은 분자가 벽에 부딪히며 주는 충격의 평균이다. 온도를 올리면 분자가 빨라져 더 세게, 자주 부딪히고, 부피를 줄이면 같은 분자들이 더 자주 벽에 부딪혀 압력이 커진다. 시뮬레이션은 벽에 전달된 운동량으로 압력을 직접 측정해 PV = nRT의 값과 비교한다. 오른쪽 아래는 P-V 도표 위의 등온선이다.',
    params: [R('n', '기체의 양 n', 'mol', 0.2, 2, 0.1, 1), R('T', '온도 T', 'K', 100, 800, 10, 300), R('V', '부피 V', 'L', 5, 50, 0.5, 25)],
    out: (P, S) => [['압력 P = nRT/V (이론)', (P.n * K.R * P.T) / (P.V / 1000) / 1000, 'kPa'], ['분자 충돌로 측정한 압력', S.pm, 'kPa'], ['PV', ((P.n * K.R * P.T) / (P.V / 1000)) * (P.V / 1000), 'J'], ['분자 수 N = nN_A', P.n * K.NA, '개'], ['분자 평균 운동 에너지 3/2 kT', 1.5 * K.kB * P.T, 'J']],
    sub: (P) => `P = \\frac{nRT}{V} = \\frac{(${ft(P.n)})(8.314)(${ft(P.T)})}{${ft(P.V / 1000)}} = ${ft((P.n * K.R * P.T) / (P.V / 1000))}\\ \\mathrm{Pa}`,
    spawn(P) { const s = 95 * sqrt(P.T / 300); return { x: 70 + Math.random() * 60, y: 80 + Math.random() * 240, vx: M.gauss() * s, vy: M.gauss() * s }; },
    init(S, P) { S.ps = Array.from({ length: Math.round(60 * P.n) }, () => this.spawn(P)); S.T = P.T; S.imp = 0; S.acc = 0; S.pm = (P.n * K.R * P.T) / (P.V / 1000) / 1000; S.ph = []; },
    change(S, P) {
      const N = Math.round(60 * P.n);
      while (S.ps.length < N) S.ps.push(this.spawn(P));
      if (S.ps.length > N) S.ps.length = N;
      if (P.T !== S.T) { const f = sqrt(P.T / S.T); S.ps.forEach((p) => { p.vx *= f; p.vy *= f; }); S.T = P.T; }
    },
    step(S, P, dt) {
      const x0 = 60, x1 = 60 + 760 * (P.V / 50), y0 = 70, y1 = 330;
      S.ps.forEach((p) => { if (p.x > x1) { p.x = x1 - Math.random() * 10; p.vx = -abs(p.vx); } });
      let imp = 0;
      moveParticles(S.ps, dt, x0, x1, y0, y1, (p, ax) => { imp += 2 * abs(ax === 'x' ? p.vx : p.vy); });
      S.imp += imp; S.acc += dt;
      if (S.acc > 1.5) {
        let ke = 0; S.ps.forEach((p) => (ke += p.vx * p.vx + p.vy * p.vy));
        const area = (x1 - x0) * (y1 - y0), perim = 2 * (x1 - x0 + y1 - y0);
        const meas = S.imp / (S.acc * perim), expct = ke / (2 * area);
        const Pth = (P.n * K.R * P.T) / (P.V / 1000) / 1000;
        S.pm = expct > 0 ? Pth * (meas / expct) : Pth;
        S.ph.push(S.pm); if (S.ph.length > 30) S.ph.shift();
        S.imp = 0; S.acc = 0;
      }
    },
    draw(d, S, P) {
      d.clear();
      const x1 = 60 + 760 * (P.V / 50);
      d.rect(60, 70, x1 - 60, 260, PL.heatColor((P.T - 100) / 700, 0.12));
      d.line(56, 66, 56, 334, '#cfd8ee', 4); d.line(56, 66, 870, 66, '#cfd8ee', 4); d.line(56, 334, 870, 334, '#cfd8ee', 4);
      d.rect(x1, 64, 14, 272, '#9aa6c4');
      d.rect(x1 + 14, 190, 880 - x1, 12, '#7f8db0');
      const col = PL.heatColor((P.T - 100) / 700);
      S.ps.forEach((p) => d.circle(p.x, p.y, 4, col));
      d.text('V = ' + P.V + ' L,  T = ' + P.T + ' K,  분자 ' + S.ps.length + '개 (표시용)', 60, 44, C.text, 13);
      const Pth = (P.n * K.R * P.T) / (P.V / 1000) / 1000;
      const p = d.plot({ x: 70, y: 395, w: 380, h: 130, xmin: 0, xmax: 55, ymin: 0, ymax: 700, title: 'P-V 도표 (등온선 PV = nRT)', xl: 'V (L)', yl: 'P (kPa)', ny: 3 });
      [200, 400, 600, 800].forEach((T) => p.fn((V) => (P.n * K.R * T) / V, 'rgba(160,175,210,0.25)', 1, 200, null, 1, 55));
      p.fn((V) => (P.n * K.R * P.T) / V, C.orange, 2.5, 200, null, 1, 55);
      p.dot(P.V, Pth, C.orange);
      const q = d.plot({ x: 520, y: 395, w: 350, h: 130, xmin: 0, xmax: 30, ymin: 0, ymax: Pth * 1.6 + 1, title: '측정 압력 (1.5초 평균) vs 이론', xl: '측정 회차', yl: 'kPa', ny: 3 });
      q.hl(Pth, C.yellow);
      q.pts(S.ph.map((v, i) => [i, v]), C.cyan, 2);
    },
  });

  const procState = (P) => {
    const n = 1, V1 = 10, T1 = P.T1, P1 = (n * K.R * T1) / (V1 / 1000) / 1000, g = P.gas, cv = K.R / (g - 1);
    let V2 = V1, T2 = T1, P2 = P1, W = 0;
    if (P.proc === 'iso') { V2 = V1 * P.r; P2 = P1 / P.r; W = n * K.R * T1 * log(P.r); }
    else if (P.proc === 'adi') { V2 = V1 * P.r; T2 = T1 * Math.pow(P.r, 1 - g); P2 = P1 * Math.pow(P.r, -g); W = (n * K.R * (T1 - T2)) / (g - 1); }
    else if (P.proc === 'isob') { V2 = V1 * P.r; T2 = T1 * P.r; W = P1 * 1000 * ((V2 - V1) / 1000); }
    else { P2 = P1 * P.r; T2 = T1 * P.r; W = 0; }
    const dU = n * cv * (T2 - T1);
    return { V1, T1, P1, V2, T2, P2, W, dU, Q: dU + W, g };
  };
  const procPath = (P, st, s) => {
    const { V1, T1, P1, V2, g } = st;
    if (P.proc === 'isoc') { const T = T1 * (1 + (P.r - 1) * s); return [V1, P1 * (T / T1), T]; }
    const V = V1 + (V2 - V1) * s;
    if (P.proc === 'iso') return [V, (P1 * V1) / V, T1];
    if (P.proc === 'adi') return [V, P1 * Math.pow(V1 / V, g), T1 * Math.pow(V1 / V, g - 1)];
    return [V, P1, T1 * (V / V1)];
  };
  add({
    id: 'processes', cat: '이상 기체', name: '열역학 과정과 P-V 도표', en: 'Thermodynamic Processes on the P–V Diagram',
    tex: ['W = \\int_{V_1}^{V_2} P\\,dV', '\\text{등온: } W = nRT\\ln\\frac{V_2}{V_1},\\qquad \\text{단열: } PV^{\\gamma} = \\text{일정}'],
    short: 'W = \\int P\\,dV',
    desc: '기체가 한 일은 P-V 도표에서 과정 곡선 아래의 넓이(초록 = 팽창, 빨강 = 압축)이다. 등압 과정은 수평선, 등적 과정은 수직선(일 = 0), 등온 과정은 쌍곡선 PV = 일정, 단열 과정(열 출입 없음)은 더 가파른 곡선 PV^γ = 일정을 따른다. 같은 부피 변화라도 경로에 따라 한 일과 필요한 열이 다르다 — 일과 열은 상태가 아니라 과정에 따라 정해진다. (1 mol, V₁ = 10 L)',
    params: [Sel('proc', '과정', [['iso', '등온 과정 (T 일정)'], ['adi', '단열 과정 (Q = 0)'], ['isob', '등압 과정 (P 일정)'], ['isoc', '등적 과정 (V 일정)']], 'iso'), R('r', '변화 비율 V₂/V₁ (등적은 P₂/P₁)', '', 0.25, 4, 0.05, 2.5), R('T1', '처음 온도 T₁', 'K', 200, 600, 10, 300), Sel('gas', '기체 종류', [[5 / 3, '단원자 (γ = 5/3)'], [7 / 5, '이원자 (γ = 7/5)']], 5 / 3)],
    out: (P) => {
      const s = procState(P);
      return [['기체가 한 일 W', s.W, 'J'], ['흡수한 열 Q', s.Q, 'J'], ['내부 에너지 변화 ΔU', s.dU, 'J'], ['나중 온도 T₂', s.T2, 'K'], ['나중 압력 P₂', s.P2, 'kPa'], ['나중 부피 V₂', s.V2, 'L']];
    },
    init(S) { S.s = 0; },
    step(S, P, dt) { S.t = (S.t + dt) % 4.5; S.s = M.smooth(S.t / 3); },
    draw(d, S, P) {
      d.clear();
      const st = procState(P), pmax = max(st.P1, st.P2) * 1.18, vmax = max(st.V1, st.V2) * 1.2 + 2;
      const p = d.plot({ x: 70, y: 50, w: 480, h: 440, xmin: 0, xmax: vmax, ymin: 0, ymax: pmax, title: 'P-V 도표', xl: 'V (L)', yl: 'P (kPa)' });
      const ref = (fn, col) => p.fn(fn, col, 1.2, 200, [4, 4], 1, vmax);
      ref((V) => (st.P1 * st.V1) / V, 'rgba(255,159,67,0.35)');
      ref((V) => st.P1 * Math.pow(st.V1 / V, st.g), 'rgba(56,189,248,0.35)');
      p.label('등온', vmax * 0.92, (st.P1 * st.V1) / (vmax * 0.92) + pmax * 0.03, 'rgba(255,159,67,0.7)', 10);
      p.label('단열', vmax * 0.92, st.P1 * Math.pow(st.V1 / (vmax * 0.92), st.g) - pmax * 0.04, 'rgba(56,189,248,0.8)', 10);
      const pts = [];
      for (let i = 0; i <= 100; i++) { const q = procPath(P, st, (i / 100) * S.s); pts.push([q[0], q[1]]); }
      if (P.proc !== 'isoc') {
        const g = d.g; g.beginPath(); g.moveTo(p.X(pts[0][0]), p.Y(0));
        pts.forEach((q) => g.lineTo(p.X(q[0]), p.Y(q[1])));
        g.lineTo(p.X(pts[pts.length - 1][0]), p.Y(0)); g.closePath();
        g.fillStyle = st.V2 >= st.V1 ? 'rgba(74,222,128,0.25)' : 'rgba(255,92,108,0.25)'; g.fill();
      }
      const full = [];
      for (let i = 0; i <= 100; i++) { const q = procPath(P, st, i / 100); full.push([q[0], q[1]]); }
      p.pts(full, 'rgba(255,216,77,0.35)', 2);
      p.pts(pts, C.yellow, 3.5);
      const cur = procPath(P, st, S.s);
      p.dot(st.V1, st.P1, C.white, 5); p.dot(cur[0], cur[1], C.yellow, 7);
      p.label('1', st.V1 + vmax * 0.015, st.P1 + pmax * 0.04, C.white, 12);
      const cx = 600, cw = 260, vfrac = cur[0] / vmax, len = 40 + 200 * vfrac;
      d.rect(cx, 120, len, 160, PL.heatColor((cur[2] - 100) / 900, 0.55));
      const insul = P.proc === 'adi';
      d.line(cx - 4, 110, cx + cw, 110, insul ? '#ffd84d' : '#cfd8ee', insul ? 7 : 4);
      d.line(cx - 4, 290, cx + cw, 290, insul ? '#ffd84d' : '#cfd8ee', insul ? 7 : 4);
      d.line(cx - 2, 110, cx - 2, 290, insul ? '#ffd84d' : '#cfd8ee', insul ? 7 : 4);
      d.rect(cx + len, 112, 12, 176, '#9aa6c4');
      d.text('T = ' + fmt(cur[2], 4) + ' K', cx + 6, 135, '#0a1020', 13, 'left', 'middle', true);
      if (insul) d.text('단열 벽 (열 출입 없음)', cx, 92, C.yellow, 12);
      const Qs = st.Q;
      if (abs(Qs) > 1 && S.s > 0 && S.s < 1) {
        for (let i = 0; i < 4; i++) {
          const x = cx + 30 + i * 50;
          if (Qs > 0) d.arrow(x, 345, x, 300, C.orange, 3); else d.arrow(x, 300, x, 345, C.cyan, 3);
        }
        d.text(Qs > 0 ? '열 흡수' : '열 방출', cx + 120, 360, Qs > 0 ? C.orange : C.cyan, 12, 'center');
      }
      const mx = max(abs(st.W), abs(st.Q), abs(st.dU), 1) * 1.1;
      d.bars(600, 385, 270, 150, [['W', st.W, C.green], ['Q', st.Q, C.orange], ['ΔU', st.dU, C.red]], mx, '에너지 (J)');
    },
  });

  const GASES = [[4, '헬륨 He (4 g/mol)'], [20, '네온 Ne (20)'], [28, '질소 N₂ (28)'], [32, '산소 O₂ (32)'], [40, '아르곤 Ar (40)'], [44, '이산화탄소 CO₂ (44)'], [131, '제논 Xe (131)']];
  const mbf = (v, m, T) => 4 * PI * Math.pow(m / (2 * PI * K.kB * T), 1.5) * v * v * exp((-m * v * v) / (2 * K.kB * T));
  add({
    id: 'mbdist', cat: '이상 기체', name: '맥스웰-볼츠만 속력 분포', en: 'Maxwell–Boltzmann Speed Distribution',
    tex: ['f(v) = 4\\pi\\left(\\frac{m}{2\\pi k_BT}\\right)^{3/2} v^2\\,e^{-mv^2/2k_BT}', 'v_p = \\sqrt{\\frac{2k_BT}{m}},\\quad \\bar v = \\sqrt{\\frac{8k_BT}{\\pi m}},\\quad v_{\\text{rms}} = \\sqrt{\\frac{3k_BT}{m}}'],
    short: 'f(v) \\propto v^2 e^{-mv^2/2kT}',
    desc: '기체 분자들은 모두 같은 속력으로 움직이지 않고, 충돌을 거치며 특정한 분포(맥스웰-볼츠만 분포)를 이룬다. 온도가 높거나 분자가 가벼울수록 분포가 오른쪽(빠른 쪽)으로 이동하며 넓게 퍼진다. "모두 같은 속력으로 시작"을 고르면 분자들이 무작위 충돌을 거쳐 이 분포로 다가가는 과정을 볼 수 있다. 히스토그램은 시뮬레이션, 곡선은 이론이다.',
    params: [R('T', '온도 T', 'K', 50, 1500, 10, 300), Sel('m', '기체', GASES, 28, { reset: 1 }), Sel('start', '처음 상태', [['mb', '평형 분포에서 시작'], ['mono', '모두 같은 속력으로 시작']], 'mono', { reset: 1 })],
    mass: (P) => (P.m / 1000) / K.NA,
    out(P, S) {
      const m = this.mass(P), kT = K.kB * P.T;
      return [['최빈 속력 v_p', sqrt((2 * kT) / m), 'm/s'], ['평균 속력 v̄', sqrt((8 * kT) / (PI * m)), 'm/s'], ['제곱평균제곱근 속력 v_rms', sqrt((3 * kT) / m), 'm/s'], ['평균 운동 에너지 3/2 kT', (1.5 * kT) / K.eV, 'eV'], ['시뮬레이션 평균 속력', S.mean || 0, 'm/s']];
    },
    init(S, P) {
      const m = this.mass(P), s = sqrt((K.kB * P.T) / m), vr = sqrt(3) * s;
      S.T = P.T;
      S.ps = Array.from({ length: 320 }, () => {
        let v;
        if (P.start === 'mono') { const z = 2 * Math.random() - 1, a = Math.random() * 2 * PI, q = sqrt(1 - z * z); v = [vr * q * cos(a), vr * q * sin(a), vr * z]; }
        else v = [M.gauss() * s, M.gauss() * s, M.gauss() * s];
        return { x: 70 + Math.random() * 400, y: 70 + Math.random() * 400, v };
      });
    },
    change(S, P, k) { if (k === 'T') { const f = sqrt(P.T / S.T); S.ps.forEach((p) => p.v.forEach((_, i) => (p.v[i] *= f))); S.T = P.T; } },
    step(S, P, dt) {
      const sc = 0.29;
      S.ps.forEach((p) => { p.x += p.v[0] * sc * dt; p.y += p.v[1] * sc * dt; });
      S.ps.forEach((p) => {
        if (p.x < 60) { p.x = 120 - p.x; p.v[0] = abs(p.v[0]); } if (p.x > 480) { p.x = 960 - p.x; p.v[0] = -abs(p.v[0]); }
        if (p.y < 60) { p.y = 120 - p.y; p.v[1] = abs(p.v[1]); } if (p.y > 480) { p.y = 960 - p.y; p.v[1] = -abs(p.v[1]); }
        p.x = M.clamp(p.x, 60, 480); p.y = M.clamp(p.y, 60, 480);
      });
      const ncol = floor(320 * 3 * dt) + 1;
      for (let c = 0; c < ncol; c++) {
        const a = S.ps[floor(Math.random() * 320)], b = S.ps[floor(Math.random() * 320)];
        if (a === b) continue;
        const cm = [0, 1, 2].map((i) => (a.v[i] + b.v[i]) / 2), g = hypot(a.v[0] - b.v[0], a.v[1] - b.v[1], a.v[2] - b.v[2]) / 2;
        const z = 2 * Math.random() - 1, ph = Math.random() * 2 * PI, q = sqrt(1 - z * z), n = [q * cos(ph), q * sin(ph), z];
        for (let i = 0; i < 3; i++) { a.v[i] = cm[i] + g * n[i]; b.v[i] = cm[i] - g * n[i]; }
      }
      let s = 0; S.ps.forEach((p) => (s += hypot(p.v[0], p.v[1], p.v[2]))); S.mean = s / 320;
    },
    draw(d, S, P) {
      d.clear();
      const m = this.mass(P), vmax = 2.4 * sqrt((3 * K.kB * 1500) / m);
      d.rect(60, 60, 420, 420, 'rgba(255,255,255,0.03)', '#cfd8ee', 2, 4);
      S.ps.forEach((p) => d.circle(p.x, p.y, 3.2, PL.heatColor(hypot(p.v[0], p.v[1], p.v[2]) / (vmax * 0.6))));
      d.text('분자 320개 (색 = 속력)', 60, 44, C.text, 13);
      const nb = 36, bw = vmax / nb, hist = new Array(nb).fill(0);
      S.ps.forEach((p) => { const k = floor(hypot(p.v[0], p.v[1], p.v[2]) / bw); if (k < nb) hist[k]++; });
      const fmax = mbf(sqrt((2 * K.kB * 50) / m), m, 50);
      const pl = d.plot({ x: 540, y: 60, w: 330, h: 420, xmin: 0, xmax: vmax, ymin: 0, ymax: fmax * 0.55, title: '속력 분포 f(v)', xl: 'v (m/s)', yl: 'f(v)', nx: 4 });
      hist.forEach((c, k) => { const y = c / 320 / bw; d.rect(pl.X(k * bw) + 1, pl.Y(y), pl.X(bw) - pl.X(0) - 2, pl.Y(0) - pl.Y(y), 'rgba(56,189,248,0.45)'); });
      pl.fn((v) => mbf(v, m, P.T), C.orange, 2.5);
      const vp = sqrt((2 * K.kB * P.T) / m), vr = sqrt((3 * K.kB * P.T) / m);
      pl.vl(vp, C.yellow); pl.vl(vr, C.pink);
      pl.label('v_p', vp, pl.iy(pl.y + 30), C.yellow, 11); pl.label('v_rms', vr, pl.iy(pl.y + 48), C.pink, 11);
    },
  });

  /* ================================================================ 열기관과 열전달 */
  add({
    id: 'carnot', cat: '열기관과 열전달', name: '카르노 기관 (열기관의 최대 효율)', en: 'Carnot Engine',
    tex: ['\\eta = \\frac{W}{Q_H} = 1 - \\frac{Q_C}{Q_H} = 1 - \\frac{T_C}{T_H}'],
    short: '\\eta = 1 - \\frac{T_C}{T_H}',
    desc: '열기관은 뜨거운 열원에서 열 Q_H를 받아 일부를 일 W로 바꾸고 나머지 Q_C를 차가운 열원에 버린다. 등온 팽창 → 단열 팽창 → 등온 압축 → 단열 압축의 네 과정으로 이루어진 카르노 순환은 두 온도 사이에서 작동하는 모든 열기관 중 효율이 가장 높으며, 그 효율은 두 온도만으로 정해진다. 순환 곡선이 둘러싼 넓이가 한 번의 순환에서 하는 일이다.',
    params: [R('TH', '고온 열원 T_H', 'K', 400, 900, 10, 600), R('TC', '저온 열원 T_C', 'K', 200, 400, 10, 300), R('rv', '등온 팽창 부피비 V₂/V₁', '', 1.5, 4, 0.1, 2)],
    fix(P) { if (P.TC >= P.TH) P.TC = P.TH - 10; },
    st(P) {
      const g = 5 / 3, n = 1, V1 = 1, V2 = V1 * P.rv, k = Math.pow(P.TH / P.TC, 1 / (g - 1)), V3 = V2 * k, V4 = V1 * k;
      const QH = n * K.R * P.TH * log(P.rv), QC = n * K.R * P.TC * log(P.rv);
      return { g, V1, V2, V3, V4, QH, QC, W: QH - QC };
    },
    out(P) { const s = this.st(P); return [['효율 η = 1 − T_C/T_H', (1 - P.TC / P.TH) * 100, '%'], ['흡수한 열 Q_H', s.QH, 'J'], ['버린 열 Q_C', s.QC, 'J'], ['한 일 W = Q_H − Q_C', s.W, 'J'], ['같은 온도로 작동하는 냉장고의 성능 계수', P.TC / (P.TH - P.TC), '']]; },
    sub: (P) => `\\eta = 1 - \\frac{${ft(P.TC)}}{${ft(P.TH)}} = ${ft(1 - P.TC / P.TH)} = ${ft((1 - P.TC / P.TH) * 100)}\\%`,
    init(S) { S.u = 0; },
    step(S, P, dt) { S.u = (S.u + dt / 8) % 1; },
    draw(d, S, P) {
      d.clear();
      const s = this.st(P), R1 = K.R / 1000;
      const Pof = (V, T) => (R1 * T) / V;
      const seg = [
        (u) => { const V = s.V1 * Math.pow(s.V2 / s.V1, u); return [V, Pof(V, P.TH), P.TH]; },
        (u) => { const V = s.V2 * Math.pow(s.V3 / s.V2, u), T = P.TH * Math.pow(s.V2 / V, s.g - 1); return [V, Pof(V, T), T]; },
        (u) => { const V = s.V3 * Math.pow(s.V4 / s.V3, u); return [V, Pof(V, P.TC), P.TC]; },
        (u) => { const V = s.V4 * Math.pow(s.V1 / s.V4, u), T = P.TC * Math.pow(s.V4 / V, s.g - 1); return [V, Pof(V, T), T]; },
      ];
      const cols = [C.red, C.purple, C.cyan, C.purple], names = ['① 등온 팽창 (Q_H 흡수)', '② 단열 팽창', '③ 등온 압축 (Q_C 방출)', '④ 단열 압축'];
      const pm = Pof(s.V1, P.TH) * 1.12, vm = s.V3 * 1.08;
      const p = d.plot({ x: 70, y: 50, w: 470, h: 450, xmin: 0, xmax: vm, ymin: 0, ymax: pm, title: '카르노 순환 P-V 도표 (1 mol 단원자 기체)', xl: 'V (상대값)', yl: 'P (상대값)', xticks: false, yticks: false });
      const all = [];
      seg.forEach((f) => { for (let i = 0; i <= 60; i++) { const q = f(i / 60); all.push([p.X(q[0]), p.Y(q[1])]); } });
      d.poly(all, null, 0, true, 'rgba(255,216,77,0.13)');
      seg.forEach((f, k) => { const pts = []; for (let i = 0; i <= 60; i++) { const q = f(i / 60); pts.push([q[0], q[1]]); } p.pts(pts, cols[k], 3); });
      const kk = floor(S.u * 4), cur = seg[kk]((S.u * 4) % 1);
      p.dot(cur[0], cur[1], C.white, 7);
      d.text('넓이 = 한 일 W', p.X((s.V1 + s.V3) / 2.4), p.Y(Pof(s.V2, P.TH) * 0.55), C.yellow, 12, 'center');
      d.text(names[kk], 600, 50, cols[kk], 15, 'left', 'middle', true);
      d.rect(600, 80, 270, 40, PL.rgba(C.red, 0.6), null, 0, 8); d.text('고온 열원 T_H = ' + P.TH + ' K', 735, 100, '#fff', 13, 'center');
      d.rect(600, 440, 270, 40, PL.rgba(C.cyan, 0.6), null, 0, 8); d.text('저온 열원 T_C = ' + P.TC + ' K', 735, 460, '#0a1020', 13, 'center');
      d.circle(735, 280, 50, '#2a3558', '#cfd8ee', 2); d.text('기관', 735, 280, C.text, 14, 'center', 'middle', true);
      const wq = (v) => 3 + 14 * (v / s.QH);
      d.arrow(735, 122, 735, 228, C.red, wq(s.QH)); d.text('Q_H = ' + fmt(s.QH, 4) + ' J', 750, 175, C.red, 12);
      d.arrow(735, 332, 735, 436, C.cyan, wq(s.QC)); d.text('Q_C = ' + fmt(s.QC, 4) + ' J', 750, 385, C.cyan, 12);
      d.arrow(787, 280, 880, 280, C.yellow, wq(s.W)); d.text('W', 860, 262, C.yellow, 13, 'center', 'middle', true);
      d.text('η = ' + fmt((1 - P.TC / P.TH) * 100, 3) + '%', 600, 520, C.green, 18, 'left', 'middle', true);
    },
  });

  add({
    id: 'fourier', cat: '열기관과 열전달', name: '열전도 (푸리에 법칙)', en: "Heat Conduction — Fourier's Law",
    tex: ['\\vec q = -k\\nabla T', '\\frac{\\partial T}{\\partial t} = \\alpha\\frac{\\partial^2 T}{\\partial x^2},\\qquad \\alpha = \\frac{k}{\\rho c}'],
    short: '\\vec q = -k\\nabla T',
    desc: '열은 온도가 높은 곳에서 낮은 곳으로, 온도 기울기에 비례해 흐른다(푸리에 법칙). 이로부터 온도 분포가 시간에 따라 퍼지는 열 확산 방정식이 나온다. 1 m 막대의 양 끝 온도를 고정하면 처음 분포와 상관없이 결국 직선 모양의 정상 상태(점선)에 이르고, 열확산도 α가 클수록 빨리 도달한다. 화살표는 국소적인 열 흐름의 방향과 크기이다.',
    params: [R('TL', '왼쪽 끝 온도', '°C', 0, 100, 1, 100), R('TR', '오른쪽 끝 온도', '°C', 0, 100, 1, 0), R('al', '열확산도 α', '×10⁻⁴ m²/s', 0.1, 2, 0.05, 1), R('k', '열전도도 k', 'W/(m·K)', 1, 400, 1, 200), Sel('init', '처음 온도 분포', [['flat', '전체 20 °C'], ['hot', '가운데만 뜨거움'], ['step', '왼쪽 반만 뜨거움']], 'flat', { reset: 1 })],
    out: (P, S) => {
      const N = 121, i = 60, grad = (S.T[i + 1] - S.T[i - 1]) / (2 / (N - 1));
      return [['정상 상태 열흐름 k(T_L − T_R)/L', (P.k * (P.TL - P.TR)) / 1, 'W/m²'], ['막대 가운데 현재 열흐름 −k dT/dx', -P.k * grad, 'W/m²'], ['가운데 온도', S.T[i], '°C'], ['경과 시간 (실제)', S.tr / 60, '분'], ['특성 시간 L²/α', 1 / (P.al * 1e-4) / 60, '분']];
    },
    sub: (P) => `q = k\\frac{T_L - T_R}{L} = (${ft(P.k)})\\frac{${ft(P.TL)} - ${ft(P.TR)}}{1} = ${ft(P.k * (P.TL - P.TR))}\\ \\mathrm{W/m^2}`,
    init(S, P) {
      const N = 121;
      S.T = new Float64Array(N);
      for (let i = 0; i < N; i++) { const x = i / (N - 1); S.T[i] = P.init === 'flat' ? 20 : P.init === 'hot' ? (abs(x - 0.5) < 0.1 ? 100 : 20) : x < 0.5 ? 90 : 10; }
      S.tr = 0;
    },
    step(S, P, dt) {
      const N = 121, dx = 1 / (N - 1), a = P.al * 1e-4, real = dt * 600, hmax = (0.4 * dx * dx) / a, n = Math.ceil(real / hmax), h = real / n;
      const T = S.T, tmp = new Float64Array(N);
      for (let s = 0; s < n; s++) {
        T[0] = P.TL; T[N - 1] = P.TR;
        for (let i = 1; i < N - 1; i++) tmp[i] = T[i] + ((a * h) / (dx * dx)) * (T[i + 1] - 2 * T[i] + T[i - 1]);
        for (let i = 1; i < N - 1; i++) T[i] = tmp[i];
      }
      T[0] = P.TL; T[N - 1] = P.TR;
      S.tr += real;
    },
    draw(d, S, P) {
      d.clear();
      const N = 121, x0 = 60, x1 = 840, w = (x1 - x0) / (N - 1);
      for (let i = 0; i < N; i++) d.rect(x0 + i * w - w / 2, 110, w + 0.6, 56, heat(S.T[i]));
      d.rect(x0 - 4, 106, x1 - x0 + 8, 64, null, '#cfd8ee', 2, 6);
      d.text(P.TL + ' °C', x0, 92, C.text, 12, 'center'); d.text(P.TR + ' °C', x1, 92, C.text, 12, 'center');
      for (let i = 6; i < N - 6; i += 12) {
        const qv = -(S.T[i + 1] - S.T[i - 1]) / 2, L = M.clamp(qv * 18, -60, 60);
        if (abs(L) > 3) d.arrow(x0 + i * w - L / 2, 200, x0 + i * w + L / 2, 200, C.orange, 2.5, 8);
      }
      d.text('열 흐름 q = −k dT/dx', 60, 228, C.orange, 12);
      const p = d.plot({ x: 70, y: 270, w: 790, h: 240, xmin: 0, xmax: 1, ymin: 0, ymax: 105, title: '온도 분포 T(x)', xl: 'x (m)', yl: 'T (°C)' });
      p.fn((x) => P.TL + (P.TR - P.TL) * x, 'rgba(255,216,77,0.7)', 1.5, 2, [6, 5]);
      p.pts(Array.from(S.T, (T, i) => [i / (N - 1), T]), C.red, 3);
    },
  });

  add({
    id: 'cooling', cat: '열기관과 열전달', name: '뉴턴의 냉각 법칙', en: "Newton's Law of Cooling",
    tex: ['\\frac{dT}{dt} = -k\\,(T - T_{\\text{주변}})', 'T(t) = T_{\\text{주변}} + (T_0 - T_{\\text{주변}})\\,e^{-kt}'],
    short: 'T = T_{\\text{env}} + (T_0 - T_{\\text{env}})e^{-kt}',
    desc: '물체가 식는 속도는 물체와 주변의 온도 차에 비례한다. 그래서 뜨거운 커피는 처음에 빨리 식다가 주변 온도에 가까워질수록 천천히 식으며, 온도 차는 지수적으로 줄어든다. 그래프의 접선 기울기(노란 점선)가 현재 냉각 속도이다. 법의학에서 사망 추정 시각을 계산할 때도 쓰인다. (1초 = 5분으로 표시)',
    params: [R('T0', '처음 온도 T₀', '°C', 0, 100, 1, 90, { reset: 1 }), R('Te', '주변 온도', '°C', -10, 40, 1, 20), R('k', '냉각 상수 k', '/분', 0.01, 0.3, 0.005, 0.05)],
    out: (P, S) => [['현재 온도', S.T, '°C'], ['냉각 속도 dT/dt', -P.k * (S.T - P.Te), '°C/분'], ['온도 차가 반으로 줄어드는 시간 ln2/k', Math.LN2 / P.k, '분'], ['60 °C가 되는 시각', (P.T0 - P.Te) * (60 - P.Te) > 0 && abs(60 - P.Te) < abs(P.T0 - P.Te) ? log((P.T0 - P.Te) / (60 - P.Te)) / P.k : '—', '분'], ['경과 시간', S.tm, '분']],
    sub: (P, S) => `T(${ft(S.tm, 3)}) = ${ft(P.Te)} + (${ft(P.T0)} - ${ft(P.Te)})e^{-${ft(P.k)}\\times${ft(S.tm, 3)}} = ${ft(S.T)}\\ ^\\circ\\mathrm{C}`,
    init(S, P) { S.tm = 0; S.T = P.T0; S.hist = [[0, P.T0]]; S.steam = []; },
    step(S, P, dt) {
      S.tm += dt * 5;
      S.T = P.Te + (S.T - P.Te) * exp(-P.k * dt * 5);
      S.hist.push([S.tm, S.T]);
      if (S.tm > 120) this.init(S, P);
      if (Math.random() < (S.T - P.Te) / 60) S.steam.push({ x: 200 + Math.random() * 60, y: 230, a: 1 });
      S.steam.forEach((s) => { s.y -= 40 * dt; s.x += sin(s.y / 15) * 0.6; s.a -= 0.5 * dt; });
      S.steam = S.steam.filter((s) => s.a > 0);
    },
    draw(d, S, P) {
      d.clear();
      S.steam.forEach((s) => d.circle(s.x, s.y, 8, `rgba(230,236,250,${0.25 * s.a})`));
      d.poly([[170, 250], [290, 250], [280, 380], [180, 380]], '#cfd8ee', 2.5, true, heat(S.T, -10, 100, 0.85));
      d.arc(300, 300, 26, -PI / 2, PI / 2, '#cfd8ee', 6);
      d.rect(150, 380, 160, 10, '#5d6b8f', null, 0, 4);
      d.text(fmt(S.T, 3) + ' °C', 230, 420, C.text, 18, 'center', 'middle', true);
      d.text('주변 ' + P.Te + ' °C', 230, 448, C.dim, 12, 'center');
      const p = d.plot({ x: 400, y: 60, w: 470, h: 420, xmin: 0, xmax: 120, ymin: min(P.Te, P.T0) - 5, ymax: max(P.T0, P.Te) + 5, title: '온도 T(t)', xl: 't (분)', yl: 'T (°C)' });
      p.fn((t) => P.Te + (P.T0 - P.Te) * exp(-P.k * t), 'rgba(255,92,108,0.3)', 1.5);
      p.hl(P.Te, C.cyan); p.pts(S.hist, C.red, 3);
      const sl = -P.k * (S.T - P.Te), dx = 15;
      p.pts([[S.tm - dx, S.T - sl * dx], [S.tm + dx, S.T + sl * dx]], C.yellow, 1.5, [5, 4]);
      p.dot(S.tm, S.T, C.red);
    },
  });

  const planck = (lam, T) => (2 * K.h * K.c * K.c) / Math.pow(lam, 5) / (exp((K.h * K.c) / (lam * K.kB * T)) - 1);
  add({
    id: 'stefan', cat: '열기관과 열전달', name: '슈테판-볼츠만 법칙과 빈의 변위 법칙', en: 'Stefan–Boltzmann & Wien Displacement Laws',
    tex: ['j^\\star = \\sigma T^4,\\qquad P = \\varepsilon\\sigma A T^4', '\\lambda_{\\max} = \\frac{b}{T},\\qquad b = 2.898\\times10^{-3}\\ \\mathrm{m\\,K}'],
    short: 'P = \\varepsilon\\sigma AT^4',
    desc: '모든 물체는 온도에 따라 전자기파를 복사한다. 흑체가 단위 넓이에서 내보내는 에너지는 절대 온도의 네제곱에 비례하므로(슈테판-볼츠만 법칙) 온도가 2배가 되면 복사는 16배가 된다. 또 온도가 높을수록 복사 세기가 최대인 파장이 짧아져(빈의 변위 법칙) 물체가 빨강 → 노랑 → 흰색 → 푸른색으로 빛난다. 태양 표면은 약 5778 K이다.',
    params: [R('T', '표면 온도 T', 'K', 300, 12000, 10, 5778), R('em', '방출률 ε', '', 0.05, 1, 0.01, 1), R('A', '표면적 A', 'm²', 0.01, 10, 0.01, 1)],
    out: (P) => {
      const j = K.sigma * P.T ** 4, lm = (K.wien / P.T) * 1e9;
      return [['단위 넓이당 복사 σT⁴', j, 'W/m²'], ['총 복사 일률 P = εσAT⁴', P.em * j * P.A, 'W'], ['최대 세기 파장 λ_max', lm, 'nm'], ['λ_max 영역', PL.wlName(lm), ''], ['태양 표면 대비', j / (K.sigma * 5778 ** 4), '배']];
    },
    sub: (P) => `P = (${ft(P.em)})(5.67\\times10^{-8})(${ft(P.A)})(${ft(P.T)})^4 = ${ft(P.em * K.sigma * P.A * P.T ** 4)}\\ \\mathrm{W}`,
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const col = PL.bb2rgb(P.T), b = M.clamp(Math.log10(K.sigma * P.T ** 4) / 8.3, 0.1, 1) * P.em;
      d.glow(200, 250, 200 * b + 30, PL.rgb(col, 0.55 * b));
      d.circle(200, 250, 90, PL.rgb(col.map((c) => c * (0.25 + 0.75 * b))));
      d.text('T = ' + P.T + ' K', 200, 400, C.text, 15, 'center', 'middle', true);
      d.text(P.T < 800 ? '(눈에 보이는 빛은 거의 없음 — 적외선)' : '', 200, 424, C.dim, 12, 'center');
      const ymax = planck(K.wien / P.T, P.T) * 1.15;
      const p = d.plot({ x: 430, y: 50, w: 440, h: 250, xmin: 0, xmax: 3000, ymin: 0, ymax, title: '흑체 복사 스펙트럼', xl: 'λ (nm)', yl: '세기', yticks: false });
      for (let wl = 380; wl < 780; wl += 4) { const X = p.X(wl), Y = p.Y(planck(wl * 1e-9, P.T)); d.rect(X, Y, p.X(wl + 4) - X + 0.5, p.Y(0) - Y, PL.wlCss(wl, 0.8)); }
      p.fn((wl) => planck(wl * 1e-9, P.T), C.white, 2.5, 300, null, 50, 3000);
      p.vl((K.wien / P.T) * 1e9, C.yellow);
      p.label('λ_max', (K.wien / P.T) * 1e9 + 30, ymax * 0.92, C.yellow, 11);
      const q = d.plot({ x: 430, y: 360, w: 440, h: 150, xmin: 300, xmax: 12000, ymin: 1e2, ymax: 2e9, ylog: true, title: '온도에 따른 σT⁴ (로그 축)', xl: 'T (K)', yl: 'W/m²' });
      q.fn((T) => K.sigma * T ** 4, C.orange, 2.5);
      q.dot(P.T, K.sigma * P.T ** 4, C.orange);
    },
  });

  /* ================================================================ 통계역학 */
  add({
    id: 'boltzmann', cat: '통계역학', name: '볼츠만 분포', en: 'Boltzmann Distribution',
    tex: ['\\frac{N_i}{N} = \\frac{e^{-E_i/k_BT}}{Z},\\qquad Z = \\sum_i e^{-E_i/k_BT}'],
    short: 'P(E) \\propto e^{-E/k_BT}',
    desc: '온도 T의 열평형 상태에서 에너지 E인 상태에 있을 확률은 e^{−E/kT}에 비례한다. 온도가 낮으면 거의 모든 입자가 바닥 상태에 모이고, 온도가 높을수록 높은 에너지 준위에도 입자가 퍼진다. 입자들은 무작위로 위아래 준위로 뛰어오르거나 내려오며(메트로폴리스 알고리즘), 그 결과 막대(시뮬레이션)가 이론 곡선(점)에 맞춰진다. Z는 분배 함수이다.',
    params: [R('kT', '온도 k_BT / ε', '', 0.1, 5, 0.05, 1)],
    theory: (kT) => { const w = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => exp(-i / kT)), Z = M.sum(w); return { p: w.map((x) => x / Z), Z }; },
    out(P, S) {
      const th = this.theory(P.kT), Em = M.sum(th.p.map((p, i) => p * i));
      const mEm = S.lv ? M.sum(Array.from(S.lv)) / S.lv.length : 0;
      return [['분배 함수 Z', th.Z, ''], ['평균 에너지 ⟨E⟩/ε (이론)', Em, ''], ['평균 에너지 (시뮬레이션)', mEm, ''], ['N₁/N₀ = e^{−ε/kT}', exp(-1 / P.kT), '']];
    },
    sub: (P) => `\\frac{N_1}{N_0} = e^{-\\varepsilon/k_BT} = e^{-1/${ft(P.kT)}} = ${ft(exp(-1 / P.kT))}`,
    init(S) { S.lv = new Uint8Array(200); },
    step(S, P, dt) {
      const n = floor(4000 * dt) + 1;
      for (let k = 0; k < n; k++) {
        const i = floor(Math.random() * 200), cur = S.lv[i], nw = cur + (Math.random() < 0.5 ? 1 : -1);
        if (nw < 0 || nw > 7) continue;
        if (nw < cur || Math.random() < exp(-(nw - cur) / P.kT)) S.lv[i] = nw;
      }
    },
    draw(d, S, P) {
      d.clear();
      const cnt = new Array(8).fill(0);
      S.lv.forEach((l) => cnt[l]++);
      for (let i = 0; i < 8; i++) {
        const y = 490 - i * 57;
        d.line(60, y, 470, y, '#5d6b8f', 2);
        d.text('E' + '₀₁₂₃₄₅₆₇'[i] + ' = ' + i + 'ε', 480, y, C.dim, 11);
        for (let k = 0; k < cnt[i]; k++) { const row = floor(k / 100), col = k % 100; d.circle(66 + col * 4, y - 6 - row * 7, 2.2, PL.heatColor(i / 8)); }
      }
      d.text('입자 200개의 에너지 준위 분포', 60, 44, C.text, 13);
      const th = this.theory(P.kT);
      const p = d.plot({ x: 580, y: 60, w: 290, h: 420, xmin: -0.5, xmax: 7.5, ymin: 0, ymax: 1, title: '준위별 점유 비율', xl: '준위 i', yl: 'Nᵢ/N', nx: 8 });
      for (let i = 0; i < 8; i++) { const y = cnt[i] / 200; d.rect(p.X(i - 0.35), p.Y(y), p.X(0.35) - p.X(-0.35), p.Y(0) - p.Y(y), 'rgba(56,189,248,0.55)'); }
      p.fn((x) => exp(-x / P.kT) / th.Z, 'rgba(255,159,67,0.6)', 1.5, 200, [4, 4], 0, 7.4);
      th.p.forEach((q, i) => p.dot(i, q, C.orange, 4.5));
    },
  });

  add({
    id: 'einsteinsolid', cat: '통계역학', name: '볼츠만 엔트로피와 아인슈타인 고체', en: 'Boltzmann Entropy — Two Einstein Solids',
    tex: ['S = k_B\\ln\\Omega,\\qquad \\Omega(N, q) = \\binom{q + N - 1}{q}', '\\Omega_{\\text{전체}} = \\Omega_A(q_A)\\,\\Omega_B(q - q_A)\\ \\text{가 최대인 } q_A \\text{ 로 간다}'],
    short: 'S = k_B\\ln\\Omega',
    desc: '진동자 N개에 에너지 양자 q개를 나누어 주는 방법의 수가 Ω이다. 두 고체 A, B가 에너지를 주고받으면 양자들은 무작위로 옮겨 다니지만, 결국 전체 미시 상태 수 Ω_A·Ω_B가 가장 큰 분배(오른쪽 위 곡선의 봉우리) 근처에 머문다. 이것이 열평형이며 이때 두 고체의 온도가 같다. 처음에는 모든 에너지가 A(왼쪽)에 있다. 칸의 밝기는 각 진동자의 에너지이다.',
    params: [R('NA', '고체 A의 진동자 수 N_A', '', 10, 200, 10, 60, { reset: 1 }), R('NB', '고체 B의 진동자 수 N_B', '', 10, 200, 10, 120, { reset: 1 }), R('q', '총 에너지 양자 수 q', '', 10, 300, 10, 120, { reset: 1 })],
    lnO: (N, q) => M.lnC(q + N - 1, q),
    out(P, S) {
      let best = 0, bv = -1e9;
      for (let a = 0; a <= P.q; a++) { const v = this.lnO(P.NA, a) + this.lnO(P.NB, P.q - a); if (v > bv) { bv = v; best = a; } }
      return [['현재 q_A', S.qa, ''], ['가장 확률 높은 q_A', best, ''], ['비례 배분 q·N_A/(N_A+N_B)', (P.q * P.NA) / (P.NA + P.NB), ''], ['현재 전체 엔트로피 S/k', this.lnO(P.NA, S.qa) + this.lnO(P.NB, P.q - S.qa), ''], ['최대 엔트로피 S/k', bv, '']];
    },
    init(S, P) {
      S.e = new Uint16Array(P.NA + P.NB);
      for (let k = 0; k < P.q; k++) S.e[floor(Math.random() * P.NA)]++;
      S.qa = P.q; S.vis = new Float64Array(P.q + 1); S.hist = [];
    },
    step(S, P, dt) {
      const N = P.NA + P.NB, n = floor(1500 * dt) + 1;
      for (let k = 0; k < n; k++) {
        const i = floor(Math.random() * N);
        if (S.e[i] === 0) continue;
        const j = floor(Math.random() * N);
        S.e[i]--; S.e[j]++;
        if (i < P.NA && j >= P.NA) S.qa--; else if (i >= P.NA && j < P.NA) S.qa++;
      }
      S.vis[S.qa] += 1; S.t += dt;
      S.hist.push([S.t, this.lnO(P.NA, S.qa) + this.lnO(P.NB, P.q - S.qa)]);
      if (S.hist.length > 900) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const grid = (x0, from, cnt, lbl, col) => {
        const cols = 10, cs = 17;
        d.text(lbl, x0, 40, col, 13, 'left', 'middle', true);
        for (let k = 0; k < cnt; k++) {
          const e = S.e[from + k], X = x0 + (k % cols) * cs, Y = 56 + floor(k / cols) * cs;
          d.rect(X, Y, cs - 2, cs - 2, e ? PL.rgba(col, M.clamp(0.15 + e / 6, 0, 1)) : 'rgba(255,255,255,0.04)');
        }
      };
      grid(40, 0, P.NA, '고체 A (N_A = ' + P.NA + ', q_A = ' + S.qa + ')', C.orange);
      grid(250, P.NA, P.NB, '고체 B (N_B = ' + P.NB + ', q_B = ' + (P.q - S.qa) + ')', C.cyan);
      let mx = -1e9;
      const lw = [];
      for (let a = 0; a <= P.q; a++) { const v = this.lnO(P.NA, a) + this.lnO(P.NB, P.q - a); lw.push(v); mx = max(mx, v); }
      const Z = M.sum(lw.map((v) => exp(v - mx)));
      const p = d.plot({ x: 480, y: 50, w: 390, h: 200, xmin: 0, xmax: P.q, ymin: 0, ymax: (1 / Z) * 1.25, title: 'q_A의 확률: 이론(곡선) vs 방문 빈도(막대)', xl: 'q_A', yl: 'P', yticks: false });
      const tot = M.sum(Array.from(S.vis)) || 1, bw = max(1, Math.round(P.q / 60));
      for (let a = 0; a <= P.q; a += bw) { let c = 0; for (let b = a; b < a + bw && b <= P.q; b++) c += S.vis[b]; const y = c / tot / bw; d.rect(p.X(a), p.Y(y), max(1, p.X(bw) - p.X(0) - 1), p.Y(0) - p.Y(y), 'rgba(56,189,248,0.5)'); }
      p.pts(lw.map((v, a) => [a, exp(v - mx) / Z]), C.orange, 2);
      p.vl(S.qa, C.yellow, null, 2);
      const q = d.plot({ x: 480, y: 320, w: 390, h: 190, xmin: max(0, S.t - 20), xmax: max(20, S.t), ymin: lw[P.q] - 2, ymax: mx + 3, title: '전체 엔트로피 S/k = ln(Ω_A Ω_B)', xl: 't (s)' });
      q.hl(mx, C.yellow); q.pts(S.hist, C.green, 2);
    },
  });

  add({
    id: 'brownian', cat: '통계역학', name: '브라운 운동과 확산 (아인슈타인 관계식)', en: 'Brownian Motion & Diffusion',
    tex: ['\\langle r^2\\rangle = 4Dt\\quad(\\text{2차원}),\\qquad D = \\frac{k_BT}{6\\pi\\eta a}'],
    short: '\\langle r^2 \\rangle = 4Dt',
    desc: '물에 뜬 작은 입자는 보이지 않는 물 분자들에게 사방에서 무작위로 얻어맞아 불규칙하게 떨린다(브라운 운동). 한 입자의 경로는 예측할 수 없지만, 많은 입자의 평균 제곱 변위는 시간에 정확히 비례해 증가한다. 아인슈타인은 이 기울기(확산 계수 D)가 온도·점성·입자 크기로 정해짐을 보였고, 페랭은 이를 측정해 원자의 실재와 아보가드로 수를 확인했다. (4배속)',
    params: [R('T', '온도 T', 'K', 250, 400, 1, 300), R('eta', '점성 계수 η', 'mPa·s', 0.3, 5, 0.05, 1), R('a', '입자 반지름 a', 'μm', 0.1, 2, 0.05, 0.5)],
    D: (P) => (K.kB * P.T) / (6 * PI * P.eta * 1e-3 * P.a * 1e-6),
    out(P, S) { const D = this.D(P) * 1e12; return [['확산 계수 D', D, 'μm²/s'], ['10초 후 rms 거리 √(4Dt)', sqrt(4 * D * 10), 'μm'], ['측정 ⟨r²⟩/(4t)', S.msd && S.tt > 0 ? S.msd / (4 * S.tt) : 0, 'μm²/s'], ['경과 시간', S.tt, 's']]; },
    sub(P) { return `D = \\frac{(1.38\\times10^{-23})(${ft(P.T)})}{6\\pi(${ft(P.eta * 1e-3)})(${ft(P.a * 1e-6)})} = ${ft(this.D(P))}\\ \\mathrm{m^2/s}`; },
    init(S) { S.w = Array.from({ length: 60 }, () => ({ x: 0, y: 0, tr: [[0, 0]] })); S.tt = 0; S.hist = []; S.msd = 0; },
    change(S) { this.init(S); },
    step(S, P, dt) {
      const D = this.D(P) * 1e12, h = dt * 4, s = sqrt(2 * D * h);
      S.w.forEach((w) => { w.x += M.gauss() * s; w.y += M.gauss() * s; w.tr.push([w.x, w.y]); if (w.tr.length > 500) w.tr.shift(); });
      S.tt += h;
      S.msd = M.sum(S.w.map((w) => w.x * w.x + w.y * w.y)) / S.w.length;
      S.hist.push([S.tt, S.msd]);
      if (S.tt > 60) this.init(S);
    },
    draw(d, S, P) {
      d.clear();
      const cx = 260, cy = 285, sc = 9;
      d.rect(30, 55, 460, 460, 'rgba(255,255,255,0.02)', 'rgba(160,180,225,0.3)', 1);
      d.clip(30, 55, 460, 460);
      S.w.forEach((w, i) => {
        if (i < 5) d.poly(w.tr.map((p) => [cx + p[0] * sc, cy + p[1] * sc]), PL.rgba([C.orange, C.cyan, C.pink, C.green, C.yellow][i], 0.8), 1.2);
        d.circle(cx + w.x * sc, cy + w.y * sc, 3.5, i < 5 ? [C.orange, C.cyan, C.pink, C.green, C.yellow][i] : 'rgba(200,210,235,0.55)');
      });
      d.unclip();
      d.line(40, 535, 40 + 10 * sc, 535, '#fff', 2); d.text('10 μm', 40 + 5 * sc, 524, '#fff', 11, 'center');
      d.text('입자 60개 — 모두 가운데에서 출발', 30, 38, C.text, 13);
      const D = this.D(P) * 1e12, tm = max(10, S.tt);
      const p = d.plot({ x: 560, y: 60, w: 310, h: 330, xmin: 0, xmax: tm, ymin: 0, ymax: 4 * D * tm * 1.3 + 1e-6, title: '평균 제곱 변위 ⟨r²⟩', xl: 't (s)', yl: 'μm²' });
      p.fn((t) => 4 * D * t, C.yellow, 2, 2, [6, 4]);
      p.pts(S.hist, C.cyan, 2.5);
      d.text('점선: 이론 4Dt', 560, 425, C.yellow, 12);
      d.text('실선: 60개 입자의 평균', 560, 447, C.cyan, 12);
      d.text('D = ' + fmt(D, 3) + ' μm²/s', 560, 480, C.text, 14, 'left', 'middle', true);
    },
  });

  add({
    id: 'ising', cat: '통계역학', name: '이징 모형과 상전이', en: 'Ising Model & Phase Transition',
    tex: ['H = -J\\sum_{\\langle ij\\rangle} s_i s_j - h\\sum_i s_i,\\qquad s_i = \\pm 1', 'T_c = \\frac{2J}{k_B\\ln(1+\\sqrt2)} \\approx 2.269\\,J/k_B'],
    short: 'H = -J\\sum s_is_j',
    desc: '이웃한 스핀이 같은 방향일 때 에너지가 낮아지는 자석 모형이다. 온도가 임계 온도 T_c ≈ 2.27보다 낮으면 스핀들이 한 방향으로 정렬하는 영역이 자라 자발 자화가 생기고(강자성), 높으면 열 요동 때문에 무질서해진다(상자성). T_c 근처에서는 모든 크기의 섬들이 생기는 임계 현상이 나타난다. 100×100 격자의 메트로폴리스 몬테카를로 시뮬레이션이다(흰색 = 위, 남색 = 아래).',
    params: [R('T', '온도 k_BT/J', '', 0.5, 5, 0.01, 2.0), R('h', '외부 자기장 h/J', '', -1, 1, 0.01, 0), Sel('start', '처음 상태', [['rand', '무작위 (고온)'], ['up', '모두 위 (저온)']], 'rand', { reset: 1 })],
    onsager: (T) => (T >= 2.269185 ? 0 : Math.pow(1 - Math.pow(Math.sinh(2 / T), -4), 1 / 8)),
    out(P, S) { return [['자화 m = ⟨s⟩', S.m, ''], ['에너지 / 스핀', S.E, 'J'], ['T / T_c', P.T / 2.269185, ''], ['온사거 이론의 |m| (h = 0)', this.onsager(P.T), ''], ['상태', P.T < 2.269 ? '강자성 (질서)' : '상자성 (무질서)', '']]; },
    init(S, P) {
      const L = 100;
      S.s = new Int8Array(L * L);
      for (let i = 0; i < L * L; i++) S.s[i] = P.start === 'up' ? 1 : Math.random() < 0.5 ? 1 : -1;
      S.cv = document.createElement('canvas'); S.hist = []; S.m = 0; S.E = 0;
    },
    step(S, P, dt) {
      const L = 100, s = S.s, sweeps = M.clamp(Math.round(dt * 60), 1, 3);
      const tab = new Float64Array(10);
      for (let a = 0; a < 2; a++) for (let b = 0; b < 5; b++) { const sp = a ? 1 : -1, nb = b * 2 - 4, dE = 2 * sp * (nb + P.h); tab[a * 5 + b] = dE <= 0 ? 1 : exp(-dE / P.T); }
      for (let k = 0; k < sweeps * L * L; k++) {
        const i = (Math.random() * L) | 0, j = (Math.random() * L) | 0, q = j * L + i;
        const nb = s[j * L + ((i + 1) % L)] + s[j * L + ((i + L - 1) % L)] + s[((j + 1) % L) * L + i] + s[((j + L - 1) % L) * L + i];
        if (Math.random() < tab[(s[q] > 0 ? 5 : 0) + (nb + 4) / 2]) s[q] = -s[q];
      }
      let m = 0, e = 0;
      for (let j = 0; j < L; j++) for (let i = 0; i < L; i++) { const v = s[j * L + i]; m += v; e -= v * (s[j * L + ((i + 1) % L)] + s[((j + 1) % L) * L + i]) + P.h * v; }
      S.m = m / (L * L); S.E = e / (L * L); S.t += dt;
      S.hist.push([S.t, S.m]);
      if (S.hist.length > 800) S.hist.shift();
    },
    draw(d, S, P) {
      d.clear();
      const L = 100, up = [235, 240, 255], dn = [22, 30, 70];
      PL.raster(L, L, (i, j) => (S.s[j * L + i] > 0 ? up : dn), S.cv);
      d.img(S.cv, 30, 40, 480, 480, false);
      d.rect(30, 40, 480, 480, null, 'rgba(160,180,225,0.4)', 1);
      const p = d.plot({ x: 570, y: 50, w: 300, h: 200, xmin: 0.5, xmax: 5, ymin: 0, ymax: 1.05, title: '자화의 크기 |m|와 온도', xl: 'k_BT/J', yl: '|m|' });
      p.fn((T) => this.onsager(T), C.orange, 2.5, 300);
      p.vl(2.269, C.red); p.label('T_c', 2.32, 0.95, C.red, 11);
      p.dot(P.T, abs(S.m), C.cyan, 6);
      const t1 = max(15, S.t), q = d.plot({ x: 570, y: 320, w: 300, h: 190, xmin: t1 - 15, xmax: t1, ymin: -1.05, ymax: 1.05, title: '자화 m(t)', xl: 't (s)', ny: 4 });
      q.pts(S.hist, C.cyan, 2);
    },
  });

  add({
    id: 'quantumstats', cat: '통계역학', name: '페르미-디랙 · 보스-아인슈타인 분포', en: 'Fermi–Dirac & Bose–Einstein Statistics',
    tex: ['\\bar n_{\\text{FD}} = \\frac{1}{e^{(E-\\mu)/k_BT} + 1},\\qquad \\bar n_{\\text{BE}} = \\frac{1}{e^{(E-\\mu)/k_BT} - 1}', '\\bar n_{\\text{MB}} = e^{-(E-\\mu)/k_BT}\\quad(\\text{고전 극한})'],
    short: '\\bar n = \\frac{1}{e^{(E-\\mu)/kT}\\pm1}',
    desc: '양자역학의 동일 입자는 구별할 수 없다. 전자 같은 페르미온은 파울리 배타 원리 때문에 한 상태에 하나만 들어갈 수 있어 저온에서 화학 퍼텐셜 μ(페르미 에너지)까지 계단처럼 꽉 찬다. 광자·헬륨-4 같은 보손은 한 상태에 몇 개든 들어갈 수 있어 낮은 에너지 상태에 몰리려 한다(보스-아인슈타인 응축, 레이저). 에너지가 높아 점유가 드물면 두 분포 모두 고전적인 맥스웰-볼츠만 분포와 같아진다.',
    params: [R('kT', '온도 k_BT', 'eV', 0.01, 1, 0.01, 0.15), R('mu', '화학 퍼텐셜 μ', 'eV', -1, 2, 0.01, 1)],
    out(P) {
      const muB = min(P.mu, -0.001);
      return [['E = μ에서 FD 점유', 0.5, ''], ['E = μ + 2kT에서 FD 점유', 1 / (exp(2) + 1), ''], ['보손 계산에 쓴 μ', muB, 'eV'], ['E = 0.5 eV의 BE 점유', 1 / (exp((0.5 - muB) / P.kT) - 1), ''], ['E = 0.5 eV의 FD 점유', 1 / (exp((0.5 - P.mu) / P.kT) + 1), '']];
    },
    init(S) { S.acc = 1; S.fd = []; S.be = []; },
    step(S, P, dt) {
      S.acc += dt;
      if (S.acc < 0.5) return;
      S.acc = 0;
      const muB = min(P.mu, -0.001);
      S.fd = []; S.be = [];
      for (let k = 0; k < 14; k++) {
        const E = 0.1 + k * 0.2, nf = 1 / (exp((E - P.mu) / P.kT) + 1), nb = 1 / (exp((E - muB) / P.kT) - 1), pb = nb / (1 + nb);
        S.fd.push(Math.random() < nf ? 1 : 0);
        let c = 0; while (Math.random() < pb && c < 12) c++;
        S.be.push(c);
      }
    },
    draw(d, S, P) {
      d.clear();
      const muB = min(P.mu, -0.001);
      const p = d.plot({ x: 70, y: 50, w: 470, h: 450, xmin: 0, xmax: 3, ymin: 0, ymax: 2, title: '평균 점유수 n̄(E)', xl: 'E (eV)', yl: 'n̄' });
      p.fn((E) => exp(-(E - P.mu) / P.kT), 'rgba(160,175,210,0.8)', 2, 400, [5, 4]);
      p.fn((E) => 1 / (exp((E - muB) / P.kT) - 1), C.pink, 2.5, 400);
      p.fn((E) => 1 / (exp((E - P.mu) / P.kT) + 1), C.cyan, 3, 400);
      p.vl(P.mu, C.yellow); p.label('μ', P.mu + 0.03, 1.9, C.yellow, 12);
      p.hl(1, 'rgba(255,255,255,0.25)');
      d.text('페르미-디랙 (페르미온)', 380, 70, C.cyan, 12); d.text('보스-아인슈타인 (보손)', 380, 90, C.pink, 12); d.text('맥스웰-볼츠만 (고전)', 380, 110, '#a8b3cc', 12);
      const lv = (x0, title, arr, col) => {
        d.text(title, x0, 44, col, 13, 'left', 'middle', true);
        for (let k = 0; k < 14; k++) {
          const y = 500 - k * 32;
          d.line(x0, y, x0 + 130, y, '#5d6b8f', 1.5);
          const n = arr[k] || 0;
          for (let c = 0; c < n; c++) d.circle(x0 + 10 + c * 10, y - 7, 4, col);
        }
      };
      lv(590, '페르미온 (한 칸에 1개)', S.fd, C.cyan);
      lv(745, '보손 (여러 개 가능)', S.be, C.pink);
      d.text('준위 E = 0.1 … 2.7 eV', 590, 530, C.dim, 11);
    },
  });

  const vdwP = (V, T) => (8 * T) / (3 * V - 1) - 3 / (V * V);
  function maxwellVdw(T) {
    if (T >= 1) return null;
    const dP = (V) => (-24 * T) / (3 * V - 1) ** 2 + 6 / V ** 3;
    let Va = null, Vb = null, prev = dP(0.34);
    for (let V = 0.341; V < 20; V *= 1.002) { const c = dP(V); if (prev < 0 && c >= 0 && Va == null) Va = V; if (prev > 0 && c <= 0 && Va != null) { Vb = V; break; } prev = c; }
    if (Va == null || Vb == null) return null;
    const Pmin = max(vdwP(Va, T), 1e-6), Pmax = vdwP(Vb, T);
    const F = (V) => ((8 * T) / 3) * log(3 * V - 1) + 3 / V;
    const roots = (Ps) => [M.bisect((V) => vdwP(V, T) - Ps, 1 / 3 + 1e-9, Va, 70), M.bisect((V) => vdwP(V, T) - Ps, Vb, 200, 70)];
    const area = (Ps) => { const [l, g] = roots(Ps); return F(g) - F(l) - Ps * (g - l); };
    const Ps = M.bisect(area, Pmin, Pmax, 70), [Vl, Vg] = roots(Ps);
    return { Ps, Vl, Vg };
  }
  add({
    id: 'vanderwaals', cat: '통계역학', name: '반데르발스 상태 방정식 (실제 기체와 상전이)', en: 'Van der Waals Equation — Liquid–Gas Transition',
    tex: ['\\left(P + \\frac{an^2}{V^2}\\right)(V - nb) = nRT', 'P_r = \\frac{8T_r}{3V_r - 1} - \\frac{3}{V_r^2}\\quad(P_r = P/P_c,\\ V_r = V/V_c,\\ T_r = T/T_c)'],
    short: '\\left(P + \\frac{an^2}{V^2}\\right)(V-nb) = nRT',
    desc: '실제 기체 분자는 크기가 있고(b) 서로 끌어당긴다(a). 이를 반영한 반데르발스 방정식은 임계 온도 T_c보다 낮은 온도에서 기체를 압축하면 액체로 응결하는 상전이를 설명한다. 이때 등온선의 물결 부분은 실제로는 일정한 압력의 수평선(맥스웰 등넓이 작도)으로 바뀌고, 그 구간에서는 액체와 기체가 공존한다(보라색 돔). T_c 위에서는 아무리 압축해도 액체와 기체의 구분이 없다(초임계 유체). 상태점이 등온선을 따라 압축·팽창을 반복한다.',
    params: [R('Tr', '환산 온도 T/T_c', '', 0.85, 1.5, 0.01, 0.9), Chk('ideal', '이상 기체 등온선 비교', true)],
    out: (P, S) => {
      const mx = maxwellVdw(P.Tr);
      return [['CO₂ 기준 실제 온도 (T_c = 304 K)', P.Tr * 304.1, 'K'], ['포화 압력 P/P_c', mx ? mx.Ps : '임계 온도 이상', ''], ['CO₂ 기준 포화 압력 (P_c = 7.38 MPa)', mx ? mx.Ps * 7.38 : '—', 'MPa'], ['액체 부피 V_l/V_c', mx ? mx.Vl : '—', ''], ['기체 부피 V_g/V_c', mx ? mx.Vg : '—', ''], ['현재 상태', S.phase || '', '']];
    },
    init(S) { S.u = 0; S.phase = ''; },
    step(S, P, dt) { S.u = (S.u + dt / 10) % 1; },
    draw(d, S, P) {
      d.clear();
      const dome = PL.memo(S, 'dome', 1, () => { const L = [], G = []; for (let T = 0.8; T < 0.9995; T += 0.005) { const m = maxwellVdw(T); if (m) { L.push([m.Vl, m.Ps]); G.push([m.Vg, m.Ps]); } } return L.concat([[1, 1]], G.reverse()); });
      const p = d.plot({ x: 70, y: 50, w: 520, h: 450, xmin: 0.3, xmax: 5, ymin: 0, ymax: 2, title: 'P-V 등온선 (환산 단위)', xl: 'V / V_c', yl: 'P / P_c' });
      d.clip(p.x, p.y, p.w, p.h);
      d.poly(dome.map((q) => [p.X(q[0]), p.Y(q[1])]), 'rgba(167,139,250,0.6)', 1.5, true, 'rgba(167,139,250,0.15)');
      d.unclip();
      [0.85, 0.9, 0.95, 1, 1.1, 1.2, 1.4].forEach((T) => p.fn((V) => vdwP(V, T), T === 1 ? 'rgba(255,92,108,0.6)' : 'rgba(160,175,210,0.22)', T === 1 ? 1.6 : 1, 300, null, 0.36, 5));
      p.fn((V) => vdwP(V, P.Tr), 'rgba(255,159,67,0.45)', 1.5, 400, [4, 4], 0.36, 5);
      const mx = maxwellVdw(P.Tr), Pphys = (V) => (mx && V > mx.Vl && V < mx.Vg ? mx.Ps : vdwP(V, P.Tr));
      p.fn(Pphys, C.orange, 3, 500, null, 0.36, 5);
      if (P.ideal) p.fn((V) => (8 * P.Tr) / (3 * V), C.cyan, 1.5, 300, [6, 5], 0.4, 5);
      p.dot(1, 1, C.red, 4); p.label('임계점', 1.06, 1.06, C.red, 11);
      const u = S.u < 0.5 ? S.u * 2 : 2 - S.u * 2, V = 4.6 - 4.1 * M.smooth(u), Pc = Pphys(V);
      p.dot(V, Pc, C.white, 7);
      let liq = 0;
      if (mx) { if (V <= mx.Vl) liq = 1; else if (V < mx.Vg) liq = (mx.Vg - V) / (mx.Vg - mx.Vl); }
      S.phase = !mx ? (P.Tr >= 1 ? '초임계 유체 (액체·기체 구분 없음)' : '') : liq >= 1 ? '액체' : liq > 0 ? '액체 + 기체 공존 (액체 ' + Math.round(liq * 100) + '%)' : '기체';
      const bx = 650, bw = 200, top = 120, bot = 440, hh = (bot - top) * min(1, V / 4.6);
      d.rect(bx, bot - hh, bw, hh, 'rgba(255,255,255,0.03)', '#cfd8ee', 2);
      d.rect(bx - 6, bot - hh - 12, bw + 12, 12, '#9aa6c4');
      if (liq > 0) d.rect(bx + 2, bot - liq * min(hh, 120) - 2, bw - 4, liq * min(hh, 120), 'rgba(56,140,248,0.7)');
      const ng = Math.round(40 * (1 - liq) * (!mx && P.Tr >= 1 ? 1 : 1));
      for (let k = 0; k < ng; k++) d.circle(bx + 10 + ((k * 53) % (bw - 20)), bot - liq * min(hh, 120) - 10 - ((k * 37 + floor(S.u * 500)) % max(10, hh - liq * min(hh, 120) - 20)), 3, P.Tr >= 1 ? C.purple : C.cyan);
      d.text(S.phase, bx + bw / 2, 470, C.text, 12, 'center');
      d.text('보라 돔: 액체·기체 공존 영역', 600, 520, C.purple, 12);
    },
  });
})();
