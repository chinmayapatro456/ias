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
    region: 'all',      /* region filter from the interactive India map */
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

    /* Same number the Home desk inventory shows: StudyCounts derives it from
       window.PYQ_DATA.questions, the same array rendered below. */
    var sharedTotal =
      window.StudyCounts && typeof window.StudyCounts.optionalQuestions === 'function'
        ? window.StudyCounts.optionalQuestions()
        : allQuestions.length;
    if (totalEl) totalEl.textContent = sharedTotal.toLocaleString('en-IN') + ' questions';
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

  /* Region filter: a question belongs to a region when its text names one of
     that region's places or physical features (keyword list lives in
     assets/js/india-map.js, generated with the map geometry). */
  function regionZone(id) {
    var map = window.INDIA_MAP;
    if (!map || !Array.isArray(map.zones)) return null;
    for (var i = 0; i < map.zones.length; i++) {
      if (map.zones[i].id === id) return map.zones[i];
    }
    return null;
  }

  function matchesRegion(questionText, zone) {
    if (!zone) return true;
    var text = String(questionText || '').toLowerCase();
    return zone.keywords.some(function (kw) {
      return text.indexOf(kw) !== -1;
    });
  }

  function getFilteredQuestions() {
    var attSet = getAttemptedSet();
    var bmSet = getBookmarkSet();
    var qStr = state.query.trim().toLowerCase();
    var zone = state.region === 'all' ? null : regionZone(state.region);

    return getPaperAndYearPool()
      .filter(function (q) {
        if (state.topic !== 'all' && q.topic !== state.topic) return false;
        if (zone && !matchesRegion(q.text, zone)) return false;
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

    var reduceMotion =
      window.StudyMotion && typeof window.StudyMotion.prefersReducedMotion === 'function'
        ? window.StudyMotion.prefersReducedMotion()
        : false;

    /* Stacked rows: full topic name above the bar, count right-aligned on the
       same line, bar underneath. Nothing is truncated at any width. */
    var rowsHtml = topics
      .map(function (topic) {
        var c = counts[topic] || 0;
        var pct = maxCount ? Math.round((c / maxCount) * 100) : 0;
        var isActive = state.topic === topic;

        return (
          '<button type="button" class="freq-row' + (isActive ? ' is-active' : '') + '" ' +
            'data-chart-topic="' + escapeHtml(topic) + '" ' +
            'aria-pressed="' + String(isActive) + '" ' +
            'aria-label="Filter by ' + escapeHtml(topic) + ' (' + c + ' questions)">' +
            '<span class="freq-row-head">' +
              '<span class="freq-label">' + escapeHtml(topic) + '</span>' +
              '<span class="freq-count">' + c + '</span>' +
            '</span>' +
            '<span class="freq-bar-track" aria-hidden="true">' +
              '<span class="freq-bar-fill" style="width:' + (reduceMotion ? pct : 0) + '%"></span>' +
            '</span>' +
          '</button>'
        );
      })
      .join('');

    wrap.innerHTML = '<div class="freq-list" role="group" aria-label="Topic frequency bar chart">' +
      rowsHtml + '</div>';

    if (!reduceMotion) {
      requestAnimationFrame(function () {
        wrap.querySelectorAll('.freq-row').forEach(function (row, i) {
          var bar = row.querySelector('.freq-bar-fill');
          var topic = row.getAttribute('data-chart-topic');
          var pct = maxCount ? Math.round(((counts[topic] || 0) / maxCount) * 100) : 0;
          setTimeout(function () {
            bar.style.width = pct + '%';
          }, Math.min(i * 18, 220));
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
    syncMapCard();
    renderList();
    updateFiltersMeta();
  }

  /* ---- Interactive region map -------------------------------------------
     Regions are unions of states. Selecting one filters the list to questions
     whose text names a place or physical feature of that region.
     --------------------------------------------------------------------- */
  var mapBuilt = false;

  function zoneCounts() {
    var pool = getPaperAndYearPool();
    var counts = {};
    var map = window.INDIA_MAP;
    if (!map) return counts;
    map.zones.forEach(function (zone) {
      counts[zone.id] = pool.filter(function (q) {
        return matchesRegion(q.text, zone);
      }).length;
    });
    return counts;
  }

  function syncMapCard() {
    var card = document.getElementById('opt-map-card');
    if (!card) return;

    /* Mapping questions live in Paper II — the map only applies there */
    var applicable = state.paper !== 'Paper I';
    card.hidden = !applicable;

    if (!applicable) {
      if (state.region !== 'all') {
        state.region = 'all';
      }
      return;
    }

    if (!mapBuilt) buildMap();

    var counts = zoneCounts();
    var map = window.INDIA_MAP;

    if (map && Array.isArray(map.zones)) {
      map.zones.forEach(function (zone) {
        var path = card.querySelector('.zone[data-zone="' + zone.id + '"]');
        var label = zone.name + ' — ' + (counts[zone.id] || 0) + ' questions';
        if (path) {
          path.setAttribute('aria-pressed', String(state.region === zone.id));
          path.setAttribute('aria-label', label);
          path.setAttribute('data-label', label);
        }
        var btn = document.getElementById('opt-zone-' + zone.id);
        if (btn) {
          btn.classList.toggle('is-active', state.region === zone.id);
          btn.setAttribute('aria-pressed', String(state.region === zone.id));
          var countEl = btn.querySelector('.legend-btn-count');
          if (countEl) countEl.textContent = counts[zone.id] || 0;
        }
      });
    }

    var resetBtn = document.getElementById('opt-map-reset');
    if (resetBtn) resetBtn.hidden = state.region === 'all';
  }

  function setRegion(id) {
    state.region = state.region === id ? 'all' : id;
    state.visibleLimit = PAGE_SIZE;
    renderAll();
  }

  function buildMap() {
    var svg = document.getElementById('opt-map-svg');
    var legend = document.getElementById('opt-map-legend');
    var map = window.INDIA_MAP;
    if (!svg || !legend || !map) return;

    svg.setAttribute('viewBox', map.viewBox);

    var zonesHtml = map.zones
      .map(function (zone) {
        return (
          '<path class="zone" data-zone="' + zone.id + '" d="' + zone.d + '" ' +
            'role="button" tabindex="0" aria-pressed="false" aria-label="' + escapeHtml(zone.name) + '"></path>'
        );
      })
      .join('');

    var bordersHtml = map.borders
      .map(function (d) {
        return '<path d="' + d + '"></path>';
      })
      .join('');

    svg.innerHTML =
      '<g class="zone-layer">' + zonesHtml + '</g>' +
      '<g class="zone-borders" aria-hidden="true">' + bordersHtml + '</g>';

    legend.innerHTML = map.zones
      .map(function (zone) {
        return (
          '<button type="button" class="legend-btn" id="opt-zone-' + zone.id + '" ' +
            'data-legend-zone="' + zone.id + '" aria-pressed="false">' +
            '<span>' + escapeHtml(zone.name) + '</span>' +
            '<span class="legend-btn-count">0</span>' +
          '</button>'
        );
      })
      .join('');

    /* Region selection: pointer, keyboard and legend buttons */
    svg.addEventListener('click', function (event) {
      var zoneEl = event.target.closest('[data-zone]');
      if (zoneEl) setRegion(zoneEl.getAttribute('data-zone'));
    });

    svg.addEventListener('keydown', function (event) {
      var zoneEl = event.target.closest('[data-zone]');
      if (!zoneEl) return;
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        setRegion(zoneEl.getAttribute('data-zone'));
      }
    });

    legend.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-legend-zone]');
      if (btn) setRegion(btn.getAttribute('data-legend-zone'));
    });

    /* Hover tooltip (desktop) and tap tooltip (touch) */
    var tooltip = document.getElementById('opt-map-tooltip');
    var figure = svg.parentElement;

    function showTip(zoneEl, clientX, clientY) {
      if (!tooltip) return;
      var label = zoneEl.getAttribute('data-label') || zoneEl.getAttribute('aria-label');
      tooltip.textContent = label;
      var box = figure.getBoundingClientRect();
      tooltip.style.left = (clientX - box.left) + 'px';
      tooltip.style.top = (clientY - box.top) + 'px';
      tooltip.classList.add('is-visible');
    }

    function hideTip() {
      if (tooltip) tooltip.classList.remove('is-visible');
    }

    svg.addEventListener('pointermove', function (event) {
      var zoneEl = event.target.closest('[data-zone]');
      if (zoneEl) showTip(zoneEl, event.clientX, event.clientY);
      else hideTip();
    });

    svg.addEventListener('pointerleave', hideTip);
    svg.addEventListener('focusin', function (event) {
      var zoneEl = event.target.closest('[data-zone]');
      if (zoneEl) {
        var r = zoneEl.getBoundingClientRect();
        showTip(zoneEl, r.left + r.width / 2, r.top + 12);
      }
    });
    svg.addEventListener('focusout', hideTip);

    var mapReset = document.getElementById('opt-map-reset');
    if (mapReset) {
      mapReset.addEventListener('click', function () {
        state.region = 'all';
        state.visibleLimit = PAGE_SIZE;
        renderAll();
      });
    }

    mapBuilt = true;
  }

  /* Compact summary shown on the collapsed Filters button (Android) */
  function updateFiltersMeta() {
    var meta = document.getElementById('opt-filters-meta');
    if (!meta) return;
    var bits = [];
    bits.push(state.topic === 'all' ? 'all topics' : state.topic);
    if (state.region !== 'all') {
      var zone = regionZone(state.region);
      if (zone) bits.push(zone.name);
    }
    if (state.minYear > datasetMinYear) bits.push('from ' + state.minYear);
    meta.textContent = ' · ' + bits.join(' · ');
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
        state.region = 'all';
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