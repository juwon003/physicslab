/* =====================================================================
 * 양자역학 — 양자론의 기원 · 파동역학 · 원자 · 스핀과 양자 정보
 * ===================================================================== */
(function () {
  'use strict';
  const { C, M, K, R, Sel, Chk } = PL;
  const fmt = PL.fmt, ft = PL.ftex;
  const { sin, cos, sqrt, abs, min, max, PI, exp, log, hypot, floor, atan2 } = Math;
  const add = (law) => PL.add('quantum', law);
  const HC = 1239.84; // eV·nm

  /* ================================================================ 양자론의 기원 */
  const planck = (lam, T) => (2 * K.h * K.c * K.c) / Math.pow(lam, 5) / (exp((K.h * K.c) / (lam * K.kB * T)) - 1);
  add({
    id: 'planck', cat: '양자론의 기원', name: '플랑크의 흑체 복사 법칙', en: "Planck's Law of Black-Body Radiation",
    tex: ['B_\\lambda(T) = \\frac{2hc^2}{\\lambda^5}\\,\\frac{1}{e^{hc/\\lambda k_BT} - 1}', 'E = h\\nu\\quad(\\text{에너지 양자}),\\qquad h = 6.626\\times10^{-34}\\ \\mathrm{J\\,s}'],
    short: 'E = h\\nu',
    desc: '고전 물리학(레일리-진스 법칙)은 짧은 파장으로 갈수록 복사가 무한히 커진다고 예측했다(자외선 파탄). 1900년 플랑크는 빛 에너지가 hν 크기의 덩어리(양자)로만 주고받아진다고 가정해 실험과 완벽히 맞는 공식을 얻었고, 이것이 양자역학의 출발점이 되었다. 높은 진동수의 양자는 에너지가 커서 잘 들뜨지 않으므로 짧은 파장 쪽 복사가 억제된다.',
    params: [R('T', '온도 T', 'K', 1000, 10000, 50, 5000), Chk('rj', '레일리-진스 (고전) 곡선', true), Chk('wien', '빈 근사 곡선', false)],
    out: (P) => { const lm = (K.wien / P.T) * 1e9; return [['최대 세기 파장 λ_max = b/T', lm, 'nm'], ['λ_max에서 광자 에너지 hc/λ', HC / lm, 'eV'], ['총 복사 σT⁴', K.sigma * P.T ** 4, 'W/m²'], ['300 nm에서 고전/양자 예측 비', ((2 * K.c * K.kB * P.T) / Math.pow(300e-9, 4)) / planck(300e-9, P.T), '배']]; },
    sub: (P) => `\\lambda_{\\max} = \\frac{2.898\\times10^{-3}}{${ft(P.T)}} = ${ft((K.wien / P.T) * 1e9)}\\ \\mathrm{nm}`,
    draw(d, S, P) {
      d.clear();
      const ym = planck(K.wien / P.T, P.T) * 1.3;
      const p = d.plot({ x: 70, y: 50, w: 790, h: 440, xmin: 0, xmax: 3000, ymin: 0, ymax: ym, title: '흑체 복사 스펙트럼', xl: '파장 λ (nm)', yl: '복사 세기 B_λ', yticks: false });
      for (let wl = 380; wl < 780; wl += 4) { const X = p.X(wl), Y = p.Y(min(ym, planck(wl * 1e-9, P.T))); d.rect(X, Y, p.X(wl + 4) - X + 0.5, p.Y(0) - Y, PL.wlCss(wl, 0.75)); }
      [3000, 4000, 6000, 8000].forEach((T) => { if (abs(T - P.T) > 300) p.fn((wl) => planck(wl * 1e-9, T), 'rgba(160,175,210,0.25)', 1, 300, null, 30, 3000); });
      if (P.rj) p.fn((wl) => (2 * K.c * K.kB * P.T) / Math.pow(wl * 1e-9, 4), C.red, 2, 300, [6, 4], 30, 3000);
      if (P.wien) p.fn((wl) => ((2 * K.h * K.c * K.c) / Math.pow(wl * 1e-9, 5)) * exp((-K.h * K.c) / (wl * 1e-9 * K.kB * P.T)), C.purple, 2, 300, [3, 3], 30, 3000);
      p.fn((wl) => planck(wl * 1e-9, P.T), C.white, 3, 400, null, 30, 3000);
      p.vl((K.wien / P.T) * 1e9, C.yellow);
      if (P.rj) d.label('자외선 파탄: 고전 이론은 무한대로 발산', 330, 90, C.red, 12);
      d.text('흰색: 플랑크 법칙 (실험과 일치)', 600, 90, C.text, 12);
      d.circle(820, 140, 22, PL.rgb(PL.bb2rgb(P.T)));
      d.text('보이는 색', 820, 176, C.dim, 11, 'center');
    },
  });

  const METALS = [[2.1, '세슘 Cs (φ = 2.1 eV)'], [2.28, '나트륨 Na (2.28 eV)'], [2.3, '칼륨 K (2.3 eV)'], [4.3, '아연 Zn (4.3 eV)'], [4.7, '구리 Cu (4.7 eV)'], [5.65, '백금 Pt (5.65 eV)']];
  add({
    id: 'photoelectric', cat: '양자론의 기원', name: '광전 효과', en: 'The Photoelectric Effect',
    tex: ['K_{\\max} = h\\nu - \\phi = \\frac{hc}{\\lambda} - \\phi', 'eV_{\\text{정지}} = K_{\\max}'],
    short: 'K_{\\max} = h\\nu - \\phi',
    desc: '금속에 빛을 비추면 전자가 튀어나온다. 그런데 진동수가 문턱값보다 낮은 빛은 아무리 밝아도 전자를 떼어 내지 못하고, 문턱값보다 높으면 아무리 어두워도 즉시 전자가 나온다. 아인슈타인은 빛이 에너지 hν의 입자(광자)이며 광자 하나가 전자 하나에게 에너지를 준다고 설명해 노벨상을 받았다. 빛의 세기는 광자의 수(전자의 수)를, 진동수는 전자의 에너지를 정한다. 역전압을 걸면 정지 전압에서 전류가 끊긴다.',
    params: [R('lam', '빛의 파장 λ', 'nm', 100, 800, 1, 350), R('I', '빛의 세기', '%', 0, 100, 1, 60), Sel('phi', '금속', METALS, 2.28), R('V', '전극 전압 V (− = 역전압)', 'V', -5, 3, 0.05, 0)],
    calc: (P) => { const E = HC / P.lam, Kx = E - P.phi; return { E, Kx, ok: Kx > 0 }; },
    out(P, S) { const c = this.calc(P); return [['광자 에너지 hc/λ', c.E, 'eV'], ['일함수 φ', P.phi, 'eV'], ['최대 운동 에너지 K_max', c.ok ? c.Kx : '전자 방출 없음', 'eV'], ['전자 최대 속력', c.ok ? sqrt((2 * c.Kx * K.eV) / K.me) / 1000 : 0, 'km/s'], ['문턱 파장 hc/φ', HC / P.phi, 'nm'], ['정지 전압', c.ok ? c.Kx : 0, 'V'], ['광전류 (상대값)', S.cur || 0, '']]; },
    sub(P) { const c = this.calc(P); return `K_{\\max} = \\frac{1240}{${ft(P.lam)}} - ${ft(P.phi)} = ${ft(c.Kx)}\\ \\mathrm{eV}`; },
    init(S) { S.e = []; S.ph = []; S.acc = 0; S.cur = 0; S.hits = 0; S.tc = 0; },
    step(S, P, dt) {
      const c = this.calc(P), gap = 470;
      S.acc += dt * P.I * 0.28;
      while (S.acc > 1) { S.acc -= 1; const y0 = 60 + Math.random() * 30; S.ph.push({ x: 40, y: y0, y0, ty: 170 + Math.random() * 220 }); }
      S.ph.forEach((p) => { p.x += 420 * dt; p.y = p.y0 + ((p.ty - p.y0) * (p.x - 40)) / 150; });
      S.ph = S.ph.filter((p) => { if (p.x >= 190) { if (c.ok) S.e.push({ x: 200, y: p.ty, K0: Math.random() * c.Kx, dir: 1 }); return false; } return true; });
      S.e.forEach((e) => {
        const Kx = e.K0 + P.V * ((e.x - 200) / gap);
        if (Kx <= 0.002) e.dir = -1;
        e.x += e.dir * (40 + 170 * sqrt(max(Kx, 0.002))) * dt;
      });
      S.e = S.e.filter((e) => { if (e.x >= 200 + gap) { S.hits++; return false; } return e.x >= 195; });
      S.tc += dt;
      if (S.tc > 1) { S.cur = S.hits / S.tc / 14; S.hits = 0; S.tc = 0; }
    },
    draw(d, S, P) {
      d.clear();
      const c = this.calc(P), col = P.lam >= 380 && P.lam <= 780 ? PL.wlCss(P.lam) : P.lam < 380 ? '#b48cff' : '#ff5050';
      d.rect(170, 120, 530, 300, 'rgba(255,255,255,0.03)', '#7f8db0', 2, 40);
      d.rect(180, 150, 20, 240, '#9aa6c4'); d.text('금속판', 190, 410, C.dim, 11, 'center');
      d.rect(670, 150, 20, 240, '#5d6b8f'); d.text('수집 전극', 680, 410, C.dim, 11, 'center');
      S.ph.forEach((p) => { d.glow(p.x, p.y, 7, col); });
      d.text('빛 ' + P.lam + ' nm (' + PL.wlName(P.lam) + ')', 40, 40, col, 13);
      S.e.forEach((e) => d.circle(e.x, e.y, 3.2, C.cyan));
      d.line(190, 390, 190, 480, '#cfd8ee', 2); d.line(680, 390, 680, 480, '#cfd8ee', 2); d.line(190, 480, 380, 480, '#cfd8ee', 2); d.line(500, 480, 680, 480, '#cfd8ee', 2);
      d.rect(380, 462, 120, 36, '#1b2440', '#cfd8ee', 1.5, 6);
      d.text('A ' + fmt(S.cur, 3), 440, 480, C.yellow, 13, 'center', 'middle', true);
      d.text('V = ' + P.V + ' V', 440, 515, C.text, 12, 'center');
      if (!c.ok) d.label('광자 에너지 < 일함수 → 아무리 밝아도 전자가 나오지 않는다', 435, 270, C.red, 13);
      const p = d.plot({ x: 730, y: 60, w: 150, h: 160, xmin: 0, xmax: 3, ymin: -6, ymax: 8, title: 'K_max – 진동수', xl: 'f (10¹⁵ Hz)', nx: 3, ny: 2 });
      p.fn((f) => 4.1357 * f - P.phi, C.green, 2);
      p.hl(0, 'rgba(255,255,255,0.3)');
      p.dot(K.c / (P.lam * 1e-9) / 1e15, c.Kx, C.green);
      const q = d.plot({ x: 730, y: 300, w: 150, h: 140, xmin: -5, xmax: 3, ymin: 0, ymax: 1.2, title: '전류 – 전압', xl: 'V', nx: 2, ny: 2 });
      if (c.ok) q.fn((v) => (v >= 0 ? 1 : max(0, 1 + v / c.Kx)) * (P.I / 100), C.yellow, 2);
      q.vl(P.V, C.red);
      if (c.ok) q.label('−V_정지', -c.Kx, 1.1, C.dim, 10, 'center');
    },
  });

  add({
    id: 'compton', cat: '양자론의 기원', name: '콤프턴 산란', en: 'Compton Scattering',
    tex: ["\\lambda' - \\lambda = \\frac{h}{m_e c}(1 - \\cos\\theta)", '\\frac{h}{m_ec} = 2.43\\ \\mathrm{pm}\\quad(\\text{전자의 콤프턴 파장})'],
    short: "\\Delta\\lambda = \\frac{h}{m_ec}(1-\\cos\\theta)",
    desc: 'X선이 전자와 부딪혀 튕겨 나가면 파장이 길어진다(에너지를 잃는다). 산란각이 클수록 파장 변화가 크며, 변화량은 처음 파장과 무관하다. 빛을 운동량 p = h/λ를 가진 입자(광자)로 보고 당구공처럼 에너지와 운동량 보존을 적용하면 정확히 설명된다. 이 실험(1923)으로 빛의 입자성이 확정되었다.',
    params: [R('lam', '입사 X선 파장 λ', 'pm', 1, 100, 0.5, 10), R('th', '산란각 θ', '°', 0, 180, 1, 90)],
    calc: (P) => { const dl = 2.426 * (1 - cos(M.rad(P.th))), lp = P.lam + dl, E0 = (HC * 1000) / P.lam, E1 = (HC * 1000) / lp, phi = atan2(sin(M.rad(P.th)), lp / P.lam - cos(M.rad(P.th))); return { dl, lp, E0, E1, Ke: E0 - E1, phi }; },
    out(P) { const c = this.calc(P); return [["파장 변화 Δλ", c.dl, 'pm'], ["산란된 파장 λ'", c.lp, 'pm'], ['입사 광자 에너지', c.E0, 'keV'], ['산란 광자 에너지', c.E1, 'keV'], ['전자가 얻은 운동 에너지', c.Ke, 'keV'], ['전자가 튕겨 나간 각도', M.deg(c.phi), '°']]; },
    sub(P) { return `\\Delta\\lambda = 2.43\\,(1 - \\cos ${ft(P.th)}^\\circ) = ${ft(this.calc(P).dl)}\\ \\mathrm{pm}`; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t = (S.t + dt) % 4; },
    draw(d, S, P) {
      d.clear();
      const c = this.calc(P), cx = 420, cy = 240, t = S.t, th = M.rad(P.th), vis = (l) => 6 + 26 * (Math.log10(l) / 2);
      const wave = (x0, y0, ang, len, lamPx, col, phase) => {
        const pts = [];
        for (let s = 0; s <= len; s += 2) { const a = 9 * sin((2 * PI * s) / lamPx - phase); pts.push([x0 + s * cos(ang) - a * sin(ang), y0 + s * sin(ang) + a * cos(ang)]); }
        d.poly(pts, col, 2.2);
      };
      if (t < 1.5) {
        const head = 60 + t * 240;
        wave(max(40, head - 160), cy, 0, min(160, head - 40), vis(P.lam), C.cyan, t * 12);
        d.ball(cx, cy, 10, C.orange);
      } else {
        const s = (t - 1.5) * 200;
        wave(cx, cy, -th, min(s, 320), vis(c.lp), C.pink, t * 12);
        const ex = cx + s * 0.6 * cos(c.phi), ey = cy + s * 0.6 * sin(c.phi);
        d.ball(ex, ey, 10, C.orange);
        d.arrow(cx, cy, cx + 70 * cos(c.phi), cy + 70 * sin(c.phi), 'rgba(255,159,67,0.6)', 2);
      }
      d.line(cx - 300, cy, cx + 300, cy, 'rgba(255,255,255,0.15)', 1, [4, 4]);
      d.arc(cx, cy, 50, -th, 0, C.yellow, 1.5); d.text('θ', cx + 56 * cos(th / 2), cy - 56 * sin(th / 2), C.yellow, 13);
      d.text('입사 광자 λ = ' + P.lam + ' pm', 40, 40, C.cyan, 13);
      d.text("산란 광자 λ' = " + fmt(c.lp, 4) + ' pm (더 긴 파장)', 40, 64, C.pink, 13);
      d.text('되튄 전자', 40, 88, C.orange, 13);
      const p = d.plot({ x: 70, y: 400, w: 790, h: 120, xmin: 0, xmax: 180, ymin: 0, ymax: 5.2, title: '산란각에 따른 파장 변화 Δλ (pm)', xl: 'θ (°)', nx: 6, ny: 2 });
      p.fn((a) => 2.426 * (1 - cos(M.rad(a))), C.pink, 2.5);
      p.dot(P.th, c.dl, C.pink);
    },
  });

  /* ================================================================ 원자 */
  const SERIES = { 1: '라이먼 (자외선)', 2: '발머 (가시광선)', 3: '파셴 (적외선)', 4: '브래킷 (적외선)', 5: '푼트 (적외선)', 6: '험프리스 (적외선)' };
  add({
    id: 'bohr', cat: '원자 구조', name: '보어 원자 모형과 수소 스펙트럼', en: 'Bohr Model & the Hydrogen Spectrum',
    tex: ['E_n = -\\frac{13.6\\ \\mathrm{eV}\\cdot Z^2}{n^2},\\qquad r_n = \\frac{n^2}{Z}a_0', '\\frac{1}{\\lambda} = R_H Z^2\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right),\\qquad h\\nu = E_{n_i} - E_{n_f}'],
    short: 'E_n = -\\frac{13.6\\ \\mathrm{eV}}{n^2}',
    desc: '보어는 원자 속 전자가 특정한 궤도(에너지 준위)에만 있을 수 있고, 높은 준위에서 낮은 준위로 떨어질 때 그 에너지 차이만큼의 광자를 낸다고 제안했다. 그래서 수소는 연속 스펙트럼이 아니라 특정 파장의 선 스펙트럼만 낸다. n_f = 2로 떨어지는 발머 계열은 가시광선이다(빨강 656 nm, 청록 486 nm, 보라 434 nm…). 궤도 반지름은 실제로 n²에 비례하지만 그림에서는 압축해 그렸다.',
    params: [R('ni', '처음 준위 n_i', '', 2, 7, 1, 3), R('nf', '나중 준위 n_f', '', 1, 6, 1, 2), R('Z', '원자 번호 Z (수소꼴 이온)', '', 1, 3, 1, 1)],
    fix(P) { if (P.nf >= P.ni) P.nf = P.ni - 1; },
    out: (P) => { const dE = 13.6 * P.Z * P.Z * (1 / P.nf ** 2 - 1 / P.ni ** 2), lam = HC / dE; return [['방출 광자 에너지 ΔE', dE, 'eV'], ['파장 λ', lam, 'nm'], ['영역', PL.wlName(lam), ''], ['계열', SERIES[P.nf] || '', ''], ['처음 준위 에너지 E_i', (-13.6 * P.Z * P.Z) / P.ni ** 2, 'eV'], ['궤도 반지름 r_i', ((P.ni * P.ni) / P.Z) * 0.0529, 'nm']]; },
    sub: (P) => { const dE = 13.6 * P.Z * P.Z * (1 / P.nf ** 2 - 1 / P.ni ** 2); return `\\Delta E = 13.6\\times${P.Z * P.Z}\\left(\\frac{1}{${P.nf}^2} - \\frac{1}{${P.ni}^2}\\right) = ${ft(dE)}\\ \\mathrm{eV},\\quad \\lambda = \\frac{1240}{${ft(dE)}} = ${ft(HC / dE)}\\ \\mathrm{nm}`; },
    init(S) { S.t = 0; },
    step(S, P, dt) { S.t = (S.t + dt) % 4.5; },
    draw(d, S, P) {
      d.clear(false, '#05070f');
      const cx = 230, cy = 250, rr = (n) => 16 * Math.pow(n, 1.35), lam = HC / (13.6 * P.Z * P.Z * (1 / P.nf ** 2 - 1 / P.ni ** 2));
      const col = lam >= 380 && lam <= 780 ? PL.wlCss(lam) : lam < 380 ? '#b48cff' : '#ff6060';
      for (let n = 1; n <= 7; n++) { d.g.setLineDash([3, 4]); d.circle(cx, cy, rr(n), null, n === P.ni || n === P.nf ? 'rgba(255,255,255,0.45)' : 'rgba(160,175,210,0.18)', 1); d.g.setLineDash([]); }
      d.glow(cx, cy, 16, 'rgba(255,100,100,0.7)'); d.circle(cx, cy, 6, C.red);
      const jump = S.t > 1.5, ang = S.t * 2.5, n = jump ? P.nf : P.ni;
      d.circle(cx + rr(n) * cos(ang), cy + rr(n) * sin(ang), 6, C.cyan, '#fff', 1.5);
      if (jump) {
        const s = (S.t - 1.5) * 220, a0 = -0.6, x0 = cx + rr(P.nf) * cos(a0), y0 = cy + rr(P.nf) * sin(a0), pts = [], lp = 10 + lam / 40;
        for (let q = 0; q < min(s, 260); q += 2) { const a = 7 * sin((2 * PI * q) / min(lp, 40) - S.t * 15); pts.push([x0 + q * cos(a0) - a * sin(a0), y0 + q * sin(a0) + a * cos(a0)]); }
        d.poly(pts, col, 2.5);
      }
      d.text('n = ' + n, cx, 30, C.text, 13, 'center');
      const ex = 520, ew = 330;
      for (let k = 1; k <= 7; k++) { const E = (-13.6 * P.Z * P.Z) / (k * k), y = 400 - (1 + E / (13.6 * P.Z * P.Z)) * 330; d.line(ex, y, ex + ew, y, k === P.ni || k === P.nf ? C.text : 'rgba(160,175,210,0.35)', k === P.ni || k === P.nf ? 2 : 1); d.text('n=' + k + '  ' + fmt(E, 3) + ' eV', ex + ew + 4, y, C.dim, 10); }
      const yi = 400 - (1 - 1 / P.ni ** 2) * 330, yf = 400 - (1 - 1 / P.nf ** 2) * 330;
      d.arrow(ex + 160, yi, ex + 160, yf, col, 3);
      d.text(fmt(lam, 4) + ' nm', ex + 172, (yi + yf) / 2, col, 13, 'left', 'middle', true);
      d.text('에너지 준위', ex, 50, C.text, 13);
      const sp = d.plot({ x: 70, y: 470, w: 790, h: 34, xmin: 80, xmax: 5000, ymin: 0, ymax: 1, xlog: true, yticks: false, grid: false, title: '수소꼴 원자의 선 스펙트럼 (파장, nm, 로그 눈금)' });
      for (let wl = 380; wl < 780; wl += 5) d.rect(sp.X(wl), 470, sp.X(wl + 5) - sp.X(wl) + 0.5, 34, PL.wlCss(wl, 0.35));
      for (let f = 1; f <= 4; f++) for (let i = f + 1; i <= f + 7; i++) { const l = HC / (13.6 * P.Z * P.Z * (1 / f ** 2 - 1 / i ** 2)); if (l > 80 && l < 5000) d.line(sp.X(l), 470, sp.X(l), 504, f === P.nf && i === P.ni ? '#fff' : 'rgba(255,255,255,0.4)', f === P.nf && i === P.ni ? 3 : 1); }
    },
  });

  const PARTICLES = [[K.me, '전자'], [K.mp, '양성자'], [K.mn, '중성자'], [720 * K.u, '풀러렌 C₆₀'], [0.057, '테니스공 (57 g)']];
  add({
    id: 'debroglie', cat: '양자론의 기원', name: '드브로이 물질파', en: 'de Broglie Matter Waves',
    tex: ['\\lambda = \\frac{h}{p} = \\frac{h}{mv}', '2\\pi r = n\\lambda\\quad(\\text{보어 궤도의 정상파 조건})'],
    short: '\\lambda = \\frac{h}{p}',
    desc: '드브로이는 빛이 입자성을 가지듯 전자 같은 물질 입자도 파장 λ = h/p의 파동성을 가진다고 제안했다. 전자 회절 실험으로 확인되었고, 전자 현미경은 이 짧은 파장을 이용한다. 질량이 큰 물체는 파장이 상상할 수 없이 짧아 파동성이 드러나지 않는다. 아래 그림은 보어 궤도를 전자파가 한 바퀴 돌아 제자리에 정확히 맞물리는 정상파 조건으로, 둘레가 파장의 정수배일 때만 파동이 상쇄되지 않고 남는다.',
    params: [Sel('m', '입자', PARTICLES, K.me), R('v', '속력 v', 'm/s', 1, 1e7, 1, 1e6, { log: 1 }), R('k', '궤도 둘레 / 파장 (2πr/λ)', '', 1, 6, 0.05, 3)],
    out: (P) => { const lam = K.h / (P.m * P.v); return [['운동량 p = mv', P.m * P.v, 'kg·m/s'], ['드브로이 파장 λ', lam, 'm'], ['원자 크기(10⁻¹⁰ m)와 비교', lam / 1e-10, '배'], ['정상파 조건', abs(P.k - Math.round(P.k)) < 0.03 ? 'n = ' + Math.round(P.k) + ' — 허용된 궤도' : '정수가 아님 — 허용 안 됨', '']]; },
    sub: (P) => `\\lambda = \\frac{6.63\\times10^{-34}}{(${ft(P.m)})(${ft(P.v)})} = ${ft(K.h / (P.m * P.v))}\\ \\mathrm{m}`,
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const lam = K.h / (P.m * P.v);
      const p = d.plot({ x: 60, y: 60, w: 800, h: 30, xmin: 1e-36, xmax: 1, ymin: 0, ymax: 1, xlog: true, yticks: false, grid: false, title: '길이의 규모 (m, 로그 눈금)' });
      [[1.6e-35, '플랑크 길이'], [1e-15, '원자핵'], [1e-10, '원자'], [1e-7, '바이러스'], [1e-5, '세포'], [1e-3, '모래알']].forEach(([L, n]) => { p.vl(L, 'rgba(160,175,210,0.5)', null, 1); d.text(n, p.X(L), 52, C.dim, 10, 'center'); });
      const X = p.X(M.clamp(lam, 1e-36, 1));
      d.poly([[X, 94], [X - 7, 106], [X + 7, 106]], null, 0, true, C.yellow);
      d.text('λ = ' + fmt(lam) + ' m', X, 120, C.yellow, 13, 'center', 'middle', true);
      const lp = M.clamp(8 + 7 * (Math.log10(lam) + 13), 6, 120), xc = 60 + ((S.t * 160) % 900), pts = [];
      for (let x = 40; x < 860; x += 2) { const env = exp(-((x - xc) ** 2) / 9000); pts.push([x, 210 - 38 * env * cos((2 * PI * (x - xc)) / lp)]); }
      d.poly(pts, C.cyan, 2);
      d.text('파동 묶음 (그림의 파장은 로그 축척)', 60, 160, C.dim, 11);
      const cx = 450, cy = 400, r0 = 95, k = P.k, laps = abs(k - Math.round(k)) < 0.03 ? 1 : 3;
      d.circle(cx, cy, r0, null, 'rgba(255,255,255,0.15)', 1);
      d.circle(cx, cy, 8, C.red);
      for (let L = 0; L < laps; L++) {
        const pts2 = [];
        for (let a = 0; a <= 2 * PI + 0.01; a += 0.02) { const ph = k * (a + 2 * PI * L) - S.t * 3, r = r0 + 22 * cos(ph); pts2.push([cx + r * cos(a), cy + r * sin(a)]); }
        d.poly(pts2, laps === 1 ? C.green : `rgba(255,92,108,${0.8 - L * 0.25})`, 2);
      }
      d.text(laps === 1 ? '둘레 = ' + Math.round(k) + 'λ → 정상파 (허용)' : '둘레 ≠ 정수 × λ → 여러 바퀴 돌며 상쇄 (금지)', cx, cy + r0 + 40, laps === 1 ? C.green : C.red, 13, 'center', 'middle', true);
    },
  });

  /* ================================================================ 파동역학 */
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cexp = (re, im) => { const e = exp(re); return [e * cos(im), e * sin(im)]; };
  const csqrtInv = (z) => { const r = hypot(z[0], z[1]), th = atan2(z[1], z[0]); return [cos(-th / 2) / sqrt(r), sin(-th / 2) / sqrt(r)]; };
  add({
    id: 'schrodinger', cat: '파동역학', name: '슈뢰딩거 방정식 (자유 입자의 파동 묶음)', en: 'Schrödinger Equation — Free Wave Packet',
    tex: ['i\\hbar\\frac{\\partial\\psi}{\\partial t} = -\\frac{\\hbar^2}{2m}\\frac{\\partial^2\\psi}{\\partial x^2} + V\\psi', '\\sigma(t) = \\sigma_0\\sqrt{1 + \\left(\\frac{\\hbar t}{2m\\sigma_0^2}\\right)^2}'],
    short: 'i\\hbar\\,\\partial_t\\psi = \\hat H\\psi',
    desc: '양자역학에서 입자의 상태는 파동 함수 ψ로 기술되며, 그 시간 변화는 슈뢰딩거 방정식이 정한다. |ψ|²은 입자를 그 위치에서 발견할 확률 밀도이다. 자유 입자의 가우스 파동 묶음은 군속도 ħk₀/m으로 이동하면서 점점 퍼진다 — 처음에 좁게(위치를 정확히) 만들수록 운동량이 불확실해 더 빨리 퍼진다. 실수부(파랑)와 허수부(분홍)가 회전하는 위상을 보여 준다. (ħ = m = 1 단위)',
    params: [R('s0', '처음 폭 σ₀', '', 0.3, 3, 0.05, 1), R('k0', '평균 파수 k₀', '', 0, 8, 0.1, 4, { reset: 1 })],
    psi(x, t, s0, k0, x0) {
      const den = [4 * s0 * s0, 2 * t], num = -((x - x0 - k0 * t) ** 2), dd = den[0] * den[0] + den[1] * den[1];
      const ex = [(num * den[0]) / dd, (-num * den[1]) / dd];
      const ph = cexp(ex[0], ex[1] + k0 * x - (k0 * k0 * t) / 2), pre = csqrtInv([1, t / (2 * s0 * s0)]), A = Math.pow(2 * PI * s0 * s0, -0.25);
      const r = cmul(pre, ph); return [r[0] * A, r[1] * A];
    },
    out: (P, S) => [['군속도 ħk₀/m', P.k0, ''], ['현재 폭 σ(t)', P.s0 * sqrt(1 + (S.t / (2 * P.s0 * P.s0)) ** 2), ''], ['위치 기댓값 ⟨x⟩', -12 + P.k0 * S.t, ''], ['운동량 불확정성 Δp = ħ/(2σ₀)', 1 / (2 * P.s0), ''], ['시간', S.t, '']],
    init(S) { S.t = 0; },
    change(S) { S.t = 0; },
    step(S, P, dt) { S.t += dt * 1.2; if (-12 + P.k0 * S.t > 22 || S.t > 14) S.t = 0; },
    draw(d, S, P) {
      d.clear();
      const p = d.plot({ x: 60, y: 50, w: 810, h: 440, xmin: -20, xmax: 25, ymin: -0.75, ymax: 0.75, title: 'ψ(x, t): 실수부 · 허수부 · |ψ|²', xl: 'x', ny: 4 });
      const N = 700, re = [], im = [], pr = [];
      for (let i = 0; i <= N; i++) { const x = -20 + (45 * i) / N, z = this.psi(x, S.t, P.s0, P.k0, -12); re.push([x, z[0]]); im.push([x, z[1]]); pr.push([x, z[0] * z[0] + z[1] * z[1]]); }
      const g = d.g; p.clipOn(); g.beginPath(); g.moveTo(p.X(-20), p.Y(0)); pr.forEach((q) => g.lineTo(p.X(q[0]), p.Y(q[1]))); g.lineTo(p.X(25), p.Y(0)); g.fillStyle = 'rgba(255,216,77,0.25)'; g.fill(); d.unclip();
      p.pts(pr, C.yellow, 2.5); p.pts(re, C.cyan, 1.5); p.pts(im, C.pink, 1.5);
      d.text('Re ψ', 700, 70, C.cyan, 12); d.text('Im ψ', 760, 70, C.pink, 12); d.text('|ψ|²', 820, 70, C.yellow, 12);
      d.text('t = ' + fmt(S.t, 3), 70, 520, C.text, 13);
    },
  });

  function dft(psi, xs, ps) {
    const out = [];
    for (const p of ps) {
      let re = 0, im = 0;
      for (let i = 0; i < xs.length; i++) { const c = cos(-p * xs[i]), s = sin(-p * xs[i]); re += psi[i][0] * c - psi[i][1] * s; im += psi[i][0] * s + psi[i][1] * c; }
      out.push([re, im]);
    }
    return out;
  }
  const stats = (xs, w) => { let n = 0, m1 = 0, m2 = 0; for (let i = 0; i < xs.length; i++) { n += w[i]; m1 += w[i] * xs[i]; m2 += w[i] * xs[i] * xs[i]; } m1 /= n; return { mean: m1, sd: sqrt(max(0, m2 / n - m1 * m1)) }; };
  add({
    id: 'uncertainty', cat: '파동역학', name: '하이젠베르크 불확정성 원리', en: "Heisenberg's Uncertainty Principle",
    tex: ['\\Delta x\\,\\Delta p \\ge \\frac{\\hbar}{2}', '\\phi(p) = \\frac{1}{\\sqrt{2\\pi\\hbar}}\\int\\psi(x)\\,e^{-ipx/\\hbar}\\,dx'],
    short: '\\Delta x\\,\\Delta p \\ge \\hbar/2',
    desc: '파동 묶음은 여러 파장의 평면파를 겹쳐 만든다. 위치를 좁은 곳에 가두려면 많은 파장(운동량)을 섞어야 하므로 운동량 분포가 넓어지고, 반대로 운동량을 정확히 하려면 파동이 넓게 퍼져야 한다. 위치 분포(왼쪽)와 운동량 분포(오른쪽)는 푸리에 변환 관계이며, 두 폭의 곱은 결코 ħ/2보다 작아질 수 없다. 가우스 모양일 때 정확히 최솟값 ħ/2가 된다. 측정 기술의 한계가 아니라 자연의 근본 성질이다. (ħ = 1 단위)',
    params: [R('s', '위치 폭 매개변수 σ', '', 0.3, 4, 0.05, 1.2), R('p0', '평균 운동량 p₀', '', 0, 5, 0.1, 2), Sel('shape', '파동 함수 모양', [['g', '가우스'], ['t', '삼각형'], ['cat', '두 봉우리 (중첩)']], 'g')],
    calc(P) {
      const N = 400, xs = [], psi = [];
      for (let i = 0; i < N; i++) {
        const x = -20 + (40 * i) / N, s = P.s;
        let a = P.shape === 'g' ? exp(-(x * x) / (4 * s * s)) : P.shape === 't' ? max(0, 1 - abs(x) / (s * sqrt(10))) : exp(-((x - 2.5 * s) ** 2) / (4 * s * s)) + exp(-((x + 2.5 * s) ** 2) / (4 * s * s));
        xs.push(x); psi.push([a * cos(P.p0 * x), a * sin(P.p0 * x)]);
      }
      const ps = []; for (let k = 0; k < 300; k++) ps.push(-8 + (16 * k) / 299);
      const ph = dft(psi, xs, ps);
      const wx = psi.map((z) => z[0] * z[0] + z[1] * z[1]), wp = ph.map((z) => z[0] * z[0] + z[1] * z[1]);
      const sx = stats(xs, wx), sp = stats(ps, wp), mx = max(...wx), mp = max(...wp);
      return { xs, psi, ps, ph, wx: wx.map((v) => v / mx), wp: wp.map((v) => v / mp), dx: sx.sd, dp: sp.sd };
    },
    out(P, S) { const c = PL.memo(S, 'c', [P.s, P.p0, P.shape].join(), () => this.calc(P)); return [['위치 불확정성 Δx', c.dx, ''], ['운동량 불확정성 Δp', c.dp, ''], ['곱 Δx·Δp', c.dx * c.dp, 'ħ'], ['최솟값 ħ/2', 0.5, 'ħ'], ['최솟값 대비', (c.dx * c.dp) / 0.5, '배']]; },
    sub(P, S) { const c = PL.memo(S, 'c', [P.s, P.p0, P.shape].join(), () => this.calc(P)); return `\\Delta x\\,\\Delta p = (${ft(c.dx)})(${ft(c.dp)}) = ${ft(c.dx * c.dp)}\\,\\hbar \\ \\ge\\ 0.5\\,\\hbar`; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const c = PL.memo(S, 'c', [P.s, P.p0, P.shape].join(), () => this.calc(P));
      const p1 = d.plot({ x: 60, y: 50, w: 380, h: 300, xmin: -12, xmax: 12, ymin: -1.1, ymax: 1.1, title: '위치 공간 ψ(x), |ψ|²', xl: 'x', ny: 2 });
      const am = sqrt(max(...c.psi.map((z) => z[0] * z[0] + z[1] * z[1])));
      p1.area((x) => { const i = Math.round(((x + 20) / 40) * 400); return c.wx[M.clamp(i, 0, 399)]; }, 'rgba(255,216,77,0.25)', -12, 12, 400);
      p1.pts(c.xs.map((x, i) => [x, (c.psi[i][0] * cos(-S.t * 2) - c.psi[i][1] * sin(-S.t * 2)) / am]), C.cyan, 1.5);
      p1.pts(c.xs.map((x, i) => [x, c.wx[i]]), C.yellow, 2.5);
      const p2 = d.plot({ x: 490, y: 50, w: 380, h: 300, xmin: -8, xmax: 8, ymin: 0, ymax: 1.1, title: '운동량 공간 |φ(p)|²', xl: 'p', ny: 2 });
      p2.area((p) => { const k = Math.round(((p + 8) / 16) * 299); return c.wp[M.clamp(k, 0, 299)]; }, 'rgba(244,114,182,0.3)', -8, 8, 300);
      p2.pts(c.ps.map((p, k) => [p, c.wp[k]]), C.pink, 2.5);
      const bx = 60, by = 420, bw = 810, prod = c.dx * c.dp, sc = bw / 4;
      d.text('Δx = ' + fmt(c.dx, 3) + '     Δp = ' + fmt(c.dp, 3) + '     Δx·Δp = ' + fmt(prod, 3) + ' ħ', bx, 400, C.text, 14, 'left', 'middle', true);
      d.rect(bx, by, bw, 26, 'rgba(255,255,255,0.05)', null, 0, 6);
      d.rect(bx, by, min(bw, prod * sc), 26, C.green, null, 0, 6);
      d.line(bx + 0.5 * sc, by - 8, bx + 0.5 * sc, by + 34, C.red, 2.5);
      d.text('ħ/2 (최솟값)', bx + 0.5 * sc, by + 48, C.red, 12, 'center');
      d.text('폭을 좁히면 다른 쪽이 넓어진다', 600, by + 48, C.dim, 12);
    },
  });

  add({
    id: 'infwell', cat: '파동역학', name: '상자 속 입자 (무한 퍼텐셜 우물)', en: 'Particle in a Box — Infinite Square Well',
    tex: ['\\psi_n(x) = \\sqrt{\\frac{2}{L}}\\sin\\frac{n\\pi x}{L}', 'E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2} = \\frac{n^2h^2}{8mL^2}'],
    short: 'E_n = \\frac{n^2h^2}{8mL^2}',
    desc: '벽에 갇힌 입자의 파동 함수는 양 끝에서 0이어야 하므로 기타 줄처럼 반파장의 정수배만 들어맞고, 그 결과 에너지가 n²에 비례하는 띄엄띄엄한 값(양자화)만 허용된다. 가장 낮은 에너지도 0이 아니다(영점 에너지). 상자가 작을수록 에너지 간격이 커진다 — 양자점의 색이 크기에 따라 달라지는 이유이다. 두 상태를 겹치면(중첩) 확률 밀도가 좌우로 출렁인다.',
    params: [R('n', '양자수 n', '', 1, 8, 1, 2), R('L', '상자 길이 L (전자)', 'nm', 0.2, 3, 0.05, 1), R('m2', '중첩할 두 번째 상태 (0 = 없음)', '', 0, 8, 1, 0)],
    E: (n, L) => (n * n * (K.h * K.h)) / (8 * K.me * (L * 1e-9) ** 2) / K.eV,
    out(P) { const r = [['에너지 E_n', this.E(P.n, P.L), 'eV'], ['바닥 상태 E₁ (영점 에너지)', this.E(1, P.L), 'eV'], ['파장 λ = 2L/n', (2 * P.L) / P.n, 'nm'], ['마디 수 (벽 제외)', P.n - 1, '개']]; if (P.m2 && P.m2 !== P.n) { const dE = abs(this.E(P.m2, P.L) - this.E(P.n, P.L)); r.push(['중첩 출렁임 주기 h/ΔE', (K.h / (dE * K.eV)) * 1e15, 'fs'], ['전이 광자 파장', HC / dE, 'nm']); } return r; },
    sub(P) { return `E_{${P.n}} = \\frac{${P.n}^2(6.63\\times10^{-34})^2}{8(9.11\\times10^{-31})(${ft(P.L * 1e-9)})^2} = ${ft(this.E(P.n, P.L))}\\ \\mathrm{eV}`; },
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const x0 = 330, x1 = 840, W = x1 - x0, base = 470;
      const Emax = this.E(8, P.L), Ey = (E) => base - (E / Emax) * 380;
      d.rect(x0 - 14, 40, 14, base - 40, '#5d6b8f'); d.rect(x1, 40, 14, base - 40, '#5d6b8f'); d.line(x0, base, x1, base, '#5d6b8f', 3);
      for (let k = 1; k <= 8; k++) { const y = Ey(this.E(k, P.L)); d.line(60, y, 240, y, k === P.n ? C.yellow : k === P.m2 ? C.pink : 'rgba(160,175,210,0.35)', k === P.n || k === P.m2 ? 2.5 : 1); d.text('n=' + k + '  ' + fmt(this.E(k, P.L), 3) + ' eV', 248, y, C.dim, 10); }
      d.text('에너지 준위 (E ∝ n²)', 60, 30, C.text, 13);
      const sup = P.m2 && P.m2 !== P.n, w1 = this.E(P.n, P.L), w2 = sup ? this.E(P.m2, P.L) : 0, tt = S.t * 1.5;
      const yb = sup ? (Ey(w1) + Ey(w2)) / 2 : Ey(w1), amp = 55, pr = [], re = [];
      for (let i = 0; i <= 300; i++) {
        const u = i / 300, X = x0 + u * W, a = sin(P.n * PI * u);
        let z;
        if (sup) { const b = sin(P.m2 * PI * u), ph1 = -tt * 1, ph2 = -tt * (w2 / w1); z = [(a * cos(ph1) + b * cos(ph2)) / Math.SQRT2, (a * sin(ph1) + b * sin(ph2)) / Math.SQRT2]; }
        else z = [a * cos(-tt), a * sin(-tt)];
        re.push([X, yb - z[0] * amp]); pr.push([X, yb - (z[0] * z[0] + z[1] * z[1]) * amp * 0.9]);
      }
      d.poly([[x0, yb], ...pr, [x1, yb]], null, 0, true, 'rgba(255,216,77,0.25)');
      d.poly(pr, C.yellow, 2.5); d.poly(re, C.cyan, 1.5);
      d.line(x0, yb, x1, yb, 'rgba(255,255,255,0.2)', 1, [3, 4]);
      d.text(sup ? '중첩 상태 (ψ' + P.n + ' + ψ' + P.m2 + ')/√2 — 확률이 출렁임' : '정상 상태 ψ' + P.n + ' — |ψ|²은 시간에 따라 변하지 않음', 585, 30, C.text, 13, 'center');
      d.text('L = ' + P.L + ' nm', 585, base + 22, C.dim, 12, 'center');
    },
  });

  add({
    id: 'qho', cat: '파동역학', name: '양자 조화 진동자', en: 'Quantum Harmonic Oscillator',
    tex: ['E_n = \\hbar\\omega\\left(n + \\tfrac12\\right)', '\\psi_n(\\xi) = \\frac{1}{\\sqrt{2^n n!}}\\,\\pi^{-1/4}H_n(\\xi)\\,e^{-\\xi^2/2},\\qquad \\xi = \\sqrt{\\frac{m\\omega}{\\hbar}}\\,x'],
    short: 'E_n = \\hbar\\omega(n + \\tfrac12)',
    desc: '용수철처럼 위치에 비례하는 복원력을 받는 양자 입자의 에너지는 ħω 간격으로 고르게 양자화되며, 바닥 상태도 ½ħω의 영점 에너지를 가진다. 분자의 진동, 결정의 격자 진동(포논), 빛의 양자화(광자)가 모두 이 모형으로 기술된다. 양자수 n이 커지면 확률 분포가 고전적인 진동자의 분포(점선, 끝에서 오래 머묾)에 가까워진다(대응 원리). "결맞음 상태"는 고전 진동자처럼 앞뒤로 움직이는 파동 묶음이다.',
    params: [R('n', '양자수 n', '', 0, 12, 1, 3), R('alpha', '결맞음 상태 크기 α (0 = 끔)', '', 0, 3, 0.05, 0)],
    psi: (n, x) => (M.hermite(n, x) * exp(-(x * x) / 2)) / sqrt(Math.pow(2, n) * M.fact(n) * sqrt(PI)),
    out: (P) => [['에너지 E_n', P.n + 0.5, 'ħω'], ['고전적 반환점 ±√(2n+1)', sqrt(2 * P.n + 1), ''], ['마디 수', P.n, '개'], ['결맞음 상태 평균 에너지 (α² + ½)', P.alpha > 0 ? P.alpha ** 2 + 0.5 : '—', 'ħω']],
    sub: (P) => `E_{${P.n}} = \\hbar\\omega\\left(${P.n} + \\tfrac12\\right) = ${ft(P.n + 0.5)}\\,\\hbar\\omega`,
    step(S, P, dt) { S.t += dt; },
    draw(d, S, P) {
      d.clear();
      const p = d.plot({ x: 60, y: 40, w: 810, h: 470, xmin: -6, xmax: 6, ymin: 0, ymax: 14, title: '퍼텐셜 V = ½ξ² 과 에너지 준위', xl: 'ξ', yl: 'E (ħω)' });
      p.fn((x) => 0.5 * x * x, '#8fa0c9', 2);
      for (let k = 0; k <= 12; k++) { const E = k + 0.5, xt = sqrt(2 * E); p.pts([[-xt, E], [xt, E]], k === P.n && P.alpha === 0 ? C.yellow : 'rgba(160,175,210,0.25)', k === P.n ? 2 : 1); }
      if (P.alpha > 0) {
        const x0 = Math.SQRT2 * P.alpha * cos(S.t * 2), E = P.alpha ** 2 + 0.5;
        p.area((x) => E + 1.6 * exp(-((x - x0) ** 2)) / sqrt(PI), 'rgba(255,216,77,0.3)', -6, 6, 300, E);
        p.fn((x) => E + (1.6 * exp(-((x - x0) ** 2))) / sqrt(PI), C.yellow, 2.5);
        p.dot(x0, E, C.orange, 5);
        d.text('결맞음 상태: 모양을 유지한 채 고전 진동자처럼 왕복', 80, 70, C.yellow, 13);
        return;
      }
      const E = P.n + 0.5, sc = 1.6, xt = sqrt(2 * E);
      p.area((x) => E + sc * this.psi(P.n, x) ** 2 * 2.5, 'rgba(255,216,77,0.25)', -6, 6, 400, E);
      p.fn((x) => E + sc * this.psi(P.n, x) ** 2 * 2.5, C.yellow, 2.5, 500);
      p.fn((x) => E + sc * this.psi(P.n, x) * cos(S.t * E * 0.5) * 1.2, 'rgba(56,189,248,0.8)', 1.5, 500);
      p.fn((x) => (abs(x) < xt * 0.995 ? E + (sc * 2.5) / (PI * sqrt(xt * xt - x * x)) : NaN), 'rgba(244,114,182,0.8)', 1.5, 500, [5, 4]);
      p.vl(xt, 'rgba(255,255,255,0.2)'); p.vl(-xt, 'rgba(255,255,255,0.2)');
      d.text('노랑: |ψₙ|² · 하늘: ψₙ · 분홍 점선: 고전적 확률 분포', 80, 70, C.text, 12);
    },
  });

  const Tex = (E, V0, a) => {
    if (E <= 0) return 0;
    if (abs(E - V0) < 1e-6) return 1 / (1 + (V0 * a * a) / 2);
    if (E < V0) { const k = sqrt(2 * (V0 - E)); return 1 / (1 + (V0 * V0 * Math.sinh(k * a) ** 2) / (4 * E * (V0 - E))); }
    const k = sqrt(2 * (E - V0)); return 1 / (1 + (V0 * V0 * sin(k * a) ** 2) / (4 * E * (E - V0)));
  };
  add({
    id: 'tunneling', cat: '파동역학', name: '양자 터널링', en: 'Quantum Tunneling',
    tex: ['T \\approx 16\\frac{E}{V_0}\\left(1 - \\frac{E}{V_0}\\right)e^{-2\\kappa a},\\qquad \\kappa = \\frac{\\sqrt{2m(V_0 - E)}}{\\hbar}', 'T = \\left[1 + \\frac{V_0^2\\sinh^2(\\kappa a)}{4E(V_0 - E)}\\right]^{-1}\\quad(\\text{정확한 식})'],
    short: 'T \\approx e^{-2\\kappa a}',
    desc: '고전 물리에서는 에너지가 장벽보다 낮은 입자가 절대 넘어갈 수 없지만, 양자역학에서는 파동 함수가 장벽 안에서 지수적으로 줄어들 뿐 0이 되지 않아 일부가 반대편으로 빠져나간다(터널링). 투과 확률은 장벽이 높고 두꺼울수록 지수적으로 작아진다. 시뮬레이션은 슈뢰딩거 방정식을 직접 수치 적분한 것이다. 알파 붕괴, 태양의 핵융합, 주사 터널링 현미경(STM), 플래시 메모리가 이 현상에 의존한다. (ħ = m = 1)',
    params: [R('E', '입자 에너지 E', '', 2, 30, 0.5, 12, { reset: 1 }), R('V0', '장벽 높이 V₀', '', 0, 40, 0.5, 18, { reset: 1 }), R('a', '장벽 두께 a', '', 0.1, 3, 0.05, 0.6, { reset: 1 })],
    out: (P, S) => [['정확한 투과 확률 T', Tex(P.E, P.V0, P.a) * 100, '%'], ['수치 계산 투과 확률', S.Tm * 100, '%'], ['수치 계산 반사 확률', S.Rm > 0 ? S.Rm * 100 : '충돌 후 측정', '%'], ['고전 예측', P.E > P.V0 ? '100% 통과' : '0% (완전 반사)', ''], ['감쇠 상수 κ', P.E < P.V0 ? sqrt(2 * (P.V0 - P.E)) : '—', '']],
    sub: (P) => `T = ${ft(Tex(P.E, P.V0, P.a))}\\ (${ft(Tex(P.E, P.V0, P.a) * 100)}\\%)`,
    init(S, P) {
      const N = 1600, dx = 0.1, k0 = sqrt(2 * P.E), s = 4, x0 = -30;
      S.N = N; S.dx = dx; S.R = new Float64Array(N); S.I = new Float64Array(N); S.V = new Float64Array(N); S.mask = new Float64Array(N);
      let norm = 0;
      for (let i = 0; i < N; i++) {
        const x = -80 + i * dx, env = exp(-((x - x0) ** 2) / (4 * s * s));
        S.R[i] = env * cos(k0 * x); S.I[i] = env * sin(k0 * x); norm += env * env * dx;
        S.V[i] = abs(x) <= P.a / 2 ? P.V0 : 0;
        S.mask[i] = abs(x) > 68 ? 1 - 0.03 * ((abs(x) - 68) / 12) ** 2 : 1;
      }
      const nn = 1 / sqrt(norm);
      for (let i = 0; i < N; i++) { S.R[i] *= nn; S.I[i] *= nn; }
      const dt = 0.004;
      for (let i = 1; i < N - 1; i++) S.I[i] -= 0.5 * dt * (-(S.R[i + 1] - 2 * S.R[i] + S.R[i - 1]) / (2 * dx * dx) + S.V[i] * S.R[i]);
      S.tt = 0; S.Tm = 0; S.Rm = 0;
    },
    step(S, P, dt) {
      const N = S.N, dx = S.dx, h = 0.004, R = S.R, I = S.I, V = S.V, k = 1 / (2 * dx * dx), n = M.clamp(Math.round(dt * 600), 1, 60);
      for (let s = 0; s < n; s++) {
        for (let i = 1; i < N - 1; i++) R[i] += h * (-k * (I[i + 1] - 2 * I[i] + I[i - 1]) + V[i] * I[i]);
        for (let i = 1; i < N - 1; i++) I[i] -= h * (-k * (R[i + 1] - 2 * R[i] + R[i - 1]) + V[i] * R[i]);
        for (let i = 0; i < N; i++) if (S.mask[i] < 1) { R[i] *= S.mask[i]; I[i] *= S.mask[i]; }
      }
      S.tt += n * h;
      let Tm = 0, Rm = 0;
      for (let i = 0; i < N; i++) { const x = -80 + i * dx, p = (R[i] * R[i] + I[i] * I[i]) * dx; if (x > P.a / 2 + 0.5) Tm += p; else if (x < -P.a / 2 - 0.5) Rm += p; }
      S.Tm = max(S.Tm, Tm); S.Rm = S.tt > 45 / sqrt(2 * P.E) ? max(S.Rm, Rm) : 0;
      if (S.tt > 70 / sqrt(2 * P.E) + 8) this.init(S, P);
    },
    draw(d, S, P) {
      d.clear();
      const p = d.plot({ x: 60, y: 50, w: 560, h: 450, xmin: -60, xmax: 60, ymin: 0, ymax: 44, title: '파동 묶음과 퍼텐셜 장벽', xl: 'x', yl: '에너지' });
      d.rect(p.X(-P.a / 2), p.Y(P.V0), max(2, p.X(P.a / 2) - p.X(-P.a / 2)), p.Y(0) - p.Y(P.V0), 'rgba(255,92,108,0.35)', C.red, 1.5);
      p.hl(P.E, 'rgba(255,216,77,0.6)', [6, 4]);
      p.label('E', 56, P.E + 1.2, C.yellow, 12, 'right');
      const pr = [], re = [], sc = 120;
      for (let i = 0; i < S.N; i += 2) { const x = -80 + i * S.dx; if (x < -60 || x > 60) continue; pr.push([x, P.E + (S.R[i] ** 2 + S.I[i] ** 2) * sc]); re.push([x, P.E + S.R[i] * sqrt(sc) * 2.2]); }
      const g = d.g; p.clipOn(); g.beginPath(); g.moveTo(p.X(-60), p.Y(P.E)); pr.forEach((q) => g.lineTo(p.X(q[0]), p.Y(q[1]))); g.lineTo(p.X(60), p.Y(P.E)); g.fillStyle = 'rgba(56,189,248,0.3)'; g.fill(); d.unclip();
      p.pts(re, 'rgba(167,139,250,0.6)', 1); p.pts(pr, C.cyan, 2.2);
      d.text('투과 ' + fmt(S.Tm * 100, 3) + '%', p.X(30), 80, C.green, 14, 'center', 'middle', true);
      if (S.Rm > 0) d.text('반사 ' + fmt(S.Rm * 100, 3) + '%', p.X(-35), 80, C.orange, 14, 'center', 'middle', true);
      const q = d.plot({ x: 670, y: 50, w: 200, h: 220, xmin: 0, xmax: 40, ymin: 0, ymax: 1.05, title: '투과 확률 T(E)', xl: 'E', nx: 2, ny: 2 });
      q.fn((E) => Tex(E, P.V0, P.a), C.green, 2, 400, null, 0.05, 40);
      q.vl(P.V0, C.red); q.dot(P.E, Tex(P.E, P.V0, P.a), C.green); q.dot(P.E, S.Tm, C.cyan, 3.5);
      d.text('곡선: 정확한 해', 670, 300, C.green, 12); d.text('파란 점: 수치 시뮬레이션', 670, 320, C.cyan, 12);
      d.text('E ' + (P.E < P.V0 ? '<' : '≥') + ' V₀', 670, 360, C.text, 14, 'left', 'middle', true);
    },
  });

  const LET = 'spdfgh';
  add({
    id: 'hydrogen', cat: '원자 구조', name: '수소 원자의 오비탈', en: 'Hydrogen Atom Orbitals',
    tex: ['\\psi_{n\\ell m}(r,\\theta,\\phi) = R_{n\\ell}(r)\\,Y_\\ell^m(\\theta,\\phi)', 'E_n = -\\frac{13.6\\ \\mathrm{eV}}{n^2},\\qquad \\ell = 0,\\dots,n-1,\\quad m = -\\ell,\\dots,\\ell'],
    short: '\\psi_{n\\ell m} = R_{n\\ell}Y_\\ell^m',
    desc: '슈뢰딩거 방정식을 수소 원자에 대해 풀면 전자는 정해진 궤도를 도는 것이 아니라 확률 구름(오비탈)으로 존재한다. 주양자수 n은 에너지와 크기를, 궤도 양자수 ℓ은 모양(s, p, d, f…)을, 자기 양자수 m은 방향을 정한다. 그림은 z축을 포함하는 단면에서 전자를 발견할 확률 밀도 |ψ|²이며, 어두운 띠와 선은 확률이 0인 마디(지름 방향 n−ℓ−1개, 각 방향 ℓ개)이다. 오른쪽은 반지름에 따른 확률 분포 r²|R|²이다.',
    params: [R('n', '주양자수 n', '', 1, 6, 1, 3), R('l', '궤도 양자수 ℓ', '', 0, 5, 1, 2), R('m', '자기 양자수 m', '', -5, 5, 1, 0), Chk('phase', '파동 함수 부호(위상) 색으로 보기', false), R('gam', '밝기 감마 (작을수록 희미한 곳 강조)', '', 0.2, 1, 0.05, 0.5)],
    fix(P) { if (P.l > P.n - 1) P.l = P.n - 1; if (abs(P.m) > P.l) P.m = Math.sign(P.m) * P.l; },
    Rnl(n, l, r) { const rho = (2 * r) / n; return Math.pow(rho, l) * exp(-rho / 2) * M.laguerre(n - l - 1, 2 * l + 1, rho); },
    out: (P) => [['오비탈 이름', P.n + LET[P.l] + (P.l ? ' (m = ' + P.m + ')' : ''), ''], ['에너지 E_n', -13.6 / (P.n * P.n), 'eV'], ['지름 방향 마디 수 n−ℓ−1', P.n - P.l - 1, '개'], ['각 방향 마디 수 ℓ', P.l, '개'], ['평균 반지름 ⟨r⟩', (3 * P.n * P.n - P.l * (P.l + 1)) / 2, 'a₀'], ['같은 n의 상태 수 n² (스핀 제외)', P.n * P.n, '개']],
    init(S) { S.cv = document.createElement('canvas'); },
    draw(d, S, P) {
      d.clear(false, '#03050b');
      const N = 220, L = P.n * P.n * 2.3 + 4, am = abs(P.m), key = [P.n, P.l, P.m, P.phase, P.gam].join();
      PL.memo(S, 'img', key, () => {
        const val = new Float64Array(N * N), sg = new Int8Array(N * N);
        let mx = 0;
        for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
          const x = ((i + 0.5) / N - 0.5) * 2 * L, z = -((j + 0.5) / N - 0.5) * 2 * L, r = hypot(x, z) + 1e-9;
          const Rv = this.Rnl(P.n, P.l, r), Yv = M.legendre(P.l, am, z / r), psi = Rv * Yv * (x < 0 && am % 2 ? -1 : 1);
          const v = psi * psi; val[j * N + i] = v; sg[j * N + i] = psi >= 0 ? 1 : -1; if (v > mx) mx = v;
        }
        const out = [0, 0, 0, 255];
        PL.raster(N, N, (i, j) => {
          const t = Math.pow(val[j * N + i] / mx, P.gam);
          if (P.phase) { const c = PL.cmap.div(sg[j * N + i] * t); out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; return out; }
          return PL.cmap.inferno(t);
        }, S.cv);
        return 1;
      });
      d.img(S.cv, 30, 30, 500, 500);
      d.rect(30, 30, 500, 500, null, 'rgba(160,180,225,0.3)', 1);
      d.text(P.n + LET[P.l] + (P.l ? '  (m = ' + P.m + ')' : '') + ' 오비탈 — xz 단면', 40, 46, '#fff', 14, 'left', 'middle', true);
      d.text('z', 280, 42, C.dim, 12); d.text('x', 520, 290, C.dim, 12);
      d.line(30 + 250 - 5 * (500 / (2 * L)), 520, 30 + 250 + 5 * (500 / (2 * L)), 520, '#fff', 2);
      d.text('10 a₀', 280, 508, '#fff', 11, 'center');
      const rmax = L * 1.25, pr = (r) => r * r * this.Rnl(P.n, P.l, r) ** 2;
      let mx = 0; for (let k = 1; k <= 300; k++) mx = max(mx, pr((rmax * k) / 300));
      const p = d.plot({ x: 580, y: 50, w: 290, h: 220, xmin: 0, xmax: rmax, ymin: 0, ymax: 1.1, title: '지름 방향 확률 r²|R(r)|²', xl: 'r (a₀)', yticks: false });
      p.area((r) => pr(r) / mx, 'rgba(255,159,67,0.3)'); p.fn((r) => pr(r) / mx, C.orange, 2.5);
      p.vl((3 * P.n * P.n - P.l * (P.l + 1)) / 2, C.yellow); p.label('⟨r⟩', (3 * P.n * P.n - P.l * (P.l + 1)) / 2, 1.0, C.yellow, 11);
      const q = d.plot({ x: 580, y: 330, w: 290, h: 180, xmin: 0, xmax: 180, ymin: 0, ymax: 1.1, title: '각도 분포 |Y|² (θ: z축으로부터)', xl: 'θ (°)', yticks: false, nx: 6 });
      let my = 0; for (let k = 0; k <= 180; k++) my = max(my, M.legendre(P.l, am, cos(M.rad(k))) ** 2);
      q.fn((t) => M.legendre(P.l, am, cos(M.rad(t))) ** 2 / (my || 1), C.cyan, 2.5);
    },
  });

  /* ================================================================ 스핀과 양자 정보 */
  add({
    id: 'sterngerlach', cat: '스핀과 양자 정보', name: '스핀과 슈테른-게를라흐 실험', en: 'Spin & the Stern–Gerlach Experiment',
    tex: ['S_z = \\pm\\frac{\\hbar}{2}', 'P(+\\hat n) = \\cos^2\\frac{\\theta}{2},\\qquad P(-\\hat n) = \\sin^2\\frac{\\theta}{2}'],
    short: 'S_z = \\pm\\hbar/2',
    desc: '은 원자 빔을 불균일한 자기장에 통과시키면, 고전적으로는 연속적으로 퍼져야 할 빔이 정확히 두 갈래로 갈라진다 — 전자 스핀의 측정값이 +ħ/2, −ħ/2 두 가지뿐이기 때문이다. 첫 번째 장치(z)에서 위쪽(+z)만 골라 두 번째 장치를 각도 θ로 기울이면, 각 원자는 확률 cos²(θ/2)로 위, sin²(θ/2)로 아래로 간다. 세 번째 장치(z)를 추가하면, θ = 90°의 측정이 처음의 z 정보를 지워 다시 반반으로 나뉘는 것을 볼 수 있다.',
    params: [R('th', '두 번째 장치의 각도 θ', '°', 0, 180, 1, 90), Chk('third', '세 번째 장치 (z 방향) 추가', false, { reset: 1 }), R('rate', '원자 발사율', '개/s', 5, 200, 1, 40)],
    out: (P, S) => {
      const p = cos(M.rad(P.th) / 2) ** 2;
      const r = [['이론 P(+θ) = cos²(θ/2)', p * 100, '%'], ['이론 P(−θ) = sin²(θ/2)', (1 - p) * 100, '%'], ['측정: 위 / 아래', S.cnt[0] + ' / ' + S.cnt[1], '개']];
      if (P.third) r.push(['세 번째 장치 이론 P(+z)', p * 100, '%'], ['세 번째 장치 측정: 위 / 아래', S.cnt[2] + ' / ' + S.cnt[3], '개']);
      return r;
    },
    init(S) { S.ps = []; S.acc = 0; S.cnt = [0, 0, 0, 0]; },
    step(S, P, dt) {
      S.acc += dt * P.rate;
      const p = cos(M.rad(P.th) / 2) ** 2;
      while (S.acc > 1) {
        S.acc -= 1;
        const s1 = Math.random() < 0.5, s2 = Math.random() < p, s3 = Math.random() < p;
        S.ps.push({ s: 0, s1, s2, s3, y0: (Math.random() - 0.5) * 8 });
      }
      S.ps.forEach((q) => (q.s += 260 * dt));
      S.ps = S.ps.filter((q) => {
        const end = P.third ? 820 : 760;
        if (!q.s1 && q.s > 300) return false;
        if (P.third && !q.s2 && q.s > 560) return false;
        if (q.s >= end) { if (!P.third) S.cnt[q.s2 ? 0 : 1]++; else S.cnt[q.s3 ? 2 : 3]++; return false; }
        return true;
      });
    },
    path(q, P) {
      const y = 280 + q.y0, s = q.s;
      if (s < 120) return [40 + s, y];
      if (s < 300) { const u = (s - 120) / 180; return [40 + s, y + (q.s1 ? -1 : 1) * 60 * u * u]; }
      const y1 = y - 60;
      if (s < 330) return [40 + s, y1];
      if (s < 540) { const u = (s - 330) / 210; return [40 + s, y1 + (q.s2 ? -1 : 1) * 55 * u * u]; }
      const y2 = y1 + (q.s2 ? -55 : 55);
      if (!P.third || s < 600) return [40 + s, y2];
      const u = (s - 600) / 180; return [40 + s, y2 + (q.s3 ? -1 : 1) * 45 * min(1, u) * min(1, u)];
    },
    draw(d, S, P) {
      d.clear();
      const magnet = (x, y, w, ang, lbl) => {
        const g = d.g; g.save(); g.translate(x + w / 2, y); g.rotate(-M.rad(ang) * 0.5);
        d.rect(-w / 2, -48, w, 26, C.red, null, 0, 4); d.rect(-w / 2, 22, w, 26, C.blue, null, 0, 4);
        d.text('N', 0, -35, '#fff', 12, 'center', 'middle', true); d.text('S', 0, 35, '#fff', 12, 'center', 'middle', true);
        g.restore();
        d.text(lbl, x + w / 2, y + 70, C.text, 12, 'center');
      };
      d.rect(10, 262, 40, 36, '#5d6b8f', null, 0, 6); d.text('오븐', 30, 310, C.dim, 11, 'center');
      magnet(160, 280, 180, 0, 'SG1 (z)');
      d.rect(345, 330, 14, 30, '#9aa6c4'); d.text('차단', 352, 372, C.dim, 10, 'center');
      magnet(370, 220, 180, P.th, 'SG2 (θ = ' + P.th + '°)');
      if (P.third) { d.rect(585, 260, 14, 30, '#9aa6c4'); magnet(640, 165, 180, 0, 'SG3 (z)'); }
      S.ps.forEach((q) => { const [x, y] = this.path(q, P); d.circle(x, y, 2.6, C.cyan); });
      const sx = P.third ? 860 : 800;
      d.rect(sx, 60, 12, 440, '#3a4668');
      d.text('스크린', sx + 6, 52, C.dim, 11, 'center');
      const tot = P.third ? S.cnt[2] + S.cnt[3] : S.cnt[0] + S.cnt[1], a = P.third ? S.cnt[2] : S.cnt[0], b = P.third ? S.cnt[3] : S.cnt[1];
      const ya = P.third ? 280 - 60 - 55 - 45 : 280 - 60 - 55, yb = P.third ? 280 - 60 - 55 + 45 : 280 - 60 + 55;
      if (tot) { d.rect(sx - 4 - (60 * a) / tot, ya - 8, (60 * a) / tot, 16, C.green); d.rect(sx - 4 - (60 * b) / tot, yb - 8, (60 * b) / tot, 16, C.orange); }
      d.text('위 ' + a, sx - 70, ya - 16, C.green, 11); d.text('아래 ' + b, sx - 70, yb + 20, C.orange, 11);
      d.text('고전 예측: 연속적으로 퍼짐 · 실제: 정확히 두 갈래 (스핀 ±ħ/2)', 20, 30, C.text, 12);
    },
  });

  add({
    id: 'bloch', cat: '스핀과 양자 정보', name: '양자 중첩과 측정 (블로흐 구)', en: 'Superposition & Measurement — the Bloch Sphere',
    tex: ['|\\psi\\rangle = \\cos\\frac{\\theta}{2}|0\\rangle + e^{i\\phi}\\sin\\frac{\\theta}{2}|1\\rangle', 'P(0) = \\cos^2\\frac{\\theta}{2},\\qquad P(1) = \\sin^2\\frac{\\theta}{2}'],
    short: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle',
    desc: '두 상태 |0⟩과 |1⟩의 중첩인 큐비트(스핀 ½)의 상태는 블로흐 구 위의 한 점으로 나타낼 수 있다. 측정하면 결과는 항상 0 또는 1 중 하나이며(상태가 그 결과로 "붕괴"), 확률은 상태 벡터의 방향으로 정해진다. 같은 상태를 여러 번 준비해 측정하면 히스토그램이 이론 확률에 다가간다. 자기장 속 스핀은 z축 둘레로 세차 운동(라머 세차)을 하므로 φ가 변해 X 방향 측정 확률이 진동한다. 양자 컴퓨터의 기본 단위이다.',
    hint: '구를 드래그해 회전할 수 있습니다.',
    params: [R('th', '극각 θ', '°', 0, 180, 1, 60), R('ph', '방위각 φ', '°', 0, 360, 1, 30), R('w', '세차 각속도 ω (자기장)', 'rad/s', 0, 3, 0.05, 0.6), Sel('basis', '측정 방향', [['z', 'Z 기저 (|0⟩, |1⟩)'], ['x', 'X 기저 (|+⟩, |−⟩)'], ['y', 'Y 기저 (|+i⟩, |−i⟩)']], 'z', { reset: 1 })],
    out: (P, S) => {
      const th = M.rad(P.th), ph = M.rad(P.ph) + S.phs, v = [sin(th) * cos(ph), sin(th) * sin(ph), cos(th)], k = P.basis === 'x' ? 0 : P.basis === 'y' ? 1 : 2, p = (1 + v[k]) / 2;
      return [['계수 cos(θ/2)', cos(th / 2), ''], ['계수 |e^{iφ}sin(θ/2)|', sin(th / 2), ''], ['이론 P(+) (' + P.basis.toUpperCase() + ' 기저)', p * 100, '%'], ['측정 결과 + / −', S.c[0] + ' / ' + S.c[1], '회'], ['측정 비율 +', S.c[0] + S.c[1] ? (S.c[0] / (S.c[0] + S.c[1])) * 100 : 0, '%'], ['블로흐 벡터 (x, y, z)', '(' + v.map((q) => fmt(q, 2)).join(', ') + ')', '']];
    },
    init(S) { S.yaw = 0.7; S.pitch = 0.35; S.phs = 0; S.c = [0, 0]; S.acc = 0; S.last = null; S.flash = 0; },
    change(S, P, k) { if (k !== 'w') S.c = [0, 0]; },
    pointer(type, x, y, S) { return PL.dragRotate(type, x, y, S); },
    step(S, P, dt) {
      S.phs += P.w * dt; S.acc += dt; S.flash = max(0, S.flash - dt);
      if (S.acc > 0.12) {
        S.acc = 0;
        const th = M.rad(P.th), ph = M.rad(P.ph) + S.phs, v = [sin(th) * cos(ph), sin(th) * sin(ph), cos(th)], k = P.basis === 'x' ? 0 : P.basis === 'y' ? 1 : 2;
        const r = Math.random() < (1 + v[k]) / 2; S.c[r ? 0 : 1]++; S.last = r; S.flash = 0.1;
        if (P.w > 0 && S.c[0] + S.c[1] > 400) S.c = [0, 0];
      }
    },
    draw(d, S, P) {
      d.clear(false);
      const cam = PL.cam(S.yaw, S.pitch, 170, 300, 290), th = M.rad(P.th), ph = M.rad(P.ph) + S.phs;
      const ring = (f, col, lw) => { const pts = []; for (let a = 0; a <= 64; a++) pts.push(f((2 * PI * a) / 64)); d.poly(pts.map((q) => cam(...q)), col, lw); };
      ring((a) => [cos(a), sin(a), 0], 'rgba(160,175,210,0.45)', 1.2);
      ring((a) => [cos(a), 0, sin(a)], 'rgba(160,175,210,0.2)', 1);
      ring((a) => [0, cos(a), sin(a)], 'rgba(160,175,210,0.2)', 1);
      [[[0, 0, 1.25], '|0⟩'], [[0, 0, -1.25], '|1⟩'], [[1.25, 0, 0], '|+⟩'], [[-1.25, 0, 0], '|−⟩'], [[0, 1.25, 0], '|+i⟩']].forEach(([p, l]) => { const q = cam(...p), o = cam(0, 0, 0); d.line(o[0], o[1], q[0], q[1], 'rgba(255,255,255,0.18)', 1); d.text(l, q[0], q[1], C.text, 13, 'center', 'middle', true); });
      const v = [sin(th) * cos(ph), sin(th) * sin(ph), cos(th)], o = cam(0, 0, 0), e = cam(...v), pz = cam(v[0], v[1], 0);
      d.line(e[0], e[1], pz[0], pz[1], 'rgba(255,216,77,0.4)', 1, [3, 3]); d.line(o[0], o[1], pz[0], pz[1], 'rgba(255,216,77,0.4)', 1, [3, 3]);
      d.arrow(o[0], o[1], e[0], e[1], C.yellow, 3.5);
      d.circle(e[0], e[1], 6, C.yellow);
      const tr = []; for (let a = 0; a <= 64; a++) { const q = (2 * PI * a) / 64; tr.push(cam(sin(th) * cos(q), sin(th) * sin(q), cos(th))); }
      d.poly(tr, 'rgba(255,216,77,0.25)', 1, false, null, [3, 4]);
      const k = P.basis === 'x' ? 0 : P.basis === 'y' ? 1 : 2, p = (1 + v[k]) / 2, tot = S.c[0] + S.c[1];
      const bx = 610, bw = 250;
      d.text('측정 (' + P.basis.toUpperCase() + ' 기저) 결과 히스토그램', bx, 60, C.text, 13, 'left', 'middle', true);
      [['+', S.c[0], C.green, p], ['−', S.c[1], C.orange, 1 - p]].forEach(([l, c, col, th0], i) => {
        const y = 110 + i * 90, f = tot ? c / tot : 0;
        d.rect(bx, y, bw, 40, 'rgba(255,255,255,0.05)', null, 0, 6); d.rect(bx, y, bw * f, 40, col, null, 0, 6);
        d.line(bx + bw * th0, y - 6, bx + bw * th0, y + 46, '#fff', 2);
        d.text(l + '  ' + c + '회', bx + 8, y + 20, '#0a1020', 13, 'left', 'middle', true);
      });
      d.text('흰 선: 이론 확률', bx, 300, C.dim, 12);
      if (S.flash > 0) d.label('측정 결과: ' + (S.last ? '+' : '−'), bx + 125, 340, S.last ? C.green : C.orange, 14);
      d.text('측정은 같은 상태를 새로 준비해 반복', bx, 380, C.dim, 12);
    },
  });

  add({
    id: 'doubleslit', cat: '스핀과 양자 정보', name: '이중 슬릿 실험 (입자 하나의 간섭)', en: 'Double-Slit Experiment with Single Particles',
    tex: ['P(y) = |\\psi_1 + \\psi_2|^2 = |\\psi_1|^2 + |\\psi_2|^2 + 2\\,\\mathrm{Re}(\\psi_1^*\\psi_2)', '\\text{경로를 관측하면 } P(y) = |\\psi_1|^2 + |\\psi_2|^2'],
    short: 'P = |\\psi_1 + \\psi_2|^2',
    desc: '전자를 한 번에 하나씩 이중 슬릿으로 보내면, 각 전자는 스크린의 한 점에 입자처럼 도착한다. 그러나 수천 개가 쌓이면 간섭무늬가 나타난다 — 전자 하나하나가 두 슬릿을 동시에 지나는 파동처럼 자기 자신과 간섭한 것이다. 어느 슬릿을 지났는지 관측하는 장치를 켜면 간섭무늬가 사라진다. 파인만은 이것을 "양자역학의 유일한 신비"라고 불렀다.',
    params: [R('lam', '드브로이 파장 (상대값)', '', 0.5, 2, 0.05, 1), R('dd', '슬릿 간격 (상대값)', '', 2, 8, 0.1, 5), R('rate', '발사율', '개/s', 5, 500, 5, 120), Chk('watch', '어느 슬릿을 지나는지 관측', false, { reset: 1 })],
    P(P, y) { const a = 1.2, u = (PI * a * y) / (P.lam * 30), env = abs(u) < 1e-9 ? 1 : (sin(u) / u) ** 2; return P.watch ? env : env * cos((PI * P.dd * y) / (P.lam * 30)) ** 2; },
    out: (P, S) => [['도착한 입자 수', S.n, '개'], ['무늬 간격 (상대값) λL/d', (P.lam * 30) / P.dd, ''], ['상태', P.watch ? '경로 관측 중 → 간섭 없음' : '경로 모름 → 간섭무늬', '']],
    init(S) { S.n = 0; S.acc = 0; S.fly = []; S.cv = document.createElement('canvas'); S.cv.width = 60; S.cv.height = 440; S.hist = new Float64Array(110); },
    change(S) { S.n = 0; S.hist.fill(0); const c = S.cv.getContext('2d'); c.clearRect(0, 0, 60, 440); },
    step(S, P, dt) {
      S.acc += dt * P.rate;
      while (S.acc > 1) {
        S.acc -= 1;
        let y;
        for (let k = 0; k < 200; k++) { y = (Math.random() - 0.5) * 44; if (Math.random() < this.P(P, y)) break; }
        const slit = Math.random() < 0.5 ? -1 : 1;
        S.fly.push({ s: 0, y, slit });
      }
      S.fly.forEach((f) => (f.s += dt * 1.6));
      const c = S.cv.getContext('2d');
      S.fly = S.fly.filter((f) => {
        if (f.s < 1) return true;
        const py = 220 + f.y * 10;
        c.fillStyle = 'rgba(120,220,255,0.85)'; c.fillRect(Math.random() * 56 + 2, py, 2, 2);
        const b = floor(((f.y + 22) / 44) * 110); if (b >= 0 && b < 110) S.hist[b]++;
        S.n++; return false;
      });
    },
    draw(d, S, P) {
      d.clear();
      const sx = 330, scx = 600;
      d.circle(60, 280, 14, '#5d6b8f'); d.text('전자총', 60, 310, C.dim, 11, 'center');
      const sy = (P.dd / 8) * 60;
      d.rect(sx - 6, 40, 12, 240 - sy - 8, '#9aa6c4'); d.rect(sx - 6, 280 - sy + 8, 12, 2 * sy - 16, '#9aa6c4'); d.rect(sx - 6, 280 + sy + 8, 12, 520 - 280 - sy - 8, '#9aa6c4');
      if (P.watch) { d.glow(sx + 20, 280 - sy, 18, 'rgba(255,92,108,0.7)'); d.glow(sx + 20, 280 + sy, 18, 'rgba(255,92,108,0.7)'); d.text('관측 장치 ON', sx + 30, 70, C.red, 12); }
      S.fly.forEach((f) => {
        if (f.s < 0.5) {
          const u = f.s / 0.5, x = 60 + (sx - 60) * u;
          if (P.watch) d.circle(x, 280 + f.slit * sy * u, 2.6, C.cyan);
          else { d.circle(x, 280 - sy * u, 2.4, 'rgba(120,220,255,0.45)'); d.circle(x, 280 + sy * u, 2.4, 'rgba(120,220,255,0.45)'); }
        } else {
          const u = (f.s - 0.5) / 0.5, y0 = P.watch ? 280 + f.slit * sy : 280;
          d.circle(sx + (scx - sx) * u, y0 + (280 + f.y * 10 - y0) * u, 2.6, C.cyan);
        }
      });
      d.rect(scx, 60, 60, 440, '#0c1226', '#3a4668', 1);
      d.img(S.cv, scx, 60, 60, 440);
      d.text('스크린', scx + 30, 50, C.dim, 11, 'center');
      const mx = max(1, ...S.hist), p = d.plot({ x: 700, y: 60, w: 170, h: 440, xmin: 0, xmax: 1.15, ymin: -22, ymax: 22, xticks: false, yticks: false, title: '도착 분포' });
      for (let k = 0; k < 110; k++) { const y = -22 + ((k + 0.5) * 44) / 110, v = S.hist[k] / mx; d.rect(p.X(0), p.Y(y) - 2, p.X(v) - p.X(0), 4, 'rgba(56,189,248,0.6)'); }
      const pts = []; for (let k = 0; k <= 300; k++) { const y = -22 + (44 * k) / 300; pts.push([this.P(P, y), y]); }
      p.pts(pts, C.yellow, 1.8);
    },
  });

  const EL = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn'.split(' ');
  const ELK = '수소 헬륨 리튬 베릴륨 붕소 탄소 질소 산소 플루오린 네온 나트륨 마그네슘 알루미늄 규소 인 황 염소 아르곤 칼륨 칼슘 스칸듐 타이타늄 바나듐 크로뮴 망가니즈 철 코발트 니켈 구리 아연 갈륨 저마늄 비소 셀레늄 브로민 크립톤 루비듐 스트론튬 이트륨 지르코늄 나이오븀 몰리브데넘 테크네튬 루테늄 로듐 팔라듐 은 카드뮴 인듐 주석 안티모니 텔루륨 아이오딘 제논 세슘 바륨 란타넘 세륨 프라세오디뮴 네오디뮴 프로메튬 사마륨 유로퓸 가돌리늄 터븀 디스프로슘 홀뮴 어븀 툴륨 이터븀 루테튬 하프늄 탄탈럼 텅스텐 레늄 오스뮴 이리듐 백금 금 수은 탈륨 납 비스무트 폴로늄 아스타틴 라돈'.split(' ');
  const ORDER = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1], [6, 0], [4, 3], [5, 2], [6, 1]];
  const EXC = { 24: [['4s', -1], ['3d', 1]], 29: [['4s', -1], ['3d', 1]], 41: [['5s', -1], ['4d', 1]], 42: [['5s', -1], ['4d', 1]], 44: [['5s', -1], ['4d', 1]], 45: [['5s', -1], ['4d', 1]], 46: [['5s', -2], ['4d', 2]], 47: [['5s', -1], ['4d', 1]], 57: [['4f', -1], ['5d', 1]], 58: [['4f', -1], ['5d', 1]], 64: [['4f', -1], ['5d', 1]], 78: [['6s', -1], ['5d', 1]], 79: [['6s', -1], ['5d', 1]] };
  function config(Z) {
    const occ = {}; let left = Z;
    for (const [n, l] of ORDER) { if (left <= 0) break; const c = min(left, 2 * (2 * l + 1)); occ[n + 'spdf'[l]] = c; left -= c; }
    (EXC[Z] || []).forEach(([k, dv]) => { occ[k] = (occ[k] || 0) + dv; if (!occ[k]) delete occ[k]; });
    return occ;
  }
  add({
    id: 'pauli', cat: '원자 구조', name: '파울리 배타 원리와 전자 배치', en: 'Pauli Exclusion Principle & Electron Configuration',
    tex: ['\\text{한 원자 안에서 네 양자수 } (n, \\ell, m_\\ell, m_s) \\text{ 가 모두 같은 전자는 없다}', '1s < 2s < 2p < 3s < 3p < 4s < 3d < 4p < \\cdots\\quad(n + \\ell\\ \\text{규칙})'],
    short: '(n,\\ell,m_\\ell,m_s)\\ \\text{중복 불가}',
    desc: '전자는 페르미온이므로 같은 양자 상태에 두 개가 들어갈 수 없다(파울리 배타 원리). 그래서 한 오비탈에는 스핀이 반대인 전자 두 개(↑↓)까지만 들어가고, 원자의 전자들은 에너지가 낮은 오비탈부터 차례로 채워진다(쌓음 원리, n + ℓ이 작은 순). 같은 에너지의 오비탈에는 먼저 한 개씩 같은 스핀으로 들어간다(훈트 규칙). 이 배치가 주기율표의 구조와 원소의 화학적 성질을 결정한다. (Cr, Cu 등은 예외 배치를 반영)',
    params: [R('Z', '원자 번호 Z', '', 1, 86, 1, 26)],
    out(P) {
      const occ = config(P.Z), keys = Object.keys(occ);
      let unp = 0; keys.forEach((k) => { const l = 'spdf'.indexOf(k[k.length - 1]), nb = 2 * l + 1, e = occ[k]; unp += e <= nb ? e : 2 * nb - e; });
      const nobles = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']], core = nobles.find(([z]) => z < P.Z);
      let short = keys.map((k) => k + occ[k]).join(' ');
      if (core) { const co = config(core[0]); short = '[' + core[1] + '] ' + keys.filter((k) => occ[k] !== co[k]).map((k) => k + occ[k]).join(' '); }
      const maxN = max(...keys.map((k) => +k[0]));
      const val = keys.filter((k) => +k[0] === maxN).reduce((s, k) => s + occ[k], 0);
      return [['원소', ELK[P.Z - 1] + ' (' + EL[P.Z - 1] + ')', ''], ['전자 배치', short, ''], ['전체 배치', keys.map((k) => k + occ[k]).join(' '), ''], ['홀전자 수 (훈트 규칙)', unp, '개'], ['가장 바깥 껍질 전자 수', val, '개']];
    },
    init(S) { S.shown = 0; },
    change(S) { S.shown = 0; },
    step(S, P, dt) { S.shown = min(P.Z, S.shown + dt * 30); },
    draw(d, S, P) {
      d.clear();
      const occ = config(P.Z), shown = floor(S.shown);
      d.text(EL[P.Z - 1], 90, 90, C.cyan, 60, 'center', 'middle', true);
      d.text(ELK[P.Z - 1] + '  (Z = ' + P.Z + ')', 90, 140, C.text, 14, 'center');
      const shells = {}; Object.keys(occ).forEach((k) => (shells[k[0]] = (shells[k[0]] || 0) + occ[k]));
      const cx = 90, cy = 330;
      d.circle(cx, cy, 10, C.red);
      Object.keys(shells).forEach((n, i) => { const r = 24 + i * 18; d.circle(cx, cy, r, null, 'rgba(160,175,210,0.3)', 1); for (let e = 0; e < shells[n]; e++) { const a = (2 * PI * e) / shells[n] + i; d.circle(cx + r * cos(a), cy + r * sin(a), 2.6, C.cyan); } });
      d.text('전자 껍질 (K, L, M, …)', cx, 470, C.dim, 11, 'center');
      const names = ORDER.map(([n, l]) => n + 'spdf'[l]);
      let last = 0;
      names.forEach((k, i) => { if (occ[k]) last = i; });
      const order = names.slice(0, last + 1);
      let count = 0;
      order.forEach((k, i) => {
        const l = 'spdf'.indexOf(k[1]), nb = 2 * l + 1, e = occ[k] || 0, y = 515 - i * 32, x0 = 300;
        d.text(k, x0 - 12, y, C.text, 13, 'right', 'middle', true);
        for (let b = 0; b < nb; b++) {
          const bx = x0 + b * 44;
          d.rect(bx, y - 13, 40, 26, 'rgba(255,255,255,0.03)', 'rgba(160,175,210,0.5)', 1, 3);
          const up = b < e ? 1 : 0, dn = b < e - nb ? 1 : 0;
          if (up && count + b < shown) d.arrow(bx + 14, y + 9, bx + 14, y - 9, C.yellow, 2, 6);
          if (dn && count + nb + b < shown) d.arrow(bx + 27, y - 9, bx + 27, y + 9, C.cyan, 2, 6);
        }
        count += e;
      });
      d.text('에너지 ↑ (쌓음 순서)', 300, 30, C.dim, 12);
    },
  });

  add({
    id: 'bell', cat: '스핀과 양자 정보', name: '양자 얽힘과 벨 부등식', en: "Quantum Entanglement & Bell's Inequality",
    tex: ['|\\Psi^-\\rangle = \\frac{1}{\\sqrt2}\\left(|{\\uparrow\\downarrow}\\rangle - |{\\downarrow\\uparrow}\\rangle\\right),\\qquad E(a,b) = -\\cos(a - b)', "S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')| \\le 2\\ (\\text{국소 실재론}),\\qquad S_{\\text{양자}} = 2\\sqrt2"],
    short: 'S \\le 2\\ \\text{vs}\\ 2\\sqrt2',
    desc: '얽힌 두 입자는 아무리 멀리 떨어져도 하나의 상태로 기술된다. 앨리스와 밥이 각자 고른 방향으로 스핀을 측정하면 개별 결과는 완전히 무작위이지만, 두 결과의 상관관계는 −cos(a − b)를 따른다. 벨은 입자가 미리 정해진 값(숨은 변수)을 가지고 신호가 빛보다 빠를 수 없다면(국소 실재론) CHSH 값 S가 2를 넘을 수 없음을 증명했다. 실험은 양자역학의 예측 2√2 ≈ 2.83을 확인했다(2022 노벨상). 비교 모드에서 숨은 변수 모형을 시뮬레이션해 보자.',
    params: [R('a', '앨리스 각도 a', '°', 0, 180, 1, 0), R('a2', "앨리스 각도 a′", '°', 0, 180, 1, 90), R('b', '밥 각도 b', '°', 0, 180, 1, 45), R('b2', "밥 각도 b′", '°', 0, 180, 1, 135), Sel('mode', '모형', [['qm', '양자역학 (얽힘)'], ['lhv', '국소 숨은 변수 모형 (고전)']], 'qm', { reset: 1 })],
    Eq: (dd) => -cos(M.rad(dd)),
    El: (dd) => { const x = abs(((M.rad(dd) + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI); return -1 + (2 * x) / PI; },
    init(S) { S.n = [[0, 0], [0, 0], [0, 0], [0, 0]]; S.acc = 0; S.fly = []; S.last = null; },
    change(S) { S.n = [[0, 0], [0, 0], [0, 0], [0, 0]]; },
    meas(P, A, B) {
      if (P.mode === 'qm') { const ra = Math.random() < 0.5 ? 1 : -1, same = (1 - cos(M.rad(A - B))) / 2; return [ra, Math.random() < same ? ra : -ra]; }
      const lam = Math.random() * 2 * PI, sa = cos(M.rad(A) - lam) >= 0 ? 1 : -1, sb = cos(M.rad(B) - lam) >= 0 ? -1 : 1; return [sa, sb];
    },
    Ems(S) { return S.n.map(([s, df]) => (s + df ? (s - df) / (s + df) : 0)); },
    out(P, S) {
      const E = this.Ems(S), Sv = abs(E[0] - E[1] + E[2] + E[3]), tot = S.n.reduce((s, q) => s + q[0] + q[1], 0);
      const Et = (x, y) => (P.mode === 'qm' ? this.Eq(x - y) : this.El(x - y)), St = abs(Et(P.a, P.b) - Et(P.a, P.b2) + Et(P.a2, P.b) + Et(P.a2, P.b2));
      return [['측정한 쌍의 수', tot, '쌍'], ['측정된 S', Sv, ''], ['이론 S (현재 모형·각도)', St, ''], ['고전적 한계', 2, ''], ['양자 최대 (치렐손 한계) 2√2', 2 * Math.SQRT2, ''], ['결론', Sv > 2.05 && tot > 400 ? '벨 부등식 위반 → 국소 실재론으로 설명 불가' : '아직 판단 불가 또는 S ≤ 2', '']];
    },
    step(S, P, dt) {
      S.acc += dt * 40;
      while (S.acc > 1) {
        S.acc -= 1;
        const ia = Math.random() < 0.5 ? 0 : 1, ib = Math.random() < 0.5 ? 0 : 1, A = ia ? P.a2 : P.a, B = ib ? P.b2 : P.b, [ra, rb] = this.meas(P, A, B), k = ia * 2 + ib;
        S.n[k][ra === rb ? 0 : 1]++;
        S.fly.push({ s: 0, A, B, ra, rb });
      }
      S.fly.forEach((f) => (f.s += dt * 1.8));
      S.fly = S.fly.filter((f) => { if (f.s >= 1) { S.last = f; return false; } return true; });
    },
    draw(d, S, P) {
      d.clear();
      const cy = 160, cx = 450;
      d.glow(cx, cy, 30, 'rgba(167,139,250,0.7)'); d.circle(cx, cy, 12, C.purple);
      d.text('얽힌 쌍 발생기', cx, cy + 34, C.purple, 12, 'center');
      S.fly.forEach((f) => { d.circle(cx - f.s * 300, cy, 3, C.cyan); d.circle(cx + f.s * 300, cy, 3, C.pink); });
      const det = (x, ang, lbl, col, res) => {
        d.circle(x, cy, 46, '#111a37', col, 2.5);
        const a = M.rad(ang); d.line(x - 38 * sin(a), cy + 38 * cos(a), x + 38 * sin(a), cy - 38 * cos(a), col, 3);
        d.text(lbl + ' ' + ang + '°', x, cy - 62, col, 13, 'center', 'middle', true);
        if (res != null) d.circle(x, cy + 66, 9, res > 0 ? C.green : C.red);
      };
      det(110, S.last ? S.last.A : P.a, '앨리스', C.cyan, S.last ? S.last.ra : null);
      det(790, S.last ? S.last.B : P.b, '밥', C.pink, S.last ? S.last.rb : null);
      d.text('초록 = +1, 빨강 = −1', 450, 245, C.dim, 11, 'center');
      const p = d.plot({ x: 70, y: 290, w: 520, h: 230, xmin: 0, xmax: 180, ymin: -1.1, ymax: 1.1, title: '상관 E(a − b): 양자(노랑) vs 숨은 변수(보라 점선)', xl: '각도 차 |a − b| (°)', nx: 6 });
      p.fn((x) => this.Eq(x), C.yellow, 2.5);
      p.fn((x) => this.El(x), C.purple, 2, 200, [6, 4]);
      const E = this.Ems(S), dd = [P.a - P.b, P.a - P.b2, P.a2 - P.b, P.a2 - P.b2];
      dd.forEach((q, i) => { const x = abs(((q + 180) % 360 + 360) % 360 - 180); p.dot(x, E[i], C.cyan, 5); });
      const Sv = abs(E[0] - E[1] + E[2] + E[3]);
      d.text('CHSH 값 S', 640, 320, C.text, 14, 'left', 'middle', true);
      d.text(fmt(Sv, 3), 640, 370, Sv > 2 ? C.green : C.orange, 40, 'left', 'middle', true);
      const bx = 640, bw = 230, sc = bw / 3;
      d.rect(bx, 420, bw, 18, 'rgba(255,255,255,0.05)'); d.rect(bx, 420, min(bw, Sv * sc), 18, Sv > 2 ? C.green : C.orange);
      d.line(bx + 2 * sc, 410, bx + 2 * sc, 446, C.red, 2); d.text('2 (고전 한계)', bx + 2 * sc, 460, C.red, 11, 'center');
      d.line(bx + 2.828 * sc, 410, bx + 2.828 * sc, 446, C.yellow, 2); d.text('2√2', bx + 2.828 * sc, 478, C.yellow, 11, 'center');
    },
  });
})();
