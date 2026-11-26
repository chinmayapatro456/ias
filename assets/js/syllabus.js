/* ==========================================================================
   Syllabus Tracker Logic — Chinmaya Patro UPSC Study Desk
   Tabs (Prelims / Mains / Optional), search, collapsible topic tree,
   localStorage coverage ticks, and live per-paper SVG progress rings.
   ========================================================================== */

(function () {
  'use strict';

  var RING_RADIUS = 28;
  var RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  var state = {
    stageId: 'prelims',
    query: '',
    status: 'all'
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function highlightMatch(text, query) {
    var safe = escapeHtml(text);
    if (!query) return safe;
    var escapedQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return safe.replace(new RegExp('(' + escapedQ + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) {
      return safe;
    }
  }

  function getCoveredSet() {
    var arr = window.StudyStorage
      ? window.StudyStorage.getSet(window.StudyStorage.KEYS.syllabusCovered)
      : [];
    return new Set(arr);
  }

  function getAllTopicsInPaper(paper) {
    var list = [];
    (paper.units || []).forEach(function (u) {
      (u.topics || []).forEach(function (t) {
        list.push(t);
      });
    });
    return list;
  }

  function updateOverallSummary(data, coveredSet) {
    var total = 0;
    var covered = 0;
    (data.stages || []).forEach(function (stage) {
      (stage.papers || []).forEach(function (paper) {
        getAllTopicsInPaper(paper).forEach(function (t) {
          total += 1;
          if (coveredSet.has(String(t.id))) covered += 1;
        });
      });
    });

    var pct = total ? Math.round((covered / total) * 100) : 0;
    var badge = document.getElementById('overall-badge');
    var pctEl = document.getElementById('overall-pct');
    if (badge) badge.textContent = covered + ' / ' + total + ' topics covered';
    if (pctEl) pctEl.textContent = pct + '% complete overall';
  }

  function renderRings(stage, coveredSet) {
    var container = document.getElementById('syllabus-rings');
    if (!container) return;

    var html = (stage.papers || [])
      .map(function (paper) {
        var topics = getAllTopicsInPaper(paper);
        var total = topics.length;
        var done = topics.filter(function (t) {
          return coveredSet.has(String(t.id));
        }).length;
        var pct = total ? Math.round((done / total) * 100) : 0;
        var offset = RING_CIRCUMFERENCE * (1 - pct / 100);
        var completeClass = total > 0 && done === total ? ' is-complete' : '';

        return (
          '<article class="card ring-card' + completeClass + '" data-ring-paper="' + escapeHtml(paper.id) + '">' +
            '<div class="ring-wrap" aria-hidden="true">' +
              '<svg class="ring-svg" viewBox="0 0 68 68">' +
                '<circle class="ring-track" cx="34" cy="34" r="' + RING_RADIUS + '"></circle>' +
                '<circle class="ring-fill" cx="34" cy="34" r="' + RING_RADIUS + '" ' +
                  'stroke-dasharray="' + RING_CIRCUMFERENCE.toFixed(2) + '" ' +
                  'stroke-dashoffset="' + offset.toFixed(2) + '"></circle>' +
              '</svg>' +
              '<span class="ring-pct">' + pct + '%</span>' +
            '</div>' +
            '<div class="ring-info">' +
              '<span class="ring-code">' + escapeHtml(paper.code || paper.id) + '</span>' +
              '<h3 class="ring-title">' + escapeHtml(paper.title) + '</h3>' +
              '<p class="ring-count">' + done + ' of ' + total + ' topics covered</p>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    container.innerHTML = html;
  }

  function renderTree(stage, coveredSet) {
    var container = document.getElementById('syllabus-tree');
    if (!container) return;

    var q = state.query.trim().toLowerCase();
    var renderedPapers = [];

    (stage.papers || []).forEach(function (paper) {
      var unitHtmlParts = [];

      (paper.units || []).forEach(function (unit, unitIdx) {
        var allUnitTopics = unit.topics || [];
        var unitDone = allUnitTopics.filter(function (t) {
          return coveredSet.has(String(t.id));
        }).length;

        var filtered = allUnitTopics.filter(function (t) {
          var isCov = coveredSet.has(String(t.id));
          if (state.status === 'covered' && !isCov) return false;
          if (state.status === 'pending' && isCov) return false;
          if (q) {
            var hay = (unit.title + ' ' + t.title).toLowerCase();
            if (hay.indexOf(q) === -1) return false;
          }
          return true;
        });

        if (!filtered.length) return;

        var shouldOpen = Boolean(q) || unitIdx === 0;
        var itemsHtml = filtered
          .map(function (t) {
            var tid = String(t.id);
            var isCov = coveredSet.has(tid);
            return (
              '<li class="topic-row' + (isCov ? ' is-covered' : '') + '">' +
                '<label class="topic-label">' +
                  '<input type="checkbox" class="topic-checkbox" data-topic-id="' + escapeHtml(tid) + '" ' +
                    'data-paper-id="' + escapeHtml(paper.id) + '" ' +
                    'data-unit-id="' + escapeHtml(unit.id) + '"' + (isCov ? ' checked' : '') + '>' +
                  '<span class="topic-text">' + highlightMatch(t.title, state.query.trim()) + '</span>' +
                '</label>' +
              '</li>'
            );
          })
          .join('');

        unitHtmlParts.push(
          '<details class="unit-details" data-unit-box="' + escapeHtml(unit.id) + '"' + (shouldOpen ? ' open' : '') + '>' +
            '<summary class="unit-summary">' +
              '<span class="unit-summary-left">' +
                '<svg class="unit-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                  '<polyline points="7 5 13 10 7 15"></polyline>' +
                '</svg>' +
                '<span class="unit-title">' + highlightMatch(unit.title, state.query.trim()) + '</span>' +
              '</span>' +
              '<span class="unit-count" data-unit-count="' + escapeHtml(unit.id) + '">' + unitDone + ' / ' + allUnitTopics.length + '</span>' +
            '</summary>' +
            '<ul class="topic-list">' + itemsHtml + '</ul>' +
          '</details>'
        );
      });

      if (!unitHtmlParts.length) return;

      renderedPapers.push(
        '<article class="card paper-block">' +
          '<div class="paper-head">' +
            '<h2>' + escapeHtml(paper.title) + '</h2>' +
            '<div class="paper-meta">' +
              '<span class="tag tag--accent">' + escapeHtml(paper.code || '') + '</span>' +
              (paper.marks ? '<span class="tag">' + escapeHtml(paper.marks) + '</span>' : '') +
            '</div>' +
          '</div>' +
          unitHtmlParts.join('') +
        '</article>'
      );
    });

    if (!renderedPapers.length) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<h3>No matching topics</h3>' +
          '<p>Try a different keyword or switch the status filter back to <strong>All</strong>.</p>' +
        '</div>';
      return;
    }

    container.innerHTML = renderedPapers.join('');
  }

  function getActiveStage(data) {
    var stages = data.stages || [];
    for (var i = 0; i < stages.length; i++) {
      if (stages[i].id === state.stageId) return stages[i];
    }
    return stages[0] || null;
  }

  function renderAll(data) {
    var stage = getActiveStage(data);
    if (!stage) return;
    var coveredSet = getCoveredSet();
    updateOverallSummary(data, coveredSet);
    renderRings(stage, coveredSet);
    renderTree(stage, coveredSet);
  }

  function initSyllabus() {
    var data = window.SYLLABUS_DATA;
    var treeEl = document.getElementById('syllabus-tree');

    if (!data || !Array.isArray(data.stages) || !data.stages.length) {
      if (treeEl) {
        treeEl.innerHTML =
          '<div class="empty-state">' +
            '<h3>Syllabus data not loaded yet</h3>' +
            '<p>Generate <code>data/syllabus-data.js</code> using the conversion script and reload this page.</p>' +
          '</div>';
      }
      return;
    }

    /* Stage Tabs */
    var tabButtons = document.querySelectorAll('#stage-tabs [data-stage]');
    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nextStage = btn.getAttribute('data-stage');
        if (!nextStage || nextStage === state.stageId) return;
        state.stageId = nextStage;
        tabButtons.forEach(function (b) {
          b.setAttribute('aria-selected', String(b === btn));
        });
        renderAll(data);
      });
    });

    /* Search Input */
    var searchInput = document.getElementById('syllabus-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.query = searchInput.value || '';
        renderTree(getActiveStage(data), getCoveredSet());
      });
    }

    /* Status Filter Chips */
    var statusBtns = document.querySelectorAll('[data-status-filter]');
    statusBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.status = btn.getAttribute('data-status-filter') || 'all';
        statusBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        renderTree(getActiveStage(data), getCoveredSet());
      });
    });

    /* Expand / Collapse All */
    var expandBtn = document.getElementById('btn-expand-all');
    var collapseBtn = document.getElementById('btn-collapse-all');
    if (expandBtn && treeEl) {
      expandBtn.addEventListener('click', function () {
        treeEl.querySelectorAll('details.unit-details').forEach(function (d) {
          d.open = true;
        });
      });
    }
    if (collapseBtn && treeEl) {
      collapseBtn.addEventListener('click', function () {
        treeEl.querySelectorAll('details.unit-details').forEach(function (d) {
          d.open = false;
        });
      });
    }

    /* Checkbox Delegation */
    if (treeEl) {
      treeEl.addEventListener('change', function (event) {
        var box = event.target;
        if (!box || !box.classList.contains('topic-checkbox')) return;
        var tid = box.getAttribute('data-topic-id');
        if (!tid || !window.StudyStorage) return;

        var nowCovered = window.StudyStorage.toggleInSet(
          window.StudyStorage.KEYS.syllabusCovered,
          tid
        );

        var row = box.closest('.topic-row');
        if (row) row.classList.toggle('is-covered', nowCovered);

        var coveredSet = getCoveredSet();
        var stage = getActiveStage(data);
        updateOverallSummary(data, coveredSet);
        renderRings(stage, coveredSet);

        /* Update unit count badge in place */
        var unitId = box.getAttribute('data-unit-id');
        if (unitId) {
          var unitCountEl = treeEl.querySelector('[data-unit-count="' + unitId + '"]');
          if (unitCountEl && stage) {
            (stage.papers || []).forEach(function (p) {
              (p.units || []).forEach(function (u) {
                if (u.id === unitId) {
                  var done = (u.topics || []).filter(function (t) {
                    return coveredSet.has(String(t.id));
                  }).length;
                  unitCountEl.textContent = done + ' / ' + (u.topics || []).length;
                }
              });
            });
          }
        }

        if (state.status !== 'all') {
          renderTree(stage, coveredSet);
        }
      });
    }

    renderAll(data);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSyllabus);
  } else {
    initSyllabus();
  }
})();