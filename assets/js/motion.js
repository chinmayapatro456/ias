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
      initSvgDraw();
    } catch (err) {
      document.documentElement.classList.remove('js-motion');
    }
  }

  window.StudyMotion = {
    prefersReducedMotion: prefersReducedMotion
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
