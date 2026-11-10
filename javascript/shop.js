/* PYOSHOP · shop.js — home page: catalog, search/filter, quick view, cart drawer, carousels. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => `$${n.toFixed(2)}`;

  /* ---------------------------------------------------------
     1. Catalog — single source of truth. Add a product here
        and it appears in the grid, filters, search and quick view.
     --------------------------------------------------------- */
  const PRODUCTS = [
    { id: 'coffee-maker', name: 'Keurig Coffee Maker', category: 'Home', price: 90.99, old: 150, folder: 'product1', page: 'pages/CoffeeMaker.html',
      blurb: 'Multistream brewing for more flavor in every cup, a 66 oz dual-position reservoir and back-to-back brewing with no reheating wait.' },
    { id: 'gaming-headset', name: 'Gaming Headset', category: 'Audio', price: 21.99, old: 29.99, folder: 'product2', page: 'pages/GamingHeadset.html',
      blurb: '50mm neodymium drivers, a noise-isolating microphone and soft ear cushions. Works with PC, PlayStation, Xbox, Switch and mobile.' },
    { id: 'asus-gaming', name: 'ASUS TUF Gaming A16', category: 'Computers', price: 900.99, old: 2000, folder: 'product3', page: 'pages/ASUSGaming.html',
      blurb: 'Ryzen 9 with an RTX 4060, a 2.5K 165Hz display and military-grade durability, cooled by Arc Flow fans.' },
    { id: 'smart-watch', name: 'Smart Watch', category: 'Wearables', price: 109.99, old: 200, folder: 'product4', page: 'pages/SmartWatch.html',
      blurb: '1.85" HD screen, Bluetooth calling, 24-hour health monitoring, 120+ sports modes and IP68 water resistance.' }
  ];
  const byId = id => PRODUCTS.find(p => p.id === id);
  const photo = (p, n = 1) => `images/${p.folder}/pro${n}.jpg`;
  const off = p => Math.round((1 - p.price / p.old) * 100);

  /* ---------------------------------------------------------
     2. Overlay + drawers (one open at a time)
     --------------------------------------------------------- */
  let lastFocus = null;
  function openDrawer(el) {
    closeDrawers(true);
    lastFocus = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-drawer');
    $('[data-close]', el).focus({ preventScroll: true });
  }
  function closeDrawers(keepOverlay) {
    $$('.drawer.is-open').forEach(d => { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
    if (!keepOverlay) { document.body.classList.remove('has-drawer'); lastFocus?.focus?.({ preventScroll: true }); }
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('.overlay')) closeDrawers(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------------------------------------------------------
     3. Cart — persisted as [{id, qty}]; prices always come
        from the catalog, never from storage.
     --------------------------------------------------------- */
  const Cart = {
    items: [],
    load() {
      try { this.items = JSON.parse(localStorage.getItem('pyo-cart')) || []; } catch (e) { this.items = []; }
      this.items = this.items.filter(i => byId(i.id) && i.qty > 0);
    },
    commit() { try { localStorage.setItem('pyo-cart', JSON.stringify(this.items)); } catch (e) {} renderCart(); },
    add(id, qty = 1) {
      const it = this.items.find(i => i.id === id);
      it ? it.qty = Math.min(99, it.qty + qty) : this.items.push({ id, qty });
      this.commit(); bumpBadge();
    },
    set(id, qty) { qty < 1 ? this.remove(id) : (this.items.find(i => i.id === id).qty = Math.min(99, qty), this.commit()); },
    remove(id) { this.items = this.items.filter(i => i.id !== id); this.commit(); },
    count() { return this.items.reduce((n, i) => n + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + byId(i.id).price * i.qty, 0); }
  };

  function bumpBadge() { const c = $('#cart-count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }

  function renderCart() {
    $('#cart-count').textContent = Cart.count();
    $('#cart-total').textContent = money(Cart.total());
    $('#cart-sub').textContent = `${Cart.count()} ${Cart.count() === 1 ? 'piece' : 'pieces'}`;
    const list = $('#cart-items'), empty = !Cart.items.length;
    $('#cart-foot').hidden = empty;
    list.innerHTML = empty
      ? `<div class="cart-empty"><h4>Your cart is empty</h4><p>Add a piece from the collection and it will wait for you here.</p><button class="btn" data-close data-goto="#collection">Browse the collection</button></div>`
      : Cart.items.map(i => { const p = byId(i.id); return `
        <div class="cart-item" data-id="${p.id}">
          <img src="${photo(p)}" alt="${p.name}">
          <div>
            <h4>${p.name}</h4>
            <div class="stepper"><button data-dec aria-label="Decrease quantity">&minus;</button><output>${i.qty}</output><button data-inc aria-label="Increase quantity">+</button></div>
          </div>
          <div class="line-wrap"><div class="line">${money(p.price * i.qty)}</div><button class="remove" data-remove>Remove</button></div>
        </div>`; }).join('');
    $('#checkout-summary').innerHTML = Cart.items.map(i => `<div><span>${byId(i.id).name} × ${i.qty}</span><span>${money(byId(i.id).price * i.qty)}</span></div>`).join('')
      + `<div><strong>Total</strong><strong>${money(Cart.total())}</strong></div>`;
    if (empty) $('#cart').classList.remove('is-checkout');
  }

  $('#cart-items').addEventListener('click', e => {
    const row = e.target.closest('.cart-item'); if (!row) return;
    const id = row.dataset.id, it = Cart.items.find(i => i.id === id);
    if (e.target.closest('[data-inc]')) Cart.set(id, it.qty + 1);
    if (e.target.closest('[data-dec]')) Cart.set(id, it.qty - 1);
    if (e.target.closest('[data-remove]')) Cart.remove(id);
  });
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]'); if (g) setTimeout(() => $(g.dataset.goto)?.scrollIntoView({ behavior: 'smooth' }), 350);
  });
  $('#open-cart').addEventListener('click', () => openDrawer($('#cart')));
  $('#to-checkout').addEventListener('click', () => $('#cart').classList.add('is-checkout'));
  $('#back-to-cart').addEventListener('click', () => $('#cart').classList.remove('is-checkout'));
  $('#checkout-form').addEventListener('submit', () => {
    $('#order-json').value = JSON.stringify(Cart.items.map(i => ({ id: i.id, name: byId(i.id).name, qty: i.qty, price: byId(i.id).price })));
  });

  /* ---------------------------------------------------------
     4. Grid — live search + category chips
     --------------------------------------------------------- */
  const grid = $('#grid'), state = { q: '', cat: 'All' };
  const cats = ['All', ...new Set(PRODUCTS.map(p => p.category))];
  $('#chips').innerHTML = cats.map(c => `<button class="chip${c === 'All' ? ' is-active' : ''}" data-cat="${c}">${c}</button>`).join('');

  const matches = p => {
    const q = state.q.trim().toLowerCase();
    return (state.cat === 'All' || p.category === state.cat) && (!q || `${p.name} ${p.category} ${p.blurb}`.toLowerCase().includes(q));
  };
  function renderGrid() {
    const list = PRODUCTS.filter(matches);
    $('#result-count').textContent = `${list.length} of ${PRODUCTS.length} pieces`;
    grid.innerHTML = list.length ? list.map((p, i) => `
      <article class="product" data-id="${p.id}" data-reveal style="--i:${i}">
        <button class="img" data-quick aria-label="Quick view ${p.name}">
          <span class="badge">Save ${off(p)}%</span>
          <img src="${photo(p)}" alt="${p.name}" loading="lazy">
        </button>
        <div class="info">
          <span class="cat">${p.category}</span>
          <h2>${p.name}</h2>
          <div class="price">${money(p.price)} <s>${money(p.old)}</s></div>
          <div class="actions">
            <button class="btn btn--ghost btn--sm" data-quick>Quick view</button>
            <button class="btn btn--sm" data-add>Add to cart</button>
          </div>
        </div>
      </article>`).join('')
      : `<div class="empty"><h3>Nothing matches yet</h3><p>Try a different word, or show every piece.</p><button class="btn btn--sm" data-reset>Show all pieces</button></div>`;
    PYO_reveal(grid);
  }
  let swap;
  function refresh() {
    grid.classList.add('is-leaving');
    clearTimeout(swap);
    swap = setTimeout(() => { renderGrid(); grid.classList.remove('is-leaving'); }, 280);
  }
  $('#search').addEventListener('input', e => { state.q = e.target.value; refresh(); });
  $('#chips').addEventListener('click', e => {
    const c = e.target.closest('[data-cat]'); if (!c) return;
    state.cat = c.dataset.cat;
    $$('.chip').forEach(b => b.classList.toggle('is-active', b === c));
    refresh();
  });
  grid.addEventListener('click', e => {
    if (e.target.closest('[data-reset]')) {
      state.q = ''; state.cat = 'All'; $('#search').value = '';
      $$('.chip').forEach(b => b.classList.toggle('is-active', b.dataset.cat === 'All')); return refresh();
    }
    const card = e.target.closest('.product'); if (!card) return;
    if (e.target.closest('[data-add]')) { Cart.add(card.dataset.id); toast(`${byId(card.dataset.id).name} added to your cart`); }
    else if (e.target.closest('[data-quick]')) openQuick(card.dataset.id);
  });
  $('#nav-search').addEventListener('click', () => {
    $('#collection').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#search').focus({ preventScroll: true }), 700);
  });

  /* ---------------------------------------------------------
     5. Quick view drawer
     --------------------------------------------------------- */
  function openQuick(id) {
    const p = byId(id); let qty = 1;
    $('#qv-body').innerHTML = `
      <div class="qv-main"><img id="qv-img" src="${photo(p)}" alt="${p.name}"></div>
      <div class="qv-thumbs">${[1, 2, 3, 4, 5].map(n => `<button class="${n === 1 ? 'is-active' : ''}" data-n="${n}" aria-label="Photo ${n}"><img src="${photo(p, n)}" alt=""></button>`).join('')}</div>
      <div class="qv">
        <span class="eyebrow">${p.category}</span>
        <h4>${p.name}</h4>
        <div class="price">${money(p.price)} <s>${money(p.old)}</s></div>
        <p>${p.blurb}</p>
        <div class="buy-row">
          <div class="stepper"><button data-qd aria-label="Decrease quantity">&minus;</button><output id="qv-qty">1</output><button data-qi aria-label="Increase quantity">+</button></div>
          <button class="btn btn--solid" data-qadd>Add to cart</button>
        </div>
        <a class="more" href="${p.page}">View full details</a>
      </div>`;
    const body = $('#qv-body'), img = $('#qv-img'), out = $('#qv-qty');
    body.onclick = e => {
      const t = e.target.closest('[data-n]');
      if (t) {
        $$('.qv-thumbs button', body).forEach(b => b.classList.toggle('is-active', b === t));
        img.classList.add('swap');
        setTimeout(() => { img.src = photo(p, t.dataset.n); img.classList.remove('swap'); }, 300);
      }
      if (e.target.closest('[data-qd]')) out.textContent = qty = Math.max(1, qty - 1);
      if (e.target.closest('[data-qi]')) out.textContent = qty = Math.min(99, qty + 1);
      if (e.target.closest('[data-qadd]')) { Cart.add(p.id, qty); openDrawer($('#cart')); }
    };
    openDrawer($('#quick'));
  }

  /* ---------------------------------------------------------
     6. Carousel — crossfade, arrows, dots, optional autoplay
     --------------------------------------------------------- */
  function Carousel(root, { auto = 0 } = {}) {
    const slides = $$('.slide', root), dots = $('.dots', root);
    let i = 0, timer;
    dots.innerHTML = slides.map((_, n) => `<button aria-label="Show slide ${n + 1}"></button>`).join('');
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.inert = k !== i; });
      $$('button', dots).forEach((d, k) => d.classList.toggle('is-active', k === i));
    };
    const play = () => { stop(); if (auto && !matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => !document.hidden && show(i + 1), auto); };
    const stop = () => clearInterval(timer);
    $('[data-prev]', root).onclick = () => { show(i - 1); play(); };
    $('[data-next]', root).onclick = () => { show(i + 1); play(); };
    dots.onclick = e => { const k = $$('button', dots).indexOf(e.target.closest('button')); if (k > -1) { show(k); play(); } };
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
    show(0); play();
  }
  Carousel($('#hero'), { auto: 8000 });
  Carousel($('#testimonials'));

  /* init */
  document.addEventListener('DOMContentLoaded', () => { Cart.load(); renderCart(); renderGrid(); }); // after base.js defines PYO_reveal
})();
