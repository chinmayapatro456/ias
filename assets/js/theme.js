/* ==========================================================================
   Theme switch — Chinmaya Patro UPSC Study Desk
   Light is the default; dark is opt-in and remembered per browser.
   The saved choice is applied before first paint by a tiny inline script in
   each page's <head>, so there is no flash of the wrong theme.

   Storage: 'cp_theme' (plain string, 'dark' only when chosen).
   This key is additive — no existing progress key or schema is touched.
   ========================================================================== */

(function () {
  'use strict';

  var FALLBACK_KEY = 'cp_theme';
  var META = { light: '#FAF8F5', dark: '#16130F' };

  function key() {
    return (window.StudyStorage && window.StudyStorage.KEYS && window.StudyStorage.KEYS.theme) ||
      FALLBACK_KEY;
  }

  function readTheme() {
    try {
      return window.localStorage.getItem(key()) === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  function writeTheme(theme) {
    try {
      if (theme === 'dark') window.localStorage.setItem(key(), 'dark');
      else window.localStorage.removeItem(key());
    } catch (e) {
      /* Private mode / storage full: the theme still applies for this page */
    }
  }

  function syncButtons(theme) {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    Array.prototype.forEach.call(buttons, function (btn) {
      var isDark = theme === 'dark';
      var label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }

  function applyTheme(theme, persist) {
    var root = document.documentElement;

    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META[theme] || META.light);

    syncButtons(theme);
    if (persist) writeTheme(theme);

    try {
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
    } catch (e) {
      /* Older browsers: no CustomEvent constructor */
    }
  }

  function init() {
    /* The inline head script may already have set the attribute */
    var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : readTheme();
    applyTheme(current, false);

    var buttons = document.querySelectorAll('[data-theme-toggle]');
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    });

    /* Keep two open tabs in step */
    window.addEventListener('storage', function (event) {
      if (event.key !== key()) return;
      applyTheme(event.newValue === 'dark' ? 'dark' : 'light', false);
    });
  }

  window.StudyTheme = {
    current: function () {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    },
    set: function (theme) {
      applyTheme(theme === 'dark' ? 'dark' : 'light', true);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
