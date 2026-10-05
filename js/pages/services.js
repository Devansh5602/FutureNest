(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tabs = Array.from(document.querySelectorAll('[data-service]'));
    const panels = Array.from(document.querySelectorAll('.sv-panel'));
    const stories = document.querySelector('.fn-story-grid');

    if (stories) {
      stories.addEventListener('keydown', function (event) {
        if (!matchMedia('(max-width: 600px)').matches || event.target !== stories) return;
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || event.key === 'End') {
          stories.scrollTo({ left: event.key === 'Home' ? 0 : stories.scrollWidth, behavior: 'instant' });
          return;
        }
        const distance = stories.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(stories).columnGap);
        stories.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * distance, behavior: reduced.matches ? 'instant' : 'smooth' });
      });
    }

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
      stacks.forEach(function (stack) {
        Array.from(stack.children).forEach(function (card, index) {
          const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
          const top = Math.min((110 + index * 20) * scale, innerHeight - card.offsetHeight - 24 * scale);
          card.style.setProperty('--stack-top', top + 'px');
        });
        stack.classList.toggle('is-stacking', !reduced.matches);
      });
    }

    const stackObserver = new ResizeObserver(updateStacks);
    stacks.forEach(function (stack) {
      stackObserver.observe(stack);
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
