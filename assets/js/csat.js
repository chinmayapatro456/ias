/* ==========================================================================
   CSAT Practice — Chinmaya Patro UPSC Study Desk
   Paper II (CSAT) practice over data/csat-data.js: full-length year-wise
   papers and topic-wise sectional tests.

   Marking is the paper's own: 2.5 marks per question, one-third negative
   (−0.83) for a wrong answer, 0 for a skip, and 33% to qualify. Questions
   without a usable key (mostly Decision-Making items, which UPSC grades by
   preference) are shown but never scored.

   Storage (additive; no existing key is touched): 'cp_csat_state'.
   ========================================================================== */

(function () {
  'use strict';

  var DATA = window.CSAT_DATA || { topics: [], years: [], questions: [] };
  var MARK = 2.5;
  var NEG = 0.83;
  var QUALIFY_PCT = 33;
  var FULL_DURATION_SEC = 120 * 60; /* the CSAT paper is two hours */

  var state = {
    mode: 'full',
    year: null,
    topic: null,
    count: 20,
    negative: true,
    instant: false
  };

  var session = null;
  var lastReport = null;
  var reviewFilter = 'wrong';
  var timerId = null;

  /* ---------------------------------------------------------------- utils */
  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function formatDuration(totalSec) {
    var s = Math.max(0, Math.floor(totalSec || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    var pad = function (n) {
      return n < 10 ? '0' + n : String(n);
    };
    return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : pad(m) + ':' + pad(sec);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add('is-visible');
    });
    setTimeout(function () {
      el.classList.remove('is-visible');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 2400);
  }

  /* -------------------------------------------------------------- storage */
  function emptyState() {
    return { attempts: [], bookmarks: [], wrongIds: [], topicStats: {} };
  }

  function readState() {
    var base = emptyState();
    try {
      if (window.StudyStorage && window.StudyStorage.getCsatState) {
        return window.StudyStorage.getCsatState();
      }
      var raw = window.localStorage.getItem('cp_csat_state');
      if (!raw) return base;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? Object.assign(base, parsed) : base;
    } catch (e) {
      return base;
    }
  }

  function saveState(next) {
    try {
      if (window.StudyStorage && window.StudyStorage.saveCsatState) {
        window.StudyStorage.saveCsatState(next);
      } else {
        window.localStorage.setItem('cp_csat_state', JSON.stringify(next));
      }
    } catch (e) {
      /* private mode: the session still works, it just is not remembered */
    }
  }

  /* ------------------------------------------------------------- selection */
  function byYear(year) {
    return DATA.questions.filter(function (q) {
      return q.year === year;
    });
  }

  function byTopic(topic) {
    return DATA.questions.filter(function (q) {
      return q.topic === topic;
    });
  }

  function currentPool() {
    if (state.mode === 'full') return byYear(state.year);
    var pool = byTopic(state.topic);
    if (state.count === 'all') return pool;
    return shuffle(pool).slice(0, Number(state.count) || pool.length);
  }

  /* ----------------------------------------------------------------- lobby */
  function populateSelects() {
    var yearSel = $('csat-year');
    if (yearSel) {
      var counts = {};
      DATA.questions.forEach(function (q) {
        counts[q.year] = (counts[q.year] || 0) + 1;
      });
      /* Default to the newest paper that is complete enough to sit as a paper;
         2026 is a 64-question partial set, so it is listed but not preselected. */
      var newestFull = null;
      DATA.years.forEach(function (y) {
        if ((counts[y] || 0) >= 75) newestFull = y;
      });
      yearSel.innerHTML = DATA.years
        .slice()
        .sort(function (a, b) {
          return b - a;
        })
        .map(function (y) {
          var n = counts[y] || 0;
          /* Every year is a few questions short of 80 in the source, so the
             count is always shown; "partial" is reserved for 2026, which is
             still missing a quarter of its paper. */
          var note = n < 80 ? ' · ' + n + ' Qs' + (y === 2026 ? ' (partial)' : '') : '';
          return (
            '<option value="' + y + '"' + (y === newestFull ? ' selected' : '') + '>' +
            y + ' paper' + note +
            '</option>'
          );
        })
        .join('');
      state.year = Number(yearSel.value) || newestFull || DATA.years[DATA.years.length - 1];
    }

    var topicSel = $('csat-topic');
    if (topicSel) {
      var tcount = {};
      DATA.questions.forEach(function (q) {
        tcount[q.topic] = (tcount[q.topic] || 0) + 1;
      });
      topicSel.innerHTML = DATA.topics
        .map(function (t) {
          return '<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + ' · ' + (tcount[t] || 0) + '</option>';
        })
        .join('');
      state.topic = topicSel.value || DATA.topics[0];
    }
  }

  function syncModeFields() {
    var isFull = state.mode === 'full';
    var yearField = document.querySelector('[data-field="year"]');
    var topicField = document.querySelector('[data-field="topic"]');
    var countField = document.querySelector('[data-field="count"]');
    if (yearField) yearField.hidden = !isFull;
    if (topicField) topicField.hidden = isFull;
    if (countField) countField.hidden = isFull;

    var desc = $('csat-mode-desc');
    if (desc) {
      desc.textContent = isFull
        ? 'One year’s paper at a time, in the compilation’s order, on a two-hour clock — the way the paper is actually sat.'
        : 'One topic at a time, drawn at random from every year, with no clock. Use these to fix a weak section.';
    }

    var count = currentPool().length;
    var match = $('csat-match-count');
    if (match) {
      match.textContent =
        count + (count === 1 ? ' question' : ' questions') +
        (isFull ? ' · 2 hours' : ' · no time limit');
    }
    var startBtn = $('csat-start');
    if (startBtn) startBtn.disabled = count === 0;
  }

  function renderLobbyWidgets() {
    var st = readState();

    var accEl = $('csat-topic-accuracy');
    if (accEl) {
      var entries = Object.keys(st.topicStats || {}).map(function (t) {
        var s = st.topicStats[t];
        var pct = s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0;
        return { topic: t, correct: s.correct || 0, attempted: s.attempted || 0, pct: pct };
      });
      entries.sort(function (a, b) {
        return b.attempted - a.attempted;
      });
      accEl.innerHTML = entries.length
        ? entries
            .slice(0, 8)
            .map(function (e) {
              return (
                '<div class="accuracy-row">' +
                '<span>' + escapeHtml(e.topic) + '</span>' +
                '<span class="tag">' + e.correct + '/' + e.attempted + ' (' + e.pct + '%)</span>' +
                '</div>'
              );
            })
            .join('')
        : '<p class="muted">Finish a sectional test to see per-topic accuracy here.</p>';
    }

    var attEl = $('csat-attempts');
    if (attEl) {
      var list = (st.attempts || []).slice(0, 6);
      attEl.innerHTML = list.length
        ? list
            .map(function (a) {
              var dateStr = a.date
                ? new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '';
              return (
                '<div class="attempt-row">' +
                '<span><strong>' + escapeHtml(a.label) + '</strong> · ' + escapeHtml(dateStr) + '</span>' +
                '<span class="tag tag--accent">' + a.score + ' / ' + a.maxScore + '</span>' +
                '</div>'
              );
            })
            .join('')
        : '<p class="muted">No saved attempts yet.</p>';
    }

    var attemptBadge = $('csat-attempt-badge');
    if (attemptBadge) {
      var n = (st.attempts || []).length;
      attemptBadge.textContent = n + (n === 1 ? ' attempt' : ' attempts');
    }

    var retryBtn = $('csat-retry-wrong');
    if (retryBtn) retryBtn.disabled = !(st.wrongIds || []).length;
    var retryBtn2 = $('csat-retry-wrong-2');
    if (retryBtn2) retryBtn2.disabled = !(st.wrongIds || []).length;
  }

  function updateHeaderBadges() {
    var total = $('csat-total-badge');
    if (total) total.textContent = DATA.questions.length.toLocaleString('en-IN') + ' questions';
    var topics = $('csat-topic-badge');
    if (topics) topics.textContent = DATA.topics.length + ' topics';
  }

  /* ------------------------------------------------------------ quiz view */
  function showView(which) {
    ['view-lobby', 'view-quiz', 'view-results'].forEach(function (id) {
      var el = $(id);
      if (el) el.hidden = id !== which;
    });
    /* Scroll to the top of the thing being shown, not the top of the page —
       the page header would otherwise push the first question off screen. */
    var target =
      which === 'view-quiz'
        ? document.querySelector('.quiz-topbar')
        : which === 'view-results'
        ? document.querySelector('.results-header')
        : $('csat-mode-tabs');
    if (target) target.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  function startQuiz(questions, label, isCountdown) {
    if (!questions || !questions.length) {
      toast('No questions match that choice.');
      return;
    }
    session = {
      label: label,
      questions: questions,
      answers: {},
      flagged: {},
      index: 0,
      negative: state.negative,
      instant: state.instant,
      isCountdown: Boolean(isCountdown),
      remainingSec: isCountdown ? FULL_DURATION_SEC : 0,
      elapsedSec: 0
    };

    var modeEl = $('csat-mode-label');
    if (modeEl) modeEl.textContent = label;

    showView('view-quiz');
    startTimer();
    renderQuestion();
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    var timerEl = $('csat-timer');
    var trackEl = document.querySelector('[data-timer-track]');
    var fillEl = document.querySelector('[data-timer-fill]');
    var progressTextEl = $('csat-progress-text');

    function paint() {
      if (!timerEl || !session) return;
      if (session.isCountdown) {
        var urgent = session.remainingSec <= 300;
        timerEl.textContent = formatDuration(session.remainingSec);
        timerEl.classList.toggle('is-urgent', urgent);
        if (trackEl && fillEl) {
          trackEl.hidden = false;
          trackEl.classList.toggle('is-urgent', urgent);
          var frac = session.remainingSec / FULL_DURATION_SEC;
          fillEl.style.transform = 'scaleX(' + Math.max(0, Math.min(1, frac)) + ')';
        }
        if (progressTextEl) progressTextEl.classList.toggle('is-urgent', urgent);
      } else {
        timerEl.textContent = formatDuration(session.elapsedSec);
        timerEl.classList.remove('is-urgent');
        if (trackEl) trackEl.hidden = true;
        if (progressTextEl) progressTextEl.classList.remove('is-urgent');
      }
    }

    paint();
    timerId = setInterval(function () {
      if (!session) return;
      session.elapsedSec += 1;
      if (session.isCountdown) {
        session.remainingSec -= 1;
        if (session.remainingSec <= 0) {
          session.remainingSec = 0;
          paint();
          submitQuiz();
          return;
        }
      }
      paint();
    }, 1000);
  }

  function renderQuestion() {
    if (!session) return;
    var q = session.questions[session.index];
    var total = session.questions.length;

    var progEl = $('csat-progress-text');
    if (progEl) progEl.textContent = 'Question ' + (session.index + 1) + ' of ' + total;

    var barEl = document.querySelector('[data-quiz-progress]');
    if (barEl) barEl.style.width = Math.round(((session.index + 1) / total) * 100) + '%';

    var metaEl = $('csat-q-meta');
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="tag tag--accent">' + q.year + '</span>' +
        '<span class="tag tag--sky">' + escapeHtml(q.topic) + '</span>' +
        (q.answer ? '' : '<span class="tag tag--warning">No key · unscored</span>');
    }

    var noteEl = $('csat-unscored-note');
    if (noteEl) {
      noteEl.hidden = Boolean(q.answer);
      noteEl.textContent = q.answer
        ? ''
        : 'This question has no single key in the source (Decision-Making items are graded by preference). It is shown for practice and never scored.';
    }

    var passageEl = $('csat-q-passage');
    if (passageEl) {
      if (q.passage) {
        passageEl.hidden = false;
        passageEl.textContent = q.passage;
      } else {
        passageEl.hidden = true;
        passageEl.textContent = '';
      }
    }

    /* Charts, tables and figure matrices lifted out of the source PDF */
    var figEl = $('csat-q-figure');
    if (figEl) {
      if (q.images && q.images.length) {
        figEl.hidden = false;
        figEl.innerHTML = q.images
          .map(function (name) {
            return (
              '<img src="../assets/img/csat/' + encodeURIComponent(name) + '" ' +
              'alt="Chart or figure for this question" loading="lazy" decoding="async">'
            );
          })
          .join('');
      } else {
        figEl.hidden = true;
        figEl.innerHTML = '';
      }
    }

    var stemEl = $('csat-q-stem');
    if (stemEl) stemEl.textContent = q.stem;

    var chosen = session.answers[q.id];
    var optsEl = $('csat-q-options');
    if (optsEl) {
      /* A handful of questions have their options printed as figures: the
         letters still work, the text does not. */
      var list = q.optionImages ? ['A', 'B', 'C', 'D'] : q.options;
      optsEl.classList.toggle('is-figure-options', !!q.optionImages);
      optsEl.innerHTML = list
        .map(function (text, i) {
          var key = 'abcd'[i];
          var cls = 'option-btn';
          if (chosen === key) cls += ' is-selected';
          if (session.instant && chosen) {
            if (q.answer && key === q.answer) cls += ' is-correct';
            else if (key === chosen && q.answer && key !== q.answer) cls += ' is-wrong';
          }
          return (
            '<button type="button" class="' + cls + '" data-key="' + key + '" role="radio" aria-checked="' +
            (chosen === key) + '">' +
            '<span class="option-key">' + key.toUpperCase() + '</span>' +
            '<span class="option-text">' +
            (q.optionImages ? 'Figure (' + key + ')' : escapeHtml(text)) +
            '</span>' +
            '</button>'
          );
        })
        .join('');
    }

    var fbEl = $('csat-q-feedback');
    if (fbEl) {
      if (session.instant && chosen) {
        if (!q.answer) {
          fbEl.hidden = false;
          fbEl.className = 'q-feedback';
          fbEl.textContent = 'No key for this one — it is not scored.';
        } else if (chosen === q.answer) {
          fbEl.hidden = false;
          fbEl.className = 'q-feedback is-correct';
          fbEl.textContent = 'Correct. ' + (q.explanation || '');
        } else {
          fbEl.hidden = false;
          fbEl.className = 'q-feedback is-wrong';
          fbEl.textContent = 'Key: ' + q.answer.toUpperCase() + '. ' + (q.explanation || '');
        }
      } else {
        fbEl.hidden = true;
        fbEl.textContent = '';
      }
    }

    var flagBtn = $('csat-flag');
    if (flagBtn) {
      var flagged = Boolean(session.flagged[q.id]);
      flagBtn.classList.toggle('is-flagged-on', flagged);
      flagBtn.setAttribute('aria-pressed', String(flagged));
      flagBtn.textContent = flagged ? '⚑ Flagged' : '⚑ Flag for review';
    }

    var st = readState();
    var bmBtn = $('csat-bookmark');
    if (bmBtn) {
      var bm = (st.bookmarks || []).indexOf(q.id) !== -1;
      bmBtn.classList.toggle('is-bm-on', bm);
      bmBtn.setAttribute('aria-pressed', String(bm));
      bmBtn.textContent = bm ? '★ Bookmarked' : '☆ Bookmark';
    }

    var prevBtn = $('csat-prev');
    if (prevBtn) prevBtn.disabled = session.index === 0;
    var nextBtn = $('csat-next');
    if (nextBtn) nextBtn.textContent = session.index === total - 1 ? 'Finish & review →' : 'Next (N) →';

    renderPalette();
  }

  function renderPalette() {
    if (!session) return;
    var grid = $('csat-palette');
    var sumEl = $('csat-palette-summary');
    var answered = Object.keys(session.answers).length;
    if (sumEl) sumEl.textContent = answered + ' / ' + session.questions.length + ' answered';
    if (!grid) return;

    grid.innerHTML = session.questions
      .map(function (q, idx) {
        var cls = ['palette-btn'];
        if (session.answers[q.id]) cls.push('is-answered');
        if (session.flagged[q.id]) cls.push('is-flagged');
        if (idx === session.index) cls.push('is-current');
        return (
          '<button type="button" class="' + cls.join(' ') + '" data-jump="' + idx + '" ' +
          'aria-label="Go to question ' + (idx + 1) + '">' + (idx + 1) + '</button>'
        );
      })
      .join('');
  }

  function selectAnswer(key) {
    if (!session) return;
    var q = session.questions[session.index];
    if ('abcd'.indexOf(key) === -1) return;
    if (!q.options['abcd'.indexOf(key)] && !q.optionImages) return;
    session.answers[q.id] = key;
    renderQuestion();
  }

  function go(delta) {
    if (!session) return;
    var next = session.index + delta;
    if (next < 0) return;
    if (next >= session.questions.length) {
      submitQuiz();
      return;
    }
    session.index = next;
    renderQuestion();
  }

  /* -------------------------------------------------------------- scoring */
  function submitQuiz() {
    if (!session) return;
    stopTimer();

    var correct = 0;
    var wrong = 0;
    var skipped = 0;
    var unscored = 0;
    var topicMap = {};
    var reviewItems = [];
    var wrongIds = [];

    session.questions.forEach(function (q) {
      var userAns = session.answers[q.id] || null;
      var topic = q.topic || 'General';
      if (!topicMap[topic]) topicMap[topic] = { correct: 0, wrong: 0, total: 0, unscored: 0 };
      topicMap[topic].total += 1;

      if (!q.answer) {
        unscored += 1;
        topicMap[topic].unscored += 1;
        reviewItems.push({ q: q, userAns: userAns, outcome: 'unscored' });
        return;
      }

      if (!userAns) {
        skipped += 1;
        reviewItems.push({ q: q, userAns: null, outcome: 'skipped' });
        return;
      }

      if (userAns === q.answer) {
        correct += 1;
        topicMap[topic].correct += 1;
        reviewItems.push({ q: q, userAns: userAns, outcome: 'correct' });
      } else {
        wrong += 1;
        topicMap[topic].wrong += 1;
        wrongIds.push(q.id);
        reviewItems.push({ q: q, userAns: userAns, outcome: 'wrong' });
      }
    });

    var scorable = correct + wrong;
    var maxScore = round2(session.questions.filter(function (q) {
      return Boolean(q.answer);
    }).length * MARK);
    var score = round2(correct * MARK - (session.negative ? wrong * NEG : 0));
    var pct = maxScore ? round2((score / maxScore) * 100) : 0;
    var accuracy = scorable ? Math.round((correct / scorable) * 100) : 0;

    lastReport = {
      label: session.label,
      score: score,
      maxScore: maxScore,
      pct: pct,
      correct: correct,
      wrong: wrong,
      skipped: skipped,
      unscored: unscored,
      accuracy: accuracy,
      elapsedSec: session.elapsedSec,
      avgSec: session.questions.length ? Math.round(session.elapsedSec / session.questions.length) : 0,
      topicMap: topicMap,
      reviewItems: reviewItems,
      qualifies: pct >= QUALIFY_PCT
    };

    /* persist */
    var st = readState();
    st.attempts = [
      {
        date: new Date().toISOString(),
        label: lastReport.label,
        score: lastReport.score,
        maxScore: lastReport.maxScore
      }
    ].concat(st.attempts || []).slice(0, 20);

    Object.keys(topicMap).forEach(function (t) {
      var prev = st.topicStats[t] || { correct: 0, attempted: 0 };
      st.topicStats[t] = {
        correct: (prev.correct || 0) + topicMap[t].correct,
        attempted: (prev.attempted || 0) + topicMap[t].correct + topicMap[t].wrong
      };
    });

    var mergedWrong = (st.wrongIds || []).filter(function (id) {
      return wrongIds.indexOf(id) === -1;
    });
    st.wrongIds = mergedWrong.concat(wrongIds).slice(0, 400);
    saveState(st);

    reviewFilter = 'wrong';
    document.querySelectorAll('[data-review]').forEach(function (chip) {
      var on = chip.getAttribute('data-review') === 'wrong';
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', String(on));
    });

    renderResults();
    showView('view-results');
    renderLobbyWidgets();
  }

  function renderResults() {
    if (!lastReport) return;
    var r = lastReport;

    var titleEl = $('csat-results-title');
    if (titleEl) titleEl.textContent = r.label;

    var scoreEl = $('csat-score');
    if (scoreEl) {
      var reduce =
        window.StudyMotion && typeof window.StudyMotion.prefersReducedMotion === 'function'
          ? window.StudyMotion.prefersReducedMotion()
          : false;
      var radius = 58;
      var circumference = 2 * Math.PI * radius;
      var frac = Math.max(0, Math.min(1, r.pct / 100));
      var offset = circumference * (1 - frac);
      scoreEl.innerHTML =
        '<div class="score-ring" aria-hidden="true">' +
        '<svg viewBox="0 0 132 132">' +
        '<circle class="score-ring-track" cx="66" cy="66" r="' + radius + '"></circle>' +
        '<circle class="score-ring-fill' + (reduce ? ' is-set' : '') + '" cx="66" cy="66" r="' + radius + '" ' +
        'stroke-dasharray="' + circumference.toFixed(1) + '" ' +
        'stroke-dashoffset="' + (reduce ? offset : circumference).toFixed(1) + '" ' +
        'data-offset="' + offset.toFixed(1) + '"></circle>' +
        '</svg>' +
        '<span class="score-ring-value">' + Math.round(r.pct) + '%</span>' +
        '</div>' +
        '<div class="score-copy">' +
        '<p class="eyebrow">' + (r.qualifies ? 'Above the qualifying line' : 'Below the qualifying line') + '</p>' +
        '<p class="score-figure"><strong>' + r.score + '</strong> / ' + r.maxScore + ' marks</p>' +
        '<p class="score-sub">' + r.correct + ' correct · ' + r.wrong + ' wrong · ' + r.skipped +
        ' skipped · ' + r.accuracy + '% accuracy · CSAT qualifies at ' + QUALIFY_PCT + '%</p>' +
        '</div>';

      if (!reduce) {
        requestAnimationFrame(function () {
          var fill = scoreEl.querySelector('.score-ring-fill');
          if (fill) fill.style.strokeDashoffset = fill.getAttribute('data-offset');
        });
      }
    }

    var kpisEl = $('csat-kpis');
    if (kpisEl) {
      kpisEl.innerHTML =
        '<article class="card kpi-card">' +
        '<span class="kpi-label">Score</span>' +
        '<span class="kpi-value">' + r.score + ' / ' + r.maxScore + '</span>' +
        '<span class="kpi-sub">' + r.correct + ' correct · ' + r.wrong + ' wrong</span>' +
        '</article>' +
        '<article class="card kpi-card">' +
        '<span class="kpi-label">Accuracy</span>' +
        '<span class="kpi-value">' + r.accuracy + '%</span>' +
        '<span class="kpi-sub">On attempted, scorable questions</span>' +
        '</article>' +
        '<article class="card kpi-card">' +
        '<span class="kpi-label">Time / question</span>' +
        '<span class="kpi-value">' + r.avgSec + 's</span>' +
        '<span class="kpi-sub">Total time ' + formatDuration(r.elapsedSec) + '</span>' +
        '</article>' +
        '<article class="card kpi-card">' +
        '<span class="kpi-label">Unscored</span>' +
        '<span class="kpi-value">' + r.unscored + '</span>' +
        '<span class="kpi-sub">No key in the source</span>' +
        '</article>';
    }

    var chartEl = $('csat-topic-chart');
    if (chartEl) {
      var reduceMotion =
        window.StudyMotion && typeof window.StudyMotion.prefersReducedMotion === 'function'
          ? window.StudyMotion.prefersReducedMotion()
          : false;
      var topics = Object.keys(r.topicMap).filter(function (t) {
        return r.topicMap[t].total > 0;
      });
      chartEl.innerHTML = topics.length
        ? topics
            .map(function (t) {
              var d = r.topicMap[t];
              var scored = d.correct + d.wrong;
              var pct = scored ? Math.round((d.correct / scored) * 100) : 0;
              return (
                '<div class="subject-bar-row">' +
                '<div class="subject-bar-head">' +
                '<strong>' + escapeHtml(t) + '</strong>' +
                '<span class="muted">' + d.correct + '/' + scored + ' (' + pct + '%)</span>' +
                '</div>' +
                '<div class="subject-bar-track">' +
                '<div class="subject-bar-fill' + (reduceMotion ? '' : ' is-entering') + '" style="width:' + pct + '%"></div>' +
                '</div>' +
                '</div>'
              );
            })
            .join('')
        : '<p class="muted">No scorable topic breakdown for this session.</p>';

      if (!reduceMotion) {
        requestAnimationFrame(function () {
          chartEl.querySelectorAll('.subject-bar-fill.is-entering').forEach(function (bar) {
            bar.classList.remove('is-entering');
          });
        });
      }
    }

    renderReviewList();
  }

  function renderReviewList() {
    if (!lastReport) return;
    var listEl = $('csat-review-list');
    if (!listEl) return;

    var items = lastReport.reviewItems.filter(function (item) {
      if (reviewFilter === 'wrong') return item.outcome === 'wrong';
      if (reviewFilter === 'unscored') return item.outcome === 'unscored';
      return true;
    });

    if (!items.length) {
      listEl.innerHTML = '<p class="muted">Nothing in this filter.</p>';
      return;
    }

    listEl.innerHTML = items
      .map(function (item) {
        var q = item.q;
        var badge =
          item.outcome === 'correct'
            ? '<span class="tag tag--success">Correct</span>'
            : item.outcome === 'wrong'
            ? '<span class="tag tag--danger">Wrong</span>'
            : item.outcome === 'unscored'
            ? '<span class="tag tag--warning">Unscored</span>'
            : '<span class="tag">Skipped (0)</span>';

        var optsHtml = (q.optionImages ? ['A', 'B', 'C', 'D'] : q.options)
          .map(function (text, i) {
            var key = 'abcd'[i];
            var cls = 'review-opt';
            if (item.outcome !== 'unscored' && key === q.answer) cls += ' is-right-key';
            else if (key === item.userAns && item.outcome === 'wrong') cls += ' is-user-wrong';
            return '<li class="' + cls + '"><strong>' + key.toUpperCase() + '.</strong> ' + (q.optionImages ? 'Figure (' + key + ')' : escapeHtml(text)) + '</li>';
          })
          .join('');

        return (
          '<article class="card review-card is-' + item.outcome + '">' +
          '<div class="q-meta-row">' + badge +
          '<span class="tag tag--accent">' + q.year + '</span>' +
          '<span class="tag tag--sky">' + escapeHtml(q.topic) + '</span>' +
          '</div>' +
          (q.passage ? '<p class="review-passage">' + escapeHtml(q.passage) + '</p>' : '') +
          (q.images && q.images.length
            ? '<div class="review-figure">' +
              q.images
                .map(function (name) {
                  return '<img src="../assets/img/csat/' + encodeURIComponent(name) + '" alt="Chart or figure for this question" loading="lazy" decoding="async">';
                })
                .join('') +
              '</div>'
            : '') +
          '<p class="q-stem" style="margin-top:0.75rem">' + escapeHtml(q.stem) + '</p>' +
          '<ul class="review-options">' + optsHtml + '</ul>' +
          (q.explanation ? '<p class="review-explanation"><strong>Why:</strong> ' + escapeHtml(q.explanation) + '</p>' : '') +
          '</article>'
        );
      })
      .join('');
  }

  /* ------------------------------------------------------------- wiring */
  function init() {
    if (!DATA.questions.length) {
      var card = document.querySelector('.setup-card');
      if (card) {
        card.innerHTML =
          '<div class="empty-state"><h3>CSAT dataset not loaded</h3>' +
          '<p>Add <code>data/csat-data.js</code> and reload this page.</p></div>';
      }
      return;
    }

    updateHeaderBadges();
    populateSelects();
    syncModeFields();
    renderLobbyWidgets();

    document.querySelectorAll('#csat-mode-tabs [data-mode]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.mode = tab.getAttribute('data-mode') === 'sectional' ? 'sectional' : 'full';
        document.querySelectorAll('#csat-mode-tabs [data-mode]').forEach(function (t) {
          t.setAttribute('aria-selected', String(t === tab));
        });
        syncModeFields();
      });
    });

    var yearSel = $('csat-year');
    if (yearSel) {
      yearSel.addEventListener('change', function () {
        state.year = Number(yearSel.value);
        syncModeFields();
      });
    }

    var topicSel = $('csat-topic');
    if (topicSel) {
      topicSel.addEventListener('change', function () {
        state.topic = topicSel.value;
        syncModeFields();
      });
    }

    var countSel = $('csat-count');
    if (countSel) {
      countSel.addEventListener('change', function () {
        state.count = countSel.value === 'all' ? 'all' : Number(countSel.value);
        syncModeFields();
      });
    }

    var negBox = $('csat-neg-marking');
    if (negBox) {
      negBox.addEventListener('change', function () {
        state.negative = negBox.checked;
      });
      state.negative = negBox.checked;
    }

    var instantBox = $('csat-instant');
    if (instantBox) {
      instantBox.addEventListener('change', function () {
        state.instant = instantBox.checked;
      });
      state.instant = instantBox.checked;
    }

    var startBtn = $('csat-start');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        var pool = currentPool();
        var label =
          state.mode === 'full'
            ? state.year + ' CSAT paper'
            : state.topic + ' · ' + pool.length + ' Qs';
        startQuiz(pool, label, state.mode === 'full');
      });
    }

    /* quiz controls */
    var optsEl = $('csat-q-options');
    if (optsEl) {
      optsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.option-btn');
        if (btn) selectAnswer(btn.getAttribute('data-key'));
      });
    }

    var paletteEl = $('csat-palette');
    if (paletteEl) {
      paletteEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-jump]');
        if (!btn || !session) return;
        session.index = Number(btn.getAttribute('data-jump'));
        renderQuestion();
      });
    }

    var clearBtn = $('csat-clear-choice');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!session) return;
        var q = session.questions[session.index];
        delete session.answers[q.id];
        renderQuestion();
      });
    }

    var flagBtn = $('csat-flag');
    if (flagBtn) {
      flagBtn.addEventListener('click', function () {
        if (!session) return;
        var q = session.questions[session.index];
        if (session.flagged[q.id]) delete session.flagged[q.id];
        else session.flagged[q.id] = true;
        renderQuestion();
      });
    }

    var bmBtn = $('csat-bookmark');
    if (bmBtn) {
      bmBtn.addEventListener('click', function () {
        if (!session) return;
        var q = session.questions[session.index];
        var st = readState();
        var idx = (st.bookmarks || []).indexOf(q.id);
        if (idx === -1) st.bookmarks.push(q.id);
        else st.bookmarks.splice(idx, 1);
        saveState(st);
        renderQuestion();
      });
    }

    var prevBtn = $('csat-prev');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    var nextBtn = $('csat-next');
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

    var submitBtn = $('csat-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        if (!session) return;
        var left = session.questions.length - Object.keys(session.answers).length;
        if (left > 0 && !window.confirm(left + ' question(s) are still unanswered. Submit anyway?')) return;
        submitQuiz();
      });
    }

    var exitBtn = $('csat-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', function () {
        if (!window.confirm('Leave this paper? Your answers in it are not saved.')) return;
        stopTimer();
        session = null;
        showView('view-lobby');
      });
    }

    var backBtn = $('csat-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        showView('view-lobby');
        renderLobbyWidgets();
      });
    }

    function retryWrong() {
      var st = readState();
      var ids = st.wrongIds || [];
      var pool = DATA.questions.filter(function (q) {
        return ids.indexOf(q.id) !== -1;
      });
      if (!pool.length) {
        toast('No wrong answers saved yet.');
        return;
      }
      startQuiz(shuffle(pool).slice(0, 30), 'Wrong answers · ' + Math.min(pool.length, 30) + ' Qs', false);
    }

    ['csat-retry-wrong', 'csat-retry-wrong-2'].forEach(function (id) {
      var b = $(id);
      if (b) b.addEventListener('click', retryWrong);
    });

    var clearProgress = $('csat-clear');
    if (clearProgress) {
      clearProgress.addEventListener('click', function () {
        if (!window.confirm('Clear all CSAT attempts, bookmarks and wrong-answer history on this browser?')) return;
        saveState(emptyState());
        renderLobbyWidgets();
        toast('CSAT progress cleared.');
      });
    }

    document.querySelectorAll('[data-review]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        reviewFilter = chip.getAttribute('data-review') || 'wrong';
        document.querySelectorAll('[data-review]').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        renderReviewList();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!session || $('view-quiz').hidden) return;
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      var k = e.key.toLowerCase();
      if ('abcd'.indexOf(k) !== -1) {
        selectAnswer(k);
        e.preventDefault();
      } else if (k === 'n' || k === 'arrowright') {
        go(1);
        e.preventDefault();
      } else if (k === 'p' || k === 'arrowleft') {
        go(-1);
        e.preventDefault();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
