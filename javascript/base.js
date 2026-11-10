/* PYOSHOP · base.js — theme, mobile menu, scroll reveal, loader, back-to-top. Loaded on every page. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  let theme = 'dark';
  try { theme = localStorage.getItem('pyo-theme') || 'dark'; } catch (e) {}
  root.dataset.theme = theme;

  const hideLoader = () => document.querySelector('.loading-screen')?.classList.add('hidden');
  window.addEventListener('load', () => setTimeout(hideLoader, 450));
  setTimeout(hideLoader, 4000); // failsafe if an image stalls

  document.addEventListener('DOMContentLoaded', () => {
    /* theme toggle */
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const paint = () => {
        const dark = root.dataset.theme === 'dark';
        btn.innerHTML = `<i class="fa-solid ${dark ? 'fa-sun' : 'fa-moon'}"></i>`;
        btn.setAttribute('aria-label', dark ? 'Switch to ivory theme' : 'Switch to midnight theme');
      };
      paint();
      btn.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('pyo-theme', root.dataset.theme); } catch (e) {}
        paint();
      });
    });

    /* mobile menu */
    const toggle = document.querySelector('.menu_toggle'), menu = document.getElementById('menu');
    if (toggle && menu) {
      const set = open => {
        menu.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}"></i>`;
      };
      toggle.addEventListener('click', () => set(!menu.classList.contains('active')));
      menu.addEventListener('click', e => e.target.closest('a') && set(false));
    }

    /* scroll reveal — call PYO_reveal(el) after injecting new [data-reveal] nodes */
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    window.PYO_reveal = (scope = document) =>
      scope.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => io.observe(el));
    PYO_reveal();

    /* back to top */
    const top = Object.assign(document.createElement('button'), {
      className: 'to-top icon-btn', type: 'button',
      innerHTML: '<i class="fa-solid fa-arrow-up"></i>'
    });
    top.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(top);
    top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
    addEventListener('scroll', () => top.classList.toggle('show', scrollY > 500), { passive: true });
  });
})();
