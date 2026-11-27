# Changelog — Study Desk visual & responsive upgrade

Date: 27 November 2026
Scope: Home, Syllabus Tracker, Mains PYQs, Optional PYQs, Prelims Practice
Constraint honoured throughout: plain HTML/CSS/JS, no frameworks, no trackers, no
accounts, no data-file edits, no changes to the +2 / −0.66 scoring, no changes to
localStorage keys or schema, "Not affiliated with UPSC" kept on every page.

---

## Prelims Practice — questions laid out the way the paper printed them (27 Nov 2026)

Scope: `assets/js/prelims-format.js` (new), `assets/js/prelims.js`,
`assets/css/prelims.css`, `prelims-practice/index.html`, cache stamp bumped to
`20261127x`. No data-file, storage-key or scoring change.

- **What was wrong.** The PYQ bank stores every stem as one flat string, so a
question printed as a lead line, three numbered statements and a closing
"Select the answer using the code given below :" arrived on the page as one
solid paragraph. Table questions were worse: cells were joined with "|" and
ran together with the question sentence.
- **Lead, statements, ask.** A new presentation layer splits a stem into the
lead line, a marker list (I. / II. / III., 1. / 2. / 3., (A) / (B), (i) / (ii)),
the ask line in heavier type, and the code footer in muted type. 1,383 of the
3,940 live questions now render as a list instead of a paragraph.
- **Pairs are tables.** "Consider the following pairs" renders as a two-column
table with the column labels as headers, whether the pairs are written
"Peak : Range" or "Peak — Range" (64 questions).
- **Match List I with List II** renders as a two-column table with the "Code :
  A B C D" line beneath, and answer options printed as "3 1 2 4" show lettered
  columns (A B C D over the digits) — 244 table questions in all.
- **"|" tables** (Sl. No. | Committee | Objective | Organisation, Waterfall |
  Region | River, ...) are rebuilt as real tables, with the serial column
  centred and the trailing question pulled out below.
- **Assertion (A) / Reason (R)** and **Statement-I / Statement-II** each get
  their own line with the label in bold.
- **Text is never rewritten.** The formatter only re-flows the string it is
  given: every word of the original stem survives, checked word-by-word
  against all 3,976 questions.

---

## Prelims Practice — Custom Quiz gets a multi-year filter (27 Nov 2026)

Scope: `prelims-practice/index.html`, `assets/css/prelims.css`,
`assets/js/prelims.js`, cache stamp bumped to `20261127w`. No data, storage-key
or scoring change.

- **What changed.** In Custom Quiz the single Exam Year dropdown is replaced by
a checkbox per exam year (1995–2026, newest first), so several years' questions
can be drilled in one session. Every year starts ticked, which is the old
"All years" behaviour.
- **Per-year counts.** Each pill shows how many questions that year has under
the current subject and topic, so it is obvious which years are worth ticking.
- **Shortcuts.** All years / Last 5 years / Clear sit above the list; the ticked
count is repeated next to the EXAM YEARS label.
- **Year-Wise Paper is untouched** — one paper at a time still uses the dropdown,
and switching modes swaps the two controls automatically.
- **Layout.** In Custom Quiz the year block takes the full width of the setup
grid (two columns on a phone, up to nine on a desktop) and the remaining fields
share one row.

---

## Home — role line becomes an eyebrow (27 Nov 2026)

Scope: `index.html`, `assets/css/home.css`, cache stamp bumped to `20261127q`.

- **The line under the name** now reads **"A Civil Services Aspirant"** (was
  "a UPSC Aspirant") in the same treatment as the inner page titles: roman
  serif for "A Civil Services", italic serif with the butter swipe behind
  "Aspirant" (`.accent`), set in ink rather than the old italic terracotta.

---

## Desktop fix — the filter block gets out of the way (27 Nov 2026)

Scope: `assets/css/base.css`, `assets/js/mains.js`, `assets/js/optional.js`, a
"Hide filters" button in the panel on both PYQ pages, cache stamp bumped to
`20261127u`. No data, storage-key or scoring change.

- **What was wrong.** On a wide screen the filter panel started expanded, so the
  sticky bar was ~230px (Optional: ~430px) tall and stayed pinned under the nav
  while the question list scrolled behind it — a third of a laptop screen gone,
  and the block never moved out of the way.
- **Compact by default.** The panel starts collapsed on every width: the bar is
  a 66px strip with the Filters button, the live count and the density toggle,
  and the first question begins right under it.
- **Nothing is covered.** The open panel sits in the flow inside the bar, so it
  pushes the questions down instead of lying on top of them.
- **It folds away on scroll.** Scrolling the list closes the panel again (24px
  threshold; `Escape` also closes), so one wheel tick is enough to get past the
  filters. Browsers with scroll anchoring keep the question being read in place
  as it closes.
- **Explicit way out.** A "Hide filters" button at the foot of the panel returns
  to the questions and puts focus back on the Filters button.
- **Short windows and phones.** The open panel is capped at
  `100dvh − nav − 180px` and scrolls inside itself; scrolling inside the panel
  does not close it.

---

## CSAT: 2018 and 2026 filled in, figures restored (27 Nov 2026)

Scope: `data/csat-data.js` (rebuilt), `assets/img/csat/` (new, 233 figures),
`assets/js/csat.js`, `csat-practice/index.html`. Cache stamps to
`?v=20261127y`.

**Why 2018 was short.** Not a missing year — a parsing fault. The year tag was
never the problem (the PDF carries 79 tags for 2018); the *options* were. Some
option lines in the source are indented by a space (` (a) …`), and the parser
anchored the option marker to column 0, so it swallowed them into the stem and
the question failed the "four options" test. A second fault: the running page
header ("45 / Comprehension") was being glued onto the last option of a question
that crossed a page break. Both fixed:

  * options may be indented
  * page folios and running headers are skipped
  * the year-tag typo `CSATV-2015` is recognised

2018 went from 48 usable questions to **77**; every other year gained 0–4.
1,157 → 1,170 complete questions.

**Why 2026 was four.** The paper was sat on 24 May 2026 and no single page
carried all eighty questions without truncating the fetch. Per-question pages
did, so all eighty were pulled one by one and 64 transcribed verbatim with their
four options and provisional key. The other 16 are not included because the
source page shows the answer but no option text — the questions cannot be
answered without inventing options, so they were left out rather than guessed.

**Data Interpretation is back.** All 47 DI questions, and the figure-based
reasoning questions elsewhere, were previously dropped because their charts and
tables exist only as images in the PDF. They are now extracted: 233 embedded
images lifted out of the PDF, resized to 760px, saved as WebP (1.3 MB total) and
attached to the 50 questions that need them. The quiz shows the figure above the
stem, and the review shows it above the question. Only 4 questions remain
excluded — their figure is not on their own page.

Result: **1,230 questions**, 1,189 with a key, 64 of them from 2026.

**Page behaviour.** The year list now shows each paper's real count ("2024 paper
· 78 Qs") and marks 2026 "(partial)"; the default paper is the newest with at
least 75 questions, so 2026 is listed but never preselected. Checked:
`node scripts/audit.js` 48 runs clean, 11 interaction checks, 2026 paper starts
with 64 questions and no console errors.

---

## New page — CSAT Practice (27 Nov 2026)

Scope: new `csat-practice/`, `assets/css/csat.css`, `assets/js/csat.js`,
`data/csat-data.js`; one nav + drawer + footer link added to every page (and a
sixth button on the 404); `assets/js/storage.js` gains an additive key;
`assets/css/base.css` gets one measure fix; `scripts/audit.js` now audits the
new page. Cache stamps moved to `?v=20261127x`. No existing data file, storage
key, scoring rule or page script was changed.

- **The bank.** 1,096 CSAT questions, 2011–2026, parsed page by page out of the
  302-page "Topicwise CSAT PYQs 2011–2025" compilation (questions, options,
  answer keys and explanations). 1,056 carry a key; the other 40 are shown as
  unscored — they are mostly Decision-Making items, which UPSC grades by
  preference rather than with a single key. Per year: 48–80 questions, except
  2026 (below).
