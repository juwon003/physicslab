/* =====================================================================
 * PhysicsLab — app.js : 화면 구성(홈 · 분야 · 법칙), 입력 UI, 검색, 라우팅
 * ===================================================================== */
(function () {
  'use strict';
  const PL = window.PL;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 수식 렌더링 (KaTeX가 없으면 원문 표시) */
  /* KaTeX 스타일시트가 없으면(웹 게시본) 브라우저 내장 MathML로 그린다 */
  const KATEX_OUT = document.querySelector('link[href*="katex"]') ? 'htmlAndMathml' : 'mathml';
  function tex(target, src, display = true) {
    target.innerHTML = '';
    if (window.katex) {
      try {
        window.katex.render(src, target, { displayMode: display, throwOnError: false, strict: 'ignore', output: KATEX_OUT });
        return;
      } catch (e) { /* 원문 표시로 대체 */ }
    }
    target.textContent = src;
    target.classList.add('tex-raw');
  }

  const ICONS = {
    classical: '<svg viewBox="0 0 48 48"><path d="M8 7h32"/><path d="M24 7l8 25"/><circle cx="33.5" cy="36" r="5.5" fill="currentColor" stroke="none"/><path d="M13 35a13 13 0 0 1 3-9.5" stroke-dasharray="2 3.5"/></svg>',
    thermo: '<svg viewBox="0 0 48 48"><path d="M19 9a5 5 0 0 1 10 0v19a9 9 0 1 1-10 0z"/><circle cx="24" cy="35" r="4.5" fill="currentColor" stroke="none"/><path d="M24 31V16"/><path d="M34 12h6M34 18h4M34 24h6"/></svg>',
    em: '<svg viewBox="0 0 48 48"><circle cx="11" cy="24" r="5"/><circle cx="37" cy="24" r="5"/><path d="M8.5 24h5M11 21.5v5M34.5 24h5"/><path d="M16 20c5-8 11-8 16 0M16 28c5 8 11 8 16 0M16.5 24h15"/></svg>',
    relativity: '<svg viewBox="0 0 48 48"><path d="M10 6l28 36M38 6L10 42"/><ellipse cx="24" cy="7" rx="14" ry="3"/><ellipse cx="24" cy="41" rx="14" ry="3"/><circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none"/></svg>',
    quantum: '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="19" ry="7"/><ellipse cx="24" cy="24" rx="19" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="19" ry="7" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="3.2" fill="currentColor" stroke="none"/></svg>',
    modern: '<svg viewBox="0 0 48 48"><path d="M6 8l10 16-10 16M42 8L32 24l10 16"/><path d="M16 24q2-5 4 0t4 0t4 0t4 0"/><circle cx="16" cy="24" r="2.4" fill="currentColor" stroke="none"/><circle cx="32" cy="24" r="2.4" fill="currentColor" stroke="none"/></svg>',
  };

  let runner = null;
  const view = () => $('#view');

  /* ------------------------------------------------------------------ 라우팅 */
  function route() {
    if (runner) { runner.destroy(); runner = null; }
    const parts = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split(/[/-]/).filter(Boolean);
    closeSearch();
    if (!parts.length) renderHome();
    else if (parts.length === 1) renderField(parts[0]);
    else renderLaw(parts[0], parts[1]);
    window.scrollTo(0, 0);
  }

  function crumbs(items) {
    const nav = el('nav', 'crumbs');
    items.forEach((it, i) => {
      if (i) nav.append(el('span', 'sep', '›'));
      if (it[1]) { const a = el('a', null, esc(it[0])); a.href = it[1]; nav.append(a); }
      else nav.append(el('span', 'cur', esc(it[0])));
    });
    return nav;
  }

  /* ------------------------------------------------------------------ 홈 */
  function renderHome() {
    document.title = 'PhysicsLab — 물리 법칙 시각화';
    const v = view();
    v.innerHTML = '';
    v.style.removeProperty('--accent');
    const hero = el('section', 'hero');
    hero.innerHTML =
      '<h1>물리 법칙을 <em>보고, 바꾸고,</em> 이해하기</h1>' +
      '<p>분야를 고르고 법칙을 선택하세요. 수식의 값을 바꾸면 시각화와 시뮬레이션이 즉시 반응합니다.</p>' +
      `<div class="hero-stats"><span><b>${PL.fields.length}</b> 분야</span><span><b>${PL.laws.length}</b> 법칙</span><span><b>${PL.laws.length}</b> 시뮬레이션</span></div>`;
    v.append(hero);
    const grid = el('section', 'field-grid');
    PL.fields.forEach((f, i) => {
      const laws = PL.lawsOf(f.id), cats = [...new Set(laws.map((l) => l.cat))];
      const a = el('a', 'field-card');
      a.href = '#' + f.id;
      a.style.setProperty('--accent', f.color);
      a.innerHTML =
        `<div class="fc-top"><div class="fc-icon">${ICONS[f.id]}</div><div class="fc-num">${String(i + 1).padStart(2, '0')}</div></div>` +
        `<h2>${esc(f.name)}</h2><div class="fc-en">${esc(f.en)}</div><p>${esc(f.desc)}</p>` +
        `<div class="fc-cats">${cats.map((c) => `<span>${esc(c)}</span>`).join('')}</div>` +
        `<div class="fc-foot"><span>${laws.length}개 법칙</span><span class="go">살펴보기 →</span></div>`;
      grid.append(a);
    });
    v.append(grid);
  }

  /* ------------------------------------------------------------------ 분야 */
  function renderField(fid) {
    const f = PL.field(fid);
    if (!f) { location.hash = '#'; return; }
    document.title = f.name + ' — PhysicsLab';
    const v = view();
    v.innerHTML = '';
    v.style.setProperty('--accent', f.color);
    v.append(crumbs([['홈', '#'], [f.name]]));
    const laws = PL.lawsOf(fid), cats = [...new Set(laws.map((l) => l.cat))];
    const head = el('header', 'field-head');
    head.innerHTML =
      `<div class="fh-icon">${ICONS[f.id]}</div><div><h1>${esc(f.name)}</h1><div class="fh-en">${esc(f.en)}</div>` +
      `<p>${esc(f.desc)}</p><div class="fh-meta">${cats.length}개 분류 · ${laws.length}개 법칙</div></div>`;
    v.append(head);
    const toc = el('div', 'cat-toc');
    cats.forEach((c, i) => {
      const b = el('button', null, esc(c));
      b.onclick = () => document.getElementById('cat-' + i).scrollIntoView({ behavior: 'smooth', block: 'start' });
      toc.append(b);
    });
    v.append(toc);
    cats.forEach((c, i) => {
      const list = laws.filter((l) => l.cat === c);
      const sec = el('section', 'cat');
      sec.id = 'cat-' + i;
      sec.append(el('h2', 'cat-title', `${esc(c)}<span>${list.length}</span>`));
      const grid = el('div', 'law-grid');
      list.forEach((l) => {
        const a = el('a', 'law-card');
        a.href = `#${fid}-${l.id}`;
        a.innerHTML = `<div class="lc-name">${esc(l.name)}</div><div class="lc-en">${esc(l.en)}</div><div class="lc-tex"></div>`;
        tex(a.querySelector('.lc-tex'), l.short || (Array.isArray(l.tex) ? l.tex[0] : l.tex), false);
        grid.append(a);
      });
      sec.append(grid);
      v.append(sec);
    });
  }

  /* ------------------------------------------------------------------ 법칙 */
  const decimals = (st) => { const s = String(st); return s.indexOf('.') >= 0 ? s.split('.')[1].length : 0; };
  function snap(v, p) {
    if (p.log) return +(+v).toPrecision(3);
    const d = decimals(p.st);
    return +(Math.round((v - p.min) / p.st) * p.st + p.min).toFixed(d);
  }
  function showNum(v, p) {
    if (p.log) return String(+(+v).toPrecision(3));
    const d = decimals(p.st);
    return (+v).toFixed(Math.min(6, Math.max(d, Math.abs(v - +(+v).toFixed(d)) > 1e-9 ? 3 : d)));
  }

  function renderLaw(fid, lid) {
    const f = PL.field(fid), law = PL.laws.find((l) => l.id === lid && l.field === fid);
    if (!f || !law) { location.hash = f ? '#' + fid : '#'; return; }
    document.title = law.name + ' — PhysicsLab';
    const laws = PL.lawsOf(fid), idx = laws.indexOf(law), prev = laws[idx - 1], next = laws[idx + 1];
    const v = view();
    v.innerHTML = '';
    v.style.setProperty('--accent', f.color);
    v.append(crumbs([['홈', '#'], [f.name, '#' + fid], [law.cat]]));

    const head = el('header', 'law-head');
    head.innerHTML =
      `<div><h1>${esc(law.name)}</h1><div class="law-en">${esc(law.en)}</div></div>` +
      '<div class="law-nav">' +
      (prev ? `<a class="btn ghost" href="#${fid}-${prev.id}" title="${esc(prev.name)}">← 이전</a>` : '<span class="btn ghost off">← 이전</span>') +
      `<a class="btn ghost" href="#${fid}">목록 (${idx + 1}/${laws.length})</a>` +
      (next ? `<a class="btn ghost" href="#${fid}-${next.id}" title="${esc(next.name)}">다음 →</a>` : '<span class="btn ghost off">다음 →</span>') +
      '</div>';
    v.append(head);

    const lay = el('div', 'law-layout');
    const colL = el('div', 'col-left'), colR = el('div', 'col-right');
    lay.append(colL, colR);
    v.append(lay);

    /* 수식 카드 */
    const fc = el('section', 'card formula-card');
    fc.innerHTML = '<div class="card-label">수식</div><div class="formula"></div>' +
      '<div class="subst-wrap" hidden><div class="card-label">현재 값 대입</div><div class="subst"></div></div>' +
      `<p class="desc">${esc(law.desc || '')}</p>`;
    const fwrap = fc.querySelector('.formula');
    (Array.isArray(law.tex) ? law.tex : [law.tex]).forEach((t) => { const d = el('div', 'eq'); tex(d, t, true); fwrap.append(d); });
    colL.append(fc);

    /* 입력 카드 */
    const pc = el('section', 'card params-card');
    pc.innerHTML = '<div class="card-label">값 입력</div><div class="params"></div>';
    colL.append(pc);

    /* 시뮬레이션 카드 */
    const sc = el('section', 'card sim-card');
    sc.innerHTML =
      '<div class="canvas-wrap"><canvas></canvas></div>' +
      '<div class="sim-bar">' +
      '<button class="btn play" data-act="play">⏸ 일시정지</button>' +
      '<button class="btn" data-act="reset">↺ 다시 시작</button>' +
      '<label class="speed">속도 <select data-act="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label>' +
      '<button class="btn ghost" data-act="defaults">기본값</button>' +
      '</div>' + (law.hint ? `<p class="hint">💡 ${esc(law.hint)}</p>` : '');
    colR.append(sc);

    /* 결과 카드 */
    const oc = el('section', 'card outs-card');
    oc.innerHTML = '<div class="card-label">계산 결과</div><div class="outs"></div>';
    colR.append(oc);

    /* 매개변수 상태 */
    const P = {};
    law.params.forEach((p) => (P[p.k] = p.v));
    if (law.fix) law.fix(P);

    const sync = {};
    const set = (k, val) => {
      P[k] = val;
      if (law.fix) law.fix(P, k);
      const def = law.params.find((p) => p.k === k);
      if (runner) {
        if (def && def.reset) runner.reset();
        else if (law.change) { try { law.change(runner.S, P, k); } catch (e) { console.error(e); } }
      }
      Object.values(sync).forEach((fn) => fn());
      updateOut(true);
    };

    const box = pc.querySelector('.params');
    if (!law.params.length) box.append(el('p', 'muted', '이 시각화에는 입력 값이 없습니다.'));
    law.params.forEach((p) => {
      const row = el('div', 'prm prm-' + p.type);
      if (p.type === 'range') {
        row.innerHTML =
          `<div class="prm-head"><label>${esc(p.l)}</label><span class="prm-val"><input type="number" step="any" inputmode="decimal"><em>${esc(p.u || '')}</em></span></div>` +
          `<input type="range"><div class="prm-minmax"><span>${PL.fmt(p.min)}</span><span>${PL.fmt(p.max)}</span></div>`;
        const num = row.querySelector('input[type=number]'), rng = row.querySelector('input[type=range]');
        num.setAttribute('aria-label', p.l + (p.u ? ' (' + p.u + ')' : ''));
        rng.setAttribute('aria-label', p.l + ' 슬라이더');
        if (p.log) { rng.min = 0; rng.max = 1000; rng.step = 1; }
        else { rng.min = p.min; rng.max = p.max; rng.step = p.st; }
        const toS = (x) => (p.log ? (1000 * Math.log(x / p.min)) / Math.log(p.max / p.min) : x);
        const fromS = (s) => (p.log ? p.min * Math.pow(p.max / p.min, s / 1000) : +s);
        rng.addEventListener('input', () => set(p.k, PL.M.clamp(snap(fromS(+rng.value), p), p.min, p.max)));
        const commit = () => {
          let x = parseFloat(num.value);
          if (isNaN(x)) x = P[p.k];
          set(p.k, PL.M.clamp(x, p.min, p.max));
          num.value = showNum(P[p.k], p);
        };
        num.addEventListener('change', commit);
        num.addEventListener('keydown', (e) => { if (e.key === 'Enter') { commit(); num.blur(); } });
        sync[p.k] = () => {
          rng.value = toS(P[p.k]);
          const pct = ((toS(P[p.k]) - +rng.min) / (+rng.max - +rng.min)) * 100;
          rng.style.setProperty('--pct', PL.M.clamp(pct, 0, 100) + '%');
          if (document.activeElement !== num) num.value = showNum(P[p.k], p);
        };
      } else if (p.type === 'sel') {
        row.innerHTML = `<div class="prm-head"><label>${esc(p.l)}</label></div><select></select>`;
        const s = row.querySelector('select');
        s.setAttribute('aria-label', p.l);
        p.opts.forEach((o) => { const op = el('option', null, esc(o[1])); op.value = String(o[0]); s.append(op); });
        s.addEventListener('change', () => { const o = p.opts.find((o) => String(o[0]) === s.value); set(p.k, o ? o[0] : s.value); });
        sync[p.k] = () => { s.value = String(P[p.k]); };
      } else if (p.type === 'chk') {
        row.innerHTML = `<label class="switch"><input type="checkbox"><span class="track"></span><span class="lbl">${esc(p.l)}</span></label>`;
        const c = row.querySelector('input');
        c.addEventListener('change', () => set(p.k, c.checked));
        sync[p.k] = () => { c.checked = !!P[p.k]; };
      }
      box.append(row);
    });
    Object.values(sync).forEach((fn) => fn());

    /* 결과 표시 */
    const outsBox = oc.querySelector('.outs'), substWrap = fc.querySelector('.subst-wrap'), substEl = fc.querySelector('.subst');
    let outRows = [], lastSub = null;
    function updateOut(force) {
      if (!runner) return;
      let rows = [];
      try { rows = law.out ? law.out(P, runner.S) || [] : []; } catch (e) { rows = [['계산 오류', String(e.message || e), '']]; }
      if (rows.length !== outRows.length || force === 'rebuild') {
        outsBox.innerHTML = '';
        outRows = rows.map((r) => {
          const d = el('div', typeof r === 'string' ? 'out note' : 'out');
          if (typeof r === 'string') { d.textContent = r; return { d, note: true }; }
          d.innerHTML = '<span class="ol"></span><span class="ov"><b></b><em></em></span>';
          outsBox.append(d);
          return { d, l: d.querySelector('.ol'), v: d.querySelector('b'), u: d.querySelector('em') };
        });
        outRows.forEach((o) => { if (o.note) outsBox.append(o.d); });
        if (!rows.length) outsBox.append(el('p', 'muted', '표시할 결과가 없습니다.'));
      }
      rows.forEach((r, i) => {
        const o = outRows[i];
        if (!o) return;
        if (o.note) { if (o.d.textContent !== r) o.d.textContent = r; return; }
        const val = PL.fmt(r[1]);
        if (o.l.textContent !== r[0]) o.l.textContent = r[0];
        if (o.v.textContent !== val) o.v.textContent = val;
        const u = r[2] || '';
        if (o.u.textContent !== u) o.u.textContent = u;
      });
      if (law.sub) {
        let s = '';
        try { s = law.sub(P, runner.S); } catch (e) { s = ''; }
        if (s !== lastSub) { lastSub = s; substWrap.hidden = !s; if (s) tex(substEl, s, true); }
      }
    }

    /* 실행기 */
    const canvas = sc.querySelector('canvas');
    if (law.pointer) canvas.classList.add('interactive');
    runner = new PL.Runner(canvas, law, P, {
      onFrame: () => updateOut(false),
      set: (k, val) => set(k, val),
      get: (k) => P[k],
    });
    updateOut('rebuild');

    const playBtn = sc.querySelector('[data-act=play]');
    const syncPlay = () => {
      playBtn.textContent = runner.running ? '⏸ 일시정지' : '▶ 재생';
      playBtn.classList.toggle('paused', !runner.running);
    };
    playBtn.onclick = () => { runner.running = !runner.running; syncPlay(); };
    sc.querySelector('[data-act=reset]').onclick = () => { runner.reset(); updateOut(true); };
    sc.querySelector('[data-act=speed]').onchange = (e) => { runner.speed = +e.target.value; };
    sc.querySelector('[data-act=defaults]').onclick = () => {
      law.params.forEach((p) => (P[p.k] = p.v));
      if (law.fix) law.fix(P);
      Object.values(sync).forEach((fn) => fn());
      runner.reset();
      updateOut(true);
    };
    runner._syncPlay = syncPlay;
  }

  /* ------------------------------------------------------------------ 검색 */
  let searchItems = [], searchSel = 0;
  function closeSearch() {
    const r = $('#results');
    if (r) { r.innerHTML = ''; r.hidden = true; }
  }
  function setupSearch() {
    const q = $('#q'), box = $('#results');
    const go = (it) => { if (!it) return; location.hash = `#${it.l.field}-${it.l.id}`; q.value = ''; q.blur(); closeSearch(); };
    const render = () => {
      box.innerHTML = '';
      if (!searchItems.length) { box.append(el('div', 'sr-empty', '일치하는 법칙이 없습니다.')); box.hidden = false; return; }
      searchItems.forEach((it, i) => {
        const a = el('a', 'sr' + (i === searchSel ? ' on' : ''));
        a.href = `#${it.l.field}-${it.l.id}`;
        a.style.setProperty('--accent', it.f.color);
        a.innerHTML = `<i></i><span class="sr-n">${esc(it.l.name)}</span><span class="sr-f">${esc(it.f.name)} · ${esc(it.l.cat)}</span>`;
        a.onmousedown = (e) => { e.preventDefault(); go(it); };
        box.append(a);
      });
      box.hidden = false;
    };
    q.addEventListener('input', () => {
      const s = q.value.trim().toLowerCase();
      if (!s) { closeSearch(); return; }
      searchItems = PL.laws
        .map((l) => {
          const f = PL.field(l.field), name = l.name.toLowerCase();
          const hay = (l.name + ' ' + l.en + ' ' + l.cat + ' ' + f.name + ' ' + (l.tags || '')).toLowerCase();
          if (hay.indexOf(s) < 0) return null;
          return { l, f, score: name.indexOf(s) === 0 ? 0 : name.indexOf(s) >= 0 ? 1 : 2 };
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score)
        .slice(0, 12);
      searchSel = 0;
      render();
    });
    q.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'ArrowDown') { searchSel = Math.min(searchItems.length - 1, searchSel + 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { searchSel = Math.max(0, searchSel - 1); render(); e.preventDefault(); }
      else if (e.key === 'Enter') { go(searchItems[searchSel]); e.preventDefault(); }
      else if (e.key === 'Escape') { closeSearch(); q.blur(); }
    });
    q.addEventListener('blur', () => setTimeout(closeSearch, 120));
    document.addEventListener('keydown', (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      const typing = /INPUT|SELECT|TEXTAREA/.test(tag);
      if (e.key === '/' && !typing) { e.preventDefault(); q.focus(); }
      else if (e.key === ' ' && !typing && tag !== 'BUTTON' && runner) {
        e.preventDefault();
        runner.running = !runner.running;
        if (runner._syncPlay) runner._syncPlay();
      }
    });
  }

  /* ------------------------------------------------------------------ 시작 */
  function start() {
    setupSearch();
    const n = $('#law-count');
    if (n) n.textContent = PL.laws.length;
    window.addEventListener('hashchange', route);
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
