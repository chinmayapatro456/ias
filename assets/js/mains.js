/* ==========================================================================
   Mains PYQs Explorer — Chinmaya Patro UPSC Study Desk
   Reads window.PYQ_METADATA, window.UPSC_MAINS_PYQS, and window.PYQ_BY_TOPIC.
   Supports subject, topic, year-range, keyword, status filters, grouping,
   localStorage bookmarks & "answer written" ticks.
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SIZE = 120;

  var state = {
    subject: 'all',
    topic: 'all',
    yearFrom: 2013,
    yearTo: 2026,
    query: '',
    status: 'all',
    groupMode: 'topic',
    visibleLimit: PAGE_SIZE
  };

  var allQuestions = [];

  var searchTimer = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightText(text, query) {
    var safe = escapeHtml(text);
    if (!query) return safe;
    var esc = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return safe.replace(new RegExp('(' + esc + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) {
      return safe;
    }
  }

  function normalizeQuestions() {
    var raw = Array.isArray(window.UPSC_MAINS_PYQS) ? window.UPSC_MAINS_PYQS : [];

    if (!raw.length && window.PYQ_BY_TOPIC && typeof window.PYQ_BY_TOPIC === 'object') {
      Object.keys(window.PYQ_BY_TOPIC).forEach(function (groupKey) {
        var entry = window.PYQ_BY_TOPIC[groupKey];
        var list = Array.isArray(entry) ? entry : (entry && Array.isArray(entry.questions) ? entry.questions : []);
        list.forEach(function (q, idx) {
          raw.push(Object.assign({ topic: groupKey, id: groupKey + '-' + idx }, q));
        });
      });
    }

    return raw.map(function (q, idx) {
      var topic = String(q.topic || q.group || q.subtopic || q.category || 'General');
      var subject = String(q.paper || q.gsPaper || q.subject || topic);
      var year = parseInt(q.year, 10) || 0;
      var text = String(q.question || q.text || q.prompt || '').trim();
      var id = String(q.id || (year + '-' + idx + '-' + topic.slice(0, 16)));
      return {
        id: id,
        year: year,
        subject: subject,
        topic: topic,
        text: text,
        marks: q.marks || q.wordLimit || '',
        searchBlob: (subject + ' ' + topic + ' ' + year + ' ' + text).toLowerCase()
      };
    });
  }

  function getWrittenSet() {
    return new Set(
      window.StudyStorage ? window.StudyStorage.getSet(window.StudyStorage.KEYS.mainsWritten) : []
    );
  }

  function getBookmarkSet() {
    return new Set(
      window.StudyStorage ? window.StudyStorage.getSet(window.StudyStorage.KEYS.mainsBookmarks) : []
    );
  }

  /* Compact summary on the collapsed Filters button (Android) */
  function updateFiltersMeta() {
    var meta = document.getElementById('mains-filters-meta');
    if (!meta) return;
    var bits = [];
    bits.push(state.subject === 'all' ? 'all papers' : state.subject);
    if (state.status !== 'all') bits.push(state.status);
    if (state.topic !== 'all') bits.push(state.topic);
    meta.textContent = ' · ' + bits.join(' · ');
  }

  function updateHeaderStats() {
    var totalEl = document.getElementById('mains-total-badge');
    var writtenEl = document.getElementById('mains-written-badge');
    var bmEl = document.getElementById('mains-bookmarked-badge');

    if (totalEl) totalEl.textContent = allQuestions.length.toLocaleString('en-IN') + ' questions';
    if (writtenEl) writtenEl.textContent = getWrittenSet().size + ' written';
    if (bmEl) bmEl.textContent = getBookmarkSet().size + ' bookmarked';
  }

  function populateDropdowns() {
    var subjectSel = document.getElementById('mains-subject');
    var yearFromSel = document.getElementById('mains-year-from');
    var yearToSel = document.getElementById('mains-year-to');

    var subjects = Array.from(new Set(allQuestions.map(function (q) { return q.subject; }))).sort();
    if (subjectSel) {
      subjectSel.innerHTML =
        '<option value="all">All papers & subjects (' + subjects.length + ')</option>' +
        subjects.map(function (s) {
          return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
        }).join('');
    }

    var years = Array.from(new Set(allQuestions.map(function (q) { return q.year; }).filter(Boolean))).sort(function (a, b) {
      return a - b;
    });
    if (years.length) {
      state.yearFrom = years[0];
      state.yearTo = years[years.length - 1];
      var optsAsc = years.map(function (y) {
        return '<option value="' + y + '">' + y + '</option>';
      }).join('');
      var optsDesc = years.slice().reverse().map(function (y) {
        return '<option value="' + y + '">' + y + '</option>';
      }).join('');
      if (yearFromSel) {
        yearFromSel.innerHTML = optsAsc;
        yearFromSel.value = String(state.yearFrom);
      }
      if (yearToSel) {
        yearToSel.innerHTML = optsDesc;
        yearToSel.value = String(state.yearTo);
      }
    }

    populateTopicDropdown();
  }

  function populateTopicDropdown() {
    var topicSel = document.getElementById('mains-topic');
    if (!topicSel) return;

    var pool = state.subject === 'all'
      ? allQuestions
      : allQuestions.filter(function (q) { return q.subject === state.subject; });

    var topics = Array.from(new Set(pool.map(function (q) { return q.topic; }))).sort();
    topicSel.innerHTML =
      '<option value="all">All topic groups (' + topics.length + ')</option>' +
      topics.map(function (t) {
        return '<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + '</option>';
      }).join('');

    if (topics.indexOf(state.topic) === -1) {
      state.topic = 'all';
    }
    topicSel.value = state.topic;
  }

  function getFilteredQuestions() {
    var writtenSet = getWrittenSet();
    var bmSet = getBookmarkSet();
    var qStr = state.query.trim().toLowerCase();
    var yMin = Math.min(state.yearFrom, state.yearTo);
    var yMax = Math.max(state.yearFrom, state.yearTo);

    return allQuestions.filter(function (item) {
      if (state.subject !== 'all' && item.subject !== state.subject) return false;
      if (state.topic !== 'all' && item.topic !== state.topic) return false;
      if (item.year && (item.year < yMin || item.year > yMax)) return false;
      if (state.status === 'written' && !writtenSet.has(item.id)) return false;
      if (state.status === 'unwritten' && writtenSet.has(item.id)) return false;
      if (state.status === 'bookmarked' && !bmSet.has(item.id)) return false;
      if (qStr && item.searchBlob.indexOf(qStr) === -1) return false;
      return true;
    });
  }

  function renderList() {
    var listEl = document.getElementById('mains-list');
    var metaEl = document.getElementById('mains-results-meta');
    if (!listEl) return;

    var filtered = getFilteredQuestions();
    var writtenSet = getWrittenSet();
    var bmSet = getBookmarkSet();

    /* Live result count for the sticky filter bar: shown / matching */
    if (metaEl) {
      metaEl.innerHTML =
        '<strong>' + Math.min(filtered.length, state.visibleLimit).toLocaleString('en-IN') +
        '</strong> of ' + filtered.length.toLocaleString('en-IN') +
        ' shown · by ' + state.groupMode;
    }

    if (!filtered.length) {
      listEl.innerHTML =
        '<div class="empty-state">' +
          '<h3>No Mains questions match these filters</h3>' +
          '<p>Widen the year range, clear the keyword search, or reset filters to browse all questions.</p>' +
        '</div>';
      return;
    }

    var sliced = filtered.slice(0, state.visibleLimit);
    var groups = {};
    var groupOrder = [];

    sliced.forEach(function (item) {
      var key = state.groupMode === 'year'
        ? (item.year ? String(item.year) : 'Undated')
        : item.topic;
      if (!groups[key]) {
        groups[key] = [];
        groupOrder.push(key);
      }
      groups[key].push(item);
    });

    if (state.groupMode === 'year') {
      groupOrder.sort(function (a, b) {
        return (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0);
      });
    }

    var queryTrimmed = state.query.trim();

    var groupIndex = 0;
    var html = groupOrder
      .map(function (groupName) {
        groupIndex += 1;
        var items = groups[groupName].slice().sort(function (a, b) {
          return b.year - a.year;
        });

        var itemsHtml = items
          .map(function (item) {
            var isWritten = writtenSet.has(item.id);
            var isBm = bmSet.has(item.id);

            return (
              '<article class="pyq-item' + (isWritten ? ' is-written' : '') + '" data-qid="' + escapeHtml(item.id) + '" tabindex="-1">' +
                '<div class="pyq-top">' +
                  (item.year ? '<span class="tag tag--year">' + item.year + '</span>' : '') +
                  '<span class="tag">' + escapeHtml(item.subject) + '</span>' +
                  (state.groupMode === 'year' ? '<span class="tag">' + escapeHtml(item.topic) + '</span>' : '') +
                  (item.marks ? '<span class="tag">' + escapeHtml(item.marks) + '</span>' : '') +
                '</div>' +
                '<p class="pyq-text">' + highlightText(item.text, queryTrimmed) + '</p>' +
                '<div class="pyq-actions">' +
                  '<button type="button" class="action-toggle' + (isWritten ? ' is-written-on' : '') + '" ' +
                    'data-action="written" data-id="' + escapeHtml(item.id) + '" aria-pressed="' + String(isWritten) + '">' +
                    (isWritten ? '✓ Answer written' : '○ Mark answer written') +
                  '</button>' +
                  '<button type="button" class="action-toggle' + (isBm ? ' is-bookmark-on' : '') + '" ' +
                    'data-action="bookmark" data-id="' + escapeHtml(item.id) + '" aria-pressed="' + String(isBm) + '">' +
                    (isBm ? '★ Bookmarked' : '☆ Bookmark') +
                  '</button>' +
                '</div>' +
              '</article>'
            );
          })
          .join('');

        var writtenInGroup = items.filter(function (item) {
          return writtenSet.has(item.id);
        }).length;
        var groupPct = items.length ? Math.round((writtenInGroup / items.length) * 100) : 0;
        var groupId = 'mains-group-' + groupIndex;

        return (
          '<section class="mains-group" data-group>' +
            '<div class="mains-group-head">' +
              '<button type="button" class="group-toggle" aria-expanded="true" aria-controls="' + groupId + '">' +
                '<svg class="group-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                  '<polyline points="7 5 13 10 7 15"></polyline>' +
                '</svg>' +
                '<h2 class="mains-group-title">' + escapeHtml(groupName) + '</h2>' +
              '</button>' +
              '<div class="mains-group-meta">' +
                '<span class="group-progress">' +
                  '<strong data-group-written>' + writtenInGroup + '</strong>/' + items.length + ' written' +
                '</span>' +
                '<span class="meter group-meter" aria-hidden="true">' +
                  '<span class="meter-fill" data-group-meter style="width:' + groupPct + '%"></span>' +
                '</span>' +
              '</div>' +
            '</div>' +
            '<div class="mains-group-items" id="' + groupId + '">' + itemsHtml + '</div>' +
          '</section>'
        );
      })
      .join('');

    if (filtered.length > state.visibleLimit) {
      var remaining = filtered.length - state.visibleLimit;
      html +=
        '<div class="load-more-wrap">' +
          '<button type="button" class="btn btn-secondary" id="mains-load-more">' +
            'Load more (' + remaining + ' remaining)' +
          '</button>' +
        '</div>';
    }

    listEl.innerHTML = html;

    updateFiltersMeta();
    applyDensity();

    var loadMoreBtn = document.getElementById('mains-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        state.visibleLimit += PAGE_SIZE;
        renderList();
      });
    }
  }

  /* --- NEW: density, collapsible groups and j/k navigation -------------- */
  var density = 'comfortable';

  function applyDensity() {
    var listEl = document.getElementById('mains-list');
    if (listEl) listEl.classList.toggle('is-compact', density === 'compact');
  }

  function refreshGroupProgress(groupEl) {
    if (!groupEl) return;
    var items = groupEl.querySelectorAll('.pyq-item');
    var done = groupEl.querySelectorAll('.pyq-item.is-written').length;
    var pct = items.length ? Math.round((done / items.length) * 100) : 0;
    var label = groupEl.querySelector('[data-group-written]');
    var meter = groupEl.querySelector('[data-group-meter]');
    if (label) label.textContent = String(done);
    if (meter) meter.style.width = pct + '%';
  }

  function initPanelToggle() {
    var btn = document.querySelector('[data-panel-toggle]');
    var panel = document.getElementById('mains-filters-panel');
    if (!btn || !panel) return;

    var wide = window.matchMedia('(min-width: 768px)');

    function sync() {
      var open = btn.getAttribute('aria-expanded') === 'true';
      panel.classList.toggle('is-open', open);
    }

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      sync();
    });

    /* Desktop opens with the panel already expanded; phones start compact */
    btn.setAttribute('aria-expanded', String(wide.matches));
    sync();
  }

  function initDensity() {
    var buttons = document.querySelectorAll('[data-density]');
    if (!buttons.length) return;
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        density = btn.getAttribute('data-density') === 'compact' ? 'compact' : 'comfortable';
        Array.prototype.forEach.call(buttons, function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        applyDensity();
      });
    });
  }

  /* j / k moves the reading cursor down and up the visible question list */
  function initKeyNav() {
    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || event.target.isContentEditable) return;
      if (event.key !== 'j' && event.key !== 'k') return;

      var items = document.querySelectorAll('#mains-list .pyq-item');
      if (!items.length) return;

      var current = document.activeElement;
      var idx = Array.prototype.indexOf.call(items, current);
      var next = event.key === 'j' ? (idx < 0 ? 0 : idx + 1) : (idx <= 0 ? 0 : idx - 1);
      if (next >= items.length) next = items.length - 1;
      event.preventDefault();
      items[next].focus();
      if (items[next].scrollIntoView) {
        items[next].scrollIntoView({ block: 'center' });
      }
    });
  }

  function initMains() {
    var listEl = document.getElementById('mains-list');
    allQuestions = normalizeQuestions();

    if (!allQuestions.length) {
      if (listEl) {
        listEl.innerHTML =
          '<div class="empty-state">' +
            '<h3>Mains PYQ data not loaded yet</h3>' +
            '<p>Add <code>data/mains-data.js</code> and reload this page.</p>' +
          '</div>';
      }
      return;
    }

    populateDropdowns();

    /* Deep link used by the Home subject cube and chips:
       mains-pyqs/index.html?paper=GS%20Paper%20II */
    try {
      var params = new URLSearchParams(window.location.search);
      var paperParam = params.get('paper');
      var subjectSelect = document.getElementById('mains-subject');
      if (paperParam && subjectSelect) {
        var matched = Array.prototype.filter.call(subjectSelect.options, function (opt) {
          return opt.value === paperParam;
        });
        if (matched.length) {
          state.subject = paperParam;
          subjectSelect.value = paperParam;
          populateTopicDropdown();
        }
      }
    } catch (e) {
      /* No URLSearchParams: ignore the deep link */
    }

    updateHeaderStats();
    renderList();
    initPanelToggle();
    initDensity();
    initKeyNav();

    var subjectSel = document.getElementById('mains-subject');
    var topicSel = document.getElementById('mains-topic');
    var yearFromSel = document.getElementById('mains-year-from');
    var yearToSel = document.getElementById('mains-year-to');
    var searchInput = document.getElementById('mains-search');
    var resetBtn = document.getElementById('mains-reset');

    if (subjectSel) {
      subjectSel.addEventListener('change', function () {
        state.subject = subjectSel.value;
        state.visibleLimit = PAGE_SIZE;
        populateTopicDropdown();
        renderList();
      });
    }

    if (topicSel) {
      topicSel.addEventListener('change', function () {
        state.topic = topicSel.value;
        state.visibleLimit = PAGE_SIZE;
        renderList();
      });
    }

    if (yearFromSel) {
      yearFromSel.addEventListener('change', function () {
        state.yearFrom = parseInt(yearFromSel.value, 10) || 2013;
        state.visibleLimit = PAGE_SIZE;
        renderList();
      });
    }

    if (yearToSel) {
      yearToSel.addEventListener('change', function () {
        state.yearTo = parseInt(yearToSel.value, 10) || 2026;
        state.visibleLimit = PAGE_SIZE;
        renderList();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          state.query = searchInput.value || '';
          state.visibleLimit = PAGE_SIZE;
          renderList();
        }, 150);
      });
    }

    var statusBtns = document.querySelectorAll('[data-mains-status]');
    statusBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.status = btn.getAttribute('data-mains-status') || 'all';
        state.visibleLimit = PAGE_SIZE;
        statusBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderList();
      });
    });

    var groupBtns = document.querySelectorAll('[data-group-mode]');
    groupBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.groupMode = btn.getAttribute('data-group-mode') || 'topic';
        groupBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderList();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.subject = 'all';
        state.topic = 'all';
        state.query = '';
        state.status = 'all';
        state.groupMode = 'topic';
        state.visibleLimit = PAGE_SIZE;
        if (subjectSel) subjectSel.value = 'all';
        populateTopicDropdown();
        if (searchInput) searchInput.value = '';
        if (yearFromSel && yearFromSel.options.length) {
          yearFromSel.selectedIndex = 0;
          state.yearFrom = parseInt(yearFromSel.value, 10);
        }
        if (yearToSel && yearToSel.options.length) {
          yearToSel.selectedIndex = 0;
          state.yearTo = parseInt(yearToSel.value, 10);
        }
        statusBtns.forEach(function (b) {
          var active = b.getAttribute('data-mains-status') === 'all';
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        groupBtns.forEach(function (b) {
          var active = b.getAttribute('data-group-mode') === 'topic';
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderList();
      });
    }

    /* Collapsible groups */
    if (listEl) {
      listEl.addEventListener('click', function (event) {
        var toggle = event.target.closest('.group-toggle');
        if (!toggle) return;
        var group = toggle.closest('.mains-group');
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        if (group) group.classList.toggle('is-collapsed', open);
      });
    }

    /* Bookmark & Written Action Delegation */
    if (listEl) {
      listEl.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-action]');
        if (!btn || !window.StudyStorage) return;
        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (!id) return;

        if (action === 'written') {
          var on = window.StudyStorage.toggleInSet(window.StudyStorage.KEYS.mainsWritten, id);
          btn.classList.toggle('is-written-on', on);
          btn.setAttribute('aria-pressed', String(on));
          btn.textContent = on ? '✓ Answer written' : '○ Mark answer written';
          var card = btn.closest('.pyq-item');
          if (card) card.classList.toggle('is-written', on);
          refreshGroupProgress(btn.closest('.mains-group'));
          updateHeaderStats();
          if (state.status === 'written' || state.status === 'unwritten') renderList();
        } else if (action === 'bookmark') {
          var bmOn = window.StudyStorage.toggleInSet(window.StudyStorage.KEYS.mainsBookmarks, id);
          btn.classList.toggle('is-bookmark-on', bmOn);
          btn.setAttribute('aria-pressed', String(bmOn));
          btn.textContent = bmOn ? '★ Bookmarked' : '☆ Bookmark';
          updateHeaderStats();
          if (state.status === 'bookmarked') renderList();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMains);
  } else {
    initMains();
  }
})();