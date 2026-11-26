/* ==========================================================================
   Geography Optional PYQs Logic — Chinmaya Patro UPSC Study Desk
   Reads window.PYQ_DATA (Paper I & II topic order in metadata, Mapping,
   1986–2026). Renders animated SVG topic-frequency chart, topic chips,
   year slider, search, bookmarks, and "unattempted only" filter.
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SIZE = 100;

  var state = {
    paper: 'Paper I',
    topic: 'all',
    minYear: 1986,
    maxYear: 2026,
    query: '',
    unattemptedOnly: false,
    bookmarkedOnly: false,
    visibleLimit: PAGE_SIZE
  };

  var allQuestions = [];
  var topicOrderMap = {
    'Paper I': [],
    'Paper II': []
  };
  var datasetMinYear = 1986;
  var datasetMaxYear = 2026;
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

  function normalizePaper(rawPaper) {
    var s = String(rawPaper == null ? '' : rawPaper).trim().toLowerCase();
    if (s === '1' || s === 'i' || s === 'p1' || s.indexOf('paper 1') !== -1 || s === 'paper i') {
      return 'Paper I';
    }
    if (s === '2' || s === 'ii' || s === 'p2' || s.indexOf('paper 2') !== -1 || s === 'paper ii') {
      return 'Paper II';
    }
    return rawPaper ? String(rawPaper) : 'Paper I';
  }

  function extractTopicOrder(meta) {
    if (!meta || typeof meta !== 'object') return;
    var p1 = meta.paper1Topics || meta.paper1 || (meta.topics && meta.topics['Paper I']) || (meta.topicOrder && meta.topicOrder['Paper I']);
    var p2 = meta.paper2Topics || meta.paper2 || (meta.topics && meta.topics['Paper II']) || (meta.topicOrder && meta.topicOrder['Paper II']);
    if (Array.isArray(p1)) topicOrderMap['Paper I'] = p1.map(String);
    if (Array.isArray(p2)) topicOrderMap['Paper II'] = p2.map(String);
  }

  function normalizeData() {
    var raw = window.PYQ_DATA;
    if (!raw) return [];

    if (raw.metadata) extractTopicOrder(raw.metadata);
    var list = Array.isArray(raw) ? raw : Array.isArray(raw.questions) ? raw.questions : [];

    return list.map(function (q, idx) {
      var paper = normalizePaper(q.paper || q.paperNumber || q.section);
      var topic = String(q.topic || q.unit || q.category || 'General').trim();
      var year = parseInt(q.year, 10) || 0;
      var text = String(q.question || q.text || q.prompt || '').trim();
      var id = String(q.id || (paper.replace(/\s+/g, '') + '-' + year + '-' + idx));

      return {
        id: id,
        paper: paper,
        topic: topic,
        year: year,
        marks: q.marks || '',
        subtopic: q.subtopic || '',
        text: text,
        searchBlob: (paper + ' ' + topic + ' ' + (q.subtopic || '') + ' ' + year + ' ' + text).toLowerCase()
      };
    });
  }

  function getAttemptedSet() {
    return new Set(
      window.StudyStorage ? window.StudyStorage.getSet(window.StudyStorage.KEYS.optionalAttempted) : []
    );
  }

  function getBookmarkSet() {
    return new Set(
      window.StudyStorage ? window.StudyStorage.getSet(window.StudyStorage.KEYS.optionalBookmarks) : []
    );
  }

  function updateHeaderStats() {
    var totalEl = document.getElementById('opt-total-badge');
    var attEl = document.getElementById('opt-attempted-badge');
    var bmEl = document.getElementById('opt-bookmarked-badge');

    if (totalEl) totalEl.textContent = allQuestions.length.toLocaleString('en-IN') + ' questions';
    if (attEl) attEl.textContent = getAttemptedSet().size + ' attempted';
    if (bmEl) bmEl.textContent = getBookmarkSet().size + ' bookmarked';
  }

  function getOrderedTopicsForPaper(paper) {
    var present = new Set();
    allQuestions.forEach(function (q) {
      if (paper === 'all' || q.paper === paper) {
        present.add(q.topic);
      }
    });

    var order = [];
    if (paper === 'all') {
      order = topicOrderMap['Paper I'].concat(topicOrderMap['Paper II']);
    } else if (topicOrderMap[paper]) {
      order = topicOrderMap[paper].slice();
    }

    var ordered = [];
    order.forEach(function (t) {
      if (present.has(t) && ordered.indexOf(t) === -1) {
        ordered.push(t);
      }
    });
    Array.from(present)
      .sort()
      .forEach(function (t) {
        if (ordered.indexOf(t) === -1) ordered.push(t);
      });

    return ordered;
  }

  function getPaperAndYearPool() {
    return allQuestions.filter(function (q) {
      if (state.paper !== 'all' && q.paper !== state.paper) return false;
      if (q.year && (q.year < state.minYear || q.year > state.maxYear)) return false;
      return true;
    });
  }

  function getFilteredQuestions() {
    var attSet = getAttemptedSet();
    var bmSet = getBookmarkSet();
    var qStr = state.query.trim().toLowerCase();

    return getPaperAndYearPool()
      .filter(function (q) {
        if (state.topic !== 'all' && q.topic !== state.topic) return false;
        if (state.unattemptedOnly && attSet.has(q.id)) return false;
        if (state.bookmarkedOnly && !bmSet.has(q.id)) return false;
        if (qStr && q.searchBlob.indexOf(qStr) === -1) return false;
        return true;
      })
      .sort(function (a, b) {
        return b.year - a.year;
      });
  }

  /* Animated SVG Topic-Frequency Chart */
  function renderChart() {
    var wrap = document.getElementById('opt-chart-wrap');
    if (!wrap) return;

    var pool = getPaperAndYearPool();
    var topics = getOrderedTopicsForPaper(state.paper);
    if (!topics.length) {
      wrap.innerHTML = '<p class="muted">No topic data available for this selection.</p>';
      return;
    }

    var counts = {};
    topics.forEach(function (t) { counts[t] = 0; });
    pool.forEach(function (q) {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });

    var maxCount = Math.max.apply(
      null,
      topics.map(function (t) { return counts[t] || 0; }).concat([1])
    );

    /* Size the SVG to the space it actually has, so 1 user unit = 1 CSS pixel.
       Without this the 699-unit viewBox is squeezed into ~280px on a phone and
       the 12px labels render at ~5px, which is unreadable. */
    var hostWidth = wrap.clientWidth || (wrap.parentElement ? wrap.parentElement.clientWidth : 0) || 640;
    var compact = hostWidth < 560;
    var rowHeight = 30;
    var topPad = 8;
    var labelFont = compact ? 11 : 12;
    var countFont = compact ? 10 : 11.5;
    var labelWidth = compact
      ? Math.round(Math.min(140, Math.max(92, hostWidth * 0.42)))
      : 215;
    var countWidth = compact ? 28 : 48;
    var gutter = compact ? 8 : 16;
    var barMaxWidth = Math.max(64, Math.round(hostWidth - labelWidth - countWidth - gutter));
    var svgWidth = Math.round(labelWidth + barMaxWidth + countWidth + gutter);
    var svgHeight = topPad * 2 + topics.length * rowHeight;
    var labelBoxWidth = labelWidth - 8;

    /* Truncate labels by measured width, not by a guessed character count:
       Inter's capitals are wide enough that a count-based slice overflows the
       column on a phone and the first letter gets clipped. */
    var measureCtx = null;
    try {
      measureCtx = document.createElement('canvas').getContext('2d');
      if (measureCtx) {
        measureCtx.font = labelFont + 'px Inter, system-ui, -apple-system, sans-serif';
      }
    } catch (e) {
      measureCtx = null;
    }

    function fitLabel(text) {
      if (!measureCtx) {
        var budget = Math.max(9, Math.floor(labelBoxWidth / (labelFont * 0.58)));
        return text.length > budget ? text.slice(0, budget - 1) + '…' : text;
      }
      var limit = labelBoxWidth * 0.94; /* safety margin for font-loading races */
      if (measureCtx.measureText(text).width <= limit) return text;
      var cut = text;
      while (cut.length > 1 && measureCtx.measureText(cut + '…').width > limit) {
        cut = cut.slice(0, -1);
      }
      return cut.replace(/[\s,;:]+$/, '') + '…';
    }

    var reduceMotion =
      window.StudyMotion && typeof window.StudyMotion.prefersReducedMotion === 'function'
        ? window.StudyMotion.prefersReducedMotion()
        : false;

    var rowsHtml = topics
      .map(function (topic, i) {
        var c = counts[topic] || 0;
        var y = topPad + i * rowHeight;
        var barW = Math.max(c > 0 ? 4 : 0, Math.round((c / maxCount) * barMaxWidth));
        var isActive = state.topic === topic;
        var shortLabel = fitLabel(topic);

        return (
          '<g class="freq-row' + (isActive ? ' is-active' : '') + '" ' +
            'role="button" tabindex="0" data-chart-topic="' + escapeHtml(topic) + '" ' +
            'aria-label="Filter by ' + escapeHtml(topic) + ' (' + c + ' questions)">' +
            '<title>' + escapeHtml(topic) + ': ' + c + ' questions</title>' +
            '<text class="freq-label" style="font-size:' + labelFont + 'px" x="' + (labelWidth - 8) + '" y="' + (y + 18) + '" text-anchor="end">' +
              escapeHtml(shortLabel) +
            '</text>' +
            '<rect class="freq-bar-track" x="' + labelWidth + '" y="' + (y + 6) + '" width="' + barMaxWidth + '" height="16" rx="4"></rect>' +
            '<rect class="freq-bar-fill' + (reduceMotion ? '' : ' is-entering') + '" x="' + labelWidth + '" y="' + (y + 6) + '" width="' + barW + '" height="16" rx="4"></rect>' +
            '<text class="freq-count" style="font-size:' + countFont + 'px" x="' + (labelWidth + barMaxWidth + 6) + '" y="' + (y + 18) + '">' + c + '</text>' +
          '</g>'
        );
      })
      .join('');

    wrap.innerHTML =
      '<svg class="freq-svg" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" role="img" aria-label="Topic frequency bar chart">' +
        rowsHtml +
      '</svg>';

    if (!reduceMotion) {
      requestAnimationFrame(function () {
        wrap.querySelectorAll('.freq-bar-fill.is-entering').forEach(function (bar) {
          bar.classList.remove('is-entering');
        });
      });
    }
  }

  function renderTopicChips() {
    var chipsEl = document.getElementById('opt-topic-chips');
    if (!chipsEl) return;

    var pool = getPaperAndYearPool();
    var counts = {};
    pool.forEach(function (q) {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });

    var topics = getOrderedTopicsForPaper(state.paper);
    if (state.topic !== 'all' && topics.indexOf(state.topic) === -1) {
      state.topic = 'all';
    }

    var html =
      '<button type="button" class="chip' + (state.topic === 'all' ? ' is-active' : '') + '" ' +
        'data-topic-chip="all" aria-pressed="' + String(state.topic === 'all') + '">' +
        'All topics (' + pool.length + ')' +
      '</button>' +
      topics
        .map(function (t) {
          var active = state.topic === t;
          return (
            '<button type="button" class="chip' + (active ? ' is-active' : '') + '" ' +
              'data-topic-chip="' + escapeHtml(t) + '" aria-pressed="' + String(active) + '">' +
              escapeHtml(t) + ' (' + (counts[t] || 0) + ')' +
            '</button>'
          );
        })
        .join('');

    chipsEl.innerHTML = html;
  }

  function renderList() {
    var listEl = document.getElementById('opt-list');
    var metaEl = document.getElementById('opt-results-meta');
    if (!listEl) return;

    var filtered = getFilteredQuestions();
    var attSet = getAttemptedSet();
    var bmSet = getBookmarkSet();
    var qTrim = state.query.trim();

    if (metaEl) {
      metaEl.textContent =
        'Showing ' +
        Math.min(filtered.length, state.visibleLimit).toLocaleString('en-IN') +
        ' of ' +
        filtered.length.toLocaleString('en-IN') +
        ' Geography Optional question' +
        (filtered.length === 1 ? '' : 's') +
        ' (' +
        state.minYear +
        '–' +
        state.maxYear +
        ').';
    }

    if (!filtered.length) {
      listEl.innerHTML =
        '<div class="empty-state">' +
          '<h3>No Optional questions match these filters</h3>' +
          '<p>Move the year slider earlier, pick another topic chip, or reset your filters.</p>' +
        '</div>';
      return;
    }

    var sliced = filtered.slice(0, state.visibleLimit);
    var html = sliced
      .map(function (item) {
        var isAtt = attSet.has(item.id);
        var isBm = bmSet.has(item.id);

        return (
          '<article class="card opt-card' + (isAtt ? ' is-attempted' : '') + '">' +
            '<div class="opt-card-top">' +
              (item.year ? '<span class="tag tag--accent">' + item.year + '</span>' : '') +
              '<span class="tag tag--sky">' + escapeHtml(item.paper) + '</span>' +
              '<span class="tag">' + escapeHtml(item.topic) + '</span>' +
              (item.marks ? '<span class="tag">' + escapeHtml(item.marks) + '</span>' : '') +
            '</div>' +
            '<p class="opt-card-text">' + highlightText(item.text, qTrim) + '</p>' +
            '<div class="opt-card-actions">' +
              '<button type="button" class="action-toggle' + (isAtt ? ' is-attempted-on' : '') + '" ' +
                'data-action="attempted" data-id="' + escapeHtml(item.id) + '" aria-pressed="' + String(isAtt) + '">' +
                (isAtt ? '✓ Attempted' : '○ Mark attempted') +
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

    if (filtered.length > state.visibleLimit) {
      var remaining = filtered.length - state.visibleLimit;
      html +=
        '<div class="load-more-wrap">' +
          '<button type="button" class="btn btn-secondary" id="opt-load-more">' +
            'Load more (' + remaining + ' remaining)' +
          '</button>' +
        '</div>';
    }

    listEl.innerHTML = html;

    var loadBtn = document.getElementById('opt-load-more');
    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        state.visibleLimit += PAGE_SIZE;
        renderList();
      });
    }
  }

  function renderAll() {
    renderTopicChips();
    renderChart();
    renderList();
  }

  function selectTopic(topicName) {
    state.topic = state.topic === topicName && topicName !== 'all' ? 'all' : topicName;
    state.visibleLimit = PAGE_SIZE;
    renderAll();
  }

  function initOptional() {
    var listEl = document.getElementById('opt-list');
    allQuestions = normalizeData();

    if (!allQuestions.length) {
      if (listEl) {
        listEl.innerHTML =
          '<div class="empty-state">' +
            '<h3>Geography Optional PYQ data not loaded yet</h3>' +
            '<p>Add <code>data/optional-data.js</code> and reload this page.</p>' +
          '</div>';
      }
      return;
    }

    var years = allQuestions.map(function (q) { return q.year; }).filter(Boolean);
    if (years.length) {
      datasetMinYear = Math.min.apply(null, years);
      datasetMaxYear = Math.max.apply(null, years);
      state.minYear = datasetMinYear;
      state.maxYear = datasetMaxYear;
    }

    var slider = document.getElementById('opt-year-slider');
    var readout = document.getElementById('opt-year-readout');
    if (slider) {
      slider.min = String(datasetMinYear);
      slider.max = String(datasetMaxYear);
      slider.value = String(datasetMinYear);
    }
    if (readout) {
      readout.textContent = state.minYear + ' – ' + state.maxYear;
    }

    updateHeaderStats();
    renderAll();

    /* Paper Tabs */
    var paperTabs = document.querySelectorAll('#opt-paper-tabs [data-paper]');
    paperTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var nextPaper = tab.getAttribute('data-paper');
        if (!nextPaper || nextPaper === state.paper) return;
        state.paper = nextPaper;
        state.topic = 'all';
        state.visibleLimit = PAGE_SIZE;
        paperTabs.forEach(function (t) {
          t.setAttribute('aria-selected', String(t === tab));
        });
        renderAll();
      });
    });

    /* Year Slider */
    if (slider) {
      slider.addEventListener('input', function () {
        state.minYear = parseInt(slider.value, 10) || datasetMinYear;
        state.visibleLimit = PAGE_SIZE;
        if (readout) readout.textContent = state.minYear + ' – ' + state.maxYear;
        renderAll();
      });
    }

    /* Search */
    var searchInput = document.getElementById('opt-search');
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

    /* Unattempted & Bookmarked Checkboxes */
    var unattBox = document.getElementById('opt-unattempted-only');
    var bmBox = document.getElementById('opt-bookmarked-only');
    if (unattBox) {
      unattBox.addEventListener('change', function () {
        state.unattemptedOnly = unattBox.checked;
        state.visibleLimit = PAGE_SIZE;
        renderList();
      });
    }
    if (bmBox) {
      bmBox.addEventListener('change', function () {
        state.bookmarkedOnly = bmBox.checked;
        state.visibleLimit = PAGE_SIZE;
        renderList();
      });
    }

    /* Topic Chips Delegation */
    var chipsEl = document.getElementById('opt-topic-chips');
    if (chipsEl) {
      chipsEl.addEventListener('click', function (event) {
        var chip = event.target.closest('[data-topic-chip]');
        if (!chip) return;
        selectTopic(chip.getAttribute('data-topic-chip') || 'all');
      });
    }

    /* Chart Bar Click & Keyboard Delegation */
    var chartWrap = document.getElementById('opt-chart-wrap');
    if (chartWrap) {
      chartWrap.addEventListener('click', function (event) {
        var row = event.target.closest('[data-chart-topic]');
        if (!row) return;
        selectTopic(row.getAttribute('data-chart-topic'));
      });
      chartWrap.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        var row = event.target.closest('[data-chart-topic]');
        if (!row) return;
        event.preventDefault();
        selectTopic(row.getAttribute('data-chart-topic'));
      });
    }

    /* Chart Collapse Toggle */
    var chartToggle = document.getElementById('opt-chart-toggle');
    if (chartToggle && chartWrap) {
      chartToggle.addEventListener('click', function () {
        var collapsed = chartWrap.classList.toggle('is-collapsed');
        chartToggle.setAttribute('aria-expanded', String(!collapsed));
        chartToggle.textContent = collapsed ? 'Show chart' : 'Hide chart';
      });
    }

    /* Re-render the chart when its container changes width (window resize,
       phone rotation) so the labels keep their real pixel size */
    if (chartWrap) {
      var lastChartWidth = chartWrap.clientWidth;
      var chartResizeTimer = null;
      window.addEventListener('resize', function () {
        if (chartResizeTimer) clearTimeout(chartResizeTimer);
        chartResizeTimer = setTimeout(function () {
          var nextWidth = chartWrap.clientWidth;
          if (!nextWidth || Math.abs(nextWidth - lastChartWidth) < 24) return;
          lastChartWidth = nextWidth;
          renderChart();
        }, 150);
      });
    }

    /* Reset Filters */
    var resetBtn = document.getElementById('opt-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.topic = 'all';
        state.minYear = datasetMinYear;
        state.query = '';
        state.unattemptedOnly = false;
        state.bookmarkedOnly = false;
        state.visibleLimit = PAGE_SIZE;
        if (slider) slider.value = String(datasetMinYear);
        if (readout) readout.textContent = state.minYear + ' – ' + state.maxYear;
        if (searchInput) searchInput.value = '';
        if (unattBox) unattBox.checked = false;
        if (bmBox) bmBox.checked = false;
        renderAll();
      });
    }

    /* Question Card Action Delegation */
    if (listEl) {
      listEl.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-action]');
        if (!btn || !window.StudyStorage) return;
        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (!id) return;

        if (action === 'attempted') {
          var on = window.StudyStorage.toggleInSet(window.StudyStorage.KEYS.optionalAttempted, id);
          btn.classList.toggle('is-attempted-on', on);
          btn.setAttribute('aria-pressed', String(on));
          btn.textContent = on ? '✓ Attempted' : '○ Mark attempted';
          var card = btn.closest('.opt-card');
          if (card) card.classList.toggle('is-attempted', on);
          updateHeaderStats();
          if (state.unattemptedOnly) renderList();
        } else if (action === 'bookmark') {
          var bmOn = window.StudyStorage.toggleInSet(window.StudyStorage.KEYS.optionalBookmarks, id);
          btn.classList.toggle('is-bookmark-on', bmOn);
          btn.setAttribute('aria-pressed', String(bmOn));
          btn.textContent = bmOn ? '★ Bookmarked' : '☆ Bookmark';
          updateHeaderStats();
          if (state.bookmarkedOnly) renderList();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptional);
  } else {
    initOptional();
  }
})();