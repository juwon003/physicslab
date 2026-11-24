/* =====================================================================
 * PhysicsLab — engine.js
 * 공용 상수 · 수치 도구 · 캔버스 그리기 도구 · 시뮬레이션 실행기
 * 모든 시뮬레이션은 900×560 논리 좌표계에서 그린다(화면 크기에 맞춰 자동 확대/축소).
 * ===================================================================== */
(function (global) {
  'use strict';
  const PL = (global.PL = global.PL || {});
  const W = 900, H = 560;
  PL.W = W; PL.H = H;
  const FONT = "'Pretendard','Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif";
  PL.FONT = FONT;

  /* ------------------------------------------------------------------
   * 분야 정의와 법칙 등록
   * ------------------------------------------------------------------ */
  PL.fields = [
    { id: 'classical', name: '고전역학', en: 'Classical Mechanics', color: '#ff9f43',
      desc: '뉴턴의 운동 법칙에서 해석역학까지 — 힘과 운동, 운동량, 에너지, 회전, 중력, 진동과 파동, 유체.' },
    { id: 'thermo', name: '열역학 · 통계역학', en: 'Thermodynamics & Statistical Mechanics', color: '#ff5c6c',
      desc: '열과 일, 엔트로피, 기체 분자 운동, 그리고 수많은 미시 상태의 통계에서 나오는 거시 법칙.' },
    { id: 'em', name: '전자기학 · 광학', en: 'Electromagnetism & Optics', color: '#38bdf8',
      desc: '전하와 전기장, 전기 회로, 자기장과 전자기 유도, 맥스웰 방정식, 그리고 빛의 굴절·회절·편광.' },
    { id: 'relativity', name: '상대성이론', en: 'Special & General Relativity', color: '#a78bfa',
      desc: '빛의 속력이 누구에게나 같다는 원리에서 출발한 시공간 — 시간 지연, E=mc², 블랙홀, 중력파, 팽창 우주.' },
    { id: 'quantum', name: '양자역학', en: 'Quantum Mechanics', color: '#4ade80',
      desc: '빛과 물질의 이중성, 슈뢰딩거 방정식, 불확정성 원리, 터널링, 스핀, 중첩과 얽힘.' },
    { id: 'modern', name: '양자장론 · 입자물리 · 응집물리', en: 'QFT, Particle & Condensed Matter Physics', color: '#f472b6',
      desc: '양자화된 장과 기본 입자, 원자핵과 붕괴, 그리고 고체 속 전자·격자가 만드는 집단 현상.' },
  ];
  PL.laws = [];
  PL.add = function (fid, law) {
    law.field = fid;
    law.params = law.params || [];
    PL.laws.push(law);
  };
  PL.field = (id) => PL.fields.find((f) => f.id === id);
  PL.lawsOf = (fid) => PL.laws.filter((l) => l.field === fid);

  /* 입력 변수 정의 도우미 */
  PL.R = (k, l, u, min, max, st, v, x) => Object.assign({ type: 'range', k, l, u, min, max, st, v }, x || {});
  PL.Sel = (k, l, opts, v, x) => Object.assign({ type: 'sel', k, l, opts, v }, x || {});
  PL.Chk = (k, l, v, x) => Object.assign({ type: 'chk', k, l, v: !!v }, x || {});

  /* ------------------------------------------------------------------
   * 색상
   * ------------------------------------------------------------------ */
  const C = (PL.C = {
    bg: '#0a1020', grid: 'rgba(130,150,200,0.075)', axis: 'rgba(190,205,235,0.6)',
    text: '#e3e9f6', dim: '#8d99b5', faint: '#3c4767', panel: 'rgba(8,13,30,0.82)',
    red: '#ff5c6c', orange: '#ff9f43', yellow: '#ffd84d', green: '#4ade80', teal: '#2dd4bf',
    cyan: '#38bdf8', blue: '#6a8dff', purple: '#a78bfa', pink: '#f472b6', white: '#ffffff',
  });

  /* ------------------------------------------------------------------
   * 물리 상수 (SI)
   * ------------------------------------------------------------------ */
  PL.K = {
    G: 6.674e-11, c: 2.99792458e8, h: 6.62607e-34, hbar: 1.054572e-34, kB: 1.380649e-23,
    e: 1.602177e-19, me: 9.10938e-31, mp: 1.672622e-27, mn: 1.674927e-27, u: 1.660539e-27,
    eps0: 8.854188e-12, mu0: 1.256637e-6, ke: 8.987552e9, NA: 6.02214e23, R: 8.314463,
    sigma: 5.670374e-8, a0: 5.29177e-11, g: 9.81, Msun: 1.989e30, Rsun: 6.957e8, Lsun: 3.828e26,
    Mearth: 5.972e24, Rearth: 6.371e6, AU: 1.495979e11, ly: 9.4607e15, pc: 3.0857e16,
    eV: 1.602177e-19, alpha: 1 / 137.036, wien: 2.897772e-3, yr: 3.15576e7,
  };

  /* ------------------------------------------------------------------
   * 수치 도구
   * ------------------------------------------------------------------ */
  const LNF = [0];
  for (let i = 1; i <= 5000; i++) LNF[i] = LNF[i - 1] + Math.log(i);
  const M = (PL.M = {
    clamp: (x, a, b) => (x < a ? a : x > b ? b : x),
    lerp: (a, b, t) => a + (b - a) * t,
    smooth: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t)),
    rand: (a = 0, b = 1) => a + Math.random() * (b - a),
    gauss() {
      let u = 0;
      while (!u) u = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
    },
    rad: (d) => (d * Math.PI) / 180,
    deg: (r) => (r * 180) / Math.PI,
    wrapAngle(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; },
    /* 4차 룽게-쿠타 (y: 배열) */
    rk4(f, y, t, h) {
      const n = y.length, k1 = f(t, y), y2 = new Array(n);
      for (let i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k1[i];
      const k2 = f(t + 0.5 * h, y2);
      for (let i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k2[i];
      const k3 = f(t + 0.5 * h, y2);
      for (let i = 0; i < n; i++) y2[i] = y[i] + h * k3[i];
      const k4 = f(t + h, y2), out = new Array(n);
      for (let i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
      return out;
    },
    lnfact: (n) => (n <= 5000 ? LNF[n] : n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n)),
    lnC: (n, k) => (k < 0 || k > n ? -Infinity : M.lnfact(n) - M.lnfact(k) - M.lnfact(n - k)),
    fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    /* 에르미트 다항식 H_n (물리학자 정의) */
    hermite(n, x) {
      if (n === 0) return 1;
      let h0 = 1, h1 = 2 * x;
      for (let k = 1; k < n; k++) { const h2 = 2 * x * h1 - 2 * k * h0; h0 = h1; h1 = h2; }
      return h1;
    },
    /* 일반화 라게르 다항식 L_n^a */
    laguerre(n, a, x) {
      if (n === 0) return 1;
      let l0 = 1, l1 = 1 + a - x;
      for (let k = 1; k < n; k++) { const l2 = ((2 * k + 1 + a - x) * l1 - (k + a) * l0) / (k + 1); l0 = l1; l1 = l2; }
      return l1;
    },
    /* 버금 르장드르 함수 P_l^m (m ≥ 0) */
    legendre(l, m, x) {
      let pmm = 1;
      if (m > 0) {
        const s = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
        let f = 1;
        for (let i = 1; i <= m; i++) { pmm *= -f * s; f += 2; }
      }
      if (l === m) return pmm;
      let pmm1 = x * (2 * m + 1) * pmm;
      if (l === m + 1) return pmm1;
      let pll = 0;
      for (let ll = m + 2; ll <= l; ll++) {
        pll = (x * (2 * ll - 1) * pmm1 - (ll + m - 1) * pmm) / (ll - m);
        pmm = pmm1; pmm1 = pll;
      }
      return pll;
    },
    /* 완전 타원 적분 [K(k), E(k)] (k: 모듈러스) — AGM */
    ellipKE(k) {
      let a = 1, b = Math.sqrt(Math.max(0, 1 - k * k)), c = k, s = 0.5 * c * c, p = 0.5;
      for (let i = 0; i < 30; i++) {
        const an = (a + b) / 2, bn = Math.sqrt(a * b);
        c = (a - b) / 2; a = an; b = bn; p *= 2; s += p * c * c;
        if (Math.abs(c) < 1e-14) break;
      }
      const K = Math.PI / (2 * a);
      return [K, K * (1 - s)];
    },
    /* 리만 제타 등 자주 쓰는 값 */
    zeta32: 2.6123753,
    /* 이분법 */
    bisect(f, a, b, it = 80) {
      let fa = f(a);
      for (let i = 0; i < it; i++) {
        const m = 0.5 * (a + b), fm = f(m);
        if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m;
      }
      return 0.5 * (a + b);
    },
    linspace(a, b, n) { const r = []; for (let i = 0; i < n; i++) r.push(a + ((b - a) * i) / (n - 1)); return r; },
    sum: (arr) => arr.reduce((s, v) => s + v, 0),
  });

  /* ------------------------------------------------------------------
   * 숫자 표기
   * ------------------------------------------------------------------ */
  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const sup = (n) => String(n).split('').map((ch) => SUP[ch] || ch).join('');
  PL.sup = sup;
  function trimZeros(s) {
    return s.indexOf('.') >= 0 && s.indexOf('e') < 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  }
  /* 결과 표시용 (유니코드) */
  PL.fmt = function (x, sig = 4) {
    if (typeof x === 'string') return x;
    if (typeof x === 'boolean') return x ? '예' : '아니오';
    if (x === Infinity) return '∞';
    if (x === -Infinity) return '−∞';
    if (x == null || isNaN(x)) return '—';
    if (x === 0) return '0';
    const a = Math.abs(x);
    if (a >= 1e6 || a < 1e-3) {
      let e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e);
      if (Math.abs(+m.toFixed(2)) >= 10) { e++; m /= 10; }
      return trimZeros(m.toFixed(2)).replace('-', '−') + '×10' + sup(e);
    }
    let s = a >= 1e4 ? x.toFixed(0) : x.toPrecision(sig);
    if (s.indexOf('e') >= 0) s = String(+s);
    return trimZeros(s).replace('-', '−');
  };
  /* 대입식(LaTeX)용 */
  PL.ftex = function (x, sig = 3) {
    if (typeof x === 'string') return x;
    if (x === Infinity) return '\\infty';
    if (x === -Infinity) return '-\\infty';
    if (x == null || isNaN(x)) return '?';
    if (x === 0) return '0';
    const a = Math.abs(x);
    if (a >= 1e5 || a < 1e-3) {
      let e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e);
      if (Math.abs(+m.toFixed(sig - 1)) >= 10) { e++; m /= 10; }
      return trimZeros(m.toFixed(sig - 1)) + '\\times10^{' + e + '}';
    }
    let s = a >= 1e4 ? x.toFixed(0) : x.toPrecision(sig);
    if (s.indexOf('e') >= 0) s = String(+s);
    return trimZeros(s);
  };

  /* ------------------------------------------------------------------
   * 색 도구 · 컬러맵 · 파장/흑체 색
   * ------------------------------------------------------------------ */
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  PL.hex2rgb = hex2rgb;
  PL.rgba = (hex, a) => { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; };
  PL.rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  PL.mix = (h1, h2, t) => {
    const a = hex2rgb(h1), b = hex2rgb(h2);
    return `rgb(${(a[0] + (b[0] - a[0]) * t) | 0},${(a[1] + (b[1] - a[1]) * t) | 0},${(a[2] + (b[2] - a[2]) * t) | 0})`;
  };
  PL.hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  /* 0(차가움)→1(뜨거움) 온도 색 */
  PL.heatColor = (t, a = 1) => {
    t = M.clamp(t, 0, 1);
    const stops = [[60, 110, 255], [70, 200, 255], [250, 240, 120], [255, 140, 40], [255, 50, 50]];
    const x = t * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(x)), f = x - k;
    const c = stops[k].map((v, i) => v + (stops[k + 1][i] - v) * f);
    return PL.rgb(c, a);
  };

  function makeLUT(stops) {
    const lut = [];
    for (let i = 0; i < 256; i++) {
      const t = (i / 255) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(t)), f = t - k;
      const a = stops[k], b = stops[k + 1];
      lut.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, 255]);
    }
    return lut;
  }
  const LUT = {
    inferno: makeLUT([[0, 0, 4], [31, 12, 72], [85, 15, 109], [136, 34, 106], [186, 54, 85], [227, 89, 51], [249, 140, 10], [249, 201, 50], [252, 255, 164]]),
    viridis: makeLUT([[68, 1, 84], [71, 44, 122], [59, 81, 139], [44, 113, 142], [33, 144, 141], [39, 173, 129], [92, 200, 99], [170, 220, 50], [253, 231, 37]]),
    div: makeLUT([[150, 210, 255], [50, 120, 235], [18, 44, 115], [8, 12, 28], [115, 30, 34], [230, 85, 55], [255, 210, 130]]),
    ice: makeLUT([[4, 8, 20], [10, 40, 90], [30, 100, 170], [90, 170, 230], [210, 240, 255]]),
  };
  PL.cmap = {
    inferno: (t) => LUT.inferno[(M.clamp(t, 0, 1) * 255) | 0],
    viridis: (t) => LUT.viridis[(M.clamp(t, 0, 1) * 255) | 0],
    ice: (t) => LUT.ice[(M.clamp(t, 0, 1) * 255) | 0],
    div: (t) => LUT.div[(M.clamp((t + 1) / 2, 0, 1) * 255) | 0], // t ∈ [-1, 1]
  };

  /* 파장(nm) → RGB */
  PL.wl2rgb = function (wl) {
    let r = 0, g = 0, b = 0;
    if (wl < 380) return [150, 90, 230];
    if (wl > 780) return [150, 30, 30];
    if (wl < 440) { r = -(wl - 440) / 60; b = 1; }
    else if (wl < 490) { g = (wl - 440) / 50; b = 1; }
    else if (wl < 510) { g = 1; b = -(wl - 510) / 20; }
    else if (wl < 580) { r = (wl - 510) / 70; g = 1; }
    else if (wl < 645) { r = 1; g = -(wl - 645) / 65; }
    else r = 1;
    let f = 1;
    if (wl < 420) f = 0.3 + (0.7 * (wl - 380)) / 40;
    else if (wl > 700) f = 0.3 + (0.7 * (780 - wl)) / 80;
    return [255 * Math.pow(r * f, 0.8), 255 * Math.pow(g * f, 0.8), 255 * Math.pow(b * f, 0.8)];
  };
  PL.wlCss = (wl, a = 1) => PL.rgb(PL.wl2rgb(wl), a);
  PL.wlName = function (wl) { // nm
    if (wl < 0.01) return '감마선';
    if (wl < 10) return 'X선';
    if (wl < 380) return '자외선';
    if (wl < 450) return '가시광선 (보라)';
    if (wl < 495) return '가시광선 (파랑)';
    if (wl < 570) return '가시광선 (초록)';
    if (wl < 590) return '가시광선 (노랑)';
    if (wl < 620) return '가시광선 (주황)';
    if (wl <= 750) return '가시광선 (빨강)';
    if (wl < 1e6) return '적외선';
    if (wl < 1e9) return '마이크로파';
    return '전파';
  };
  /* 흑체 온도(K) → RGB (근사) */
  PL.bb2rgb = function (T) {
    const t = M.clamp(T, 1000, 40000) / 100;
    let r, g, b;
    r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    return [M.clamp(r, 0, 255), M.clamp(g, 0, 255), M.clamp(b, 0, 255)];
  };

  /* ------------------------------------------------------------------
   * 래스터(픽셀 이미지) · 등고선
   * ------------------------------------------------------------------ */
  /* fn(i, j) → [r,g,b(,a)] 배열(재사용 가능) */
  PL.raster = function (nx, ny, fn, cv) {
    cv = cv || document.createElement('canvas');
    if (cv.width !== nx) cv.width = nx;
    if (cv.height !== ny) cv.height = ny;
    const c = cv.getContext('2d'), im = c.createImageData(nx, ny), D = im.data;
    let p = 0;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const col = fn(i, j);
        D[p] = col[0]; D[p + 1] = col[1]; D[p + 2] = col[2]; D[p + 3] = col.length > 3 ? col[3] : 255;
        p += 4;
      }
    }
    c.putImageData(im, 0, 0);
    return cv;
  };
  /* 마칭 스퀘어 등고선 — grid[j*nx+i], 결과: [p1, p2, p1, p2, ...] (격자 좌표) */
  PL.contour = function (grid, nx, ny, level) {
    const segs = [];
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = grid[j * nx + i] - level, b = grid[j * nx + i + 1] - level;
        const c = grid[(j + 1) * nx + i + 1] - level, d = grid[(j + 1) * nx + i] - level;
        if (!(isFinite(a) && isFinite(b) && isFinite(c) && isFinite(d))) continue;
        const idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const T = () => [i + a / (a - b), j], Rr = () => [i + 1, j + b / (b - c)];
        const B = () => [i + d / (d - c), j + 1], L = () => [i, j + a / (a - d)];
        switch (idx) {
          case 1: case 14: segs.push(L(), B()); break;
          case 2: case 13: segs.push(B(), Rr()); break;
          case 3: case 12: segs.push(L(), Rr()); break;
          case 4: case 11: segs.push(T(), Rr()); break;
          case 5: segs.push(L(), T(), B(), Rr()); break;
          case 10: segs.push(L(), B(), T(), Rr()); break;
          case 6: case 9: segs.push(T(), B()); break;
          case 7: case 8: segs.push(L(), T()); break;
        }
      }
    }
    return segs;
  };

  /* 3차원 → 화면 투영 (z 위쪽) */
  PL.cam = function (yaw, pitch, scale, cx, cy) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return function (x, y, z) {
      const x1 = x * cyw - y * syw, y1 = x * syw + y * cyw;
      return [cx + scale * x1, cy - scale * (z * cp + y1 * sp), y1 * cp - z * sp];
    };
  };
  /* 드래그로 3D 회전 */
  PL.dragRotate = function (type, x, y, S) {
    if (type === 'down') { S._drag = [x, y, S.yaw, S.pitch]; return true; }
    if (type === 'move' && S._drag) {
      S.yaw = S._drag[2] + (x - S._drag[0]) * 0.01;
      S.pitch = M.clamp(S._drag[3] + (y - S._drag[1]) * 0.01, -0.2, 1.5);
    }
    if (type === 'up' || type === 'leave') S._drag = null;
    return false;
  };
  /* 매개변수 키가 바뀔 때만 재계산 */
  PL.memo = function (S, name, key, fn) {
    S._memo = S._memo || {};
    const m = S._memo[name];
    if (m && m.key === key) return m.val;
    const val = fn();
    S._memo[name] = { key, val };
    return val;
  };

  /* ------------------------------------------------------------------
   * 그리기 도구
   * ------------------------------------------------------------------ */
  function shadeHex(hex, amt) {
    const c = hex2rgb(hex);
    const f = (v) => (amt < 0 ? v * (1 + amt) : v + (255 - v) * amt) | 0;
    return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`;
  }
  PL.shade = shadeHex;

  class Draw {
    constructor(g) { this.g = g; }
    reset() {
      const g = this.g;
      g.setLineDash([]); g.globalAlpha = 1; g.lineCap = 'round'; g.lineJoin = 'round';
      g.globalCompositeOperation = 'source-over'; g.lineDashOffset = 0;
    }
    clear(grid = true, bg = C.bg) {
      const g = this.g;
      this.reset();
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      if (grid) {
        g.strokeStyle = C.grid; g.lineWidth = 1; g.beginPath();
        for (let x = 0; x <= W; x += 30) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); }
        for (let y = 0; y <= H; y += 30) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); }
        g.stroke();
      }
    }
    line(x1, y1, x2, y2, col = C.text, lw = 2, dash) {
      const g = this.g;
      g.strokeStyle = col; g.lineWidth = lw;
      if (dash) g.setLineDash(dash);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      if (dash) g.setLineDash([]);
    }
    poly(pts, col = C.text, lw = 2, close = false, fill = null, dash) {
      if (!pts || pts.length < 2) return;
      const g = this.g;
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      if (close) g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (col) {
        g.strokeStyle = col; g.lineWidth = lw;
        if (dash) g.setLineDash(dash);
        g.stroke();
        if (dash) g.setLineDash([]);
      }
    }
    arrow(x1, y1, x2, y2, col = C.text, lw = 2.5, hs = 11) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      if (!(L > 1)) return;
      const ux = dx / L, uy = dy / L, h = Math.min(hs, L * 0.55), w = h * 0.55, g = this.g;
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - ux * h * 0.85, y2 - uy * h * 0.85); g.stroke();
      g.beginPath(); g.moveTo(x2, y2);
      g.lineTo(x2 - ux * h - uy * w, y2 - uy * h + ux * w);
      g.lineTo(x2 - ux * h + uy * w, y2 - uy * h - ux * w);
      g.closePath(); g.fill();
    }
    circle(x, y, r, fill, stroke, lw = 2) {
      if (!(r > 0)) return;
      const g = this.g;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
    }
    arc(x, y, r, a0, a1, col = C.text, lw = 2, ccw = false) {
      if (!(r > 0)) return;
      const g = this.g;
      g.strokeStyle = col; g.lineWidth = lw;
      g.beginPath(); g.arc(x, y, r, a0, a1, ccw); g.stroke();
    }
    rect(x, y, w, h, fill, stroke, lw = 2, r = 0) {
      const g = this.g;
      g.beginPath();
      if (r > 0 && g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h);
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
    }
    text(s, x, y, col = C.text, size = 13, align = 'left', base = 'middle', bold = false) {
      const g = this.g;
      g.fillStyle = col; g.font = (bold ? '600 ' : '') + size + 'px ' + FONT;
      g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y);
    }
    /* 배경이 있는 라벨 */
    label(s, x, y, col = C.text, size = 12, align = 'center') {
      const g = this.g;
      g.font = size + 'px ' + FONT;
      const w = g.measureText(s).width + 12, h = size + 9;
      const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      this.rect(bx, y - h / 2, w, h, 'rgba(5,9,22,0.85)', 'rgba(150,170,220,0.18)', 1, 6);
      this.text(s, bx + 6, y + 0.5, col, size, 'left', 'middle');
    }
    spring(x1, y1, x2, y2, n = 10, amp = 9, col = C.dim, lw = 2) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      if (L < 1) return;
      const ux = dx / L, uy = dy / L, px = -uy, py = ux, lead = Math.min(12, L * 0.1), seg = (L - 2 * lead) / (n * 2);
      const pts = [[x1, y1], [x1 + ux * lead, y1 + uy * lead]];
      for (let i = 0; i < n * 2; i++) {
        const s = lead + seg * (i + 0.5), side = i % 2 ? -1 : 1;
        pts.push([x1 + ux * s + px * amp * side, y1 + uy * s + py * amp * side]);
      }
      pts.push([x2 - ux * lead, y2 - uy * lead], [x2, y2]);
      this.poly(pts, col, lw);
    }
    ground(x1, x2, y, col = C.dim) {
      this.line(x1, y, x2, y, col, 2);
      const g = this.g;
      g.strokeStyle = col; g.lineWidth = 1; g.globalAlpha = 0.45; g.beginPath();
      for (let x = x1 + 8; x < x2; x += 12) { g.moveTo(x, y); g.lineTo(x - 8, y + 8); }
      g.stroke(); g.globalAlpha = 1;
    }
    wall(x, y1, y2, col = C.dim, side = -1) {
      this.line(x, y1, x, y2, col, 3);
      const g = this.g;
      g.strokeStyle = col; g.lineWidth = 1; g.globalAlpha = 0.45; g.beginPath();
      for (let y = y1; y < y2; y += 12) { g.moveTo(x, y); g.lineTo(x + 8 * side, y + 8); }
      g.stroke(); g.globalAlpha = 1;
    }
    glow(x, y, r, col, a = 1) {
      if (!(r > 0)) return;
      const g = this.g, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = a; g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }
    /* 음영 구 */
    ball(x, y, r, col = C.orange) {
      if (!(r > 0)) return;
      const g = this.g, gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
      gr.addColorStop(0, shadeHex(col, 0.75)); gr.addColorStop(0.35, col); gr.addColorStop(1, shadeHex(col, -0.6));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    /* 전하 */
    charge(x, y, q, r = 14) {
      const col = q > 0 ? C.red : q < 0 ? C.blue : C.dim;
      this.glow(x, y, r * 2.2, PL.rgba(col, 0.35));
      this.ball(x, y, r, col);
      const g = this.g;
      g.strokeStyle = '#fff'; g.lineWidth = 2.2; g.beginPath();
      g.moveTo(x - r * 0.45, y); g.lineTo(x + r * 0.45, y);
      if (q > 0) { g.moveTo(x, y - r * 0.45); g.lineTo(x, y + r * 0.45); }
      g.stroke();
    }
    /* 지면에 수직인 벡터 기호: out=true ⊙, false ⊗ */
    perp(x, y, r, out, col = C.dim, lw = 1.5) {
      this.circle(x, y, r, null, col, lw);
      if (out) this.circle(x, y, r * 0.28, col);
      else {
        const k = r * 0.6;
        this.line(x - k, y - k, x + k, y + k, col, lw);
        this.line(x - k, y + k, x + k, y - k, col, lw);
      }
    }
    img(cv, x, y, w, h, smooth = true) {
      const g = this.g;
      g.imageSmoothingEnabled = smooth;
      g.drawImage(cv, x, y, w, h);
      g.imageSmoothingEnabled = true;
    }
    clip(x, y, w, h) { const g = this.g; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); }
    unclip() { this.g.restore(); }
    alpha(a) { this.g.globalAlpha = a; }
    plot(o) { return new Plot(this, o); }
    /* 등고선 그리기: segs(격자 좌표) → 화면 */
    contour(segs, ox, oy, sx, sy, col = C.text, lw = 1.2) {
      const g = this.g;
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
      for (let k = 0; k < segs.length; k += 2) {
        g.moveTo(ox + segs[k][0] * sx, oy + segs[k][1] * sy);
        g.lineTo(ox + segs[k + 1][0] * sx, oy + segs[k + 1][1] * sy);
      }
      g.stroke();
    }
    /* 막대 그래프 패널: items [[이름, 값, 색]] */
    bars(x, y, w, h, items, vmax, title, unit = '') {
      this.rect(x, y, w, h, 'rgba(6,10,24,0.78)', 'rgba(160,180,225,0.25)', 1, 8);
      if (title) this.text(title, x + 10, y + 14, C.text, 12, 'left', 'middle', true);
      const n = items.length, top = y + 34, bh = h - 62, slot = (w - 20) / n, bw = Math.min(46, slot * 0.6);
      let neg = items.some((it) => it[1] < 0);
      const base = neg ? top + bh / 2 : top + bh, scale = (neg ? bh / 2 : bh) / (vmax || 1);
      this.line(x + 10, base, x + w - 10, base, C.dim, 1);
      items.forEach((it, i) => {
        const cx = x + 10 + slot * (i + 0.5), v = it[1], hh = M.clamp(v * scale, -bh, bh);
        this.rect(cx - bw / 2, base - Math.max(hh, 0), bw, Math.abs(hh), it[2]);
        this.text(it[0], cx, y + h - 14, C.dim, 11, 'center');
        this.text(PL.fmt(v, 3) + unit, cx, base - hh + (hh >= 0 ? -9 : 9), C.text, 11, 'center');
      });
    }
  }
  PL.Draw = Draw;

  /* ------------------------------------------------------------------
   * 그래프(좌표평면)
   * ------------------------------------------------------------------ */
  function niceTicks(a, b, n) {
    const span = b - a;
    if (!(span > 0)) return [a];
    const step0 = span / Math.max(1, n), mag = Math.pow(10, Math.floor(Math.log10(step0))), r = step0 / mag;
    const step = (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * mag, out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    return out;
  }
  PL.ticks = niceTicks;
  function tickFmt(v) {
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) {
      const e = Math.floor(Math.log10(a) + 1e-9), m = v / Math.pow(10, e);
      return (Math.abs(m - Math.round(m)) < 1e-6 ? Math.round(m) : m.toFixed(1)) + 'e' + e;
    }
    return String(+v.toPrecision(4)).replace('-', '−');
  }
  class Plot {
    constructor(d, o) {
      this.d = d;
      Object.assign(this, { x: 60, y: 40, w: 300, h: 200, xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 5, ny: 4, grid: true, frame: true, bg: true, ticks: true }, o);
      if (!(this.xmax > this.xmin)) this.xmax = this.xmin + 1;
      if (!(this.ymax > this.ymin)) this.ymax = this.ymin + 1;
      if (this.xlog) { this.lx0 = Math.log10(this.xmin); this.lx1 = Math.log10(this.xmax); }
      if (this.ylog) { this.ly0 = Math.log10(this.ymin); this.ly1 = Math.log10(this.ymax); }
      this.drawFrame();
    }
    X(v) {
      if (this.xlog) return this.x + ((Math.log10(v) - this.lx0) / (this.lx1 - this.lx0)) * this.w;
      return this.x + ((v - this.xmin) / (this.xmax - this.xmin)) * this.w;
    }
    Y(v) {
      if (this.ylog) return this.y + this.h - ((Math.log10(v) - this.ly0) / (this.ly1 - this.ly0)) * this.h;
      return this.y + this.h - ((v - this.ymin) / (this.ymax - this.ymin)) * this.h;
    }
    ix(px) {
      const f = (px - this.x) / this.w;
      return this.xlog ? Math.pow(10, this.lx0 + f * (this.lx1 - this.lx0)) : this.xmin + f * (this.xmax - this.xmin);
    }
    iy(py) {
      const f = (this.y + this.h - py) / this.h;
      return this.ylog ? Math.pow(10, this.ly0 + f * (this.ly1 - this.ly0)) : this.ymin + f * (this.ymax - this.ymin);
    }
    logTicks(a, b) {
      const out = [];
      for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.floor(Math.log10(b) + 1e-9); e++) out.push(Math.pow(10, e));
      if (out.length > 9) return out.filter((_, i) => i % Math.ceil(out.length / 8) === 0);
      return out;
    }
    drawFrame() {
      const d = this.d, g = d.g, { x, y, w, h } = this;
      if (this.bg) d.rect(x, y, w, h, 'rgba(5,9,22,0.8)');
      const xt = this.xlog ? this.logTicks(this.xmin, this.xmax) : niceTicks(this.xmin, this.xmax, this.nx);
      const yt = this.ylog ? this.logTicks(this.ymin, this.ymax) : niceTicks(this.ymin, this.ymax, this.ny);
      g.lineWidth = 1;
      if (this.grid) {
        g.strokeStyle = 'rgba(140,160,210,0.11)'; g.beginPath();
        xt.forEach((v) => { const X = Math.round(this.X(v)) + 0.5; g.moveTo(X, y); g.lineTo(X, y + h); });
        yt.forEach((v) => { const Y = Math.round(this.Y(v)) + 0.5; g.moveTo(x, Y); g.lineTo(x + w, Y); });
        g.stroke();
      }
      g.strokeStyle = 'rgba(190,205,235,0.4)'; g.beginPath();
      if (!this.ylog && this.ymin < 0 && this.ymax > 0) { const Y0 = Math.round(this.Y(0)) + 0.5; g.moveTo(x, Y0); g.lineTo(x + w, Y0); }
      if (!this.xlog && this.xmin < 0 && this.xmax > 0) { const X0 = Math.round(this.X(0)) + 0.5; g.moveTo(X0, y); g.lineTo(X0, y + h); }
      g.stroke();
      if (this.frame) d.rect(x, y, w, h, null, 'rgba(160,180,225,0.32)', 1);
      if (this.ticks) {
        const lf = (v) => (this.xlog || this.ylog) && v > 0 && Math.abs(Math.log10(v) - Math.round(Math.log10(v))) < 1e-9 ? '10' + sup(Math.round(Math.log10(v))) : tickFmt(v);
        if (this.xticks !== false) xt.forEach((v) => d.text(this.xlog ? lf(v) : tickFmt(v), this.X(v), y + h + 11, C.dim, 10, 'center'));
        if (this.yticks !== false) yt.forEach((v) => d.text(this.ylog ? lf(v) : tickFmt(v), x - 5, this.Y(v), C.dim, 10, 'right'));
      }
      if (this.title) d.text(this.title, x, y - 12, C.text, 12, 'left', 'middle', true);
      if (this.xl) d.text(this.xl, x + w, y + h + 26, C.dim, 11, 'right');
      if (this.yl) d.text(this.yl, x + 6, y + 11, C.dim, 11, 'left');
    }
    clipOn() { this.d.clip(this.x, this.y, this.w, this.h); }
    fn(f, col = C.cyan, lw = 2, n = 300, dash, x0 = this.xmin, x1 = this.xmax) {
      const g = this.d.g;
      this.clipOn();
      g.strokeStyle = col; g.lineWidth = lw;
      if (dash) g.setLineDash(dash);
      g.beginPath();
      let pen = false;
      for (let i = 0; i <= n; i++) {
        const xv = this.xlog ? x0 * Math.pow(x1 / x0, i / n) : x0 + ((x1 - x0) * i) / n, yv = f(xv);
        if (!isFinite(yv) || (this.ylog && yv <= 0)) { pen = false; continue; }
        const X = this.X(xv), Y = M.clamp(this.Y(yv), this.y - 2000, this.y + this.h + 2000);
        if (pen) g.lineTo(X, Y); else { g.moveTo(X, Y); pen = true; }
      }
      g.stroke(); g.setLineDash([]);
      this.d.unclip();
    }
    area(f, fill, x0 = this.xmin, x1 = this.xmax, n = 200, base = 0) {
      const g = this.d.g, Yb = this.Y(this.ylog ? this.ymin : base);
      this.clipOn();
      g.beginPath(); g.moveTo(this.X(x0), Yb);
      for (let i = 0; i <= n; i++) {
        const xv = this.xlog ? x0 * Math.pow(x1 / x0, i / n) : x0 + ((x1 - x0) * i) / n;
        let yv = f(xv);
        if (!isFinite(yv)) yv = base;
        g.lineTo(this.X(xv), M.clamp(this.Y(yv), this.y - 2000, this.y + this.h + 2000));
      }
      g.lineTo(this.X(x1), Yb); g.closePath();
      g.fillStyle = fill; g.fill();
      this.d.unclip();
    }
    pts(arr, col = C.cyan, lw = 2, dash) {
      if (!arr || arr.length < 2) return;
      const g = this.d.g;
      this.clipOn();
      g.strokeStyle = col; g.lineWidth = lw;
      if (dash) g.setLineDash(dash);
      g.beginPath();
      let pen = false;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (!p || !isFinite(p[1]) || !isFinite(p[0])) { pen = false; continue; }
        const X = this.X(p[0]), Y = M.clamp(this.Y(p[1]), this.y - 2000, this.y + this.h + 2000);
        if (pen) g.lineTo(X, Y); else { g.moveTo(X, Y); pen = true; }
      }
      g.stroke(); g.setLineDash([]);
      this.d.unclip();
    }
    dot(xv, yv, col = C.yellow, r = 5) {
      if (!isFinite(xv) || !isFinite(yv)) return;
      const X = this.X(xv), Y = this.Y(yv);
      if (X < this.x - 1 || X > this.x + this.w + 1 || Y < this.y - 1 || Y > this.y + this.h + 1) return;
      this.d.circle(X, Y, r, col, '#fff', 1.5);
    }
    vl(xv, col = C.dim, dash = [4, 4], lw = 1.5) {
      const X = this.X(xv);
      if (!isFinite(X) || X < this.x - 0.5 || X > this.x + this.w + 0.5) return;
      this.d.line(X, this.y, X, this.y + this.h, col, lw, dash);
    }
    hl(yv, col = C.dim, dash = [4, 4], lw = 1.5) {
      const Y = this.Y(yv);
      if (!isFinite(Y) || Y < this.y - 0.5 || Y > this.y + this.h + 0.5) return;
      this.d.line(this.x, Y, this.x + this.w, Y, col, lw, dash);
    }
    label(s, xv, yv, col = C.text, size = 11, align = 'left') {
      this.d.text(s, this.X(xv), this.Y(yv), col, size, align);
    }
  }
  PL.Plot = Plot;

  /* ------------------------------------------------------------------
   * 시뮬레이션 실행기
   * law = { init(S,P), step(S,P,dt), draw(d,S,P), pointer(type,x,y,S,P,api), stop(S) }
   * ------------------------------------------------------------------ */
  class Runner {
    constructor(canvas, law, P, api) {
      this.cv = canvas; this.g = canvas.getContext('2d'); this.d = new Draw(this.g);
      this.law = law; this.P = P; this.api = api || {};
      this.running = true; this.speed = 1; this.dead = false; this.err = null; this.lastOut = 0; this.last = 0;
      this.resize();
      this.reset();
      if (global.ResizeObserver) {
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(canvas.parentElement);
      } else {
        this._onRes = () => this.resize();
        global.addEventListener('resize', this._onRes);
      }
      const mk = (type) => (ev) => {
        if (!law.pointer || this.err) return;
        const r = canvas.getBoundingClientRect();
        const x = ((ev.clientX - r.left) / r.width) * W, y = ((ev.clientY - r.top) / r.height) * H;
        let res = false;
        try { res = law.pointer(type, x, y, this.S, this.P, this.api); } catch (e) { this.fail(e); }
        if (type === 'down' && res) {
          ev.preventDefault();
          try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* 무시 */ }
        }
      };
      this.handlers = { pointerdown: mk('down'), pointermove: mk('move'), pointerup: mk('up'), pointercancel: mk('up'), pointerleave: mk('leave') };
      for (const k in this.handlers) canvas.addEventListener(k, this.handlers[k]);
      this._loop = (ts) => this.loop(ts);
      this.raf = requestAnimationFrame(this._loop);
    }
    resize() {
      const parent = this.cv.parentElement;
      const cw = Math.max(200, parent.clientWidth), ch = (cw * H) / W;
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      this.cv.style.width = cw + 'px'; this.cv.style.height = ch + 'px';
      const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
      if (this.cv.width !== pw) this.cv.width = pw;
      if (this.cv.height !== ph) this.cv.height = ph;
      this.g.setTransform((cw / W) * dpr, 0, 0, (cw / W) * dpr, 0, 0);
    }
    reset() {
      if (this.S && this.law.stop) { try { this.law.stop(this.S); } catch (e) { /* 무시 */ } }
      this.S = { t: 0 };
      this.err = null;
      try { if (this.law.init) this.law.init(this.S, this.P); } catch (e) { this.fail(e); }
    }
    fail(e) {
      if (!this.err) { this.err = e; console.error('[PhysicsLab:' + this.law.id + ']', e); }
    }
    frame(dt) {
      if (this.running && this.law.step && dt > 0) this.law.step(this.S, this.P, dt);
      this.d.reset();
      this.law.draw(this.d, this.S, this.P);
    }
    loop(ts) {
      if (this.dead) return;
      const dt = this.last ? Math.min((ts - this.last) / 1000, 0.05) : 1 / 60;
      this.last = ts;
      if (!this.err) {
        try { this.frame(dt * this.speed); } catch (e) { this.fail(e); }
      }
      if (this.err) {
        const d = this.d;
        d.reset();
        d.rect(20, H - 60, W - 40, 40, 'rgba(120,20,30,0.9)', null, 0, 8);
        d.text('시뮬레이션 오류: ' + (this.err.message || this.err), 36, H - 40, '#fff', 13);
      }
      if (ts - this.lastOut > 150) { this.lastOut = ts; if (this.api.onFrame) this.api.onFrame(); }
      this.raf = requestAnimationFrame(this._loop);
    }
    destroy() {
      this.dead = true;
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      if (this._onRes) global.removeEventListener('resize', this._onRes);
      for (const k in this.handlers) this.cv.removeEventListener(k, this.handlers[k]);
      if (this.law.stop) { try { this.law.stop(this.S); } catch (e) { /* 무시 */ } }
    }
  }
  PL.Runner = Runner;
})(window);
