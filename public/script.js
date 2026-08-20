/* =========================================================
   Gaurav Deshmukh — Portfolio interactions
   Vanilla JS, no dependencies. Runs on GitHub Pages as-is.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.querySelector('.scroller');
  if (!scroller) return;

  const sections = Array.from(document.querySelectorAll('[data-section]'));
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  /* --- 1. Reveal-on-scroll --------------------------------- */
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const show = (el) => el.classList.add('is-visible');

  if (reduceMotion) {
    reveals.forEach(show);
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        setTimeout(() => show(el), delay);
        revealIO.unobserve(el);
      });
    }, { root: scroller, threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => revealIO.observe(el));
    // Failsafe: never leave content hidden if something goes wrong.
    setTimeout(() => reveals.forEach(show), 3000);
  }

  /* --- 2. Active-section nav highlight --------------------- */
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('data-section');
      navLinks.forEach((a) =>
        a.classList.toggle('is-active', a.getAttribute('data-nav') === id));
    });
  }, { root: scroller, threshold: 0.5 });
  sections.forEach((s) => navIO.observe(s));

  /* --- 3. Mobile menu open/close --------------------------- */
  const menu = document.querySelector('.menu');
  const burger = document.querySelector('.nav__burger');
  const menuClose = document.querySelector('.menu__close');
  const setMenu = (open) => {
    if (menu) menu.classList.toggle('is-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
  };
  const closeMenu = () => setMenu(false);
  if (burger) burger.addEventListener('click', () => setMenu(true));
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  /* --- 4. Smooth-scroll navigation ------------------------- */
  const goTo = (id) => {
    const target = document.querySelector('[data-section="' + id + '"]');
    if (target) scroller.scrollTo({ top: target.offsetTop, behavior: scrollBehavior });
  };
  document.querySelectorAll('[data-goto]').forEach((link) => {
    link.addEventListener('click', (ev) => {
      ev.preventDefault();
      goTo(link.getAttribute('data-goto'));
      closeMenu();
    });
  });

  /* --- 5. Keyboard paged navigation (↑ ↓ PgUp PgDn, Esc) --- */
  const page = (dir) => {
    const tops = sections.map((s) => s.offsetTop).sort((a, b) => a - b);
    const cur = scroller.scrollTop;
    let target;
    if (dir > 0) {
      target = tops.find((t) => t > cur + 6);
    } else {
      const prev = tops.filter((t) => t < cur - 6);
      target = prev.length ? prev[prev.length - 1] : 0;
    }
    if (target == null) target = dir > 0 ? tops[tops.length - 1] : 0;
    scroller.scrollTo({ top: target, behavior: scrollBehavior });
  };
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { closeMenu(); return; }
    const tag = (ev.target && ev.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (menu && menu.classList.contains('is-open')) return; // don't page behind the overlay
    if (ev.key === 'ArrowDown' || ev.key === 'PageDown') { ev.preventDefault(); page(1); }
    else if (ev.key === 'ArrowUp' || ev.key === 'PageUp') { ev.preventDefault(); page(-1); }
  });
});
