/* ==========================================================================
   Home Page Live Counts — Chinmaya Patro UPSC Study Desk
   Reads live totals from /data/*.js globals and localStorage progress.
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

  function countSyllabusTopics(data) {
    if (!data || !Array.isArray(data.stages)) return null;
    var total = 0;
    data.stages.forEach(function (stage) {
      if (!Array.isArray(stage.papers)) return;
      stage.papers.forEach(function (paper) {
        if (!Array.isArray(paper.units)) return;
        paper.units.forEach(function (unit) {
          if (Array.isArray(unit.topics) && unit.topics.length) {
            total += unit.topics.length;
          } else {
            total += 1;
          }
        });
      });
    });
    return total;
  }

  function countMainsQuestions() {
    if (Array.isArray(window.UPSC_MAINS_PYQS)) {
      return window.UPSC_MAINS_PYQS.length;
    }
    if (window.PYQ_METADATA && Number.isFinite(Number(window.PYQ_METADATA.totalQuestions))) {
      return Number(window.PYQ_METADATA.totalQuestions);
    }
    return null;
  }

  function countOptionalQuestions() {
    var d = window.PYQ_DATA;
    if (!d) return null;
    if (Array.isArray(d.questions)) return d.questions.length;
    if (Array.isArray(d)) return d.length;
    return null;
  }

  function countPrelimsQuestions() {
    var raw = Array.isArray(window.PRELIMS_DATA)
      ? window.PRELIMS_DATA
      : window.PRELIMS_DATA && Array.isArray(window.PRELIMS_DATA.questions)
        ? window.PRELIMS_DATA.questions
        : null;
    if (!raw) return null;

    var active = 0;
    raw.forEach(function (q) {
      var flags = Array.isArray(q.flags) ? q.flags : [];
      if (flags.indexOf('incomplete') === -1) {
        active += 1;
      }
    });
    return active;
  }

  function initHomeCounts() {
    var storage = window.StudyStorage;

    /* 1. Syllabus */
    var syllabusEl = document.getElementById('count-syllabus');
    var syllabusMeta = document.getElementById('meta-syllabus');
    var syllabusTotal = countSyllabusTopics(window.SYLLABUS_DATA);
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
      var groupCount =
        window.PYQ_BY_TOPIC && typeof window.PYQ_BY_TOPIC === 'object'
          ? Object.keys(window.PYQ_BY_TOPIC).length
          : 19;
      if (mainsMeta) {
        mainsMeta.textContent = written + ' answers written · ' + groupCount + ' subject groups';
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeCounts);
  } else {
    initHomeCounts();
  }
})();