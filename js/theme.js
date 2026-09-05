(function () {
  'use strict';

  const STORAGE_KEY = 'fn-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === DARK || stored === LIGHT) return stored;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    const isDark = theme === DARK;
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    const nextTheme = current === DARK ? LIGHT : DARK;

    // Temporarily disable CSS transitions to prevent visual color jitter/flashing
    document.documentElement.classList.add('disable-transitions');
    
    applyTheme(nextTheme);

    // Force browser reflow so new theme styles apply synchronously
    window.getComputedStyle(document.documentElement).opacity;

    // Re-enable transitions on the next frame after DOM paint
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.remove('disable-transitions');
      });
    });
  }

  // 1. Run synchronously before DOM paint to prevent FOUC
  document.documentElement.classList.add('disable-transitions');
  const initialTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // 2. Setup event listeners once DOM is parsed
  document.addEventListener('DOMContentLoaded', function () {
    updateToggleButtons(initialTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        toggleTheme();
      }
    });

    // Remove disable-transitions after initial page render
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.remove('disable-transitions');
      });
    });
  });
})();
