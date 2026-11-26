# Changelog — Study Desk visual & responsive upgrade

Date: 27 November 2026
Scope: Home, Syllabus Tracker, Mains PYQs, Optional PYQs, Prelims Practice
Constraint honoured throughout: plain HTML/CSS/JS, no frameworks, no trackers, no
accounts, no data-file edits, no changes to the +2 / −0.66 scoring, no changes to
localStorage keys or schema, "Not affiliated with UPSC" kept on every page.

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
* **Landscape phones were clipped at the top.** `justify-content:center` on an
  overflowing flex column cuts off the first item. It is now
  `justify-content:safe center` (plus `min-height:100svh`, so iOS Safari's
  toolbars no longer hide the footer). Landscape ≤520px tall switches to a
  two-column grid: header, chips and footer on the left, cube on the right.
* **Face type did not fit a small cube.** `.face__name` had a 22px floor, which
  overflows a 140px face; the floor is 15px and the face padding starts at
  10px.
* **A notch at every cube corner.** The faces are `border-radius:var(--r)` with
  `--r` up to 16px, and each rounded corner left a wedge where the page
  background showed through the seam — a hairline on desktop, a visible bite on
  a phone. `--r` is now `clamp(3px,1.4%,7px)`, and three inset planes
  (`.core`) fill the interior so any remaining seam reads as the inside of the
  cube rather than a hole.
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

**Checked:** rendered at 320×568, 360×640, 390×844, 740×360 and 1280×800 —
0 horizontal overflow and 0 vertical overflow at every size (320 was 59px over
before this pass, now 0); no console errors; every `a` and `button` at least
44px tall; chip tap snaps the correct face (`Polity` → `rotateY(-180deg)`); a
swipe after that moves the cube to `-146deg` without snapping back or leaving
the chip lit; light and dark both viewed at 360×640. `node scripts/audit.js`
36/36 clean across the five desk pages.

**Not checked:** a physical phone — all of the above is Chromium with
`isMobile:true, hasTouch:true` at the listed viewports. iOS Safari's 3D
`preserve-3d` rendering and its URL-bar behaviour should be confirmed on the
device.
