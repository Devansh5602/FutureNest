/**
 * FutureNest Placements — All Videos Page Interactions
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalPosterImg = document.getElementById('modal-poster-img');
    const modalName = document.getElementById('modal-title');
    const modalRole = document.getElementById('modal-role');
    const modalBadge = document.getElementById('modal-badge');
    const modalQuote = document.getElementById('modal-quote');
    const cards = document.querySelectorAll('.vd-card');

    let lastActiveElement = null;

    const candidateStories = [
      "FutureNest completely changed my job search journey. Within 4 weeks of optimizing my profile and mock interview drills, I received multiple offers from top tech companies.",
      "The dedicated recruiter support and resume ATS revamp gave me instant visibility. I went from zero interview calls to signing my dream offer with full visa sponsorship.",
      "Navigating the US tech market seemed overwhelming until I partnered with FutureNest. Their strategic guidance and industry network delivered real results.",
      "Exceptional preparation, high-touch support, and genuine care for candidate success. The salary negotiation coaching alone helped me secure a 40% higher package.",
      "From technical assessments to executive interview prep, the FutureNest mentors were beside me every step of the way. Highly recommended!"
    ];

    function openModal(card) {
      lastActiveElement = card;
      const name = card.dataset.name || card.querySelector('.vd-card__name')?.textContent || 'Candidate Story';
      const role = card.dataset.role || card.querySelector('.vd-card__role')?.textContent || 'Professional Placement';
      const badgeHtml = card.querySelector('.vd-card__badge')?.innerHTML || '';
      const imgSrc = card.dataset.img || card.querySelector('.vd-card__img')?.getAttribute('src') || '';
      const storyIdx = parseInt(card.dataset.index || '0', 10) % candidateStories.length;

      if (modalName) modalName.textContent = name;
      if (modalRole) modalRole.textContent = role;
      if (modalBadge) modalBadge.innerHTML = badgeHtml;
      if (modalQuote) modalQuote.textContent = '“' + candidateStories[storyIdx] + '”';
      if (modalPosterImg && imgSrc) modalPosterImg.src = imgSrc;

      modal.removeAttribute('hidden');
      // Trigger reflow for transition
      void modal.offsetWidth;
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';

      if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeModal() {
      if (!modal.classList.contains('is-active')) return;
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
      setTimeout(function () {
        modal.setAttribute('hidden', '');
        if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
          lastActiveElement.focus();
        }
      }, 300);
    }

    cards.forEach(function (card, idx) {
      card.dataset.index = idx.toString();

      card.addEventListener('click', function () {
        openModal(card);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  });
})();
