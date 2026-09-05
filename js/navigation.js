(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.getElementById('site-header');
    var hamburger = document.getElementById('hamburger-btn');
    var mobileNav = document.getElementById('mobile-nav');
    var mobileLinks = mobileNav ? mobileNav.querySelectorAll('[data-mobile-link]') : [];
    if (header) {
      var checkScroll = function () {
        if (window.scrollY > 20) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
      };
      window.addEventListener('scroll', checkScroll, { passive: true });
      window.checkHeaderScroll = checkScroll;
      checkScroll();
    }

    var backdrop = document.getElementById('mobile-nav-backdrop');

    function openMenu() {
      if (!hamburger || !mobileNav) return;
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
      if (header) header.classList.add('header--menu-open');
    }

    function closeMenu() {
      if (!hamburger || !mobileNav) return;
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      if (header) header.classList.remove('header--menu-open');
    }

    function toggleMenu() {
      var isOpen = hamburger && hamburger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    }

    if (hamburger) {
      hamburger.addEventListener('click', toggleMenu);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    mobileNav && mobileNav.addEventListener('click', function (e) {
      var link = e.target.closest('[data-mobile-link]');
      if (link) {
        closeMenu();
      }
    });

    document.addEventListener('click', function (e) {
      if (!mobileNav || !hamburger) return;
      if (
        mobileNav.classList.contains('is-open') &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var headerH = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
        closeMenu();
      });
    });
  });
})();
