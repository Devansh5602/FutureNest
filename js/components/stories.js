(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const stories = document.querySelector('.fn-story-grid');
    if (!stories) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
  });
})();
