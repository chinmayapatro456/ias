/* ==========================================================================
   Home Page — live desk counts, the Today strip, and the 3D subject cube
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

  /* --- Desk inventory: cards carry a state so the UI never sits on a
     "Loading…" line or a bare dash. loading -> ready | missing. --------- */
  function cardOf(kind) {
    return document.querySelector('[data-stat="' + kind + '"]');
  }

  function setCardState(kind, state) {
    var card = cardOf(kind);
    if (card) card.setAttribute('data-state', state);
  }

  function setMeter(kind, done, total, label) {
    var card = cardOf(kind);
    if (!card) return;
    var fill = card.querySelector('[data-stat-meter]');
    var text = card.querySelector('[data-stat-meter-label]');
    var pct = total > 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = label;
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
        syllabusMeta.textContent =
          covered + ' covered locally across Prelims, Mains & Optional';
      }
      setMeter('syllabus', covered, syllabusTotal,
        covered + ' of ' + syllabusTotal.toLocaleString('en-IN') + ' covered');
      setCardState('syllabus', 'ready');
    } else {
      if (syllabusMeta) syllabusMeta.textContent = 'Data file missing — add data/syllabus-data.js';
      setCardState('syllabus', 'missing');
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
      setMeter('mains', written, mainsTotal,
        written + ' of ' + mainsTotal.toLocaleString('en-IN') + ' written');
      setCardState('mains', 'ready');
    } else {
      if (mainsMeta) mainsMeta.textContent = 'Data file missing — add data/mains-data.js';
      setCardState('mains', 'missing');
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
      setMeter('optional', attempted, optTotal,
        attempted + ' of ' + optTotal.toLocaleString('en-IN') + ' attempted');
      setCardState('optional', 'ready');
    } else {
      if (optMeta) optMeta.textContent = 'Data file missing — add data/optional-data.js';
      setCardState('optional', 'missing');
    }

    /* 4. Prelims Practice — the personal metric here is the streak, so the
       meter reads against a seven-day week rather than the question pool. */
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
      setMeter('prelims', Math.min(streak, 7), 7, streak + '-day streak');
      setCardState('prelims', 'ready');
    } else {
      if (prelimsMeta) prelimsMeta.textContent = 'Data file missing — add data/prelims-data.js';
      setCardState('prelims', 'missing');
    }
  }

  /* --- Today strip: streak, topics touched this week, and a resume link.
     Everything is read from the existing keys; when a value is absent the
     cell says so in words instead of showing a dash. -------------------- */
  var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  function startOfWeek(now) {
    /* Monday-based week, so "this week" matches how a study week is planned */
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }

  function initToday() {
    var strip = document.querySelector('[data-today]');
    if (!strip) return;

    var dateEl = strip.querySelector('[data-today-date]');
    var streakEl = strip.querySelector('[data-today-streak]');
    var topicsEl = strip.querySelector('[data-today-topics]');
    var contEl = strip.querySelector('[data-today-continue]');

    var now = new Date();
    if (dateEl) {
      try {
        dateEl.textContent = now.toLocaleDateString('en-IN', {
          weekday: 'short', day: 'numeric', month: 'short'
        });
      } catch (e) {
        dateEl.textContent = '';
      }
    }

    var storage = window.StudyStorage;
    if (!storage) {
      if (streakEl) streakEl.textContent = 'Unavailable';
      if (topicsEl) topicsEl.textContent = 'Unavailable';
      return;
    }

    var state = storage.getPrelimsState();
    var attempts = Array.isArray(state.attempts) ? state.attempts : [];
    var streak = state.streak ? Number(state.streak.count) || 0 : 0;

    /* Streak */
    if (streakEl) {
      if (streak > 0) {
        streakEl.innerHTML = streak + '<span class="today-unit"> ' + (streak === 1 ? 'day' : 'days') + '</span>';
      } else {
        streakEl.textContent = 'No streak yet';
      }
    }

    /* Topics this week — unique topics across drills since Monday. Attempts
       saved before this build carry no topic list, so they simply do not
       count and the cell stays honest. */
    var weekStart = startOfWeek(now).getTime();
    var seen = {};
    attempts.forEach(function (a) {
      if (!a || !a.date) return;
      var t = Date.parse(a.date);
      if (isNaN(t) || t < weekStart || t > now.getTime() + WEEK_MS) return;
      (Array.isArray(a.topics) ? a.topics : []).forEach(function (topic) {
        if (topic) seen[topic] = true;
      });
    });
    var topicCount = Object.keys(seen).length;
    if (topicsEl) {
      if (topicCount > 0) {
        topicsEl.innerHTML = topicCount + '<span class="today-unit"> ' + (topicCount === 1 ? 'topic' : 'topics') + '</span>';
      } else {
        topicsEl.textContent = 'No drills yet';
      }
    }

    /* Continue where you left off */
    if (contEl) {
      var last = attempts[0];
      if (last && last.label) {
        contEl.textContent = last.label;
        contEl.setAttribute(
          'aria-label',
          'Continue where you left off: ' + last.label
        );
      } else {
        contEl.textContent = 'Start your first drill';
      }
      contEl.setAttribute('href', './prelims-practice/index.html');
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
    initToday();
    initCube();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHome);
  } else {
    initHome();
  }
})();
