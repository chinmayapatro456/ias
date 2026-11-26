/* ==========================================================================
   About — charts and figures
   Reads window.ABOUT_DATA (data/about-data.js) and draws the funnel, the
   cut-off trend, the category bars, the vacancy chart and the service split.
   No dependencies: hand-built SVG, re-measured on resize so labels stay at
   their real pixel size on a phone.
   ========================================================================== */

(function () {
  "use strict";

  var D = window.ABOUT_DATA;
  if (!D) return;

  var NS = "http://www.w3.org/2000/svg";
  var charts = [];

  /* ---------- helpers ---------------------------------------------------- */

  function svg(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    if (attrs) {
      for (var key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
          node.setAttribute(key, attrs[key]);
        }
      }
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* 819732 -> "8,19,732" (Indian grouping) */
  function indian(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }

  function trimmed(n) {
    return String(n);
  }

  /* Round an axis domain up to readable steps (40, 60, 80 … not 57, 75, 94) */
  function niceStep(range, ticks) {
    var raw = range / ticks;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    return step * mag;
  }

  function niceDomain(lo, hi, ticks) {
    var step = niceStep(hi - lo, ticks);
    return {
      min: Math.floor(lo / step) * step,
      max: Math.ceil(hi / step) * step,
      step: step
    };
  }

  function tip(host) {
    var t = host.querySelector(".chart-tooltip");
    if (!t) {
      t = el("div", "chart-tooltip");
      t.setAttribute("role", "status");
      host.appendChild(t);
    }
    return t;
  }

  function showTip(host, x, y, html) {
    var t = tip(host);
    t.innerHTML = html;
    t.style.left = x + "px";
    t.style.top = y + "px";
    t.classList.add("is-on");
  }

  function hideTip(host) {
    var t = host.querySelector(".chart-tooltip");
    if (t) t.classList.remove("is-on");
  }

  /* Redraw on container resize (phone rotation, window drag) */
  function watch(host, draw) {
    charts.push({ host: host, draw: draw });
    draw();
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      charts.forEach(function (c) {
        var w = c.host.clientWidth;
        if (w && w !== c.lastWidth) {
          c.lastWidth = w;
          c.host.innerHTML = "";
          c.draw();
        }
      });
    }, 160);
  });

  /* ---------- 1. the funnel --------------------------------------------- */

  function renderFunnel() {
    var host = document.getElementById("about-funnel");
    if (!host) return;
    var stages = D.funnel.stages;
    var max = stages[0].value;
    var list = el("ol", "funnel");
    list.setAttribute("aria-label", "CSE " + D.funnel.year + " selection funnel");

    stages.forEach(function (s) {
      var li = el("li", "funnel-row");
      var head = el("div", "funnel-head");
      head.appendChild(el("span", "funnel-name", s.label));
      head.appendChild(el("span", "funnel-value", s.display));
      li.appendChild(head);

      var track = el("div", "funnel-track");
      var fill = el("div", "funnel-fill");
      /* Square-root scale: linear widths would make every stage after
         "Appeared" a one-pixel sliver. */
      fill.style.width = Math.max(1.4, Math.sqrt(s.value / max) * 100) + "%";
      track.appendChild(fill);
      li.appendChild(track);
      li.appendChild(el("span", "funnel-note", s.note));
      list.appendChild(li);
    });

    host.appendChild(list);
    var cap = el("p", "funnel-caption");
    cap.innerHTML =
      "Bar widths are square-root scaled so the small stages stay visible. " +
      "One in roughly <strong>" + indian(Math.round(D.funnel.stages[0].value / D.funnel.stages[4].value)) +
      "</strong> applicants reached the final list in CSE " + D.funnel.year + ".";
    host.appendChild(cap);
  }

  /* ---------- 2. cut-off trend ------------------------------------------ */

  function renderTrend(stageKey) {
    var host = document.getElementById("cutoff-trend");
    if (!host) return;
    var stage = D.trend.stages[stageKey];
    var years = D.trend.years;
    var vals = stage.values;

    host.innerHTML = "";

    var W = host.clientWidth || 680;
    var H = W < 520 ? 250 : 300;
    var pad = { t: 26, r: 16, b: 36, l: 44 };
    var iw = W - pad.l - pad.r;
    var ih = H - pad.t - pad.b;

    var lo = Math.min.apply(null, vals);
    var hi = Math.max.apply(null, vals);
    var span = Math.max(hi - lo, stage.max * 0.02);
    var dom = niceDomain(Math.max(0, lo - span * 0.5), Math.min(stage.max, hi + span * 0.4), 4);
    var yMin = dom.min;
    var yMax = dom.max;
    var yStep = dom.step;

    function x(i) {
      return pad.l + (iw * i) / (vals.length - 1);
    }
    function y(v) {
      return pad.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
    }

    var root = svg("svg", {
      viewBox: "0 0 " + W + " " + H,
      width: W,
      height: H,
      role: "img",
      "aria-label":
        "Line chart of the General-category " + stage.label + " cut-off from " +
        years[0] + " to " + years[years.length - 1] + ", " + stage.unit + "."
    });

    var defs = svg("defs", null, root);
    var grad = svg("linearGradient", { id: "trendFill", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    svg("stop", { offset: "0%", style: "stop-color: var(--accent); stop-opacity: .26" }, grad);
    svg("stop", { offset: "100%", style: "stop-color: var(--accent); stop-opacity: 0" }, grad);

    /* grid + y labels */
    for (var val = yMin; val <= yMax + 0.001; val += yStep) {
      var gy = y(val);
      svg("line", {
        x1: pad.l, y1: gy, x2: pad.l + iw, y2: gy, class: "chart-grid-line"
      }, root);
      var lab = svg("text", {
        x: pad.l - 8, y: gy + 3.5, "text-anchor": "end", class: "chart-axis-label"
      }, root);
      lab.textContent = Math.round(val);
    }

    svg("line", {
      x1: pad.l, y1: pad.t + ih, x2: pad.l + iw, y2: pad.t + ih, class: "chart-axis-line"
    }, root);

    /* x labels — every year when there is room, every other year on phones */
    var step = W < 520 ? 2 : 1;
    years.forEach(function (yr, i) {
      if (i % step !== 0 && i !== years.length - 1) return;
      var t = svg("text", {
        x: x(i), y: pad.t + ih + 18, "text-anchor": "middle", class: "chart-axis-label"
      }, root);
      t.textContent = String(yr);
      if (i === years.length - 1) t.classList.add("chart-axis-label--strong");
    });

    /* area + line */
    var dLine = vals.map(function (v, i) { return (i ? "L" : "M") + x(i) + " " + y(v); }).join(" ");
    var dArea = dLine + " L" + x(vals.length - 1) + " " + (pad.t + ih) + " L" + x(0) + " " + (pad.t + ih) + " Z";
    svg("path", { d: dArea, fill: "url(#trendFill)", stroke: "none" }, root);
    svg("path", {
      d: dLine,
      fill: "none",
      style: "stroke: var(--accent-cta)",
      "stroke-width": 2.2,
      "stroke-linejoin": "round",
      "stroke-linecap": "round"
    }, root);

    /* points + hover targets */
    vals.forEach(function (v, i) {
      var cx = x(i);
      var cy = y(v);
      var hitPoint = svg("circle", {
        cx: cx, cy: cy, r: 14, class: "chart-hit",
        tabindex: 0,
        role: "button",
        "aria-label": years[i] + ": " + v + " " + stage.unit
      }, root);
      hitPoint.addEventListener("mouseenter", onEnter);
      hitPoint.addEventListener("mouseleave", onLeave);
      hitPoint.addEventListener("focus", onEnter);
      hitPoint.addEventListener("blur", onLeave);

      function onEnter() {
        showTip(host, cx, cy - 6,
          "<strong>" + v + "</strong> · " + years[i] + "<br>" + stage.label + " cut-off, General");
      }
      function onLeave() {
        hideTip(host);
      }

      var last = i === vals.length - 1;
      svg("circle", {
        cx: cx, cy: cy, r: last ? 5 : 3.4,
        class: "chart-point",
        style: "fill: " + (last ? "var(--accent-cta)" : "var(--bg-card)") + "; stroke: var(--accent-cta); stroke-width: " + (last ? 2 : 1.8)
      }, root);

      if (last) {
        var vl = svg("text", {
          x: cx - 8, y: cy - 15, "text-anchor": "end", class: "chart-value"
        }, root);
        vl.textContent = v;
      }
    });

    host.appendChild(root);

    /* caption line under the chart */
    var foot = el("div", "chart-foot");
    var lastVal = vals[vals.length - 1];
    var prevVal = vals[vals.length - 2];
    var delta = +(lastVal - prevVal).toFixed(2);
    foot.innerHTML =
      "<span>" + stage.label + " cut-off, General category · " + stage.unit +
      " · <strong>" + years[years.length - 1] + ": " + lastVal + "</strong>" +
      " (" + (delta >= 0 ? "+" : "") + delta + " on " + years[years.length - 2] + ")</span>";
    host.appendChild(foot);
  }

  /* ---------- 3. category bars ------------------------------------------ */

  function renderCats(stageKey, year) {
    var host = document.getElementById("cutoff-cats");
    if (!host) return;
    var stage = D.categories.stages[stageKey];
    var vals = D.categories.values[year][stageKey];
    var names = D.categories.names;

    host.innerHTML = "";
    var list = el("ul", "cat-bars");
    list.setAttribute("aria-label", "Category-wise " + stage.label + " cut-off, CSE " + year);

    vals.forEach(function (v, i) {
      var row = el("li", "cat-row");
      row.appendChild(el("span", "cat-name", names[i]));

      var track = el("div", "cat-track");
      var fill = el("div", "cat-fill");
      fill.style.width = Math.max(3, (v / stage.max) * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);

      var val = el("span", "cat-value", trimmed(v));
      row.appendChild(val);
      list.appendChild(row);
    });

    host.appendChild(list);

    var foot = el("p", "chart-foot");
    foot.innerHTML = "<span>Bars are drawn against the full paper (" + stage.unit +
      "), not against the highest category.</span>";
    host.appendChild(foot);
  }

  /* ---------- 4. vacancies ---------------------------------------------- */

  function renderVacancies() {
    var host = document.getElementById("vacancy-chart");
    if (!host) return;
    host.innerHTML = "";

    var rows = D.vacancies;
    var W = host.clientWidth || 680;
    var H = W < 520 ? 260 : 300;
    var pad = { t: 24, r: 12, b: 34, l: 42 };
    var iw = W - pad.l - pad.r;
    var ih = H - pad.t - pad.b;

    var rawMax = 0;
    rows.forEach(function (r) {
      rawMax = Math.max(rawMax, r.final || r.notified || 0);
    });
    var vDom = niceDomain(0, rawMax, 4);
    var maxV = vDom.max;
    var vStep = vDom.step;

    var band = iw / rows.length;
    var barW = Math.min(14, band * 0.3);

    function y(v) { return pad.t + ih - (v / maxV) * ih; }

    var root = svg("svg", {
      viewBox: "0 0 " + W + " " + H,
      width: W,
      height: H,
      role: "img",
      "aria-label":
        "Bar chart of Civil Services vacancies and candidates recommended, " +
        rows[0].year + " to " + rows[rows.length - 1].year + "."
    });

    for (var val = 0; val <= maxV + 0.001; val += vStep) {
      svg("line", { x1: pad.l, y1: y(val), x2: pad.l + iw, y2: y(val), class: "chart-grid-line" }, root);
      var lab = svg("text", {
        x: pad.l - 8, y: y(val) + 3.5, "text-anchor": "end", class: "chart-axis-label"
      }, root);
      lab.textContent = indian(val);
    }
    svg("line", { x1: pad.l, y1: pad.t + ih, x2: pad.l + iw, y2: pad.t + ih, class: "chart-axis-line" }, root);

    rows.forEach(function (r, i) {
      var cx = pad.l + band * i + band / 2;
      var isLast = i === rows.length - 1;
      var hasFinal = r.final != null;

      var t = svg("text", {
        x: cx, y: pad.t + ih + 16, "text-anchor": "middle", class: "chart-axis-label"
      }, root);
      t.textContent = String(r.year).slice(2);
      if (isLast) t.classList.add("chart-axis-label--strong");

      if (hasFinal) {
        /* vacancies (behind) and recommended (in front), side by side */
        var vx = cx - barW - 1;
        var rx = cx + 1;
        svg("rect", {
          x: vx, y: y(r.final), width: barW, height: Math.max(1, pad.t + ih - y(r.final)),
          rx: 2, style: "fill: var(--st-mains-solid)", opacity: 0.5
        }, root);
        svg("rect", {
          x: rx, y: y(r.recommended), width: barW, height: Math.max(1, pad.t + ih - y(r.recommended)),
          rx: 2, style: "fill: var(--accent-cta)"
        }, root);

        var hit = svg("rect", {
          x: cx - band / 2, y: pad.t, width: band, height: ih,
          fill: "transparent", class: "chart-hit", tabindex: 0,
          "aria-label": "CSE " + r.year + ": " + r.final + " vacancies, " + r.recommended + " recommended"
        }, root);
        hit.addEventListener("mouseenter", enter);
        hit.addEventListener("focus", enter);
        hit.addEventListener("mouseleave", hideTip.bind(null, host));
        hit.addEventListener("blur", hideTip.bind(null, host));

        function enter() {
          showTip(host, cx, y(Math.max(r.final, r.recommended)) - 4,
            "<strong>" + r.year + "</strong><br>" + r.final + " vacancies<br>" +
            r.recommended + " recommended (" +
            Math.round((r.recommended / r.final) * 100) + "%)");
        }

        if (r.year === 2025) {
          var lbl = svg("text", {
            x: cx, y: y(r.final) - 6, "text-anchor": "middle", class: "chart-value"
          }, root);
          lbl.textContent = r.final;
        }
      } else {
        /* CSE 2026 — notified estimate only, drawn as an outline */
        var h = pad.t + ih - y(r.notified);
        svg("rect", {
          x: cx - barW, y: y(r.notified), width: barW * 2, height: Math.max(1, h),
          rx: 2, style: "fill: none; stroke: var(--ink-muted); stroke-width: 1.4; stroke-dasharray: 4 3"
        }, root);
        var nt = svg("text", {
          x: cx, y: y(r.notified) - 6, "text-anchor": "middle", class: "chart-value"
        }, root);
        nt.textContent = indian(r.notified);
      }
    });

    host.appendChild(root);

    var foot = el("div", "chart-foot");
    foot.innerHTML =
      '<ul class="chart-legend">' +
      '<li><span class="swatch" style="background:var(--st-mains-solid);opacity:.5"></span>Vacancies at the final result</li>' +
      '<li><span class="swatch swatch--prelims"></span>Candidates recommended</li>' +
      '<li><span class="swatch" style="background:transparent;border:1.4px dashed var(--ink-muted)"></span>2026: notified estimate, result awaited</li>' +
      "</ul>";
    host.appendChild(foot);
  }

  /* ---------- 5. service split ------------------------------------------ */

  function renderServices() {
    var host = document.getElementById("service-split");
    if (!host) return;
    var groups = D.services.groups;
    var total = D.services.total;
    var shades = [
      "var(--st-mains-solid)",
      "var(--st-optional-solid)",
      "var(--accent-cta)",
      "var(--sage-ink)",
      "var(--ink-muted)"
    ];

    var bar = el("div", "service-bar");
    bar.setAttribute("role", "img");
    bar.setAttribute(
      "aria-label",
      "CSE " + D.services.year + " vacancies by service: " +
        groups.map(function (g) { return g.name + " " + g.value; }).join(", ") +
        ", total " + total
    );

    var list = el("ul", "service-list");

    groups.forEach(function (g, i) {
      var seg = el("div", "service-seg", g.value);
      seg.style.flex = g.value + " 0 0";
      seg.style.background = shades[i % shades.length];
      seg.title = g.name + ": " + g.value;
      bar.appendChild(seg);

      var li = el("li");
      var sw = el("span", "swatch");
      sw.style.background = shades[i % shades.length];
      li.appendChild(sw);
      li.appendChild(el("span", null, g.name));
      li.appendChild(el("span", "service-count", indian(g.value)));
      list.appendChild(li);
    });

    host.appendChild(bar);
    host.appendChild(list);

    var note = el("p", "chart-foot");
    note.innerHTML = "<span>Total " + indian(total) +
      " · the IAS share has been exactly 180 in every cycle since 2015.</span>";
    host.appendChild(note);
  }

  /* ---------- tabs ------------------------------------------------------ */

  function wireTabs(tabsId, onPick) {
    var tabs = document.getElementById(tabsId);
    if (!tabs) return;
    var buttons = Array.prototype.slice.call(tabs.querySelectorAll(".chart-tab"));

    function pick(btn) {
      buttons.forEach(function (b) {
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
        b.tabIndex = b === btn ? 0 : -1;
      });
      onPick(btn.getAttribute("data-stage"));
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { pick(btn); });
      btn.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
        if (e.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
        if (next) {
          e.preventDefault();
          next.focus();
          pick(next);
        }
      });
    });
  }

  /* ---------- boot ------------------------------------------------------ */

  function init() {
    renderFunnel();
    renderServices();

    var trendHost = document.getElementById("cutoff-trend");
    if (trendHost) {
      trendHost.dataset.stage = "prelims";
      watch(trendHost, function () {
        renderTrend(trendHost.dataset.stage || "prelims");
      });
    }

    var catHost = document.getElementById("cutoff-cats");
    if (catHost) {
      catHost.dataset.stage = "final";
      watch(catHost, function () {
        renderCats(catHost.dataset.stage || "final", "2025");
      });
    }

    var vacHost = document.getElementById("vacancy-chart");
    if (vacHost) watch(vacHost, renderVacancies);

    wireTabs("trend-tabs", function (stage) {
      var h = document.getElementById("cutoff-trend");
      if (!h) return;
      h.dataset.stage = stage;
      h.innerHTML = "";
      renderTrend(stage);
    });

    wireTabs("cat-tabs", function (stage) {
      var h = document.getElementById("cutoff-cats");
      if (!h) return;
      h.dataset.stage = stage;
      renderCats(stage, "2025");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
