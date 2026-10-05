(function () {
  'use strict';

  const STORAGE_KEY = 'fn-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === DARK || stored === LIGHT) return stored;
    } catch (error) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {}
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    const isDark = theme === DARK;
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    document.documentElement.classList.add('disable-transitions');
    applyTheme(current === DARK ? LIGHT : DARK);
    window.getComputedStyle(document.documentElement).opacity;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.remove('disable-transitions');
      });
    });
  }

  document.documentElement.classList.add('disable-transitions');
  const initialTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  document.addEventListener('DOMContentLoaded', function () {
    updateToggleButtons(initialTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', toggleTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) toggleTheme();
      } catch (error) {}
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.remove('disable-transitions');
      });
    });
  });
})();
