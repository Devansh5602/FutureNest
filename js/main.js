(function () {
  'use strict';

  window.initMainJS = function () {
    var revealEls = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );

    if (revealEls.length) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }

    var tabBtns = document.querySelectorAll('[data-tab-btn]');
    var tabPanels = document.querySelectorAll('[data-tab-panel]');

    function activateTab(tabId) {
      tabBtns.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-tab-btn') === tabId);
      });
      tabPanels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === tabId);
      });
    }

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateTab(this.getAttribute('data-tab-btn'));
      });
    });

    if (tabBtns.length) {
      activateTab(tabBtns[0].getAttribute('data-tab-btn'));
    }

    var counters = document.querySelectorAll('[data-counter]');

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-counter')) || 0;
      var suffix = el.getAttribute('data-counter-suffix') || '';
      var prefix = el.getAttribute('data-counter-prefix') || '';
      var decimals = el.getAttribute('data-counter-decimals') || 0;
      var duration = 1800;
      var start = performance.now();

      function update(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        var value = (target * ease).toFixed(decimals);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }

    if (counters.length) {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }

    var yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    var faqList = document.querySelector('.faq__list');
    if (faqList) {
      var faqItems = faqList.querySelectorAll('.faq__item');

      faqItems.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (item.open) {
            faqItems.forEach(function (other) {
              if (other !== item && other.open) {
                other.removeAttribute('open');
              }
            });
          }
        });
      });

      var faqRevealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && faqItems.length) {
              setTimeout(function () {
                faqItems[0].setAttribute('open', '');
              }, 420);
              faqRevealObserver.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      faqRevealObserver.observe(faqList);
    }
  };
  
  document.addEventListener('DOMContentLoaded', window.initMainJS);
})();
