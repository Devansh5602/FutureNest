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
      const card = row.querySelector(':scope > :not([hidden])') || row.firstElementChild;
      const style = getComputedStyle(row);
      const gap = parseFloat(style.columnGap || style.gap || 0);
      const distance = card ? (card.getBoundingClientRect().width + gap) : 280;
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

  function bindOpportunityFilters() {
    const sections = document.querySelectorAll('.fn-opportunities');
    sections.forEach(function (section) {
      const filterBtns = section.querySelectorAll('.fn-opp-filter-btn');
      const cards = section.querySelectorAll('.fn-opp-card');
      const grid = section.querySelector('.fn-opp-grid');
      if (!filterBtns.length || !cards.length) return;

      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const filter = this.getAttribute('data-filter') || 'all';
          filterBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          this.classList.add('is-active');
          this.setAttribute('aria-pressed', 'true');

          cards.forEach(function (card) {
            const cat = card.getAttribute('data-category') || '';
            if (filter === 'all' || cat === filter) {
              card.removeAttribute('hidden');
            } else {
              card.setAttribute('hidden', '');
            }
          });

          if (grid) {
            grid.scrollTo({ left: 0, behavior: 'instant' });
            grid.dispatchEvent(new Event('scroll'));
          }
        });
      });
    });
  }

  function bindLiveMarquee() {
    const liveSections = document.querySelectorAll('.fn-live');
    if (!liveSections.length) return;

    liveSections.forEach(function (sec) {
      const track = sec.querySelector('.fn-live__track');
      const prevBtn = sec.querySelector('[data-live="prev"]');
      const nextBtn = sec.querySelector('[data-live="next"]');
      if (!track) return;

      let resumeTimer = null;
      function getAnimation() {
        if (typeof track.getAnimations === 'function') {
          const anims = track.getAnimations();
          if (anims && anims.length) return anims[0];
        }
        return null;
      }

      function stepCards(direction) {
        const anim = getAnimation();
        if (!anim) return;
        const totalDuration = 36000;
        const step = 4500;
        let cur = (anim.currentTime || 0) % totalDuration;
        if (cur < 0) cur += totalDuration;
        cur += direction * step;
        if (cur < 0) cur += totalDuration;
        cur = cur % totalDuration;
        anim.currentTime = cur;
        anim.pause();

        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
          if (!track.matches(':hover')) {
            anim.play();
          }
        }, 2200);
      }

      if (prevBtn) {
        prevBtn.disabled = false;
        prevBtn.addEventListener('click', function () {
          stepCards(-1);
        });
      }
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.addEventListener('click', function () {
          stepCards(1);
        });
      }

      sec.addEventListener('touchstart', function () {
        const anim = getAnimation();
        if (anim) anim.pause();
      }, { passive: true });

      sec.addEventListener('touchend', function () {
        const anim = getAnimation();
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
          if (anim && !track.matches(':hover')) {
            anim.play();
          }
        }, 1500);
      }, { passive: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('page-fade-in');
    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
    bindMobileMenu();
    bindNewsletter();
    bindOpportunityFilters();
    bindLiveMarquee();
    document.querySelectorAll('.fn-opportunities').forEach(function (oppSection) {
      const grid = oppSection.querySelector('.fn-opp-grid');
      const prev = oppSection.querySelector('[data-opp="prev"]');
      const next = oppSection.querySelector('[data-opp="next"]');
      if (grid && prev && next) {
        bindCardRow(grid, prev, next);
      }
    });
  });
})();
