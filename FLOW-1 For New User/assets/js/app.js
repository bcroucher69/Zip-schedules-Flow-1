/* ==========================================================================
   ZipSchedules × Altametrics purchase flow — app.js (v3, no dependencies)

   index.html ─Buy Now─▶ products.html ─Continue to checkout─▶ signup.html (email + cart)
   ─Continue─▶ registration.html (details ▶ verify)
   ─Verify─▶ payment-modes.html ─Add─▶ Forte checkout (card ▶ billing ▶ authorize)
   ─▶ confirm.html (Payment Method) ─Confirm─▶ Payment Message ─Ok─▶ manage.html

   Integration points:
     • api.*        every backend call (stubs that resolve success)
     • payments     Forte checkout adapter (prototype modal; swap for Forte hosted checkout)
     • CATALOG / PLANS   product + plan data
   ========================================================================== */
(function () {
  'use strict';

  /* 1. Catalog ------------------------------------------------------------- */
  var CDN = 'https://agcdn.altametrics.com/releaseHubWorks/agassets/v3/assets/images/';

  var CATALOG = [
    // Base product added by "Buy Now" on the landing page (not listed in the grid)
    { id: 'zipschedules', name: 'ZipSchedules', price: 19.99, image: CDN + 'common/zipSchedule.png', listed: false,
      label: 'Workforce', category: 'workforce', description: 'Employee scheduling and time tracking.' },

    // CONTENT: descriptions completed from the truncated design copy — review with product marketing.
    { id: 'zip-tunes', name: 'Zip Tunes', price: 9.99, image: CDN + 'common/zipSchedule.png', /* TODO: Zip Tunes artwork */
      label: 'Guest experience', category: 'recommended', description: 'Curated, licensed background music tailored to your restaurant.' },
    { id: 'zip-digital-signage', name: 'Zip Digital Signage', price: 15.00, image: CDN + 'dgx/svg/dgx_logo.svg',
      label: 'Guest experience', category: 'recommended', description: 'Engage customers with vibrant, easy-to-manage digital menu boards.' },
    { id: 'zip-clock', name: 'Zip Clock', price: 25.00, image: CDN + 'common/svg/zipclock.svg',
      label: 'Workforce', category: 'workforce', description: 'Simplify time tracking and prevent buddy punching.' },
    { id: 'zip-forecasting', name: 'Zip Forecasting', price: 49.00, image: CDN + 'common/zipForecast.png', featured: true,
      label: 'Workforce', category: 'workforce', description: 'Predict labor needs accurately using AI-driven sales forecasts.' },
    { id: 'zip-inventory', name: 'Zip Inventory', price: 39.00, image: CDN + 'common/zipInventory.png',
      label: 'Food', category: 'food', description: 'Manage stock levels, reduce waste, and streamline ordering.' },
    { id: 'zip-ordering', name: 'Zip Ordering', price: 29.00, image: CDN + 'common/zipordering-130.png',
      label: 'Food', category: 'food', description: 'Seamless integrated web and app ordering for your guests.' },
    { id: 'zip-checklist', name: 'Zip Checklist 1.0', price: 12.00, image: CDN + 'common/ZipChecklist.png',
      label: 'Food safety', category: 'food', description: 'Standardize operational procedures with digital checklists.' },
    { id: 'zip-reporting', name: 'Zip Reporting', price: 19.00, image: CDN + 'common/ZipReporting_Icon_150.png',
      label: 'Operations', category: 'recommended', description: 'Aggregated business intelligence and reporting across locations.' },
    { id: 'zip-shiftbook', name: 'Zip ShiftBook', price: 14.00, image: CDN + 'common/shiftBook.png',
      label: 'Workforce', category: 'workforce', description: 'Centralized digital logbook for communication between shifts.' }
  ];
  /* "Recommended" shows every app; Workforce / Food filter by `category`. Confirm the mapping with product. */

  /* ------------------------------------------------------------------------
     Plum POS hardware (one-time purchase, quantity per item).
     Names, descriptions and specs follow plumpos.com product pages.
     PRICES: placeholders until Plum POS confirms them; while HARDWARE_PRICES_FINAL is false,
     cards show an "Est." tag. IMAGES: replace the illustrations with Plum product photos.
     ------------------------------------------------------------------------ */
  var HARDWARE_PRICES_FINAL = false;
  var HW_IMG = 'assets/img/hardware/';
  var HARDWARE_GROUPS = [
    ['all', 'All hardware'], ['counter', 'Counter & POS'], ['payments', 'Payments'], ['mobile', 'Mobile & self-order'],
    ['kitchen', 'Kitchen'], ['accessories', 'Accessories'], ['guest', 'Guest experience'], ['time', 'Time & attendance']
  ];
  /* `photo: true` = product photo on white (blended into the card); false = illustration */
  var HARDWARE = [
    { id: 'hw-terminal', name: 'Plum POS Terminal', type: 'POS station', group: 'counter', price: 799, image: HW_IMG + 'pos-terminal.webp', photo: true,
      description: 'Countertop POS with a responsive 15.6" widescreen, built for busy counters and connected to every Plum device.',
      specs: ['15.6" widescreen', 'Magnetic stripe reader', 'Spill-resistant'] },
    { id: 'hw-handheld', name: 'Plum Handheld', type: 'Mobile POS', group: 'mobile', price: 499, image: HW_IMG + 'handheld.webp', photo: true,
      description: 'Take orders and payments tableside, at the drive-thru or curbside, synced straight to the kitchen.',
      specs: ['6.5"+ display', 'Drop-proof to 1.2 m', 'NFC & digital wallets'] },
    { id: 'hw-pax-a35', name: 'PAX A35 Payment Terminal', type: 'Payment terminal', group: 'payments', price: 399, image: HW_IMG + 'pax-a35.webp', photo: true,
      description: 'Fast, secure card terminal with a PIN pad that helps you take payments at the counter, drive-thru or curbside.',
      specs: ['PIN pad', 'Chip, swipe & tap', 'Drive-thru & curbside'] },
    { id: 'hw-kiosk', name: 'Plum Self-Service Kiosk', type: 'Self-order', group: 'mobile', price: 1499, image: HW_IMG + 'kiosk.webp', photo: true,
      description: 'Compact touchscreen kiosk where guests order and pay on their own; orders flow to POS and kitchen.',
      specs: ['Built-in printer', 'Scanner & payments', 'Small footprint'] },
    { id: 'hw-printer', name: 'Plum Receipt Printer', type: 'Printer', group: 'accessories', price: 249, image: HW_IMG + 'receipt-printer.webp', photo: true,
      description: 'Compact thermal receipt printer that sits next to your POS and keeps checkout moving.',
      specs: ['Thermal printing', 'Triple interface', 'Starter paper roll'] },
    { id: 'hw-drawer', name: 'Plum Cash Drawer', type: 'Cash management', group: 'accessories', price: 129, image: HW_IMG + 'cash-drawer.webp', photo: true,
      description: 'Heavy-duty cash drawer built to handle regular and high-volume use with ease.',
      specs: ['Heavy-duty build', 'High-volume use'] },
    { id: 'hw-scanner', name: 'Plum Scanner', type: 'Scanner', group: 'accessories', price: 149, image: HW_IMG + 'scanner.webp', photo: true,
      description: 'Countertop barcode scanner that pairs with Plum POS for fast item lookup at checkout.',
      specs: ['Barcode scanning', 'Pairs with Plum POS'] },
    // CONTENT: confirm name, description and specs for the Tunes device with Plum POS
    { id: 'hw-tunes-player', name: 'Zip Tunes Player', type: 'Music player', group: 'guest', price: 199, image: HW_IMG + 'tunes-player.webp', photo: true,
      description: 'In-store player for Zip Tunes. Connect it to your sound system to play your scheduled, licensed playlists.',
      specs: ['Pairs with Zip Tunes', 'Scheduled playlists'] },
    // No product photos supplied yet for these two; they use illustrations
    { id: 'hw-kds', name: 'Plum KDS', type: 'Kitchen display', group: 'kitchen', price: 599, image: HW_IMG + 'kds.svg',
      description: 'Replace paper tickets: route orders to stations, track prep times and show every modifier clearly.',
      specs: ['Station routing', 'Prep timers', 'Modifier display'] },
    { id: 'hw-timeclock', name: 'Plum Time Clock', type: 'Time & attendance', group: 'time', price: 349, image: HW_IMG + 'time-clock.svg',
      description: 'Time and attendance terminal with facial recognition that stops buddy punching and supports labor compliance.',
      specs: ['Facial recognition', 'Labor compliance'] }
  ];
  var HW_MAX_QTY = 99;
  function hardware(id) { for (var i = 0; i < HARDWARE.length; i++) if (HARDWARE[i].id === id) return HARDWARE[i]; return null; }

  var MERCHANT_NAME = 'Altametrics LLC';   // shown in the Forte checkout header (design also shows "HUBWORKS, LLC")
  var BASE_PRODUCT = 'zipschedules';

  /* Plan tiers on the Manage page. Prices come from CATALOG unless a tier sets its own.
     The design reserves slots for "Standard" and "51+ Employees"; add them here when final. */
  var PLANS = [{ id: 'professional', name: 'Professional' }];

  var APP_ICON = {
    'zipschedules': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h2v2H8zM14 14h2v2h-2z"/>',
    'zip-tunes': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'zip-digital-signage': '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    'zip-clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'zip-forecasting': '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    'zip-inventory': '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    'zip-ordering': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    'zip-checklist': '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'zip-reporting': '<path d="M12 20V10M18 20V4M6 20v-4"/>',
    'zip-shiftbook': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'
  };
  function appIcon(id, cls) {
    return '<svg class="' + (cls || 'auth-order__icon') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (APP_ICON[id] || APP_ICON['zip-reporting']) + '</svg>';
  }

  function product(id) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  /* 2. API stubs — replace with real endpoints ---------------------------- */
  function delay(value, ms) { return new Promise(function (r) { setTimeout(function () { r(value); }, ms || 400); }); }

  var api = {
    /** New or existing user? Resolve { exists: boolean }. Existing users go to sign-in. */
    checkEmail: function (email) { return delay({ exists: false }); },
    registerAccount: function (payload) { return delay({ ok: true, accountId: 'acct_demo' }); },
    sendVerificationCode: function (email) { return delay({ ok: true }); },
    verifyCode: function (email, code) { return delay({ ok: true }); },
    /** Persist the Forte token + non-sensitive card metadata on the account. */
    saveCard: function (card) { return delay({ ok: true }); },
    /** Subscribe the account to apps using the card on file.
        Resolve { ok: true, orderId } or { ok: false, code: 'ALREADY_PURCHASED' | ..., message }. */
    subscribe: function (ids, hardwareQty) {
      var owned = store.get().purchased || [];
      var dup = ids.filter(function (id) { return owned.indexOf(id) !== -1; });
      if (dup.length) return delay({ ok: false, code: 'ALREADY_PURCHASED', message: 'The product is already purchased' });
      return delay({ ok: true, orderId: 'ord_' + Date.now().toString(36) }, 800);
    },
    unsubscribe: function (id) { return delay({ ok: true }); }
  };

  /* 3. State (sessionStorage + memory fallback). Never stores PAN or CVV. -- */
  var STORE_KEY = 'zs_flow_v3';
  var memoryState = {};
  var store = {
    get: function () {
      try { var raw = sessionStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : memoryState; }
      catch (e) { return memoryState; }
    },
    set: function (patch) {
      var next = Object.assign({}, store.get(), patch);
      memoryState = next;
      try { sessionStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) { /* unavailable */ }
      return next;
    },
    cart: function () { return (store.get().cart || []).filter(product); },
    addToCart: function (id) { var c = store.cart(); if (c.indexOf(id) === -1) c.push(id); return store.set({ cart: c }); },
    removeFromCart: function (id) { return store.set({ cart: store.cart().filter(function (x) { return x !== id; }) }); },
    /** Hardware: { id: qty } */
    hw: function () {
      var h = store.get().hardware || {}, out = {};
      Object.keys(h).forEach(function (id) { if (hardware(id) && h[id] > 0) out[id] = h[id]; });
      return out;
    },
    setQty: function (id, qty) {
      var h = store.hw(); qty = Math.max(0, Math.min(HW_MAX_QTY, Math.floor(qty) || 0));
      if (qty) h[id] = qty; else delete h[id];
      return store.set({ hardware: h });
    },
    hwLines: function () {
      var h = store.hw();
      return HARDWARE.filter(function (x) { return h[x.id]; }).map(function (x) { return { p: x, qty: h[x.id], total: x.price * h[x.id] }; });
    },
    hasItems: function () { return store.cart().length > 0 || store.hwLines().length > 0; },
    totals: function () {
      var monthly = subtotal(store.cart());
      var hw = store.hwLines().reduce(function (s, l) { return s + l.total; }, 0);
      var units = store.hwLines().reduce(function (s, l) { return s + l.qty; }, 0);
      return { monthly: monthly, hardware: hw, due: monthly + hw, apps: store.cart().length, units: units };
    }
  };

  /* 4. Helpers -------------------------------------------------------------- */
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function fmt(n) { return money.format(n); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function subtotal(ids) { return ids.reduce(function (s, id) { return s + product(id).price; }, 0); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function params() { return new URLSearchParams(window.location.search); }

  function setLoading(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.html = btn.innerHTML; btn.textContent = label || 'Please wait\u2026'; btn.classList.add('is-loading'); btn.disabled = true; }
    else { if (btn.dataset.html) btn.innerHTML = btn.dataset.html; btn.classList.remove('is-loading'); btn.disabled = false; }
  }
  function fieldError(input, message, errId) {
    var err = document.getElementById(errId || input.id + '-error');
    if (message) { input.setAttribute('aria-invalid', 'true'); if (err) { err.textContent = message; err.hidden = false; } }
    else { input.removeAttribute('aria-invalid'); if (err) { err.textContent = ''; err.hidden = true; } }
    return !message;
  }
  function clearErrorsOnInput(form) {
    $$('input, select', form).forEach(function (el) {
      ['input', 'change'].forEach(function (ev) {
        el.addEventListener(ev, function () { if (el.getAttribute('aria-invalid')) fieldError(el, ''); });
      });
    });
  }
  function focusFirstInvalid(root) { var b = $('[aria-invalid="true"]', root); if (b) b.focus(); }

  var ICON_CHECK = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var ICON_PLUS = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var ICON_X = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_CHECKC = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';

  /* Dialogs */
  var lastFocus = null;
  function openDialog(d, focusSel) {
    if (!d) return;
    if (!d.open) { lastFocus = lastFocus || document.activeElement; d.showModal(); }
    var t = focusSel ? $(focusSel, d) : null;
    if (t) t.focus();
  }
  function closeDialog(d, keepFocus) {
    if (d && d.open) d.close();
    if (!keepFocus && lastFocus && document.body.contains(lastFocus)) { lastFocus.focus(); lastFocus = null; }
  }
  function wireDialogs() {
    $$('dialog').forEach(function (d) {
      d.addEventListener('click', function (e) {
        if (e.target !== d || d.hasAttribute('data-static')) return;
        var r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(d);
      });
      if (d.hasAttribute('data-static')) d.addEventListener('cancel', function (e) { e.preventDefault(); });
    });
    $$('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { closeDialog(b.closest('dialog')); }); });
  }

  /* Header stepper */
  function setStep(n) {
    $$('.stepper__item').forEach(function (li) {
      var i = +li.getAttribute('data-step');
      var st = i < n ? 'done' : (i === n ? 'current' : 'upcoming');
      li.setAttribute('data-state', st);
      if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      var sr = $('.sr-only', li);
      if (sr) sr.textContent = st === 'done' ? ' (completed)' : (st === 'current' ? ' (current step)' : '');
    });
  }

  /* Landing / catalog hamburger */
  function wireNavToggle() {
    $$('[data-nav-toggle]').forEach(function (t) {
      var nav = document.getElementById(t.getAttribute('aria-controls'));
      if (!nav) return;
      function set(open) { t.setAttribute('aria-expanded', String(open)); t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); nav.classList.toggle('is-open', open); }
      t.addEventListener('click', function () { set(t.getAttribute('aria-expanded') !== 'true'); });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); t.focus(); } });
    });
  }

  /* In-app "My Apps" menu */
  function wireAppsMenu() {
    var btn = $('#apps-button'), menu = $('#apps-menu');
    if (!btn || !menu) return;
    function set(open) { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; if (open) $('a', menu).focus(); }
    btn.addEventListener('click', function () { set(menu.hidden); });
    document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  }

  /* Card on file → every [data-card-*] element */
  function renderCard(card) {
    var name = card ? card.name : '';
    $$('[data-card-name]').forEach(function (el) { el.textContent = name; });
    $$('[data-card-last4]').forEach(function (el) { el.textContent = card ? card.last4 : '\u2022\u2022\u2022\u2022'; });
    $$('[data-card-exp]').forEach(function (el) { el.textContent = card ? card.expMonth + '/' + card.expYear : ''; });
    $$('[data-card-exp-short]').forEach(function (el) { el.textContent = card ? String(card.expMonth).padStart(2, '0') + '/' + String(card.expYear).slice(-2) : ''; });
    var pc = $('#paycard');
    if (pc) pc.setAttribute('aria-label', card ? BRAND_LABEL[card.brand] + ' card ending in ' + card.last4 : 'No card on file');
  }

  /* Card helpers */
  var BRAND_LABEL = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', card: 'Card' };
  function cardBrand(n) {
    if (/^4/.test(n)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    if (/^(6011|65|64[4-9])/.test(n)) return 'discover';
    return 'card';
  }
  function luhn(n) {
    var s = 0, dbl = false;
    for (var i = n.length - 1; i >= 0; i--) { var d = +n[i]; if (dbl) { d *= 2; if (d > 9) d -= 9; } s += d; dbl = !dbl; }
    return n.length >= 13 && s % 10 === 0;
  }
  var US_STATES = [['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']];

  /* ========================================================================
     5. Payments adapter (CSG Forte)
     PRODUCTION: replace `open` with Forte's hosted checkout. Forte renders the
     card → billing → authorize steps itself and returns a token + card metadata;
     call onSuccess({ token, brand, last4, expMonth, expYear, name, billing }).
     The mock below drives the prototype dialogs in payment-modes.html.
     ======================================================================== */
  var payments = (function () {
    var draft = {}, onDone = null, amount = 0;
    var dCard, dBill, dReview;

    function init() {
      dCard = $('#forte-card'); dBill = $('#forte-billing'); dReview = $('#forte-review');
      if (!dCard) return false;
      $$('[data-merchant]').forEach(function (el) { el.textContent = MERCHANT_NAME; });

      /* Step 1: card */
      var num = $('#fc-number'), exp = $('#fc-exp'), cvv = $('#fc-cvv'), next = $('#fc-next');
      var chips = $('[data-brand-chips]', dCard);
      function sync() {
        var n = num.value.replace(/\D/g, ''), e = exp.value.replace(/\D/g, ''), c = cvv.value.replace(/\D/g, '');
        next.disabled = !(n.length >= 13 && e.length === 6 && c.length >= 3);
      }
      num.addEventListener('input', function () {
        var d = num.value.replace(/\D/g, '').slice(0, 19), b = d.length >= 2 ? cardBrand(d) : '';
        num.value = b === 'amex' ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, function (m, a, x, y) { return [a, x, y].filter(Boolean).join(' '); }) : d.replace(/(\d{4})(?=\d)/g, '$1 ');
        if (chips) {
          chips.classList.toggle('has-match', !!b && b !== 'card');
          $$('.brand-chip', chips).forEach(function (ch) { ch.classList.toggle('is-active', ch.getAttribute('data-brand') === b); });
        }
        sync();
      });
      exp.addEventListener('input', function () { var d = exp.value.replace(/\D/g, '').slice(0, 6); exp.value = d.length > 2 ? d.slice(0, 2) + ' ' + d.slice(2) : d; sync(); });
      cvv.addEventListener('input', function () { cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4); sync(); });
      clearErrorsOnInput($('#forte-card-form'));

      $('#forte-card-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var n = num.value.replace(/\D/g, ''), d = exp.value.replace(/\D/g, '');
        var mm = +d.slice(0, 2), yyyy = +d.slice(2), now = new Date(), b = cardBrand(n);
        var ok = true;
        ok = fieldError(num, luhn(n) ? '' : 'Check the card number.') && ok;
        ok = fieldError(exp, mm < 1 || mm > 12 ? 'Enter the date as MM YYYY.' : (yyyy < now.getFullYear() || (yyyy === now.getFullYear() && mm < now.getMonth() + 1) ? 'This card has expired.' : '')) && ok;
        ok = fieldError(cvv, (b === 'amex' ? /^\d{4}$/ : /^\d{3}$/).test(cvv.value) ? '' : 'Enter the ' + (b === 'amex' ? '4' : '3') + '-digit code.') && ok;
        if (!ok) return focusFirstInvalid(dCard);
        draft.card = { brand: b, last4: n.slice(-4), expMonth: mm, expYear: yyyy };
        num.value = ''; exp.value = ''; cvv.value = ''; next.disabled = true;   // drop sensitive values
        if (chips) { chips.classList.remove('has-match'); $$('.brand-chip', chips).forEach(function (ch) { ch.classList.remove('is-active'); }); }
        go(dBill, '#fb-company');
      });

      /* Step 2: billing */
      var st = $('#fb-state');
      st.insertAdjacentHTML('beforeend', US_STATES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join(''));
      clearErrorsOnInput($('#forte-billing-form'));
      $('#forte-billing-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = {}; ['company', 'name', 'address1', 'address2', 'city', 'state', 'postal', 'phone', 'email'].forEach(function (k) { f[k] = $('#fb-' + k); });
        var ok = true;
        ok = fieldError(f.company, f.company.value.trim() ? '' : 'Enter the company name.') && ok;
        ok = fieldError(f.name, f.name.value.trim() ? '' : 'Enter the cardholder\u2019s full name.') && ok;
        ok = fieldError(f.postal, /^\d{5}(-\d{4})?$/.test(f.postal.value.trim()) ? '' : 'Enter a 5-digit ZIP code.') && ok;
        ok = fieldError(f.phone, !f.phone.value.trim() || f.phone.value.replace(/\D/g, '').length >= 10 ? '' : 'Enter a 10-digit phone number.') && ok;
        ok = fieldError(f.email, !f.email.value.trim() || isEmail(f.email.value.trim()) ? '' : 'Enter a valid email address.') && ok;
        if (!ok) return focusFirstInvalid(dBill);
        draft.billing = {};
        Object.keys(f).forEach(function (k) { draft.billing[k] = f[k].value.trim(); });
        go(dReview, '#forte-authorize');
      });

      /* Step 3: review + authorize */
      $('#forte-authorize').addEventListener('click', function () {
        var btn = this;
        setLoading(btn, true, 'Authorizing\u2026');
        // PRODUCTION: Forte returns the token; this mock fabricates one.
        delay({ ok: true, token: 'fttok_demo_' + Date.now() }, 900).then(function (res) {
          setLoading(btn, false);
          if (!res.ok) { var er = $('#forte-error'); er.textContent = res.message || 'The authorization didn\u2019t go through. Check the card details or try another card.'; er.hidden = false; return; }
          var card = Object.assign({ token: res.token, name: draft.billing.name, billing: draft.billing }, draft.card);
          closeDialog(dReview);
          draft = {};
          if (onDone) onDone(card);
        });
      });

      $$('[data-forte-edit]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('data-forte-edit') === 'card') go(dCard, '#fc-number'); else go(dBill, '#fb-company');
        });
      });
      return true;
    }

    function summaries() {
      var c = draft.card || {}, b = draft.billing || {}, acct = store.get().account || {};
      var company = (b.company || acct.business || '');
      $$('[data-review-brand]').forEach(function (el) { el.textContent = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' }[c.brand] || 'CARD'; });
      $$('[data-review-pay]').forEach(function (el) {
        el.innerHTML = (company ? '<strong>' + esc(company) + '</strong><br>' : '') +
          esc(b.name || acct.name || '') + '<br>' + esc(BRAND_LABEL[c.brand || 'card']) + ' Card - ' + esc(c.last4) + '<br>' +
          '<span class="forte-exp">Exp. ' + String(c.expMonth).padStart(2, '0') + '/' + esc(c.expYear) + '</span>';
      });
      $$('[data-review-bill]').forEach(function (el) {
        el.innerHTML = [esc(b.company), esc(b.name), esc([b.address1, b.address2].filter(Boolean).join(', ')),
          esc([b.city, b.state, b.postal].filter(Boolean).join(', '))].filter(Boolean).join('<br>');
      });
      $$('[data-review-amount]').forEach(function (el) { el.textContent = fmt(amount); });
      var er = $('#forte-error'); if (er) er.hidden = true;
    }

    function prefillBilling() {
      var s = store.get(), acct = s.account || {}, prev = (s.card && s.card.billing) || {};
      var v = { company: prev.company || acct.business, name: prev.name || acct.name, address1: prev.address1, address2: prev.address2,
                city: prev.city, state: prev.state, postal: prev.postal, phone: prev.phone, email: prev.email || s.email };
      Object.keys(v).forEach(function (k) { var el = $('#fb-' + k); if (el && !el.value) el.value = v[k] || ''; });
    }

    function go(dialog, focusSel) {
      [dCard, dBill, dReview].forEach(function (d) { if (d !== dialog && d.open) d.close(); });
      if (dialog === dBill) prefillBilling();
      summaries();
      openDialog(dialog, focusSel);
    }

    return {
      /** Open checkout. opts: { amount, onSuccess(card) } */
      open: function (opts) {
        if (!dCard && !init()) return;
        amount = opts.amount || 0; onDone = opts.onSuccess; draft = {};
        go(dCard, '#fc-number');
      }
    };
  })();

  /* ========================================================================
     6. Pages
     ======================================================================== */

  /* ---------- Landing ---------- */
  function initLanding() {
    var header = $('.l-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    $$('[data-buy-now]').forEach(function (b) {
      b.addEventListener('click', function () { store.addToCart(b.getAttribute('data-buy-now') || BASE_PRODUCT); window.location.href = 'products.html'; });
    });
  }

  /* ---------- Sign-up (email + cart) ---------- */
  function initSignup() {
    if (!store.hasItems()) store.addToCart(BASE_PRODUCT);
    var list = $('#signup-cart');
    function render() {
      var cart = store.cart();
      list.innerHTML = cart.length ? cart.map(function (id) {
        var p = product(id);
        return '<li class="cart-line"><img class="cart-line__icon" src="' + esc(p.image) + '" alt="" width="48" height="48">' +
          '<div><div class="cart-line__top"><span class="cart-line__name">' + esc(p.name) + '</span><span class="cart-line__price">US' + fmt(p.price) + '/mo</span></div>' +
          '<p class="cart-line__meta">' + esc(p.id === BASE_PRODUCT ? 'Workforce Management' : (p.label || '')) + '</p></div>' +
          '<button type="button" class="cart-line__remove" data-remove="' + p.id + '" aria-label="Remove ' + esc(p.name) + '">' + ICON_X + '</button></li>';
      }).join('') : '';
      list.innerHTML += store.hwLines().map(function (l) {
        return '<li class="cart-line cart-line--hw"><img class="cart-line__icon" src="' + esc(l.p.image) + '" alt="" width="48" height="48">' +
          '<div><div class="cart-line__top"><span class="cart-line__name">' + esc(l.p.name) + '</span><span class="cart-line__price">US' + fmt(l.total) + '</span></div>' +
          '<p class="cart-line__meta">Qty ' + l.qty + ' &middot; ' + fmt(l.p.price) + ' each, one-time</p></div>' +
          '<button type="button" class="cart-line__remove" data-remove-hw="' + l.p.id + '" aria-label="Remove ' + esc(l.p.name) + '">' + ICON_X + '</button></li>';
      }).join('');
      if (!store.hasItems()) list.innerHTML = '<li class="order-summary__empty">Your cart is empty. <a class="link-btn" href="products.html">Browse apps</a></li>';
      var t = store.totals();
      $('#signup-subtotal').textContent = 'US' + fmt(t.monthly) + '/mo';
      $('#signup-hw-row').hidden = !t.hardware;
      $('#signup-hw').textContent = 'US' + fmt(t.hardware);
      $('#signup-total').textContent = t.hardware ? 'US' + fmt(t.due) : 'US' + fmt(t.monthly) + '/mo';
      $('#signup-total-sub').textContent = t.hardware ? (t.monthly ? 'due today, then US' + fmt(t.monthly) + '/mo + TAX' : 'due today + TAX') : '+ TAX';
    }
    list.addEventListener('click', function (e) {
      var r = e.target.closest('[data-remove]'), rh = e.target.closest('[data-remove-hw]');
      if (r) store.removeFromCart(r.getAttribute('data-remove'));
      if (rh) store.setQty(rh.getAttribute('data-remove-hw'), 0);
      if (r || rh) { render(); $('#cart-title').focus(); }
    });
    $('#cart-title').setAttribute('tabindex', '-1');
    render();

    var input = $('#signup-email');
    if (store.get().email) input.value = store.get().email;
    clearErrorsOnInput($('#signup-form'));
    $('#signup-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!fieldError(input, !v ? 'Enter your email address.' : (isEmail(v) ? '' : 'Enter a valid email address, like name@company.com.'))) return input.focus();
      var btn = $('button[type="submit"]', this);
      setLoading(btn, true);
      api.checkEmail(v).then(function (res) {
        store.set({ email: v });
        if (res.exists) { window.location.href = '#'; /* TODO: sign-in URL for existing users */ return; }
        window.location.href = 'registration.html';
      });
    });
  }

  var ICON_MINUS = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
  var ICON_TRASH = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>';
  var ICON_BOX = '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>';

  /** Quantity stepper used on hardware cards and in the order summary */
  function qtyHTML(p, qty, compact) {
    return '<div class="qty' + (compact ? ' qty--sm' : '') + '" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
      '<button type="button" class="qty__btn" data-qty-dec="' + p.id + '" aria-label="' + (qty <= 1 ? 'Remove ' + esc(p.name) : 'Decrease quantity') + '">' + (qty <= 1 ? ICON_TRASH : ICON_MINUS) + '</button>' +
      '<input class="qty__input" type="number" inputmode="numeric" min="1" max="' + HW_MAX_QTY + '" value="' + qty + '" data-qty-input="' + p.id + '" aria-label="Quantity">' +
      '<button type="button" class="qty__btn" data-qty-inc="' + p.id + '" aria-label="Increase quantity"' + (qty >= HW_MAX_QTY ? ' disabled' : '') + '>' + ICON_PLUS + '</button></div>';
  }
  /** Wire +/- / typed quantity inside a container; onChange re-renders */
  function wireQty(root, onChange) {
    root.addEventListener('click', function (e) {
      var inc = e.target.closest('[data-qty-inc]'), dec = e.target.closest('[data-qty-dec]');
      if (inc) { var id = inc.getAttribute('data-qty-inc'); store.setQty(id, (store.hw()[id] || 0) + 1); onChange(id, 'inc'); }
      if (dec) { var id2 = dec.getAttribute('data-qty-dec'); store.setQty(id2, (store.hw()[id2] || 0) - 1); onChange(id2, 'dec'); }
    });
    root.addEventListener('change', function (e) {
      var inp = e.target.closest('[data-qty-input]'); if (!inp) return;
      var id = inp.getAttribute('data-qty-input'), v = parseInt(inp.value, 10);
      store.setQty(id, isNaN(v) || v < 1 ? 1 : v); onChange(id, 'input');
    });
  }
  function refocus(root, id, kind) {
    var sel = kind === 'inc' ? '[data-qty-inc="' + id + '"]' : kind === 'dec' ? '[data-qty-dec="' + id + '"]' : '[data-qty-input="' + id + '"]';
    var el = $(sel, root) || $('[data-hw-add="' + id + '"]', root); if (el) el.focus();
  }
  function priceTag(p) {
    return fmt(p.price) + (HARDWARE_PRICES_FINAL ? '' : '<span class="est-tag" title="Estimated price">Est.</span>');
  }

  /* ---------- Products & cart ---------- */
  function itemRow(p, removable) {
    return '<li class="cart-item"><img class="cart-item__thumb" src="' + esc(p.image) + '" alt="" width="40" height="40">' +
      '<div><p class="cart-item__name">' + esc(p.name) + '</p><p class="cart-item__meta">Monthly subscription</p></div>' +
      '<p class="cart-item__price">' + fmt(p.price) + '<span class="cart-item__meta">/mo</span></p>' +
      (removable ? '<button type="button" class="cart-item__remove" data-remove="' + p.id + '" aria-label="Remove ' + esc(p.name) + '">' + ICON_X + '</button>' : '') + '</li>';
  }

  function initCatalog() {
    var grid = $('#product-grid'), hwGrid = $('#hardware-grid'), items = $('#summary-items'), active = 'recommended', hwGroup = 'all';
    function cardHTML(p) {
      return '<article class="pcard' + (p.featured ? ' pcard--featured' : '') + '" data-id="' + p.id + '">' +
        '<div class="pcard__head"><img class="pcard__icon" src="' + esc(p.image) + '" alt="" width="56" height="56" loading="lazy">' +
        '<div class="pcard__titles"><h3 class="pcard__name">' + esc(p.name) + '</h3><p class="pcard__cat">' + esc(p.label || '') + (p.featured ? '<span class="pcard__badge">Popular</span>' : '') + '</p></div></div>' +
        '<p class="pcard__desc">' + esc(p.description) + '</p>' +
        '<div class="pcard__foot"><div><p class="pcard__price">' + fmt(p.price) + '<span class="pcard__per">/mo</span></p>' +
        '<a class="pcard__details" href="#" data-details="' + p.id + '" aria-label="Details for ' + esc(p.name) + '">Details</a></div>' +
        '<button type="button" class="btn btn--primary btn--sm pcard__add" data-add="' + p.id + '"></button></div></article>';
    }
    function hwCardHTML(p) {
      return '<article class="hcard" data-hw="' + p.id + '" data-group="' + p.group + '">' +
        '<div class="hcard__media' + (p.photo ? ' hcard__media--photo' : '') + '" data-media data-label="' + esc(p.name) + '"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="' + (p.photo ? 550 : 240) + '" height="' + (p.photo ? 580 : 160) + '" loading="lazy" decoding="async"></div>' +
        '<div class="hcard__body"><p class="hcard__type">' + esc(p.type) + '</p><h3 class="hcard__name">' + esc(p.name) + '</h3>' +
        '<p class="hcard__desc">' + esc(p.description) + '</p>' +
        '<ul class="hcard__specs">' + p.specs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="hcard__foot"><div class="hcard__pricebox"><p class="hcard__price">' + fmt(p.price) + '</p>' +
          '<p class="hcard__per">one-time' + (HARDWARE_PRICES_FINAL ? '' : ' <span class="est-tag" title="Estimated price">Est.</span>') + '</p></div>' +
        '<div class="hcard__action" data-hw-action="' + p.id + '"></div></div></div></article>';
    }
    function syncAdd() {
      var cart = store.cart(), owned = store.get().purchased || [];
      $$('[data-add]', grid).forEach(function (b) {
        var p = product(b.getAttribute('data-add')), added = cart.indexOf(p.id) !== -1, own = owned.indexOf(p.id) !== -1;
        b.classList.toggle('is-added', added || own);
        b.closest('.pcard').classList.toggle('is-added', added);
        b.setAttribute('aria-disabled', String(added || own));
        b.setAttribute('aria-label', own ? 'You already own ' + p.name : (added ? p.name + ' is in your cart' : 'Add ' + p.name + ' to cart'));
        b.innerHTML = own ? ICON_CHECK + 'Owned' : (added ? ICON_CHECK + 'Added' : ICON_PLUS + 'Add');
      });
      var h = store.hw();
      $$('[data-hw-action]', hwGrid).forEach(function (box) {
        var id = box.getAttribute('data-hw-action'), p = hardware(id), q = h[id] || 0;
        box.closest('.hcard').classList.toggle('is-added', q > 0);
        box.innerHTML = q > 0 ? qtyHTML(p, q) : '<button type="button" class="btn btn--primary btn--sm pcard__add" data-hw-add="' + id + '" aria-label="Add ' + esc(p.name) + ' to cart">' + ICON_PLUS + 'Add</button>';
      });
    }
    function hwRow(l) {
      return '<li class="cart-item cart-item--hw"><img class="cart-item__thumb cart-item__thumb--hw" src="' + esc(l.p.image) + '" alt="" width="40" height="40">' +
        '<div><p class="cart-item__name">' + esc(l.p.name) + '</p><p class="cart-item__meta">' + fmt(l.p.price) + ' each, one-time</p>' + qtyHTML(l.p, l.qty, true) + '</div>' +
        '<p class="cart-item__price">' + fmt(l.total) + '</p></li>';
    }
    function renderSummary() {
      var cart = store.cart(), lines = store.hwLines(), t = store.totals();
      var parts = [];
      if (cart.length) parts.push('<li class="summary-group">Apps<span>billed monthly</span></li>' + cart.map(function (id) { return itemRow(product(id), true); }).join(''));
      if (lines.length) parts.push('<li class="summary-group">Hardware<span>one-time</span></li>' + lines.map(hwRow).join(''));
      items.innerHTML = parts.length ? parts.join('') : '<li class="order-summary__empty">Your cart is empty.<br>Add an app or hardware to continue.</li>';
      var countBits = [];
      if (t.apps) countBits.push(t.apps + (t.apps === 1 ? ' app' : ' apps'));
      if (t.units) countBits.push(t.units + (t.units === 1 ? ' device' : ' devices'));
      $('#sum-count').textContent = countBits.join(', ');
      $('#sum-subtotal').textContent = fmt(t.monthly) + '/mo';
      $('#sum-subtotal').closest('.totals__row').hidden = !t.monthly && !!t.hardware;
      $('#sum-monthly').closest('.totals__row').hidden = !t.monthly && !!t.hardware;
      $('#sum-hw-row').hidden = !t.hardware;
      $('#sum-hardware').textContent = fmt(t.hardware);
      $('#sum-monthly').textContent = fmt(t.monthly) + '/mo';
      $('#sum-discount-row').hidden = true;
      $('#sum-due').textContent = fmt(t.due);
      $('#sum-due-sub').textContent = t.monthly ? 'Then ' + fmt(t.monthly) + '/mo' : 'One-time hardware purchase';
      $('#bar-total').textContent = fmt(t.due);
      $('#bar-count').textContent = (countBits.join(', ') || '0 items') + ', due today';
      $$('[data-checkout]').forEach(function (b) { b.disabled = !store.hasItems(); });
      syncAdd();
    }
    function matches(text, q) { return !q || text.toLowerCase().indexOf(q) !== -1; }
    function filter() {
      var q = $('#product-search').value.trim().toLowerCase(), apps = 0, hw = 0;
      var showApps = active !== 'hardware';
      $$('.pcard', grid).forEach(function (c) {
        var p = product(c.getAttribute('data-id'));
        c.hidden = !(showApps && (active === 'recommended' || p.category === active) && matches(p.name + ' ' + p.description + ' ' + p.label, q));
        if (!c.hidden) apps++;
      });
      $$('.hcard', hwGrid).forEach(function (c) {
        var p = hardware(c.getAttribute('data-hw'));
        c.hidden = !((hwGroup === 'all' || p.group === hwGroup) && matches(p.name + ' ' + p.type + ' ' + p.description + ' ' + p.specs.join(' '), q));
        if (!c.hidden) hw++;
      });
      $('#apps-section').hidden = !showApps;
      $('#catalog-empty').hidden = !showApps || apps > 0;
      $('#hardware-empty').hidden = hw > 0;
      $('#search-status').textContent = q ? apps + (apps === 1 ? ' app' : ' apps') + ' and ' + hw + ' hardware ' + (hw === 1 ? 'item' : 'items') + ' found' : '';
    }

    grid.innerHTML = CATALOG.filter(function (p) { return p.listed !== false; }).map(cardHTML).join('');
    hwGrid.innerHTML = HARDWARE.map(hwCardHTML).join('');
    $('#hw-filters').innerHTML = HARDWARE_GROUPS.map(function (g) {
      var n = g[0] === 'all' ? HARDWARE.length : HARDWARE.filter(function (x) { return x.group === g[0]; }).length;
      return '<button type="button" class="chip" data-hw-group="' + g[0] + '" aria-pressed="' + (g[0] === 'all') + '">' + esc(g[1]) + '<span class="chip__count">' + n + '</span></button>';
    }).join('');

    grid.addEventListener('click', function (e) {
      var a = e.target.closest('[data-add]');
      if (a && a.getAttribute('aria-disabled') !== 'true') { store.addToCart(a.getAttribute('data-add')); renderSummary(); a.focus(); }
      if (e.target.closest('[data-details]')) e.preventDefault(); // TODO: product detail page
    });
    hwGrid.addEventListener('click', function (e) {
      var a = e.target.closest('[data-hw-add]');
      if (a) { var id = a.getAttribute('data-hw-add'); store.setQty(id, 1); renderSummary(); refocus(hwGrid, id, 'inc'); }
    });
    wireQty(hwGrid, function (id, kind) { renderSummary(); refocus(hwGrid, id, kind); });
    wireQty(items, function (id, kind) { renderSummary(); if (store.hw()[id]) refocus(items, id, kind); else $('#summary-title').focus(); });
    items.addEventListener('click', function (e) { var r = e.target.closest('[data-remove]'); if (r) { store.removeFromCart(r.getAttribute('data-remove')); renderSummary(); $('#summary-title').focus(); } });
    $('#product-search').addEventListener('input', filter);
    $$('.seg-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.seg-tab').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        t.setAttribute('aria-pressed', 'true'); active = t.getAttribute('data-category'); filter();
        if (active === 'hardware') $('#hardware-section').scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    $('#hw-filters').addEventListener('click', function (e) {
      var c = e.target.closest('[data-hw-group]'); if (!c) return;
      $$('[data-hw-group]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      c.setAttribute('aria-pressed', 'true'); hwGroup = c.getAttribute('data-hw-group'); filter();
    });
    $$('[data-checkout]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!store.hasItems()) return;
        var s = store.get();
        window.location.href = !s.verified ? 'signup.html' : (s.card ? 'confirm.html' : 'payment-modes.html');
      });
    });
    renderSummary(); filter();
  }

  /* ---------- Registration ---------- */
  function initRegistration() {
    var details = $('#details-form'), verify = $('#verify-form'), s = store.get();
    clearErrorsOnInput(details);
    if (s.email) $('#reg-email').value = s.email;
    if (s.account) { $('#reg-name').value = s.account.name || ''; $('#reg-business').value = s.account.business || ''; }
    var cart = store.cart();
    if (store.hasItems() && $('#auth-order')) {
      $('#auth-order-items').innerHTML = cart.map(function (id) {
        var p = product(id);
        return '<li class="auth-order__row">' + appIcon(id) + '<span class="auth-order__name">' + esc(p.name) + '</span><span class="auth-order__price">' + fmt(p.price) + '/mo</span></li>';
      }).join('');
      $('#auth-order-items').innerHTML += store.hwLines().map(function (l) {
        return '<li class="auth-order__row"><svg class="auth-order__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON_BOX + '</svg>' +
          '<span class="auth-order__name">' + esc(l.p.name) + ' <span class="auth-order__qty">&times;' + l.qty + '</span></span><span class="auth-order__price">' + fmt(l.total) + '</span></li>';
      }).join('');
      $('#auth-order-total').textContent = fmt(store.totals().due);
      $('#auth-order').hidden = false;
    }

    details.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#reg-name'), email = $('#reg-email'), biz = $('#reg-business'), week = $('#reg-week-start'), ok = true;
      ok = fieldError(name, name.value.trim() ? '' : 'Enter your name.') && ok;
      ok = fieldError(email, !email.value.trim() ? 'Enter your email.' : (isEmail(email.value.trim()) ? '' : 'Enter a valid email address.')) && ok;
      ok = fieldError(biz, biz.value.trim() ? '' : 'Search for and select your business.') && ok;
      ok = fieldError(week, week.value ? '' : 'Choose the day your week starts.') && ok;
      if (!ok) return focusFirstInvalid(details);
      var payload = { name: name.value.trim(), email: email.value.trim(), business: biz.value.trim(), weekStart: week.value,
                      phone: $('#reg-phone').value.trim() ? '+1 ' + $('#reg-phone').value.trim() : '', captchaToken: null /* TODO: grecaptcha.getResponse() */ };
      var btn = $('button[type="submit"]', details);
      setLoading(btn, true);
      api.registerAccount(payload).then(function () { return api.sendVerificationCode(payload.email); }).then(function () {
        store.set({ email: payload.email, account: payload });
        setLoading(btn, false);
        details.hidden = true; verify.hidden = false;
        $('#verify-email').textContent = payload.email;
        setStep(3);
        $('.otp-input', verify).focus();
      });
    });

    var otp = $$('.otp-input', verify), group = $('.otp-inputs', verify), msg = $('#verify-message');
    function setMsg(t, good) {
      msg.textContent = t || ''; msg.hidden = !t; msg.classList.toggle('form-message--ok', !!good);
      if (good || !t) group.removeAttribute('aria-invalid'); else group.setAttribute('aria-invalid', 'true');
    }
    otp.forEach(function (inp, i) {
      inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(0, 1); if (!msg.hidden) setMsg(''); if (inp.value && otp[i + 1]) otp[i + 1].focus(); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && otp[i - 1]) { otp[i - 1].focus(); otp[i - 1].value = ''; e.preventDefault(); }
        else if (e.key === 'ArrowLeft' && otp[i - 1]) otp[i - 1].focus();
        else if (e.key === 'ArrowRight' && otp[i + 1]) otp[i + 1].focus();
      });
      inp.addEventListener('paste', function (e) {
        var d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, ''); if (!d) return;
        e.preventDefault();
        for (var j = 0; j + i < otp.length && j < d.length; j++) otp[i + j].value = d[j];
        otp[Math.min(i + d.length, otp.length - 1)].focus();
      });
    });
    verify.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = otp.map(function (x) { return x.value; }).join('');
      if (code.length !== 6) { setMsg('Enter all 6 digits of the code.'); var em = otp.filter(function (x) { return !x.value; })[0]; if (em) em.focus(); return; }
      var btn = $('button[type="submit"]', verify);
      setLoading(btn, true, 'Verifying\u2026');
      api.verifyCode(store.get().email, code).then(function (res) {
        setLoading(btn, false);
        if (!res.ok) { setMsg(res.message || 'That code didn\u2019t match. Check the email and try again.'); otp[0].focus(); return; }
        store.set({ verified: true });
        window.location.href = 'payment-modes.html';
      });
    });
    var resend = $('#resend-code');
    resend.addEventListener('click', function () {
      resend.disabled = true;
      api.sendVerificationCode(store.get().email).then(function () { setMsg('A new code has been sent to your email.', true); setTimeout(function () { resend.disabled = false; }, 30000); });
    });
  }

  /* Demo seeding for previewing in-app pages directly (?demo=1) */
  function seedDemo() {
    if (!params().has('demo')) return;
    var s = store.get();
    if (!s.account) store.set({ email: 'name@company.com', verified: true, account: { name: 'Jordan Lee', business: 'Lee Restaurant Group', email: 'name@company.com' } });
    if (!store.cart().length && !(s.purchased || []).length) store.set({ cart: ['zipschedules', 'zip-digital-signage'] });
    if (params().get('demo') === 'card' && !s.card) store.set({ card: { token: 'fttok_demo', brand: 'visa', last4: '1111', expMonth: 8, expYear: 2029, name: 'Jordan Lee', billing: {} } });
  }

  /* ---------- Payment Modes ---------- */
  function initPaymentModes() {
    seedDemo();
    function render() {
      var s = store.get(), card = s.card;
      renderCard(card);
      $('#card-empty').hidden = !!card;
      $('#card-saved').hidden = !card;
      $('#payment-alert').hidden = !!card;
      document.body.classList.toggle('has-alert', !card);
      $('#add-card-label').textContent = card ? 'Update' : 'Add';
      $('#continue-subscribe').hidden = !(card && store.hasItems());
    }
    function openCheckout() {
      payments.open({
        amount: store.totals().due,
        onSuccess: function (card) {
          api.saveCard(card).then(function () {
            store.set({ card: card });
            if (store.hasItems()) window.location.href = 'confirm.html';
            else { render(); $('#saved-title').setAttribute('tabindex', '-1'); $('#saved-title').focus(); }
          });
        }
      });
    }
    $('#add-card').addEventListener('click', openCheckout);
    var emptyAdd = $('#empty-add'); if (emptyAdd) emptyAdd.addEventListener('click', openCheckout);
    render();
    if (params().has('edit')) openCheckout();
  }

  /* ---------- Confirm (Payment Method) ---------- */
  function initConfirm() {
    seedDemo();
    var s = store.get();
    if (!s.card) { window.location.replace('payment-modes.html' + window.location.search); return; }
    if (params().has('already')) {   // demo: try to buy an app the account already owns
      var own = s.purchased || [];
      if (own.length) store.set({ cart: [own[0]] }); else store.set({ purchased: store.cart().slice(0, 1) });
    }
    renderCard(s.card);

    var cart = store.cart();
    var crumb = $('[data-crumb-app]');
    var lines = store.hwLines(), names = cart.map(function (id) { return product(id).name; }).concat(lines.map(function (l) { return l.p.name; }));
    crumb.textContent = !names.length ? 'Apps' : (names.length === 1 ? names[0] : names[0] + ' +' + (names.length - 1) + ' more');
    $('#confirm-rows').innerHTML = cart.length ? cart.map(function (id) {
        var p = product(id);
        return '<div class="sub-summary__row"><dt><img class="sub-summary__icon" src="' + esc(p.image) + '" alt="" width="32" height="32" loading="lazy">' + esc(p.name) +
          '<span class="sub-summary__meta">Monthly subscription</span></dt><dd>' + fmt(p.price) + '<span class="sub-summary__per">/mo</span></dd></div>';
      }).join('')
      : '';
    $('#confirm-rows').innerHTML += lines.map(function (l) {
      return '<div class="sub-summary__row"><dt><img class="sub-summary__icon sub-summary__icon--hw" src="' + esc(l.p.image) + '" alt="" width="32" height="32" loading="lazy">' + esc(l.p.name) + ' &times;' + l.qty +
        '<span class="sub-summary__meta">Hardware, one-time (' + fmt(l.p.price) + ' each)</span></dt><dd>' + fmt(l.total) + '</dd></div>';
    }).join('');
    if (!store.hasItems()) $('#confirm-rows').innerHTML = '<div class="sub-summary__row"><dt>Nothing selected. <a class="link-btn" href="products.html">Browse apps and hardware</a></dt></div>';
    var tt = store.totals();
    $('#confirm-total').textContent = fmt(tt.due);
    if (tt.monthly && tt.hardware) $('#confirm-total-note').textContent = 'Includes ' + fmt(tt.hardware) + ' one-time hardware; then ' + fmt(tt.monthly) + '/mo';
    var btn = $('#confirm-btn');
    btn.disabled = !store.hasItems();

    var toast = $('#toast'), timer;
    function showToast(text) {
      $('#toast-text').textContent = text; toast.hidden = false;
      clearTimeout(timer); timer = setTimeout(function () { toast.hidden = true; }, 6000);
    }
    $('#toast-close').addEventListener('click', function () { toast.hidden = true; btn.focus(); });

    btn.addEventListener('click', function () {
      var ids = store.cart(), hwOrder = store.hw();
      setLoading(btn, true, 'Confirming\u2026');
      // PRODUCTION: send hwOrder ({ id: qty }) with the order so hardware ships to the business address
      api.subscribe(ids, hwOrder).then(function (res) {
        setLoading(btn, false);
        if (!res.ok) { showToast(res.message || 'We couldn\u2019t complete the subscription. Try again.'); return; }
        var owned = (store.get().purchased || []).concat(ids);
        store.set({ purchased: owned, cart: [], hardware: {}, lastOrder: res.orderId });
        $('#message-title').textContent = 'You have successfully subscribed your site(s).';
        $('#message-text').textContent = 'Please configure your app or tell your manager to configure it.';
        openDialog($('#message-dialog'), '#message-ok');
        $('#message-ok').onclick = function () { window.location.href = 'manage.html' + (ids[0] ? '?app=' + encodeURIComponent(ids[0]) : ''); };
      });
    });
  }

  /* ---------- Manage ---------- */
  function initManage() {
    seedDemo();
    var owned = store.get().purchased || [];
    var p = product(params().get('app')) || product(owned[0]) || product(BASE_PRODUCT);
    $$('[data-app-name], [data-crumb-app]').forEach(function (el) { el.textContent = p.name; });
    document.title = 'Manage (' + p.name + ') | My Apps';
    var tiers = $('#tiers');

    function render() {
      var subscribed = (store.get().purchased || []).indexOf(p.id) !== -1;
      tiers.innerHTML = PLANS.map(function (plan) {
        var price = plan.price != null ? plan.price : p.price;
        var current = subscribed;   // single-tier today: the active plan is the subscribed one
        return '<section class="tier' + (current ? ' tier--current' : '') + '" aria-labelledby="tier-' + plan.id + '">' +
          '<div class="tier__head"><img class="tier__icon" src="' + esc(p.image) + '" alt="" width="56" height="56">' +
          '<p class="tier__app">' + esc(p.name) + '</p><h2 class="tier__name" id="tier-' + plan.id + '">' + esc(plan.name) + ' plan</h2>' +
          '<p class="tier__price"><span class="tier__amount">' + (price % 1 ? price.toFixed(2) : price) + '</span><span class="tier__per">/month</span></p></div>' +
          '<div class="tier__body">' + (current
            ? '<button type="button" class="btn btn--unsub" data-unsub>Unsubscribe ' + ICON_CHECKC + '</button><p class="tier__status">Current plan</p>'
            : '<button type="button" class="btn btn--primary btn--pill" data-sub>Subscribe</button><p class="tier__status">Not subscribed</p>') +
          '</div></section>';
      }).join('');
    }
    tiers.addEventListener('click', function (e) {
      if (e.target.closest('[data-unsub]')) openDialog($('#confirm-dialog'), '[data-close-dialog]');
      if (e.target.closest('[data-sub]')) {
        store.set({ cart: [p.id] });
        window.location.href = store.get().card ? 'confirm.html' : 'payment-modes.html';
      }
    });
    $('#confirm-unsubscribe').addEventListener('click', function () {
      var b = this;
      setLoading(b, true, 'Unsubscribing\u2026');
      api.unsubscribe(p.id).then(function () {
        setLoading(b, false);
        closeDialog($('#confirm-dialog'), true);
        store.set({ purchased: (store.get().purchased || []).filter(function (x) { return x !== p.id; }) });
        render();
        $('#message-title').textContent = 'You have successfully unsubscribed your site(s).';
        $('#message-text').textContent = 'You can subscribe again at any time.';
        openDialog($('#message-dialog'), '#message-ok');
      });
    });
    $('#message-ok').addEventListener('click', function () { closeDialog($('#message-dialog')); var f = $('[data-sub], [data-unsub]', tiers); if (f) f.focus(); });
    render();
  }

  /* 7. Boot ------------------------------------------------------------------ */
  /* Images: swap in a branded fallback panel if a remote image fails to load */
  function markFailed(img) {
    var wrap = img.closest('[data-media]');
    if (wrap) wrap.classList.add('is-failed'); else img.classList.add('is-failed');
  }
  document.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') markFailed(e.target); }, true);

  document.addEventListener('DOMContentLoaded', function () {
    $$('img').forEach(function (img) { if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markFailed(img); });
    wireDialogs(); wireNavToggle(); wireAppsMenu();
    var page = document.body.getAttribute('data-page');
    ({ landing: initLanding, signup: initSignup, catalog: initCatalog, registration: initRegistration,
       'payment-modes': initPaymentModes, confirm: initConfirm, manage: initManage }[page] || function () {})();
  });

  window.ZipFlow = { api: api, payments: payments, store: store, catalog: CATALOG, hardware: HARDWARE, plans: PLANS };
})();
