/* ==========================================================================
   Navigation & Shared UI Helpers — Chinmaya Patro UPSC Study Desk
   Mobile slide-over drawer (focus trap, Escape, aria-expanded, aria-current),
   sliding tab indicators, collapsible mobile filter drawers, dismissible
   callouts, and toast alerts. No dependencies.
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
     2. Sliding active-tab indicator
     Positions a single pill behind the selected [role="tab"] of every .tabs
     group and follows programmatic aria-selected changes (MutationObserver),
     resize, and font load. Falls back to plain backgrounds without JS.
     --------------------------------------------------------------------- */
  function initTabIndicators() {
    var groups = document.querySelectorAll('.tabs');
    if (!groups.length) return;

    /* NOTE: classList.add() rewrites the class attribute even when the token is
       already present, which would make the MutationObserver below fire forever.
       Every class change here is therefore guarded by a contains() check. */
    function sync(group) {
      var indicator = group.querySelector('.tab-indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'tab-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        group.appendChild(indicator);
      }

      var active = group.querySelector('[role="tab"][aria-selected="true"], [role="tab"].is-active');
      var groupRect = group.getBoundingClientRect();
      var rect = active ? active.getBoundingClientRect() : null;

      if (!rect || !rect.width) {
        if (group.classList.contains('has-indicator')) group.classList.remove('has-indicator');
        return;
      }

      indicator.style.width = rect.width + 'px';
      indicator.style.height = rect.height + 'px';
      indicator.style.transform =
        'translate(' + (rect.left - groupRect.left) + 'px, ' + (rect.top - groupRect.top) + 'px)';

      if (!group.classList.contains('has-indicator')) group.classList.add('has-indicator');
    }

    function syncAll() {
      Array.prototype.forEach.call(groups, sync);
    }

    syncAll();

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(syncAll);
      Array.prototype.forEach.call(groups, function (g) { ro.observe(g); });
    }

    window.addEventListener('resize', syncAll, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncAll).catch(function () {});
    }

    /* Follow programmatic tab changes (aria-selected / .is-active toggles) */
    if (typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(syncAll);
      Array.prototype.forEach.call(groups, function (g) {
        mo.observe(g, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'class'] });
      });
    }

    window.StudyUI = window.StudyUI || {};
    window.StudyUI.syncTabs = syncAll;
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

  /* variant: optional modifier, e.g. 'tick' -> .toast--tick */
  function showToast(message, variant) {
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
    el.className = 'toast' + (variant ? ' toast--' + variant : '');
    el.textContent = message;
    el.classList.add('is-visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 2600);
  }

  window.StudyUI = {
    toast: showToast,
    syncTabs: function () {}
  };

  function initAll() {
    try {
      initNav();
      initTabIndicators();
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
