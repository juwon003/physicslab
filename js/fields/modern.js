/* =====================================================================
 * 양자장론 · 입자물리 · 응집물리
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, log, hypot, floor, atan2 } = Math;
  const add = (law) => PL.add('modern', law);
  const HBARC = 197.327; // MeV·fm
  const kB_eV = 8.617333e-5;

  function wavy(d, x1, y1, x2, y2, col = C.yellow, lw = 2, amp = 6, wl = 14) {
    const L = hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, pts = [];
    for (let s = 0; s <= L; s += 2) { const a = amp * sin((2 * PI * s) / wl); pts.push([x1 + ux * s - uy * a, y1 + uy * s + ux * a]); }
    d.poly(pts, col, lw);
  }
  function fermion(d, x1, y1, x2, y2, col, rev) {
    d.line(x1, y1, x2, y2, col, 2.5);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = hypot(x2 - x1, y2 - y1), ux = ((x2 - x1) / L) * (rev ? -1 : 1), uy = ((y2 - y1) / L) * (rev ? -1 : 1);
    d.arrow(mx - ux * 8, my - uy * 8, mx + ux * 8, my + uy * 8, col, 2.5, 11);
  }

  /* ================================================================ 양자장론 */
  add({
    id: 'kleingordon', cat: '양자장론', name: '클라인-고든 방정식 (상대론적 장)', en: 'Klein–Gordon Equation',
    tex: ['\\left(\\frac{1}{c^2}\\frac{\\partial^2}{\\partial t^2} - \\nabla^2 + \\frac{m^2c^2}{\\hbar^2}\\right)\\phi = 0', '\\omega^2 = c^2k^2 + \\frac{m^2c^4}{\\hbar^2},\\qquad v_g = \\frac{d\\omega}{dk} < c'],
    short: '(\\Box + m^2)\\phi = 0',
    desc: '양자장론에서 입자는 공간 전체에 퍼진 장(field)이 들뜬 상태, 곧 장의 양자이다. 클라인-고든 방정식은 스핀이 0인 입자(힉스 보손, 파이온 등)의 장이 따르는 상대론적 파동 방정식으로, E² = (pc)² + (mc²)²을 미분 방정식으로 바꾼 것이다. 질량이 0이면 파동 묶음이 모양을 유지한 채 빛의 속력으로 퍼지고, 질량이 있으면 분산되어 진동하는 꼬리를 남기며 더 느리게 퍼진다. 아래 시공간 그림에서 모든 신호가 광원뿔(점선) 안에 머무는 것이 인과율이다. (ħ = c = 1)',
    params: [R('m', '질량 m', '', 0, 3, 0.05, 1, { reset: 1 }), R('w', '처음 파동 묶음 폭', '', 0.3, 3, 0.05, 0.8, { reset: 1 })],
    out: (P, S) => [['정지 진동수 ω₀ = mc²/ħ', P.m, ''], ['콤프턴 파장 ħ/mc', P.m > 0 ? 1 / P.m : Infinity, ''], ['k = 1의 군속도 k/√(k²+m²)', 1 / sqrt(1 + P.m * P.m), 'c'], ['k = 1의 위상 속도', sqrt(1 + P.m * P.m), 'c'], ['시간', S.tt, '']],
    init(S, P) {
      const N = 600; S.N = N; S.dx = 0.1; S.phi = new Float64Array(N); S.prev = new Float64Array(N);
      for (let i = 0; i < N; i++) { const x = -30 + i * 0.1; S.phi[i] = exp(-(x * x) / (2 * P.w * P.w)); S.prev[i] = S.phi[i]; }
      S.tt = 0; S.rows = []; S.cv = document.createElement('canvas');
    },
    step(S, P, dt) {
      const N = S.N, h = 0.05, r2 = (h / S.dx) ** 2, n = M.clamp(Math.round(dt * 240), 1, 12);
      for (let s = 0; s < n; s++) {
        const nx = new Float64Array(N);
        for (let i = 1; i < N - 1; i++) nx[i] = 2 * S.phi[i] - S.prev[i] + r2 * (S.phi[i + 1] - 2 * S.phi[i] + S.phi[i - 1]) - h * h * P.m * P.m * S.phi[i];
        S.prev = S.phi; S.phi = nx; S.tt += h;
      }
      S.rows.push(Float32Array.from({ length: 300 }, (_, k) => S.phi[k * 2]));
      if (S.rows.length > 160) S.rows.shift();
      if (S.tt > 28) this.init(S, P);
    },
    draw(d, S, P) {
      d.clear();
      const p = d.plot({ x: 70, y: 40, w: 790, h: 170, xmin: -30, xmax: 30, ymin: -0.6, ymax: 1.05, title: '장 φ(x, t)', xl: 'x', ny: 3 });
      const pts = []; for (let i = 0; i < S.N; i += 2) pts.push([-30 + i * S.dx, S.phi[i]]);
      p.pts(pts, C.cyan, 2.2);
      p.vl(S.tt, C.yellow, [4, 4]); p.vl(-S.tt, C.yellow, [4, 4]);
      const nr = S.rows.length, out = [0, 0, 0, 255], hh = (240 * nr) / 160, top = 530 - hh;
      d.text('시공간 그림 (아래에서 위로 시간이 흐름)', 70, 268, C.text, 12, 'left', 'middle', true);
      d.rect(70, 290, 790, 240, 'rgba(5,9,22,0.8)', 'rgba(160,180,225,0.3)', 1);
      if (nr > 1) {
        PL.raster(300, nr, (i, j) => { const c = PL.cmap.div(M.clamp(S.rows[nr - 1 - j][i] * 1.8, -1, 1)); out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; return out; }, S.cv);
        d.img(S.cv, 70, top, 790, hh);
        const cx = 465, xs = 790 / 60;
        d.line(cx, 530, cx + S.tt * xs, top, C.yellow, 1.3, [5, 4]); d.line(cx, 530, cx - S.tt * xs, top, C.yellow, 1.3, [5, 4]);
        d.text('광원뿔 x = ±ct', cx + S.tt * xs - 8, top + 12, C.yellow, 11, 'right');
      }
    },
  });

  add({
    id: 'dirac', cat: '양자장론', name: '디랙 방정식과 반입자', en: 'Dirac Equation & Antimatter',
    tex: ['(i\\hbar\\gamma^\\mu\\partial_\\mu - mc)\\,\\psi = 0', 'E = \\pm\\sqrt{(pc)^2 + (mc^2)^2},\\qquad \\gamma + (\\text{핵}) \\to e^- + e^+\\ \\ (E_\\gamma \\ge 2m_ec^2)'],
    short: '(i\\gamma^\\mu\\partial_\\mu - m)\\psi = 0',
    desc: '디랙은 전자를 기술하는 상대론적 양자 방정식을 만들었다. 이 방정식은 전자의 스핀(½)과 자기 모멘트를 자연스럽게 설명했을 뿐 아니라 음의 에너지 해도 함께 내놓았다. 디랙은 음에너지 상태가 모두 전자로 차 있는 "바다"를 상상하고, 이 바다에서 전자가 빠져나간 구멍이 양전하를 가진 반입자(양전자)로 보일 것이라 예측했다(1932년 발견). 2mc² 이상의 에너지를 가진 광자는 바다의 전자를 끌어올려 전자-양전자 쌍을 만든다(쌍생성). 오른쪽은 자기장 속 거품 상자에 남는 쌍생성 궤적이다.',
    params: [R('Eg', '광자 에너지 E_γ', 'MeV', 0, 5, 0.01, 1.8, { reset: 1 }), R('m', '입자 질량 mc²', 'MeV', 0.1, 1.5, 0.001, 0.511, { reset: 1 })],
    out: (P) => { const ok = P.Eg >= 2 * P.m; return [['쌍생성 문턱 2mc²', 2 * P.m, 'MeV'], ['쌍생성 가능?', ok ? '가능' : '불가능 (에너지 부족)', ''], ['전자·양전자 각각의 운동 에너지', ok ? (P.Eg - 2 * P.m) / 2 : 0, 'MeV'], ['각각의 운동량 pc', ok ? sqrt((P.Eg / 2) ** 2 - P.m ** 2) : 0, 'MeV']]; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t = (S.t + dt) % 4.5; },
    draw(d, S, P) {
      d.clear();
      const m = P.m, pm = 3, ok = P.Eg >= 2 * m, E = P.Eg / 2, pc = ok ? sqrt(E * E - m * m) : 0;
      const p = d.plot({ x: 70, y: 40, w: 500, h: 480, xmin: -pm, xmax: pm, ymin: -4, ymax: 4, title: '에너지 E(p): 양의 에너지(파랑) · 음의 에너지 바다(분홍)', xl: 'pc (MeV)', yl: 'E (MeV)' });
      p.area((q) => -sqrt(q * q + m * m), 'rgba(244,114,182,0.15)', -pm, pm, 200, -4);
      for (let k = -14; k <= 14; k++) { const q = k * 0.2; if (!(ok && abs(q - pc) < 0.1 && S.t > 1)) p.dot(q, -sqrt(q * q + m * m), C.pink, 3); }
      p.fn((q) => sqrt(q * q + m * m), C.cyan, 2.5); p.fn((q) => -sqrt(q * q + m * m), C.pink, 2.5);
      p.pts([[0, -m], [0, m]], 'rgba(255,255,255,0.4)', 1, [3, 3]); p.label('간격 2mc²', 0.1, 0, C.text, 11);
      if (ok) {
        const u = M.clamp((S.t - 1) / 0.8, 0, 1), y = -E + 2 * E * u;
        p.pts([[pc, -E], [pc, E]], 'rgba(255,216,77,0.5)', 1.5, [4, 4]);
        p.dot(pc, y, C.yellow, 6);
        if (u >= 1) {
          d.circle(p.X(pc), p.Y(-E), 7, null, C.white, 2);
          p.label('구멍 = 양전자 e⁺', pc + 0.15, -E - 0.25, C.white, 12);
          p.label('전자 e⁻', pc + 0.15, E + 0.2, C.cyan, 12);
        }
      } else {
        p.pts([[0.6, -m], [0.6, -m + P.Eg]], C.red, 3);
        p.label('에너지 부족 — 간격을 못 넘음', 0.75, -m + P.Eg / 2, C.red, 12);
      }
      const vx = 720, vy = 330, t = S.t;
      for (let y = 70; y < 520; y += 45) for (let x = 610; x < 880; x += 45) d.perp(x, y, 4, false, 'rgba(160,175,210,0.25)', 1);
      if (t < 1) wavy(d, 600, vy, 600 + t * 120, vy, C.yellow, 2, 5, 12);
      else if (ok) {
        wavy(d, 600, vy, vx, vy, 'rgba(255,216,77,0.35)', 1.5, 5, 12);
        const s = (t - 1) * 2.2, r0 = 60 + 120 * (pc / 3);
        [[1, C.cyan, 'e⁻'], [-1, C.pink, 'e⁺']].forEach(([sg, col, lb]) => {
          const pts = []; let r = r0;
          for (let a = 0; a < s; a += 0.03) { r = r0 * exp(-0.12 * a); const cxx = vx, cyy = vy - sg * r0; pts.push([cxx + r * sin(a), cyy + sg * r * cos(a)]); }
          d.poly(pts, col, 2);
          if (pts.length) d.text(lb, pts[pts.length - 1][0] + 6, pts[pts.length - 1][1], col, 12);
        });
      } else wavy(d, 600, vy, 880, vy, C.yellow, 2, 5, 12);
      d.text('거품 상자 (자기장 ⊗)', 745, 50, C.dim, 12, 'center');
    },
  });

  const PROCS = [['mumu', 'e⁺e⁻ → μ⁺μ⁻ (쌍소멸 후 생성)'], ['moller', 'e⁻e⁻ → e⁻e⁻ (묄러 산란)'], ['compton', 'γe⁻ → γe⁻ (콤프턴 산란)'], ['annih', 'e⁺e⁻ → γγ (쌍소멸)']];
  add({
    id: 'feynman', cat: '양자장론', name: '파인만 도형과 양자 전기역학 (QED)', en: 'Feynman Diagrams & QED',
    tex: ['\\mathcal{L}_{\\text{QED}} = \\bar\\psi(i\\gamma^\\mu D_\\mu - m)\\psi - \\tfrac14 F_{\\mu\\nu}F^{\\mu\\nu},\\qquad D_\\mu = \\partial_\\mu + ieA_\\mu', '\\sigma(e^+e^-\\to\\mu^+\\mu^-) = \\frac{4\\pi\\alpha^2}{3s}(\\hbar c)^2,\\qquad \\alpha = \\frac{e^2}{4\\pi\\varepsilon_0\\hbar c} \\approx \\frac{1}{137}'],
    short: '\\sigma = \\frac{4\\pi\\alpha^2}{3s}',
    desc: '양자 전기역학(QED)에서 전자기 상호작용은 하전 입자가 광자를 주고받는 것으로 기술된다. 파인만 도형은 이 과정을 그림으로 나타낸 것으로, 실선은 페르미온(화살표가 거꾸로면 반입자), 물결선은 광자, 점은 결합 세기 e(∝√α)를 갖는 꼭짓점이다. 꼭짓점이 두 개인 도형의 확률은 α²에 비례하고, 고리가 더 많은 도형은 α만큼씩 작아진다(섭동 전개). QED는 전자의 자기 모멘트를 소수점 아래 12자리까지 맞히는, 인류가 만든 가장 정밀한 이론이다. 시간은 왼쪽에서 오른쪽으로 흐른다.',
    params: [Sel('proc', '과정', PROCS, 'mumu', { reset: 1 }), R('rs', '충돌 에너지 √s', 'GeV', 1, 100, 1, 10, { log: 1 })],
    out: (P) => { const s = P.rs * P.rs; return [['미세 구조 상수 α', 1 / 137.036, ''], ['꼭짓점 수', 2, '개'], ['진폭 ∝ e² ∝ α, 확률 ∝ α²', (1 / 137.036) ** 2, ''], ['σ(e⁺e⁻→μ⁺μ⁻) at √s', 86.8 / s, 'nb'], ['같은 √s에서 1 fb⁻¹당 사건 수', (86.8 / s) * 1e6, '개']]; },
    sub: (P) => `\\sigma = \\frac{86.8\\ \\mathrm{nb\\,GeV^2}}{(${ft(P.rs)}\\ \\mathrm{GeV})^2} = ${ft(86.8 / (P.rs * P.rs))}\\ \\mathrm{nb}`,
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t = (S.t + dt / 2.5) % 1; },
    draw(d, S, P) {
      d.clear();
      const t = S.t, col = { e: C.cyan, mu: C.green, g: C.yellow }, L = [];
      const ext = (x1, y1, x2, y2, c, rev, inc) => L.push({ x1, y1, x2, y2, c, rev, inc, ph: false });
      const pho = (x1, y1, x2, y2, inc) => L.push({ x1, y1, x2, y2, c: col.g, inc, ph: true });
      let lab = [];
      if (P.proc === 'mumu') { ext(80, 420, 260, 280, col.e, false, 1); ext(80, 140, 260, 280, col.e, true, 1); pho(260, 280, 520, 280, 0); ext(520, 280, 700, 420, col.mu, false, 2); ext(520, 280, 700, 140, col.mu, true, 2); lab = [['e⁻', 70, 440], ['e⁺', 70, 120], ['γ*', 390, 255], ['μ⁻', 710, 440], ['μ⁺', 710, 120]]; }
      else if (P.proc === 'moller') { ext(80, 140, 390, 170, col.e, false, 1); ext(390, 170, 700, 140, col.e, false, 2); ext(80, 420, 390, 390, col.e, false, 1); ext(390, 390, 700, 420, col.e, false, 2); pho(390, 170, 390, 390, 0); lab = [['e⁻', 70, 120], ['e⁻', 70, 440], ['γ', 405, 280], ['e⁻', 710, 120], ['e⁻', 710, 440]]; }
      else if (P.proc === 'compton') { ext(80, 420, 260, 300, col.e, false, 1); pho(80, 140, 260, 300, 1); ext(260, 300, 520, 300, col.e, false, 0); ext(520, 300, 700, 420, col.e, false, 2); pho(520, 300, 700, 140, 2); lab = [['e⁻', 70, 440], ['γ', 70, 120], ['e⁻', 390, 280], ['e⁻', 710, 440], ['γ', 710, 120]]; }
      else { ext(80, 420, 390, 390, col.e, false, 1); ext(80, 140, 390, 170, col.e, true, 1); ext(390, 390, 390, 170, col.e, false, 0); pho(390, 390, 700, 420, 2); pho(390, 170, 700, 140, 2); lab = [['e⁻', 70, 440], ['e⁺', 70, 120], ['e', 405, 280], ['γ', 710, 440], ['γ', 710, 120]]; }
      L.forEach((l) => (l.ph ? wavy(d, l.x1, l.y1, l.x2, l.y2, l.c, 2.2) : fermion(d, l.x1, l.y1, l.x2, l.y2, l.c, l.rev)));
      const vs = []; L.forEach((l) => { [[l.x1, l.y1], [l.x2, l.y2]].forEach(([x, y]) => { if (x > 100 && x < 690) vs.push([x, y]); }); });
      vs.forEach(([x, y]) => { d.circle(x, y, 7, C.white); d.text('e', x + 10, y - 12, C.dim, 11); });
      lab.forEach(([s, x, y]) => d.text(s, x, y, C.text, 15, 'center', 'middle', true));
      L.forEach((l) => {
        const u = l.inc === 1 ? t / 0.45 : l.inc === 0 ? (t - 0.45) / 0.15 : (t - 0.6) / 0.4;
        if (u < 0 || u > 1) return;
        d.glow(l.x1 + (l.x2 - l.x1) * u, l.y1 + (l.y2 - l.y1) * u, 9, PL.rgba(l.c, 0.9));
      });
      d.line(80, 510, 700, 510, C.dim, 1.5); d.arrow(600, 510, 700, 510, C.dim, 1.5); d.text('시간 →', 620, 528, C.dim, 11);
      const p = d.plot({ x: 740, y: 60, w: 140, h: 200, xmin: 1, xmax: 100, ymin: 0.005, ymax: 100, xlog: true, ylog: true, title: 'σ(e⁺e⁻→μ⁺μ⁻)', xl: '√s (GeV)', yl: 'nb' });
      p.fn((r) => 86.8 / (r * r), C.green, 2); p.dot(P.rs, 86.8 / (P.rs * P.rs), C.green);
      d.text('σ ∝ α²/s', 745, 300, C.green, 12);
    },
  });

  const FERM = [[0.000511, 1, 1], [0.1057, 1, 1], [1.777, 1, 1], [0.3, 2 / 3, 3], [0.3, 1 / 3, 3], [0.5, 1 / 3, 3], [1.5, 2 / 3, 3], [4.5, 1 / 3, 3], [173, 2 / 3, 3]];
  const aQED = (Q) => { let s = 0; for (const [m, q, nc] of FERM) if (Q > m) s += nc * q * q * log(Q / m); return 1 / 137.036 / (1 - (2 / (3 * PI)) * (1 / 137.036) * s); };
  const aS = (Q, a0) => a0 / (1 + ((a0 * 23) / (6 * PI)) * log(Q / 91.19));
  add({
    id: 'running', cat: '양자장론', name: '결합 상수의 흐름과 점근적 자유성', en: 'Running Couplings & Asymptotic Freedom',
    tex: ['\\alpha(Q) \\approx \\frac{\\alpha(\\mu)}{1 - \\frac{\\alpha(\\mu)}{3\\pi}\\sum_f N_c Q_f^2\\ln\\frac{Q^2}{\\mu^2}}\\quad(\\text{QED: 커짐})', '\\alpha_s(Q) = \\frac{\\alpha_s(M_Z)}{1 + \\frac{\\alpha_s(M_Z)}{4\\pi}\\left(11 - \\frac23 n_f\\right)\\ln\\frac{Q^2}{M_Z^2}}\\quad(\\text{QCD: 작아짐})'],
    short: '\\alpha_s(Q)\\to 0\\ (Q\\to\\infty)',
    desc: '양자장론에서 진공은 끊임없이 생겼다 사라지는 가상 입자 쌍으로 가득하다. 전하 주위의 가상 전자-양전자 쌍은 전하를 가려(차폐) 멀리서는 약하게 보이게 하므로, 높은 에너지(짧은 거리)로 들여다볼수록 전자기 결합 상수 α가 커진다(1/137 → Z 보손 에너지에서 1/128). 반면 강한 상호작용에서는 글루온끼리도 상호작용해 반대 효과(반차폐)가 생기므로, 에너지가 높을수록 결합이 약해진다(점근적 자유성, 2004 노벨상). 낮은 에너지에서 α_s가 커지는 것이 쿼크가 갇히는 이유와 연결된다.',
    params: [R('Q', '탐침 에너지 Q', 'GeV', 1, 10000, 1, 91.19, { log: 1 }), R('as0', 'α_s(M_Z)', '', 0.1, 0.13, 0.001, 0.118)],
    out: (P) => [['전자기 결합 α(Q)', aQED(P.Q), ''], ['1/α(Q)', 1 / aQED(P.Q), ''], ['강한 결합 α_s(Q)', aS(P.Q, P.as0), ''], ['탐침 거리 ħc/Q', (HBARC / (P.Q * 1000)), 'fm'], ['QCD 척도 Λ (1고리 근사)', 91.19 * exp((-6 * PI) / (23 * P.as0)) * 1000, 'MeV']],
    sub: (P) => `\\alpha_s(${ft(P.Q)}) = \\frac{${ft(P.as0)}}{1 + \\frac{${ft(P.as0)}\\cdot 23}{6\\pi}\\ln\\frac{${ft(P.Q)}}{91.19}} = ${ft(aS(P.Q, P.as0))}`,
    init(S) { S.pairs = Array.from({ length: 40 }, () => ({ r: 30 + Math.random() * 100, a: Math.random() * 2 * PI, ph: Math.random() * 6 })); },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const rp = M.clamp(160 / (1 + Math.log10(P.Q)), 20, 150);
      const cart = (cx, cy, title, col, qcd) => {
        d.text(title, cx, 36, col, 13, 'center', 'middle', true);
        S.pairs.forEach((q) => {
          const x = cx + q.r * cos(q.a), y = 210 + q.r * sin(q.a) * 0.9, vis = 0.5 + 0.5 * sin(S.t * 2 + q.ph);
          if (!qcd) { d.circle(x - 5 * cos(q.a), y - 5 * sin(q.a), 3, PL.rgba(C.blue, vis)); d.circle(x + 5 * cos(q.a), y + 5 * sin(q.a), 3, PL.rgba(C.red, vis)); }
          else { wavy(d, x - 7, y, x + 7, y, PL.rgba(C.yellow, vis * 0.8), 1.2, 3, 7); d.circle(x + 9, y, 2.6, PL.rgba(['#ff5c6c', '#4ade80', '#6a8dff'][floor(q.ph) % 3], vis)); }
        });
        d.glow(cx, 210, 26, PL.rgba(col, 0.7)); d.circle(cx, 210, 9, col);
        d.g.setLineDash([5, 5]); d.circle(cx, 210, rp, null, '#fff', 1.5); d.g.setLineDash([]);
      };
      cart(220, 0, 'QED: 가상 전자쌍이 전하를 가림', C.red, false);
      cart(670, 0, 'QCD: 가상 글루온이 색전하를 퍼뜨림', C.green, true);
      d.text('점선 = 탐침이 들여다보는 거리 (Q가 클수록 가까이)', 450, 368, C.dim, 12, 'center');
      const p = d.plot({ x: 70, y: 400, w: 370, h: 120, xmin: 1, xmax: 1e4, ymin: 118, ymax: 138, xlog: true, title: '1/α(Q) — QED (높은 에너지에서 강해짐)', xl: 'Q (GeV)', ny: 2 });
      p.fn((Q) => 1 / aQED(Q), C.red, 2.5); p.dot(P.Q, 1 / aQED(P.Q), C.red);
      const q = d.plot({ x: 500, y: 400, w: 370, h: 120, xmin: 1, xmax: 1e4, ymin: 0, ymax: 0.45, xlog: true, title: 'α_s(Q) — QCD (높은 에너지에서 약해짐)', xl: 'Q (GeV)', ny: 2 });
      q.fn((Q) => aS(Q, P.as0), C.green, 2.5); q.dot(P.Q, aS(P.Q, P.as0), C.green);
    },
  });

  add({
    id: 'yukawa', cat: '양자장론', name: '유카와 퍼텐셜 (힘을 전달하는 입자)', en: 'Yukawa Potential — Force Carriers',
    tex: ['V(r) = -\\frac{g^2}{4\\pi}\\frac{e^{-r/\\lambda}}{r},\\qquad \\lambda = \\frac{\\hbar}{mc}', 'm = 0 \\;\\Rightarrow\\; V \\propto -\\frac{1}{r}\\ (\\text{쿨롱형, 무한한 도달 거리})'],
    short: 'V = -g^2\\frac{e^{-r/\\lambda}}{r}',
    desc: '양자장론에서 힘은 입자를 주고받는 것(교환)으로 생긴다. 유카와는 질량이 m인 입자를 교환하면 힘이 ħ/mc 정도의 거리에서 지수적으로 사라진다는 것을 보였다 — 무거운 입자는 에너지-시간 불확정성 때문에 멀리 가지 못한다. 이로부터 원자핵을 묶는 핵력(도달 거리 약 1.4 fm)을 전달하는 입자의 질량을 약 140 MeV로 예측했고, 이것이 파이온으로 발견되었다. 질량 0인 광자를 교환하는 전자기력은 무한히 멀리까지 미친다.',
    params: [R('m', '교환 입자 질량 mc²', 'MeV', 0, 1000, 1, 140), R('g', '결합 세기 (상대값)', '', 0.5, 2, 0.05, 1)],
    out: (P) => [['힘의 도달 거리 λ = ħc/mc²', P.m > 0 ? HBARC / P.m : Infinity, 'fm'], ['참고: 광자 (전자기력)', '∞', ''], ['참고: 파이온 140 MeV (핵력)', HBARC / 140, 'fm'], ['참고: W 보손 80.4 GeV (약력)', HBARC / 80400, 'fm']],
    sub: (P) => (P.m > 0 ? `\\lambda = \\frac{\\hbar c}{mc^2} = \\frac{197.3\\ \\mathrm{MeV\\,fm}}{${ft(P.m)}\\ \\mathrm{MeV}} = ${ft(HBARC / P.m)}\\ \\mathrm{fm}` : '\\lambda = \\infty'),
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const lam = P.m > 0 ? HBARC / P.m : 1e9, px = 90;
      const x1 = 250, x2 = 650, y = 150;
      [x1, x2].forEach((x) => { d.glow(x, y, min(220, lam * px * 0.8 + 20), 'rgba(167,139,250,0.25)'); d.ball(x, y, 22, C.orange); });
      d.text('핵자', x1, y + 40, C.text, 12, 'center'); d.text('핵자', x2, y + 40, C.text, 12, 'center');
      const u = (S.t * 0.8) % 1;
      wavy(d, x1 + 22, y, x1 + 22 + (x2 - x1 - 44) * u, y, C.purple, 2.2, 7, 18);
      d.text(P.m > 0 ? '교환 입자 (질량 ' + P.m + ' MeV)' : '질량 0 (광자처럼)', 450, y - 50, C.purple, 13, 'center');
      d.text('보라 구름 크기 ≈ 힘의 도달 거리 λ', 450, y + 80, C.dim, 12, 'center');
      const V = (r, mm) => (-P.g * P.g * (mm > 0 ? exp((-r * mm) / HBARC) : 1)) / r;
      const p = d.plot({ x: 70, y: 280, w: 790, h: 240, xmin: 0, xmax: 5, ymin: -3, ymax: 0.2, title: '퍼텐셜 V(r) — 유카와(보라) vs 쿨롱 모양(점선)', xl: 'r (fm)', yl: 'V (상대값)' });
      p.fn((r) => V(r, 0), 'rgba(255,255,255,0.5)', 1.5, 300, [6, 4], 0.05, 5);
      p.fn((r) => V(r, P.m), C.purple, 2.8, 300, null, 0.05, 5);
      if (P.m > 0 && lam < 5) { p.vl(lam, C.yellow); p.label('λ', lam + 0.05, -2.7, C.yellow, 12); }
    },
  });

  add({
    id: 'higgs', cat: '양자장론', name: '힉스 메커니즘 (자발적 대칭 깨짐)', en: 'Higgs Mechanism — Spontaneous Symmetry Breaking',
    tex: ['V(\\phi) = \\mu^2|\\phi|^2 + \\lambda|\\phi|^4,\\qquad \\mu^2 < 0 \\;\\Rightarrow\\; \\langle|\\phi|\\rangle = v = \\sqrt{\\frac{-\\mu^2}{2\\lambda}}', 'm_W = \\tfrac12 g v,\\qquad m_H = \\sqrt{2\\lambda}\\,v,\\qquad v \\approx 246\\ \\mathrm{GeV}'],
    short: 'V = \\mu^2|\\phi|^2 + \\lambda|\\phi|^4',
    desc: '힉스 장의 퍼텐셜 에너지는 μ² < 0일 때 가운데가 볼록 솟은 "멕시코 모자" 모양이다. 가운데(φ = 0)는 회전 대칭이지만 불안정해서, 공은 결국 아래쪽 골짜기의 어느 한 방향으로 굴러 내려가고 대칭이 깨진다(자발적 대칭 깨짐). 우주 전체에 퍼진 이 0이 아닌 장의 값 v가 W, Z 보손과 쿼크·렙톤에 질량을 준다. 골짜기를 따라 도는 방향(남부-골드스톤 모드)은 W, Z가 흡수하고, 골짜기를 가로지르는 진동이 2012년 발견된 힉스 보손이다. 화면을 끌어 돌려 보자.',
    hint: '캔버스를 드래그해 시점을 바꿀 수 있습니다.',
    params: [R('mu2', '질량 매개변수 μ²', '', -1, 1, 0.01, -0.8, { reset: 1 }), R('lam', '자기 결합 λ', '', 0.2, 1, 0.01, 0.5, { reset: 1 })],
    out: (P) => { const v = P.mu2 < 0 ? sqrt(-P.mu2 / (2 * P.lam)) : 0; return [['상태', P.mu2 < 0 ? '대칭 깨짐 (v ≠ 0)' : '대칭 유지 (v = 0)', ''], ['진공 기댓값 v (모형 단위)', v, ''], ['힉스 질량 √(−2μ²) (모형 단위)', P.mu2 < 0 ? sqrt(-2 * P.mu2) : sqrt(2 * P.mu2), ''], ['실제 v', 246, 'GeV'], ['실제 힉스 질량', 125.1, 'GeV']]; },
    init(S, P) { S.yaw = 0.6; S.pitch = 0.55; S.b = [0.03 * cos(Math.random() * 6.28), 0.03 * sin(Math.random() * 6.28), 0, 0]; },
    pointer(type, x, y, S) { return PL.dragRotate(type, x, y, S); },
    step(S, P, dt) {
      const f = (t, y) => { const r2 = y[0] * y[0] + y[1] * y[1], dV = 2 * P.mu2 + 4 * P.lam * r2; return [y[2], y[3], -dV * y[0] - 0.5 * y[2], -dV * y[1] - 0.5 * y[3]]; };
      for (let i = 0; i < 6; i++) S.b = M.rk4(f, S.b, 0, dt / 3);
      if (!S._drag) S.yaw += dt * 0.12;
    },
    draw(d, S, P) {
      d.clear(false);
      const vmin = P.mu2 < 0 ? sqrt(-P.mu2 / (2 * P.lam)) : 0.7, R0 = M.clamp(vmin * 1.55, 0.9, 1.6);
      const cam = PL.cam(S.yaw, S.pitch, 260 / R0, 450, 300), V = (r) => P.mu2 * r * r + P.lam * r ** 4, zs = 2.2 / max(0.3, abs(V(R0)) + abs(V(vmin)));
      for (let k = 1; k <= 22; k++) {
        const r = (R0 * k) / 22, pts = [];
        for (let a = 0; a <= 72; a++) { const q = (2 * PI * a) / 72; pts.push(cam(r * cos(q), r * sin(q), M.clamp(V(r), -1, 2.2) * zs)); }
        const c = PL.cmap.viridis(M.clamp((V(r) + 0.6) / 2.4, 0, 1));
        d.poly(pts, PL.rgb(c, 0.85), 1.2);
      }
      for (let a = 0; a < 36; a++) {
        const q = (2 * PI * a) / 36, pts = [];
        for (let k = 0; k <= 30; k++) { const r = (R0 * k) / 30; pts.push(cam(r * cos(q), r * sin(q), M.clamp(V(r), -1, 2.2) * zs)); }
        d.poly(pts, 'rgba(120,160,255,0.3)', 1);
      }
      const r = hypot(S.b[0], S.b[1]), bp = cam(S.b[0], S.b[1], V(r) * zs + 0.06);
      d.ball(bp[0], bp[1], 9, C.orange);
      if (P.mu2 < 0) { const v = sqrt(-P.mu2 / (2 * P.lam)), pts = []; for (let a = 0; a <= 72; a++) { const q = (2 * PI * a) / 72; pts.push(cam(v * cos(q), v * sin(q), V(v) * zs)); } d.poly(pts, C.yellow, 2, false, null, [5, 4]); }
      d.text(P.mu2 < 0 ? '노란 점선: 진공(최소 에너지)의 원 |φ| = v' : 'μ² > 0: 최소점이 가운데 하나 — 대칭이 유지됨', 450, 520, C.text, 13, 'center');
      d.text('Re φ, Im φ 평면 위의 퍼텐셜 V(φ)', 20, 24, C.dim, 12);
    },
  });

  add({
    id: 'casimir', cat: '양자장론', name: '카시미르 효과 (진공의 에너지)', en: 'The Casimir Effect',
    tex: ['\\frac{F}{A} = -\\frac{\\pi^2\\hbar c}{240\\,d^4}', 'E_{\\text{진공}} = \\sum_{\\text{모드}}\\tfrac12\\hbar\\omega'],
    short: 'F/A = -\\frac{\\pi^2\\hbar c}{240 d^4}',
    desc: '양자장론에 따르면 빈 공간(진공)에도 모든 진동수의 전자기장 모드가 바닥 상태 에너지 ½ħω를 가지고 요동친다. 아주 가까운 두 금속판 사이에는 판 사이 간격에 딱 맞는 파장의 모드만 존재할 수 있어, 바깥보다 모드 수가 적다. 그 결과 바깥 진공이 판을 미는 압력이 더 커서 두 판이 서로 끌린다. 1948년 카시미르가 예측했고 1997년 정밀하게 측정되었다. 10 nm 간격에서는 압력이 약 1기압에 이른다.',
    params: [R('d', '판 사이 간격 d', 'nm', 10, 2000, 1, 100, { log: 1 }), R('A', '판의 넓이 A', 'cm²', 0.1, 10, 0.1, 1)],
    P: (d) => (PI * PI * K.hbar * K.c) / (240 * Math.pow(d * 1e-9, 4)),
    out(P) { const pr = this.P(P.d); return [['인력 압력 |F/A|', pr, 'Pa'], ['대기압 대비', pr / 101325, '기압'], ['넓이 A에 작용하는 힘', pr * P.A * 1e-4, 'N'], ['간격이 반이 되면', 16, '배 (∝ 1/d⁴)']]; },
    sub(P) { return `\\frac{F}{A} = \\frac{\\pi^2(1.055\\times10^{-34})(3.00\\times10^8)}{240(${ft(P.d * 1e-9)})^4} = ${ft(this.P(P.d))}\\ \\mathrm{Pa}`; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const gap = 40 + 140 * ((Math.log10(P.d) - 1) / 2.3), cx = 300, x1 = cx - gap / 2, x2 = cx + gap / 2;
      for (let k = 0; k < 14; k++) {
        const lam = 18 + k * 9, y0 = 80 + k * 28, ph = S.t * 3 + k;
        [[20, x1 - 10], [x2 + 10, 580]].forEach(([a, b]) => { const pts = []; for (let x = a; x <= b; x += 3) pts.push([x, y0 + 7 * sin((2 * PI * x) / lam + ph)]); d.poly(pts, 'rgba(106,141,255,0.45)', 1.2); });
      }
      for (let n = 1; n <= 4; n++) {
        const y0 = 130 + n * 70, pts = [];
        if ((2 * gap) / n < 10) continue;
        for (let x = x1; x <= x2; x += 2) pts.push([x, y0 + 10 * sin((n * PI * (x - x1)) / gap) * cos(S.t * 3 + n)]);
        d.poly(pts, C.yellow, 1.6);
      }
      d.rect(x1 - 12, 60, 12, 440, '#cfd8ee'); d.rect(x2, 60, 12, 440, '#cfd8ee');
      d.arrow(x1 - 70, 280, x1 - 16, 280, C.red, 4); d.arrow(x2 + 70, 280, x2 + 16, 280, C.red, 4);
      d.text('바깥: 모든 파장의 모드', 110, 40, C.blue, 12, 'center'); d.text('사이: λ = 2d/n 인 모드만', cx, 40, C.yellow, 12, 'center');
      d.text('d = ' + P.d + ' nm', cx, 530, C.text, 13, 'center');
      const p = d.plot({ x: 640, y: 60, w: 230, h: 440, xmin: 10, xmax: 2000, ymin: 1e-4, ymax: 1e6, xlog: true, ylog: true, title: '압력 |F/A| ∝ 1/d⁴', xl: 'd (nm)', yl: 'Pa' });
      p.fn((dd) => this.P(dd), C.red, 2.5); p.hl(101325, C.dim); p.label('1기압', 12, 101325 * 2.5, C.dim, 10);
      p.dot(P.d, this.P(P.d), C.red);
    },
  });

  add({
    id: 'hawking', cat: '양자장론', name: '호킹 복사 (블랙홀의 증발)', en: 'Hawking Radiation',
    tex: ['T_H = \\frac{\\hbar c^3}{8\\pi G M k_B} \\approx 6.2\\times10^{-8}\\ \\mathrm{K}\\times\\frac{M_\\odot}{M}', 't_{\\text{증발}} \\approx \\frac{5120\\,\\pi G^2M^3}{\\hbar c^4}'],
    short: 'T_H = \\frac{\\hbar c^3}{8\\pi GMk_B}',
    desc: '호킹은 일반 상대성이론과 양자장론을 함께 적용해, 블랙홀이 완전히 검지 않고 온도 T_H의 흑체처럼 복사를 낸다는 것을 보였다. 직관적으로는 사건의 지평선 근처에서 생긴 가상 입자 쌍 중 하나가 블랙홀에 떨어지고 다른 하나가 탈출해 실제 입자가 되는 것으로 그릴 수 있다. 온도는 질량에 반비례하므로 작은 블랙홀일수록 뜨겁고 빨리 증발하며, 마지막에는 폭발적으로 사라진다. 태양 질량 블랙홀은 우주 배경 복사(2.7 K)보다 훨씬 차가워 지금은 오히려 에너지를 흡수한다.',
    params: [R('M', '블랙홀 질량 M', 'kg', 1e8, 1e32, 1, 2e30, { log: 1 })],
    out: (P) => {
      const T = (K.hbar * K.c ** 3) / (8 * PI * K.G * P.M * K.kB), tev = (5120 * PI * K.G ** 2 * P.M ** 3) / (K.hbar * K.c ** 4), Pw = (K.hbar * K.c ** 6) / (15360 * PI * K.G ** 2 * P.M ** 2);
      return [['호킹 온도 T_H', T, 'K'], ['우주 배경 복사(2.7 K)와 비교', T > 2.725 ? '더 뜨거움 → 증발' : '더 차가움 → 흡수가 더 큼', ''], ['복사 일률', Pw, 'W'], ['증발 시간', tev / K.yr, '년'], ['우주 나이(1.38×10¹⁰년) 대비', tev / K.yr / 1.38e10, '배'], ['슈바르츠실트 반지름', (2 * K.G * P.M) / K.c ** 2, 'm']];
    },
    sub: (P) => `T_H = \\frac{\\hbar c^3}{8\\pi G (${ft(P.M)})k_B} = ${ft((K.hbar * K.c ** 3) / (8 * PI * K.G * P.M * K.kB))}\\ \\mathrm{K}`,
    init(S) { S.pairs = []; S.acc = 0; },
    step(S, P, dt) {
      const T = (K.hbar * K.c ** 3) / (8 * PI * K.G * P.M * K.kB), rate = M.clamp(2 + 3 * Math.log10(T + 1e-12) + 30, 2, 40);
      S.acc += dt * rate;
      while (S.acc > 1) { S.acc -= 1; const a = Math.random() * 2 * PI; S.pairs.push({ a, s: 0, esc: Math.random() < 0.5 }); }
      S.pairs.forEach((p) => (p.s += dt));
      S.pairs = S.pairs.filter((p) => p.s < 2.2);
    },
    draw(d, S, P) {
      d.clear(false, '#03050b');
      const cx = 280, cy = 280, R0 = 90;
      d.glow(cx, cy, R0 * 1.8, 'rgba(255,150,60,0.18)');
      d.circle(cx, cy, R0, '#000', 'rgba(255,150,60,0.8)', 2);
      S.pairs.forEach((p) => {
        const r0 = R0 + 6, sep = min(1, p.s * 3) * 8, x = cx + r0 * cos(p.a), y = cy + r0 * sin(p.a), tx = -sin(p.a), ty = cos(p.a);
        const ax = x + tx * sep, ay = y + ty * sep, bx = x - tx * sep, by = y - ty * sep;
        if (p.s < 0.5) { d.circle(ax, ay, 3, C.cyan); d.circle(bx, by, 3, C.pink); }
        else {
          const u = (p.s - 0.5) / 1.7, inR = r0 * (1 - u * 0.15), outR = r0 + u * 220;
          d.circle(cx + inR * cos(p.a) - tx * 8, cy + inR * sin(p.a) - ty * 8, 2.5, PL.rgba(C.pink, 1 - u));
          d.glow(cx + outR * cos(p.a) + tx * 8, cy + outR * sin(p.a) + ty * 8, 7, PL.rgba(C.yellow, 1 - u * 0.7));
        }
      });
      d.text('가상 입자 쌍: 하나는 떨어지고 하나는 탈출', cx, 30, C.text, 12, 'center');
      const T = (K.hbar * K.c ** 3) / (8 * PI * K.G * P.M * K.kB);
      const p = d.plot({ x: 600, y: 60, w: 270, h: 440, xmin: 1e8, xmax: 1e32, ymin: 1e-9, ymax: 1e16, xlog: true, ylog: true, title: '질량에 따른 호킹 온도', xl: 'M (kg)', yl: 'K' });
      p.fn((m) => (K.hbar * K.c ** 3) / (8 * PI * K.G * m * K.kB), C.yellow, 2.5);
      p.hl(2.725, C.cyan); p.label('우주 배경 2.7 K', 1e9, 15, C.cyan, 10);
      p.vl(K.Msun, C.dim); p.label('태양 질량', K.Msun * 0.02, 1e12, C.dim, 10);
      p.dot(P.M, T, C.yellow);
    },
  });

  /* ================================================================ 입자물리학 */
  const SM = [
    ['u', '업 쿼크', 2.16, '+2/3', '1/2', '쿼크', 'I', '강력 · 약력 · 전자기력'], ['c', '참 쿼크', 1270, '+2/3', '1/2', '쿼크', 'II', '강력 · 약력 · 전자기력'], ['t', '톱 쿼크', 172690, '+2/3', '1/2', '쿼크', 'III', '강력 · 약력 · 전자기력'], ['g', '글루온', 0, '0', '1', '게이지 보손', '', '강력을 전달 (색전하 8종)'],
    ['d', '다운 쿼크', 4.67, '−1/3', '1/2', '쿼크', 'I', '강력 · 약력 · 전자기력'], ['s', '스트레인지 쿼크', 93.4, '−1/3', '1/2', '쿼크', 'II', '강력 · 약력 · 전자기력'], ['b', '보텀 쿼크', 4180, '−1/3', '1/2', '쿼크', 'III', '강력 · 약력 · 전자기력'], ['γ', '광자', 0, '0', '1', '게이지 보손', '', '전자기력을 전달'],
    ['e', '전자', 0.511, '−1', '1/2', '렙톤', 'I', '약력 · 전자기력'], ['μ', '뮤온', 105.66, '−1', '1/2', '렙톤', 'II', '약력 · 전자기력'], ['τ', '타우', 1776.9, '−1', '1/2', '렙톤', 'III', '약력 · 전자기력'], ['Z', 'Z 보손', 91188, '0', '1', '게이지 보손', '', '약력을 전달 (중성 흐름)'],
    ['νₑ', '전자 중성미자', 1e-7, '0', '1/2', '렙톤', 'I', '약력만'], ['ν_μ', '뮤온 중성미자', 1.1e-7, '0', '1/2', '렙톤', 'II', '약력만'], ['ν_τ', '타우 중성미자', 1.2e-7, '0', '1/2', '렙톤', 'III', '약력만'], ['W', 'W 보손', 80377, '±1', '1', '게이지 보손', '', '약력을 전달 (베타 붕괴)'],
    ['H', '힉스 보손', 125250, '0', '0', '스칼라 보손', '', '다른 입자에 질량을 줌'],
  ];
  const SMCOL = { 쿼크: C.purple, 렙톤: C.green, '게이지 보손': C.red, '스칼라 보손': C.yellow };
  add({
    id: 'standardmodel', cat: '입자물리학', name: '표준 모형의 기본 입자', en: 'The Standard Model of Particle Physics',
    tex: ['\\mathcal{L}_{\\text{SM}} = -\\tfrac14 F_{\\mu\\nu}F^{\\mu\\nu} + i\\bar\\psi\\gamma^\\mu D_\\mu\\psi + |D_\\mu\\phi|^2 - V(\\phi) + \\left(\\bar\\psi_i y_{ij}\\psi_j\\phi + \\text{h.c.}\\right)', 'SU(3)_C\\times SU(2)_L\\times U(1)_Y'],
    short: 'SU(3)\\times SU(2)\\times U(1)',
    desc: '표준 모형은 지금까지 알려진 모든 기본 입자와 중력을 제외한 세 가지 힘(강력, 약력, 전자기력)을 하나의 라그랑지언으로 기술한다. 물질은 스핀 ½의 페르미온(쿼크 6종, 렙톤 6종)으로 이루어지며 세 세대로 반복된다. 힘은 스핀 1의 게이지 보손(글루온, 광자, W, Z)이 전달하고, 힉스 보손이 입자들에 질량을 준다. 아래 막대는 질량을 로그 눈금으로 나타낸 것으로, 가장 가벼운 중성미자와 가장 무거운 톱 쿼크의 질량은 10¹²배 이상 차이 난다. 입자를 골라 보자.',
    params: [Sel('i', '입자 선택', SM.map((p, i) => [i, p[0] + ' — ' + p[1]]), 8)],
    out: (P) => { const p = SM[P.i]; return [['이름', p[1] + ' (' + p[0] + ')', ''], ['분류', p[5] + (p[6] ? ' · 제' + p[6] + '세대' : ''), ''], ['질량', p[2] === 0 ? '0' : p[2] < 1e-5 ? '< 1 eV (중성미자 진동으로 0이 아님이 확인)' : p[2] >= 1000 ? fmt(p[2] / 1000, 4) + ' GeV/c²' : fmt(p[2], 4) + ' MeV/c²', ''], ['전하', p[3], 'e'], ['스핀', p[4], 'ħ'], ['상호작용', p[7], '']]; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const cw = 118, ch = 92, x0 = 40, y0 = 40;
      ['I', 'II', 'III'].forEach((g, k) => d.text('제' + g + '세대', x0 + k * cw + cw / 2, y0 - 14, C.dim, 11, 'center'));
      SM.forEach((p, i) => {
        let x, y;
        if (i < 16) { x = x0 + (i % 4) * cw; y = y0 + floor(i / 4) * ch; } else { x = x0 + 4 * cw + 14; y = y0 + 1.5 * ch; }
        const col = SMCOL[p[5]], sel = i === P.i;
        d.rect(x + 3, y + 3, cw - 6, ch - 6, sel ? PL.rgba(col, 0.35) : PL.rgba(col, 0.1), sel ? col : PL.rgba(col, 0.5), sel ? 3 : 1.2, 10);
        d.text(p[0], x + cw / 2, y + 34, col, 26, 'center', 'middle', true);
        d.text(p[1], x + cw / 2, y + 62, C.text, 11, 'center');
        d.text(p[2] === 0 ? '0' : p[2] < 1e-5 ? '<1 eV' : p[2] >= 1000 ? fmt(p[2] / 1000, 3) + ' GeV' : fmt(p[2], 3) + ' MeV', x + cw / 2, y + 78, C.dim, 10, 'center');
      });
      d.text('쿼크', x0 + 4 * cw + 14, 60, C.purple, 12); d.text('렙톤', x0 + 4 * cw + 60, 60, C.green, 12);
      d.text('게이지 보손', x0 + 4 * cw + 14, 80, C.red, 12); d.text('힉스', x0 + 4 * cw + 100, 80, C.yellow, 12);
      const p = d.plot({ x: 70, y: 450, w: 790, h: 40, xmin: 1e-8, xmax: 1e6, ymin: 0, ymax: 1, xlog: true, yticks: false, grid: false, title: '질량 (MeV/c², 로그 눈금) — 질량 0인 광자·글루온은 제외', xl: '' });
      SM.forEach((q, i) => { if (q[2] <= 0) return; const X = p.X(q[2]), sel = i === P.i; d.circle(X, 470, sel ? 8 : 5, SMCOL[q[5]], sel ? '#fff' : null, 2); d.text(q[0], X, sel ? 448 : 456, sel ? '#fff' : C.dim, sel ? 13 : 10, 'center', 'middle', sel); });
    },
  });

  add({
    id: 'decay', cat: '핵물리 · 입자물리', name: '방사성 붕괴 법칙 (반감기)', en: 'Radioactive Decay Law',
    tex: ['N(t) = N_0\\,e^{-\\lambda t} = N_0\\left(\\tfrac12\\right)^{t/T_{1/2}}', 'T_{1/2} = \\frac{\\ln 2}{\\lambda},\\qquad A = \\lambda N'],
    short: 'N = N_0e^{-\\lambda t}',
    desc: '방사성 원자핵은 언제 붕괴할지 전혀 예측할 수 없고, 매 순간 일정한 확률로 붕괴한다(양자역학적 무작위성). 그래서 원자핵이 많이 모이면 반감기마다 정확히 절반씩 줄어드는 지수 함수를 따른다. 각 칸은 원자핵 하나이며 꺼진 칸은 붕괴한 것이다. 개수가 적으면 이론 곡선에서 들쭉날쭉 벗어나는 통계적 요동이 잘 보인다. 탄소-14 연대 측정(반감기 5730년), 의료용 동위원소, 원자력 발전이 이 법칙에 기반한다.',
    params: [R('T', '반감기 T½', 's', 1, 20, 0.5, 4, { reset: 1 }), R('N0', '처음 원자핵 수 N₀', '개', 50, 2500, 50, 1000, { reset: 1 })],
    out: (P, S) => [['붕괴 상수 λ = ln2/T½', Math.LN2 / P.T, '/s'], ['평균 수명 τ = 1/λ', P.T / Math.LN2, 's'], ['남은 원자핵 N', S.n, '개'], ['이론값 N₀(½)^{t/T½}', P.N0 * Math.pow(0.5, S.t / P.T), '개'], ['활동도 A = λN', (Math.LN2 / P.T) * S.n, 'Bq'], ['경과 시간', S.t, 's']],
    sub: (P, S) => `N(${ft(S.t, 2)}) = ${P.N0}\\left(\\tfrac12\\right)^{${ft(S.t, 2)}/${ft(P.T)}} = ${ft(P.N0 * Math.pow(0.5, S.t / P.T))}`,
    init(S, P) { S.alive = new Uint8Array(P.N0).fill(1); S.n = P.N0; S.hist = [[0, P.N0]]; S.fl = new Float32Array(P.N0); },
    step(S, P, dt) {
      S.t += dt;
      const pr = 1 - Math.pow(0.5, dt / P.T);
      for (let i = 0; i < P.N0; i++) { if (S.alive[i] && Math.random() < pr) { S.alive[i] = 0; S.n--; S.fl[i] = 1; } if (S.fl[i] > 0) S.fl[i] -= dt * 2; }
      S.hist.push([S.t, S.n]);
      if (S.t > 6 * P.T) this.init(S, P), (S.t = 0);
    },
    draw(d, S, P) {
      d.clear();
      const cols = Math.ceil(sqrt(P.N0)), cs = min(470 / cols, 22);
      for (let i = 0; i < P.N0; i++) {
        const x = 30 + (i % cols) * cs, y = 50 + floor(i / cols) * cs;
        if (S.alive[i]) d.rect(x, y, cs - 1, cs - 1, C.green); else d.rect(x, y, cs - 1, cs - 1, S.fl[i] > 0 ? PL.rgba(C.yellow, S.fl[i]) : 'rgba(255,255,255,0.05)');
      }
      d.text('초록 = 아직 붕괴하지 않은 원자핵', 30, 30, C.green, 12);
      const p = d.plot({ x: 560, y: 50, w: 310, h: 440, xmin: 0, xmax: 6 * P.T, ymin: 0, ymax: P.N0 * 1.05, title: '남은 개수 N(t)', xl: 't (s)', yl: 'N' });
      p.fn((t) => P.N0 * Math.pow(0.5, t / P.T), C.yellow, 2, 200, [6, 4]);
      for (let k = 1; k <= 5; k++) { p.vl(k * P.T, 'rgba(255,255,255,0.12)', null, 1); p.label('½' + (k > 1 ? PL.sup(k) : ''), k * P.T + 0.05 * P.T, P.N0 * Math.pow(0.5, k) + P.N0 * 0.05, C.dim, 10); }
      p.pts(S.hist, C.green, 2.5);
    },
  });

  const SEMF = (A, Z) => {
    if (A < 1) return 0;
    const N = A - Z, aV = 15.8, aS = 18.3, aC = 0.714, aA = 23.2, aP = 12;
    const pair = A % 2 ? 0 : Z % 2 === 0 ? aP / sqrt(A) : -aP / sqrt(A);
    return { V: aV * A, S: -aS * Math.pow(A, 2 / 3), Cc: (-aC * Z * (Z - 1)) / Math.pow(A, 1 / 3), As: (-aA * (N - Z) ** 2) / A, Pp: pair };
  };
  const Btot = (A, Z) => { const t = SEMF(A, Z); return t.V + t.S + t.Cc + t.As + t.Pp; };
  const Zstab = (A) => Math.round(A / (2 + 0.0154 * Math.pow(A, 2 / 3)));
  add({
    id: 'binding', cat: '핵물리 · 입자물리', name: '핵 결합 에너지 (질량 결손)', en: 'Nuclear Binding Energy — Semi-Empirical Mass Formula',
    tex: ['B = a_VA - a_SA^{2/3} - a_C\\frac{Z(Z-1)}{A^{1/3}} - a_A\\frac{(A-2Z)^2}{A} \\pm \\delta', '\\Delta m\\,c^2 = \\left(Zm_p + Nm_n - m_{\\text{핵}}\\right)c^2 = B'],
    short: 'B = (Zm_p + Nm_n - m)c^2',
    desc: '원자핵의 질량은 구성 양성자와 중성자 질량의 합보다 작으며, 그 차이(질량 결손)에 c²을 곱한 것이 핵을 묶는 결합 에너지이다. 핵을 액체 방울처럼 보는 반경험적 질량 공식은 부피 항(핵력), 표면 항, 양성자끼리의 전기적 반발(쿨롱 항), 양성자-중성자 불균형(비대칭 항), 짝짓기 항으로 결합 에너지를 잘 설명한다. 핵자당 결합 에너지는 철-56 근처에서 최대이므로, 가벼운 핵은 합쳐질 때(핵융합), 무거운 핵은 쪼개질 때(핵분열) 에너지를 낸다.',
    params: [R('A', '질량수 A', '', 2, 260, 1, 56), R('Z', '양성자 수 Z', '', 1, 110, 1, 26), Chk('stab', 'Z를 가장 안정한 값으로 맞추기', false)],
    fix(P, k) { if (P.stab && k !== 'Z') P.Z = max(1, Zstab(P.A)); if (P.Z > P.A) P.Z = P.A; },
    out: (P) => { const B = Btot(P.A, P.Z); return [['결합 에너지 B', B, 'MeV'], ['핵자당 결합 에너지 B/A', B / P.A, 'MeV'], ['질량 결손 B/c²', B / 931.494, 'u'], ['중성자 수 N', P.A - P.Z, ''], ['가장 안정한 Z (같은 A)', Zstab(P.A), ''], ['철-56 (최대 근처) B/A', Btot(56, 26) / 56, 'MeV']]; },
    sub: (P) => `\\frac{B}{A} = \\frac{${ft(Btot(P.A, P.Z))}\\ \\mathrm{MeV}}{${P.A}} = ${ft(Btot(P.A, P.Z) / P.A)}\\ \\mathrm{MeV}`,
    draw(d, S, P) {
      d.clear();
      const p = d.plot({ x: 70, y: 50, w: 480, h: 300, xmin: 0, xmax: 260, ymin: 0, ymax: 10, title: '핵자당 결합 에너지 B/A (가장 안정한 Z)', xl: '질량수 A', yl: 'MeV' });
      p.fn((A) => (A < 4 ? NaN : Btot(Math.round(A), Zstab(Math.round(A))) / Math.round(A)), C.cyan, 2.5, 260, null, 4, 260);
      p.vl(56, 'rgba(255,216,77,0.4)'); p.label('Fe-56', 60, 9.4, C.yellow, 11);
      d.arrow(p.X(10), p.Y(3), p.X(45), p.Y(7.5), C.green, 2.5); p.label('핵융합 →', 12, 2.2, C.green, 12);
      d.arrow(p.X(240), p.Y(5.5), p.X(140), p.Y(7.5), C.orange, 2.5); p.label('← 핵분열', 175, 5.2, C.orange, 12);
      p.dot(P.A, Btot(P.A, P.Z) / P.A, C.red, 6);
      const t = SEMF(P.A, P.Z);
      d.bars(70, 380, 480, 150, [['부피', t.V, C.green], ['표면', t.S, C.orange], ['쿨롱', t.Cc, C.red], ['비대칭', t.As, C.purple], ['짝짓기', t.Pp, C.yellow], ['합계 B', Btot(P.A, P.Z), C.cyan]], max(t.V, 1) * 1.05, '항별 기여 (MeV)');
      const cx = 730, cy = 260, rN = 9 * Math.cbrt(P.A) + 10;
      d.circle(cx, cy, rN + 14, 'rgba(255,255,255,0.03)', 'rgba(160,180,225,0.3)', 1);
      const n = P.A;
      for (let i = 0; i < n && i < 260; i++) {
        const r = rN * sqrt((i + 0.5) / n), a = i * 2.39996;
        d.circle(cx + r * cos(a), cy + r * sin(a), max(3, 7 - Math.cbrt(n) * 0.6), i % max(1, Math.round(n / P.Z)) === 0 && floor(i / max(1, Math.round(n / P.Z))) < P.Z ? C.red : C.blue);
      }
      d.text('양성자 ' + P.Z + ' (빨강) · 중성자 ' + (P.A - P.Z) + ' (파랑)', cx, 470, C.text, 12, 'center');
    },
  });

  const BETA = [[0.782, '자유 중성자 (Q = 0.782 MeV)'], [0.156, '탄소-14 (Q = 0.156 MeV)'], [1.311, '칼륨-40 (Q = 1.311 MeV)'], [2.28, '이트륨-90 (Q = 2.28 MeV)'], [0.0186, '삼중수소 (Q = 18.6 keV)']];
  const bspec = (T, Q) => (T <= 0 || T >= Q ? 0 : sqrt(T * T + 2 * T * 0.511) * (T + 0.511) * (Q - T) ** 2);
  add({
    id: 'beta', cat: '핵물리 · 입자물리', name: '베타 붕괴와 중성미자', en: 'Beta Decay & the Neutrino',
    tex: ['n \\to p + e^- + \\bar\\nu_e', 'N(T) \\propto \\sqrt{T^2 + 2Tm_ec^2}\\,(T + m_ec^2)(Q - T)^2'],
    short: 'n \\to p + e^- + \\bar\\nu_e',
    desc: '베타 붕괴에서 중성자는 양성자로 바뀌며 전자를 내놓는다. 만약 붕괴 생성물이 양성자와 전자 둘뿐이라면 에너지·운동량 보존에 따라 전자는 항상 같은 에너지 Q(빨간 선)를 가져야 한다. 그러나 실제로 측정한 전자 에너지는 0부터 Q까지 연속적으로 퍼져 있었다. 1930년 파울리는 에너지 일부를 가져가는 보이지 않는 중성 입자 — 중성미자 — 를 제안했고, 1956년 실제로 검출되었다. 약한 상호작용이 W 보손을 통해 일으키는 과정이다. 흐린 점선이 보이지 않는 반중성미자이다.',
    params: [Sel('Q', '핵종', BETA, 0.782, { reset: 1 })],
    out(P, S) { let s = 0, w = 0; for (let k = 1; k < 400; k++) { const T = (P.Q * k) / 400, f = bspec(T, P.Q); s += f * T; w += f; } return [['붕괴 에너지 Q', P.Q * 1000, 'keV'], ['전자 평균 운동 에너지 (이론)', (s / w) * 1000, 'keV'], ['평균 에너지 / Q', s / w / P.Q, ''], ['관측한 붕괴 수', S.n, '개'], ['중성미자가 가져간 평균 에너지', (P.Q - s / w) * 1000, 'keV']]; },
    init(S, P) {
      let mx = 0; for (let k = 1; k < 400; k++) mx = max(mx, bspec((P.Q * k) / 400, P.Q));
      S.mx = mx; S.hist = new Float64Array(40); S.n = 0; S.ev = []; S.acc = 0;
    },
    step(S, P, dt) {
      S.acc += dt * 30;
      while (S.acc > 1) {
        S.acc -= 1;
        let T = 0; for (let k = 0; k < 500; k++) { T = Math.random() * P.Q; if (Math.random() * S.mx < bspec(T, P.Q)) break; }
        S.hist[min(39, floor((T / P.Q) * 40))]++; S.n++;
        const a = Math.random() * 2 * PI; S.ev.push({ a, T, s: 0 });
      }
      S.ev.forEach((e) => (e.s += dt));
      S.ev = S.ev.filter((e) => e.s < 1.2);
    },
    draw(d, S, P) {
      d.clear();
      const cx = 200, cy = 260;
      d.ball(cx, cy, 26, C.orange); d.text('원자핵', cx, cy + 44, C.text, 12, 'center');
      S.ev.forEach((e) => {
        const f = e.T / P.Q, re = e.s * (60 + 200 * f), rn = e.s * (60 + 200 * (1 - f));
        d.circle(cx + re * cos(e.a), cy + re * sin(e.a), 3.5, PL.rgba(C.cyan, 1 - e.s / 1.2));
        d.line(cx + (rn - 12) * cos(e.a + PI * 0.8), cy + (rn - 12) * sin(e.a + PI * 0.8), cx + rn * cos(e.a + PI * 0.8), cy + rn * sin(e.a + PI * 0.8), PL.rgba('#ffffff', 0.35 * (1 - e.s / 1.2)), 1.5, [3, 3]);
      });
      d.text('전자 e⁻ (파랑) · 반중성미자 ν̄ (점선, 보이지 않음)', cx, 40, C.text, 12, 'center');
      const tot = max(1, S.n);
      const p = d.plot({ x: 430, y: 50, w: 440, h: 440, xmin: 0, xmax: P.Q * 1.1, ymin: 0, ymax: 1.25, title: '전자 운동 에너지 스펙트럼', xl: 'T (MeV)', yl: '상대 빈도', yticks: false });
      let areaN = 0; for (let k = 1; k < 400; k++) areaN += (bspec((P.Q * k) / 400, P.Q) * P.Q) / 400;
      const scale = 1 / (S.mx / areaN);
      p.clipOn();
      for (let k = 0; k < 40; k++) { const y = (((S.hist[k] / tot) * 40) / P.Q) * scale; d.rect(p.X((k * P.Q) / 40) + 1, p.Y(y), p.X(P.Q / 40) - p.X(0) - 2, p.Y(0) - p.Y(y), 'rgba(56,189,248,0.5)'); }
      d.unclip();
      p.fn((T) => bspec(T, P.Q) / S.mx, C.yellow, 2.5, 300, null, 0, P.Q);
      p.vl(P.Q, C.red, null, 2.5); p.label('2체 붕괴라면: 전자 에너지가 항상 Q', P.Q * 0.98, 1.15, C.red, 11, 'right');
    },
  });

  add({
    id: 'neutrino', cat: '핵물리 · 입자물리', name: '중성미자 진동', en: 'Neutrino Oscillations',
    tex: ['P(\\nu_e\\to\\nu_\\mu) = \\sin^2 2\\theta\\;\\sin^2\\!\\left(\\frac{1.27\\,\\Delta m^2[\\mathrm{eV^2}]\\,L[\\mathrm{km}]}{E[\\mathrm{GeV}]}\\right)'],
    short: 'P = \\sin^22\\theta\\,\\sin^2\\frac{1.27\\Delta m^2L}{E}',
    desc: '중성미자는 전자형, 뮤온형, 타우형의 세 "맛(flavor)"으로 만들어지지만, 질량이 정해진 상태들의 양자 중첩이다. 질량이 서로 조금씩 다르면 날아가는 동안 위상이 어긋나며 맛이 주기적으로 바뀐다(진동). 태양 중성미자 부족 문제와 슈퍼 카미오칸데 실험(1998)으로 확인되었고, 이는 중성미자가 질량을 가진다는 증거로서 표준 모형을 넘어서는 첫 발견이 되었다(2015 노벨상). 공의 색이 각 위치에서 전자형(초록)·뮤온형(파랑)일 확률을 보여 준다.',
    params: [R('th', '혼합각 θ', '°', 0, 45, 0.5, 45), R('dm', '질량 제곱 차 Δm²', 'eV²', 1e-5, 1e-2, 1, 2.5e-3, { log: 1 }), R('E', '에너지 E', 'GeV', 0.01, 10, 1, 0.6, { log: 1 }), R('L', '검출기까지 거리 L', 'km', 1, 13000, 1, 295, { log: 1 })],
    Pm: (P, L) => sin(2 * M.rad(P.th)) ** 2 * sin((1.267 * P.dm * L) / P.E) ** 2,
    out(P) { const pm = this.Pm(P, P.L); return [['P(νₑ → ν_μ)', pm * 100, '%'], ['P(νₑ → νₑ) 생존 확률', (1 - pm) * 100, '%'], ['진동 길이 πE/(1.27Δm²)', (PI * P.E) / (1.267 * P.dm), 'km'], ['참고: T2K (295 km, 0.6 GeV)', '첫 진동 최대 근처', '']]; },
    sub(P) { return `P = \\sin^2(2\\times${ft(P.th)}^\\circ)\\,\\sin^2\\!\\left(\\frac{1.27(${ft(P.dm)})(${ft(P.L)})}{${ft(P.E)}}\\right) = ${ft(this.Pm(P, P.L))}`; },
    init(S) { S.u = 0; },
    step(S, P, dt) { S.u = (S.u + dt / 6) % 1; },
    draw(d, S, P) {
      d.clear();
      const x0 = 80, x1 = 820, y = 130, Lx = P.L * S.u, pm = this.Pm(P, Lx);
      for (let x = x0; x <= x1; x += 3) { const q = this.Pm(P, ((x - x0) / (x1 - x0)) * P.L); d.rect(x, y + 34, 3.2, 12, PL.mix('#4ade80', '#6a8dff', q)); }
      d.text('발생원 (νₑ)', x0, y - 40, C.green, 12, 'center'); d.text('검출기', x1, y - 40, C.text, 12, 'center');
      d.rect(x0 - 20, y - 25, 40, 50, '#3a4668', null, 0, 6); d.rect(x1 - 20, y - 25, 40, 50, '#3a4668', null, 0, 6);
      const X = x0 + S.u * (x1 - x0);
      d.glow(X, y, 26, PL.rgba(pm > 0.5 ? C.blue : C.green, 0.6));
      d.circle(X, y, 12, PL.mix('#4ade80', '#6a8dff', pm), '#fff', 1.5);
      d.text('νₑ ' + fmt((1 - pm) * 100, 3) + '%  ·  ν_μ ' + fmt(pm * 100, 3) + '%', X, y - 26, C.text, 12, 'center');
      d.text('경로를 따른 맛의 확률 (초록 = 전자형, 파랑 = 뮤온형)', 450, y + 66, C.dim, 11, 'center');
      const p = d.plot({ x: 70, y: 250, w: 790, h: 270, xmin: 0, xmax: P.L * 1.2, ymin: 0, ymax: 1.05, title: '거리에 따른 진동 확률 P(νₑ → ν_μ)', xl: 'L (km)', ny: 4 });
      p.fn((L) => this.Pm(P, L), C.blue, 2.2, 800);
      p.fn((L) => 1 - this.Pm(P, L), 'rgba(74,222,128,0.6)', 1.5, 800, [5, 4]);
      p.vl(P.L, C.yellow); p.dot(P.L, this.Pm(P, P.L), C.yellow);
    },
  });

  add({
    id: 'confinement', cat: '핵물리 · 입자물리', name: '쿼크 가둠 (강한 상호작용)', en: 'Quark Confinement — the Strong Force',
    tex: ['V(r) = -\\frac{4}{3}\\frac{\\alpha_s\\hbar c}{r} + \\kappa r\\quad(\\text{코넬 퍼텐셜})', '\\kappa \\approx 0.9\\ \\mathrm{GeV/fm} \\approx 14\\ \\text{톤의 힘}'],
    short: 'V = -\\frac{4\\alpha_s}{3r} + \\kappa r',
    desc: '쿼크 사이의 강한 힘은 거리가 멀어져도 약해지지 않는다. 글루온 장이 전기력선처럼 퍼지지 않고 가는 관(flux tube)으로 모여, 퍼텐셜이 거리에 비례해 계속 커지기 때문이다. 쿼크를 떼어 놓으려 하면 관에 저장된 에너지가 커지다가, 새로운 쿼크-반쿼크 쌍을 만들 만큼 되면 관이 끊어지며 두 개의 중간자가 생긴다. 그래서 쿼크는 결코 홀로 관측되지 않는다(쿼크 가둠). 짧은 거리에서는 쿨롱과 비슷한 1/r 항이 지배한다.',
    params: [R('r', '쿼크 사이 거리 r', 'fm', 0.1, 2, 0.01, 0.6), R('k', '끈 장력 κ', 'GeV/fm', 0.5, 1.5, 0.01, 0.9), Chk('auto', '자동으로 잡아당기기', true)],
    V: (r, k) => (-(4 / 3) * 0.3 * 0.1973) / r + k * r,
    rb: (k) => 1.2 / k + 0.1,
    out(P, S) { const r = S.r || P.r; return [['현재 거리', r, 'fm'], ['퍼텐셜 에너지 V(r)', this.V(r, P.k), 'GeV'], ['끈이 끊어지는 거리 (대략)', this.rb(P.k), 'fm'], ['큰 거리에서 힘 κ', P.k * 1.602e-10 / 1e-15, 'N'], ['무게로 환산', (P.k * 1.602e-10) / 1e-15 / 9.81 / 1000, '톤'], ['상태', r < this.rb(P.k) ? '하나의 중간자 (끈 연결)' : '끈이 끊어져 중간자 두 개', '']]; },
    init(S) { S.u = 0; S.r = 0.3; },
    step(S, P, dt) { S.u = (S.u + dt / 5) % 1; S.r = P.auto ? 0.15 + 1.85 * (S.u < 0.8 ? S.u / 0.8 : 1) : P.r; },
    draw(d, S, P) {
      d.clear();
      const r = S.r, px = 230, cy = 170, cx = 450, half = (r * px) / 2, broken = r >= this.rb(P.k);
      const q = (x, col, lbl) => { d.glow(x, cy, 26, PL.rgba(col, 0.6)); d.ball(x, cy, 13, col); d.text(lbl, x, cy + 30, C.text, 12, 'center'); };
      if (!broken) {
        const w = 26 - min(14, r * 7);
        const g = d.g, gr = g.createLinearGradient(0, cy - w, 0, cy + w); gr.addColorStop(0, 'rgba(255,216,77,0)'); gr.addColorStop(0.5, 'rgba(255,216,77,0.75)'); gr.addColorStop(1, 'rgba(255,216,77,0)');
        g.fillStyle = gr; g.fillRect(cx - half, cy - w, 2 * half, 2 * w);
        for (let k = -2; k <= 2; k++) d.line(cx - half, cy + k * w * 0.3, cx + half, cy + k * w * 0.3, 'rgba(255,240,180,0.5)', 1);
        q(cx - half, C.red, '쿼크'); q(cx + half, C.cyan, '반쿼크');
      } else {
        const gapx = 40;
        [[cx - half, cx - gapx], [cx + gapx, cx + half]].forEach(([a, b]) => { d.rect(a, cy - 10, b - a, 20, 'rgba(255,216,77,0.55)'); });
        q(cx - half, C.red, '쿼크'); q(cx - gapx, C.cyan, '새 반쿼크'); q(cx + gapx, C.red, '새 쿼크'); q(cx + half, C.cyan, '반쿼크');
        d.label('끈이 끊어지며 새 쌍 생성 → 중간자 2개', cx, cy - 60, C.yellow, 13);
      }
      d.text('색깔 끈 (글루온 관) — 전기력선과 달리 퍼지지 않는다', cx, 40, C.dim, 12, 'center');
      const p = d.plot({ x: 70, y: 280, w: 790, h: 240, xmin: 0, xmax: 2.1, ymin: -1.5, ymax: 2.5, title: '퍼텐셜 V(r) — 코넬 퍼텐셜 (GeV)', xl: 'r (fm)', yl: 'GeV' });
      p.fn((x) => (-(4 / 3) * 0.3 * 0.1973) / x, 'rgba(56,189,248,0.6)', 1.5, 300, [5, 4], 0.05, 2.1);
      p.fn((x) => P.k * x, 'rgba(255,159,67,0.6)', 1.5, 2, [5, 4]);
      p.fn((x) => this.V(x, P.k), C.yellow, 2.8, 300, null, 0.05, 2.1);
      p.vl(this.rb(P.k), C.red); p.label('끊어짐', this.rb(P.k) + 0.03, 2.2, C.red, 11);
      p.dot(r, this.V(r, P.k), C.white, 6);
    },
  });

  add({
    id: 'breitwigner', cat: '핵물리 · 입자물리', name: '브라이트-위그너 공명 (Z 보손과 세대 수)', en: 'Breit–Wigner Resonance — the Z Boson',
    tex: ['\\sigma(E) = \\sigma_0\\frac{s\\,\\Gamma^2}{(s - M^2)^2 + s^2\\Gamma^2/M^2},\\qquad s = E^2', '\\tau = \\frac{\\hbar}{\\Gamma},\\qquad \\Gamma_Z = \\Gamma_{\\text{보이는 것}} + N_\\nu\\,\\Gamma_\\nu'],
    short: '\\sigma \\propto \\frac{\\Gamma^2/4}{(E-M)^2 + \\Gamma^2/4}',
    desc: '수명이 짧은 입자는 충돌 에너지가 그 질량에 맞을 때 생성 확률이 급격히 커지는 공명 봉우리로 나타난다. 봉우리의 폭 Γ는 에너지-시간 불확정성에 따라 수명과 반비례한다(Z 보손의 수명은 약 3×10⁻²⁵초). CERN의 LEP 가속기는 Z 보손 봉우리를 정밀하게 측정했는데, 가벼운 중성미자 종류가 하나 늘어날 때마다 Z가 보이지 않게 붕괴하는 통로가 늘어 봉우리가 넓고 낮아진다. 측정 결과(점)는 정확히 N_ν = 3을 가리켰다 — 물질의 세대는 세 개이다.',
    params: [R('N', '가벼운 중성미자 종류 N_ν', '', 2, 4, 1, 3), R('E', '충돌 에너지 √s', 'GeV', 86, 96, 0.01, 91.19)],
    G: (N) => 1.996 + N * 0.1663,
    sig(E, N) { const Mz = 91.1876, G = this.G(N), s = E * E, s0 = 41.54 * (this.G(3) / G) ** 2; return (s0 * s * G * G) / ((s - Mz * Mz) ** 2 + (s * s * G * G) / (Mz * Mz)); },
    out(P) { const G = this.G(P.N); return [['Z 질량', 91.1876, 'GeV'], ['전체 폭 Γ_Z', G, 'GeV'], ['수명 ħ/Γ', (6.582e-25 / G) * 1, 's'], ['봉우리 단면적', this.sig(91.1876, P.N), 'nb'], ['현재 에너지의 단면적', this.sig(P.E, P.N), 'nb']]; },
    sub(P) { return `\\tau = \\frac{\\hbar}{\\Gamma} = \\frac{6.58\\times10^{-25}\\ \\mathrm{GeV\\,s}}{${ft(this.G(P.N))}\\ \\mathrm{GeV}} = ${ft(6.582e-25 / this.G(P.N))}\\ \\mathrm{s}`; },
    draw(d, S, P) {
      d.clear();
      const p = d.plot({ x: 70, y: 50, w: 790, h: 440, xmin: 86, xmax: 96, ymin: 0, ymax: 50, title: 'e⁺e⁻ → 강입자 단면적 (LEP)', xl: '√s (GeV)', yl: 'σ (nb)' });
      [2, 3, 4].forEach((N) => p.fn((E) => this.sig(E, N), N === P.N ? C.yellow : ['', '', C.green, C.cyan, C.pink][N], N === P.N ? 3 : 1.5, 300, N === P.N ? null : [5, 4]));
      p.label('N_ν = 2', 91.9, this.sig(91.19, 2) + 1.5, C.green, 11); p.label('N_ν = 3', 91.9, this.sig(91.19, 3) - 1, C.cyan, 11); p.label('N_ν = 4', 91.9, this.sig(91.19, 4) - 3.5, C.pink, 11);
      const data = [[88.2, -0.3], [89.2, 0.4], [90.2, -0.5], [91.2, 0.2], [92.0, -0.2], [93.0, 0.5], [93.7, -0.4], [94.7, 0.3]];
      data.forEach(([E, e]) => { const y = this.sig(E, 3) * (1 + e * 0.012); p.pts([[E, y - 0.8], [E, y + 0.8]], '#fff', 1.5); p.dot(E, y, '#fff', 3.5); });
      p.vl(P.E, C.red); p.dot(P.E, this.sig(P.E, P.N), C.red, 5);
      d.text('흰 점: 측정값 (모형) — N_ν = 3 곡선과 일치', 90, 520, C.text, 12);
    },
  });

  /* ================================================================ 응집물리학 */
  add({
    id: 'kronig', cat: '응집물리학', name: '블로흐 정리와 에너지 띠 (크로니히-페니 모형)', en: 'Bloch Theorem & Energy Bands (Kronig–Penney)',
    tex: ['\\psi_k(x) = e^{ikx}u_k(x),\\qquad u_k(x + a) = u_k(x)\\quad(\\text{블로흐 정리})', '\\cos ka = \\cos\\alpha a + P\\,\\frac{\\sin\\alpha a}{\\alpha a},\\qquad \\alpha = \\frac{\\sqrt{2mE}}{\\hbar}'],
    short: '\\psi_k = e^{ikx}u_k(x)',
    desc: '결정 속 전자는 원자핵이 만드는 주기적인 퍼텐셜 속을 움직인다. 블로흐 정리에 따르면 이런 전자의 파동 함수는 평면파에 격자 주기를 가진 함수를 곱한 꼴이다. 크로니히-페니 모형(주기적 장벽)을 풀면 오른쪽 식의 우변이 −1과 1 사이일 때만 해가 있으므로, 허용된 에너지가 띠(band) 모양으로 모이고 그 사이에 전자가 가질 수 없는 띠틈(gap)이 생긴다. 장벽 세기 P가 0이면 자유 전자(점선)와 같고, 클수록 띠가 좁고 띠틈이 넓어진다. 띠가 채워진 정도가 도체·반도체·부도체를 가른다.',
    params: [R('P', '장벽 세기 P', '', 0, 10, 0.1, 3)],
    bands(P) {
      const N = 3000, um = 4 * PI, pts = [], bands = [];
      let cur = null;
      for (let i = 1; i <= N; i++) {
        const u = (um * i) / N, f = cos(u) + (P.P * sin(u)) / u;
        if (abs(f) <= 1) { const ka = Math.acos(f); pts.push([ka, u * u]); if (!cur) { cur = [u * u, u * u]; bands.push(cur); } cur[1] = u * u; } else cur = null;
      }
      return { pts, bands };
    },
    out(P, S) { const b = PL.memo(S, 'b', P.P, () => this.bands(P)).bands; const r = []; b.slice(0, 4).forEach((x, i) => r.push(['띠 ' + (i + 1) + ' 에너지 범위', fmt(x[0], 3) + ' ~ ' + fmt(x[1], 3), 'E₀'])); for (let i = 0; i < min(3, b.length - 1); i++) r.push(['띠틈 ' + (i + 1), b[i + 1][0] - b[i][1], 'E₀']); return r; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const B = PL.memo(S, 'b', P.P, () => this.bands(P));
      for (let k = 0; k < 8; k++) { const x = 70 + k * 100; d.rect(x, 40, 14, 40, 'rgba(255,92,108,0.45)'); }
      const pts = []; for (let x = 70; x < 860; x += 2) pts.push([x, 60 + 14 * cos((x - S.t * 60) / 14) * (0.7 + 0.3 * cos(((x - 70) * 2 * PI) / 100))]);
      d.poly(pts, C.cyan, 1.6);
      d.text('주기적 퍼텐셜(빨강)과 블로흐 파동', 70, 28, C.dim, 11);
      const f = (u) => cos(u) + (P.P * sin(u)) / u;
      const p = d.plot({ x: 70, y: 130, w: 360, h: 390, xmin: 0, xmax: 4 * PI, ymin: -3, ymax: 4, title: '우변 f(αa) — |f| ≤ 1 일 때만 허용', xl: 'αa', ny: 4 });
      d.rect(p.x, p.Y(1), p.w, p.Y(-1) - p.Y(1), 'rgba(74,222,128,0.1)');
      p.hl(1, C.green); p.hl(-1, C.green);
      p.fn(f, C.yellow, 2.2, 800, null, 0.01, 4 * PI);
      B.bands.forEach(([e0, e1]) => d.rect(p.X(sqrt(e0)), p.Y(-3) - 8, p.X(sqrt(e1)) - p.X(sqrt(e0)), 8, C.green));
      const Em = 16 * PI * PI;
      const q = d.plot({ x: 500, y: 130, w: 370, h: 390, xmin: -PI, xmax: PI, ymin: 0, ymax: Em, title: '띠 구조 E(k) (축소 영역)', xl: 'ka', yl: 'E / E₀', nx: 4 });
      for (let n = -3; n <= 3; n++) q.fn((ka) => (ka + 2 * PI * n) ** 2, 'rgba(160,175,210,0.3)', 1, 200, [4, 4]);
      B.bands.forEach(([e0, e1], i) => { if (i < B.bands.length - 1) d.rect(q.x, q.Y(B.bands[i + 1][0]), q.w, q.Y(e1) - q.Y(B.bands[i + 1][0]), 'rgba(255,92,108,0.12)'); });
      const g = d.g; g.fillStyle = C.cyan;
      B.pts.forEach(([ka, E]) => { g.fillRect(q.X(ka) - 1, q.Y(E) - 1, 2.2, 2.2); g.fillRect(q.X(-ka) - 1, q.Y(E) - 1, 2.2, 2.2); });
      if (B.bands.length > 1) q.label('띠틈', -0.4, (B.bands[0][1] + B.bands[1][0]) / 2, C.red, 11);
    },
  });

  const phon = (k, r) => {
    if (r === 1) return [2 * abs(sin(k / 2))];
    const m1 = 1, m2 = r, s = 1 / m1 + 1 / m2, D = sqrt(max(0, s * s - (4 * sin(k / 2) ** 2) / (m1 * m2)));
    return [sqrt(max(0, s - D)), sqrt(s + D)];
  };
  add({
    id: 'phonon', cat: '응집물리학', name: '격자 진동과 포논 (분산 관계)', en: 'Lattice Vibrations & Phonons',
    tex: ['\\omega(k) = 2\\sqrt{\\frac{K}{m}}\\left|\\sin\\frac{ka}{2}\\right|\\quad(\\text{단원자 사슬})', '\\omega^2 = K\\left(\\frac{1}{m_1} + \\frac{1}{m_2}\\right) \\pm K\\sqrt{\\left(\\frac{1}{m_1} + \\frac{1}{m_2}\\right)^2 - \\frac{4\\sin^2(ka/2)}{m_1m_2}}'],
    short: '\\omega = 2\\sqrt{K/m}\\,|\\sin(ka/2)|',
    desc: '결정 속 원자들은 용수철로 연결된 공처럼 집단으로 진동하며, 이 진동이 양자화된 것이 포논이다. 파장이 길면(k → 0) 소리처럼 진동수가 파수에 비례하지만(음향 가지), 파장이 원자 간격의 두 배에 가까워지면(브릴루앙 영역 경계) 휘어진다. 질량이 다른 두 종류의 원자가 번갈아 있으면 이웃 원자가 서로 반대로 움직이는 광학 가지가 생기고 그 사이에 틈이 열린다. 포논은 고체의 열전도, 비열, 초전도의 원인이다. (변위는 보기 쉽게 세로로 표시)',
    params: [R('k', '파수 k', '1/a', -3.14, 3.14, 0.01, 1), R('r', '질량비 m₂/m₁ (1 = 단원자)', '', 1, 4, 0.1, 1), Sel('br', '가지 (질량비 > 1일 때)', [[0, '음향 가지 (같은 방향)'], [1, '광학 가지 (반대 방향)']], 0)],
    out(P) {
      const ws = phon(P.k, P.r), w = ws[min(P.br, ws.length - 1)], h = 1e-4, w2 = phon(P.k + h, P.r)[min(P.br, ws.length - 1)];
      return [['각진동수 ω (√(K/m₁) 단위)', w, ''], ['위상 속도 ω/k', P.k ? w / abs(P.k) : '—', ''], ['군속도 dω/dk', (w2 - w) / h, ''], ['장파장 음속 (k→0)', P.r === 1 ? 1 : sqrt(1 / (2 * (1 + P.r))), 'a√(K/m₁)'], ['영역 경계의 틈', P.r > 1 ? phon(PI, P.r)[1] - phon(PI, P.r)[0] : 0, '']];
    },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const ws = phon(P.k, P.r), bi = min(P.br, ws.length - 1), w = ws[bi], t = S.t * 1.5, n = 24, sp = 34, x0 = 60, y0 = 150;
      let A2 = [1, 0];
      if (P.r > 1) { const m1 = 1, m2 = P.r, num = 2 - m1 * w * w, den = [1 + cos(P.k), -sin(P.k)], dd = den[0] ** 2 + den[1] ** 2 || 1e-9; A2 = [(num * den[0]) / dd, (-num * den[1]) / dd]; const mag = hypot(A2[0], A2[1]); if (mag > 1.5) A2 = [A2[0] / mag * 1.5, A2[1] / mag * 1.5]; }
      const pos = [];
      for (let j = 0; j < n; j++) {
        let u;
        if (P.r === 1) u = cos(P.k * j - w * t);
        else { const cell = floor(j / 2), ph = P.k * cell - w * t; u = j % 2 === 0 ? cos(ph) : A2[0] * cos(ph) - A2[1] * sin(ph); }
        pos.push([x0 + j * sp, y0 - u * 40]);
      }
      for (let j = 0; j < n - 1; j++) d.spring(pos[j][0], pos[j][1], pos[j + 1][0], pos[j + 1][1], 4, 4, 'rgba(160,175,210,0.5)', 1.2);
      pos.forEach(([x, y], j) => d.ball(x, y, P.r > 1 && j % 2 ? 8 + 3 * Math.cbrt(P.r) : 8, P.r > 1 && j % 2 ? C.pink : C.cyan));
      d.text(P.r > 1 ? (bi ? '광학 가지: 이웃 원자가 반대로 움직임' : '음향 가지: 이웃 원자가 함께 움직임') : '단원자 사슬', 60, 40, C.text, 13);
      const wm = P.r === 1 ? 2.2 : phon(0, P.r)[1] * 1.1;
      const p = d.plot({ x: 70, y: 260, w: 790, h: 260, xmin: -PI, xmax: PI, ymin: 0, ymax: wm, title: '분산 관계 ω(k) — 첫 번째 브릴루앙 영역', xl: 'ka', yl: 'ω' });
      p.fn((k) => phon(k, P.r)[0], C.cyan, 2.5);
      if (P.r > 1) p.fn((k) => phon(k, P.r)[1], C.pink, 2.5);
      p.dot(P.k, w, C.yellow, 6);
      p.fn((k) => abs(k) * (P.r === 1 ? 1 : sqrt(1 / (2 * (1 + P.r)))), 'rgba(255,216,77,0.4)', 1, 2, [5, 4], -1, 1);
    },
  });

  add({
    id: 'drude', cat: '응집물리학', name: '드루드 모형 (금속의 전기 전도)', en: 'Drude Model of Electrical Conduction',
    tex: ['\\sigma = \\frac{ne^2\\tau}{m},\\qquad \\vec J = \\sigma\\vec E', 'v_d = \\frac{eE\\tau}{m},\\qquad \\mu = \\frac{e\\tau}{m}'],
    short: '\\sigma = \\frac{ne^2\\tau}{m}',
    desc: '금속 속 자유 전자들은 매우 빠르게(약 10⁶ m/s) 무작위로 움직이며 평균 τ마다 격자와 충돌한다. 전기장을 걸면 충돌 사이사이에 조금씩 가속되어 전체적으로 아주 느린 표류 속도(초당 수 mm 이하)로 흘러가고, 이것이 전류이다. 충돌 시간 τ가 길수록 전기 전도도가 커지며, 온도가 오르면 격자 진동이 커져 τ가 짧아지므로 금속의 저항이 커진다. 시뮬레이션의 표류 속도는 보기 쉽게 크게 과장했다(노란 화살표 = 평균 속도).',
    params: [R('E', '전기장 E', 'V/m', 0, 10, 0.1, 4), R('tau', '평균 충돌 시간 τ', 'fs', 2, 50, 0.5, 25), R('n', '자유 전자 밀도 n', '×10²⁸ m⁻³', 1, 20, 0.1, 8.5)],
    out: (P, S) => { const tau = P.tau * 1e-15, n = P.n * 1e28, sg = (n * K.e * K.e * tau) / K.me; return [['전기 전도도 σ', sg, 'S/m'], ['비저항 ρ = 1/σ', 1 / sg, 'Ω·m'], ['표류 속도 v_d (실제)', (K.e * P.E * tau) / K.me, 'm/s'], ['전류 밀도 J = σE', sg * P.E, 'A/m²'], ['이동도 μ = eτ/m', (K.e * tau) / K.me, 'm²/(V·s)'], ['평균 자유 행로 (v_F = 1.57×10⁶ m/s)', 1.57e6 * tau * 1e9, 'nm']]; },
    sub: (P) => { const tau = P.tau * 1e-15, n = P.n * 1e28; return `\\sigma = \\frac{(${ft(n)})(1.60\\times10^{-19})^2(${ft(tau)})}{9.11\\times10^{-31}} = ${ft((n * K.e * K.e * tau) / K.me)}\\ \\mathrm{S/m}`; },
    init(S) { S.e = Array.from({ length: 70 }, () => { const a = Math.random() * 2 * PI; return { x: 60 + Math.random() * 780, y: 70 + Math.random() * 280, vx: 150 * cos(a), vy: 150 * sin(a), tr: [] }; }); S.avg = 0; },
    step(S, P, dt) {
      const td = (P.tau / 25) * 0.5, acc = -35 * P.E;
      let sum = 0;
      S.e.forEach((e, i) => {
        e.vx += acc * dt;
        if (Math.random() < dt / td) { const a = Math.random() * 2 * PI; e.vx = 150 * cos(a); e.vy = 150 * sin(a); }
        e.x += e.vx * dt; e.y += e.vy * dt;
        if (e.x < 60) e.x += 780; if (e.x > 840) e.x -= 780;
        if (e.y < 70) { e.y = 140 - e.y; e.vy = abs(e.vy); } if (e.y > 350) { e.y = 700 - e.y; e.vy = -abs(e.vy); }
        if (i < 3) { e.tr.push([e.x, e.y]); if (e.tr.length > 140) e.tr.shift(); }
        sum += e.vx;
      });
      S.avg = S.avg * 0.97 + (sum / S.e.length) * 0.03;
    },
    draw(d, S, P) {
      d.clear();
      d.rect(50, 60, 800, 300, 'rgba(255,255,255,0.02)', '#7f8db0', 2, 6);
      for (let y = 90; y < 350; y += 45) for (let x = 85; x < 840; x += 55) d.circle(x, y, 7, 'rgba(255,159,67,0.35)', 'rgba(255,159,67,0.6)', 1);
      S.e.forEach((e, i) => { if (i < 3) { for (let k = 1; k < e.tr.length; k++) { const a = e.tr[k - 1], b = e.tr[k]; if (abs(a[0] - b[0]) < 100) d.line(a[0], a[1], b[0], b[1], PL.rgba(C.cyan, 0.4), 1); } } d.circle(e.x, e.y, 3, i < 3 ? '#fff' : C.cyan); });
      if (P.E > 0) { d.arrow(700, 40, 820, 40, C.red, 3); d.text('전기장 E →', 690, 40, C.red, 12, 'right'); }
      d.arrow(450, 395, 450 + S.avg * 1.5, 395, C.yellow, 4);
      d.text('평균 속도 (표류): ' + (S.avg < -1 ? '← 전자는 전기장 반대 방향' : '거의 0'), 450, 420, C.yellow, 12, 'center');
      d.text('주황 = 격자 이온, 파랑 = 자유 전자 (흰 점 3개는 궤적 표시)', 50, 460, C.dim, 12);
      const tau = P.tau * 1e-15, sg = (P.n * 1e28 * K.e * K.e * tau) / K.me;
      const p = d.plot({ x: 560, y: 450, w: 300, h: 80, xmin: 0, xmax: 10, ymin: 0, ymax: sg * 11, title: '옴의 법칙 J = σE', xl: 'E (V/m)', yl: 'A/m²', ny: 2 });
      p.fn((E) => sg * E, C.yellow, 2); p.dot(P.E, sg * P.E, C.yellow);
    },
  });

  const MATS = [[8.5e28, '구리 (n = 8.5×10²⁸ m⁻³)'], [5.9e28, '은 (5.9×10²⁸)'], [1e25, '비스무트 (반금속, ~10²⁵)'], [1e22, 'n형 실리콘 (도핑, ~10²²)']];
  add({
    id: 'hall', cat: '응집물리학', name: '홀 효과와 양자 홀 효과', en: 'Hall Effect & Quantum Hall Effect',
    tex: ['V_H = \\frac{IB}{nqt},\\qquad R_H = \\frac{1}{nq}', 'R_{xy} = \\frac{h}{\\nu e^2}\\quad(\\nu = 1, 2, 3, \\dots\\ \\text{양자 홀 효과})'],
    short: 'V_H = \\frac{IB}{nqt}',
    desc: '전류가 흐르는 도체에 수직으로 자기장을 걸면, 움직이는 전하 운반자가 로런츠 힘을 받아 한쪽 가장자리로 몰리고 양 옆에 전압(홀 전압)이 생긴다. 홀 전압의 부호로 운반자가 전자인지 정공인지 알 수 있고, 크기로 운반자 밀도를 잴 수 있다. 운반자가 적은 반도체에서 훨씬 크게 나타나 자기장 센서로 쓰인다. 아주 낮은 온도의 2차원 전자계에서는 홀 저항이 h/(νe²)의 정확한 값에서 계단처럼 멈추는 양자 홀 효과가 나타난다(1985, 2016 노벨상) — 저항의 국제 표준이다.',
    params: [R('B', '자기장 B (⊗, 화면 안쪽)', 'T', 0, 2, 0.01, 1), R('I', '전류 I', 'A', 0, 10, 0.1, 2), Sel('n', '물질', MATS, 1e22), Sel('q', '전하 운반자', [[-1, '전자 (음전하)'], [1, '정공 (양전하)']], -1, { reset: 1 }), R('t', '시료 두께 t', 'mm', 0.01, 1, 0.01, 0.1)],
    out: (P) => { const VH = (P.I * P.B) / (P.n * K.e * P.t * 1e-3); return [['홀 전압 V_H', VH, 'V'], ['홀 계수 R_H = 1/nq', P.q / (P.n * K.e), 'm³/C'], ['위쪽 가장자리의 전하', P.B * P.I === 0 ? '없음' : P.q < 0 ? '음 (−)' : '양 (+)', ''], ['폰 클리칭 상수 h/e²', 25812.807, 'Ω']]; },
    sub: (P) => `V_H = \\frac{(${ft(P.I)})(${ft(P.B)})}{(${ft(P.n)})(1.60\\times10^{-19})(${ft(P.t * 1e-3)})} = ${ft((P.I * P.B) / (P.n * K.e * P.t * 1e-3))}\\ \\mathrm{V}`,
    init(S) { S.c = Array.from({ length: 50 }, () => ({ x: 120 + Math.random() * 520, y: 120 + Math.random() * 180 })); S.acc = 0; },
    step(S, P, dt) {
      const dir = P.q > 0 ? 1 : -1, sp = 30 + 20 * P.I, defl = P.B * (P.I > 0 ? 1 : 0);
      S.acc += (defl - S.acc) * dt * 2;
      S.c.forEach((c) => { c.x += dir * sp * dt; c.y -= S.acc * 60 * dt * (c.y > 128 ? 1 : 0); if (c.x > 640) c.x -= 520; if (c.x < 120) c.x += 520; if (c.y < 125) c.y = 125 + Math.random() * 6; if (Math.random() < dt * 0.6) c.y = 125 + Math.random() * 175; });
    },
    draw(d, S, P) {
      d.clear();
      d.rect(110, 110, 540, 200, 'rgba(120,140,200,0.12)', '#cfd8ee', 2, 4);
      if (P.B > 0) for (let y = 135; y < 300; y += 40) for (let x = 135; x < 650; x += 50) d.perp(x, y, 6, false, `rgba(200,210,235,${0.15 + 0.25 * P.B})`, 1.2);
      S.c.forEach((c) => d.circle(c.x, c.y, 4, P.q < 0 ? C.cyan : C.pink));
      const nq = Math.round(M.clamp(S.acc * 10, 0, 18)), up = P.q < 0 ? '−' : '+', dn = P.q < 0 ? '+' : '−';
      for (let i = 0; i < nq; i++) { d.text(up, 130 + i * 28, 98, P.q < 0 ? C.cyan : C.red, 15, 'center', 'middle', true); d.text(dn, 130 + i * 28, 324, P.q < 0 ? C.red : C.cyan, 15, 'center', 'middle', true); }
      d.arrow(60, 210, 105, 210, C.yellow, 3); d.text('I', 60, 194, C.yellow, 13);
      d.text('B ⊗ (화면 안쪽)', 650, 90, C.dim, 12, 'right');
      d.line(380, 110, 380, 70, '#cfd8ee', 1.5); d.line(380, 310, 380, 350, '#cfd8ee', 1.5);
      d.rect(330, 350, 100, 34, '#1b2440', '#cfd8ee', 1.5, 6);
      d.text('V_H = ' + fmt((P.I * P.B) / (P.n * K.e * P.t * 1e-3), 3) + ' V', 380, 367, C.yellow, 12, 'center', 'middle', true);
      const ns = 3e15, Rcl = (B) => B / (ns * K.e) / 1000;
      const Rq = (B) => { if (B <= 0) return 0; const nu = (ns * K.h) / (K.e * B), r = Math.round(nu); return r >= 1 && abs(nu - r) < 0.3 ? 25.8128 / r : Rcl(B); };
      const p = d.plot({ x: 690, y: 60, w: 180, h: 330, xmin: 0, xmax: 15, ymin: 0, ymax: 30, title: '양자 홀 효과 (2차원)', xl: 'B (T)', yl: 'R_xy (kΩ)', nx: 3 });
      p.fn(Rcl, 'rgba(255,255,255,0.4)', 1.2, 2, [5, 4]);
      p.fn(Rq, C.green, 2.2, 600);
      [1, 2, 3, 4].forEach((v) => p.label('ν=' + v, 0.3, 25.8128 / v + 0.9, C.dim, 9));
      d.text('계단 높이 = h/(νe²)', 690, 420, C.green, 11);
    },
  });

  const SEMIS = [[0.66, '저마늄 Ge (0.66 eV)'], [1.12, '실리콘 Si (1.12 eV)'], [1.42, '갈륨비소 GaAs (1.42 eV)'], [3.4, '질화갈륨 GaN (3.4 eV)'], [5.47, '다이아몬드 (5.47 eV, 부도체)']];
  const ni = (Eg, T) => 1.7e19 * Math.pow(T / 300, 1.5) * exp(-Eg / (2 * kB_eV * T));
  add({
    id: 'semiconductor', cat: '응집물리학', name: '반도체와 띠틈 (도체·반도체·부도체)', en: 'Semiconductors & the Band Gap',
    tex: ['n_i = \\sqrt{N_cN_v}\\;e^{-E_g/2k_BT}', 'f(E) = \\frac{1}{e^{(E - E_F)/k_BT} + 1},\\qquad \\lambda_{\\text{LED}} \\approx \\frac{hc}{E_g}'],
    short: 'n_i \\propto e^{-E_g/2k_BT}',
    desc: '고체의 에너지 띠 중 전자로 가득 찬 원자가 띠와 비어 있는 전도 띠 사이에 띠틈 E_g가 있다. 도체는 띠틈이 없고, 반도체는 띠틈이 작아(약 1 eV) 열에너지로 일부 전자가 전도 띠로 올라가 전류를 나르며 빈자리(정공)도 양전하처럼 움직인다. 띠틈이 크면 부도체이다. 들뜬 전자 수는 e^{−E_g/2kT}에 비례해 온도에 매우 민감하므로, 반도체는 금속과 반대로 온도가 오르면 저항이 줄어든다. LED는 전자가 띠틈을 건너 떨어질 때 그 에너지에 해당하는 색의 빛을 낸다.',
    params: [Sel('Eg', '물질', SEMIS, 1.12), R('T', '온도 T', 'K', 100, 800, 5, 300)],
    out: (P) => { const n = ni(P.Eg, P.T); return [['진성 운반자 농도 n_i', n, 'cm⁻³'], ['원자 수(5×10²²) 대비', n / 5e22, ''], ['k_BT', kB_eV * P.T * 1000, 'meV'], ['E_g / k_BT', P.Eg / (kB_eV * P.T), ''], ['띠틈에 해당하는 빛', HCL(P.Eg), 'nm'], ['빛의 영역', PL.wlName(1239.84 / P.Eg), '']]; },
    sub: (P) => `n_i = 1.7\\times10^{19}\\left(\\frac{${ft(P.T)}}{300}\\right)^{3/2}e^{-${ft(P.Eg)}/(2\\times${ft(kB_eV * P.T)})} = ${ft(ni(P.Eg, P.T))}\\ \\mathrm{cm^{-3}}`,
    init(S) { S.ex = []; S.acc = 0; },
    step(S, P, dt) {
      const lg = Math.log10(ni(P.Eg, P.T) + 1), target = M.clamp(Math.round((lg - 2) * 2.2), 0, 40);
      while (S.ex.length < target) S.ex.push({ x: 90 + Math.random() * 400, t: Math.random() * 6 });
      while (S.ex.length > target) S.ex.pop();
      S.ex.forEach((e) => { e.t += dt; e.x += sin(e.t * 2 + e.x) * 20 * dt; });
    },
    draw(d, S, P) {
      d.clear();
      const top = 70, cbB = 230, gapPx = M.clamp(P.Eg * 38, 20, 220), vbT = cbB + gapPx;
      d.rect(80, top, 420, cbB - top, 'rgba(56,189,248,0.12)', C.cyan, 1.5, 6);
      d.rect(80, vbT, 420, 520 - vbT, 'rgba(244,114,182,0.25)', C.pink, 1.5, 6);
      d.text('전도 띠 (거의 빔)', 90, top + 16, C.cyan, 12); d.text('원자가 띠 (가득 참)', 90, 508, C.pink, 12);
      for (let i = 0; i < 160; i++) { const x = 90 + (i % 40) * 10, y = vbT + 10 + floor(i / 40) * 12; if (y < 500) d.circle(x, y, 2.4, 'rgba(244,114,182,0.7)'); }
      S.ex.forEach((e, i) => { d.circle(e.x, cbB - 10 - (i % 4) * 12, 3.6, C.cyan, '#fff', 1); d.circle(e.x + 4, vbT + 10, 4, '#0a1020', C.white, 1.5); });
      d.line(80, (cbB + vbT) / 2, 500, (cbB + vbT) / 2, 'rgba(255,216,77,0.6)', 1, [5, 4]); d.text('E_F', 506, (cbB + vbT) / 2, C.yellow, 12);
      d.arrow(470, vbT - 2, 470, cbB + 2, C.text, 1.5); d.text('E_g = ' + P.Eg + ' eV', 462, (cbB + vbT) / 2 - 14, C.text, 12, 'right');
      d.text('흰 테두리 원 = 정공', 90, 550, C.dim, 11);
      const p = d.plot({ x: 580, y: 60, w: 290, h: 220, xmin: 100, xmax: 800, ymin: 1, ymax: 1e20, ylog: true, title: '진성 운반자 농도 n_i(T)', xl: 'T (K)', yl: 'cm⁻³' });
      SEMIS.forEach(([Eg]) => p.fn((T) => ni(Eg, T), Eg === P.Eg ? C.cyan : 'rgba(160,175,210,0.3)', Eg === P.Eg ? 2.5 : 1));
      p.dot(P.T, max(1, ni(P.Eg, P.T)), C.cyan);
      const q = d.plot({ x: 580, y: 340, w: 290, h: 180, xmin: -2, xmax: 2, ymin: 0, ymax: 1.05, title: '페르미-디랙 분포 f(E)', xl: 'E − E_F (eV)', ny: 2 });
      q.fn((E) => 1 / (exp(E / (kB_eV * P.T)) + 1), C.yellow, 2.5);
      q.vl(P.Eg / 2, C.cyan); q.vl(-P.Eg / 2, C.pink);
    },
  });
  function HCL(Eg) { return 1239.84 / Eg; }

  add({
    id: 'superconductor', cat: '응집물리학', name: '초전도와 마이스너 효과', en: 'Superconductivity & the Meissner Effect',
    tex: ['R = 0\\ \\ (T < T_c),\\qquad \\vec B_{\\text{내부}} = 0\\ \\ (\\text{마이스너 효과})', '\\Delta(0) = 1.764\\,k_BT_c\\ (\\text{BCS}),\\qquad B_c(T) = B_c(0)\\left[1 - \\left(\\frac{T}{T_c}\\right)^2\\right]'],
    short: 'R = 0,\\ B_{\\text{in}} = 0',
    desc: '어떤 물질은 임계 온도 T_c 아래로 식히면 전기 저항이 정확히 0이 되고, 내부의 자기장을 밀어낸다(마이스너 효과 — 자석이 위에 뜨는 이유). BCS 이론에 따르면 격자 진동(포논)을 매개로 전자 두 개가 쿠퍼 쌍을 이루고, 이 쌍들이 하나의 거대한 양자 상태로 응축해 에너지 틈 Δ가 생기므로 산란 없이 흐른다. 자기장이 임계 자기장 B_c(T)보다 세지면 초전도가 깨진다. MRI 자석, 자기 부상 열차, 양자 컴퓨터에 쓰인다.',
    params: [R('T', '온도 T', 'K', 0, 20, 0.1, 4), R('Tc', '임계 온도 T_c (나이오븀 9.2 K)', 'K', 1, 18, 0.1, 9.2), R('B', '외부 자기장 B / B_c(0)', '', 0, 1.2, 0.01, 0.4)],
    sc(P) { const Bc = P.T < P.Tc ? 1 - (P.T / P.Tc) ** 2 : 0; return { Bc, on: P.T < P.Tc && P.B < Bc }; },
    out(P) { const s = this.sc(P), gap = P.T < P.Tc ? Math.tanh(1.74 * sqrt(P.Tc / max(P.T, 1e-3) - 1)) : 0; return [['상태', s.on ? '초전도 (R = 0, 자기장 배제)' : '정상 상태', ''], ['임계 자기장 B_c(T) / B_c(0)', s.Bc, ''], ['BCS 에너지 틈 Δ(0) = 1.764 k_BT_c', 1.764 * kB_eV * P.Tc * 1000, 'meV'], ['현재 Δ(T)/Δ(0)', gap, ''], ['참고 T_c', '알루미늄 1.2 K · 납 7.2 K · MgB₂ 39 K · YBCO 93 K', '']]; },
    init(S) { S.chi = 0; },
    step(S, P, dt) { const s = this.sc(P); S.chi += ((s.on ? 1 : 0) - S.chi) * min(1, dt * 3); S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const cx = 260, cy = 280, Rr = 90, nx = 100, ny = 100, st = 5.2, g = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = (i * st - cx), y = (cy - j * st), r2 = x * x + y * y;
        g[j * nx + i] = r2 > Rr * Rr ? y * (1 - (S.chi * Rr * Rr) / r2) : y * (1 - S.chi);
      }
      d.circle(cx, cy, Rr, PL.rgba(S.chi > 0.5 ? C.cyan : '#8d99b5', 0.25), '#cfd8ee', 2);
      for (let k = -9; k <= 9; k++) d.contour(PL.contour(g, nx, ny, k * 28 + 0.5), 0, 0, st, st, 'rgba(255,216,77,0.75)', 1.4);
      d.text(S.chi > 0.5 ? '초전도: 자기장이 밀려남' : '정상 상태: 자기장이 통과', cx, 30, S.chi > 0.5 ? C.cyan : C.text, 14, 'center', 'middle', true);
      d.text('노란 선 = 자기력선', cx, 530, C.dim, 11, 'center');
      const s = this.sc(P);
      const p = d.plot({ x: 580, y: 50, w: 290, h: 130, xmin: 0, xmax: 20, ymin: 0, ymax: 1.2, title: '저항 R(T)', xl: 'T (K)', ny: 2 });
      const Tcb = P.Tc * sqrt(max(0, 1 - P.B));
      p.fn((T) => (T < Tcb ? 0 : 0.6 + 0.02 * T), C.orange, 2.5, 400); p.dot(P.T, P.T < Tcb ? 0 : 0.6 + 0.02 * P.T, C.orange);
      const q = d.plot({ x: 580, y: 230, w: 290, h: 130, xmin: 0, xmax: 20, ymin: 0, ymax: 1.1, title: 'BCS 에너지 틈 Δ(T)/Δ(0)', xl: 'T (K)', ny: 2 });
      q.fn((T) => (T < P.Tc ? Math.tanh(1.74 * sqrt(P.Tc / max(T, 1e-3) - 1)) : 0), C.purple, 2.5, 300);
      const r = d.plot({ x: 580, y: 410, w: 290, h: 110, xmin: 0, xmax: 20, ymin: 0, ymax: 1.25, title: '상태 도표 B_c(T)', xl: 'T (K)', ny: 2 });
      r.area((T) => (T < P.Tc ? 1 - (T / P.Tc) ** 2 : 0), 'rgba(56,189,248,0.25)');
      r.fn((T) => (T < P.Tc ? 1 - (T / P.Tc) ** 2 : 0), C.cyan, 2);
      r.dot(P.T, P.B, s.on ? C.cyan : C.red, 5);
    },
  });

  add({
    id: 'bec', cat: '응집물리학', name: '보스-아인슈타인 응축', en: 'Bose–Einstein Condensation',
    tex: ['\\frac{N_0}{N} = 1 - \\left(\\frac{T}{T_c}\\right)^3\\quad(\\text{조화 덫})', 'k_BT_c \\approx 0.94\\,\\hbar\\bar\\omega\\,N^{1/3}'],
    short: 'N_0/N = 1 - (T/T_c)^3',
    desc: '보손 입자들은 한 양자 상태에 몇 개든 들어갈 수 있다. 원자 기체를 수백 나노켈빈까지 냉각하면 원자의 드브로이 파장이 원자 간격보다 길어지며 겹치고, 임계 온도 아래에서 수많은 원자가 갑자기 가장 낮은 에너지 상태 하나로 몰려 하나의 거대한 물질파처럼 행동한다. 1995년 루비듐 원자로 처음 만들어졌다(2001 노벨상). 그림은 원자 구름의 밀도로, 넓은 열적 구름 가운데 뾰족한 응축 봉우리가 솟아오른다. 초유체 헬륨도 비슷한 현상이다.',
    hint: '캔버스를 드래그해 시점을 바꿀 수 있습니다.',
    params: [R('T', '온도 T / T_c', '', 0, 1.5, 0.01, 0.6)],
    out: (P) => { const f = P.T < 1 ? 1 - P.T ** 3 : 0; return [['응축된 원자 비율 N₀/N', f * 100, '%'], ['상태', P.T < 1 ? '보스-아인슈타인 응축' : '보통 기체', ''], ['예: 루비듐-87 원자 10⁶개 (ω = 2π·100 Hz)의 T_c', 4.5e-7, 'K'], ['이 예에서 현재 온도', P.T * 4.5e-7 * 1e9, 'nK']]; },
    sub: (P) => `\\frac{N_0}{N} = 1 - (${ft(P.T)})^3 = ${ft(P.T < 1 ? 1 - P.T ** 3 : 0)}`,
    init(S) { S.yaw = 0.5; S.pitch = 0.6; },
    pointer(type, x, y, S) { return PL.dragRotate(type, x, y, S); },
    step(S, P, dt) { if (!S._drag) S.yaw += dt * 0.15; },
    draw(d, S, P) {
      d.clear(false, '#03050b');
      const cam = PL.cam(S.yaw, S.pitch, 120, 330, 380), f0 = P.T < 1 ? 1 - P.T ** 3 : 0, sth = 0.35 + 0.65 * sqrt(max(P.T, 0.05)), s0 = 0.16;
      const z = (x, y) => { const r2 = x * x + y * y, th = ((1 - f0) / (sth * sth)) * exp(-r2 / (sth * sth)), c = (f0 / (s0 * s0)) * exp(-r2 / (s0 * s0)); return sqrt(th + c) * 0.45; };
      const n = 36, L = 1.8, zmax = max(z(0, 0), 1e-6), NB = 20, buckets = Array.from({ length: NB }, () => []);
      for (let j = 0; j <= n; j++) {
        const row = [], col = [];
        for (let i = 0; i <= n; i++) { const x = -L + (2 * L * i) / n, y = -L + (2 * L * j) / n; row.push([...cam(x, y, z(x, y)), z(x, y)]); const x2 = -L + (2 * L * j) / n, y2 = -L + (2 * L * i) / n; col.push([...cam(x2, y2, z(x2, y2)), z(x2, y2)]); }
        [row, col].forEach((line) => { for (let k = 1; k < line.length; k++) buckets[min(NB - 1, Math.round((line[k][3] / zmax) * (NB - 1)))].push(line[k - 1], line[k]); });
      }
      const g = d.g;
      g.lineWidth = 1.1;
      buckets.forEach((segs, k) => {
        if (!segs.length) return;
        g.strokeStyle = PL.rgb(PL.cmap.inferno(0.15 + (0.85 * k) / (NB - 1)), 0.9);
        g.beginPath();
        for (let s = 0; s < segs.length; s += 2) { g.moveTo(segs[s][0], segs[s][1]); g.lineTo(segs[s + 1][0], segs[s + 1][1]); }
        g.stroke();
      });
      d.text(P.T < 1 ? '가운데 뾰족한 봉우리 = 응축체' : 'T > T_c: 넓은 열적 구름만', 330, 30, C.text, 13, 'center');
      const p = d.plot({ x: 640, y: 60, w: 230, h: 220, xmin: 0, xmax: 1.5, ymin: 0, ymax: 1.05, title: '응축 비율 N₀/N', xl: 'T / T_c', ny: 2 });
      p.fn((T) => (T < 1 ? 1 - T ** 3 : 0), C.cyan, 2.5); p.dot(P.T, f0, C.cyan);
    },
  });
})();