- **2026.** Four questions of the 2026 paper, the ones whose full text, four
  options and provisional key could be read verbatim from a public source
  (three data-sufficiency items, one inequality item). They are tagged 2026,
  appear in their topics and in the year filter, and the year is labelled
  "partial" so a four-question paper is never mistaken for a full one. No
  further 2026 text could be verified, so nothing else was added.
- **Not included: Data Interpretation.** All 47 DI questions in the source are
  built on bar charts and tables that exist only as images in the PDF, so they
  cannot be answered from text. Questions elsewhere that need a figure the text
  does not carry were dropped the same way (65 in total). The page states this
  where the marking note is.
- **Two modes.** *Full-length tests* — one year's paper in the compilation's
  order on a two-hour countdown with a depleting timer bar, exactly like the
  Prelims simulations. *Sectional tests* — one topic drawn at random from every
  year, 10/20/30/50 or all, with no clock.
- **Marking is CSAT's own.** +2.5 for a correct answer, −0.83 for a wrong one
  (one-third), 0 for a skip, and the results card states whether the score is
  above or below the 33% qualifying line. The Prelims page keeps its +2/−0.66
  untouched; the two pages share components, not scoring.
- **Everything else is the Prelims pattern**, because it already worked:
  question palette with filled/outline/dot states and a legend, flag and
  bookmark, instant-feedback mode, `A`–`D` / `N` / `P` keys, topic-wise
  accuracy and recent attempts in the lobby, a score ring, KPI cards, topic
  bars, and a review list with the source's explanation for each question.
  Progress lives under a new key, `cp_csat_state`, and is included in the
  JSON export/import on the Prelims page.
- **Passages.** 693 questions carry their reading passage or puzzle set-up, shown
  in a scrollable panel above the stem (34vh, 28vh on a phone) so the options
  stay on screen.
- **One shared fix.** `.notice--callout` was measured in `ch`, which is the width
  of "0" in the *loaded* font — when Inter arrived the box grew 77px, the text
  re-wrapped and everything below it moved (CLS 0.19 on this page). It is now
  `50em`, the same ~700px, and font-independent.
- **Nav.** Seven items no longer fit a 768px strip, so the desktop link strip now
  starts at 860px (the drawer covers 768–859 with the same links and 44px
  targets), and the two practice links read "Prelims" and "CSAT" in the strip.
- **Checked.** `node scripts/audit.js` (now 8 pages × 6 widths): no overflow, no
  clipped text, no sub-44px targets, no console errors. CSAT page: 11 interaction
  checks pass (defaults to the newest complete paper, sectional field swap, 10-Q
  set with no clock, keyboard answering, bookmark persistence, submit → score
  1.67/47.5 on 1 correct + 1 wrong, review filters, explanations, retry-wrong,
  theme toggle); CLS 0.007 at 1280 and 0.001 at 390; print renders one clean
  page with the setup controls stripped.

---

## Load smoothness — no more jump on the list pages (27 Nov 2026)

Scope: `assets/css/mains.css`, `assets/css/optional.css`,
`assets/css/syllabus.css`, cache stamp bumped to `?v=20261127w` in every page.
No markup, data, storage-key, scoring or script change.

Found by measuring the real pages (Layout Instability API, one run per page ×
390/1280 × both themes) rather than by eye:

- **Mains PYQs jumped 0.687 CLS on load.** The list is built by `mains.js`
  after the first paint, so the first screen showed the page header, the filter
  bar and the footer — and then the questions arrived and the footer was pushed
  ~30,000px down. `.mains-list:empty` now holds one screen (70vh) while the list
  is still empty; the footer stays below the fold and nothing visible moves.
  When a filter matches nothing the empty state is a child of the list, so
  `:empty` stops matching and no gap is left behind.
- **Optional PYQs, 0.139.** Same reserve on `.opt-list`, plus a second cause: the
  header counts grow from "0 questions" to "1,372 questions", which takes the
  badge row from one line to two below 400px and pushed the whole section down
  32px. The two-line height is now reserved at those widths only (from 412px the
  badges stay on one line and need nothing).
- **Syllabus, 0.081.** The per-paper ring cards are rendered after paint, so the
  toolbar and the tree slid down by one row. `.rings-grid:empty` holds a row
  (two rows on a phone, where the grid is a single column).

Measured after the change: mains 0.687 → **0.021**, optional 0.139 → **0.013**,
syllabus 0.081 → **0.001**; every other page stays ≤ 0.011. All well inside the
"good" band (< 0.1).

Also verified while measuring, and left alone because they are already healthy:
scrolling the 46,000px Mains page holds 55–61 fps with no long tasks, the
reveal/counter/line-draw/ring/funnel animations all run and settle (checked by
sampling opacity, dash offset and transform mid-flight), `prefers-reduced-motion`
shows everything immediately with no transitions, and no page logs a console
error or fails a request. `content-visibility: auto` was tried on the list rows
and rejected: it cut the 213ms render task to 162ms but left the page height
wrong until each row was measured (46,270px → 26,315px), which is a worse
jump than the one it fixes.

---

## Visual polish pass — share card, footer bookend, emblems, print (27 Nov 2026)

Scope: `assets/css/tokens.css`, `assets/css/base.css`, `assets/css/prelims.css`,
`assets/css/mains.css`, `assets/css/optional.css`, `assets/css/about.css`,
`assets/js/theme.js`, `assets/js/motion.js`, `assets/js/prelims.js`,
`assets/css/print.css` (new), `assets/img/banner-share.webp` +
`banner-share.png` (new), and the heads/footers/page headers of all eight HTML
files. **Untouched by design:** the home-page hero, the 3D subject cube
(`cube/index.html` markup and its on-screen styling — it gains only the print
stylesheet link), everything under `/data/`, the `cp_*` localStorage keys and
schema, and the +2 / −0.66 scoring in `assets/js/prelims.js` (the only edit in
that file reads the clock; it does not score). No new fonts, libraries or
network requests; every cache stamp moved to `?v=20261127v`.

- **Social share card.** New 1200×630 `assets/img/banner-share.webp` (PNG
  fallback alongside it), built from the site's own tokens: warm ivory ground,
  "Chinmaya Patro" in Newsreader at display optical size, the subtitle in Inter,
  the terracotta map-pin monogram, and the India outline lifted from
  `index.html`'s `.band-map` SVG as a faint watermark on the right. The hero
  keeps its gate photograph; only the share image changed. `og:image`,
  `og:image:width/height` (now 1200/630), `og:image:type`, `og:image:alt` and
  `twitter:image` updated on all six pages that carry social metadata (the
  noindex 404 and the self-contained cube page carry none, and were left as
  they were).
- **Footer as a bookend.** One modifier, `.site-footer--band`, applies the
  deep-ink `--band-*` treatment to the footer on every page, including the 404
  shell. Brand stays serif in `--band-ink`; links, disclaimer and the map/type
  credit sit in `--band-muted`; hairlines use `--band-line`; hovers use
  `--band-accent`. No raw colour anywhere — measured ratios are commented
  beside the rules (brand 16.6:1 light / 15.9:1 dark, body 8.1:1 / 8.3:1,
  hover 9.4:1 / 9.5:1).
- **theme-color follows the theme.** Every page now declares two metas — the
  ivory default and a `#16130F` counterpart scoped to
  `(prefers-color-scheme: dark)` — and `theme.js` sets *both* on toggle, so the
  browser chrome matches the page whatever the OS preference says. The
  pre-paint inline script in each head sets them too, so there is no flash of
  the wrong chrome colour and no layout impact.
- **Stage emblem in every inner page header.** A 64–96px inline-SVG mark, right
  aligned, stroked in `--stage-ink` at 0.28 opacity: progress-ring cluster on
  Syllabus, stacked paper sheets on Mains, globe/graticule on Optional,
  tally-on-a-scan-sheet on Prelims, the map-pin monogram on About. Drawn in once
  by the existing `[data-draw-svg]` observer, gated on `.js-motion` and off
  under `prefers-reduced-motion`; hidden below 900px; renders nothing if the SVG
  is removed. No raster assets.
- **Prelims quiz polish.** A 3px countdown depletion bar (`scaleX` only) sits
  above the quiz layout in `--stage-solid`, turning to the danger ink in the
  last five minutes; the `.is-urgent` state now pulses the progress text as well
  as the clock. The selected option gets a 2px `--stage-solid` inset ring on top
  of the stage tint, and its A–D key reads as a pressed key. The stem is now
  `--text-lead` Newsreader at the 64ch measure. The question palette reads as
  three shapes in one stage colour — filled = answered, 2px outline = current,
  tint plus corner dot = flagged — with a legend row that mirrors them (and now
  survives the phone layout instead of being hidden).
