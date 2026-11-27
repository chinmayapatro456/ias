# Chinmaya Patro — UPSC Civil Services Study Desk

A static, distraction-free personal study workspace for UPSC Civil Services preparation (Geography Optional), built with plain HTML, CSS, and vanilla JavaScript. Hosted free on GitHub Pages with zero backend, zero build step, zero external libraries, and browser-local progress storage.

## Sections

- **Home (`index.html`)** — Profile banner, live desk inventory counts, three-stage overview, approach notes, and animated SVG outline of India.
- **About the exam (`about/`)** — The whole Civil Services Examination on one page: three-stage pattern and paper-wise marks, the CSE 2025 selection funnel, General-category cut-off trends 2015–2025, category-wise cut-offs, year-wise vacancies 2015–2026 with the service split, eligibility and attempts, optional subjects, the CSE 2027 calendar and a set of rules every aspirant should know. Charts are hand-built SVG from `data/about-data.js`; every figure is sourced from UPSC notices and press notes.
- **Syllabus (`syllabus/`)** — Collapsible topic checklist for Prelims, Mains (Essay & GS I–IV), and Geography Optional (Paper I & II) with search and per-paper SVG progress rings.
- **Mains PYQs (`mains-pyqs/`)** — 2013–2026 Mains questions across 19 subject groups with paper/topic/year/keyword filters, topic or year grouping, local bookmarks, "answer written" ticks, and Ethics case study source links.
- **Geography Optional PYQs (`optional-pyqs/`)** — 1986–2026 Paper I, Paper II, and Mapping questions with paper tabs, topic chips, year slider, "unattempted only" filter, and an animated SVG topic-frequency chart.
- **Prelims Practice (`prelims-practice/`)** — 1995–2026 Prelims bank (3,976 questions) with topic quizzes, year-wise full-paper timed simulations (2-hour countdown, 100 or 150 questions), custom drills, wrong/bookmarked revision, toggleable `+2 / −0.66` UPSC scoring, keyboard shortcuts (`A`–`D`, `N`, `P`), subject-wise breakdown, and JSON export/import backup.
- **CSAT Practice (`csat-practice/`)** — Paper II bank (1,096 questions, 2011–2026) as full-length year-wise papers on a two-hour countdown or topic-wise sectional tests, with the paper's own marking (`+2.5` correct, `−0.83` wrong, 33% to qualify), instant-feedback mode, a question palette, wrong/bookmarked revision, and explanations from the source.

## Updating Data Later

All content lives in `/data/` as plain browser globals—you never need to edit HTML, CSS, or page JS to add new questions or years:

| File | Window Global(s) | Purpose |
| --- | --- | --- |
| `data/syllabus-data.js` | `window.SYLLABUS_DATA` | Prelims, Mains & Geography Optional syllabus tree |
| `data/mains-data.js` | `window.PYQ_METADATA`, `window.UPSC_MAINS_PYQS` | Mains PYQs (2013–2026) |
| `data/optional-data.js` | `window.PYQ_DATA` | Geography Optional PYQs (1986–2026) & topic order |
| `data/prelims-data.js` | `window.PRELIMS_DATA` | Prelims MCQ bank, 1995–2026 (3,976 questions; `incomplete` hidden; `no_key` & `source_marks_cancelled` unscored) |
| `data/about-data.js` | `window.ABOUT_DATA` | Cut-off series (2015–2025), category cut-offs, year-wise vacancies and the CSE 2025 service split for the About page |
| `data/csat-data.js` | `window.CSAT_DATA` | CSAT Paper II bank, 2011–2026 (1,096 questions; no-key items unscored) |

## Local Preview

Run a simple local server from the repository root (so all relative paths behave identically to GitHub Pages):

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. Opening the HTML files straight from the filesystem mostly works, but the local server matches GitHub Pages exactly (relative paths, the `404.html` fallback, and `localStorage` per origin).

## Deployment

- Hosted on **GitHub Pages** from the `main` branch, repository root, no build step. Pushing to `main` redeploys within a minute or two.
- `404.html` is served automatically for any missing path (`custom_404` is enabled on the Pages site). Its links are rewritten at runtime so they keep working from deep URLs.
- Cache-busting: every stylesheet and script is loaded with `?v=<stamp>` (`20261126b`). Bump that stamp in the HTML files whenever you change a CSS or JS file so returning visitors do not get a stale copy.
- `manifest.webmanifest` plus `assets/img/icon-192.png` / `icon-512.png` let Android Chrome (and desktop Chrome/Edge) install the desk as a standalone app from the browser menu. The icons are rasterised from `assets/img/favicon.svg`.
- Fonts are self-hosted in `assets/fonts/` (Inter and Newsreader, SIL Open Font License 1.1) and are declared in `assets/css/fonts.css`; there are no third-party requests anywhere on the site.

## Notes on the data

- Prelims answer keys come from a third-party compilation and are shown with a warning banner on the practice page. Verify against UPSC's official keys before trusting a score.
- Mains entries carry `marks` only where the source page listed them; older entries show just the question and a source link.
- All progress (syllabus ticks, written answers, bookmarks, attempts, streak) is stored in `localStorage` under the `cp_*` keys. Nothing leaves the browser; use **Export Progress JSON** on the Prelims page to keep a backup.

## Design changelog

See [CHANGELOG.md](CHANGELOG.md) for the latest visual, responsive and
accessibility pass: palette, typography, 3D cube, India maps, verification
results and known limitations.
