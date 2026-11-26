/* ==========================================================================
   Navigation & Shared UI Helpers — Chinmaya Patro UPSC Study Desk
   Mobile slide-over drawer (focus trap, Escape, aria-expanded, aria-current),
   collapsible mobile filter drawers, dismissible callouts, and toast alerts.
   Tabs are styled purely in CSS now (2px underline), so nothing here measures
   or positions them. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Mobile slide-over drawer
     --------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var drawer = document.querySelector('[data-nav-drawer]');
    var backdrop = document.querySelector('[data-nav-backdrop]');

    if (!toggle || !drawer) return;

    var closeBtn = drawer.querySelector('[data-nav-close]');
    var iconMenu = toggle.querySelector('[data-icon-menu]');
    var iconClose = toggle.querySelector('[data-icon-close]');
    var isOpen = false;
    var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function focusableItems() {
      return Array.prototype.filter.call(
        drawer.querySelectorAll(FOCUSABLE),
        function (el) {
          return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
        }
      );
    }

    function setOpen(nextState) {
      isOpen = Boolean(nextState);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      drawer.classList.toggle('is-open', isOpen);
      drawer.setAttribute('aria-hidden', String(!isOpen));

      if (backdrop) backdrop.classList.toggle('is-open', isOpen);
      if (iconMenu) iconMenu.style.display = isOpen ? 'none' : 'block';
      if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';

      /* Stop the page behind the drawer from scrolling on touch devices */
      document.body.style.overflow = isOpen ? 'hidden' : '';

      if (isOpen) {
        /* Focus after the panel has been painted, otherwise the browser
           refuses to focus an element that is still visibility:hidden. */
        requestAnimationFrame(function () {
          var items = focusableItems();
          var target = closeBtn || items[0];
          if (target) target.focus();
        });
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        setOpen(false);
        toggle.focus();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setOpen(false);
        toggle.focus();
      });
    }

    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        toggle.focus();
        return;
      }

      /* Focus trap: keep Tab / Shift+Tab inside the drawer */
      if (event.key === 'Tab') {
        var items = focusableItems();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!drawer.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    var desktopQuery = window.matchMedia('(min-width: 768px)');
    function handleResize(e) {
      if (e.matches && isOpen) setOpen(false);
    }
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', handleResize);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(handleResize);
    }
  }

  /* ---------------------------------------------------------------------
     3. Collapsible filter drawers (Mains PYQs, Optional PYQs on Android)
     Desktop keeps the panel open; below 768px the panel starts collapsed so
     questions sit above the fold. Filter state is untouched either way.
     --------------------------------------------------------------------- */
  function initFilterDrawers() {
    var toggles = document.querySelectorAll('[data-filters-toggle]');
    Array.prototype.forEach.call(toggles, function (btn) {
      var panelId = btn.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      var narrow = window.matchMedia('(max-width: 767px)');

      function applyMode() {
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (narrow.matches) {
          panel.classList.toggle('is-open', open);
        } else {
          panel.classList.add('is-open');
        }
      }

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        applyMode();
      });

      if (narrow.addEventListener) {
        narrow.addEventListener('change', applyMode);
      } else if (narrow.addListener) {
        narrow.addListener(applyMode);
      }

      applyMode();
    });
  }

  /* ---------------------------------------------------------------------
     4. Dismissible callouts (mobile-friendly "Answer Key Note" etc.)
     --------------------------------------------------------------------- */
  function initDismissibles() {
    var buttons = document.querySelectorAll('[data-dismiss]');
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-dismiss');
        var target = id ? document.getElementById(id) : btn.closest('.notice');
        if (!target) return;
        target.classList.add('is-dismissed');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Lightweight Toast Notification (window.StudyUI.toast) */
  var toastTimer = null;

  function showToast(message) {
    if (!message) return;
    var el = document.getElementById('study-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'study-toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 2600);
  }

  window.StudyUI = {
    toast: showToast
  };

  function initAll() {
    try {
      initNav();
      initFilterDrawers();
      initDismissibles();
    } catch (err) {
      /* Never let a UI enhancement break the page */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