- **Filter bars and chips.** Active chips are stage chips: `--stage-solid` fill
  with `--stage-on-solid` text (light 4.74 / 9.95 / 6.72:1, dark 4.55 / 5.20 /
  6.09:1). The chip row is now one base.css component (`.chip-row`,
  `.topic-chips`) instead of two diverging copies. The sticky `.filterbar` is
  flat in the flow and gains `.is-stuck` — bottom hairline in `--stage-border`
  plus `--shadow-xs` — from a 1px-sentinel IntersectionObserver in
  `assets/js/motion.js`, which both PYQ pages already load (one implementation,
  no per-page copy). The desktop floating filter panel from the previous pass is
  untouched.
- **About chart chrome.** `.chart-card` is now a modifier over `.card` on the
  five chart cards: card surface, a small-caps title row with a hairline under
  it, and the "numbers as a table" panel recessed onto `--bg-subtle` with an
  inset hairline. The line/bar draw-in animations are untouched.
- **Micro-typography.** `.eyebrow` uses real `font-variant-caps: all-small-caps`
  where the engine supports it, keeping the eyebrow's own tracking; uppercase
  stays as the fallback. `<kbd>` is defined once in base.css — JetBrains Mono,
  hairline border, 2px radius — and the Prelims hint no longer overrides it.
  `font-variant-numeric: tabular-nums` now covers stat values, counters, the
  quiz timer and progress text, dates, chart axis text and table numerics, so
  digits no longer jitter while counting.
- **Print stylesheet.** New `assets/css/print.css`, linked with `media="print"`
  from every page. It re-declares the tokens in a black-ink-on-white palette (so
  the components follow the design system rather than being restyled), strips
  the nav, drawers, buttons, chips, filter bars, skeletons, search controls and
  the today strip, expands every `<details>` (including the `::details-content`
  box in current Chrome/Safari), keeps cards and table rows whole with
  `page-break-inside: avoid`, lands every animation on its end state, and drops
  the stage wash behind page headers to save ink. The syllabus tree, the PYQ
  lists and the About charts print cleanly; the syllabus tree prints the stage
  tab that is open, since the other stages are rendered on demand.
- **Stray merge markers removed.** `syllabus/index.html` arrived with two
  blocks of committed conflict markers (from commit `b63aa03`), which rendered
  as literal `<<<<<<< HEAD` text at the top of the page and again above the
  scripts. Both sides were identical apart from the new print stylesheet link,
  so the file is resolved and the markers are gone.
- **404 stops drifting.** Its inline `<style>` block is gone: the shell
  (`.not-found`, `.not-found-card`, `.nf-btn`, `.nf-footer`) now lives in
  base.css and follows the tokens, and only the India-outline watermark keeps an
  inline rule (with token fallbacks) so the motif still renders if a deep GitHub
  Pages 404 URL is served without the stylesheet. Its footer takes the band
  treatment too.
- **Contrast.** Every contrast-affecting token change carries its measured ratio
  in a comment: the dark `--st-prelims-solid` deepened from `#C0613F` to
  `#B75C3D` because white on the old value measured **4.18:1** (below AA) — it
  is 4.55:1 now, and still 4.07:1 against the dark canvas. The `--band-*` pairs
  used by the footer are measured in both themes, and the print palette is
  measured on white.
- **Checked.** `node scripts/audit.js` at 360/390/412/768/1280/1440 across all
  seven audited pages: no horizontal overflow, no clipped text, no sub-44px tap
  targets, no console errors. Re-run in the dark theme (plus the 404) with the
  same result, and spot-checked for: the emblem hidden below 900px, both
  `theme-color` metas following the toggle, `.is-stuck` arriving on scroll, the
  timer bar depleting, the palette states, and the print PDF (nav gone,
  `<details>` expanded, white page, black ink).

---

## Home — role line under the name (27 Nov 2026)

Scope: `index.html`, `assets/css/home.css` (`?v=20261127t`). No data, storage-key,
scoring or copy change elsewhere.

- **What was added.** A single line, "a UPSC Aspirant", sits directly under the
  `Chinmaya Patro` H1 in the hero, continuing the editorial em dash the heading
  already carried.
- **The formatting.** Set in Newsreader italic at weight 300, in the terracotta
  accent ink, sized `clamp(1.2rem, 2.4vw, 1.7rem)` so it stays a quiet whisper
  beside the display name at 360px and on a wide screen. Tight top margin keeps
  it tucked under the H1; it inherits the existing dark-theme accent ink, so it
  needs no separate dark rule.

---

## New page — "About the exam" (27 Nov 2026)

Scope: new `about/` page, `assets/css/about.css`, `assets/js/about.js`,
`data/about-data.js`; one nav + footer link added to every existing page;
`scripts/audit.js` now audits the new page. No existing page's markup, storage
keys, data globals or scoring changed.

- **What it covers.** Exam pattern (three stages, nine papers, paper-wise
  marks), the 2,025-mark architecture, the CSE 2025 selection funnel, the
  General-category cut-off trend 2015–2025 (tabbed by stage), category-wise
  cut-offs for 2025 and 2024, vacancies and recommendations 2015–2026, the
  CSE 2025 service split, eligibility and attempts, optional subjects and
  services, the CSE 2027 calendar, twelve "nitty gritty" rules and a sources
  note.
- **Charts.** Hand-built SVG (no library): a measured line chart that redraws
  to the container width so axis text keeps its pixel size on a phone, a
  two-series vacancy bar chart with the 2026 estimate drawn as an outline, and
  CSS bar/stack components for the funnel, category gap and service split.
  Every chart carries a `<details>` table of the same numbers.
- **Sources.** Cut-offs and vacancies from UPSC's own cut-off notices and
  final-result press notes; applicant figures from PIB; dates from the Annual
  Calendar 2027. Current as of 27 November 2026 — update `data/about-data.js`
  and the `status` block when new results land.
- **Checked.** `node scripts/audit.js` at 360/390/412/768/1280/1440: no
  horizontal overflow, no clipped text, no sub-44px tap targets, no console
  errors on any of the seven pages. Charts verified at each width and in the
  dark theme.

## About the exam — motion pass (27 Nov 2026)

Scope: `about/index.html`, `assets/css/about.css`, `assets/js/about.js`. Content
and figures unchanged; nothing outside the About page was touched.

- **Scroll reveals.** Every block — section heads, cards, stage cards, tables,
  the twelve notes, the timeline, the source notes — now uses the site-wide
  `.reveal` observer from `assets/js/motion.js`, with per-grid stagger delays.
  The page header rises in on load in four steps.
- **Figures animate when they arrive.** The funnel rows wipe in one by one, the
  cut-off line draws itself along its own length before the points pop in
  sequence, the category bars grow from the left, the vacancy bars grow up from
  the axis (2026 last), the service split wipes in and its legend follows, and
  the 1,750 + 275 marks bar fills left to right.
- **Numbers count up.** The four header facts and the three CSE 2026 figures
  count to their value through `motion.js`'s `data-counter`, formatted in Indian
  grouping.
- **Interaction.** Cards, notes and optional-subject chips lift 2–3px on hover;
  a small pulse marks the "Right now" status.
- **Cheap by design.** Transform, opacity and clip-path only — no filters, no
  layout thrash. Bars use clip-path wipes rather than width changes, so a
  half-finished animation never clips a label.
- **Degrades cleanly.** Every "before" state is gated on `.js-motion`, so with
  JavaScript off the page renders complete; `prefers-reduced-motion: reduce`
  turns every transition, transform and loop off. Switching a chart tab replays
  that chart's draw.

---

## 0. Redesign — "study cockpit" visual pass (27 Nov 2026, later same day)

Scope: tokens, base components, Home, Syllabus, Mains PYQs, Optional PYQs,
Prelims Practice, 404, favicon. No data file, storage key, data global or
JS-dependent element ID was renamed; scoring, filters and saved progress are
untouched. Stack is still plain HTML/CSS/vanilla JS with self-hosted fonts.

