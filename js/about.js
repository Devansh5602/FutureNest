/* Native details remain functional without JavaScript. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const items = Array.from(document.querySelectorAll('.ab-faq__item'));
    const animations = new Map();
    const closing = new Set();
    function settle(item) {
      const animation = animations.get(item);
      if (animation) { animation.cancel(); animations.delete(item); }
      closing.delete(item);
      item.style.height = '';
    }
    function close(item, animate = false) {
      const height = item.getBoundingClientRect().height;
      settle(item);
      if (!item.open) return;
      if (!animate || reduced.matches || !item.animate) { item.open = false; return; }
      closing.add(item);
      const animation = item.animate([
        { height: height + 'px' },
        { height: item.querySelector('summary').getBoundingClientRect().height + 'px' }
      ], { duration: 220, easing: 'ease-out' });
      animations.set(item, animation);
      animation.finished.then(() => {
        if (animations.get(item) !== animation) return;
        item.open = false;
        settle(item);
      }).catch(() => {});
    }
    items.forEach(item => {
      const summary = item.querySelector('summary');
      summary.addEventListener('click', event => {
        event.preventDefault();
        if (closing.has(item)) { settle(item); return; }
        if (item.open) { close(item, true); return; }
        const closedHeight = item.getBoundingClientRect().height;
        items.filter(other => other !== item).forEach(other => close(other));
        item.open = true;
        if (reduced.matches || !item.animate) return;
        const openHeight = item.getBoundingClientRect().height;
        const animation = item.animate([
          { height: closedHeight + 'px' }, { height: openHeight + 'px' }
        ], { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)' });
        animations.set(item, animation);
        animation.finished.then(() => {
          if (animations.get(item) === animation) animations.delete(item);
        }).catch(() => {});
      });
      // Native details also handles keyboard Enter/Space and no-JS fallbacks.
      item.addEventListener('toggle', () => { if (!item.open) settle(item); });
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) items.forEach(settle);
    });
    const tracks = document.querySelector('.ab-track-viewport');
    if (tracks) {
      const previous = document.querySelector('[data-track="prev"]');
      const next = document.querySelector('[data-track="next"]');
      function updateTrackEdges() {
        previous.disabled = tracks.scrollLeft <= 2;
        next.disabled = tracks.scrollLeft >= tracks.scrollWidth - tracks.clientWidth - 2;
      }
      function moveTrack(direction) {
        const card = tracks.querySelector('.ab-track');
        tracks.scrollBy({ left:direction * (card.getBoundingClientRect().width + 14), behavior:reduced.matches ? 'instant' : 'smooth' });
      }
      previous.addEventListener('click', () => moveTrack(-1));
      next.addEventListener('click', () => moveTrack(1));
      tracks.addEventListener('scroll', updateTrackEdges, { passive:true });
      new ResizeObserver(updateTrackEdges).observe(tracks);
      tracks.addEventListener('keydown', event => {
        if (!matchMedia('(max-width:600px)').matches) return;
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || event.key === 'End') tracks.scrollTo({left:event.key === 'Home' ? 0 : tracks.scrollWidth, behavior:'instant'});
        else moveTrack(event.key === 'ArrowRight' ? 1 : -1);
      });
      updateTrackEdges();
    }

    // The existing static site has no subscription service; never claim a fake signup.
    const form = document.querySelector('.fn-sub');
    form.addEventListener('submit', event => {
      event.preventDefault();
      document.getElementById('subscription-status').textContent =
        'Online signup is not available yet. Please contact us to request updates.';
    });

    // Keep closed mobile navigation out of the tab order and trap focus while open.
    const menu = document.getElementById('mobile-nav');
    const opener = document.getElementById('hamburger-btn');
    const main = document.getElementById('main-content');
    const footer = document.querySelector('.fn-footer');
    function syncMenu() {
      const open = opener.getAttribute('aria-expanded') === 'true';
      menu.inert = !open;
      main.inert = open;
      footer.inert = open;
      opener.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      if (open) menu.querySelector('a').focus({ preventScroll: true });
    }
    if (menu && opener) {
      syncMenu();
      new MutationObserver(syncMenu).observe(opener, { attributes: true, attributeFilter: ['aria-expanded'] });
      document.addEventListener('keydown', event => {
        if (opener.getAttribute('aria-expanded') !== 'true') return;
        if (event.key === 'Escape') { opener.focus({ preventScroll: true }); return; }
        if (event.key !== 'Tab') return;
        const links = [opener, ...menu.querySelectorAll('a, button')];
        const current = links.indexOf(document.activeElement);
        event.preventDefault();
        links[(current + (event.shiftKey ? -1 : 1) + links.length) % links.length].focus();
      });
      matchMedia('(min-width: 1025px)').addEventListener('change', event => {
        if (event.matches && opener.getAttribute('aria-expanded') === 'true') opener.click();
      });
    }
    // Restore focus even though navigation.js closes the menu earlier in the event.
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && opener.getAttribute('aria-expanded') === 'true') {
        opener.focus({ preventScroll: true });
      }
    }, true);
    document.querySelector('.fn-skip').addEventListener('click', () => main.focus({ preventScroll: true }));
  });
})();
