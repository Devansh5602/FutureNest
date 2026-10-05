(function () {
  'use strict';

  function initHome() {
    const hero = document.querySelector('.fn-hero');
    if (!hero || hero.dataset.initialized) return;
    hero.dataset.initialized = 'true';

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const slides = Array.from(hero.querySelectorAll('.fn-hero__slide'));
    const arrows = Array.from(hero.querySelectorAll('[data-hero="prev"], [data-hero="next"]'));
    const status = document.getElementById('hero-status');
    let index = 0;
    let timer;
    let moving = false;
    let focusPaused = false;
    let hoverPaused = false;
    let heroVisible = true;
    let animations = [];

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
    });

    function exposeSlide() {
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== index));
        slide.inert = i !== index;
      });
    }

    function schedule() {
      clearTimeout(timer);
      if (!moving && !focusPaused && !hoverPaused &&
          heroVisible && !document.hidden && !reduced.matches) {
        timer = setTimeout(() => show(index + 1, 1, false), 5000);
      }
    }

    async function show(next, direction, announce) {
      if (moving || slides.length < 2) return;
      next = (next + slides.length) % slides.length;
      if (next === index) return;
      clearTimeout(timer);
      moving = true;
      arrows.forEach(button => { button.disabled = true; });
      const previous = slides[index];
      const incoming = slides[next];
      previous.classList.remove('is-active');
      previous.classList.add('is-leaving');
      incoming.classList.add('is-active');
      index = next;
      exposeSlide();

      if (!reduced.matches && typeof incoming.animate === 'function') {
        const options = { duration: 950, easing: 'cubic-bezier(.22, 1, .36, 1)' };
        animations = [
          previous.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(' + (-direction * 100) + '%)' }
          ], options),
          incoming.animate([
            { transform: 'translateX(' + (direction * 100) + '%)' },
            { transform: 'translateX(0)' }
          ], options)
        ];
        await Promise.allSettled(animations.map(animation => animation.finished));
      }
      previous.classList.remove('is-leaving');
      animations = [];
      moving = false;
      arrows.forEach(button => { button.disabled = false; });
      if (announce) {
        status.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length + ': ' +
          incoming.querySelector('.fn-hero__title').textContent;
      }
      schedule();
    }

    arrows.forEach(button => button.addEventListener('click', () => {
      const direction = button.dataset.hero === 'next' ? 1 : -1;
      show(index + direction, direction, true);
    }));
    hero.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') { hoverPaused = true; schedule(); }
    });
    hero.addEventListener('pointerleave', () => { hoverPaused = false; schedule(); });
    hero.addEventListener('focusin', () => { focusPaused = true; schedule(); });
    hero.addEventListener('focusout', event => {
      if (!hero.contains(event.relatedTarget)) { focusPaused = false; schedule(); }
    });
    hero.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      show(index + direction, direction, true);
    });

    let touchStart;
    hero.addEventListener('touchstart', event => {
      if (event.touches.length !== 1 || event.target.closest('button, a')) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    hero.addEventListener('touchend', event => {
      if (!touchStart) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        const direction = dx < 0 ? 1 : -1;
        show(index + direction, direction, true);
      }
    }, { passive: true });
    hero.addEventListener('touchcancel', () => { touchStart = null; });

    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('pagehide', () => clearTimeout(timer));
    window.addEventListener('pageshow', schedule);
    exposeSlide();

    if ('IntersectionObserver' in window) {
      document.body.classList.add('fn-motion');
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            reveal.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      document.querySelectorAll('.fn-process__col, .fn-live').forEach(section => {
        section.querySelectorAll('.fn-step').forEach((step, i) => {
          step.style.setProperty('--step-delay', (i * 110) + 'ms');
        });
        reveal.observe(section);
      });
      const heroObserver = new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.15 });
      heroObserver.observe(hero);
    }

    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        animations.forEach(animation => animation.finish());
        document.querySelectorAll('.fn-why__grid, .fn-process__col, .fn-live')
          .forEach(section => section.classList.add('is-revealed'));
      }
      schedule();
    });
    schedule();

    const benefits = document.querySelector('.fn-why__grid');
    let benefitsFrame;
    function updateBenefits() {
      benefitsFrame = null;
      const box = benefits.getBoundingClientRect();
      const enter = (box.top - innerHeight * .45) / (innerHeight * .5);
      const leave = (innerHeight * .65 - box.bottom) / (innerHeight * .5);
      const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, Math.max(enter, leave)));
      benefits.style.setProperty('--why-offset', (progress * 115) + '%');
    }
    function queueBenefits() {
      if (!benefitsFrame) benefitsFrame = requestAnimationFrame(updateBenefits);
    }
    if (benefits) {
      window.addEventListener('scroll', queueBenefits, { passive: true });
      window.addEventListener('resize', queueBenefits, { passive: true });
      reduced.addEventListener('change', queueBenefits);
      updateBenefits();
    }

    const stories = document.querySelector('.fn-story-grid');
    stories?.addEventListener('keydown', event => {
      if (!matchMedia('(max-width:600px)').matches) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') {
        stories.scrollTo({ left:event.key === 'Home' ? 0 : stories.scrollWidth, behavior:'instant' });
      } else {
        const distance = stories.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(stories).columnGap);
        stories.scrollBy({ left:(event.key === 'ArrowRight' ? 1 : -1) * distance, behavior:reduced.matches ? 'instant' : 'smooth' });
      }
    });

  }

  document.addEventListener('DOMContentLoaded', initHome);
})();