### Colour system (`assets/css/tokens.css`)

- **One job per colour.** Terracotta = primary action + active state + Prelims.
  Sage = progress and success only. Sky = Geography/Optional only. Butter = the
  highlight swipe only. The italic accent word is no longer sage — it is ink with
  a butter swipe, which is what freed sage to mean progress everywhere.
- **A stage triplet per exam stage**, defined once and aliased per page through
  `body.page-*`: Prelims `#FBF0EC/#EEC8BA/#A64728/#B8563A`, Mains
  `#EFF1F2/#D2D7DA/#333B42/#3A444C`, Optional `#ECF2F8/#C5D8EA/#2A5278/#2F5F8A`
  (bg / border / ink / solid), each with a dark-theme counterpart. Tags, ring
  strokes, card header bands and chart bars all read `--stage-*`, so a stage
  colour cannot drift between pages.
- Tags are neutral by default; only the **year** tag (`.tag--year`) and the
  status tags carry colour, and the year tag takes the page's stage colour.
- **Contrast re-verified at WCAG AA in both themes**: 17.4:1 ink-on-ivory,
  5.1:1 muted, 4.7:1 white-on-CTA, 7.5:1 sage-on-sage-bg, 7.2:1 sky-on-sky-bg,
  10.1:1 slate ink on slate bg, 15.6:1 band ink on band bg. Dark theme: 16.5:1,
  6.9:1, 9.8:1, 9.3:1, 9.8:1, 9.9:1, 15.9:1. Every pair is commented beside the
  value in `tokens.css`.
- New tokens for the redesign: `--st-*` stage triplets, `--band-*` (deep ink
  section), `--skeleton-*`, `--meter-track`, and a slightly tightened type scale
  (`--text-hero`, `--text-h2`, `--text-eyebrow`, `--measure` 64ch).

### Shared components (`assets/css/base.css`)

- `.tag--year`, `.tag--stage`, `.meter`, `.skeleton`, `.filterbar` +
  `.filterbar-count`, `.density-toggle`, `.keynav-hint`, `.band`, `.toast--tick`,
  `.is-celebrating` ring pulse, `.empty-state` compass motif, monogram styles.
- Type hierarchy: eyebrow 11px caps at 0.14em tracking with a fixed 12px gap to
  the heading, then the serif heading, then a smaller lead — three clear tiers.
- Scroll anchoring: `.pyq-item`, `.opt-card`, `.mains-group`, `.unit-details`
  carry `scroll-margin-top` so the sticky bars never swallow the row you jumped
  to.
- Touch targets re-asserted last in the file (44px) for the density chips,
  filter-bar toggle and Today-strip link.

### Home (`index.html`, `assets/css/home.css`, `assets/js/home.js`)

- **H1 is the name** — `Chinmaya *Patro*` — and "UPSC Civil Services Aspirant —
  Geography Optional" moved into the eyebrow/subtitle row, so the heading is one
  line at 360px instead of three.
- **One dominant CTA** ("Start today's Prelims drill"); Syllabus, Mains PYQs and
  Optional PYQs became quiet text links underneath.
- **New "Today" strip** under the intro: streak, topics touched this week, and a
  "continue where you left off" shortcut. All three read from the existing
  localStorage keys and say so in words ("No streak yet", "No drills yet",
  "Start your first drill") when empty. `prelims.js` now also records a `topics`
  array on each new attempt (additive field, no key or schema change) so the
  weekly figure is real rather than estimated.
- **Cube moved off the portrait** into its own 300px panel with a 176px cube
  (160px on phones), an always-visible "Drag to spin · tap a face" hint at every
  breakpoint, and the tap-friendly subject chips kept for mobile. Idle rotation,
  drag, keyboard focus-snap and reduced-motion behaviour are unchanged.
- **Desk inventory** cards are stage-coloured (Prelims terracotta, Mains slate,
  Optional sky, Syllabus a tri-colour band because it spans all three) with an
  icon, a count-up number, and a thin sage meter for the personal metric
  (covered / written / attempted / streak). Cards load in a `loading` state with
  shimmer skeletons and switch to a plain "Data file missing — add …" message
  when a dataset is absent; a stuck dash is no longer possible.
- **Three stages** cards shortened to one sentence plus three micro-stats
  ("100 Q · 2 hrs · +2 / −0.66"), with a stage header band and a large faint
  numeral. Tilt stays on desktop; touch gets a press/scale state instead.
- **Contrast band**: a deep ink section now carries the India map, larger, with a
  faint Optional-zone wash clipped to the outline and three pulsing location
  dots (Mumbai, Kolkata, Chennai — positions derived from the repo's own Albers
  projection in `scripts/build-geo.py`, calibrated against the two reference
  points already in the file). The technical boundary-data sentence moved out of
  the map caption and into the footer.
- **Exam-timeline strip** (Prelims · Mains · Written · Interview) sits between
  hero and inventory as a visual anchor.
- The italic highlighted word is kept on Home and Syllabus only; other headings
  are plain.

### Mains PYQs (`mains-pyqs/index.html`, `mains.css`, `mains.js`)

- **Sticky compact filter bar** under the nav holding a live result count
  ("120 of 1,165 shown · by topic"), the density toggle, a j/k hint, and the full
  filter panel one tap away on every width (open by default on desktop).
- **Density toggle** (Comfortable / Compact) tightens row padding, type and the
  action pills without hiding anything.
- **Collapsible groups** with per-group progress ("0/6 written" + a sage meter)
  that updates in place when you tick an answer written.
- **j / k keyboard navigation** moves a focus cursor down/up the visible
  questions and scrolls them into view.
- Only the year tag is coloured now; subject, topic and marks tags are neutral.

### Optional PYQs (`optional-pyqs/index.html`, `optional.css`, `optional.js`)

- **Ranked horizontal bar chart**: topics sorted by questions asked, each row
  carrying a rank number, a bar in the Optional sky, the count, and a tiny
  sparkline of the years that topic appeared. Click-to-filter, the collapse
  toggle and the width-change re-render all still work.
- Same sticky filter bar, live count, density toggle and j/k navigation as Mains.
- Year tag coloured; paper/topic/marks tags neutral.

### Syllabus (`syllabus/index.html`, `syllabus.css`, `syllabus.js`)

- **Stage-coloured rings**: the ring stroke, card header band and paper code take
  the colour of the active tab (Prelims terracotta, Mains slate, Optional sky).
- **Sticky mini overall-progress bar** under the nav so "how far along am I?" is
  always on screen.
- **Completion celebration**: ticking the last topic of a unit pulses that
  paper's ring and shows a tick toast ("Unit complete — Geomorphology 8/8"),
  fired only on the tick that completes the unit. Skipped under reduced motion.
- The toast helper gained an optional `variant` argument (`'tick'`), used only
  for this.

### Prelims Practice (`prelims-practice/index.html`, `prelims.css`, `prelims.js`)

- **Thin top progress bar** pinned under the nav during a paper.
- **Timer pulses** in the last five minutes (`transform`/`opacity` only, off
  under reduced motion).
- **Larger option cards** (60px min, 34px key) with a smooth selection motion and
  a matching press state.
- **Optional instant-feedback mode**: a new checkbox in the setup card reveals
  the key as you answer (correct/incorrect option styling plus a one-line
  verdict). Off by default, so normal practice is unchanged.
- **Results open with a large score ring** (percentage in the middle, marks and
  the correct/wrong/skipped line beside it) before the KPI cards and subject
  bars.

### Brand and polish

- **New monogram**: italic serif "CP" inside a map-pin / compass head, used for
  the nav mark on every page and for `assets/img/favicon.svg`; the 192 and 512
  PNG app icons were re-rendered from it.
- **Custom 404** with the India outline as a watermark motif, and polished empty
  states (compass rose + one clear next step) across all four lists.
- Micro-interactions: theme toggle already eases; new tick toast, ring pulse,
  skeleton sweep, meter fill and score-ring draw — all transform/opacity based
  and all disabled under `prefers-reduced-motion`.
- Every asset link carries `?v=20261127f`.

### Note on the superseded institutional pass

