(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tracks = document.querySelector('.ab-track-viewport');
    if (!tracks) return;

    const previous = document.querySelector('[data-track="prev"]');
    const next = document.querySelector('[data-track="next"]');

    function updateTrackEdges() {
      previous.disabled = tracks.scrollLeft <= 2;
      next.disabled = tracks.scrollLeft >= tracks.scrollWidth - tracks.clientWidth - 2;
    }

    function moveTrack(direction) {
      const card = tracks.querySelector('.ab-track');
      tracks.scrollBy({
        left: direction * (card.getBoundingClientRect().width + 14),
        behavior: reduced.matches ? 'instant' : 'smooth'
      });
    }

    previous.addEventListener('click', function () { moveTrack(-1); });
    next.addEventListener('click', function () { moveTrack(1); });
    tracks.addEventListener('scroll', updateTrackEdges, { passive: true });
    new ResizeObserver(updateTrackEdges).observe(tracks);
    tracks.addEventListener('keydown', function (event) {
      if (!matchMedia('(max-width:600px)').matches) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') {
        tracks.scrollTo({ left: event.key === 'Home' ? 0 : tracks.scrollWidth, behavior: 'instant' });
      } else {
        moveTrack(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    updateTrackEdges();
  });
})();
