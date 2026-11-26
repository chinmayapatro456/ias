/* ==========================================================================
   Motion & Lightweight 3D Interactions — Chinmaya Patro UPSC Study Desk
   - Scroll-reveal via IntersectionObserver (transform & opacity only)
   - Pointer-tilt parallax on desktop (>= 768px, fine pointer only)
   - Animated numeric counters (also callable dynamically via StudyMotion)
   - Inline SVG outline draw-in (India map & progress visuals)
   - Respects prefers-reduced-motion and degrades cleanly if JS fails
   ========================================================================== */

(function () {
  'use strict';

  var reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  function prefersReducedMotion() {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function isDesktopPointer() {
    if (window.innerWidth < 768) return false;
    if (!window.matchMedia) return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  /* 1. Scroll Reveal */
  function initReveal() {
    var nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      nodes.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    document.documentElement.classList.add('js-motion');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* 2. Pointer-Tilt Parallax Cards (Desktop Only) */
  function initTiltCards() {
    if (prefersReducedMotion() || !isDesktopPointer()) return;

    var cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 6;
      var rafId = null;

      function onMove(event) {
        if (!isDesktopPointer() || prefersReducedMotion()) return;
        var rect = card.getBoundingClientRect();
        var relX = (event.clientX - rect.left) / rect.width - 0.5;
        var relY = (event.clientY - rect.top) / rect.height - 0.5;
        var rotY = (relX * maxTilt * 2).toFixed(2);
        var rotX = (-relY * maxTilt * 2).toFixed(2);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          card.style.transform =
            'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(0)';
        });
      }

      function onLeave() {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = '';
      }

      card.addEventListener('pointermove', onMove, { passive: true });
      card.addEventListener('pointerleave', onLeave, { passive: true });
      card.addEventListener('pointercancel', onLeave, { passive: true });
    });
  }

  /* 3. Animated Numeric Counters */
  function formatNumber(n) {
    try {
      return Number(n).toLocaleString('en-IN');
    } catch (e) {
      return String(n);
    }
  }

  function animateCounter(el, targetValue) {
    if (!el) return;
    var target = Number(targetValue);
    if (!Number.isFinite(target) || target < 0) return;

    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion() || target === 0) {
      el.textContent = formatNumber(target) + suffix;
      return;
    }

    var duration = 700;
    var startTime = null;

    function tick(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = formatNumber(current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      counters.forEach(function (el) {
        var target = el.getAttribute('data-target');
        if (target !== null) animateCounter(el, Number(target));
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var target = entry.target.getAttribute('data-target');
            if (target !== null) {
              animateCounter(entry.target, Number(target));
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* 4. Inline SVG Outline Draw-In (e.g., India Map) */
  function initSvgDraw() {
    var svgs = document.querySelectorAll('[data-draw-svg]');
    if (!svgs.length) return;

    if (prefersReducedMotion()) {
      svgs.forEach(function (svg) {
        svg.classList.add('is-drawn');
      });
      return;
    }

    svgs.forEach(function (svg) {
      var paths = svg.querySelectorAll('path[data-draw-path]');
      paths.forEach(function (path) {
        try {
          var len = Math.ceil(path.getTotalLength());
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len);
        } catch (e) {
          /* Ignore non-rendered paths */
        }
      });
    });

    if (typeof IntersectionObserver === 'undefined') {
      svgs.forEach(function (svg) {
        svg.classList.add('is-drawn');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var svg = entry.target;
            svg.classList.add('is-drawn');
            var paths = svg.querySelectorAll('path[data-draw-path]');
            paths.forEach(function (path) {
              path.style.strokeDashoffset = '0';
            });
            observer.unobserve(svg);
          }
        });
      },
      { threshold: 0.15 }
    );

    svgs.forEach(function (svg) {
      observer.observe(svg);
    });
  }

  function initAll() {
    try {
      initReveal();
      initTiltCards();
      initCounters();
      initSvgDraw();
    } catch (err) {
      document.documentElement.classList.remove('js-motion');
    }
  }

  window.StudyMotion = {
    animateCounter: animateCounter,
    prefersReducedMotion: prefersReducedMotion
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
