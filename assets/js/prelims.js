/* ==========================================================================
   Prelims Practice Engine — Chinmaya Patro UPSC Study Desk
   - Hides questions flagged "incomplete"
   - Treats "no_key" and "source_marks_cancelled" as unscored
   - Modes: topic quiz, year-wise full-paper countdown simulation (100 or 150
     questions), custom, revision
   - Scoring: +2 correct, -0.66 wrong (toggleable), 0 skipped
   - Keyboard shortcuts: A-D answer, N next, P previous
   - LocalStorage attempts/bookmarks/wrong/streaks/topic accuracy + JSON I/O
   ========================================================================== */

(function () {
  'use strict';

  var YEAR_SIM_DURATION_SEC = 120 * 60; // UPSC allows 2 hours for the paper, whether it has 100 or 150 questions

  var activePool = [];
  var setup = {
    mode: 'topic'
  };

  var session = null;
  var lastReport = null;
  var reviewFilter = 'wrong';
  var timerInterval = null;

  var MODE_DESCRIPTIONS = {
    topic: 'Focus on a single subject and topic to build conceptual accuracy.',
    year: 'Full year-wise paper on a 2-hour UPSC countdown timer — 100 questions from 2011, 150 in the older papers.',
    custom: 'Mix any subject, topic, year, and question count for a tailored drill.',
    revision: 'Re-attempt questions you previously answered wrong or bookmarked.'
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function isUnscored(q) {
    var flags = q.flags || [];
    return (
      flags.indexOf('no_key') !== -1 ||
      flags.indexOf('source_marks_cancelled') !== -1 ||
      !q.answer
    );
  }

  function unscoredReason(q) {
    var flags = q.flags || [];
    if (flags.indexOf('source_marks_cancelled') !== -1) {
      return 'Marked as cancelled/dropped in source compilation — unscored.';
    }
    return 'No verified answer key in source compilation — unscored.';
  }

  function loadPool() {
    var raw = Array.isArray(window.PRELIMS_DATA)
      ? window.PRELIMS_DATA
      : window.PRELIMS_DATA && Array.isArray(window.PRELIMS_DATA.questions)
        ? window.PRELIMS_DATA.questions
        : [];

    return raw
      .filter(function (q) {
        var flags = Array.isArray(q.flags) ? q.flags : [];
        return flags.indexOf('incomplete') === -1;
      })
      .map(function (q, idx) {
        return {
          id: String(q.id || ('Q-' + idx)),
          year: parseInt(q.year, 10) || 0,
          qno: q.qno != null ? q.qno : idx + 1,
          subject: String(q.subject || 'General Studies').trim(),
          topic: String(q.topic || 'General').trim(),
          question: String(q.question || '').trim(),
          options: Array.isArray(q.options) ? q.options : [],
          answer: String(q.answer || '').trim().toUpperCase(),
          flags: Array.isArray(q.flags) ? q.flags : [],
          page: q.page
        };
      });
  }

  function getState() {
    return window.StudyStorage ? window.StudyStorage.getPrelimsState() : {
      attempts: [],
      bookmarks: [],
      wrongIds: [],
      topicStats: {},
      streak: { count: 0, lastDate: null }
    };
  }

  function saveState(st) {
    if (window.StudyStorage) window.StudyStorage.savePrelimsState(st);
  }

  function showView(viewId) {
    ['view-lobby', 'view-quiz', 'view-results'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = id !== viewId;
    });
  }

  function formatDuration(sec) {
    var s = Math.max(0, Math.floor(sec));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    if (h > 0) {
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
    }
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  /* Lobby Setup & Dropdowns
     ========================================================================== */

  function updateHeaderBadges() {
    var st = getState();
    var poolEl = document.getElementById('pre-pool-badge');
    var streakEl = document.getElementById('pre-streak-badge');
    var wrongEl = document.getElementById('pre-wrong-badge');
    var bmEl = document.getElementById('pre-bm-badge');

    if (poolEl) poolEl.textContent = activePool.length.toLocaleString('en-IN') + ' questions active';
    if (streakEl) streakEl.textContent = (st.streak ? st.streak.count : 0) + '-day streak';
    if (wrongEl) wrongEl.textContent = st.wrongIds.length + ' wrong to revise';
    if (bmEl) bmEl.textContent = st.bookmarks.length + ' bookmarked';
  }

  function populateLobbySelects() {
    var subjSel = document.getElementById('pre-subject');
    var yearSel = document.getElementById('pre-year');

    var subjects = Array.from(new Set(activePool.map(function (q) { return q.subject; }))).sort();
    if (subjSel) {
      subjSel.innerHTML =
        '<option value="all">All subjects</option>' +
        subjects.map(function (s) {
          return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
        }).join('');
    }

    var years = Array.from(new Set(activePool.map(function (q) { return q.year; }).filter(Boolean))).sort(function (a, b) {
      return b - a;
    });
    if (yearSel) {
      yearSel.innerHTML =
        '<option value="all">All years</option>' +
        years.map(function (y) {
          return '<option value="' + y + '">' + y + '</option>';
        }).join('');
    }

    populateTopicSelect();
  }

  function populateTopicSelect() {
    var subjSel = document.getElementById('pre-subject');
    var topicSel = document.getElementById('pre-topic');
    if (!topicSel) return;

    var subj = subjSel ? subjSel.value : 'all';
    var pool = subj === 'all' ? activePool : activePool.filter(function (q) { return q.subject === subj; });
    var topics = Array.from(new Set(pool.map(function (q) { return q.topic; }))).sort();

    topicSel.innerHTML =
      '<option value="all">All topics (' + topics.length + ')</option>' +
      topics.map(function (t) {
        return '<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + '</option>';
      }).join('');
  }

  function syncModeFields() {
    var descEl = document.getElementById('mode-description');
    if (descEl) descEl.textContent = MODE_DESCRIPTIONS[setup.mode] || '';

    var fields = {
      subject: setup.mode === 'topic' || setup.mode === 'custom',
      topic: setup.mode === 'topic' || setup.mode === 'custom',
      year: setup.mode === 'year' || setup.mode === 'custom',
      count: setup.mode === 'topic' || setup.mode === 'custom',
      'revision-source': setup.mode === 'revision'
    };

    Object.keys(fields).forEach(function (name) {
      var box = document.querySelector('[data-field="' + name + '"]');
      if (box) box.hidden = !fields[name];
    });

    if (setup.mode === 'year') {
      var yearSel = document.getElementById('pre-year');
      if (yearSel && yearSel.value === 'all' && yearSel.options.length > 1) {
        yearSel.selectedIndex = 1;
      }
    }

    updateMatchCount();
  }

  function getSelectedQuestions() {
    var st = getState();
    var subj = (document.getElementById('pre-subject') || {}).value || 'all';
    var topic = (document.getElementById('pre-topic') || {}).value || 'all';
    var yearVal = (document.getElementById('pre-year') || {}).value || 'all';
    var countVal = (document.getElementById('pre-count') || {}).value || '20';
    var revSrc = (document.getElementById('pre-revision-source') || {}).value || 'wrong';

    var matched = [];

    if (setup.mode === 'topic') {
      matched = activePool.filter(function (q) {
        if (subj !== 'all' && q.subject !== subj) return false;
        if (topic !== 'all' && q.topic !== topic) return false;
        return true;
      });
      matched = shuffle(matched);
    } else if (setup.mode === 'year') {
      matched = activePool
        .filter(function (q) {
          return yearVal === 'all' ? true : String(q.year) === String(yearVal);
        })
        .sort(function (a, b) {
          return (Number(a.qno) || 0) - (Number(b.qno) || 0);
        });
      return matched;
    } else if (setup.mode === 'custom') {
      matched = activePool.filter(function (q) {
        if (subj !== 'all' && q.subject !== subj) return false;
        if (topic !== 'all' && q.topic !== topic) return false;
        if (yearVal !== 'all' && String(q.year) !== String(yearVal)) return false;
        return true;
      });
      matched = shuffle(matched);
    } else if (setup.mode === 'revision') {
      var wrongSet = new Set(st.wrongIds);
      var bmSet = new Set(st.bookmarks);
      matched = activePool.filter(function (q) {
        if (revSrc === 'wrong') return wrongSet.has(q.id);
        if (revSrc === 'bookmarked') return bmSet.has(q.id);
        return wrongSet.has(q.id) || bmSet.has(q.id);
      });
      return matched;
    }

    if (countVal !== 'all') {
      var limit = parseInt(countVal, 10) || 20;
      return matched.slice(0, limit);
    }
    return matched;
  }

  function updateMatchCount() {
    var countEl = document.getElementById('pre-match-count');
    var startBtn = document.getElementById('btn-start-quiz');
    var picked = getSelectedQuestions();
    if (countEl) {
      countEl.textContent = picked.length + ' question' + (picked.length === 1 ? '' : 's') + ' ready';
    }
    if (startBtn) {
      startBtn.disabled = picked.length === 0;
    }
  }

  function renderLobbyWidgets() {
    var st = getState();
    var accEl = document.getElementById('lobby-topic-accuracy');
    var attEl = document.getElementById('lobby-attempts');

    if (accEl) {
      var entries = Object.keys(st.topicStats || {}).map(function (t) {
        var s = st.topicStats[t];
        var pct = s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0;
        return { topic: t, correct: s.correct || 0, attempted: s.attempted || 0, pct: pct };
      });
      entries.sort(function (a, b) { return b.attempted - a.attempted; });

      if (!entries.length) {
        accEl.innerHTML = '<p class="muted">Complete a practice quiz to see per-topic accuracy here.</p>';
      } else {
        accEl.innerHTML = entries.slice(0, 8).map(function (e) {
          return (
            '<div class="accuracy-row">' +
              '<span>' + escapeHtml(e.topic) + '</span>' +
              '<span class="tag">' + e.correct + '/' + e.attempted + ' (' + e.pct + '%)</span>' +
            '</div>'
          );
        }).join('');
      }
    }

    if (attEl) {
      var list = (st.attempts || []).slice(0, 6);
      if (!list.length) {
        attEl.innerHTML = '<p class="muted">No saved attempts yet.</p>';
      } else {
        attEl.innerHTML = list.map(function (a) {
          var dateStr = a.date ? new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
          return (
            '<div class="attempt-row">' +
              '<span><strong>' + escapeHtml(a.label) + '</strong> · ' + escapeHtml(dateStr) + '</span>' +
              '<span class="tag tag--accent">' + a.score + ' / ' + a.maxScore + '</span>' +
            '</div>'
          );
        }).join('');
      }
    }
  }

  /* Active Quiz Engine
     ========================================================================== */

  function startQuiz(questions, modeLabel, isCountdown) {
    if (!questions || !questions.length) {
      if (window.StudyUI) window.StudyUI.toast('No matching questions available.');
      return;
    }

    var negBox = document.getElementById('pre-neg-marking');
    session = {
      label: modeLabel,
      questions: questions,
      answers: {},
      flagged: new Set(),
      index: 0,
      negativeMarking: negBox ? negBox.checked : true,
      isCountdown: Boolean(isCountdown),
      remainingSec: isCountdown ? YEAR_SIM_DURATION_SEC : 0,
      elapsedSec: 0
    };

    var modeEl = document.getElementById('quiz-mode-label');
    if (modeEl) modeEl.textContent = modeLabel;

    showView('view-quiz');
    startTimer();
    renderQuestion();
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    stopTimer();
    var timerEl = document.getElementById('quiz-timer');

    function paint() {
      if (!timerEl || !session) return;
      if (session.isCountdown) {
        timerEl.textContent = formatDuration(session.remainingSec);
        timerEl.classList.toggle('is-urgent', session.remainingSec <= 300);
      } else {
        timerEl.textContent = formatDuration(session.elapsedSec);
        timerEl.classList.remove('is-urgent');
      }
    }

    paint();
    timerInterval = setInterval(function () {
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
    var st = getState();
    var bmSet = new Set(st.bookmarks);

    var progEl = document.getElementById('quiz-progress-text');
    if (progEl) progEl.textContent = 'Question ' + (session.index + 1) + ' of ' + total;

    var metaEl = document.getElementById('q-meta-row');
    if (metaEl) {
      metaEl.innerHTML =
        (q.year ? '<span class="tag tag--accent">' + q.year + (q.qno ? ' · Q' + q.qno : '') + '</span>' : '') +
        '<span class="tag tag--sky">' + escapeHtml(q.subject) + '</span>' +
        '<span class="tag">' + escapeHtml(q.topic) + '</span>';
    }

    var noteEl = document.getElementById('q-unscored-note');
    if (noteEl) {
      var unscored = isUnscored(q);
      noteEl.hidden = !unscored;
      if (unscored) noteEl.textContent = unscoredReason(q);
    }

    var stemEl = document.getElementById('q-stem');
    if (stemEl) stemEl.textContent = q.question;

    var chosen = session.answers[q.id] || '';
    var optsEl = document.getElementById('q-options');
    if (optsEl) {
      optsEl.innerHTML = (q.options || []).map(function (opt) {
        var isSel = chosen === opt.key;
        return (
          '<button type="button" class="option-btn' + (isSel ? ' is-selected' : '') + '" ' +
            'role="radio" aria-checked="' + String(isSel) + '" data-opt-key="' + escapeHtml(opt.key) + '">' +
            '<span class="option-key">' + escapeHtml(opt.key) + '</span>' +
            '<span class="option-text">' + escapeHtml(opt.text) + '</span>' +
          '</button>'
        );
      }).join('');
    }

    var flagBtn = document.getElementById('btn-flag-review');
    if (flagBtn) {
      var flagged = session.flagged.has(q.id);
      flagBtn.classList.toggle('is-flagged-on', flagged);
      flagBtn.setAttribute('aria-pressed', String(flagged));
      flagBtn.textContent = flagged ? '⚑ Flagged' : '⚑ Flag for review';
    }

    var bmBtn = document.getElementById('btn-bookmark-q');
    if (bmBtn) {
      var bm = bmSet.has(q.id);
      bmBtn.classList.toggle('is-bm-on', bm);
      bmBtn.setAttribute('aria-pressed', String(bm));
      bmBtn.textContent = bm ? '★ Bookmarked' : '☆ Bookmark';
    }

    var prevBtn = document.getElementById('btn-prev-q');
    var nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) prevBtn.disabled = session.index === 0;
    if (nextBtn) {
      nextBtn.textContent = session.index === total - 1 ? 'Finish & Review →' : 'Next (N) →';
    }

    renderPalette();
  }

  function renderPalette() {
    if (!session) return;
    var grid = document.getElementById('quiz-palette');
    var sumEl = document.getElementById('palette-summary');
    var answeredCount = Object.keys(session.answers).length;
    if (sumEl) sumEl.textContent = answeredCount + ' / ' + session.questions.length + ' answered';

    if (!grid) return;
    grid.innerHTML = session.questions.map(function (q, idx) {
      var classes = ['palette-btn'];
      if (session.answers[q.id]) classes.push('is-answered');
      if (session.flagged.has(q.id)) classes.push('is-flagged');
      if (idx === session.index) classes.push('is-current');
      return (
        '<button type="button" class="' + classes.join(' ') + '" data-jump="' + idx + '" ' +
          'aria-label="Go to question ' + (idx + 1) + '">' + (idx + 1) + '</button>'
      );
    }).join('');
  }

  function selectAnswer(key) {
    if (!session) return;
    var q = session.questions[session.index];
    var valid = (q.options || []).some(function (o) { return o.key === key; });
    if (!valid) return;
    session.answers[q.id] = key;
    renderQuestion();
  }

  /* Scoring & Results
     ========================================================================== */

  function submitQuiz() {
    if (!session) return;
    stopTimer();

    var correct = 0;
    var wrong = 0;
    var skipped = 0;
    var unscoredCount = 0;
    var wrongQuestions = [];
    var subjectMap = {};
    var reviewItems = [];

    var st = getState();
    var wrongSet = new Set(st.wrongIds);

    session.questions.forEach(function (q) {
      var userAns = session.answers[q.id] || '';
      var unscored = isUnscored(q);

      if (!subjectMap[q.subject]) {
        subjectMap[q.subject] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
      }

      if (unscored) {
        unscoredCount += 1;
        reviewItems.push({ q: q, userAns: userAns, outcome: 'unscored' });
        return;
      }

      subjectMap[q.subject].total += 1;

      if (!userAns) {
        skipped += 1;
        subjectMap[q.subject].skipped += 1;
        reviewItems.push({ q: q, userAns: '', outcome: 'skipped' });
      } else if (userAns === q.answer) {
        correct += 1;
        subjectMap[q.subject].correct += 1;
        wrongSet.delete(q.id);
        reviewItems.push({ q: q, userAns: userAns, outcome: 'correct' });

        if (!st.topicStats[q.topic]) st.topicStats[q.topic] = { attempted: 0, correct: 0 };
        st.topicStats[q.topic].attempted += 1;
        st.topicStats[q.topic].correct += 1;
      } else {
        wrong += 1;
        subjectMap[q.subject].wrong += 1;
        wrongSet.add(q.id);
        wrongQuestions.push(q);
        reviewItems.push({ q: q, userAns: userAns, outcome: 'wrong' });

        if (!st.topicStats[q.topic]) st.topicStats[q.topic] = { attempted: 0, correct: 0 };
        st.topicStats[q.topic].attempted += 1;
      }
    });

    var scorable = session.questions.length - unscoredCount;
    var rawScore = correct * 2 - (session.negativeMarking ? wrong * 0.66 : 0);
    var score = Math.round(rawScore * 100) / 100;
    var maxScore = scorable * 2;
    var attempted = correct + wrong;
    var accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    var avgSec = session.questions.length ? Math.round(session.elapsedSec / session.questions.length) : 0;

    st.wrongIds = Array.from(wrongSet);
    if (window.StudyStorage) {
      st.streak = window.StudyStorage.updateStreak(st.streak);
    }
    st.attempts.unshift({
      date: new Date().toISOString(),
      label: session.label,
      score: score,
      maxScore: maxScore,
      accuracy: accuracy,
      total: session.questions.length
    });
    st.attempts = st.attempts.slice(0, 30);
    saveState(st);

    lastReport = {
      label: session.label,
      score: score,
      maxScore: maxScore,
      correct: correct,
      wrong: wrong,
      skipped: skipped,
      unscoredCount: unscoredCount,
      accuracy: accuracy,
      avgSec: avgSec,
      elapsedSec: session.elapsedSec,
      subjectMap: subjectMap,
      reviewItems: reviewItems,
      wrongQuestions: wrongQuestions
    };

    session = null;
    updateHeaderBadges();
    renderLobbyWidgets();
    renderResults();
    showView('view-results');
  }

  function renderResults() {
    if (!lastReport) return;

    var titleEl = document.getElementById('results-title');
    if (titleEl) titleEl.textContent = lastReport.label + ' — Results';

    var retryBtn = document.getElementById('btn-retry-wrong');
    if (retryBtn) retryBtn.disabled = !lastReport.wrongQuestions.length;

    var kpisEl = document.getElementById('results-kpis');
    if (kpisEl) {
      kpisEl.innerHTML =
        '<article class="card kpi-card">' +
          '<span class="kpi-label">Score</span>' +
          '<span class="kpi-value">' + lastReport.score + ' / ' + lastReport.maxScore + '</span>' +
          '<span class="kpi-sub">' + lastReport.correct + ' correct · ' + lastReport.wrong + ' wrong · ' + lastReport.skipped + ' skipped</span>' +
        '</article>' +
        '<article class="card kpi-card">' +
          '<span class="kpi-label">Accuracy</span>' +
          '<span class="kpi-value">' + lastReport.accuracy + '%</span>' +
          '<span class="kpi-sub">On attempted scorable questions</span>' +
        '</article>' +
        '<article class="card kpi-card">' +
          '<span class="kpi-label">Time / Question</span>' +
          '<span class="kpi-value">' + lastReport.avgSec + 's</span>' +
          '<span class="kpi-sub">Total time ' + formatDuration(lastReport.elapsedSec) + '</span>' +
        '</article>' +
        '<article class="card kpi-card">' +
          '<span class="kpi-label">Unscored</span>' +
          '<span class="kpi-value">' + lastReport.unscoredCount + '</span>' +
          '<span class="kpi-sub">Cancelled or missing key</span>' +
        '</article>';
    }

    var chartEl = document.getElementById('results-subject-chart');
    if (chartEl) {
      var reduceMotion =
        window.StudyMotion && typeof window.StudyMotion.prefersReducedMotion === 'function'
          ? window.StudyMotion.prefersReducedMotion()
          : false;

      var subjects = Object.keys(lastReport.subjectMap).filter(function (s) {
        return lastReport.subjectMap[s].total > 0;
      });

      if (!subjects.length) {
        chartEl.innerHTML = '<p class="muted">No scorable subject breakdown available.</p>';
      } else {
        chartEl.innerHTML = subjects.map(function (s) {
          var d = lastReport.subjectMap[s];
          var pct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
          return (
            '<div class="subject-bar-row">' +
              '<div class="subject-bar-head">' +
                '<strong>' + escapeHtml(s) + '</strong>' +
                '<span class="muted">' + d.correct + '/' + d.total + ' (' + pct + '%)</span>' +
              '</div>' +
              '<div class="subject-bar-track">' +
                '<div class="subject-bar-fill' + (reduceMotion ? '' : ' is-entering') + '" style="width:' + pct + '%"></div>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        if (!reduceMotion) {
          requestAnimationFrame(function () {
            chartEl.querySelectorAll('.subject-bar-fill.is-entering').forEach(function (bar) {
              bar.classList.remove('is-entering');
            });
          });
        }
      }
    }

    renderReviewList();
  }

  function renderReviewList() {
    if (!lastReport) return;
    var listEl = document.getElementById('results-review-list');
    if (!listEl) return;

    var items = lastReport.reviewItems.filter(function (item) {
      if (reviewFilter === 'wrong') return item.outcome === 'wrong';
      if (reviewFilter === 'unscored') return item.outcome === 'unscored';
      return true;
    });

    if (!items.length) {
      listEl.innerHTML =
        '<div class="empty-state">' +
          '<p>No questions in this review filter.</p>' +
        '</div>';
      return;
    }

    listEl.innerHTML = items.map(function (item) {
      var q = item.q;
      var badge =
        item.outcome === 'correct'
          ? '<span class="tag tag--success">Correct (+2)</span>'
          : item.outcome === 'wrong'
            ? '<span class="tag tag--danger">Wrong</span>'
            : item.outcome === 'unscored'
              ? '<span class="tag tag--warning">Unscored</span>'
              : '<span class="tag">Skipped (0)</span>';

      var optsHtml = (q.options || []).map(function (opt) {
        var cls = 'review-opt';
        if (item.outcome !== 'unscored' && opt.key === q.answer) cls += ' is-right-key';
        else if (opt.key === item.userAns && item.outcome === 'wrong') cls += ' is-user-wrong';
        return '<li class="' + cls + '"><strong>' + escapeHtml(opt.key) + '.</strong> ' + escapeHtml(opt.text) + '</li>';
      }).join('');

      return (
        '<article class="card review-card is-' + item.outcome + '">' +
          '<div class="q-meta-row">' +
            badge +
            (q.year ? '<span class="tag tag--accent">' + q.year + '</span>' : '') +
            '<span class="tag tag--sky">' + escapeHtml(q.subject) + '</span>' +
            '<span class="tag">' + escapeHtml(q.topic) + '</span>' +
          '</div>' +
          '<p class="q-stem" style="margin-top:0.75rem">' + escapeHtml(q.question) + '</p>' +
          '<ul class="review-options">' + optsHtml + '</ul>' +
        '</article>'
      );
    }).join('');
  }

  /* Initialization & Event Wiring
     ========================================================================== */

  function initPrelims() {
    activePool = loadPool();
    updateHeaderBadges();
    renderLobbyWidgets();

    if (!activePool.length) {
      var setupCard = document.querySelector('.setup-card');
      if (setupCard) {
        setupCard.innerHTML =
          '<div class="empty-state">' +
            '<h3>Prelims dataset not loaded yet</h3>' +
            '<p>Run <code>convert_prelims.py</code> to generate <code>data/prelims-data.js</code> and reload this page.</p>' +
          '</div>';
      }
      return;
    }

    populateLobbySelects();
    syncModeFields();

    /* Mode Tabs */
    var modeTabs = document.querySelectorAll('#pre-mode-tabs [data-mode]');
    modeTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setup.mode = tab.getAttribute('data-mode') || 'topic';
        modeTabs.forEach(function (t) {
          t.setAttribute('aria-selected', String(t === tab));
        });
        syncModeFields();
      });
    });

    /* Dropdown Listeners */
    var subjSel = document.getElementById('pre-subject');
    if (subjSel) {
      subjSel.addEventListener('change', function () {
        populateTopicSelect();
        updateMatchCount();
      });
    }
    ['pre-topic', 'pre-year', 'pre-count', 'pre-revision-source'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', updateMatchCount);
    });

    /* Start Quiz */
    var startBtn = document.getElementById('btn-start-quiz');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        var picked = getSelectedQuestions();
        var yearVal = (document.getElementById('pre-year') || {}).value || 'Paper';
        var labelMap = {
          topic: 'Topic Quiz',
          year: yearVal + ' Prelims Simulation',
          custom: 'Custom Drill',
          revision: 'Revision Session'
        };
        startQuiz(picked, labelMap[setup.mode] || 'Practice', setup.mode === 'year');
      });
    }

    /* Options & Palette Delegation */
    var optsEl = document.getElementById('q-options');
    if (optsEl) {
      optsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-opt-key]');
        if (btn) selectAnswer(btn.getAttribute('data-opt-key'));
      });
    }

    var paletteEl = document.getElementById('quiz-palette');
    if (paletteEl) {
      paletteEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-jump]');
        if (!btn || !session) return;
        session.index = parseInt(btn.getAttribute('data-jump'), 10) || 0;
        renderQuestion();
      });
    }

    /* Quiz Tool Buttons */
    var clearBtn = document.getElementById('btn-clear-choice');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!session) return;
        var q = session.questions[session.index];
        delete session.answers[q.id];
        renderQuestion();
      });
    }

    var flagBtn = document.getElementById('btn-flag-review');
    if (flagBtn) {
      flagBtn.addEventListener('click', function () {
        if (!session) return;
        var q = session.questions[session.index];
        if (session.flagged.has(q.id)) session.flagged.delete(q.id);
        else session.flagged.add(q.id);
        renderQuestion();
      });
    }

    var bmBtn = document.getElementById('btn-bookmark-q');
    if (bmBtn) {
      bmBtn.addEventListener('click', function () {
        if (!session) return;
        var q = session.questions[session.index];
        var st = getState();
        var idx = st.bookmarks.indexOf(q.id);
        if (idx === -1) st.bookmarks.push(q.id);
        else st.bookmarks.splice(idx, 1);
        saveState(st);
        updateHeaderBadges();
        renderQuestion();
      });
    }

    var prevBtn = document.getElementById('btn-prev-q');
    var nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (!session || session.index <= 0) return;
        session.index -= 1;
        renderQuestion();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (!session) return;
        if (session.index < session.questions.length - 1) {
          session.index += 1;
          renderQuestion();
        } else {
          submitQuiz();
        }
      });
    }

    var submitBtn = document.getElementById('btn-submit-quiz');
    var exitBtn = document.getElementById('btn-exit-quiz');
    if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
    if (exitBtn) {
      exitBtn.addEventListener('click', function () {
        stopTimer();
        session = null;
        showView('view-lobby');
        updateMatchCount();
      });
    }

    /* Keyboard Shortcuts (A-D, N, P) */
    document.addEventListener('keydown', function (event) {
      if (!session) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      var k = String(event.key || '').toUpperCase();
      if (k === 'A' || k === 'B' || k === 'C' || k === 'D') {
        selectAnswer(k);
      } else if (k === 'N') {
        if (session.index < session.questions.length - 1) {
          session.index += 1;
          renderQuestion();
        }
      } else if (k === 'P') {
        if (session.index > 0) {
          session.index -= 1;
          renderQuestion();
        }
      }
    });

    /* Results Actions */
    var retryBtn = document.getElementById('btn-retry-wrong');
    var backBtn = document.getElementById('btn-back-lobby');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        if (!lastReport || !lastReport.wrongQuestions.length) return;
        startQuiz(lastReport.wrongQuestions.slice(), 'Retry Wrong Only', false);
      });
    }
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        showView('view-lobby');
        updateMatchCount();
      });
    }

    var revFilterBtns = document.querySelectorAll('[data-review-filter]');
    revFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        reviewFilter = btn.getAttribute('data-review-filter') || 'wrong';
        revFilterBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderReviewList();
      });
    });

    /* Export / Import Progress JSON */
    var exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        if (!window.StudyStorage) return;
        var payload = window.StudyStorage.exportAll();
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'chinmaya-upsc-progress-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.StudyUI) window.StudyUI.toast('Progress exported as JSON.');
      });
    }

    var importInput = document.getElementById('input-import-json');
    if (importInput) {
      importInput.addEventListener('change', function () {
        var file = importInput.files && importInput.files[0];
        if (!file || !window.StudyStorage) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(String(reader.result));
            window.StudyStorage.importAll(parsed);
            updateHeaderBadges();
            renderLobbyWidgets();
            updateMatchCount();
            if (window.StudyUI) window.StudyUI.toast('Progress imported successfully.');
          } catch (err) {
            if (window.StudyUI) window.StudyUI.toast('Could not import JSON: invalid file.');
          }
          importInput.value = '';
        };
        reader.readAsText(file);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrelims);
  } else {
    initPrelims();
  }
})();