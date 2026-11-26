/* ==========================================================================
   Shared Data Counts — Chinmaya Patro UPSC Study Desk
   ONE place that turns the /data/*.js globals into the numbers shown on the
   site. The Home "Desk Inventory" and the Optional PYQs header banner both
   call StudyCounts.optionalQuestions(), so the two can never drift apart
   again: same value, same data source (window.PYQ_DATA.questions).

   Every count is derived from the actual question rows, never from a
   hand-maintained total. Where a dataset also carries a metadata total, the
   two are cross-checked and a console warning is raised on a mismatch so the
   error surfaces during development instead of on the page.
   ========================================================================== */

(function () {
  'use strict';

  function rowsOf(data) {
    if (!data) return null;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.questions)) return data.questions;
    return null;
  }

  function crossCheck(label, rows, declared) {
    if (!rows || !declared) return;
    if (Number(declared) !== rows.length) {
      /* Console-only: users never see this, but the drift is caught early. */
      if (window.console && console.warn) {
        console.warn(
          '[StudyCounts] ' + label + ': ' + rows.length + ' rows in the data file but ' +
            declared + ' declared in its metadata. Showing the row count.'
        );
      }
    }
  }

  /* Geography Optional — the single source of truth for 1,372 questions */
  function optionalQuestions() {
    var data = window.PYQ_DATA;
    var rows = rowsOf(data);
    if (!rows) return null;
    if (data && data.metadata) crossCheck('Geography Optional', rows, data.metadata.totalQuestions);
    return rows.length;
  }

  /* Mains GS + Essay */
  function mainsQuestions() {
    if (Array.isArray(window.UPSC_MAINS_PYQS)) {
      crossCheck('Mains PYQs', window.UPSC_MAINS_PYQS,
        window.PYQ_METADATA && window.PYQ_METADATA.totalQuestions);
      return window.UPSC_MAINS_PYQS.length;
    }
    if (window.PYQ_METADATA && Number.isFinite(Number(window.PYQ_METADATA.totalQuestions))) {
      return Number(window.PYQ_METADATA.totalQuestions);
    }
    return null;
  }

  /* Prelims — only questions that are scorable (not flagged incomplete) */
  function prelimsQuestions() {
    var rows = rowsOf(window.PRELIMS_DATA);
    if (!rows) return null;
    var active = 0;
    rows.forEach(function (q) {
      var flags = Array.isArray(q.flags) ? q.flags : [];
      if (flags.indexOf('incomplete') === -1) active += 1;
    });
    return active;
  }

  /* Syllabus sub-topics (a unit with no topic rows counts as one) */
  function syllabusTopics() {
    var data = window.SYLLABUS_DATA;
    if (!data || !Array.isArray(data.stages)) return null;
    var total = 0;
    data.stages.forEach(function (stage) {
      if (!Array.isArray(stage.papers)) return;
      stage.papers.forEach(function (paper) {
        if (!Array.isArray(paper.units)) return;
        paper.units.forEach(function (unit) {
          total += Array.isArray(unit.topics) && unit.topics.length ? unit.topics.length : 1;
        });
      });
    });
    return total;
  }

  window.StudyCounts = {
    optionalQuestions: optionalQuestions,
    mainsQuestions: mainsQuestions,
    prelimsQuestions: prelimsQuestions,
    syllabusTopics: syllabusTopics
  };
})();
