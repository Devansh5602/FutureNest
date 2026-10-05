(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const path = location.pathname.replace(/\/index\.html$/, '/') || '/';
    document.querySelectorAll('.nav__link, .mobile-nav__link').forEach(function (link) {
      const active = new URL(link.href).pathname === path;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const header = document.getElementById('site-header');
    const hamburger = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    if (header) {
      const checkScroll = function () {
        header.classList.toggle('header--scrolled', window.scrollY > 20);
      };
      window.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
    }

    function setMenuOpen(isOpen) {
      if (!hamburger || !mobileNav) return;
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNav.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      document.body.classList.toggle('menu-open', isOpen);
      if (header) header.classList.toggle('header--menu-open', isOpen);
    }

    if (hamburger) {
      hamburger.addEventListener('click', function () {
        setMenuOpen(hamburger.getAttribute('aria-expanded') !== 'true');
      });
    }

    if (backdrop) backdrop.addEventListener('click', function () { setMenuOpen(false); });

    if (mobileNav) {
      mobileNav.addEventListener('click', function (event) {
        if (event.target.closest('[data-mobile-link]')) setMenuOpen(false);
      });
    }

    document.addEventListener('click', function (event) {
      if (!mobileNav || !hamburger) return;
      if (!mobileNav.classList.contains('is-open')) return;
      if (mobileNav.contains(event.target) || hamburger.contains(event.target)) return;
      setMenuOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenuOpen(false);
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        setMenuOpen(false);
      });
    });
  });
})();
