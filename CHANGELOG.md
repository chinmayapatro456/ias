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

## 11. Larger banner, bigger cube beside the heading (27 Nov 2026)

* `.hero-band` grows from `26vh` to `clamp(280px, 44vh, 500px)` and the crop moves
  to `58% 38%`, so the frame holds his bust **and** the संघ लोक सेवा आयोग board at
  1512, 1024 and 768 instead of slicing him off at the chin. The gradient reaches
  solid `--bg-page` at 92%, so the copy can overlap it.
* `.hero-grid` became a named-area grid: the identity row spans both columns and
  the cube sits in an `aside` column whose top is level with the heading's cap
  line (`"identity identity" / "text aside"`). The copy is pulled up
  `clamp(-3.5rem, -4vh, -1.75rem)` onto the fade, which wins back the height the
  taller band costs.
* Cube enlarged: 196px on desktop (was 148), 152px on phones (was 146). Face type
  scales with it — 0.78rem labels and 26px icons on desktop, 0.72rem/22px under
  960px — and the stage's bottom margin goes to 34px so the near-bottom corner
  clears the "Drag · tap a face" hint at the 900px perspective.
* Ground shadow dropped to `calc(var(--cube-size) + 12px)` to sit under the new
  overhang.

**Checked:** `node scripts/audit.js` 30/30 clean; screenshots at 1512, 1024, 768,
390 and 360 plus the dark theme; front-face tap still opens
`mains-pyqs/index.html?paper=GS%20Paper%20II`, drag still spins without
navigating. Asset URLs bumped to `?v=20261127f`.
