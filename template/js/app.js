/*
 * Šablona přednáškových slidů – interaktivita.
 * Ze zdrojových <section class="slide"> v #slides sestaví prezentační
 * a podpůrnou část, obsluhuje režimy zobrazení, synchronizaci, menu a export.
 * V řečnickém pohledu otevře druhé okno pro projektor a synchronizuje se s ním
 * přes postMessage.
 */
(function () {
  'use strict';

  const CFG = window.SLIDES_CONFIG || {};
  // Kořen šablony (složka nad js/) – cesty k CSS se počítají od něj, takže
  // stránka může ležet uvnitř i mimo složku šablony.
  const TEMPLATE_BASE = new URL('..', document.currentScript.src);
  const templateUrl = function (path) { return new URL(path, TEMPLATE_BASE).href; };
  const PERSISTED = [
    'viewMode', 'combinedLayout', 'splitRatio', 'switchThreshold',
    'menuButtonOnAllSlides', 'theme', 'showSlideNumbers', 'showNavArrows', 'navArrowsPosition',
    'exportWhat', 'exportPresentLayout', 'exportSupportLayout', 'exportBothOrientation',
    'showTimer', 'timerMinutes'
  ];
  const MODES = ['present', 'support', 'combined', 'speaker'];
  const LAYOUTS = ['present-left', 'present-right', 'present-top', 'present-bottom'];
  const NAV_POSITIONS = ['sides', 'bottom-right', 'bottom-center'];
  const THEME_FILES = CFG.themeFiles || { light: 'css/theme-light.css' };
  const STORAGE_KEY = (CFG.storageKey || 'prednaska-nastaveni') + ':' + location.pathname;
  // Okno pro projektor (otevřené z řečnického pohledu) – jen aktuální snímek.
  const IS_AUDIENCE = new URLSearchParams(location.search).get('role') === 'audience';
  const MSG_NS = 'slides-sync';

  const defaults = {};
  PERSISTED.forEach(function (k) { defaults[k] = CFG[k]; });
  const state = sanitize(Object.assign({}, defaults, loadSaved()));

  const presentPane = document.getElementById('present-pane');
  const supportWrap = document.getElementById('support-pane');
  const supportPane = document.getElementById('support-scroll'); // scrollovací část podpůrného panelu
  const themeLink = document.getElementById('theme-css');
  const menu = document.getElementById('menu');
  const form = document.getElementById('menu-form');

  const pSlides = [];
  const sPages = [];
  let total = 0;
  let current = 0;
  let anchor = { idx: 0, frac: 0 }; // poloha podpůrné části: snímek + podíl jeho výšky
  let suppressSync = false;
  let suppressTimer = 0;

  /* ---------- Pomocné funkce ---------- */

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function pick(obj) {
    const out = {};
    PERSISTED.forEach(function (k) { if (obj && k in obj) out[k] = obj[k]; });
    return out;
  }

  function loadSaved() {
    if (!CFG.rememberSettings) return {};
    try { return pick(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}); } catch (e) { return {}; }
  }

  function save() {
    if (!CFG.rememberSettings || IS_AUDIENCE) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pick(state))); } catch (e) { /* bez úložiště */ }
  }

  function oneOf(v, list, fallback) { return list.indexOf(v) >= 0 ? v : fallback; }

  function sanitize(s) {
    const num = function (v, d) { v = Number(v); return isFinite(v) ? v : d; };
    s.viewMode = IS_AUDIENCE ? 'present' : oneOf(s.viewMode, MODES, 'present');
    s.combinedLayout = oneOf(s.combinedLayout, LAYOUTS, 'present-left');
    s.theme = oneOf(s.theme, Object.keys(THEME_FILES), Object.keys(THEME_FILES)[0]);
    s.splitRatio = clamp(num(s.splitRatio, 50), CFG.splitMin || 10, CFG.splitMax || 90);
    s.switchThreshold = clamp(num(s.switchThreshold, 25), 0, 100);
    s.menuButtonOnAllSlides = !!s.menuButtonOnAllSlides;
    s.showSlideNumbers = s.showSlideNumbers !== false;
    s.showNavArrows = s.showNavArrows !== false;
    s.navArrowsPosition = oneOf(s.navArrowsPosition, NAV_POSITIONS, 'sides');
    s.exportWhat = oneOf(s.exportWhat, ['present', 'support', 'both'], 'present');
    s.exportPresentLayout = oneOf(s.exportPresentLayout, ['one', 'two'], 'one');
    s.exportSupportLayout = oneOf(s.exportSupportLayout, ['newpage', 'continuous'], 'newpage');
    s.exportBothOrientation = oneOf(s.exportBothOrientation, ['landscape', 'portrait'], 'landscape');
    s.showTimer = s.showTimer !== false;
    s.timerMinutes = clamp(Math.round(num(s.timerMinutes, 45)), 1, 600);
    return s;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function supportVisible() { return state.viewMode !== 'present'; }

  /* ---------- Sestavení snímků ---------- */

  function makeMenuButton() {
    const b = el('button', 'menu-btn');
    b.type = 'button';
    b.title = 'Menu (M)';
    b.setAttribute('aria-label', 'Otevřít menu');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" ' +
      'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    b.addEventListener('click', openMenu);
    return b;
  }

  function build() {
    const source = document.getElementById('slides');
    const sections = Array.prototype.slice.call(source.querySelectorAll(':scope > section.slide'));
    total = sections.length;

    sections.forEach(function (sec, i) {
      const title = sec.dataset.title || '';
      const subtitle = sec.dataset.subtitle || '';
      const showHeader = sec.dataset.showHeader === 'true' && (title || subtitle);
      const number = (i + 1) + ' / ' + total;
      const extraClasses = Array.prototype.filter.call(sec.classList, function (c) { return c !== 'slide'; });

      /* Prezentační část */
      const p = el('article', 'p-slide');
      p.classList.add.apply(p.classList, extraClasses);
      if (i === 0) p.classList.add('is-first');
      p.setAttribute('aria-label', 'Snímek ' + number + (title ? ': ' + title : ''));
      if (showHeader) {
        p.classList.add('has-header');
        const header = el('header', 'p-header');
        if (title) header.append(el('span', 'h-title', title));
        if (subtitle) header.append(el('span', 'h-sub', subtitle));
        p.append(header);
      }
      const pBody = el('div', 'p-body');
      const present = sec.querySelector(':scope > .present');
      if (present) pBody.append.apply(pBody, Array.prototype.slice.call(present.childNodes));
      p.append(pBody, el('span', 'p-number', number), makeMenuButton());
      presentPane.append(p);
      pSlides.push(p);

      /* Podpůrná část */
      const s = el('article', 's-page');
      if (i === 0) s.classList.add('is-first');
      s.dataset.index = i;
      s.append(el('div', 's-label', 'Snímek ' + number + (title ? ' · ' + title : '')));
      const sBody = el('div', 's-body');
      const support = sec.querySelector(':scope > .support');
      if (support) sBody.append.apply(sBody, Array.prototype.slice.call(support.childNodes));
      s.append(sBody, makeMenuButton());
      supportPane.append(s);
      sPages.push(s);
    });

    source.remove();
  }

  /* ---------- Nastavení ---------- */

  function applySettings() {
    const b = document.body;
    MODES.forEach(function (m) { b.classList.toggle('mode-' + m, state.viewMode === m); });
    LAYOUTS.forEach(function (l) { b.classList.toggle('layout-' + l, state.combinedLayout === l); });
    b.classList.toggle('menu-btn-all', state.menuButtonOnAllSlides);
    b.classList.toggle('hide-numbers', !state.showSlideNumbers);
    b.classList.toggle('hide-nav', !state.showNavArrows);
    NAV_POSITIONS.forEach(function (p) { b.classList.toggle('nav-pos-' + p, state.navArrowsPosition === p); });
    b.classList.toggle('hide-timer', !state.showTimer);
    b.classList.toggle('role-audience', IS_AUDIENCE);
    if (!state.showNavArrows || !supportVisible()) stopAutoScroll();
    document.documentElement.style.setProperty('--split', state.splitRatio + '%');
    document.documentElement.dataset.theme = state.theme;
    const href = templateUrl(THEME_FILES[state.theme]);
    if (themeLink.href !== href) themeLink.href = href;
    if (state.viewMode === 'speaker') { renderNext(); updateTimer(); }
    sendSettings();
  }

  /* ---------- Navigace a synchronizace ---------- */

  function suppress(ms) {
    suppressSync = true;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(function () { suppressSync = false; }, ms);
  }

  function goTo(i, opts) {
    opts = opts || {};
    i = clamp(i, 0, total - 1);
    const changed = i !== current;
    current = i;
    pSlides.forEach(function (p, k) { p.classList.toggle('active', k === i); });
    if (opts.source !== 'support') scrollSupportTo(i, opts.smooth !== false);
    if (changed || opts.updateHash) history.replaceState(null, '', '#' + (i + 1));
    if (state.viewMode === 'speaker') renderNext();
    if (!opts.remote) post(IS_AUDIENCE ? window.opener : audience, { type: 'goto', index: i });
  }

  function scrollSupportTo(i, smooth) {
    anchor = { idx: i, frac: 0 };
    if (!supportVisible()) return;
    const target = sPages[i].offsetTop;
    if (Math.abs(supportPane.scrollTop - target) < 1) return;
    suppress(smooth ? 1200 : 150);
    supportPane.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
  }

  function restoreAnchor() {
    if (!supportVisible() || supportPane.clientWidth === 0) return;
    const page = sPages[anchor.idx];
    const top = page.offsetTop + anchor.frac * page.offsetHeight;
    if (Math.abs(supportPane.scrollTop - top) < 1) return;
    suppress(150);
    supportPane.scrollTop = top;
  }

  function onSupportScroll() {
    const h = supportPane.clientHeight;
    if (!h) return;
    const top = supportPane.scrollTop;

    let a = 0;
    for (let i = 0; i < total; i++) { if (sPages[i].offsetTop <= top + 1) a = i; else break; }
    anchor = { idx: a, frac: (top - sPages[a].offsetTop) / (sPages[a].offsetHeight || 1) };

    if (suppressSync) return;

    // Snímek se přepne, jakmile následující podpůrný snímek zabírá více než
    // switchThreshold % výšky okna (počítáno odspodu).
    const line = top + h * (1 - state.switchThreshold / 100);
    let idx = 0;
    for (let i = 0; i < total; i++) { if (sPages[i].offsetTop <= line) idx = i; else break; }
    if (top + h >= supportPane.scrollHeight - 2) idx = total - 1;
    if (idx !== current) goTo(idx, { source: 'support' });
  }

  supportPane.addEventListener('scroll', onSupportScroll, { passive: true });
  supportPane.addEventListener('scrollend', function () {
    if (suppressSync) { clearTimeout(suppressTimer); suppressSync = false; }
  });

  /* V podpůrné části: na začátek dalšího snímku, resp. na začátek aktuálního
     (pokud už je odscrollovaný), jinak na začátek předchozího. */
  function supportStep(delta) {
    const a = anchor.idx;
    let target;
    if (delta > 0) {
      if (a + 1 >= total) return;
      target = a + 1;
    } else {
      target = supportPane.scrollTop - sPages[a].offsetTop > 4 ? a : a - 1;
      if (target < 0) return;
    }
    goTo(target);
  }

  /* ---------- Šipky na obrazovce ---------- */

  const ARROWS = {
    prev: { path: 'M15 5l-7 7 7 7', label: 'Předchozí snímek' },
    next: { path: 'M9 5l7 7-7 7', label: 'Další snímek' },
    up: { path: 'M5 15l7-7 7 7', label: 'Posouvat nahoru (kliknutím zapnout/vypnout)' },
    down: { path: 'M5 9l7 7 7-7', label: 'Posouvat dolů (kliknutím zapnout/vypnout)' }
  };

  function makeNav(dirs) {
    const nav = el('div', 'nav');
    dirs.forEach(function (d) {
      const b = el('button', 'nav-btn');
      b.type = 'button';
      b.dataset.nav = d;
      b.title = ARROWS[d].label;
      b.setAttribute('aria-label', ARROWS[d].label);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ARROWS[d].path + '" fill="none" ' +
        'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      nav.append(b);
    });
    return nav;
  }

  const presentNav = makeNav(['prev', 'next']);
  const supportNav = makeNav(['prev', 'next', 'up', 'down']);
  presentPane.append(presentNav);
  supportWrap.append(supportNav);
  const upBtn = supportNav.querySelector('[data-nav="up"]');
  const downBtn = supportNav.querySelector('[data-nav="down"]');

  presentNav.addEventListener('click', function (e) {
    const b = e.target.closest('.nav-btn');
    if (!b) return;
    stopAutoScroll();
    goTo(current + (b.dataset.nav === 'next' ? 1 : -1));
  });

  supportNav.addEventListener('click', function (e) {
    const b = e.target.closest('.nav-btn');
    if (!b) return;
    const d = b.dataset.nav;
    if (d === 'prev' || d === 'next') {
      stopAutoScroll();
      supportStep(d === 'next' ? 1 : -1);
      return;
    }
    // Kliknutí šipku „zapne“ (posun pokračuje i po odjetí myší), další kliknutí ji vypne.
    // Zapnutá může být jen jedna – kliknutí na druhou přepne zapnutí na ni.
    const dir = d === 'down' ? 1 : -1;
    latchDir = latchDir === dir ? 0 : dir;
    updateAutoScroll();
  });

  [upBtn, downBtn].forEach(function (b) {
    const dir = b === downBtn ? 1 : -1;
    b.addEventListener('pointerenter', function () { hoverDir = dir; updateAutoScroll(); });
    b.addEventListener('pointerleave', function () { hoverDir = 0; updateAutoScroll(); });
  });

  /* Plynulý posun podpůrné části – směr: zapnutá šipka, jinak šipka pod myší. */
  let hoverDir = 0;
  let latchDir = 0;
  let autoRaf = 0;
  let autoLastT = 0;
  let autoAcc = 0;

  function updateAutoScroll() {
    upBtn.classList.toggle('latched', latchDir === -1);
    downBtn.classList.toggle('latched', latchDir === 1);
    upBtn.setAttribute('aria-pressed', String(latchDir === -1));
    downBtn.setAttribute('aria-pressed', String(latchDir === 1));
    if ((latchDir || hoverDir) && !autoRaf) {
      autoLastT = 0;
      autoAcc = 0;
      autoRaf = requestAnimationFrame(autoScrollFrame);
    }
  }

  function autoScrollFrame(t) {
    const dir = latchDir || hoverDir;
    if (!dir || !supportVisible()) { autoRaf = 0; return; }
    if (autoLastT) {
      autoAcc += dir * (CFG.autoScrollSpeed || 120) * Math.min(t - autoLastT, 100) / 1000;
      const whole = Math.trunc(autoAcc);
      if (whole) {
        const before = supportPane.scrollTop;
        supportPane.scrollTop = before + whole;
        autoAcc -= whole;
        if (supportPane.scrollTop === before && latchDir) { latchDir = 0; updateAutoScroll(); } // dojeto na konec
      }
    }
    autoLastT = t;
    autoRaf = requestAnimationFrame(autoScrollFrame);
  }

  function stopAutoScroll() {
    if (!latchDir) return;
    latchDir = 0;
    updateAutoScroll();
  }

  /* ---------- Řečnický pohled ---------- */

  /* Pod aktuálním snímkem: zmenšený následující snímek a časomíra. */
  const speakerBar = el('div', 'speaker-bar');
  speakerBar.innerHTML =
    '<div class="sp-next">' +
      '<div class="sp-head"><span>Další snímek</span>' +
        '<span class="sp-status"></span>' +
        '<button type="button" class="btn sp-open" data-sp="open">Otevřít okno pro projektor</button></div>' +
      '<div class="sp-frame"></div>' +
    '</div>' +
    '<div class="sp-timer">' +
      '<div class="sp-time"><span class="sp-elapsed"></span><span class="sp-cap">od začátku</span></div>' +
      '<div class="sp-time"><span class="sp-remaining"></span><span class="sp-cap">do konce</span></div>' +
      '<div class="sp-controls">' +
        '<button type="button" class="btn primary" data-sp="toggle">Spustit</button>' +
        '<button type="button" class="btn" data-sp="reset">Restartovat</button>' +
      '</div>' +
    '</div>';
  presentPane.append(speakerBar);
  const spFrame = speakerBar.querySelector('.sp-frame');
  const spTimer = speakerBar.querySelector('.sp-timer');
  const spToggle = speakerBar.querySelector('[data-sp="toggle"]');

  speakerBar.addEventListener('click', function (e) {
    const b = e.target.closest('[data-sp]');
    if (!b) return;
    if (b.dataset.sp === 'open') openAudience();
    else if (b.dataset.sp === 'toggle') toggleTimer();
    else resetTimer();
    b.blur(); // šipky na klávesnici dál ovládají snímky
  });

  function renderNext() {
    spFrame.textContent = '';
    if (current + 1 >= total) { spFrame.append(el('p', 'sp-end', 'Konec prezentace')); return; }
    const c = pSlides[current + 1].cloneNode(true);
    c.classList.add('active');
    c.removeAttribute('aria-label');
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('.menu-btn').forEach(function (b) { b.remove(); });
    spFrame.append(c);
  }

  /* Časomíra – po načtení je připravená, spouští se ručně. */
  let timerElapsed = 0; // ms naměřené před posledním spuštěním
  let timerStart = 0;   // Date.now() při spuštění, 0 = pozastaveno
  let timerTick = 0;

  function pad(n) { return String(n).padStart(2, '0'); }

  function fmtTime(sec) {
    const neg = sec < 0;
    sec = Math.abs(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    return (neg ? '−' : '') + (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(sec % 60);
  }

  function updateTimer() {
    const elapsed = Math.floor((timerElapsed + (timerStart ? Date.now() - timerStart : 0)) / 1000);
    const remaining = state.timerMinutes * 60 - elapsed;
    speakerBar.querySelector('.sp-elapsed').textContent = fmtTime(elapsed);
    speakerBar.querySelector('.sp-remaining').textContent = fmtTime(remaining);
    spTimer.classList.toggle('over', remaining < 0);
    spTimer.classList.toggle('running', !!timerStart);
    spToggle.textContent = timerStart ? 'Pozastavit' : (elapsed ? 'Pokračovat' : 'Spustit');
  }

  function toggleTimer() {
    if (timerStart) {
      timerElapsed += Date.now() - timerStart;
      timerStart = 0;
      clearInterval(timerTick);
    } else {
      timerStart = Date.now();
      timerTick = setInterval(updateTimer, 250);
    }
    updateTimer();
  }

  function resetTimer() {
    timerElapsed = 0;
    timerStart = 0;
    clearInterval(timerTick);
    updateTimer();
  }

  /* Okno pro projektor: hlavní okno drží odkaz na něj (audience),
     okno pro projektor posílá zprávy svému window.opener. */
  let audience = null;

  function post(win, msg) {
    if (!win || win.closed) return;
    msg.ns = MSG_NS;
    try { win.postMessage(msg, '*'); } catch (e) { /* okno už neexistuje */ }
  }

  function sendSettings() {
    if (IS_AUDIENCE) return;
    post(audience, {
      type: 'settings',
      settings: {
        theme: state.theme, showSlideNumbers: state.showSlideNumbers,
        showNavArrows: state.showNavArrows, navArrowsPosition: state.navArrowsPosition
      }
    });
  }

  function openAudience() {
    if (IS_AUDIENCE) return;
    if (audience && !audience.closed) { audience.focus(); return; }
    const u = new URL(location.href);
    u.searchParams.set('role', 'audience');
    u.hash = '#' + (current + 1);
    audience = window.open(u.href, 'slides-audience', 'popup,width=1024,height=724');
    updateAudienceUi();
  }

  function closeAudience() {
    if (audience && !audience.closed) audience.close();
    audience = null;
    updateAudienceUi();
  }

  function updateAudienceUi() {
    const connected = !!(audience && !audience.closed);
    speakerBar.querySelector('.sp-status').textContent = connected ? '● projektor připojen' : '';
    speakerBar.querySelector('.sp-open').hidden = connected;
  }

  window.addEventListener('message', function (e) {
    const d = e.data;
    if (!d || d.ns !== MSG_NS) return;
    if (IS_AUDIENCE) {
      if (e.source !== window.opener) return;
      if (d.type === 'goto') goTo(d.index, { remote: true });
      else if (d.type === 'settings') {
        Object.assign(state, pick(d.settings));
        sanitize(state);
        applySettings();
      }
    } else if (d.type === 'hello') {
      // Okno pro projektor se ozve po načtení a pak pravidelně – i po obnovení hlavního okna.
      const isNew = audience !== e.source;
      audience = e.source;
      if (isNew || d.first) {
        post(audience, { type: 'goto', index: current });
        sendSettings();
        updateAudienceUi();
      }
    } else if (d.type === 'goto' && e.source === audience) {
      goTo(d.index, { remote: true });
    }
  });

  if (IS_AUDIENCE) {
    post(window.opener, { type: 'hello', first: true });
    setInterval(function () { post(window.opener, { type: 'hello' }); }, 2000);
    // Dvojklik přepne celou obrazovku (na projektoru).
    document.addEventListener('dblclick', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
    });
  } else {
    setInterval(updateAudienceUi, 1000);
  }

  /* ---------- Klávesnice ---------- */

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;

    if (menu.open) {
      if (key === 'm' || key === 'M') { e.preventDefault(); closeMenu(); }
      return;
    }

    switch (key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        e.preventDefault();
        stopAutoScroll();
        const delta = key === 'ArrowRight' ? 1 : -1;
        if (state.viewMode === 'support') supportStep(delta); else goTo(current + delta);
        break;
      }
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        if (supportVisible()) {
          supportPane.scrollBy({
            top: (key === 'ArrowDown' ? 1 : -1) * (CFG.scrollStep || 80),
            behavior: e.repeat ? 'auto' : 'smooth'
          });
        }
        break;
      case 'Home':
        e.preventDefault(); stopAutoScroll(); goTo(0); break;
      case 'End':
        e.preventDefault(); stopAutoScroll(); goTo(total - 1); break;
      case 'm':
      case 'M':
        if (IS_AUDIENCE) break;
        e.preventDefault(); openMenu(); break;
    }
  });

  window.addEventListener('hashchange', function () {
    const n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n <= total && n - 1 !== current) goTo(n - 1);
  });

  /* ---------- Menu ---------- */

  function openMenu() {
    if (IS_AUDIENCE) return;
    syncForm();
    if (!menu.open) menu.showModal();
  }

  function closeMenu() { menu.close(); }

  function syncForm() {
    Array.prototype.forEach.call(form.elements, function (input) {
      if (!input.name || !(input.name in state)) return;
      if (input.type === 'radio') input.checked = String(state[input.name]) === input.value;
      else if (input.type === 'checkbox') input.checked = !!state[input.name];
      else if (input.type === 'range' || input.type === 'number') input.value = state[input.name];
    });
    updateMenuUi();
  }

  function updateMenuUi() {
    form.querySelectorAll('[data-requires]').forEach(function (fs) {
      const req = fs.dataset.requires.split(' ');
      fs.disabled = req[0] === 'nav' ? !state.showNavArrows : req.indexOf(state.viewMode) < 0;
    });
    form.querySelectorAll('[data-export]').forEach(function (fs) {
      fs.disabled = fs.dataset.export.split(' ').indexOf(state.exportWhat) < 0;
    });
    form.querySelector('output[for="split-ratio"]').value = state.splitRatio + ' : ' + (100 - state.splitRatio);
    form.querySelector('output[for="switch-threshold"]').value = state.switchThreshold + ' %';
  }

  form.elements.splitRatio.min = CFG.splitMin || 10;
  form.elements.splitRatio.max = CFG.splitMax || 90;

  form.addEventListener('input', function (e) {
    const input = e.target;
    if (!input.name || !(input.name in state)) return;
    if (input.type === 'radio') { if (!input.checked) return; state[input.name] = input.value; }
    else if (input.type === 'checkbox') state[input.name] = input.checked;
    else if (input.type === 'range') state[input.name] = Number(input.value);
    else if (input.type === 'number') { state[input.name] = Number(input.value); sanitize(state); }

    applySettings();
    if (input.name === 'viewMode') {
      scrollSupportTo(current, false);
      if (state.viewMode === 'speaker') openAudience(); else closeAudience();
    }
    updateMenuUi();
    save();
  });

  menu.addEventListener('click', function (e) {
    if (e.target === menu) { closeMenu(); return; }
    const action = e.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'close') closeMenu();
    else if (action.dataset.action === 'export') exportPrint();
    else if (action.dataset.action === 'open-audience') openAudience();
    else if (action.dataset.action === 'reset') {
      Object.assign(state, sanitize(Object.assign({}, defaults)));
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* bez úložiště */ }
      applySettings();
      scrollSupportTo(current, false);
      if (state.viewMode !== 'speaker') closeAudience();
      syncForm();
    }
  });

  /* ---------- Export pro tisk ---------- */

  function clonePresent(i) {
    const c = pSlides[i].cloneNode(true);
    c.classList.remove('active');
    c.querySelectorAll('.menu-btn').forEach(function (b) { b.remove(); });
    return c.outerHTML;
  }

  function cloneSupport(i) {
    const c = sPages[i].cloneNode(true);
    c.querySelectorAll('.menu-btn').forEach(function (b) { b.remove(); });
    return c.outerHTML;
  }

  function exportPrint() {
    const all = pSlides.map(function (_, i) { return i; });
    let pageCss = '';
    let body = '';
    let desc = '';

    if (state.exportWhat === 'present') {
      if (state.exportPresentLayout === 'two') {
        pageCss = '@page { size: A4 portrait; margin: 0; }';
        for (let i = 0; i < total; i += 2) {
          body += '<div class="sheet portrait">' + clonePresent(i) + (i + 1 < total ? clonePresent(i + 1) : '') + '</div>';
        }
        desc = 'Prezentační snímky, dva na stránku (A4 na výšku)';
      } else {
        pageCss = '@page { size: A4 landscape; margin: 0; }';
        body = all.map(function (i) { return '<div class="sheet landscape">' + clonePresent(i) + '</div>'; }).join('');
        desc = 'Prezentační snímky, jeden na stránku (A4 na šířku)';
      }
    } else if (state.exportWhat === 'support') {
      pageCss = '@page { size: A4 portrait; margin: 15mm; }';
      body = '<div class="flow ' + state.exportSupportLayout + '">' +
        all.map(function (i) { return '<div class="group">' + cloneSupport(i) + '</div>'; }).join('') + '</div>';
      desc = 'Podpůrná část, ' + (state.exportSupportLayout === 'newpage' ? 'každý snímek na nové stránce' : 'plynule za sebou');
    } else if (state.exportBothOrientation === 'portrait') {
      pageCss = '@page { size: A4 portrait; margin: 0; }';
      body = '<div class="flow rotated-mode">' + all.map(function (i) {
        return '<div class="group">' + cloneSupport(i) + '<div class="sheet rotated">' + clonePresent(i) + '</div></div>';
      }).join('') + '</div>';
      desc = 'Podpůrná část + prezentační snímek otočený přes celou stránku';
    } else {
      pageCss = '@page { size: A4 portrait; margin: 15mm; }';
      body = '<div class="flow ' + state.exportSupportLayout + '">' + all.map(function (i) {
        return '<div class="group">' + cloneSupport(i) + '<div class="slide-below">' + clonePresent(i) + '</div></div>';
      }).join('') + '</div>';
      desc = 'Podpůrná část + zmenšený prezentační snímek';
    }

    const printTheme = THEME_FILES[CFG.printTheme] ? CFG.printTheme : state.theme;
    const themeFile = THEME_FILES[printTheme];
    // Vlastní styly prezentace (vše v <head> kromě base.css a stylu barevného režimu).
    const baseHref = templateUrl('css/base.css');
    const extraCss = Array.prototype.map.call(
      document.querySelectorAll('head link[rel="stylesheet"]:not(#theme-css), head style'),
      function (n) {
        if (n.tagName === 'STYLE') return '<style>' + n.textContent + '</style>\n';
        return n.href === baseHref ? '' : '<link rel="stylesheet" href="' + escapeHtml(n.href) + '">\n';
      }).join('');
    const html = '<!doctype html>\n<html lang="' + (document.documentElement.lang || 'cs') +
      '" class="print-html" data-theme="' + escapeHtml(printTheme) + '">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<base href="' + escapeHtml(document.baseURI) + '">\n' +
      '<title>' + escapeHtml('Tisk – ' + document.title) + '</title>\n' +
      '<link rel="stylesheet" href="' + escapeHtml(baseHref) + '">\n' +
      '<link rel="stylesheet" href="' + escapeHtml(templateUrl(themeFile)) + '">\n' +
      extraCss +
      '<link rel="stylesheet" href="' + escapeHtml(templateUrl('css/print.css')) + '">\n' +
      '<style>' + pageCss + '</style>\n</head>\n' +
      '<body class="print-doc' + (state.showSlideNumbers ? '' : ' hide-numbers') + '">\n' +
      '<div class="print-toolbar"><span><strong>Náhled pro tisk:</strong> ' + escapeHtml(desc) +
      '. Do PDF uložíte volbou „Uložit jako PDF“ v dialogu tisku.</span>' +
      '<button type="button" onclick="window.print()">Tisknout</button></div>\n' +
      body + '\n</body>\n</html>';

    const w = window.open('', '_blank');
    if (!w) {
      alert('Prohlížeč zablokoval otevření nového okna. Povolte prosím vyskakovací okna pro tuto stránku.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  /* ---------- Start ---------- */

  build();
  applySettings();
  const fromHash = parseInt(location.hash.slice(1), 10);
  current = fromHash >= 1 && fromHash <= total ? fromHash - 1 : 0;
  goTo(current, { smooth: false, updateHash: false, remote: true });

  // Při změně velikosti (okno, rozdělení, načtení obrázků) zachovat polohu v podpůrné části.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(restoreAnchor);
    ro.observe(supportPane);
    sPages.forEach(function (s) { ro.observe(s); });
  }
})();
