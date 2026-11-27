/* ==========================================================================
   LocalStorage Persistence & JSON Export/Import — Chinmaya Patro Study Desk
   Centralizes all browser-local study progress under namespaced keys.
   ========================================================================== */

(function () {
  'use strict';

  var KEYS = {
    syllabusCovered: 'cp_syllabus_covered',
    mainsWritten: 'cp_mains_written',
    mainsBookmarks: 'cp_mains_bookmarks',
    optionalAttempted: 'cp_optional_attempted',
    optionalBookmarks: 'cp_optional_bookmarks',
    prelimsState: 'cp_prelims_state',
    /* Additive: the light/dark choice. Existing keys above are untouched. */
    theme: 'cp_theme',
    /* Additive: CSAT Practice attempts, bookmarks and wrong-answer history. */
    csatState: 'cp_csat_state'
  };

  function defaultPrelimsState() {
    return {
      attempts: [],
      bookmarks: [],
      wrongIds: [],
      topicStats: {},
      streak: { count: 0, lastDate: null }
    };
  }

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function readKey(key, fallback) {
    try {
      return safeParse(window.localStorage.getItem(key), fallback);
    } catch (e) {
      return fallback;
    }
  }

  function writeKey(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function readSet(key) {
    var arr = readKey(key, []);
    return Array.isArray(arr) ? arr : [];
  }

  function toggleInSet(key, id) {
    var list = readSet(key);
    var strId = String(id);
    var idx = list.indexOf(strId);
    var active;
    if (idx === -1) {
      list.push(strId);
      active = true;
    } else {
      list.splice(idx, 1);
      active = false;
    }
    writeKey(key, list);
    return active;
  }

  function hasInSet(key, id) {
    return readSet(key).indexOf(String(id)) !== -1;
  }

  /* Prelims State Helpers */
  function getPrelimsState() {
    var raw = readKey(KEYS.prelimsState, null);
    var base = defaultPrelimsState();
    if (!raw) return base;
    return {
      attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
      bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks : [],
      wrongIds: Array.isArray(raw.wrongIds) ? raw.wrongIds : [],
      topicStats: raw.topicStats && typeof raw.topicStats === 'object' ? raw.topicStats : {},
      streak:
        raw.streak && typeof raw.streak === 'object'
          ? { count: Number(raw.streak.count) || 0, lastDate: raw.streak.lastDate || null }
          : { count: 0, lastDate: null }
    };
  }

  function savePrelimsState(nextState) {
    return writeKey(KEYS.prelimsState, nextState);
  }

  /* CSAT State Helpers — same shape as the Prelims state, separate key. */
  function defaultCsatState() {
    return { attempts: [], bookmarks: [], wrongIds: [], topicStats: {} };
  }

  function getCsatState() {
    var raw = readKey(KEYS.csatState, null);
    var base = defaultCsatState();
    if (!raw) return base;
    return {
      attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
      bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks : [],
      wrongIds: Array.isArray(raw.wrongIds) ? raw.wrongIds : [],
      topicStats: raw.topicStats && typeof raw.topicStats === 'object' ? raw.topicStats : {}
    };
  }

  function saveCsatState(nextState) {
    return writeKey(KEYS.csatState, nextState);
  }

  function todayIsoLocal() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function yesterdayIsoLocal() {
    var now = new Date();
    now.setDate(now.getDate() - 1);
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function updateStreak(streakObj) {
    var today = todayIsoLocal();
    var yesterday = yesterdayIsoLocal();
    if (streakObj.lastDate === today) {
      return streakObj;
    }
    if (streakObj.lastDate === yesterday) {
      return { count: (streakObj.count || 0) + 1, lastDate: today };
    }
    return { count: 1, lastDate: today };
  }

  /* Export & Import All Progress as JSON */
  function exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      syllabusCovered: readSet(KEYS.syllabusCovered),
      mainsWritten: readSet(KEYS.mainsWritten),
      mainsBookmarks: readSet(KEYS.mainsBookmarks),
      optionalAttempted: readSet(KEYS.optionalAttempted),
      optionalBookmarks: readSet(KEYS.optionalBookmarks),
      prelimsState: getPrelimsState(),
      csatState: getCsatState()
    };
  }

  function importAll(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid backup file.');
    }
    if (Array.isArray(payload.syllabusCovered)) {
      writeKey(KEYS.syllabusCovered, payload.syllabusCovered.map(String));
    }
    if (Array.isArray(payload.mainsWritten)) {
      writeKey(KEYS.mainsWritten, payload.mainsWritten.map(String));
    }
    if (Array.isArray(payload.mainsBookmarks)) {
      writeKey(KEYS.mainsBookmarks, payload.mainsBookmarks.map(String));
    }
    if (Array.isArray(payload.optionalAttempted)) {
      writeKey(KEYS.optionalAttempted, payload.optionalAttempted.map(String));
    }
    if (Array.isArray(payload.optionalBookmarks)) {
      writeKey(KEYS.optionalBookmarks, payload.optionalBookmarks.map(String));
    }
    if (payload.prelimsState && typeof payload.prelimsState === 'object') {
      var merged = Object.assign(defaultPrelimsState(), payload.prelimsState);
      writeKey(KEYS.prelimsState, merged);
    }
    if (payload.csatState && typeof payload.csatState === 'object') {
      var mergedCsat = Object.assign(defaultCsatState(), payload.csatState);
      writeKey(KEYS.csatState, mergedCsat);
    }
    return true;
  }

  function clearAll() {
    Object.keys(KEYS).forEach(function (k) {
      try {
        window.localStorage.removeItem(KEYS[k]);
      } catch (e) {
        /* Ignore storage errors */
      }
    });
  }

  window.StudyStorage = {
    KEYS: KEYS,
    getSet: readSet,
    hasInSet: hasInSet,
    toggleInSet: toggleInSet,
    setList: function (key, arr) {
      return writeKey(key, Array.isArray(arr) ? arr : []);
    },
    getPrelimsState: getPrelimsState,
    savePrelimsState: savePrelimsState,
    getCsatState: getCsatState,
    saveCsatState: saveCsatState,
    updateStreak: updateStreak,
    exportAll: exportAll,
    importAll: importAll,
    clearAll: clearAll
  };
})();
