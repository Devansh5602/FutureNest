(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tabs = Array.from(document.querySelectorAll('[data-service]'));
    const panels = Array.from(document.querySelectorAll('.sv-panel'));

    function activate(id, updateURL) {
      if (updateURL === undefined) updateURL = true;
      if (!tabs.some(function (tab) { return tab.dataset.service === id; })) return;
      tabs.forEach(function (tab) {
        const selected = tab.dataset.service === id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== id;
      });
      requestAnimationFrame(updateStacks);
      if (updateURL) history.replaceState(null, '', '#' + id);
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(tab.dataset.service);
      });
      tab.addEventListener('keydown', function (event) {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        tabs[next].focus();
        activate(tabs[next].dataset.service);
      });
    });

    function fromHash() {
      const id = location.hash.slice(1);
      if (!tabs.some(function (tab) { return tab.dataset.service === id; })) return;
      activate(id, false);
      requestAnimationFrame(function () {
        document.querySelector('.sv-tabs').scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    }

    const stacks = Array.from(document.querySelectorAll('.sv-stack'));

    function updateStacks() {
      const headerHeight = document.getElementById('site-header').getBoundingClientRect().height;
      stacks.forEach(function (stack) {
        if (!stack.offsetHeight) return;
        Array.from(stack.children).forEach(function (card, index) {
          const offset = innerWidth <= 700 ? 10 : 20;
          const top = Math.min(headerHeight + 16 + index * offset, innerHeight - card.offsetHeight - 24);
          card.style.setProperty('--stack-top', top + 'px');
          card.style.zIndex = String(index + 1);
        });
        stack.classList.toggle('is-stacking', !reduced.matches);
      });
    }

    const stackObserver = new ResizeObserver(updateStacks);
    stacks.forEach(function (stack) {
      Array.from(stack.children).forEach(function (card) { stackObserver.observe(card); });
    });
    window.addEventListener('resize', updateStacks, { passive: true });
    reduced.addEventListener('change', updateStacks);
    updateStacks();

    if ('IntersectionObserver' in window) {
      document.body.classList.add('fn-motion');
      const reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          reveal.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.fn-process__col, .fn-live').forEach(function (section) {
        section.querySelectorAll('.fn-step').forEach(function (step, index) {
          step.style.setProperty('--step-delay', (index * 100) + 'ms');
        });
        reveal.observe(section);
      });
    }

    fromHash();
    window.addEventListener('hashchange', fromHash);
  });
})();
