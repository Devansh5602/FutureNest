(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tabs = Array.from(document.querySelectorAll('[data-service]'));
    const panels = Array.from(document.querySelectorAll('.sv-panel'));
    function activate(id, updateURL = true) {
      if (!tabs.some(tab => tab.dataset.service === id)) return;
      tabs.forEach(tab => {
        const selected = tab.dataset.service === id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.id !== id; });
      if (updateURL) history.replaceState(null, '', '#' + id);
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.service));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault(); tabs[next].focus(); activate(tabs[next].dataset.service);
      });
    });
    function fromHash() {
      const id = location.hash.slice(1);
      if (!tabs.some(tab => tab.dataset.service === id)) return;
      activate(id, false);
      requestAnimationFrame(() => document.querySelector('.sv-tabs').scrollIntoView({ block:'start', behavior:'instant' }));
    }
    const stacks = Array.from(document.querySelectorAll('.sv-stack'));
    function updateStacks() {
      stacks.forEach(stack => {
        Array.from(stack.children).forEach((card, index) => {
          // Tall cards scroll fully into view before pinning; later cards cover earlier ones.
          const top = Math.min(110 + index * 20, innerHeight - card.offsetHeight - 24);
          card.style.setProperty('--stack-top', top + 'px');
        });
        stack.classList.toggle('is-stacking', !reduced.matches);
      });
    }
    const stackObserver = new ResizeObserver(updateStacks);
    stacks.forEach(stack => stackObserver.observe(stack));
    window.addEventListener('resize', updateStacks, { passive:true });
    reduced.addEventListener('change', updateStacks);
    updateStacks();
    if ('IntersectionObserver' in window) {
      document.body.classList.add('fn-motion');
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); reveal.unobserve(entry.target); }
      }), { threshold:.1 });
      document.querySelectorAll('.fn-process__col, .fn-live').forEach(section => {
        section.querySelectorAll('.fn-step').forEach((step, i) => step.style.setProperty('--step-delay', (i * 100) + 'ms'));
        reveal.observe(section);
      });
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
    // Native scrolling supports touch/trackpads. Arrows always move one complete card.
    const row = document.getElementById('live-row');
    const previous = document.querySelector('[data-live="prev"]');
    const next = document.querySelector('[data-live="next"]');
    if (row && previous && next) {
      function updateEdges() {
        previous.disabled = row.scrollLeft <= 2;
        next.disabled = row.scrollLeft >= row.scrollWidth - row.clientWidth - 2;
      }
      function moveCards(direction) {
        const card = row.firstElementChild;
        const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap);
        row.scrollBy({ left: direction * distance, behavior: reduced.matches ? 'instant' : 'smooth' });
      }
      previous.addEventListener('click', () => moveCards(-1));
      next.addEventListener('click', () => moveCards(1));
      row.addEventListener('scroll', updateEdges, { passive: true });
      row.addEventListener('keydown', event => {
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


  });
})();
