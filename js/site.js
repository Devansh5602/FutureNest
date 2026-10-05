(function () {
  'use strict';

  function prefersReducedMotion() {
    return matchMedia('(prefers-reduced-motion: reduce)');
  }

  function bindMobileMenu() {
    const menu = document.getElementById('mobile-nav');
    const opener = document.getElementById('hamburger-btn');
    const main = document.getElementById('main-content');
    const footer = document.querySelector('.fn-footer');
    if (!menu || !opener || !main || !footer) return;

    function syncMenu() {
      const open = opener.getAttribute('aria-expanded') === 'true';
      menu.inert = !open;
      main.inert = open;
      footer.inert = open;
      opener.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      if (open) {
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus({ preventScroll: true });
      }
    }

    syncMenu();
    new MutationObserver(syncMenu).observe(opener, {
      attributes: true,
      attributeFilter: ['aria-expanded']
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && opener.getAttribute('aria-expanded') === 'true') {
        opener.focus({ preventScroll: true });
      }
    }, true);

    document.addEventListener('keydown', function (event) {
      if (opener.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') {
        opener.focus({ preventScroll: true });
        return;
      }
      if (event.key !== 'Tab') return;
      const links = [opener].concat(Array.from(menu.querySelectorAll('a, button')));
      const current = links.indexOf(document.activeElement);
      event.preventDefault();
      const next = (current + (event.shiftKey ? -1 : 1) + links.length) % links.length;
      links[next].focus();
    });

    matchMedia('(min-width: 1025px)').addEventListener('change', function (event) {
      if (event.matches && opener.getAttribute('aria-expanded') === 'true') opener.click();
    });

    const skip = document.querySelector('.fn-skip');
    if (skip) {
      skip.addEventListener('click', function () {
        main.focus({ preventScroll: true });
      });
    }
  }

  function bindNewsletter() {
    const form = document.querySelector('.fn-sub');
    const status = document.getElementById('subscription-status');
    if (!form || !status) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = 'Online signup is not available yet. Please contact us to request updates.';
    });
  }

  function bindCardRow(row, previous, next) {
    if (!row || !previous || !next) return;
    const reduced = prefersReducedMotion();

    function updateEdges() {
      previous.disabled = row.scrollLeft <= 2;
      next.disabled = row.scrollLeft >= row.scrollWidth - row.clientWidth - 2;
    }

    function moveCards(direction) {
      const card = row.firstElementChild;
      const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap);
      row.scrollBy({ left: direction * distance, behavior: reduced.matches ? 'instant' : 'smooth' });
    }

    previous.addEventListener('click', function () { moveCards(-1); });
    next.addEventListener('click', function () { moveCards(1); });
    row.addEventListener('scroll', updateEdges, { passive: true });
    row.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        moveCards(event.key === 'ArrowRight' ? 1 : -1);
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        row.scrollTo({ left: event.key === 'Home' ? 0 : row.scrollWidth, behavior: 'instant' });
      }
    });
    new ResizeObserver(updateEdges).observe(row);
    updateEdges();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('page-fade-in');
    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
    bindMobileMenu();
    bindNewsletter();
    bindCardRow(
      document.getElementById('live-row'),
      document.querySelector('[data-live="prev"]'),
      document.querySelector('[data-live="next"]')
    );
  });
})();
