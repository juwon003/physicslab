/* =====================================================================
 * 상대성이론 — 특수 상대성이론 · 상대론적 에너지 · 일반 상대성이론 · 우주론
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, log, hypot, floor, atan2 } = Math;
  const add = (law) => PL.add('relativity', law);
  const gam = (b) => 1 / sqrt(1 - b * b);

  function ship(d, x, y, len, col, squeeze = 1) {
    const g = d.g;
    g.save(); g.translate(x, y); g.scale(squeeze, 1);
    const L = len / 2;
    d.poly([[-L, -16], [L - 30, -16], [L, 0], [L - 30, 16], [-L, 16]], '#fff', 1, true, col);
    d.poly([[-L, -16], [-L - 14, -28], [-L + 26, -16]], null, 0, true, PL.shade(col, -0.35));
    d.poly([[-L, 16], [-L - 14, 28], [-L + 26, 16]], null, 0, true, PL.shade(col, -0.35));
    for (let k = 0; k < 4; k++) d.circle(-L + 40 + k * ((len - 90) / 3), 0, 5, '#0a1020');
    g.restore();
  }

  /* ================================================================ 특수 상대성이론 */
  add({
    id: 'lorentztf', cat: '특수 상대성이론', name: '로런츠 변환과 민코프스키 시공간', en: 'Lorentz Transformation & Minkowski Spacetime',
    tex: ["x' = \\gamma\\,(x - vt),\\qquad t' = \\gamma\\left(t - \\frac{vx}{c^2}\\right)", "\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}},\\qquad s^2 = (ct)^2 - x^2 = (ct')^2 - x'^2"],
    short: "x' = \\gamma(x - vt)",
    desc: '빛의 속력이 모든 관성계에서 같으려면 시간과 공간 좌표가 함께 섞여 변환되어야 한다. 민코프스키 도표에서 정지한 관찰자 S의 축(흰색)과 속도 v로 움직이는 관찰자 S′의 축(하늘색)은 서로 비스듬하고, 빛의 세계선(노란 점선, 45°)은 둘 모두에게 같다. 한 사건(흰 점)의 좌표는 관찰자마다 다르지만 시공간 간격 s²은 변하지 않는다(보라색 쌍곡선). 움직이는 관찰자(하늘색 점)의 "지금" 선이 기울어 있는 것이 동시성의 상대성이다.',
    params: [R('b', '상대 속도 β = v/c', '', -0.95, 0.95, 0.01, 0.5), R('x', '사건의 위치 x', '광년', -4, 4, 0.1, 2), R('ct', '사건의 시각 ct', '광년', 0, 5, 0.1, 3)],
    out: (P) => {
      const g = gam(P.b), s2 = P.ct ** 2 - P.x ** 2;
      return [['로런츠 인자 γ', g, ''], ["S′에서 본 위치 x′", g * (P.x - P.b * P.ct), '광년'], ["S′에서 본 시각 ct′", g * (P.ct - P.b * P.x), '년'], ['시공간 간격 s² (불변)', s2, '광년²'], ['간격의 종류', s2 > 1e-9 ? '시간꼴 (인과 관계 가능)' : s2 < -1e-9 ? '공간꼴 (사건 순서가 관찰자마다 다를 수 있음)' : '빛꼴', '']];
    },
    sub: (P) => { const g = gam(P.b); return `x' = ${ft(g)}(${ft(P.x)} - ${ft(P.b)}\\cdot${ft(P.ct)}) = ${ft(g * (P.x - P.b * P.ct))},\\quad ct' = ${ft(g)}(${ft(P.ct)} - ${ft(P.b)}\\cdot${ft(P.x)}) = ${ft(g * (P.ct - P.b * P.x))}`; },
    init(S) { S.tau = 0; },
    step(S, P, dt) { S.tau = (S.tau + dt * 0.8) % 5; },
    draw(d, S, P) {
      d.clear(false);
      const ox = 450, oy = 500, s = 80, X = (x) => ox + x * s, Y = (ct) => oy - ct * s, b = P.b, g = gam(b);
      d.clip(0, 0, 900, 560);
      for (let i = -6; i <= 6; i++) d.line(X(i), 0, X(i), 560, 'rgba(160,175,210,0.08)', 1);
      for (let j = -1; j <= 7; j++) d.line(0, Y(j), 900, Y(j), 'rgba(160,175,210,0.08)', 1);
      for (let k = -14; k <= 14; k++) {
        d.line(X(-7), Y(-7 * b + k / g), X(7), Y(7 * b + k / g), 'rgba(56,189,248,0.13)', 1);
        d.line(X(-1 * b + k / g), Y(-1), X(8 * b + k / g), Y(8), 'rgba(56,189,248,0.13)', 1);
      }
      d.line(X(-7), Y(7), X(7), Y(-7), C.yellow, 1.5, [6, 5]);
      d.line(X(-7), Y(-7), X(7), Y(7), C.yellow, 1.5, [6, 5]);
      d.line(0, Y(0), 900, Y(0), '#e3e9f6', 2); d.line(X(0), 560, X(0), 0, '#e3e9f6', 2);
      d.line(X(-b), Y(-1), X(b * 8), Y(8), C.cyan, 2.5);
      d.line(X(-7), Y(-7 * b), X(7), Y(7 * b), C.cyan, 2.5);
      for (let n = 1; n <= 6; n++) { d.circle(X(g * b * n), Y(g * n), 3.2, C.cyan); d.circle(X(g * n), Y(g * b * n), 3.2, C.cyan); d.circle(X(-g * n), Y(-g * b * n), 3.2, C.cyan); }
      for (let n = 1; n <= 5; n++) { d.line(X(n), Y(0) - 4, X(n), Y(0) + 4, '#fff', 1.5); d.line(X(-n), Y(0) - 4, X(-n), Y(0) + 4, '#fff', 1.5); d.line(X(0) - 4, Y(n), X(0) + 4, Y(n), '#fff', 1.5); }
      const s2 = P.ct ** 2 - P.x ** 2;
      if (abs(s2) > 1e-6) {
        const a = sqrt(abs(s2)), pts = [];
        for (let u = -2.6; u <= 2.6; u += 0.02) { const q = s2 > 0 ? [a * Math.sinh(u), a * Math.cosh(u)] : [a * Math.cosh(u) * (P.x >= 0 ? 1 : -1), a * Math.sinh(u)]; pts.push([X(q[0]), Y(q[1])]); }
        d.poly(pts, 'rgba(167,139,250,0.65)', 1.5, false, null, [4, 4]);
      }
      const ot = S.tau;
      d.line(X(-7), Y(-7 * b + ot / g), X(7), Y(7 * b + ot / g), 'rgba(56,189,248,0.7)', 1.5, [6, 4]);
      d.circle(X(g * b * ot), Y(g * ot), 6, C.cyan, '#fff', 1.5);
      const ex = P.x, ec = P.ct, xa = (ex - b * ec) / (1 - b * b), ta = (ec - b * ex) / (1 - b * b);
      d.line(X(ex), Y(ec), X(ex), Y(0), 'rgba(255,255,255,0.45)', 1, [3, 3]);
      d.line(X(ex), Y(ec), X(0), Y(ec), 'rgba(255,255,255,0.45)', 1, [3, 3]);
      d.line(X(ex), Y(ec), X(xa), Y(b * xa), 'rgba(56,189,248,0.75)', 1.2, [3, 3]);
      d.line(X(ex), Y(ec), X(b * ta), Y(ta), 'rgba(56,189,248,0.75)', 1.2, [3, 3]);
      d.circle(X(ex), Y(ec), 7, C.white, C.pink, 2.5);
      d.unclip();
      d.text('x', 888, Y(0) - 12, C.text, 15, 'right', 'middle', true); d.text('ct', X(0) + 8, 14, C.text, 15, 'left', 'middle', true);
      d.text("ct′", X(b * 5.9) + 10, Y(5.9), C.cyan, 15, 'left', 'middle', true);
      d.text("x′", X(5.4), Y(5.4 * b) - 14, C.cyan, 15, 'left', 'middle', true);
      d.text('빛', X(5.6) + 6, Y(5.6) + 8, C.yellow, 12);
      d.text('하늘색 점: S′의 관찰자 · 점선: 그의 "지금"', 20, 545, C.cyan, 12);
    },
  });

  add({
    id: 'timedilation', cat: '특수 상대성이론', name: '시간 지연 (빛 시계)', en: 'Time Dilation — the Light Clock',
    tex: ['\\Delta t = \\gamma\\,\\Delta t_0 = \\frac{\\Delta t_0}{\\sqrt{1 - v^2/c^2}}'],
    short: '\\Delta t = \\gamma\\,\\Delta t_0',
    desc: '두 거울 사이를 빛이 오가는 "빛 시계"를 생각하자. 시계가 움직이면 정지한 관찰자가 보기에 빛은 비스듬한, 더 긴 경로를 지나야 하는데 빛의 속력은 누구에게나 같으므로 한 번 똑딱이는 데 더 오래 걸린다. 즉 움직이는 시계는 γ배 느리게 간다. 대기권 위에서 생긴 뮤온이 짧은 수명에도 지표까지 도달하는 것, GPS 위성 시계의 보정이 이 효과의 증거이다.',
    params: [R('b', '시계의 속력 β = v/c', '', 0, 0.99, 0.01, 0.6)],
    out: (P, S) => { const g = gam(P.b); return [['로런츠 인자 γ', g, ''], ['정지 시계 똑딱 수', S.n0, '회'], ['움직이는 시계 똑딱 수', S.n1, '회'], ['지구 시간 10년 동안 움직이는 시계', 10 / g, '년'], ['뮤온 (수명 2.2 μs)의 평균 비행 거리', g * P.b * K.c * 2.2e-6, 'm']]; },
    sub: (P) => `\\Delta t = \\frac{1\\ \\mathrm{s}}{\\sqrt{1 - (${ft(P.b)})^2}} = ${ft(gam(P.b))}\\ \\mathrm{s}`,
    init(S) { S.n0 = 0; S.n1 = 0; S.ph0 = 0; S.ph1 = 0; S.x = 330; S.trail = []; },
    change(S) { S.trail = []; },
    step(S, P, dt) {
      const c = 150, Hh = 200, g = gam(P.b);
      S.ph0 += (c * dt) / Hh; while (S.ph0 >= 2) { S.ph0 -= 2; S.n0++; }
      S.ph1 += (c * dt) / (Hh * g); while (S.ph1 >= 2) { S.ph1 -= 2; S.n1++; }
      S.x += P.b * c * dt;
      if (S.x > 860) { S.x = 330; S.trail = []; }
      S.trail.push([S.x, 340 - (S.ph1 < 1 ? S.ph1 : 2 - S.ph1) * Hh]);
      if (S.trail.length > 900) S.trail.shift();
    },
    draw(d, S, P) {
      d.clear();
      const clock = (x, ph, n, lbl, col) => {
        d.rect(x - 40, 132, 80, 8, '#cfd8ee'); d.rect(x - 40, 340, 80, 8, '#cfd8ee');
        const y = 340 - (ph < 1 ? ph : 2 - ph) * 200;
        d.glow(x, y, 16, 'rgba(255,230,120,0.9)'); d.circle(x, y, 5, '#fff');
        d.text(lbl, x, 112, col, 13, 'center', 'middle', true);
        d.text('똑딱 ' + n, x, 372, col, 14, 'center', 'middle', true);
      };
      clock(140, S.ph0, S.n0, '정지한 시계', C.text);
      d.line(250, 60, 250, 390, 'rgba(255,255,255,0.1)', 1);
      d.poly(S.trail, 'rgba(255,230,120,0.5)', 1.5);
      clock(S.x, S.ph1, S.n1, '움직이는 시계 →', C.cyan);
      d.text('빛은 비스듬한 긴 경로를 같은 속력 c로 이동 → 한 번 똑딱이는 데 γ배 오래 걸림', 270, 40, C.yellow, 12);
      const p = d.plot({ x: 70, y: 420, w: 790, h: 110, xmin: 0, xmax: 1, ymin: 1, ymax: 8, title: '로런츠 인자 γ(β)', xl: 'β = v/c', ny: 2 });
      p.fn((b) => gam(min(b, 0.9925)), C.cyan, 2.5, 300, null, 0, 0.9925);
      p.dot(P.b, gam(P.b), C.cyan);
    },
  });

  add({
    id: 'lengthcontraction', cat: '특수 상대성이론', name: '길이 수축', en: 'Length Contraction',
    tex: ['L = \\frac{L_0}{\\gamma} = L_0\\sqrt{1 - \\frac{v^2}{c^2}}'],
    short: 'L = L_0/\\gamma',
    desc: '움직이는 물체의 길이는 운동 방향으로 γ배 짧게 측정된다. 물체가 실제로 찌그러지는 것이 아니라, 앞쪽 끝과 뒤쪽 끝의 위치를 "동시에" 재는 기준이 관찰자마다 다르기 때문이다. 운동 방향에 수직인 길이는 변하지 않는다. 뮤온의 입장에서는 대기층의 두께가 짧아져 수명 안에 지표까지 올 수 있다.',
    params: [R('b', '속력 β = v/c', '', 0, 0.99, 0.01, 0.8), R('L0', '고유 길이 L₀', 'm', 10, 100, 1, 60)],
    out: (P) => { const g = gam(P.b); return [['로런츠 인자 γ', g, ''], ['측정 길이 L = L₀/γ', P.L0 / g, 'm'], ['줄어든 비율', (1 - 1 / g) * 100, '%'], ['수직 방향 길이', '변하지 않음', '']]; },
    sub: (P) => `L = ${ft(P.L0)}\\sqrt{1 - (${ft(P.b)})^2} = ${ft(P.L0 / gam(P.b))}\\ \\mathrm{m}`,
    init(S) { S.x = -200; },
    step(S, P, dt) { S.x += (40 + 260 * P.b) * dt; if (S.x > 1150) S.x = -250; },
    draw(d, S, P) {
      d.clear();
      const ppm = 6, g = gam(P.b);
      const ruler = (y) => { d.line(30, y, 870, y, 'rgba(255,255,255,0.3)', 1); for (let m = 0; m <= 140; m += 10) { const x = 30 + m * ppm; d.line(x, y - (m % 50 ? 4 : 8), x, y + (m % 50 ? 4 : 8), 'rgba(255,255,255,0.4)', 1); if (m % 50 === 0) d.text(m + ' m', x, y + 18, C.dim, 10, 'center'); } };
      d.text('정지해 있는 우주선 (고유 길이 L₀ = ' + P.L0 + ' m)', 30, 70, C.text, 13);
      ruler(185);
      ship(d, 30 + (P.L0 * ppm) / 2 + 14, 140, P.L0 * ppm, C.orange, 1);
      d.text('속력 ' + P.b + 'c로 움직이는 같은 우주선 (L = ' + fmt(P.L0 / g, 3) + ' m)', 30, 270, C.cyan, 13);
      ruler(385);
      ship(d, S.x, 340, P.L0 * ppm, C.cyan, 1 / g);
      d.arrow(S.x + (P.L0 * ppm) / (2 * g) + 14, 340, S.x + (P.L0 * ppm) / (2 * g) + 54, 340, C.green, 2.5);
      const p = d.plot({ x: 70, y: 440, w: 790, h: 90, xmin: 0, xmax: 1, ymin: 0, ymax: 1.05, title: 'L/L₀ = √(1 − β²)', xl: 'β', ny: 2 });
      p.fn((b) => sqrt(1 - b * b), C.cyan, 2.5);
      p.dot(P.b, 1 / g, C.cyan);
    },
  });

  add({
    id: 'simultaneity', cat: '특수 상대성이론', name: '동시성의 상대성', en: 'Relativity of Simultaneity',
    tex: ["\\Delta t' = \\gamma\\left(\\Delta t - \\frac{v\\,\\Delta x}{c^2}\\right)", "\\Delta t = 0,\\ \\Delta x \\neq 0 \\;\\Longrightarrow\\; \\Delta t' \\neq 0"],
    short: "\\Delta t' = \\gamma(\\Delta t - v\\Delta x/c^2)",
    desc: '아인슈타인의 기차 사고 실험이다. 기차 한가운데에서 빛을 터뜨리면, 기차 안의 관찰자(위)에게는 빛이 앞뒤 벽에 동시에 도착한다. 그러나 플랫폼의 관찰자(아래)에게는 빛의 속력이 똑같이 c이면서 기차 뒤쪽 벽은 빛을 향해 다가오고 앞쪽 벽은 멀어지므로, 뒤쪽에 먼저 도착한다. 한 관찰자에게 동시인 두 사건이 다른 관찰자에게는 동시가 아니다.',
    params: [R('b', '기차의 속력 β = v/c', '', 0, 0.9, 0.01, 0.5)],
    times(P) { const g = gam(P.b); return { t0: 0.5, tb: 0.5 / (g * (1 + P.b)), tf: 0.5 / (g * (1 - P.b)) }; },
    out(P) { const t = this.times(P); return [['기차 안: 뒤·앞 도착 (L₀/c 단위)', fmt(t.t0, 3) + ' , ' + fmt(t.t0, 3), ''], ['플랫폼: 뒤쪽 도착', t.tb, 'L₀/c'], ['플랫폼: 앞쪽 도착', t.tf, 'L₀/c'], ['플랫폼에서 본 시간 차 γβL₀/c', t.tf - t.tb, 'L₀/c']]; },
    init(S) { S.t = 0; },
    step(S, P, dt) { const t = this.times(P), T = (max(t.tf, 0.5) * 400) / 160 + 1.5; S.t = (S.t + dt) % T; },
    draw(d, S, P) {
      d.clear();
      const c = 160, L0 = 400, g = gam(P.b), t = S.t, v = P.b * c;
      const panel = (y0, title, trainX, L, platV, emitX) => {
        d.text(title, 20, y0, C.text, 13, 'left', 'middle', true);
        const gy = y0 + 150;
        d.line(0, gy, 900, gy, '#7f8db0', 2);
        for (let k = -2; k < 14; k++) { const x = ((k * 90 - platV * t) % 1170 + 1170) % 1170 - 135; d.line(x, gy, x, gy + 12, '#7f8db0', 2); }
        d.rect(trainX - L / 2, gy - 70, L, 60, 'rgba(255,159,67,0.25)', C.orange, 2, 6);
        d.circle(trainX - L / 2 + 30, gy - 6, 7, '#333'); d.circle(trainX + L / 2 - 30, gy - 6, 7, '#333');
        const xl = emitX - c * t, xr = emitX + c * t, back = trainX - L / 2, front = trainX + L / 2, yl = gy - 40;
        const bHit = xl <= back, fHit = xr >= front;
        if (!bHit) d.glow(xl, yl, 12, 'rgba(255,230,120,0.95)');
        if (!fHit) d.glow(xr, yl, 12, 'rgba(255,230,120,0.95)');
        if (bHit) { d.rect(back - 4, gy - 70, 8, 60, C.yellow); }
        if (fHit) { d.rect(front - 4, gy - 70, 8, 60, C.yellow); }
        d.circle(emitX, gy - 100, 5, C.yellow);
        return { bHit, fHit, gy };
      };
      const tm = this.times(P);
      const a = panel(40, '① 기차에 탄 관찰자의 관점 (기차 정지, 플랫폼이 왼쪽으로 이동)', 450, L0, v, 450);
      d.text(a.bHit && a.fHit ? '뒤·앞 동시에 도착!' : '', 450, a.gy + 30, C.yellow, 13, 'center', 'middle', true);
      const xc = 450 + v * t, b = panel(300, '② 플랫폼 관찰자의 관점 (기차가 오른쪽으로 ' + P.b + 'c로 이동)', xc, L0 / g, 0, 450);
      const msg = b.bHit && !b.fHit ? '뒤쪽 먼저 도착!' : b.bHit && b.fHit ? '뒤쪽이 먼저, 앞쪽은 나중에 도착' : '';
      d.text(msg, 450, b.gy + 30, C.yellow, 13, 'center', 'middle', true);
      d.text('t = ' + fmt((t * 160) / 400, 3) + ' L₀/c   (뒤 ' + fmt(tm.tb, 3) + ', 앞 ' + fmt(tm.tf, 3) + ')', 880, 300, C.dim, 12, 'right');
    },
  });

  add({
    id: 'veladd', cat: '특수 상대성이론', name: '상대론적 속도 덧셈', en: 'Relativistic Velocity Addition',
    tex: ["u = \\frac{u' + v}{1 + \\dfrac{u'v}{c^2}}"],
    short: "u = \\frac{u'+v}{1+u'v/c^2}",
    desc: '속도 v로 날아가는 우주선에서 앞으로 u′의 속도로 탄환을 쏘면, 지구에서 본 탄환의 속도는 단순히 u′ + v가 아니다. 상대론적 덧셈 공식에 따르면 두 속도가 아무리 커도 결과는 결코 빛의 속력을 넘지 않는다. 빛(u′ = c)을 쏘면 누구에게나 정확히 c이다. 흐린 탄환은 갈릴레이(고전) 덧셈의 예측으로, 빛보다 빠를 수 있지만 실제로는 틀린 예측이다.',
    params: [R('v', '우주선의 속도 v/c', '', -0.99, 0.99, 0.01, 0.6), R('up', "우주선에서 본 탄환 속도 u′/c", '', -0.99, 0.99, 0.01, 0.7)],
    u: (P) => (P.up + P.v) / (1 + P.up * P.v),
    out(P) { const u = this.u(P); return [['상대론적 결과 u/c', u, ''], ["고전적 예측 (u′ + v)/c", P.up + P.v, ''], ['고전 예측과의 차이', P.up + P.v - u, 'c'], ['결과가 c보다 빠른가?', abs(u) < 1 ? '아니오 (항상 |u| < c)' : '—', '']]; },
    sub(P) { return `u = \\frac{${ft(P.up)} + ${ft(P.v)}}{1 + (${ft(P.up)})(${ft(P.v)})}\\,c = ${ft(this.u(P))}\\,c`; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t = (S.t + dt) % 4; },
    draw(d, S, P) {
      d.clear();
      const c = 200, x0 = P.v >= 0 ? 90 : 810, t = S.t, tf = 0.6, sx = x0 + P.v * c * t, y = 150, u = this.u(P);
      d.line(0, y + 40, 900, y + 40, '#3b4870', 2);
      for (let x = 0; x <= 900; x += 60) d.line(x, y + 40, x, y + 48, '#3b4870', 1.5);
      if (t > tf) {
        const xf = x0 + P.v * c * tf, dtt = t - tf, dir = Math.sign(P.up || 1);
        d.glow(xf + dir * c * dtt, y - 50, 10, 'rgba(255,240,150,0.95)');
        d.text('빛 (c)', xf + dir * c * dtt, y - 70, C.yellow, 11, 'center');
        const gx = xf + (P.up + P.v) * c * dtt;
        d.circle(gx, y - 18, 7, 'rgba(167,139,250,0.4)', 'rgba(167,139,250,0.9)', 1.5);
        d.text('고전 예측', gx, y - 34, C.purple, 11, 'center');
        d.ball(xf + u * c * dtt, y + 14, 7, C.red);
        d.text('실제 (상대론)', xf + u * c * dtt, y + 30, C.red, 11, 'center');
      }
      ship(d, sx, y, 110, C.cyan, P.v >= 0 ? 1 : -1);
      d.text('지구에서 본 모습', 20, 30, C.text, 13);
      const p = d.plot({ x: 70, y: 280, w: 790, h: 240, xmin: -1, xmax: 1, ymin: -1.6, ymax: 1.6, title: "u′에 따른 결과 속도 u (v = " + P.v + "c 고정)", xl: "u′/c", yl: 'u/c' });
      p.hl(1, C.yellow, [6, 4]); p.hl(-1, C.yellow, [6, 4]);
      p.fn((x) => x + P.v, 'rgba(167,139,250,0.8)', 2, 2, [6, 4]);
      p.fn((x) => (x + P.v) / (1 + x * P.v), C.red, 2.5, 300);
      p.dot(P.up, this.u(P), C.red); p.dot(P.up, P.up + P.v, C.purple, 4);
      p.label('빛의 속력 c', -0.98, 1.08, C.yellow, 11);
    },
  });

  /* ================================================================ 상대론적 에너지 */
  const EREF = [['번개 1회', 1e9], ['TNT 1톤', 4.184e9], ['가정 1년 전기 사용 (3,600 kWh)', 1.3e10], ['히로시마 원자폭탄', 6.3e13], ['원자력 발전소 1기의 1년 발전량', 3.2e16], ['인류 1년 에너지 소비', 6e20], ['태양이 1초 동안 내는 에너지', 3.8e26]];
  add({
    id: 'emc2', cat: '상대론적 에너지', name: '질량-에너지 등가 (E = mc²)', en: 'Mass–Energy Equivalence',
    tex: ['E = mc^2', '\\Delta E = \\Delta m\\,c^2\\quad(\\text{핵분열, 핵융합의 질량 결손})'],
    short: 'E = mc^2',
    desc: '질량은 에너지의 한 형태이며, 정지한 물체도 mc²의 에너지를 가진다. 빛의 속력의 제곱(9×10¹⁶ m²/s²)은 매우 크므로 아주 작은 질량도 막대한 에너지에 해당한다. 핵분열에서는 질량의 약 0.1%, 수소 핵융합에서는 약 0.7%가 에너지로 바뀌고, 입자와 반입자가 쌍소멸하면 질량 전체가 빛으로 바뀐다. 오른쪽 막대는 로그 눈금이다.',
    params: [R('m', '질량 m', 'g', 1e-6, 1e6, 1, 1, { log: 1 })],
    out: (P) => { const E = (P.m / 1000) * K.c * K.c; return [['에너지 E = mc²', E, 'J'], ['전력량', E / 3.6e6, 'kWh'], ['TNT 환산', E / 4.184e9, '톤'], ['히로시마 원자폭탄 환산', E / 6.3e13, '개'], ['핵분열로 실제 얻는 에너지 (0.1%)', E * 0.001, 'J']]; },
    sub: (P) => `E = (${ft(P.m / 1000)}\\ \\mathrm{kg})(3.00\\times10^8\\ \\mathrm{m/s})^2 = ${ft((P.m / 1000) * K.c * K.c)}\\ \\mathrm{J}`,
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const E = (P.m / 1000) * K.c * K.c, sz = 14 + 9 * (Math.log10(P.m) + 6) / 2;
      d.glow(150, 200, sz * 3 + 20 * sin(S.t * 3) ** 2, 'rgba(255,200,90,0.35)');
      d.rect(150 - sz / 2, 200 - sz / 2, sz, sz, C.orange, '#fff', 1.5, 4);
      d.text(fmt(P.m) + ' g', 150, 200 + sz / 2 + 20, C.text, 14, 'center', 'middle', true);
      d.text('× c²', 150, 320, C.yellow, 22, 'center', 'middle', true);
      d.arrow(150, 340, 150, 390, C.yellow, 3);
      d.text(fmt(E) + ' J', 150, 420, C.yellow, 18, 'center', 'middle', true);
      const p = d.plot({ x: 330, y: 50, w: 540, h: 460, xmin: 1e6, xmax: 1e30, ymin: 0, ymax: EREF.length + 0.6, xlog: true, yticks: false, grid: true, title: '에너지 비교 (로그 눈금, J)' });
      EREF.forEach(([n, e], i) => {
        const y = p.Y(EREF.length - i), X1 = p.X(e);
        d.rect(p.x, y - 13, X1 - p.x, 26, 'rgba(56,189,248,0.3)');
        d.text(n, p.x + 8, y, C.text, 12);
      });
      const X = p.X(M.clamp(E, 1e6, 1e30));
      d.line(X, p.y, X, p.y + p.h, C.yellow, 3);
      d.label('mc² = ' + fmt(E) + ' J', min(X, 760), p.y + p.h - 18, C.yellow, 12);
    },
  });

  const PARTS = [[0.511, '전자 (0.511 MeV/c²)'], [105.66, '뮤온 (105.7 MeV/c²)'], [139.57, '파이온 π± (139.6 MeV/c²)'], [938.27, '양성자 (938.3 MeV/c²)']];
  add({
    id: 'energymomentum', cat: '상대론적 에너지', name: '상대론적 에너지-운동량 관계', en: 'Relativistic Energy–Momentum Relation',
    tex: ['E^2 = (pc)^2 + (mc^2)^2', 'E = \\gamma mc^2,\\qquad p = \\gamma mv,\\qquad K = (\\gamma - 1)mc^2'],
    short: 'E^2 = (pc)^2 + (mc^2)^2',
    desc: '상대론에서 입자의 총에너지 E, 운동량 p, 질량 m은 피타고라스 정리와 같은 관계를 만족한다(왼쪽 아래 직각삼각형). 속도가 빛에 가까워지면 γ가 무한히 커지므로 질량이 있는 입자를 빛의 속력까지 가속하려면 무한한 에너지가 필요하다. 느린 속도에서는 운동 에너지가 고전적인 ½mv²과 같지만, 빨라질수록 크게 벌어진다. 질량이 0인 광자는 E = pc이다(점선).',
    params: [Sel('m', '입자', PARTS, 0.511), R('b', '속력 β = v/c', '', 0, 0.999, 0.001, 0.8)],
    out: (P) => { const g = gam(P.b), m = P.m; return [['로런츠 인자 γ', g, ''], ['총에너지 E = γmc²', g * m, 'MeV'], ['운동량 pc = γmβc²', g * m * P.b, 'MeV'], ['운동 에너지 (γ−1)mc²', (g - 1) * m, 'MeV'], ['고전 운동 에너지 ½mv²', 0.5 * m * P.b * P.b, 'MeV'], ['E² − (pc)² = (mc²)²', (g * m) ** 2 - (g * m * P.b) ** 2, 'MeV²']]; },
    sub: (P) => { const g = gam(P.b); return `E = \\sqrt{(${ft(g * P.m * P.b)})^2 + (${ft(P.m)})^2} = ${ft(g * P.m)}\\ \\mathrm{MeV}`; },
    draw(d, S, P) {
      d.clear();
      const m = P.m, g = gam(P.b), E = g * m, pc = E * P.b, mx = max(4 * m, E * 1.15);
      const p = d.plot({ x: 70, y: 50, w: 360, h: 300, xmin: 0, xmax: mx, ymin: 0, ymax: mx, title: '에너지-운동량 도표', xl: 'pc (MeV)', yl: 'E (MeV)', nx: 4 });
      p.fn((q) => q, C.yellow, 1.5, 2, [5, 4]);
      p.fn((q) => sqrt(q * q + m * m), C.cyan, 2.5);
      p.dot(pc, E, C.cyan, 6);
      p.label('광자 E = pc', mx * 0.6, mx * 0.52, C.yellow, 11);
      const tx = 90, ty = 520, k = 150 / max(E, 1e-9);
      d.poly([[tx, ty], [tx + pc * k, ty], [tx + pc * k, ty - m * k]], null, 0, true, 'rgba(56,189,248,0.12)');
      d.line(tx, ty, tx + pc * k, ty, C.green, 3); d.line(tx + pc * k, ty, tx + pc * k, ty - m * k, C.orange, 3); d.line(tx, ty, tx + pc * k, ty - m * k, C.cyan, 3);
      d.text('pc', tx + (pc * k) / 2, ty + 14, C.green, 12, 'center'); d.text('mc²', tx + pc * k + 8, ty - (m * k) / 2, C.orange, 12);
      d.text('E', tx + (pc * k) / 2 - 10, ty - (m * k) / 2 - 12, C.cyan, 13, 'center', 'middle', true);
      d.text('E² = (pc)² + (mc²)²', 260, 400, C.text, 13);
      const q = d.plot({ x: 500, y: 50, w: 370, h: 460, xmin: 0, xmax: 1, ymin: 0, ymax: 6, title: '운동 에너지 / mc²', xl: 'β = v/c', yl: 'K/mc²' });
      q.fn((b) => gam(min(b, 0.9995)) - 1, C.red, 2.5, 400, null, 0, 0.9995);
      q.fn((b) => 0.5 * b * b, C.purple, 2, 200, [6, 4]);
      q.vl(1, C.yellow);
      q.dot(P.b, g - 1, C.red); q.dot(P.b, 0.5 * P.b * P.b, C.purple, 4);
      q.label('상대론 (γ−1)', 0.05, 5.4, C.red, 12); q.label('고전 ½β²', 0.05, 4.9, C.purple, 12);
    },
  });

  const BALMER = [[656.3, 'Hα'], [486.1, 'Hβ'], [434.0, 'Hγ'], [410.2, 'Hδ']];
  add({
    id: 'reldoppler', cat: '상대론적 에너지', name: '상대론적 도플러 효과 (적색·청색 편이)', en: 'Relativistic Doppler Effect — Redshift',
    tex: ['\\lambda_{\\text{관측}} = \\lambda_0\\sqrt{\\frac{1+\\beta}{1-\\beta}}\\quad(\\beta > 0:\\ \\text{멀어짐})', 'z = \\frac{\\lambda_{\\text{관측}} - \\lambda_0}{\\lambda_0}'],
    short: '\\lambda = \\lambda_0\\sqrt{\\frac{1+\\beta}{1-\\beta}}',
    desc: '광원이 멀어지면 빛의 파장이 길어지고(적색 편이), 다가오면 짧아진다(청색 편이). 빛에는 매질이 없으므로 음파와 달리 광원과 관찰자의 상대 속도만이 중요하며, 시간 지연 효과도 포함된다. 천문학자는 별빛 스펙트럼의 흡수선(수소의 발머 선) 위치를 비교해 은하가 얼마나 빨리 멀어지는지 측정하며, 이것이 우주 팽창의 증거가 되었다.',
    params: [R('b', '시선 속도 β (+ = 멀어짐)', '', -0.6, 0.6, 0.005, 0.1)],
    out: (P) => { const k = sqrt((1 + P.b) / (1 - P.b)); return [['파장 배율 λ/λ₀', k, ''], ['적색 편이 z', k - 1, ''], ['Hα (656.3 nm) 관측 파장', 656.3 * k, 'nm'], ['Hα 관측 영역', PL.wlName(656.3 * k), ''], ['속도', P.b * K.c / 1000, 'km/s'], ['허블 법칙으로 추정한 거리', P.b > 0 ? (P.b * K.c / 1000) / 70 : '—', 'Mpc']]; },
    sub: (P) => `\\lambda_{H\\alpha} = 656.3\\sqrt{\\frac{1 + ${ft(P.b)}}{1 - ${ft(P.b)}}} = ${ft(656.3 * sqrt((1 + P.b) / (1 - P.b)))}\\ \\mathrm{nm}`,
    init(S) { S.w = []; S.acc = 0; S.x = 450; },
    step(S, P, dt) {
      S.t += dt; S.acc += dt;
      const c = 160;
      S.x = 450 - P.b * 160 * ((S.t % 6) - 3);
      while (S.acc > 0.18) { S.acc -= 0.18; S.w.push([S.x, S.t]); }
      S.w = S.w.filter((w) => (S.t - w[1]) * c < 900);
    },
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const c = 160, y = 170, k = sqrt((1 + P.b) / (1 - P.b));
      S.w.forEach((w) => { const r = (S.t - w[1]) * c; d.circle(w[0], y, r, null, `rgba(255,230,160,${M.clamp(0.7 - r / 900, 0.05, 0.7)})`, 1.3); });
      d.glow(S.x, y, 40, 'rgba(255,240,200,0.6)'); d.circle(S.x, y, 10, '#fff6d8');
      d.text('관찰자 →', 760, y - 60, C.text, 12); d.circle(860, y, 10, '#2f3b62', '#cfd8ee', 2);
      const obs = PL.wl2rgb(550 * k);
      d.rect(800, 210, 100, 30, PL.rgb(obs), null, 0, 6);
      d.text('보이는 색 (550 nm 빛)', 850, 256, C.dim, 10, 'center');
      const spec = (y0, kk, lbl) => {
        for (let wl = 380; wl < 780; wl += 2) d.rect(70 + ((wl - 380) / 400) * 790, y0, 4.3, 46, PL.wlCss(wl));
        BALMER.forEach(([l, n]) => { const L = l * kk; if (L >= 380 && L <= 780) { const X = 70 + ((L - 380) / 400) * 790; d.rect(X - 2, y0, 4, 46, '#000'); d.text(n, X, y0 - 10, C.text, 11, 'center'); } });
        d.text(lbl, 70, y0 + 64, C.dim, 12);
      };
      spec(310, 1, '실험실 (정지한 광원)의 수소 흡수선');
      spec(420, k, (P.b > 0 ? '적색 편이' : P.b < 0 ? '청색 편이' : '편이 없음') + ' — 관측된 스펙트럼 (z = ' + fmt(k - 1, 3) + ')');
      for (let wl = 400; wl <= 750; wl += 50) d.text(wl + '', 70 + ((wl - 380) / 400) * 790, 545, C.faint, 10, 'center');
    },
  });

  add({
    id: 'twins', cat: '특수 상대성이론', name: '쌍둥이 역설', en: 'The Twin Paradox',
    tex: ['\\tau = \\int \\sqrt{1 - \\frac{v(t)^2}{c^2}}\\,dt', '\\tau_{\\text{여행자}} = \\frac{2L}{v\\gamma} < \\tau_{\\text{지구}} = \\frac{2L}{v}'],
    short: '\\tau = \\int\\sqrt{1 - v^2/c^2}\\,dt',
    desc: '쌍둥이 중 한 명이 빠른 우주선을 타고 먼 별에 다녀오면 지구에 남은 쌍둥이보다 젊어진다. 각자의 나이는 자기 세계선을 따라 잰 고유 시간이다. "각자 상대가 움직인다"는 대칭은 여행자가 별에서 방향을 바꾸며(가속하며) 깨진다 — 되돌아오는 순간 여행자의 "지금" 선(점선)이 크게 뛰어 지구 시간을 건너뛴다. 세계선 위의 점은 각자의 1년이다.',
    params: [R('b', '우주선 속력 β', '', 0.1, 0.99, 0.01, 0.8, { reset: 1 }), R('L', '별까지 거리 L', '광년', 1, 20, 0.5, 4, { reset: 1 })],
    out: (P, S) => { const g = gam(P.b), T = (2 * P.L) / P.b; return [['지구 쌍둥이의 경과 시간 2L/v', T, '년'], ['여행자의 경과 시간 2L/(vγ)', T / g, '년'], ['나이 차이', T - T / g, '년'], ['현재 지구 시간', S.te, '년'], ['현재 여행자 나이 (출발 후)', S.tt, '년']]; },
    init(S) { S.u = 0; S.te = 0; S.tt = 0; },
    step(S, P, dt) {
      const T = (2 * P.L) / P.b, g = gam(P.b);
      S.u += dt / 7;
      if (S.u > 1.15) S.u = 0;
      S.te = min(1, S.u) * T; S.tt = S.te / g;
    },
    draw(d, S, P) {
      d.clear();
      const T = (2 * P.L) / P.b, g = gam(P.b), s = min(320 / P.L, 470 / T), ox = 90, oy = 520, X = (x) => ox + x * s, Y = (t) => oy - t * s;
      d.line(ox, oy, ox + P.L * s + 40, oy, '#cfd8ee', 1.5); d.line(ox, oy, ox, Y(T) - 20, '#cfd8ee', 1.5);
      d.text('x (광년)', ox + P.L * s + 40, oy + 16, C.dim, 11, 'right'); d.text('t (년)', ox - 8, Y(T) - 26, C.dim, 11, 'right');
      d.line(X(P.L), oy, X(P.L), Y(T), 'rgba(255,216,77,0.25)', 1, [4, 4]); d.text('별', X(P.L), oy + 16, C.yellow, 12, 'center');
      d.line(X(0), Y(0), X(0), Y(T), C.cyan, 3);
      d.line(X(0), Y(0), X(P.L), Y(T / 2), C.orange, 3); d.line(X(P.L), Y(T / 2), X(0), Y(T), C.orange, 3);
      for (let n = 1; n < T; n++) d.circle(X(0), Y(n), 3, C.cyan);
      const tp = T / g;
      for (let n = 1; n < tp; n++) { const tc = n * g, x = tc <= T / 2 ? P.b * tc : P.L - P.b * (tc - T / 2); d.circle(X(x), Y(tc), 3.4, C.orange); }
      const t1 = T / 2 - P.b * P.L, t2 = T / 2 + P.b * P.L;
      d.line(X(P.L), Y(T / 2), X(0), Y(t1), 'rgba(255,159,67,0.6)', 1.3, [5, 4]);
      d.line(X(P.L), Y(T / 2), X(0), Y(t2), 'rgba(255,159,67,0.6)', 1.3, [5, 4]);
      d.text('되돌아올 때 "지금"이 ' + fmt(t2 - t1, 3) + '년 건너뜀', X(0) + 8, Y((t1 + t2) / 2), C.orange, 11);
      const tc = S.te, xt = tc <= T / 2 ? P.b * tc : P.L - P.b * (tc - T / 2);
      d.circle(X(0), Y(tc), 7, C.cyan, '#fff', 1.5);
      d.circle(X(xt), Y(tc), 7, C.orange, '#fff', 1.5);
      const face = (x, age, lbl, col) => {
        d.circle(x, 150, 46, '#1b2440', col, 3);
        d.text(lbl, x, 80, col, 14, 'center', 'middle', true);
        d.text(fmt(age, 3), x, 150, C.text, 22, 'center', 'middle', true);
        d.text('년 경과', x, 178, C.dim, 11, 'center');
      };
      face(640, S.te, '지구의 쌍둥이', C.cyan);
      face(800, S.tt, '여행한 쌍둥이', C.orange);
      d.text('γ = ' + fmt(g, 4), 720, 250, C.text, 14, 'center');
      d.text('세계선 위의 점 = 각자의 1년', 560, 300, C.dim, 12);
    },
  });

  /* ================================================================ 일반 상대성이론 */
  add({
    id: 'equivalence', cat: '일반 상대성이론', name: '등가 원리', en: 'The Equivalence Principle',
    tex: ['m_{\\text{관성}} = m_{\\text{중력}}', '\\text{균일한 중력장 } \\vec g \\;\\equiv\\; \\text{가속도 } \\vec a = -\\vec g \\text{ 인 좌표계}'],
    short: 'm_{\\text{관성}} = m_{\\text{중력}}',
    desc: '창문 없는 상자 안에서는 지구 위에 정지해 있는지, 우주에서 g의 가속도로 가속하고 있는지 어떤 실험으로도 구별할 수 없다(아인슈타인의 "가장 행복한 생각"). 공은 두 경우 똑같이 바닥으로 떨어지고, 가속하는 로켓 안에서 수평으로 쏜 빛이 휘어 보이므로 중력장에서도 빛이 휘어야 한다. 반대로 자유 낙하하는 상자 안은 무중력 우주와 구별되지 않는다. (빛의 휨은 크게 과장해 표시)',
    params: [Sel('mode', '비교 상황', [['acc', '지구 위 정지 vs 우주에서 가속'], ['free', '자유 낙하 vs 무중력 우주']], 'acc', { reset: 1 }), R('a', '로켓의 가속도 a', 'm/s²', 0, 20, 0.1, 9.81, { reset: 1 })],
    out: (P) => [['지구 중력 가속도 g', 9.81, 'm/s²'], ['로켓 안 겉보기 중력', P.mode === 'acc' ? P.a : 0, 'm/s²'], ['구별 가능한가?', P.mode === 'acc' ? (abs(P.a - 9.81) < 0.05 ? '불가능 (a = g)' : 'a ≠ g 이면 떨어지는 빠르기가 다름') : '불가능 (둘 다 무중력)', ''], ['실제 빛의 휨 (3 m 상자)', (9.81 * (3 / K.c) ** 2) / 2, 'm']],
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t = (S.t + dt) % 2.2; },
    draw(d, S, P) {
      d.clear();
      const box = (x0, title, acc, rocket, freefall) => {
        const w = 360, h = 330, y0 = 100, ppm = 40, t = S.t;
        d.text(title, x0 + w / 2, 60, C.text, 13, 'center', 'middle', true);
        d.rect(x0, y0, w, h, 'rgba(255,255,255,0.03)', '#cfd8ee', 2.5, 6);
        if (rocket) { d.poly([[x0, y0], [x0 + w / 2, y0 - 34], [x0 + w, y0]], '#cfd8ee', 2); if (!freefall) { d.glow(x0 + w / 2, y0 + h + 30, 50, 'rgba(255,150,50,0.8)'); d.poly([[x0 + w / 2 - 30, y0 + h], [x0 + w / 2, y0 + h + 60 + 10 * Math.random()], [x0 + w / 2 + 30, y0 + h]], null, 0, true, 'rgba(255,200,80,0.9)'); } }
        else if (!freefall) { d.rect(x0 - 30, y0 + h, w + 60, 40, '#2a5d3a'); d.text('지구 표면', x0 + w / 2, y0 + h + 20, '#cfe8d3', 12, 'center'); }
        else { d.text('↓ 함께 자유 낙하 중', x0 + w / 2, y0 + h + 24, C.dim, 12, 'center'); }
        const fall = 0.5 * acc * t * t * ppm, by = min(y0 + 70 + fall, y0 + h - 12);
        d.ball(x0 + 80, by, 12, C.orange);
        d.circle(x0 + 80, y0 + 70, 3, 'rgba(255,255,255,0.4)');
        const cL = 700, pts = [];
        for (let x = 0; x <= min(w - 10, cL * t); x += 4) { const tt = x / cL, yy = 0.5 * acc * tt * tt * ppm; pts.push([x0 + 5 + x, y0 + 160 + yy]); }
        if (pts.length > 1) { d.poly(pts, C.yellow, 2.5); const last = pts[pts.length - 1]; d.glow(last[0], last[1], 10, 'rgba(255,240,150,1)'); }
        d.circle(x0 + 5, y0 + 160, 5, C.yellow);
      };
      if (P.mode === 'acc') { box(40, '지구 위에 정지한 상자 (g = 9.81)', 9.81, false, false); box(500, '우주에서 가속하는 로켓 (a = ' + P.a + ')', P.a, true, false); }
      else { box(40, '자유 낙하하는 엘리베이터', 0, false, true); box(500, '중력 없는 우주에 떠 있는 로켓', 0, true, true); }
      d.text('노란 선: 수평으로 쏜 빛 (휨은 크게 과장)', 450, 520, C.yellow, 12, 'center');
    },
  });

  add({
    id: 'gravtime', cat: '일반 상대성이론', name: '중력 시간 지연', en: 'Gravitational Time Dilation',
    tex: ['\\frac{d\\tau}{dt} = \\sqrt{1 - \\frac{2GM}{rc^2}} = \\sqrt{1 - \\frac{r_s}{r}}'],
    short: 'd\\tau/dt = \\sqrt{1 - r_s/r}',
    desc: '중력이 강한 곳(질량에 가까운 곳)에서는 시간이 느리게 흐른다. 지표의 시계는 높은 산 위의 시계보다 느리게 가며, 블랙홀의 사건의 지평선(r = r_s)에서는 먼 관찰자가 보기에 시간이 멈춘 것처럼 보인다. GPS 위성의 시계는 이 효과로 하루에 약 45 μs 빨라지고(속도에 의한 지연 −7 μs와 합쳐 +38 μs), 이를 보정하지 않으면 위치 오차가 하루 10 km씩 쌓인다. 왼쪽 시계가 거리 r, 오른쪽이 아주 먼 곳의 시계이다.',
    params: [R('r', '시계의 위치 r / r_s', '', 1.02, 30, 0.01, 2), R('M', '천체 질량', 'M☉', 1, 20, 0.5, 10)],
    out: (P) => { const k = sqrt(1 - 1 / P.r), rs = (2 * K.G * P.M * K.Msun) / (K.c * K.c); return [['시간 흐름 비 dτ/dt', k, ''], ['먼 곳의 1시간 동안 이 시계의 시간', 60 * k, '분'], ['슈바르츠실트 반지름 r_s', rs / 1000, 'km'], ['시계까지의 거리 r', (P.r * rs) / 1000, 'km'], ['GPS 위성 시계의 하루 차이 (참고)', 38, 'μs/일']]; },
    sub: (P) => `\\frac{d\\tau}{dt} = \\sqrt{1 - \\frac{1}{${ft(P.r)}}} = ${ft(sqrt(1 - 1 / P.r))}`,
    init(S) { S.a1 = 0; S.a2 = 0; },
    step(S, P, dt) { S.a1 += dt * 1.2 * sqrt(1 - 1 / P.r); S.a2 += dt * 1.2; },
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const cx = 140, cy = 300;
      d.glow(cx, cy, 110, 'rgba(140,100,255,0.25)'); d.circle(cx, cy, 40, '#000', 'rgba(255,200,120,0.6)', 2);
      d.text('r_s', cx, cy + 56, C.dim, 11, 'center');
      const rx = cx + 40 * min(P.r, 7.5);
      d.line(cx + 40, cy, 860, cy, 'rgba(255,255,255,0.15)', 1, [3, 4]);
      const clock = (x, y, a, lbl, col) => {
        d.circle(x, y, 44, '#0f1730', col, 3);
        for (let k = 0; k < 12; k++) { const q = (k * PI) / 6; d.line(x + 36 * sin(q), y - 36 * cos(q), x + 41 * sin(q), y - 41 * cos(q), col, 1.5); }
        d.line(x, y, x + 34 * sin(a), y - 34 * cos(a), col, 3); d.circle(x, y, 4, col);
        d.text(lbl, x, y + 64, col, 12, 'center');
      };
      clock(rx, 150, S.a1, 'r = ' + fmt(P.r, 3) + ' r_s', C.orange);
      d.line(rx, 196, rx, cy, 'rgba(255,159,67,0.4)', 1, [3, 3]);
      clock(780, 150, S.a2, '아주 먼 곳 (r → ∞)', C.cyan);
      const p = d.plot({ x: 300, y: 340, w: 570, h: 180, xmin: 1, xmax: 30, ymin: 0, ymax: 1.05, title: '시간 흐름 비 dτ/dt = √(1 − r_s/r)', xl: 'r / r_s', ny: 2 });
      p.fn((r) => sqrt(max(0, 1 - 1 / r)), C.orange, 2.5, 400);
      p.dot(P.r, sqrt(1 - 1 / P.r), C.orange);
      d.text('블랙홀 (' + P.M + ' M☉)', cx, cy - 60, C.text, 12, 'center');
    },
  });

  add({
    id: 'blackhole', cat: '일반 상대성이론', name: '블랙홀과 빛의 휘어짐', en: 'Black Holes & the Bending of Light',
    tex: ['r_s = \\frac{2GM}{c^2},\\qquad \\frac{d^2u}{d\\phi^2} + u = \\frac{3}{2}r_s u^2\\quad(u = 1/r)', 'b_c = \\frac{3\\sqrt3}{2}r_s,\\qquad \\delta\\phi \\approx \\frac{2r_s}{b}\\ (b \\gg r_s)'],
    short: 'r_s = \\frac{2GM}{c^2}',
    desc: '일반 상대성이론에서 빛은 휘어진 시공간의 "가장 곧은 길(측지선)"을 따라간다. 블랙홀 옆을 지나는 평행 광선들을 슈바르츠실트 시공간의 측지선 방정식으로 적분했다. 충돌 변수 b가 임계값 b_c ≈ 2.6 r_s보다 작은 빛은 광자구(점선, 1.5 r_s)를 넘어 블랙홀에 빨려 들어가고, 큰 빛은 휘어져 지나간다. 이 때문에 블랙홀은 r_s보다 2.6배 큰 검은 그림자로 보인다(사건의 지평선 망원경 사진). 노란 광선의 충돌 변수를 조절해 보자.',
    params: [R('b', '노란 광선의 충돌 변수 b', 'r_s', 0, 8, 0.01, 3), R('M', '블랙홀 질량', 'M☉', 1, 1e9, 1, 10, { log: 1 })],
    trace(b) {
      let y = [-16, b, 1, 0];
      const h2 = b * b, pts = [[y[0], y[1]]];
      const f = (t, s) => { const r2 = s[0] * s[0] + s[1] * s[1], r = sqrt(r2), a = (-1.5 * h2) / (r2 * r2 * r); return [s[2], s[3], a * s[0], a * s[1]]; };
      let fate = 'escape';
      for (let i = 0; i < 8000; i++) {
        const r = hypot(y[0], y[1]), hh = M.clamp(0.02 * r, 0.004, 0.25);
        y = M.rk4(f, y, 0, hh);
        if (i % 2 === 0) pts.push([y[0], y[1]]);
        const rn = hypot(y[0], y[1]);
        if (rn < 1.0) { fate = 'capture'; break; }
        if (rn > 20 && y[0] * y[2] + y[1] * y[3] > 0) break;
      }
      pts.push([y[0], y[1]]);
      return { pts, fate, ang: atan2(y[3], y[2]) };
    },
    out(P, S) {
      const rs = (2 * K.G * P.M * K.Msun) / (K.c * K.c), tr = PL.memo(S, 'hl', P.b, () => this.trace(P.b));
      return [['슈바르츠실트 반지름 r_s', rs / 1000, 'km'], ['광자구 반지름 1.5 r_s', (1.5 * rs) / 1000, 'km'], ['임계 충돌 변수 b_c', 2.598 * rs / 1000, 'km'], ['노란 광선의 운명', tr.fate === 'capture' ? '블랙홀에 흡수됨' : '휘어져 탈출', ''], ['노란 광선의 휜 각도 (수치)', tr.fate === 'capture' ? '—' : abs(M.deg(tr.ang)), '°'], ['약한 장 근사 2r_s/b', P.b > 0 ? M.deg(2 / P.b) : '—', '°']];
    },
    init(S) { S.ph = 0; },
    step(S, P, dt) { S.ph = (S.ph + dt * 0.12) % 1; },
    draw(d, S, P) {
      d.clear(false, '#03050b');
      const cx = 450, cy = 280, s = 27, X = (x) => cx + x * s, Y = (y) => cy - y * s;
      const fam = PL.memo(S, 'fam', 1, () => { const out = []; for (let b = -7.5; b <= 7.51; b += 0.5) out.push(this.trace(b)); return out; });
      fam.forEach((tr) => d.poly(tr.pts.map((p) => [X(p[0]), Y(p[1])]), tr.fate === 'capture' ? 'rgba(255,92,108,0.35)' : 'rgba(120,180,255,0.4)', 1.2));
      const hl = PL.memo(S, 'hl', P.b, () => this.trace(P.b));
      d.poly(hl.pts.map((p) => [X(p[0]), Y(p[1])]), C.yellow, 2.5);
      [...fam, hl].forEach((tr) => { const k = floor(S.ph * (tr.pts.length - 1)), p = tr.pts[k]; if (p) d.circle(X(p[0]), Y(p[1]), 2.4, '#fff'); });
      d.glow(cx, cy, 2.6 * s * 1.6, 'rgba(255,170,80,0.18)');
      d.circle(cx, cy, s, '#000', 'rgba(255,140,60,0.9)', 2);
      d.g.setLineDash([4, 4]); d.circle(cx, cy, 1.5 * s, null, 'rgba(255,255,255,0.55)', 1.2); d.circle(cx, cy, 2.598 * s, null, 'rgba(255,216,77,0.35)', 1); d.g.setLineDash([]);
      d.text('사건의 지평선 r_s', cx, cy + s + 14, '#ffb380', 11, 'center');
      d.text('광자구 1.5 r_s', cx + 1.5 * s + 4, cy - 1.5 * s, C.text, 11);
      d.line(X(-16), Y(2.598), X(-12), Y(2.598), C.yellow, 1, [3, 3]); d.line(X(-16), Y(-2.598), X(-12), Y(-2.598), C.yellow, 1, [3, 3]);
      d.text('±b_c', X(-16) + 4, Y(2.598) - 10, C.yellow, 11);
      d.text('빨강: 흡수되는 빛 · 파랑: 휘어져 지나가는 빛 (단위: r_s)', 20, 24, C.text, 12);
    },
  });

  add({
    id: 'lensing', cat: '일반 상대성이론', name: '중력 렌즈와 아인슈타인 고리', en: 'Gravitational Lensing & Einstein Rings',
    tex: ['\\theta_E = \\sqrt{\\frac{4GM}{c^2}\\frac{D_{LS}}{D_L D_S}}', '\\vec\\beta = \\vec\\theta - \\theta_E^2\\,\\frac{\\vec\\theta}{|\\vec\\theta|^2}\\quad(\\text{렌즈 방정식})'],
    short: '\\vec\\beta = \\vec\\theta - \\theta_E^2\\vec\\theta/|\\vec\\theta|^2',
    desc: '앞쪽 은하나 블랙홀의 질량이 뒤쪽 광원에서 오는 빛을 휘게 하면, 우리는 광원을 원래 위치(β)가 아닌 다른 곳(θ)에서 보게 된다. 광원이 렌즈 바로 뒤에 정렬되면 빛이 사방에서 휘어 와 고리 모양(아인슈타인 고리)으로 보이고, 조금 벗어나면 두 개의 상이나 호(arc)로 보인다. 왼쪽은 렌즈가 없을 때의 실제 광원, 오른쪽은 렌즈 방정식으로 광선을 추적해 그린 관측 모습이다. 광원을 끌어 움직여 보자.',
    hint: '왼쪽 패널의 은하(광원)를 드래그해 보세요.',
    params: [R('tE', '아인슈타인 반지름 θ_E', '', 0, 1.4, 0.01, 0.8), R('sx', '광원 위치 β_x', '', -1.8, 1.8, 0.01, 0.25), R('sy', '광원 위치 β_y', '', -1.8, 1.8, 0.01, 0.1), R('sz', '광원 크기', '', 0.05, 0.6, 0.01, 0.22)],
    out: (P) => { const b = hypot(P.sx, P.sy), t1 = (b + sqrt(b * b + 4 * P.tE * P.tE)) / 2, t2 = (b - sqrt(b * b + 4 * P.tE * P.tE)) / 2, u = b / max(P.tE, 1e-9), mu = (u * u + 2) / (u * sqrt(u * u + 4)); return [['광원 거리 |β|', b, ''], ['바깥 상의 위치 θ₊', t1, ''], ['안쪽 상의 위치 θ₋', t2, ''], ['총 밝기 증폭 μ', P.tE > 0 ? (b > 1e-6 ? mu : Infinity) : 1, '배']]; },
    pointer(type, x, y, S, P, api) {
      const toB = (px, py) => [((px - 230) / 200) * 2, (-(py - 300) / 200) * 2];
      if (type === 'down') { if (x > 30 && x < 430 && y > 100 && y < 500) { S.drag = true; const [a, b] = toB(x, y); api.set('sx', +M.clamp(a, -1.8, 1.8).toFixed(2)); api.set('sy', +M.clamp(b, -1.8, 1.8).toFixed(2)); return true; } return false; }
      if (type === 'move' && S.drag) { const [a, b] = toB(x, y); api.set('sx', +M.clamp(a, -1.8, 1.8).toFixed(2)); api.set('sy', +M.clamp(b, -1.8, 1.8).toFixed(2)); }
      if (type === 'up' || type === 'leave') S.drag = false;
      return false;
    },
    src(P, bx, by) {
      const dx = bx - P.sx, dy = by - P.sy, r2 = (dx * dx + dy * dy) / (P.sz * P.sz), r = sqrt(r2), th = atan2(dy, dx);
      return exp(-r2) * (0.65 + 0.35 * cos(2 * th - 3 * log(r + 0.05)));
    },
    init(S) { S.cv1 = document.createElement('canvas'); S.cv2 = document.createElement('canvas'); },
    draw(d, S, P) {
      d.clear(false, '#03050b');
      const n = 200, key = [P.tE, P.sx, P.sy, P.sz].join(), out = [0, 0, 0, 255];
      const col = (v) => { out[0] = 255 * min(1, v * 1.4); out[1] = 210 * min(1, v * 1.1); out[2] = 255 * min(1, v * 0.7 + 0.15 * v); return out; };
      PL.memo(S, 'img', key, () => {
        PL.raster(n, n, (i, j) => col(this.src(P, ((i + 0.5) / n - 0.5) * 4, -((j + 0.5) / n - 0.5) * 4)), S.cv1);
        PL.raster(n, n, (i, j) => { const tx = ((i + 0.5) / n - 0.5) * 4, ty = -((j + 0.5) / n - 0.5) * 4, r2 = tx * tx + ty * ty + 1e-9, k = (P.tE * P.tE) / r2; return col(this.src(P, tx - k * tx, ty - k * ty)); }, S.cv2);
        return 1;
      });
      d.img(S.cv1, 30, 100, 400, 400); d.img(S.cv2, 470, 100, 400, 400);
      d.rect(30, 100, 400, 400, null, 'rgba(160,180,225,0.3)', 1); d.rect(470, 100, 400, 400, null, 'rgba(160,180,225,0.3)', 1);
      d.text('렌즈가 없을 때 (실제 광원 위치)', 230, 80, C.text, 13, 'center', 'middle', true);
      d.text('렌즈 은하를 통해 본 모습', 670, 80, C.text, 13, 'center', 'middle', true);
      d.glow(670, 300, 26, 'rgba(255,230,180,0.6)'); d.circle(670, 300, 5, '#ffe8c0');
      d.circle(230, 300, 4, 'rgba(255,230,180,0.6)');
      d.g.setLineDash([4, 5]); d.circle(670, 300, (P.tE / 2) * 200, null, 'rgba(255,255,255,0.35)', 1); d.circle(230, 300, (P.tE / 2) * 200, null, 'rgba(255,255,255,0.2)', 1); d.g.setLineDash([]);
      d.text('점선: 아인슈타인 반지름', 670, 520, C.dim, 11, 'center');
      d.text('+ 렌즈 위치', 230, 520, C.dim, 11, 'center');
    },
  });

  add({
    id: 'precession', cat: '일반 상대성이론', name: '수성의 근일점 이동', en: 'Perihelion Precession of Mercury',
    tex: ['\\Delta\\phi = \\frac{6\\pi GM}{c^2 a(1 - e^2)}\\quad(\\text{공전 1회당})', 'V_{\\text{eff}}(r) = -\\frac{GM}{r} + \\frac{L^2}{2r^2} - \\frac{GML^2}{c^2r^3}'],
    short: '\\Delta\\phi = \\frac{6\\pi GM}{c^2a(1-e^2)}',
    desc: '뉴턴 역학에서 행성의 타원 궤도는 닫혀 있지만, 일반 상대성이론에서는 유효 퍼텐셜에 1/r³ 보정이 생겨 궤도가 조금씩 회전한다(근일점 세차). 수성의 근일점은 100년에 43″만큼 뉴턴 이론의 예측보다 더 돌아가는데, 아인슈타인은 1915년 이를 정확히 설명해 이론의 첫 성공을 거두었다. 실제 효과는 너무 작아 보정의 세기를 크게 과장할 수 있게 했다.',
    params: [R('e', '이심률 e', '', 0, 0.8, 0.01, 0.45, { reset: 1 }), R('k', '상대론 보정 세기 (과장 배율)', '', 0, 0.06, 0.001, 0.02, { reset: 1 })],
    out: (P, S) => [['예측 세차 2πk/(1−e²)² (1회당)', M.deg((2 * PI * P.k) / (1 - P.e * P.e) ** 2), '°'], ['측정된 세차 (1회당)', S.prec != null ? M.deg(S.prec) : '측정 중…', '°'], ['공전 횟수', S.norb, '회'], ['실제 수성: 1회당', 5.0e-7 * 57.3 * 3600, '″'], ['실제 수성: 100년당', 43, '″']],
    init(S, P) { const rp = 1 - P.e; S.y = [rp, 0, 0, sqrt((1 + P.e) / rp)]; S.tr = []; S.peri = []; S.prev = [rp, rp]; S.norb = 0; S.prec = null; },
    step(S, P, dt) {
      const f = (t, y) => { const r2 = y[0] * y[0] + y[1] * y[1], r = sqrt(r2), a = -(1 + P.k / r2) / (r2 * r); return [y[2], y[3], a * y[0], a * y[1]]; };
      const n = 40, h = (dt * 2.2) / n;
      for (let i = 0; i < n; i++) {
        S.y = M.rk4(f, S.y, 0, h);
        const r = hypot(S.y[0], S.y[1]);
        if (S.prev[1] < S.prev[0] && S.prev[1] < r) {
          const ang = atan2(S.prev2y, S.prev2x);
          if (S.peri.length) { let d0 = ang - S.peri[S.peri.length - 1]; d0 = M.wrapAngle(d0); S.prec = d0; S.norb++; }
          S.peri.push(ang);
          if (S.peri.length > 40) S.peri.shift();
        }
        S.prev = [S.prev[1], r]; S.prev2x = S.y[0]; S.prev2y = S.y[1];
      }
      S.tr.push([S.y[0], S.y[1]]);
      if (S.tr.length > 5000) S.tr.shift();
    },
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const cx = 450, cy = 285, a = 1, s = 255 / (a * (1 + P.e)) * 0.98, X = (x) => cx + x * s, Y = (y) => cy - y * s;
      d.poly(S.tr.map((p) => [X(p[0]), Y(p[1])]), 'rgba(56,189,248,0.55)', 1.2);
      S.peri.forEach((ang, i) => { const r = (1 - P.e) * s; d.line(cx, cy, cx + cos(ang) * r * 1.15, cy - sin(ang) * r * 1.15, `rgba(255,216,77,${0.15 + 0.6 * (i / S.peri.length)})`, 1); });
      d.glow(cx, cy, 40, 'rgba(255,200,80,0.6)'); d.ball(cx, cy, 12, '#ffcc4d');
      d.ball(X(S.y[0]), Y(S.y[1]), 6, '#c8b9a6');
      d.text('노란 선: 근일점 방향 (공전마다 회전)', 20, 24, C.yellow, 12);
      d.text('보정 세기 k = 0 이면 뉴턴 역학 — 궤도가 닫힘', 20, 46, C.dim, 12);
    },
  });

  add({
    id: 'gwaves', cat: '일반 상대성이론', name: '중력파', en: 'Gravitational Waves',
    tex: ['\\Box\\, \\bar h_{\\mu\\nu} = -\\frac{16\\pi G}{c^4}T_{\\mu\\nu},\\qquad f_{\\text{GW}} \\propto (t_c - t)^{-3/8}', '\\mathcal{M} = \\frac{(m_1m_2)^{3/5}}{(m_1+m_2)^{1/5}},\\qquad h \\sim \\frac{4}{r}\\left(\\frac{G\\mathcal M}{c^2}\\right)^{5/3}\\left(\\frac{\\pi f}{c}\\right)^{2/3}'],
    short: 'f_{\\text{GW}} \\propto (t_c - t)^{-3/8}',
    desc: '서로 도는 두 블랙홀은 시공간의 잔물결인 중력파를 내보내며 에너지를 잃어 점점 가까워지고, 회전이 빨라지다 합쳐진다. 그래서 파형은 진동수와 진폭이 함께 커지는 "처프(chirp)" 모양이 된다. 중력파가 지나가면 공간이 한 방향으로 늘어나고 수직 방향으로 줄어들기를 반복한다(오른쪽 고리, 크게 과장). 2015년 LIGO가 13억 광년 떨어진 블랙홀 쌍(36 + 29 M☉)의 중력파를 처음 검출했다 — 변형률은 10⁻²¹, 양성자 크기의 1/1000만큼의 길이 변화였다.',
    params: [R('m1', '블랙홀 질량 m₁', 'M☉', 5, 60, 1, 36), R('m2', '블랙홀 질량 m₂', 'M☉', 5, 60, 1, 29), R('D', '거리', 'Mpc', 100, 3000, 10, 410)],
    out: (P) => {
      const Mt = P.m1 + P.m2, Mc = Math.pow(P.m1 * P.m2, 0.6) / Math.pow(Mt, 0.2), fis = 4400 / Mt;
      const GMc = (K.G * Mc * K.Msun) / (K.c * K.c), h = (4 / (P.D * 3.086e22)) * Math.pow(GMc, 5 / 3) * Math.pow((PI * fis) / K.c, 2 / 3);
      return [['처프 질량 𝓜', Mc, 'M☉'], ['합쳐지기 직전 진동수 (ISCO)', fis, 'Hz'], ['지구에서의 최대 변형률 h', h, ''], ['방출 에너지 (총질량의 약 5%)', 0.05 * Mt * K.Msun * K.c * K.c, 'J'], ['4 km 팔의 길이 변화', h * 4000, 'm']];
    },
    init(S) { S.t = 0; S.ph = 0; S.cv = document.createElement('canvas'); },
    wave(t) {
      const tc = 7, tau = tc - t;
      if (tau > 0.18) { const f = 0.45 * Math.pow(tau / tc, -3 / 8); return { f, A: Math.pow(f / 0.45, 2 / 3), sep: Math.pow(0.45 / f, 2 / 3) }; }
      const f0 = 0.45 * Math.pow(0.18 / tc, -3 / 8), A0 = Math.pow(f0 / 0.45, 2 / 3);
      if (tau > 0) return { f: f0, A: A0, sep: Math.pow(0.45 / f0, 2 / 3) * (tau / 0.18) };
      return { f: f0 * 1.3, A: A0 * exp(tau * 3), sep: 0 };
    },
    step(S, P, dt) {
      S.t += dt;
      if (S.t > 9) { S.t = 0; S.ph = 0; }
      S.ph += 2 * PI * this.wave(S.t).f * dt * 0.5;
    },
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const w = this.wave(S.t), cx = 230, cy = 210, n = 110, cs = 3.6, out = [0, 0, 0, 255], omega = 2 * PI * w.f;
      PL.raster(n, n, (i, j) => {
        const x = (i - n / 2) * cs, y = (j - n / 2) * cs, r = hypot(x, y) + 1e-6, phi = atan2(y, x);
        const h = (w.A * cos(2 * (S.ph - (0.5 * omega * r) / 140) - 2 * phi)) / sqrt(1 + r / 30);
        const c = PL.cmap.div(M.clamp(h * 0.7, -1, 1)); out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; return out;
      }, S.cv);
      d.img(S.cv, cx - (n * cs) / 2, cy - (n * cs) / 2, n * cs, n * cs);
      const sep = 26 * w.sep, a = S.ph, m1 = P.m1, m2 = P.m2, r1 = (sep * m2) / (m1 + m2), r2 = (sep * m1) / (m1 + m2);
      if (w.sep > 0) { d.circle(cx + r1 * cos(a), cy + r1 * sin(a), 4 + m1 / 8, '#000', '#ffb070', 2); d.circle(cx - r2 * cos(a), cy - r2 * sin(a), 4 + m2 / 8, '#000', '#ffb070', 2); }
      else d.circle(cx, cy, 6 + (m1 + m2) / 10, '#000', '#ffb070', 2.5);
      d.text(S.t < 6.82 ? '나선형으로 접근 (inspiral)' : S.t < 7 ? '병합 (merger)' : '안정화 (ringdown)', cx, 20, C.text, 13, 'center', 'middle', true);
      const hc = w.A * cos(2 * S.ph) * 0.22, rx = 690, ry = 200;
      d.text('자유 입자 고리의 변형 (과장)', rx, 20, C.text, 13, 'center', 'middle', true);
      d.g.setLineDash([3, 4]); d.circle(rx, ry, 110, null, 'rgba(255,255,255,0.2)', 1); d.g.setLineDash([]);
      for (let k = 0; k < 24; k++) { const q = (2 * PI * k) / 24, x = 110 * cos(q), y = 110 * sin(q); d.circle(rx + x * (1 + hc / 2), ry + y * (1 - hc / 2), 5, C.cyan); }
      const p = d.plot({ x: 70, y: 420, w: 790, h: 110, xmin: 0, xmax: 9, ymin: -2.6, ymax: 2.6, title: '검출기 신호 h(t) — 처프 파형', xl: 't (s, 표시용)', yticks: false });
      const pts = PL.memo(S, 'wf', 1, () => {
        const out = [];
        let ph = 0;
        for (let t = 0; t <= 9; t += 0.004) { const ww = this.wave(t); ph += 2 * PI * ww.f * 0.004 * 0.5; out.push([t, ww.A * cos(2 * ph)]); }
        return out;
      });
      p.pts(pts, C.yellow, 1.3);
      p.vl(S.t, C.red, null, 2);
    },
  });

  add({
    id: 'efe', cat: '일반 상대성이론', name: '아인슈타인 장 방정식 (휘어진 시공간)', en: "Einstein's Field Equations — Curved Spacetime",
    tex: ['G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}', 'ds^2 = -\\left(1 - \\frac{r_s}{r}\\right)c^2dt^2 + \\frac{dr^2}{1 - r_s/r} + r^2d\\Omega^2'],
    short: 'G_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}',
    desc: '"물질은 시공간에 어떻게 휘어질지 알려 주고, 시공간은 물질에 어떻게 움직일지 알려 준다"(휠러). 장 방정식의 왼쪽은 시공간의 곡률, 오른쪽은 질량·에너지 분포이다. 구형 질량 바깥의 해가 슈바르츠실트 계량이며, 그 공간 부분의 휘어짐을 3차원에 끼워 넣어 그리면 깔때기 모양(플람의 포물면)이 된다. 질량에 가까울수록 같은 좌표 거리 사이의 실제 거리가 더 길다. 행성은 이 휘어진 공간의 측지선을 따라 돈다.',
    hint: '캔버스를 드래그해 시점을 바꿀 수 있습니다.',
    params: [R('M', '질량 → 슈바르츠실트 반지름 r_s', '', 0.2, 2, 0.05, 1), R('ro', '궤도 반지름 r', '', 3, 13, 0.1, 7)],
    out: (P) => [['슈바르츠실트 반지름 r_s', P.M, ''], ['궤도 반지름 r / r_s', P.ro / P.M, ''], ['반지름 방향 거리 늘어남 1/√(1−r_s/r)', 1 / sqrt(1 - P.M / P.ro), '배'], ['궤도 안정성', P.ro >= 3 * P.M ? '안정 (r ≥ 3 r_s)' : '불안정 — 가장 안쪽 안정 궤도(3 r_s) 안쪽', '']],
    init(S) { S.yaw = 0.5; S.pitch = 0.5; S.ph = 0; },
    pointer(type, x, y, S) { return PL.dragRotate(type, x, y, S); },
    step(S, P, dt) { S.ph += dt * 1.6 * sqrt(P.M) / Math.pow(P.ro / 3, 1.5); if (!S._drag) S.yaw += dt * 0.08; },
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const R0 = 14, cam = PL.cam(S.yaw, S.pitch, 26, 450, 250), rs = P.M, zf = (r) => 2 * sqrt(rs * max(0, r - rs)) - 2 * sqrt(rs * (R0 - rs));
      for (let k = 0; k <= 24; k++) {
        const r = rs * 1.001 + ((R0 - rs) * k * k) / 576, pts = [];
        for (let a = 0; a <= 64; a++) { const q = (2 * PI * a) / 64; const p = cam(r * cos(q), r * sin(q), zf(r) * 0.55); pts.push(p); }
        d.poly(pts, `rgba(120,160,255,${0.2 + 0.4 * (1 - k / 24)})`, 1);
      }
      for (let a = 0; a < 32; a++) {
        const q = (2 * PI * a) / 32, pts = [];
        for (let k = 0; k <= 40; k++) { const r = rs * 1.001 + ((R0 - rs) * k) / 40; pts.push(cam(r * cos(q), r * sin(q), zf(r) * 0.55)); }
        d.poly(pts, 'rgba(120,160,255,0.25)', 1);
      }
      const ro = P.ro, pp = cam(ro * cos(S.ph), ro * sin(S.ph), zf(ro) * 0.55);
      const orb = []; for (let a = 0; a <= 64; a++) { const q = (2 * PI * a) / 64; orb.push(cam(ro * cos(q), ro * sin(q), zf(ro) * 0.55)); }
      d.poly(orb, 'rgba(255,216,77,0.6)', 1.5, false, null, [4, 4]);
      d.ball(pp[0], pp[1], 7, C.cyan);
      const bot = cam(0, 0, zf(rs * 1.001) * 0.55);
      d.glow(bot[0], bot[1], 30, 'rgba(255,150,80,0.5)');
      d.text('플람의 포물면: 슈바르츠실트 공간의 휘어짐을 끼워 넣은 그림', 450, 535, C.dim, 12, 'center');
    },
  });

  add({
    id: 'friedmann', cat: '우주론', name: '프리드만 방정식과 허블 법칙 (팽창하는 우주)', en: 'Friedmann Equations & Hubble’s Law',
    tex: ['\\left(\\frac{\\dot a}{a}\\right)^2 = H_0^2\\left(\\frac{\\Omega_m}{a^3} + \\frac{\\Omega_k}{a^2} + \\Omega_\\Lambda\\right),\\qquad \\Omega_k = 1 - \\Omega_m - \\Omega_\\Lambda', 'v = H_0 d\\quad(\\text{허블-르메트르 법칙})'],
    short: 'v = H_0 d',
    desc: '일반 상대성이론을 균일한 우주 전체에 적용하면 우주의 크기(척도 인자 a)가 시간에 따라 변하는 프리드만 방정식이 나온다. 물질(Ω_m)은 팽창을 늦추고 암흑 에너지(Ω_Λ)는 가속시킨다. 현재 관측값(Ω_m ≈ 0.31, Ω_Λ ≈ 0.69)에서 우주의 나이는 약 138억 년이며 팽창은 가속되고 있다. 물질이 충분히 많으면 우주는 언젠가 다시 수축한다(빅 크런치). 멀리 있는 은하일수록 빨리 멀어지는 허블 법칙은 이 팽창의 결과이다.',
    params: [R('Om', '물질 밀도 Ω_m', '', 0, 3, 0.01, 0.31), R('OL', '암흑 에너지 Ω_Λ', '', -0.5, 2, 0.01, 0.69), R('H0', '허블 상수 H₀', 'km/s/Mpc', 50, 100, 0.1, 67.7)],
    solve(P) {
      const H = P.H0 * 1.0227e-3, f = (t, y) => [y[1], H * H * (-P.Om / (2 * y[0] * y[0]) + P.OL * y[0])];
      const back = [], fwd = [];
      let y = [1, H], t = 0, bounce = false;
      for (let i = 0; i < 20000; i++) { y = M.rk4(f, y, t, -0.005); t -= 0.005; back.push([t, y[0]]); if (y[0] < 0.004) break; if (y[1] < 0) { bounce = true; break; } if (t < -80) { bounce = true; break; } }
      const age = -t;
      y = [1, H]; t = 0;
      let crunch = false;
      for (let i = 0; i < 20000; i++) { y = M.rk4(f, y, t, 0.01); t += 0.01; fwd.push([t, y[0]]); if (y[0] < 0.004) { crunch = true; break; } if (t > 50 || y[0] > 12) break; }
      return { age, bounce, crunch, pts: back.reverse().concat([[0, 1]], fwd) };
    },
    out(P, S) {
      const sol = PL.memo(S, 'sol', [P.Om, P.OL, P.H0].join(), () => this.solve(P));
      return [['곡률 Ω_k = 1 − Ω_m − Ω_Λ', 1 - P.Om - P.OL, ''], ['우주의 나이', sol.bounce ? '빅뱅 없음 (과거에 되튐)' : sol.age * 10, '억 년'], ['감속 인자 q₀ = Ω_m/2 − Ω_Λ', P.Om / 2 - P.OL, ''], ['현재 팽창', P.Om / 2 - P.OL < 0 ? '가속 중' : '감속 중', ''], ['미래', sol.crunch ? '다시 수축 (빅 크런치)' : '영원히 팽창', ''], ['허블 시간 1/H₀', 9778 / P.H0, '억 년']];
    },
    init(S) { S.u = 0; },
    step(S, P, dt) { S.u = (S.u + dt / 10) % 1; },
    draw(d, S, P) {
      d.clear(false, '#04060e');
      const sol = PL.memo(S, 'sol', [P.Om, P.OL, P.H0].join(), () => this.solve(P)), age = sol.age;
      const ref = PL.memo(S, 'ref', 1, () => this.solve({ Om: 0.31, OL: 0.69, H0: P.H0 }));
      const t0 = sol.pts[0][0], t1 = sol.pts[sol.pts.length - 1][0];
      const p = d.plot({ x: 70, y: 50, w: 500, h: 440, xmin: 0, xmax: max(t1 - t0, 1), ymin: 0, ymax: 4, title: '척도 인자 a(t) (현재 = 1)', xl: '빅뱅 이후 시간 (10억 년)', yl: 'a' });
      p.pts(ref.pts.map((q) => [q[0] - ref.pts[0][0], q[1]]), 'rgba(160,175,210,0.3)', 1.5, [5, 4]);
      p.pts(sol.pts.map((q) => [q[0] - t0, q[1]]), C.purple, 3);
      p.vl(-t0, C.yellow); p.hl(1, 'rgba(255,216,77,0.3)');
      p.label('현재', -t0 + 0.3, 3.8, C.yellow, 11);
      const k = floor(S.u * (sol.pts.length - 1)), cur = sol.pts[k];
      p.dot(cur[0] - t0, cur[1], C.white, 5);
      const gx = 730, gy = 160, aa = M.clamp(cur[1], 0, 4);
      d.rect(600, 40, 270, 250, 'rgba(255,255,255,0.02)', 'rgba(160,180,225,0.25)', 1, 8);
      d.clip(600, 40, 270, 250);
      for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) { const x = gx + i * 26 * aa, y = gy + j * 26 * aa; if (x > 600 && x < 870 && y > 40 && y < 290) d.circle(x, y, 2.6, (i === 0 && j === 0) ? C.yellow : '#cfd8ff'); }
      d.unclip();
      d.text('은하들의 간격 ∝ a(t)', 735, 305, C.dim, 11, 'center');
      const q = d.plot({ x: 620, y: 360, w: 250, h: 130, xmin: 0, xmax: 500, ymin: 0, ymax: 50000, title: '허블 법칙 v = H₀d', xl: 'd (Mpc)', yl: 'km/s', nx: 2, ny: 2 });
      q.fn((dd) => P.H0 * dd, C.cyan, 2.5);
      [[60, 1], [150, 0.95], [260, 1.06], [340, 0.97], [430, 1.03]].forEach(([dd, f]) => q.dot(dd, P.H0 * dd * f, C.yellow, 3.5));
      d.text(sol.bounce ? '빅뱅이 없는 우주 (과거에 되튐)' : '우주의 나이 ≈ ' + fmt(age * 10, 3) + '억 년', 80, 520, C.text, 13);
    },
  });
})();
