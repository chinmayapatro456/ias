/* ==========================================================================
   Home Page — live desk counts + interactive 3D subject cube
   Counts come from assets/js/data-counts.js (one shared source of truth, also
   used by the Optional PYQs header banner). The cube is pure CSS 3D: idle
   rotation, hover pause, drag to spin, keyboard-focus snap, off-screen pause.
   Degrades gracefully when any data file is not yet populated.
   ========================================================================== */

(function () {
  'use strict';

  function setCounter(el, value) {
    if (!el) return;
    if (value === null || value === undefined) {
      el.textContent = '—';
      return;
    }
    el.setAttribute('data-target', String(value));
    if (window.StudyMotion && typeof window.StudyMotion.animateCounter === 'function') {
      window.StudyMotion.animateCounter(el, value);
    } else {
      try {
        el.textContent = Number(value).toLocaleString('en-IN');
      } catch (e) {
        el.textContent = String(value);
      }
    }
  }

  /* All four totals come from StudyCounts so Home and the section pages
     always show the same number for the same data. */
  function countSyllabusTopics() {
    return window.StudyCounts ? window.StudyCounts.syllabusTopics() : null;
  }

  function countMainsQuestions() {
    return window.StudyCounts ? window.StudyCounts.mainsQuestions() : null;
  }

  function countMainsGroups() {
    if (window.PYQ_BY_TOPIC && typeof window.PYQ_BY_TOPIC === 'object') {
      var keys = Object.keys(window.PYQ_BY_TOPIC);
      if (keys.length) return keys.length;
    }
    var meta = window.PYQ_METADATA;
    if (meta) {
      if (meta.perTopic && typeof meta.perTopic === 'object') {
        var grouped = Object.keys(meta.perTopic).length;
        if (grouped) return grouped;
      }
      if (Array.isArray(meta.topics) && meta.topics.length) return meta.topics.length;
    }
    return null;
  }

  function countOptionalQuestions() {
    return window.StudyCounts ? window.StudyCounts.optionalQuestions() : null;
  }

  function countPrelimsQuestions() {
    return window.StudyCounts ? window.StudyCounts.prelimsQuestions() : null;
  }

  function initHomeCounts() {
    var storage = window.StudyStorage;

    /* 1. Syllabus */
    var syllabusEl = document.getElementById('count-syllabus');
    var syllabusMeta = document.getElementById('meta-syllabus');
    var syllabusTotal = countSyllabusTopics();
    if (syllabusTotal !== null) {
      setCounter(syllabusEl, syllabusTotal);
      var covered = storage ? storage.getSet(storage.KEYS.syllabusCovered).length : 0;
      if (syllabusMeta) {
        syllabusMeta.textContent = covered + ' covered locally across Prelims, Mains & Optional';
      }
    } else if (syllabusMeta) {
      syllabusMeta.textContent = 'Add data/syllabus-data.js to populate';
    }

    /* 2. Mains PYQs */
    var mainsEl = document.getElementById('count-mains');
    var mainsMeta = document.getElementById('meta-mains');
    var mainsTotal = countMainsQuestions();
    if (mainsTotal !== null) {
      setCounter(mainsEl, mainsTotal);
      var written = storage ? storage.getSet(storage.KEYS.mainsWritten).length : 0;
      var groupCount = countMainsGroups();
      if (mainsMeta) {
        mainsMeta.textContent =
          written +
          ' answers written' +
          (groupCount ? ' · ' + groupCount + ' subject groups' : '');
      }
    } else if (mainsMeta) {
      mainsMeta.textContent = 'Add data/mains-data.js to populate';
    }

    /* 3. Geography Optional PYQs */
    var optEl = document.getElementById('count-optional');
    var optMeta = document.getElementById('meta-optional');
    var optTotal = countOptionalQuestions();
    if (optTotal !== null) {
      setCounter(optEl, optTotal);
      var attempted = storage ? storage.getSet(storage.KEYS.optionalAttempted).length : 0;
      if (optMeta) {
        optMeta.textContent = attempted + ' attempted · Paper I & II (1986–2026)';
      }
    } else if (optMeta) {
      optMeta.textContent = 'Add data/optional-data.js to populate';
    }

    /* 4. Prelims Practice */
    var prelimsEl = document.getElementById('count-prelims');
    var prelimsMeta = document.getElementById('meta-prelims');
    var prelimsTotal = countPrelimsQuestions();
    if (prelimsTotal !== null) {
      setCounter(prelimsEl, prelimsTotal);
      var pState = storage ? storage.getPrelimsState() : null;
      var attempts = pState ? pState.attempts.length : 0;
      var streak = pState && pState.streak ? pState.streak.count : 0;
      if (prelimsMeta) {
        prelimsMeta.textContent =
          attempts + ' quiz attempt' + (attempts === 1 ? '' : 's') + ' · ' + streak + '-day streak';
      }
    } else if (prelimsMeta) {
      prelimsMeta.textContent = 'Add data/prelims-data.js to populate';
    }
  }

  /* ---------------------------------------------------------------------
     Interactive 3D subject cube
     - gentle idle rotation, paused on hover, while dragging, while a face
       has keyboard focus, and whenever the cube is off-screen
     - click-and-drag rotation with inertia
     - faces are buttons: keyboard focus snaps the face to the front, and
       Enter/Space follows its data-href
     - all of it is skipped for prefers-reduced-motion
     --------------------------------------------------------------------- */
  function initCube() {
    var pedestal = document.querySelector('[data-cube]');
    var stage = document.querySelector('[data-cube-stage]');
    var body = document.querySelector('[data-cube-body]');
    if (!pedestal || !stage || !body) return;

    var faces = Array.prototype.slice.call(body.querySelectorAll('[data-cube-face]'));
    var reduce = Boolean(
      window.StudyMotion && typeof window.StudyMotion.prefersReducedMotion === 'function'
        ? window.StudyMotion.prefersReducedMotion()
        : window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    var BASE_X = -18;
    var rotX = BASE_X;
    var rotY = -28;
    var spin = reduce ? 0 : 0.16;     /* ~9.6°/s — a gentle idle drift */
    var velocity = 0;
    var dragging = false;
    var hovering = false;
    var focused = false;
    var onScreen = true;
    var snap = null;                   /* {x, y} target while a face is focused */
    var suppressClick = false;
    var rafId = null;
    var lastX = 0;
    var lastY = 0;
    var moved = 0;

    /* Which cube rotation brings each face to the front */
    var FACE_POSE = {
      front: { x: BASE_X, y: 0 },
      back: { x: BASE_X, y: 180 },
      right: { x: BASE_X, y: -90 },
      left: { x: BASE_X, y: 90 },
      top: { x: -90, y: 0 },
      bottom: { x: 90, y: 0 }
    };

    function render() {
      body.style.transform =
        'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
    }

    function nearestAngle(current, target) {
      var diff = ((target - current + 540) % 360) - 180;
      return current + diff;
    }

    function step() {
      if (dragging) {
        rafId = requestAnimationFrame(step);
        return;
      }

      if (snap) {
        var targetY = nearestAngle(rotY, snap.y);
        rotY += (targetY - rotY) * 0.18;
        rotX += (snap.x - rotX) * 0.18;
        if (Math.abs(targetY - rotY) < 0.4 && Math.abs(snap.x - rotX) < 0.4) {
          rotY = targetY;
          rotX = snap.x;
          snap = null;
        }
      } else if (Math.abs(velocity) > 0.02) {
        rotY += velocity;
        velocity *= 0.94;
      } else if (spin && !hovering && !focused && onScreen) {
        rotY += spin;
      } else if (!focused && Math.abs(rotX - BASE_X) > 0.2) {
        rotX += (BASE_X - rotX) * 0.12;
      }

      render();
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (rafId !== null || reduce) return;
      rafId = requestAnimationFrame(step);
    }

    function stop() {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    render();

    if (!reduce) {
      start();

      if (typeof IntersectionObserver !== 'undefined') {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            onScreen = entry.isIntersecting;
            if (onScreen) start();
            else stop();
          });
        }, { threshold: 0.05 }).observe(pedestal);
      }
    }

    /* Hover pause (fine pointers only — touch has no hover) */
    var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer) {
      pedestal.addEventListener('pointerenter', function () { hovering = true; });
      pedestal.addEventListener('pointerleave', function () { hovering = false; });
    }

    /* Drag to spin */
    stage.addEventListener('pointerdown', function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      dragging = true;
      moved = 0;
      velocity = 0;
      suppressClick = false;
      lastX = event.clientX;
      lastY = event.clientY;
      stage.classList.add('is-dragging');
      if (stage.setPointerCapture) {
        try { stage.setPointerCapture(event.pointerId); } catch (e) {}
      }
      start();
    });

    stage.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var dx = event.clientX - lastX;
      var dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      rotY += dx * 0.55;
      rotX = Math.max(-72, Math.min(72, rotX - dy * 0.35));
      velocity = dx * 0.22;
      render();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      /* A drag longer than 6px is a spin, not a tap: swallow the click */
      suppressClick = moved > 6;
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', endDrag);

    stage.addEventListener('click', function (event) {
      if (suppressClick) {
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    /* Face buttons: tap/click to navigate */
    faces.forEach(function (face) {
      face.addEventListener('click', function (event) {
        if (suppressClick) {
          suppressClick = false;
          event.preventDefault();
          return;
        }
        var href = face.getAttribute('data-href');
        if (href) window.location.href = href;
      });

      /* Keyboard: bring the focused face to the front so sighted keyboard
         users can see what they are about to open. */
      face.addEventListener('focus', function () {
        focused = true;
        var pose = FACE_POSE[face.getAttribute('data-cube-face')];
        if (!pose) return;
        if (reduce) {
          rotX = pose.x;
          rotY = nearestAngle(rotY, pose.y);
          render();
        } else {
          snap = pose;
          start();
        }
      });

      face.addEventListener('blur', function () {
        focused = false;
        if (!reduce) snap = { x: BASE_X, y: rotY };
      });
    });
  }

  function initHome() {
    initHomeCounts();
    initCube();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHome);
  } else {
    initHome();
  }
})();
