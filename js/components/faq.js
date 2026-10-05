(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const items = Array.from(document.querySelectorAll('.ab-faq__item'));
    const animations = new Map();
    const closing = new Set();

    function settle(item) {
      const animation = animations.get(item);
      if (animation) {
        animation.cancel();
        animations.delete(item);
      }
      closing.delete(item);
      item.style.height = '';
    }

    function close(item, animate) {
      const height = item.getBoundingClientRect().height;
      settle(item);
      if (!item.open) return;
      if (!animate || reduced.matches || !item.animate) {
        item.open = false;
        return;
      }
      closing.add(item);
      const summary = item.querySelector('summary');
      const animation = item.animate([
        { height: height + 'px' },
        { height: summary.getBoundingClientRect().height + 'px' }
      ], { duration: 220, easing: 'ease-out' });
      animations.set(item, animation);
      animation.finished.then(function () {
        if (animations.get(item) !== animation) return;
        item.open = false;
        settle(item);
      }).catch(function () {});
    }

    items.forEach(function (item) {
      const summary = item.querySelector('summary');
      summary.addEventListener('click', function (event) {
        event.preventDefault();
        if (closing.has(item)) {
          settle(item);
          return;
        }
        if (item.open) {
          close(item, true);
          return;
        }
        const closedHeight = item.getBoundingClientRect().height;
        items.filter(function (other) { return other !== item; }).forEach(function (other) {
          close(other);
        });
        item.open = true;
        if (reduced.matches || !item.animate) return;
        const openHeight = item.getBoundingClientRect().height;
        const animation = item.animate([
          { height: closedHeight + 'px' },
          { height: openHeight + 'px' }
        ], { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)' });
        animations.set(item, animation);
        animation.finished.then(function () {
          if (animations.get(item) === animation) animations.delete(item);
        }).catch(function () {});
      });
      item.addEventListener('toggle', function () {
        if (!item.open) settle(item);
      });
    });

    reduced.addEventListener('change', function () {
      if (reduced.matches) items.forEach(settle);
    });

  });
})();
