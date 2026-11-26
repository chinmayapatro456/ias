# Chinmaya Patro — UPSC Civil Services Study Desk

A static, distraction-free personal study workspace for UPSC Civil Services preparation (Geography Optional), built with plain HTML, CSS, and vanilla JavaScript. Hosted free on GitHub Pages with zero backend, zero build step, zero external libraries, and browser-local progress storage.

## Sections

- **Home (`index.html`)** — Profile banner, live desk inventory counts, three-stage overview, approach notes, and animated SVG outline of India.
- **Syllabus (`syllabus/`)** — Collapsible topic checklist for Prelims, Mains (Essay & GS I–IV), and Geography Optional (Paper I & II) with search and per-paper SVG progress rings.
- **Mains PYQs (`mains-pyqs/`)** — 2013–2026 Mains questions across 19 subject groups with paper/topic/year/keyword filters, topic or year grouping, local bookmarks, "answer written" ticks, and Ethics case study source links.
- **Geography Optional PYQs (`optional-pyqs/`)** — 1986–2026 Paper I, Paper II, and Mapping questions with paper tabs, topic chips, year slider, "unattempted only" filter, and an animated SVG topic-frequency chart.
- **Prelims Practice (`prelims-practice/`)** — 1995–2026 Prelims bank (3,976 questions) with topic quizzes, year-wise full-paper timed simulations (2-hour countdown, 100 or 150 questions), custom drills, wrong/bookmarked revision, toggleable `+2 / −0.66` UPSC scoring, keyboard shortcuts (`A`–`D`, `N`, `P`), subject-wise breakdown, and JSON export/import backup.

## Updating Data Later

All content lives in `/data/` as plain browser globals—you never need to edit HTML, CSS, or page JS to add new questions or years:

| File | Window Global(s) | Purpose |
| --- | --- | --- |
| `data/syllabus-data.js` | `window.SYLLABUS_DATA` | Prelims, Mains & Geography Optional syllabus tree |
| `data/mains-data.js` | `window.PYQ_METADATA`, `window.UPSC_MAINS_PYQS`, `window.PYQ_BY_TOPIC` | Mains PYQs (2013–2026) |
| `data/optional-data.js` | `window.PYQ_DATA` | Geography Optional PYQs (1986–2026) & topic order |
| `data/prelims-data.js` | `window.PRELIMS_DATA` | Prelims MCQ bank, 1995–2026 (3,976 questions; `incomplete` hidden; `no_key` & `source_marks_cancelled` unscored) |

## Local Preview

Run a simple local server from the repository root (so all relative paths behave identically to GitHub Pages):

```bash
python3 -m http.server 8000