Three commits landed on `main` while this work was in progress (`d4bc61b`,
`d3fbece`, `8d18758` — "institutional redesign: ruled geometry, consolidated
palette"). That pass moved to 2–4px radii, replaced shadows with hairlines, and
deleted the count-up counters, the tilt handler and the butter swipe. This
redesign supersedes it per the brief: the counters, the desktop tilt and the
butter swipe are restored, and the ruled-geometry styling is replaced by the
warm editorial system described above. The institutional commits stay in the
history through the merge.

### Verification

- `node scripts/audit.js` across 360 / 390 / 412 / 768 / 1280 / 1440 for all five
  pages: **0 horizontal overflow, 0 clipped text, 0 sub-44px touch targets,
  0 page errors**.
- Functional pass: Mains density + group collapse + j/k, Optional chart
  click-to-filter, Syllabus tick → mini bar, Prelims full quiz run with instant
  feedback and the score ring.
- Screenshots: light and dark, 390 and 1440, for all five pages.

---

## 1. Question-count mismatch (Home 1,572 vs Optional PYQs 1,372)

**Result: 1,372 is correct. The 1,572 figure does not exist in the current source
data and could not be reproduced from any file in the repository.**

How the count was established (all from `data/optional-data.js`):

| Check | Value |
|---|---|
| `window.PYQ_DATA.questions.length` (actual rows) | **1,372** |
| `metadata.totalQuestions` (declared total) | **1,372** |
| Sum of `metadata.unitCounts` (20 units) | **1,372** |
| Paper I rows / Paper II rows | 702 / 670 (sum 1,372) |
| Duplicate `id` values | 0 |
| Rows whose `unit` is missing from `unitCounts` | 0 |

Every path through the old code also produced 1,372: `home.js` counted
`PYQ_DATA.questions.length`, and `optional.js` set the banner from the same
normalised array, while `metadata.totalQuestions` — the only other number in the
dataset — is 1,372 as well. `grep` across all HTML/JS/CSS/Markdown finds no
literal `1572` or `1,572` anywhere in the repo, and no historical revision of
`data/optional-data.js` in git contains it either.

**Most likely origin of the 1,572 you saw:** a stale browser/deployment cache of
an earlier build, or a typo when the number was quoted. It is not a value this
codebase can produce today.

**Root cause of the *class* of bug (two numbers that could drift):** the Home
counter and the Optional banner each had their own copy of the counting logic
(`home.js` counted rows; the banner text was built separately and the dataset
also carried a hand-maintained `metadata.totalQuestions`). Two independent code
paths plus a hand-maintained total is exactly how a 1,572-style mismatch appears.

**Fix — one shared value, one data source:**

* New `assets/js/data-counts.js` exposes `window.StudyCounts.optionalQuestions()`,
  which reads `window.PYQ_DATA.questions` and cross-checks the row count against
  `metadata.totalQuestions`, logging a console warning if they ever diverge.
* `home.js` now takes **all four** desk-inventory numbers from `StudyCounts`
  (syllabus / mains / optional / prelims) instead of its own helpers.
* `optional.js` sets the header badge from `StudyCounts.optionalQuestions()`.
* Verified live: Home "Geography Optional" = **1,372**, Optional PYQs badge =
  **1,372**, both from the same array.

---

## 2. Map data source

Both India maps (Home "My approach" panel and the Optional PYQs region map) are
generated from a vetted boundary dataset — **no outline was hand-drawn**.

* **Source:** `udit-001/india-maps-data` → `geojson/india.geojson`, a
  district-level dataset derived from the DataMeet / Census-2011 India boundary
  set and updated for the 2019 reorganisation. It carries **Jammu & Kashmir and
  Ladakh as separate units**, **Arunachal Pradesh** within the Indian claim, and
  **Andaman & Nicobar Islands** and **Lakshadweep** at their true positions.
* **Processing** (`scripts/build-geo.py`, `scripts/build-region-map.py`):
  districts dissolved to states with Shapely, simplified (0.05° for the Home
  outline, 0.085° for the region map), projected to an **Albers equal-area conic**
  (standard parallels 12°N and 35°N, central meridian 80°E, latitude of origin
  24°N) and emitted as SVG path data. Latitude/longitude graticules and the
  Tropic of Cancer are drawn through the same projection, so they curve correctly.
* **Honest limitation:** the dataset depicts Indian-administered territory. It
  does **not** include Pakistan-administered Kashmir (PoK) or Aksai Chin, so it
  is not identical to Survey of India's official depiction of the full claimed
  boundary. Say the word and I can swap in an SoI-consistent file — the build
  script takes any GeoJSON with a state-name property.
* The Optional map's regions are **unions of states** (documented groupings used
  for filtering), labelled as such in the UI: "Regions are state groupings, not
  official physiographic boundaries."

---

## 3. Per-page changelog

### Shared (`tokens.css`, `fonts.css`, `base.css`, `nav.js`, `data-counts.js`)

* **3-tier light palette:** alabaster page `#FAF8F5`, white elevated cards
  `#FFFFFF`, warm sand bands `#F2EDE6`; hairline borders
  `rgba(28,25,23,0.08)` and warm stone `rgba(120,98,82,0.22)`.
* **Buttons:** primary CTA is solid terracotta with a top inner highlight,
  11px radius, `translateY(-1px)` hover lift with a warm shadow, press
  feedback, and a `:focus-visible` ring. Fill deepened to `#B8563A`
  (`--accent-cta`) so white label text clears WCAG AA at 4.7:1 (the old
  `#D97757` was 3.1:1). Secondary CTAs are white surfaces with a 1px warm
  stone border and a `→` icon that nudges on hover. Segmented "GROUP BY"
  control rebuilt as a sand track with a white active pill.
* **Typography:** display/headings Newsreader (tight −0.025em tracking, 1.1
  line-height); body and UI in Inter at 16px with a 62ch measure; **JetBrains
  Mono** (self-hosted, 400/500, Latin subset) with `tabular-nums` for data,
  coordinates, years, counters and the quiz timer. Fonts are preloaded and use
  `font-display: swap`; no external requests.
* **Eyebrows** standardised at 0.72rem / 0.12em letter-spacing / terracotta ink.
* **Mobile nav:** below 768px all five pages use the same hamburger →
  right-hand **slide-over drawer** with an in-panel header and close button,
  focus trap, Escape-to-close, `aria-expanded` on the toggle and `aria-current`
  on the active link; body scroll is locked while open.
* **Sliding active-tab indicator** on every `.tabs` group (Syllabus, Optional,
  Prelims), following `aria-selected` changes, resize and font load. Below
  768px tab strips scroll horizontally instead of wrapping, so the indicator
  never sits on the wrong row.
* **Reveals:** 380ms, 12px translateY, transform/opacity only, no blur filter,
  fire once; all animation wrapped in `prefers-reduced-motion` fallbacks.
* **`[hidden]`** now wins over component `display` rules (it previously lost to
  `.btn { display: inline-flex }`).
* 44×44px minimum touch targets for every control below 768px.

### Home (`index.html`, `home.css`, `home.js`)

* Hero is a spacious two-column grid (48–64px gutter) on desktop; the four CTAs
  sit in a **balanced 2×2 grid** (full-width two columns on Android down to
  360px) — the orphan fourth button is gone.
* Hero photo: `<picture>` with **AVIF + WebP srcset** (480/720/967w), explicit
  `width`/`height` and `aspect-ratio` for zero layout shift, `fetchpriority="high"`,
  `decoding="async"`, tuned `object-position` (66% 40% desktop, 62% 34% mobile)
  so the face and the UPSC gate both stay in frame.
* **3D cube rebuilt:** frosted-ceramic faces with crisp rims, micro-icons +
  labels, soft ground shadow, on a dedicated pedestal in the photo's corner
  with 24–32px of clear space from the copy. Idle rotation (~9.6°/s), pause on
  hover, click-and-drag with inertia, faces are real `<button>`s that navigate
  (`?paper=` deep link) and snap to the front on keyboard focus, rotation stops
  when off-screen (IntersectionObserver). On Android the cube is 136px and sits
  under the photo with a 44px **subject chip** row as a tap-friendly alternative.
* Hero entrance is 280ms with no washed-out button state.
* India map: vetted path (see §2), graticule, Tropic of Cancer label moved into
  the open Arabian Sea margin with a leader line and a `paint-order: stroke`
  halo, refined New Delhi / Kanyakumari markers, scroll-triggered stroke draw-in.
