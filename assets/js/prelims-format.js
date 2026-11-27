/* ==========================================================================
   Prelims question presentation — Chinmaya Patro UPSC Study Desk
   The PYQ bank stores every stem as one flat string: statements, table cells
   and the closing "Select the answer using the code given below :" line all
   run together in a single paragraph. This module rebuilds the layout the
   paper actually printed:

     - a lead line ("Consider the following statements :")
     - statements I. / II. / III. or 1. / 2. / 3. as a marker list
     - "Consider the following pairs" as a two-column table
     - "Match List I with List II" as a two-column table plus the code row
     - explicit "|" tables (Sl. No. | Committee | Objective ...) as a table
     - Assertion (A) / Reason (R) and Statement-I / Statement-II on their own
       lines
     - the ask line and the code footer set apart from the statements
     - "3 1 2 4" style answer codes as lettered columns

   It only reads the text; the data file is untouched.
   ========================================================================== */

(function () {
  'use strict';

  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  var ASK_WORDS =
    'Which|In which|In how many|How many|Select|Choose|What|Match|Identify|Arrange|' +
    'Based on the above|Now consider|The correct|Consider the following';

  var LABEL_RE =
    /(?:^|\s)(Statement\s*-?\s*(?:I{1,3}|IV|V|VI|VII|VIII)\s*:|Assertion\s*\(A\)\s*:|Reason\s*\(R\)\s*:)/g;

  /* A list marker only starts a list where a list can start: at the very
     beginning, or after a sentence terminator, a colon or a closing bracket.
     Without this, "statement I. Next sentence" would look like a marker. */
  var ANCHOR_BEFORE = /[.:;?!)]$/;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* One flat line: the source PDF lost its newlines, so collapse runs of
     whitespace before anything else. */
  function flat(str) {
    return String(str == null ? '' : str).replace(/\s+/g, ' ').trim();
  }

  /* Markers -------------------------------------------------------------- */

  function markerValue(marker, style) {
    if (style === 'roman') return ROMAN.indexOf(marker) + 1;
    if (style === 'letter') return marker.charCodeAt(0) - 64;
    return parseInt(marker, 10);
  }

  function findMarkers(text) {
    var out = [];
    /* "I. India", "1) He/She", "(A) Natrajan", "(i) Urban Micro Enterprises" */
    var re = /(^|[\s:;])(?:\(([ivx]{1,4})\)|\(?((?:[IVX]{1,4})|(\d{1,2})|([A-H]))([.)]))\s/g;
    var m;

    while ((m = re.exec(text)) !== null) {
      var start = m.index + m[1].length;
      var pre = text.charAt(start) === '(' ? '(' : '';

      var marker = m[2] || m[3];
      var style = m[2] ? 'roman' : m[4] ? 'num' : m[5] ? 'letter' : 'roman';
      var sep = m[2] ? ')' : m[6];
      var before = text.slice(0, start).replace(/\s+$/, '');

      out.push({
        start: start,
        textStart: re.lastIndex,
        pre: pre,
        marker: marker,
        sep: sep,
        style: style,
        value: markerValue(marker.toUpperCase(), style),
        anchor: !before || ANCHOR_BEFORE.test(before)
      });

      /* Resume just after the closing dot/bracket, so "statement II. 2." still
         offers "2." to the scanner. */
      re.lastIndex = start + pre.length + marker.length + 1;
    }
    return out;
  }

  function markerText(it) {
    return (it.pre || '') + it.marker + (it.sep || '.');
  }

  /* A run is a marker sequence that starts at 1/I/A after a real list break
     and counts up without a gap — "I. II. III." or "1. 2. 3.". Anything else
     is prose. Two shapes start without that break: a "pairs" list, which
     begins straight after its column labels ("... pairs : Plant : Description
     I. Cassava : Woody shrub"), and a statement list whose lead sentence runs
     into the first statement ("... a treaty that 1. limits ... 2. ..."). The
     second only counts when at least two markers follow in sequence, so an
     "Article 1. ... Article 2." in prose cannot open one. A gap of one or two
     numbers is kept inside a run that is already open: the source PDF loses
     the odd statement, and the list still reads correctly with the numbers
     the paper printed. */
  function buildRuns(text) {
    var runs = [];
    var cur = null;
    var marks = findMarkers(text);

    marks.forEach(function (c, i) {
      var startsHere = c.anchor && c.value === 1;

      if (!startsHere && c.value === 1 && c.style !== 'letter') {
        var next = i + 1 < marks.length ? marks[i + 1].start : text.length;
        if (/\s[:—–]\s/.test(text.slice(c.textStart, next))) {
          startsHere = true;
        } else {
          /* Look a few markers ahead: a sentence ending in a number
             ("... face 6. 2. ...") also reads as a marker. */
          var seq = 1;
          var misses = 0;
          for (var k = i + 1; k < marks.length && seq < 2 && misses < 4; k++) {
            if (marks[k].style !== c.style) continue;
            if (marks[k].value === seq + 1) {
              seq += 1;
              misses = 0;
            } else {
              misses += 1;
            }
          }
          startsHere = seq >= 2;
        }
      }

      if (startsHere) {
        cur = { style: c.style, items: [c] };
        runs.push(cur);
      } else if (cur && cur.style === c.style) {
        var prev = cur.items[cur.items.length - 1].value;
        var gap = c.value - prev;
        /* A missing number is only tolerated after a finished sentence, so a
           number inside a sentence ("... the face 5. 3. ...") stays text. */
        if (gap === 1) cur.items.push(c);
        else if (gap > 1 && gap <= 3 && /[.?!:;]$/.test(text.slice(0, c.start).replace(/\s+$/, ''))) {
          cur.items.push(c);
        }
      }
    });

    return runs.filter(function (r) {
      return r.items.length >= 2;
    });
  }

  /* Splits the tail of a statement list into the statement itself, the ask
     line and the code footer. */
  function splitTail(body) {
    var footer = '';
    var fm = body.match(/\bSelect the answer using the code given below[^?]*[:?]?\s*$/i);
    if (fm) {
      footer = flat(fm[0]);
      body = body.slice(0, fm.index);
    }

    var ask = '';
    if (/\?\s*$/.test(flat(body))) {
      /* Prefer a boundary after a sentence terminator ... */
      var re = new RegExp('(?:[.?!:]\\s+)(?=(?:' + ASK_WORDS + '))', 'g');
      var last = -1;
      var m;
      while ((m = re.exec(body)) !== null) {
        last = m.index + m[0].length;
      }

      /* ... and fall back to the bare ask phrase when a statement ended
         without any punctuation at all. */
      if (last <= 0) {
        var plain = new RegExp('\\b(?:' + ASK_WORDS + ')\\b', 'g');
        var found = -1;
        while ((m = plain.exec(body)) !== null) found = m.index;
        if (found > 0) last = found;
      }

      if (last > 0) {
        var candidate = flat(body.slice(last));
        if (candidate.length >= 12) {
          ask = candidate;
          body = body.slice(0, last);
        }
      }
    }

    return { head: flat(body), ask: ask, footer: footer };
  }

  /* Blocks --------------------------------------------------------------- */

  function labelledLines(text) {
    var marks = [];
    var m;
    LABEL_RE.lastIndex = 0;
    while ((m = LABEL_RE.exec(text)) !== null) {
      marks.push({ at: m.index + m[0].length - m[1].length, label: flat(m[1]) });
      LABEL_RE.lastIndex = m.index + m[0].length;
    }
    if (marks.length < 2) return null;

    var pieces = [];
    if (marks[0].at > 0) {
      pieces.push({ label: '', text: flat(text.slice(0, marks[0].at)) });
    }
    marks.forEach(function (mark, i) {
      var from = mark.at + mark.label.length;
      var to = i + 1 < marks.length ? marks[i + 1].at : text.length;
      pieces.push({ label: mark.label, text: flat(text.slice(from, to)) });
    });

    return pieces.filter(function (p) {
      return p.text;
    });
  }

  function paragraphsHtml(text) {
    var labelled = labelledLines(text);
    if (labelled) {
      return labelled
        .map(function (p) {
          return (
            '<p class="q-line">' +
            (p.label ? '<span class="q-line-label">' + esc(p.label) + '</span> ' : '') +
            esc(p.text) +
            '</p>'
          );
        })
        .join('');
    }
    return '<p class="q-para">' + esc(text) + '</p>';
  }

  function textBlockHtml(text) {
    var t = splitTail(text);
    var out = '';
    if (t.head) out += paragraphsHtml(t.head);
    if (t.ask) out += '<p class="q-ask">' + esc(t.ask) + '</p>';
    if (t.footer) out += '<p class="q-foot">' + esc(t.footer) + '</p>';
    return out;
  }

  function listHtml(items) {
    return (
      '<ol class="q-list">' +
      items
        .map(function (it) {
          return (
            '<li><span class="q-marker">' + esc(markerText(it)) + '</span>' +
            '<span class="q-item-text">' + esc(it.text) + '</span></li>'
          );
        })
        .join('') +
      '</ol>'
    );
  }

  function tableHtml(headers, rows, opts) {
    opts = opts || {};
    var html =
      '<div class="q-table-wrap"><table class="q-table' +
      (opts.className ? ' ' + opts.className : '') +
      '">';

    if (headers && headers.length) {
      html +=
        '<thead><tr>' +
        headers
          .map(function (h) {
            return '<th scope="col">' + esc(h) + '</th>';
          })
          .join('') +
        '</tr></thead>';
    }

    html +=
      '<tbody>' +
      rows
        .map(function (row) {
          var cells = row.cells
            .map(function (cell, i) {
              var marker = i === 0 && row.marker
                ? '<span class="q-marker">' + esc(row.marker) + '</span> '
                : '';
              return '<td>' + marker + esc(cell) + '</td>';
            })
            .join('');
          if (row.serial) cells = '<td class="q-cell-num">' + esc(row.serial) + '</td>' + cells;
          return '<tr>' + cells + '</tr>';
        })
        .join('') +
      '</tbody></table></div>';

    return html;
  }

  function codeRowHtml(code) {
    return '<p class="q-foot q-code">' + esc(code) + '</p>';
  }

  /* "Consider the following pairs : Plant : Description" + items ---------- */

  /* Pairs are printed either as "Peak : Range" or as "Peak — Range". */
  var PAIR_SEP = /\s+(?::|—|–)\s+/;

  function pairsTableHtml(leadText, items) {
    var rows = items.map(function (it) {
      var parts = it.text.split(PAIR_SEP);
      if (parts.length < 2) return null;
      return {
        marker: markerText(it),
        cells: [parts[0], parts.slice(1).join(' : ')]
      };
    });

    if (rows.some(function (r) { return !r; })) return null;

    var intro = leadText;
    var headers = null;
    var parts = leadText.split(PAIR_SEP);
    if (parts.length >= 3) {
      headers = parts.slice(-2);
      intro = parts.slice(0, -2).join(' : ') + ' :';
    }

    var html = intro ? '<p class="q-para">' + esc(intro) + '</p>' : '';
    html += tableHtml(headers, rows, { className: 'q-table--pairs' });
    return html;
  }

  /* Match List I with List II -------------------------------------------- */

  /* The list header is the mention followed by its label in brackets; failing
     that, the last plain mention. "List-I" / "List - I" are both printed. */
  function lastIndexMatching(text, roman) {
    /* Prefer a header with a real label — "List I (Persons)" — over one
       followed by a list marker, "(A)". */
    var at = -1;
    var m;
    var label = new RegExp('List\\s*-?\\s*' + roman + '\\s*\\((?!\\s*[A-Z]\\s*\\))', 'g');
    while ((m = label.exec(text)) !== null) at = m.index;
    if (at !== -1) return at;

    var plain = new RegExp('List\\s*-?\\s*' + roman + '\\b', 'g');
    while ((m = plain.exec(text)) !== null) {
      if (m.index > at) at = m.index;
    }
    return at;
  }

  function matchListHtml(text) {
    if (!/\bmatch\b/i.test(text)) return null;

    var hI = lastIndexMatching(text, 'I');
    var hII = lastIndexMatching(text, 'II');
    if (hI === -1 || hII === -1 || hII <= hI) return null;

    var intro = flat(text.slice(0, hI));
    var segI = text.slice(hI, hII);
    var segII = text.slice(hII);

    var code = '';
    var cm = segII.match(/\bCodes?\s*:\s*(.+)$/i);
    if (cm) {
      code = flat('Code : ' + cm[1]);
      segII = segII.slice(0, cm.index);
    }

    function readList(seg) {
      var all = findMarkers(seg);
      var first = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].value === 1) {
          first = all[i];
          break;
        }
      }
      if (!first) return null;

      /* Only markers of the list's own shape count — same style, same bracket
         — so "(A) B. P. Mishra" keeps the initial and "V. Thulasidas" stays
         inside a list numbered (A), (B), (C). */
      var marks = all.filter(function (mk) {
        return mk.style === first.style && mk.pre === first.pre && mk.sep === first.sep;
      });
      var start = marks.indexOf(first);

      /* Accept only the next number in the sequence; skip anything else, so an
         initial ("John C. Mather") is never mistaken for the next item. */
      var accepted = [first];
      for (var j = start + 1; j < marks.length; j++) {
        if (marks[j].value === accepted[accepted.length - 1].value + 1) accepted.push(marks[j]);
      }

      var header = flat(seg.slice(0, first.start));
      var items = accepted.map(function (mk, i) {
        var end = i + 1 < accepted.length ? accepted[i + 1].start : seg.length;
        return { pre: mk.pre, marker: mk.marker, sep: mk.sep, text: flat(seg.slice(mk.textStart, end)) };
      });
      return { header: header, items: items };
    }

    var a = readList(segI);
    var b = readList(segII);
    if (!a || !b || a.items.length < 2 || b.items.length < 2) return null;

    var rows = [];
    var n = Math.min(a.items.length, b.items.length);
    for (var i = 0; i < n; i++) {
      rows.push({
        marker: markerText(a.items[i]),
        cells: [a.items[i].text, b.items[i].text]
      });
    }

    var html = intro ? '<p class="q-para">' + esc(intro) + '</p>' : '';
    html += tableHtml([a.header, b.header], rows, { className: 'q-table--match' });
    if (code) html += codeRowHtml(code);
    return html;
  }

  /* Explicit "|" tables -------------------------------------------------- */

  var CELL_MARK = '((?:[IVX]{1,4})|\\d{1,2})';

  /* One cell can hold the end of a header row, a row marker and the start of
     the next row ("It works under I. Directorate of Enforcement"), so it is
     split into the pieces a table needs. */
  function splitCell(raw) {
    var cell = raw;
    var after = null;
    var ma = cell.match(new RegExp('\\s+' + CELL_MARK + '\\.$'));
    if (ma) {
      after = ma[1];
      cell = cell.slice(0, ma.index);
    }

    var mb = cell.match(new RegExp('^' + CELL_MARK + '\\.(?:\\s+|$)'));
    if (mb) {
      return [{ text: flat(cell.slice(mb[0].length)), before: mb[1], after: after }];
    }

    var mm = cell.match(new RegExp('(^|\\s)' + CELL_MARK + '\\.\\s'));
    var lead = mm ? cell.slice(0, mm.index) : '';
    var isLeadIn = /following|Consider|Select|Which of|In how many|How many/i.test(lead);
    if (mm && mm.index <= 160 && !isLeadIn) {
      return [
        { text: flat(cell.slice(0, mm.index)) },
        { text: flat(cell.slice(mm.index + mm[0].length)), before: mm[2], after: after }
      ];
    }

    return [{ text: flat(cell), before: null, after: after }];
  }

  function pipeTableHtml(text) {
    var cells = text.split(/\s*\|\s*/);
    if (cells.length < 4) return null;

    var pieces = [];
    cells.forEach(function (c) {
      splitCell(c).forEach(function (p) {
        pieces.push(p);
      });
    });

    var groups = [];
    var cur = null;
    pieces.forEach(function (p) {
      if (p.before) {
        if (cur) groups.push(cur);
        cur = { cells: [] };
      } else if (!cur) {
        cur = { cells: [] };
      }
      if (p.text) cur.cells.push(p.text);
      if (p.after) {
        groups.push(cur);
        cur = null;
      }
    });
    if (cur) groups.push(cur);

    if (groups.length < 2) return null;

    var header = groups[0].cells.slice();
    var data = groups.slice(1).filter(function (g) {
      return g.cells.length;
    });
    if (!data.length || header.length < 2) return null;

    /* The intro line is glued to the first header cell. */
    var intro = '';
    if (/\s:\s/.test(header[0])) {
      var parts = header[0].split(/\s+:\s+/);
      if (parts.length >= 2 && parts[0].split(' ').length >= 4) {
        intro = parts.slice(0, -1).join(' : ') + ' :';
        header[0] = parts[parts.length - 1];
      }
    }

    /* Every row must agree with the header, or the pipes were not a table. */
    var cols = data[0].cells.length;
    var consistent = data.every(function (g) {
      return g.cells.length === cols;
    });
    if (!consistent || (header.length !== cols && header.length !== cols + 1)) return null;

    var serial = header.length === cols + 1;
    var headers = serial ? header.slice(1) : header.slice(0, cols);
    if (serial) headers = [header[0] || 'No.'].concat(headers);

    var rows = data.map(function (g, i) {
      var rowCells = g.cells.slice(0, cols);
      while (rowCells.length < cols) rowCells.push('');
      return { cells: rowCells, serial: serial ? String(i + 1) : '' };
    });

    /* A trailing question often rides along in the last cell. */
    var lastRow = rows[rows.length - 1];
    var tail = splitTail(lastRow.cells[cols - 1]);
    if (tail.ask || tail.footer) lastRow.cells[cols - 1] = tail.head;

    var html = intro ? '<p class="q-para">' + esc(intro) + '</p>' : '';
    html += tableHtml(headers, rows, { className: 'q-table--rows' });
    if (tail.ask) html += '<p class="q-ask">' + esc(tail.ask) + '</p>';
    if (tail.footer) html += '<p class="q-foot">' + esc(tail.footer) + '</p>';
    return html;
  }

  /* Generic stem: lead + marker lists + ask + footer ---------------------- */

  function genericHtml(text) {
    var runs = buildRuns(text);
    if (!runs.length) return textBlockHtml(text);

    var out = '';
    var cursor = 0;

    for (var r = 0; r < runs.length; r++) {
      var run = runs[r];
      var runEnd = r + 1 < runs.length ? runs[r + 1].items[0].start : text.length;

      /* Text between the previous list and this one: usually the lead line,
         or the ask line sitting between two lists. */
      var before = splitTail(run.items[0].start > cursor ? text.slice(cursor, run.items[0].start) : '');

      var items = [];
      var tail = { head: '', ask: '', footer: '' };

      run.items.forEach(function (it, i) {
        var end = i + 1 < run.items.length ? run.items[i + 1].start : runEnd;
        var body = text.slice(it.textStart, end);
        if (i === run.items.length - 1) {
          tail = splitTail(body);
          body = tail.head;
        }
        body = flat(body);
        if (body) items.push({ pre: it.pre, marker: it.marker, sep: it.sep, text: body });
      });

      /* "Consider the following pairs" is a two-column table, not a list. */
      var asTable = before.head && /following pairs/i.test(before.head)
        ? pairsTableHtml(before.head, items)
        : null;

      if (asTable) {
        out += asTable;
      } else {
        if (before.head) out += paragraphsHtml(before.head);
        out += listHtml(items);
      }

      if (before.ask) out += '<p class="q-ask">' + esc(before.ask) + '</p>';
      if (before.footer) out += '<p class="q-foot">' + esc(before.footer) + '</p>';
      if (tail.ask) out += '<p class="q-ask">' + esc(tail.ask) + '</p>';
      if (tail.footer) out += '<p class="q-foot">' + esc(tail.footer) + '</p>';

      cursor = runEnd;
    }

    if (cursor < text.length) out += textBlockHtml(text.slice(cursor));
    return out;
  }

  /* Public --------------------------------------------------------------- */

  function stem(text) {
    var t = flat(text);
    if (!t) return '';

    var ml = matchListHtml(t);
    if (ml) return ml;

    var pt = pipeTableHtml(t);
    if (pt) return pt;

    /* A stray pipe with no rows behind it ("(Indian Army Corps) |
       (Headquarters)") reads as two column labels. */
    t = t.replace(/\s\|\s/g, ' / ');
    return genericHtml(t);
  }

  function option(text) {
    var t = flat(text);
    var code = t.match(/^\d(\s+\d){2,}$/);
    if (code) {
      var nums = t.split(/\s+/);
      return (
        '<span class="option-code">' +
        nums
          .map(function (n, i) {
            return (
              '<span class="option-code-cell">' +
              '<span class="option-code-head">' + String.fromCharCode(65 + i) + '</span>' +
              '<span class="option-code-num">' + esc(n) + '</span>' +
              '</span>'
            );
          })
          .join('') +
        '</span>'
      );
    }
    return esc(t);
  }

  window.PrelimsFormat = { stem: stem, option: option };
})();
