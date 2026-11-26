/* ==========================================================================
   Navigation & Shared UI Helpers — Chinmaya Patro UPSC Study Desk
   Handles mobile drawer toggle, keyboard/backdrop dismissal, and toast alerts.
   ========================================================================== */

(function () {
  'use strict';

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var drawer = document.querySelector('[data-nav-drawer]');
    var backdrop = document.querySelector('[data-nav-backdrop]');

    if (!toggle || !drawer) return;

    var iconMenu = toggle.querySelector('[data-icon-menu]');
    var iconClose = toggle.querySelector('[data-icon-close]');
    var isOpen = false;

    function setOpen(nextState) {
      isOpen = Boolean(nextState);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      drawer.classList.toggle('is-open', isOpen);
      drawer.setAttribute('aria-hidden', String(!isOpen));

      if (backdrop) {
        backdrop.classList.toggle('is-open', isOpen);
      }
      if (iconMenu) {
        iconMenu.style.display = isOpen ? 'none' : 'block';
      }
      if (iconClose) {
        iconClose.style.display = isOpen ? 'block' : 'none';
      }

      if (isOpen) {
        var firstLink = drawer.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen);
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setOpen(false);
        toggle.focus();
      });
    }

    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen) {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktopQuery = window.matchMedia('(min-width: 768px)');
    function handleResize(e) {
      if (e.matches && isOpen) {
        setOpen(false);
      }
    }
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', handleResize);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(handleResize);
    }
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
