# Changelog — Study Desk visual & responsive upgrade

Date: 27 November 2026
Scope: Home, Syllabus Tracker, Mains PYQs, Optional PYQs, Prelims Practice
Constraint honoured throughout: plain HTML/CSS/JS, no frameworks, no trackers, no
accounts, no data-file edits, no changes to the +2 / −0.66 scoring, no changes to
localStorage keys or schema, "Not affiliated with UPSC" kept on every page.

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
* Card action toggles and source links are 44px targets on Android.

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