* Desk inventory counts now come from `StudyCounts` (see §1).

### Optional PYQs (`optional-pyqs/index.html`, `optional.css`, `optional.js`)

* **Topic frequency chart** rebuilt as stacked rows: full topic name left,
  question count right-aligned on the same line, bar underneath. **No ellipsis
  at any width** — the old SVG label truncation ("Perspectives in Human
  Geograp…") is gone. Rows remain clickable to filter.
* New **interactive region map** on "Paper II · India & Mapping": 8 clickable
  regions (state groupings), hover tooltips on desktop, tap + tooltip on mobile,
  keyboard-operable (each region is a `role="button"` with `tabindex="0"`,
  Enter/Space, `aria-pressed`), a parallel legend of 44px buttons, and live
  question counts per region. Selecting a region filters the list by matching
  the question text against that region's documented place-name keywords
  (keyword lists live in `assets/js/india-map.js`).
* Filters collapse behind a **Filters** button below 768px (with a live summary
  of the active filters); desktop keeps the panel open.
* Header badge reads the shared count.

### Mains PYQs (`mains-pyqs/index.html`, `mains.css`, `mains.js`)

* Filters collapse behind a **Filters** button below 768px; questions now sit
  above the fold. `?paper=GS%20Paper%20II` deep links preselect a paper (used by
  the Home cube faces and subject chips).
* Card action toggles are 44px targets on Android.

### Follow-up (27 Nov, second pass)

* Removed the **"Source reference ↗" / "Open Ethics case source ↗"** link from
  Mains PYQ cards at your request. The card actions are now just *Mark answer
  written* and *Bookmark*. The `sourceUrl` fields stay in `data/mains-data.js`
  (data files untouched); the now-unused source-map plumbing in `mains.js` and
  the `.source-link` styles were deleted.
* Asset query strings normalised to `?v=20261127d` on all pages.

### Dark theme (27 Nov, third pass)

Light stays the default; dark is opt-in and remembered per browser.

* **Switch:** a moon/sun button in the header of every page (`data-theme-toggle`,
  40px, 44px on Android), `aria-pressed` + action-labelled `aria-label`.
* **No flash:** a 6-line inline script in each `<head>` applies the saved choice
  before the stylesheets paint.
* **Persistence:** `cp_theme` (`'dark'` when chosen, removed for light). This is
  a new, additive key — every existing progress key and its schema is untouched,
  so saved syllabus ticks, written answers, bookmarks and quiz history survive.
  Two open tabs stay in sync via the `storage` event.
* **Palette:** a `:root[data-theme="dark"]` block re-maps the same tokens (warm
  charcoal `#16130F` page, `#201C17` cards, lifted terracotta accent) so no
  component needed a second stylesheet. Hard-coded light values in the CSS were
  replaced with tokens (`--nav-bg`, `--callout-bg`, `--ceramic-*`, `--zone-fill`,
  `--sheet-bg`, `--card-grad-*`, `--highlight`, `--indicator-bg`, …).
* **Details handled:** the editorial butter swipe becomes a soft sage wash in
  dark; the 3D cube gets darker ceramic faces with brighter rims; the map
  regions, question palette sheet, tooltips, tab indicator, quiz callout and the
  404 page all follow the theme. `color-scheme` and `meta[theme-color]` switch
  with it, so native controls and the mobile browser chrome match.
* **Contrast (dark):** body text 16.5:1, secondary 11.1:1, muted meta 6.3–6.9:1,
  accent ink 8.2–8.9:1, sage/sky/warning tints 9.3–10.5:1, white on the CTA
  4.7:1 (5.5:1 on hover). Light-theme values are unchanged.

### Prelims Practice (`prelims-practice/index.html`, `prelims.css`)

* The amber "Answer Key Note" is now a refined **left-accented callout**
  (3px terracotta rule, soft tint, compact padding, dismiss × on mobile) inside
  the page hero, above the tabs.
* Question palette: **sticky sidebar on desktop**; below 920px it becomes a
  **sticky horizontally scrollable strip** under the header with 44×44px
  buttons and snap scrolling.
* Question stem keeps the editorial serif for long-form reading.

### Syllabus Tracker

* Sliding active-tab indicator on the stage tabs; tab strip scrolls instead of
  wrapping on Android; touch targets raised to 44px.

### 404

* Version-tag refresh only (no structural change; it is not one of the five
  pages in scope).

---

## 4. Verification

Automated audit (`scripts/audit.js`, headless Chromium) on every page at
**360, 390, 412, 768, 1280 and 1440px**, checking horizontal overflow, clipped
text, sub-44px touch targets and JS errors:

| Page | 360 | 390 | 412 | 768 | 1280 | 1440 |
|---|---|---|---|---|---|---|
| Home | PASS | PASS | PASS | PASS | PASS | PASS |
| Syllabus Tracker | PASS | PASS | PASS | PASS | PASS | PASS |
| Mains PYQs | PASS | PASS | PASS | PASS | PASS | PASS |
| Optional PYQs | PASS | PASS | PASS | PASS | PASS | PASS |
| Prelims Practice | PASS | PASS | PASS | PASS | PASS | PASS |

30/30 combinations: **0px horizontal overflow, 0 clipped text nodes, 0 touch
targets under 44px, 0 console/page errors.** Desktop (1440px) and mobile
(390px) were additionally reviewed visually.

Functional checks run in the same harness:

* Region filter: Paper II pool 670 → 123 (Indo-Gangetic Plain) → 8 (Islands);
  `aria-pressed` and legend state stay in sync; zones are keyboard-focusable.
* Cube: idle rotation active, keyboard focus snaps the focused face to the
  front (`rotateY(-180deg)` for the back face), faces are `<button>`s.
* Drawer: `aria-expanded="true"`, focus lands on the close button, Tab stays
  inside the panel, Escape closes and restores focus to the toggle.
* Filters drawers: collapsed by default below 768px, expand on tap.
* Palette: 20 buttons at 44×44px, `overflow-x: auto`, panel `position: sticky`.
* Contrast: white on the primary CTA 4.7:1; body ink 17.4:1 on the page,
  5.1:1 for muted meta text, 5.3–7.5:1 for the accent/sage/sky tints.

## 5. What I could not verify

* **Lighthouse mobile 90+** — not run; this environment has no HTTP origin to
  audit against (pages were tested from `file://`). What I could measure
  instead: all scripts are `defer`red, fonts and the hero image are preloaded,
  the hero image has fixed dimensions (no CLS), and no external requests are
  made. The two new deferred scripts (`data-counts.js` ~3 KB,
  `india-map.js` ~38 KB, Optional page only) are the main additions to the
  payload.
* **Critical CSS inlined** — not done. Stylesheets remain separate files
  (tokens → base → page) with the two text fonts preloaded; inlining the
  critical subset is a separate build step I did not introduce.
* **Real Android hardware / Safari / Firefox** — layout verified in headless
  Chromium at the six widths only.
* **Screen-reader output** (NVDA/TalkBack) — ARIA attributes were set and
  spot-checked in the DOM, but no assistive technology was run.
* **The 1,572 figure** — could not be reproduced from any file or git revision;
  see §1 for the evidence trail.
* **Site-wide announcement / countdown bar** — not added: it needs a verified
  exam date, and the brief only asked for it "if adding" one.

## 6. Regenerating the map data

```
python3 scripts/build-geo.py         # Home outline + graticule → geo/india_outline.json
python3 scripts/build-region-map.py  # Region geometry → assets/js/india-map.js
```

Both scripts are checked in for transparency and take the source GeoJSON as an
argument (default `geo-src/india.geojson`, which is not committed — download it
with the `curl` line in the script header). Run them from the repo root.
`node scripts/audit.js` re-runs the six-width layout audit.

## 7. Hero cube placement (27 Nov 2026)

**What was wrong.** The 3D subject cube lived in the same flex row as the photo
caption (`hero-figure-foot`), pulled up with `margin-top: -46px`. That put the
plate half outside the photograph and *across* the decorative offset frame, left
the caption stranded mid-air at the far right of a 190px-tall empty row, and on
phones the frame's vertical rule ran behind the plate, so it looked like a card
dropped into a box.

**What changed** (`index.html`, `assets/css/home.css`):

* The photo and the cube now share a `.hero-photo` wrapper, which is the
  positioning context. The offset frame moved from `.hero-figure::before` to
  `.hero-photo picture::before`, so it hugs the image alone and nothing crosses it.
* Desktop (≥960px): the plate is anchored inside the photo's bottom-left corner
  (`position: absolute; left: 20px; bottom: 20px`) at 108px, clear of the banner
  and the portrait, with `--cube-pad` (18px) wide enough that the rotated cube's
  corners stay inside the plate.
* Phones (<960px): the plate drops back into normal flow, centred under the photo
  at 132px — the size that keeps every face a 44px+ tap target once rotated —
  followed by the caption and the subject chips in one column.
* The caption is now a single full-width row under the photo on desktop, and
  `hero-figure-foot` and the `padding-bottom: 2.5rem` that reserved room for the
  overhang are gone.

**Checked:** `node scripts/audit.js` — 30/30 page×width rows clean (no overflow,
no truncation, no small tap targets). Screenshots at 1512, 1024, 390 and 360.
Tap on the front face still opens `mains-pyqs/index.html?paper=GS%20Paper%20II`
and a 90px drag still spins the cube without navigating — both identical to the
previous build.

## 8. Hero cube: card removed (27 Nov 2026, follow-up)

The white plate around the cube read as a panel stuck onto the photograph. The
cube now stands on its own:

* `.cube-pedestal` lost its border, background, shadow, blur and padding — it is
  only a positioning box for the cube and its ground shadow. Desktop keeps the
  cube anchored inside the photo's bottom-left corner (108px, 20px in), where the
  cream faces and the soft ground shadow sit directly on the scene.
* The "Drag · tap a face" line is hidden at ≥960px: over the fence it was
  unreadable and the grab cursor plus the four CTAs already carry the
  affordance. On phones the cube sits on the page background, so the hint stays
  there in muted ink.
* Phones: the plate is gone too — the cube (132px, still a 44px+ tap target per
  face) floats centred under the photo with a little more breathing room
  (`space-5`).

**Checked:** `node scripts/audit.js` 30/30 clean; screenshots at 1512, 1024, 390;
front-face tap and 90px drag behave exactly as before.

## 9. Editorial type: accent word + butter swipe (27 Nov 2026)

Display headings now carry one italic accent word in sage green, sitting on a
soft butter swipe — the "Ideas worth *thinking* about" treatment.

**System** (`tokens.css`, `base.css`):

* New tokens `--highlight: #F7E8C4` and `--highlight-soft: #FBF3DC`.
* `.accent` — Newsreader italic, `--sage-ink`, `white-space: nowrap`, with a
  `::before` swipe behind its lower half (0.52em tall, `rotate(-0.7deg)
  skewX(-4deg)`, softly asymmetric corners so it reads hand-drawn rather than
  geometric). `isolation: isolate` keeps the swipe above the section background
  and below the glyphs; it inherits the heading's font-size, so one rule serves
  the 4.1rem hero and the 2.1rem page headers.
* Rule of use: one accent per display heading (h1/h2 only), never two, and not
  on panel/chart titles — those stay plain so the accent keeps its meaning.

**Applied to:** home h1 ("Aspirant") and its three h2s ("live", "preparing",
"approach"); page h1s on Syllabus ("Tracker"), Mains PYQs ("PYQs"), Optional PYQs
("PYQs"), Prelims Practice ("Practice") and 404 ("syllabus").

**Checked:** `node scripts/audit.js` 30/30 clean; screenshots at 1512, 1024, 390
and 360 for all five pages plus 404; accent text is `--sage-ink` on `--highlight`
(≈6.9:1, well past AA). Asset URLs bumped to `?v=20261127d` site-wide.

## 10. Hero rebuilt as a full-bleed photograph (27 Nov 2026)

The two-column hero with the photo plate is gone. The gate photograph now runs
full width under the navigation and fades into the page, and the opening copy
sits beneath it — the layout from the reference screenshot, with its problems
fixed.

**What changed** (`index.html`, `home.css`, `tokens.css`):

* `.hero-band` — full-bleed `<picture>` at `clamp(190px, 26vh, 330px)`,
  `object-fit: cover` at `58% 30%`, with a `::after` gradient from transparent
  to `--bg-page`. The fade reads from a new `--page-rgb` token (light and dark
  values), so it lands on the right colour in both themes.
* `.hero-band-tag` — the "Dholpur House · New Delhi" pill, on `--bg-card` so it
  stays legible when the theme flips.
* Identity row: profile ring, `Public Study Desk` eyebrow, then
  "Geography Optional · Civil Services Examination".
* The h1 is the name alone; the role sits under it as a block (`.hero-role`,
  `0.45em`, `--ink-secondary`) carrying the one accent word — so no stranded
  em-dash and no three-line display block.
* The cube moved out of the photo into a `.hero-aside` column beside the copy
  (right-aligned on desktop, below the CTAs on phones), with the caption
  "Six pillars of the examination cycle" under the drag hint. Its ground shadow
  was softened to 0.14 alpha now that it sits on flat ivory.
* Hero height trimmed (`26vh` band, tighter `padding-top`) so the four CTAs sit
  inside a 900px viewport instead of below the fold; mobile cube raised to
  146px so every face clears the 44px tap target at any spin angle.

**Checked:** `node scripts/audit.js` twice, 30/30 clean both runs; screenshots at
1512, 1024, 768, 390 and 360 plus the dark theme; front-face tap still opens
`mains-pyqs/index.html?paper=GS%20Paper%20II`, drag still spins without
navigating. Asset URLs bumped to `?v=20261127e`.

---

## 11. Standalone GS Cube page (27 Nov 2026)

Scope: new `cube/index.html`, one link added on the home page, no changes to
`assets/css`, `assets/js`, data files, storage keys or scoring.

**What changed:**

* `cube/index.html` — the six-sided syllabus cube as its own page: History,
  Geography, Polity, Economy, Ethics, Environment on the six faces, each face
  carrying the subject name, a short accent rule and a one-line thought. Drag,
  arrow keys and the subject chips all turn it; clicking a chip or a face turns
  the shortest way to bring that face forward. Idle drift stops for good on the
  first interaction, and `prefers-reduced-motion` disables it from the start.
* Fonts are the site's self-hosted families (`../assets/css/fonts.css`):
  Newsreader for the display serif and the italic thought lines, Inter for body,
  JetBrains Mono for the face numbers and chips. No Google Fonts request, so the
  page keeps the "no external requests" rule.
* `index.html` — the cube panel caption now links to `./cube/index.html`
  ("open the full cube"), so the page is reachable from the home page.
* The home-page cube is untouched: still the icon-and-label ceramic cube, still
  the buttons that open the matching PYQ paper.

**Checked:** page rendered at 1200×900, six faces present, no external asset
requests beyond the repo's own fonts, no `[cite:...]` artefacts.

---

## 12. Desktop hero band: the whole frame, head to feet (27 Nov 2026)

The band stretched a 4:3 photograph across the full window width, so `cover`
cropped it to whatever the band height allowed — head to waist at 1440, a little
lower at 1920. On a phone the band is narrow, so the same crop rule shows nearly
the whole figure; that is the difference the desktop view was missing.

**What changed** (`home.css`, two new images, `index.html` version bump):

* Above 768px the photograph is no longer stretched to the band width. It keeps
  its natural 967:728 ratio at the band's full height, pinned to the right edge,
  so nothing of the figure is cut at any window width.
* `assets/img/banner-backdrop.webp` / `.avif` (9 KB) — a pre-blurred, slightly
  desaturated copy of the same frame, used as the band's background so the
  remaining width still reads as the scene rather than a flat block. Blurred
  once at build time instead of with a live `filter`: a filtered pseudo-element
  painted over the photograph in Chrome.
* The frame's left edge is feathered into the backdrop with a `mask-image`
  gradient (30% of its width) instead of ending on a hard vertical seam.
* `.hero` no longer sets `isolation: isolate`. Inside an isolated stacking
  context Chrome dropped the masked photo layer entirely and the band rendered
  as blur only. Nothing in the hero uses blend modes, so the isolation was not
  doing any work.
* Band heights: `clamp(440px, 64vh, 620px)` from 768px, `clamp(520px, 70vh,
  700px)` from 1500px, so the figure keeps a similar share of a very wide window.
* The "Dholpur House · New Delhi" tag moved to the left, since the figure now
  holds the right edge, and the bottom fade starts at 90% so the trousers and
  shoes are not washed out.
* Phones (<768px) are untouched: the same full-bleed crop as before.

**Checked:** `node scripts/audit.js` 36/36 clean; band screenshotted at 390, 768,
800, 1024, 1568 and 1920 plus the dark theme, full figure visible in every
desktop shot; asset URLs bumped to `?v=20261127j`.

---

## 13. GS Cube: mobile fixes (27 Nov 2026)

Scope: `cube/index.html` only. No change to the six faces, the copy, the
snap targets or the storage keys; nothing else in the repo was touched.

Found by rendering the page at 320×568, 360×640, 390×844, 740×360 landscape
and 1280×800:

* **The cube sat on top of the subject chips.** The stage was a flex item with
  a fixed `1.9 × --s` height, so on a short phone the column squeezed it to
  168px while the rotated cube still needed ~230px — it spilled over the chip
  row. The stage is now `flex:none`, its height is `1.6 × --s` (close to the
  rotated cube's real bounding box), and on very short phones `1.55 × --s`.
* **The cube ignored the screen height.** `--s` was `clamp(168px,46vmin,320px)`,
  which on a tall phone was fine but on a 320-wide phone produced a cube that
  could not fit the column. It is now
  `clamp(140px,min(46vmin,30vh),320px)`, so height counts as much as width.
* **The cube was small on a phone.** Shrinking it to keep the header and the
  chip list on one screen left a 165px cube in the middle of a 360px display.
  Portrait ≤640px now sizes it from the screen — `--s:min(68vw,40vh)`, i.e.
  245px at 360×640 and 265px at 390×844 — which is the largest square whose
  rotated silhouette (about 1.38×) still clears the width. The page scrolls to
  the chips instead, so the cube owns the first screen.
* **Landscape phones were clipped at the top.** `justify-content:center` on an
  overflowing flex column cuts off the first item. It is now
  `justify-content:safe center` (plus `min-height:100svh`, so iOS Safari's
  toolbars no longer hide the footer). Landscape ≤520px tall switches to a
  two-column grid: header, chips and footer on the left, cube on the right.
* **Face type did not fit a small cube.** `.face__name` had a 22px floor, which
  overflows a 140px face; the floor is 15px and the face padding starts at
  10px.
* **Phones showed a stripped cube.** A `max-width:420px` rule hid the italic
  line under each subject name, so a phone got a different, emptier cube than a
  desktop. That rule is gone: every face carries the number, the name, the rule
  and the line at every size, and the line's floor is 10px so it still fits a
  217px face (measured: no face overflows its box at 320, 360 or 390).
* **The cube drifted on load.** It auto-spun until the first interaction, which
  made a still image of it impossible to catch. It now sits at its authored
  `rotateX(-18deg) rotateY(-32deg)` from the first paint and only moves when
  the visitor drags, taps a chip, or presses an arrow key.
* **A notch at every cube corner.** The faces carried
  `border-radius:clamp(9px,3.6%,16px)`, so each rounded corner left a wedge
  where the page background showed through the seam between two faces — a
  hairline on desktop, a visible bite at phone size, and the cube read as
  broken rather than solid. `--r` is now `0`: square faces meet edge to edge at
  every angle, so there is nothing to show through. (An earlier attempt filled
  the seam with three inset interior planes; that is removed with it.)
* **"Click" on a device with no pointer.** On `hover:none` the header says
  "Tap a subject below", the footer drops the "Arrow keys" hint, and "Click a
  face" becomes "Tap a face".
* **A swipe that ended on a face opened it.** The drag handler now counts
  travel and swallows the click that follows a gesture of more than 8px, so a
  swipe turns the cube without snapping to whichever face it finished over.
  Dragging also clears the active chip, which previously stayed lit after a
  manual turn.
* **"Back to Study Desk" was a 38px-tall tap target** (a bare inline link). It
  is now an inline-block with 15px vertical padding — 44px.
* Short phones (≤640px tall, portrait) drop the footer, which only repeats the
  header, and tighten the body padding and gap.

**Checked:** rendered at 320×568, 360×640, 390×844, 412×915, 740×360,
768×1024 and 1280×800 — 0 horizontal overflow everywhere, no console errors,
every `a` and `button` at least 44px tall, and the cube fully inside the
viewport at every size (rotated silhouette at 360×640: 242px inside 360px).
Portrait phones now scroll only as far as the chip list (0–109px) instead of
the cube being shrunk to fit them. Chip tap snaps the correct face (`Polity` →
`rotateY(-180deg)`); a swipe after that moves the cube to `-146deg` without
snapping back or leaving the chip lit. Light and dark both viewed at 360×640.
`node scripts/audit.js` 36/36 clean across the five desk pages.

**Not checked:** a physical phone — all of the above is Chromium with
`isMobile:true, hasTouch:true` at the listed viewports. iOS Safari's 3D
`preserve-3d` rendering and its URL-bar behaviour should be confirmed on the
device.

---

## 14. Home: the hero cube is now the whole cube (27 Nov 2026)

Scope: `index.html` (the hero panel), `assets/css/home.css`, cache stamp. The
GS Cube page, the desk pages and every link target are untouched.

The hero panel showed a six-face cube carrying only an icon and a subject name,
with the line "The examination cycle, one face per subject · open the full
cube" underneath — so the page's own cube was a teaser and the real one lived
on another URL. That is now one cube, shown in place:

* Every face carries the full entry the GS Cube page uses: the number in mono,
  the subject in the display serif, a hairline rule, and the italic line
  ("Rules outlive the people who wrote them.", "Terrain writes the first draft
  of every story.", …). Nothing is hidden on small screens.
* The icons are gone from the faces — the same four-part entry on all six, so
  the top and bottom faces are no longer the odd ones out (they previously
  suppressed their label).
* The cube grew to 212px on desktop (196px under 959px, 178px under 767px) to
  carry the extra line without crowding.
* The "open the full cube" link is removed; the caption is now just
  "The examination cycle, one face per subject." The standalone
  `cube/index.html` still exists and is still in the audit, but nothing on the
  home page points at it any more.
* Cache stamp `?v=20261127l` (home.css changed).

**Checked:** `node scripts/audit.js` 42/42 clean across the seven pages and six
widths; the panel rendered at 1280×900, 390×844 and 360×800 — every face shows
number, name, rule and line, nothing clipped inside a face, no console errors.

---

## 15. Home: the cube panel now holds the whole spin (27 Nov 2026)

Scope: `assets/css/home.css` (the cube panel and the hero column), cache stamp.

The panel was sized to the cube's *resting* box, not to the box the cube sweeps
while it turns. At the resting X tilt a cube of side `s` covers about `1.42s`
across and `1.39s` down at the worst angle, so a 212px cube needed 300px of
width inside a panel that only offered 266px — the corners crossed the card's
padding as it spun.

* `.cube-stage` is now the **sweep envelope**, `1.45 × --cube-size`, with the
  cube centred inside it, so the space the spin needs is reserved in layout
  rather than overflowing it.
* `--cube-size` is `min(240px, 68cqw)` on the panel as a container, so the cube
  is always 1/1.42 of the panel's content width and can never outgrow it — at
  any breakpoint, without a list of magic numbers. Falls back to fixed sizes
  (180/200/190px) where container queries are unsupported.
* The hero's cube column goes 300px → 320px at ≥960px; the cube grows 212px →
  194px and, more to the point, now stays inside: measured 276×270 of swept
  cube inside 286px of panel content, at 1440, 1280, 1100 and 960.
* 320px is deliberate — 340px pushed the h1 into two balanced lines
  (`text-wrap: balance`), so the column stops just short of that.
* The ground shadow follows the envelope instead of the old `margin-bottom`.
* Cache stamp `?v=20261127n`.

**Checked:** `node scripts/audit.js` 42/42 clean; the panel captured at five
rotation angles (−32°, −5°, 25°, 60°, 95°) at 1440×1000 — no cube edge crosses
the card at any of them; h1 still one line at 1440, 1280 and 1100; no
horizontal overflow at 360–1440.
