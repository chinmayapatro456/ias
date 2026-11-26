#!/usr/bin/env python3
"""Compose the redesigned index.html, reusing the vetted India map SVG from the
current file verbatim (the outline path must never be retyped by hand)."""
import re

V = "20261127i"
src = open("index.html").read()

# ---- pull the existing India map SVG out of the page ----------------------
i = src.index('<svg\n              class="india-svg"')
j = src.index("</svg>", i) + len("</svg>")
svg = src[i:j]

# tag the mainland path so it can be reused as a clip for the zone tint
svg = svg.replace(
    '<path class="india-outline" data-draw-path',
    '<path id="india-mainland" class="india-outline" data-draw-path',
    1,
)

# clip path + faint Optional-zone tint, then pulsing city dots.
# City coordinates are derived from the repo's own Albers projection
# (scripts/build-geo.py) calibrated against the two reference points already
# in the file — no hand-placed geography.
clip = """
              <defs>
                <clipPath id="india-zone-clip">
                  <use href="#india-mainland"></use>
                </clipPath>
                <linearGradient id="india-zone-wash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--band-zone)" stop-opacity="0.15"></stop>
                  <stop offset="55%" stop-color="var(--band-zone)" stop-opacity="0.85"></stop>
                  <stop offset="100%" stop-color="var(--band-zone)" stop-opacity="0.35"></stop>
                </linearGradient>
              </defs>
"""
svg = svg.replace(
    'Simplified outline of India including Jammu and Kashmir, Ladakh, Arunachal Pradesh, the Andaman and Nicobar Islands and Lakshadweep, with a latitude and longitude graticule, the Tropic of Cancer, New Delhi and Kanyakumari marked.</desc>',
    "Simplified outline of India including Jammu and Kashmir, Ladakh, Arunachal Pradesh, the Andaman and Nicobar Islands and Lakshadweep, with a latitude and longitude graticule, the Tropic of Cancer, and New Delhi, Mumbai, Kolkata, Chennai and Kanyakumari marked.</desc>" + clip,
    1,
)

tint_and_dots = """
              <!-- Faint Optional-zone wash, clipped to the mainland outline -->
              <rect class="india-zone-wash" x="-190" y="-10" width="700" height="640"
                    clip-path="url(#india-zone-clip)" aria-hidden="true"></rect>

              <!-- Pulsing study points (positions from the repo's Albers projection) -->
              <g class="india-pulse" aria-hidden="true">
                <circle class="india-pulse-ring" cx="82.0" cy="367.0" r="5"></circle>
                <circle class="india-pulse-core" cx="82.0" cy="367.0" r="2.6"></circle>
                <circle class="india-pulse-ring" cx="369.0" cy="294.0" r="5" style="animation-delay:0.7s"></circle>
                <circle class="india-pulse-core" cx="369.0" cy="294.0" r="2.6"></circle>
                <circle class="india-pulse-ring" cx="221.0" cy="493.0" r="5" style="animation-delay:1.4s"></circle>
                <circle class="india-pulse-core" cx="221.0" cy="493.0" r="2.6"></circle>
              </g>
"""
svg = svg.replace("              <!-- Reference points -->", tint_and_dots + "\n              <!-- Reference points -->", 1)

# Mumbai / Kolkata / Chennai labels on the pulse dots
svg = svg.replace(
    """              <g class="india-marker india-marker--south">
                <circle cx="165.7" cy="592.9" r="3.6"></circle>
                <text x="152" y="592" text-anchor="end">Kanyakumari</text>
              </g>""",
    """              <g class="india-marker india-marker--south">
                <circle cx="165.7" cy="592.9" r="3.6"></circle>
                <text x="152" y="592" text-anchor="end">Kanyakumari</text>
              </g>
              <g class="india-marker india-marker--city">
                <text x="92" y="371" class="india-marker-city">Mumbai</text>
                <text x="379" y="298" class="india-marker-city">Kolkata</text>
                <text x="231" y="497" class="india-marker-city">Chennai</text>
              </g>""",
    1,
)

MONOGRAM = """<span class="nav-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
            <g transform="translate(-3.50 1.95)">
            <path d="M33.7 47.8 L33.2 47.9 L32.8 47.7 L32.7 47.6 L32.9 47.7 L33.2 47.8 L33.4 48.1 L33.6 48.4 L33.8 48.8 L33.9 49.2 L34.0 49.7 L34.2 50.3 L34.4 51.0 L34.4 51.0 L35.2 51.2 L35.9 51.1 L36.5 51.0 L37.0 50.7 L37.5 50.5 L38.0 50.2 L38.5 49.8 L39.0 49.4 L39.4 48.9 L39.3 48.2 L38.9 47.5 L38.3 47.1Z" class="mark-flame mark-flame--deep"/>
            <path d="M42.2 41.7 L42.1 42.4 L41.7 42.8 L41.7 43.0 L42.1 43.0 L42.6 43.2 L43.1 43.5 L43.7 43.9 L44.2 44.4 L44.8 45.1 L45.3 46.0 L45.9 46.9 L46.6 48.1 L46.6 48.1 L47.7 47.1 L48.3 46.0 L48.7 44.8 L49.1 43.6 L49.2 42.4 L49.3 41.2 L49.2 40.1 L49.0 38.9 L48.7 37.7 L47.7 36.9 L46.4 36.5 L45.3 36.6Z" class="mark-flame mark-flame--deep"/>
            <path d="M44.0 32.1 L45.0 32.7 L45.5 33.3 L46.1 33.4 L46.7 33.0 L47.4 32.7 L48.3 32.5 L49.4 32.4 L50.6 32.4 L51.9 32.6 L53.4 33.0 L54.9 33.5 L56.9 34.1 L56.9 34.1 L56.6 32.0 L55.8 30.2 L54.8 28.6 L53.6 27.2 L52.3 26.0 L50.9 24.9 L49.3 24.0 L47.7 23.2 L46.0 22.7 L44.2 23.0 L42.7 24.0 L41.6 25.3Z" class="mark-flame mark-flame--deep"/>
            <path d="M38.8 23.9 L40.1 23.4 L41.2 23.1 L41.8 22.6 L42.1 21.7 L42.4 20.7 L43.0 19.6 L43.7 18.6 L44.6 17.5 L45.8 16.5 L47.2 15.4 L48.8 14.4 L50.7 13.2 L50.7 13.2 L48.6 12.0 L46.5 11.4 L44.3 11.2 L42.2 11.3 L40.1 11.5 L38.1 12.1 L36.2 12.8 L34.3 13.8 L32.6 14.9 L31.6 16.6 L31.3 18.7 L31.4 20.6Z" class="mark-flame mark-flame--deep"/>
            <path d="M28.7 21.7 L29.3 20.5 L29.8 19.8 L30.0 19.1 L29.5 18.4 L29.0 17.6 L28.6 16.7 L28.3 15.6 L28.1 14.5 L28.0 13.2 L28.0 11.8 L28.2 10.2 L28.2 8.2 L28.2 8.2 L26.3 8.8 L24.7 9.8 L23.4 11.0 L22.2 12.3 L21.2 13.7 L20.3 15.2 L19.6 16.8 L19.0 18.4 L18.6 20.2 L19.1 21.8 L20.2 23.2 L21.5 24.3Z" class="mark-flame mark-flame--deep"/>
            <path d="M19.7 27.8 L19.6 26.9 L19.7 26.2 L19.5 25.8 L19.0 25.8 L18.3 25.8 L17.7 25.6 L16.9 25.4 L16.2 25.0 L15.4 24.5 L14.6 24.0 L13.7 23.3 L12.4 22.5 L12.4 22.5 L11.6 23.8 L11.3 25.0 L11.2 26.3 L11.2 27.6 L11.3 28.8 L11.6 30.0 L11.9 31.2 L12.4 32.4 L13.1 33.5 L14.2 34.1 L15.6 34.2 L16.8 33.9Z" class="mark-flame mark-flame--deep"/>
            <path d="M18.1 38.2 L17.6 37.6 L17.4 37.1 L17.2 37.0 L17.0 37.3 L16.7 37.6 L16.3 38.0 L15.8 38.3 L15.3 38.5 L14.7 38.8 L14.0 39.0 L13.2 39.3 L12.2 39.7 L12.2 39.7 L12.4 40.8 L12.8 41.6 L13.3 42.4 L13.9 43.1 L14.5 43.7 L15.2 44.2 L16.0 44.7 L16.8 45.1 L17.7 45.4 L18.5 45.1 L19.4 44.4 L19.8 43.6Z" class="mark-flame mark-flame--deep"/>
            <path d="M23.5 45.9 L23.0 45.7 L22.7 45.3 L22.6 45.3 L22.7 45.6 L22.7 45.9 L22.7 46.3 L22.6 46.7 L22.4 47.1 L22.2 47.6 L21.9 48.1 L21.6 48.6 L21.3 49.4 L21.3 49.4 L21.9 50.1 L22.5 50.4 L23.1 50.7 L23.8 50.9 L24.4 51.0 L25.1 51.0 L25.8 51.0 L26.4 50.9 L27.1 50.8 L27.6 50.2 L27.7 49.4 L27.6 48.6Z" class="mark-flame mark-flame--deep"/>
            <path d="M20.0 30.3 L19.9 29.8 L20.1 29.3 L20.0 29.1 L19.7 29.1 L19.2 29.0 L18.7 28.9 L18.2 28.6 L17.7 28.3 L17.2 27.8 L16.6 27.3 L16.0 26.6 L15.2 25.9 L15.2 25.9 L14.6 26.9 L14.4 27.8 L14.2 28.8 L14.2 29.7 L14.3 30.6 L14.4 31.5 L14.6 32.4 L15.0 33.3 L15.4 34.1 L16.2 34.6 L17.3 34.8 L18.2 34.6Z" class="mark-flame mark-flame--mid"/>
            <path d="M27.7 23.4 L28.1 22.8 L28.5 22.5 L28.6 22.1 L28.3 21.7 L28.1 21.2 L27.9 20.6 L27.8 19.9 L27.7 19.2 L27.7 18.3 L27.9 17.3 L28.0 16.3 L28.2 15.0 L28.2 15.0 L26.9 15.3 L25.8 15.9 L24.8 16.5 L24.0 17.3 L23.2 18.2 L22.5 19.1 L22.0 20.1 L21.5 21.1 L21.1 22.2 L21.4 23.3 L22.0 24.4 L22.9 25.0Z" class="mark-flame mark-flame--mid"/>
            <path d="M37.4 24.8 L38.1 24.6 L38.7 24.6 L39.1 24.4 L39.3 23.9 L39.6 23.3 L40.0 22.8 L40.5 22.2 L41.2 21.6 L41.9 21.0 L42.9 20.5 L43.9 19.9 L45.2 19.2 L45.2 19.2 L44.0 18.4 L42.7 17.9 L41.4 17.7 L40.1 17.5 L38.8 17.6 L37.6 17.7 L36.4 18.0 L35.2 18.4 L34.1 18.9 L33.3 19.9 L32.9 21.2 L33.0 22.3Z" class="mark-flame mark-flame--mid"/>
            <path d="M42.6 32.2 L42.9 32.6 L42.9 33.1 L43.1 33.2 L43.4 33.0 L43.9 32.9 L44.4 32.9 L45.0 32.9 L45.7 33.0 L46.4 33.2 L47.2 33.5 L48.1 33.9 L49.2 34.4 L49.2 34.4 L49.2 33.2 L48.9 32.1 L48.5 31.1 L48.0 30.2 L47.4 29.4 L46.8 28.6 L46.1 28.0 L45.3 27.4 L44.4 26.9 L43.5 26.8 L42.4 27.2 L41.7 27.9Z" class="mark-flame mark-flame--mid"/>
            <path d="M41.2 40.9 L41.0 41.2 L40.6 41.4 L40.6 41.4 L40.8 41.5 L41.1 41.7 L41.4 41.9 L41.6 42.3 L41.9 42.7 L42.2 43.1 L42.4 43.7 L42.7 44.3 L43.0 45.1 L43.0 45.1 L43.7 44.5 L44.2 43.9 L44.5 43.3 L44.8 42.7 L45.0 42.0 L45.2 41.3 L45.3 40.7 L45.3 40.0 L45.3 39.3 L44.9 38.7 L44.1 38.3 L43.4 38.2Z" class="mark-flame mark-flame--mid"/>
            <path d="M35.6 45.8 L35.2 45.8 L35.0 45.6 L34.9 45.5 L35.0 45.6 L35.2 45.8 L35.3 46.0 L35.3 46.3 L35.4 46.7 L35.4 47.0 L35.4 47.4 L35.3 47.9 L35.4 48.5 L35.4 48.5 L36.0 48.6 L36.5 48.5 L37.0 48.3 L37.4 48.2 L37.8 48.0 L38.2 47.7 L38.6 47.5 L38.9 47.2 L39.2 46.8 L39.3 46.3 L39.0 45.7 L38.6 45.3Z" class="mark-flame mark-flame--mid"/>
            <circle cx="31.0" cy="35.0" r="16.4" class="mark-plate"/>
            <circle cx="31.0" cy="35.0" r="16.4" class="mark-plate-ring" fill="none" stroke-width="1"/>
            <text x="31.0" y="42.1" text-anchor="middle" class="mark-text" font-size="20" letter-spacing="-0.6">CP</text>
            <path d="M53.0 14.9C50.8 12.1 51.8 10.7 53.0 10.1C54.2 10.7 55.2 12.1 53.0 14.9Z" class="mark-flame mark-flame--mid" transform="rotate(30 53.0 12.5)"/>
            <path d="M58.5 24.7C57.0 22.7 57.6 21.7 58.5 21.3C59.4 21.7 60.0 22.7 58.5 24.7Z" class="mark-flame mark-flame--deep" transform="rotate(36 58.5 23.0)"/>
            </g>
          </svg>
        </span>"""


def nav(depth, current):
    """Shared sticky header + drawer, with the monogram mark."""
    p = "../" if depth else "./"
    items = [
        ("index.html", "Home"),
        ("syllabus/index.html", "Syllabus"),
        ("mains-pyqs/index.html", "Mains PYQs"),
        ("optional-pyqs/index.html", "Optional PYQs"),
        ("prelims-practice/index.html", "Prelims Practice"),
    ]
    links = "\n".join(
        '          <li><a class="nav-link" href="%s%s"%s>%s</a></li>'
        % (p, href, ' aria-current="page"' if href == current else "", label)
        for href, label in items
    )
    drawer_links = "\n".join(
        '      <li><a class="nav-link" href="%s%s"%s>%s</a></li>'
        % (p, href, ' aria-current="page"' if href == current else "", label)
        for href, label in items
    )
    return f"""  <header class="site-nav">
    <div class="container nav-inner">
      <a class="nav-brand" href="{p}index.html">
        {MONOGRAM}
        <span>Chinmaya Patro</span>
      </a>

      <nav aria-label="Primary navigation">
        <ul class="nav-links">
{links}
        </ul>
      </nav>

      <div class="nav-actions">
        <button
          type="button"
          class="theme-toggle"
          data-theme-toggle
          aria-pressed="false"
          aria-label="Switch to dark theme"
          title="Switch to dark theme"
        >
          <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"></path>
          </svg>
          <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"></path>
          </svg>
        </button>

        <button
          type="button"
          class="nav-toggle"
          data-nav-toggle
          aria-expanded="false"
          aria-controls="mobile-nav-drawer"
          aria-label="Open navigation menu"
        >
          <svg data-icon-menu viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="17" x2="20" y2="17"></line>
          </svg>
          <svg data-icon-close style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18"></line>
            <line x1="18" y1="6" x2="6" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <div class="nav-backdrop" data-nav-backdrop></div>
  <nav id="mobile-nav-drawer" class="nav-drawer" data-nav-drawer aria-label="Mobile navigation" aria-hidden="true">
    <div class="nav-drawer-head">
      <span>Menu</span>
      <button type="button" class="nav-drawer-close" data-nav-close aria-label="Close navigation menu">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18"></line>
          <line x1="18" y1="6" x2="6" y2="18"></line>
        </svg>
      </button>
    </div>
    <ul class="nav-drawer-list">
{drawer_links}
    </ul>
  </nav>"""


def footer(depth):
    p = "../" if depth else "./"
    return f"""  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-top">
        <span class="footer-brand">Chinmaya Patro · UPSC Study Desk</span>
        <ul class="footer-links">
          <li><a href="{p}index.html">Home</a></li>
          <li><a href="{p}syllabus/index.html">Syllabus</a></li>
          <li><a href="{p}mains-pyqs/index.html">Mains PYQs</a></li>
          <li><a href="{p}optional-pyqs/index.html">Optional PYQs</a></li>
          <li><a href="{p}prelims-practice/index.html">Prelims Practice</a></li>
        </ul>
      </div>
      <p class="footer-disclaimer">
        Personal open study workspace built for self-preparation. <strong>Not affiliated with UPSC</strong> (Union Public Service Commission) or any government body. All progress is stored locally in your browser.
      </p>
      <p class="footer-credit">
        India map: boundary data from DataMeet-derived district boundaries (udit-001/india-maps-data),
        projected Albers equal-area and simplified. Type: Newsreader, Inter and JetBrains Mono, self-hosted.
      </p>
    </div>
  </footer>"""


CUBE_FACES = """              <button type="button" class="cube-face cube-face--front" data-cube-face="front"
                      data-href="./mains-pyqs/index.html?paper=GS%20Paper%20II"
                      aria-label="Polity — open Mains GS Paper II questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <path d="M3 9h18M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 18h18M12 4l9 5H3z"></path>
                </svg>
                <span>Polity</span>
              </button>
              <button type="button" class="cube-face cube-face--back" data-cube-face="back"
                      data-href="./mains-pyqs/index.html?paper=GS%20Paper%20I"
                      aria-label="History — open Mains GS Paper I questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5"></path>
                </svg>
                <span>History</span>
              </button>
              <button type="button" class="cube-face cube-face--right" data-cube-face="right"
                      data-href="./optional-pyqs/index.html"
                      aria-label="Geography — open Geography Optional questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5"></circle>
                  <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"></path>
                </svg>
                <span>Geography</span>
              </button>
              <button type="button" class="cube-face cube-face--left" data-cube-face="left"
                      data-href="./mains-pyqs/index.html?paper=GS%20Paper%20III"
                      aria-label="Economy — open Mains GS Paper III questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <path d="M4 19V5M4 19h16M8 15v-4M12.5 15V8M17 15v-6"></path>
                </svg>
                <span>Economy</span>
              </button>
              <button type="button" class="cube-face cube-face--top" data-cube-face="top"
                      data-href="./mains-pyqs/index.html?paper=GS%20Paper%20III"
                      aria-label="Environment — open Mains GS Paper III questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <path d="M20 4c0 9-5.5 14-12 14H5c0-8 6-14 15-14z"></path>
                  <path d="M4 21c2-6 6-9 12-11"></path>
                </svg>
                <span>Environment</span>
              </button>
              <button type="button" class="cube-face cube-face--bottom" data-cube-face="bottom"
                      data-href="./mains-pyqs/index.html?paper=GS%20Paper%20IV"
                      aria-label="Ethics — open Mains GS Paper IV questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 5a3 3 0 0 0 5 0zM19 8l2.5 5a3 3 0 0 1-5 0z"></path>
                </svg>
                <span>Ethics</span>
              </button>"""


def stat_card(kind, label, icon, count_id, meta_id, meta_text, meter_label):
    return f"""          <article class="card stat-card stat-card--{kind}" data-stat="{kind}" data-state="loading">
            <span class="stat-band" aria-hidden="true"></span>
            <div class="stat-head">
              <span class="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{icon}</svg>
              </span>
              <span class="stat-label">{label}</span>
            </div>
            <p class="stat-value" id="{count_id}" data-counter data-target="0">—</p>
            <p class="stat-meta" id="{meta_id}">{meta_text}</p>
            <div class="stat-meter">
              <span class="meter" role="presentation"><span class="meter-fill" data-stat-meter></span></span>
              <span class="stat-meter-label" data-stat-meter-label>{meter_label}</span>
            </div>
            <div class="stat-skeleton" aria-hidden="true">
              <span class="skeleton skeleton--value"></span>
              <span class="skeleton skeleton--line"></span>
            </div>
          </article>"""


ICON_SYLLABUS = '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"></path><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"></path>'
ICON_MAINS = '<path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5"></path>'
ICON_OPTIONAL = '<circle cx="12" cy="12" r="8.5"></circle><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"></path>'
ICON_PRELIMS = '<path d="M4 6h16M4 12h16M4 18h10"></path><circle cx="18" cy="18" r="2.5"></circle>'

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Chinmaya Patro — UPSC Civil Services Aspirant (Geography Optional). Public study desk with interactive syllabus tracker, Mains PYQs, Geography Optional PYQs, and Prelims practice.">
  <title>Chinmaya Patro — UPSC Civil Services Aspirant</title>
  <link rel="icon" type="image/svg+xml" href="./assets/img/favicon.svg">
  <link rel="canonical" href="https://chinmayapatro456.github.io/ias/">
  <meta name="theme-color" content="#FAF8F5">
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./assets/img/icon-192.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Chinmaya Patro · UPSC Study Desk">
  <meta property="og:title" content="Chinmaya Patro — UPSC Civil Services Aspirant">
  <meta property="og:description" content="Chinmaya Patro — UPSC Civil Services Aspirant (Geography Optional). Public study desk with interactive syllabus tracker, Mains PYQs, Geography Optional PYQs, and Prelims practice.">
  <meta property="og:url" content="https://chinmayapatro456.github.io/ias/">
  <meta property="og:image" content="https://chinmayapatro456.github.io/ias/assets/img/banner.webp">
  <meta property="og:image:width" content="967">
  <meta property="og:image:height" content="728">
  <meta property="og:image:alt" content="Chinmaya Patro at the UPSC gate, Dholpur House, New Delhi">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Chinmaya Patro — UPSC Civil Services Aspirant">
  <meta name="twitter:description" content="Chinmaya Patro — UPSC Civil Services Aspirant (Geography Optional). Public study desk with interactive syllabus tracker, Mains PYQs, Geography Optional PYQs, and Prelims practice.">
  <meta name="twitter:image" content="https://chinmayapatro456.github.io/ias/assets/img/banner.webp">

  <link rel="preload" href="./assets/fonts/newsreader-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="./assets/fonts/inter-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="./assets/img/banner-967.webp" as="image" fetchpriority="high">
  <script>
    /* Apply the saved theme before first paint. Light is the default. */
    try {{
      if (localStorage.getItem('cp_theme') === 'dark') {{
        document.documentElement.setAttribute('data-theme', 'dark');
      }}
    }} catch (e) {{}}
  </script>
  <link rel="stylesheet" href="./assets/css/fonts.css?v={V}">
  <link rel="stylesheet" href="./assets/css/tokens.css?v={V}">
  <link rel="stylesheet" href="./assets/css/base.css?v={V}">
  <link rel="stylesheet" href="./assets/css/home.css?v={V}">
</head>
<body class="page-home">
  <a class="skip-link" href="#main-content">Skip to main content</a>

{nav(0, "index.html")}

  <main id="main-content">
    <!-- Hero: gate photograph, then the editorial opening.
         H1 is the name only; the role lives in the eyebrow above it so the
         heading never runs past two lines on a 360px phone. -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-band">
        <picture>
          <source
            type="image/avif"
            srcset="./assets/img/banner-480.avif 480w, ./assets/img/banner-720.avif 720w, ./assets/img/banner-967.avif 967w"
            sizes="100vw"
          >
          <source
            type="image/webp"
            srcset="./assets/img/banner-480.webp 480w, ./assets/img/banner-720.webp 720w, ./assets/img/banner-967.webp 967w"
            sizes="100vw"
          >
          <img
            src="./assets/img/banner-967.webp"
            alt="Chinmaya Patro standing outside the Union Public Service Commission gate at Dholpur House, New Delhi"
            width="967"
            height="728"
            decoding="async"
            fetchpriority="high"
          >
        </picture>
        <span class="hero-band-tag">Dholpur House · New Delhi</span>
      </div>

      <div class="container hero-grid">
        <div class="hero-text">
          <div class="hero-identity">
            <div class="profile-ring">
              <img
                src="./assets/img/profile.webp"
                alt="Portrait of Chinmaya Patro"
                width="84"
                height="84"
                decoding="async"
              >
            </div>
            <div class="hero-identity-text">
              <p class="eyebrow hero-eyebrow">Public study desk</p>
              <p class="hero-subtitle">UPSC Civil Services Aspirant — Geography Optional</p>
            </div>
          </div>

          <h1 id="hero-title">Chinmaya <span class="accent">Patro</span></h1>

          <p class="lead hero-intro">
            Preparing for the Civil Services Examination with Geography as my optional.
            This is the desk I actually study at — the official syllabus, four decades of
            past-year questions and daily Prelims drills, with every tick saved privately
            in this browser.
          </p>

          <div class="hero-actions">
            <a class="btn btn-primary hero-cta hero-cta--primary" href="./prelims-practice/index.html">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"></path>
                <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"></path>
              </svg>
              <span>Start today’s Prelims drill</span>
            </a>
            <ul class="hero-links">
              <li><a class="hero-link" href="./syllabus/index.html">Syllabus tracker</a></li>
              <li><a class="hero-link" href="./mains-pyqs/index.html">Mains PYQs</a></li>
              <li><a class="hero-link" href="./optional-pyqs/index.html">Optional PYQs</a></li>
            </ul>
          </div>

          <!-- Today strip — streak, topics this week, continue. Read from
               localStorage; each cell degrades to a prompt when empty. -->
          <section class="today-strip" aria-labelledby="today-heading" data-today>
            <div class="today-head">
              <h2 class="today-title" id="today-heading">Today</h2>
              <span class="today-date" data-today-date></span>
            </div>
            <dl class="today-grid">
              <div class="today-cell">
                <dt class="today-label">Streak</dt>
                <dd class="today-value" data-today-streak>—</dd>
              </div>
              <div class="today-cell">
                <dt class="today-label">Topics this week</dt>
                <dd class="today-value" data-today-topics>—</dd>
              </div>
              <div class="today-cell today-cell--continue">
                <dt class="today-label">Continue</dt>
                <dd class="today-value today-value--link">
                  <a class="today-continue" href="./prelims-practice/index.html" data-today-continue>Start your first drill</a>
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <!-- Subject cube, now in its own panel instead of sitting on the photo -->
        <aside class="hero-aside cube-panel" aria-labelledby="cube-title">
          <div class="cube-panel-head">
            <h2 class="cube-panel-title" id="cube-title">Six pillars</h2>
            <span class="cube-panel-meta">Drag · tap</span>
          </div>
          <div class="cube-pedestal" data-cube>
            <div class="cube-stage" data-cube-stage>
              <div class="cube" data-cube-body>
{CUBE_FACES}
              </div>
            </div>
            <p class="cube-hint" aria-hidden="true">Drag to spin · tap a face</p>
          </div>
          <p class="cube-caption">The examination cycle, one face per subject</p>

          <div class="cube-chips" role="group" aria-label="Jump to a subject">
            <a class="cube-chip" href="./mains-pyqs/index.html?paper=GS%20Paper%20II">Polity</a>
            <a class="cube-chip" href="./mains-pyqs/index.html?paper=GS%20Paper%20I">History</a>
            <a class="cube-chip" href="./optional-pyqs/index.html">Geography</a>
            <a class="cube-chip" href="./mains-pyqs/index.html?paper=GS%20Paper%20III">Economy</a>
            <a class="cube-chip" href="./mains-pyqs/index.html?paper=GS%20Paper%20III">Environment</a>
            <a class="cube-chip" href="./mains-pyqs/index.html?paper=GS%20Paper%20IV">Ethics</a>
          </div>
        </aside>
      </div>
    </section>

    <!-- Slim exam-timeline strip — a visual anchor between hero and inventory -->
    <section class="timeline-strip" aria-labelledby="timeline-heading">
      <div class="container">
        <h2 class="sr-only" id="timeline-heading">The examination cycle</h2>
        <ol class="timeline">
          <li class="timeline-step timeline-step--prelims">
            <span class="timeline-dot" aria-hidden="true"></span>
            <span class="timeline-name">Prelims</span>
            <span class="timeline-meta">Objective · 2 papers</span>
          </li>
          <li class="timeline-step timeline-step--mains">
            <span class="timeline-dot" aria-hidden="true"></span>
            <span class="timeline-name">Mains</span>
            <span class="timeline-meta">Written · 9 papers</span>
          </li>
          <li class="timeline-step timeline-step--interview">
            <span class="timeline-dot" aria-hidden="true"></span>
            <span class="timeline-name">Interview</span>
            <span class="timeline-meta">Personality test · 275</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- Desk inventory — one stage-coloured card per pillar -->
    <section class="section stats-section" aria-labelledby="stats-heading">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Desk inventory</span>
          <h2 id="stats-heading">Everything on the desk, counted live</h2>
          <p class="lead">Four totals, rebuilt from the data files and your own browser every time this page opens.</p>
        </div>

        <div class="stats-grid reveal">
{stat_card("syllabus", "Syllabus topics", ICON_SYLLABUS, "count-syllabus", "meta-syllabus", "Reading syllabus data…", "covered")}
{stat_card("mains", "Mains PYQs", ICON_MAINS, "count-mains", "meta-mains", "Reading Mains data…", "written")}
{stat_card("optional", "Geography optional", ICON_OPTIONAL, "count-optional", "meta-optional", "Reading Optional data…", "attempted")}
{stat_card("prelims", "Prelims questions", ICON_PRELIMS, "count-prelims", "meta-prelims", "Reading Prelims data…", "streak")}
        </div>
      </div>
    </section>

    <!-- Three stages: one sentence and three micro-stats each -->
    <section class="section section--subtle" aria-labelledby="preparing-heading">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Three stages</span>
          <h2 id="preparing-heading">What I’m preparing</h2>
          <p class="lead">Each stage has its own rhythm — objective elimination, structured synthesis, then spatial depth.</p>
        </div>

        <div class="trio-grid">
          <article class="card card--interactive tilt-card prep-card prep-card--prelims reveal pressable" data-tilt data-tilt-max="5">
            <span class="prep-band" aria-hidden="true"></span>
            <span class="prep-num" aria-hidden="true">01</span>
            <div class="prep-top">
              <h3>Prelims</h3>
              <span class="tag tag--stage">Stage I · Objective</span>
            </div>
            <p>Daily MCQ drills and timed full-paper simulations with strict UPSC marking.</p>
            <ul class="prep-stats">
              <li><span class="prep-stat-value">100 Q</span><span class="prep-stat-label">per paper</span></li>
              <li><span class="prep-stat-value">2 hrs</span><span class="prep-stat-label">countdown</span></li>
              <li><span class="prep-stat-value">+2 / −0.66</span><span class="prep-stat-label">marking</span></li>
            </ul>
            <div class="prep-card-foot">
              <a class="prep-link" href="./prelims-practice/index.html">Open Prelims practice <span aria-hidden="true">→</span></a>
            </div>
          </article>

          <article class="card card--interactive tilt-card prep-card prep-card--mains reveal pressable" data-tilt data-tilt-max="5">
            <span class="prep-band" aria-hidden="true"></span>
            <span class="prep-num" aria-hidden="true">02</span>
            <div class="prep-top">
              <h3>Mains</h3>
              <span class="tag tag--stage">Stage II · Written</span>
            </div>
            <p>GS I–IV and Essay, grouped by theme, with a written-answer log you tick yourself.</p>
            <ul class="prep-stats">
              <li><span class="prep-stat-value">19</span><span class="prep-stat-label">groups</span></li>
              <li><span class="prep-stat-value">2013–26</span><span class="prep-stat-label">papers</span></li>
              <li><span class="prep-stat-value">GS I–IV</span><span class="prep-stat-label">+ essay</span></li>
            </ul>
            <div class="prep-card-foot">
              <a class="prep-link" href="./mains-pyqs/index.html">Browse Mains PYQs <span aria-hidden="true">→</span></a>
            </div>
          </article>

          <article class="card card--interactive tilt-card prep-card prep-card--optional reveal pressable" data-tilt data-tilt-max="5">
            <span class="prep-band" aria-hidden="true"></span>
            <span class="prep-num" aria-hidden="true">03</span>
            <div class="prep-top">
              <h3>Geography optional</h3>
              <span class="tag tag--stage">Optional · 500 marks</span>
            </div>
            <p>Four decades of Paper I and Paper II questions, ranked by topic and mapped by region.</p>
            <ul class="prep-stats">
              <li><span class="prep-stat-value">1986–2026</span><span class="prep-stat-label">papers</span></li>
              <li><span class="prep-stat-value">Paper I &amp; II</span><span class="prep-stat-label">+ mapping</span></li>
              <li><span class="prep-stat-value">8</span><span class="prep-stat-label">regions</span></li>
            </ul>
            <div class="prep-card-foot">
              <a class="prep-link" href="./optional-pyqs/index.html">Explore Optional PYQs <span aria-hidden="true">→</span></a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Strong-contrast band: the map, larger, with a faint Optional wash -->
    <section class="band band--map" aria-labelledby="map-heading">
      <div class="container band-grid">
        <div class="band-copy reveal">
          <span class="eyebrow">Geography optional</span>
          <h2 id="map-heading">India, held in one frame</h2>
          <p class="lead">
            Every Optional question eventually points back to a place. Keeping the map in
            view turns a list of topics into a picture you can reason with.
          </p>
          <ul class="band-facts">
            <li><span class="band-fact-value">8°4′–37°6′ N</span><span class="band-fact-label">Latitude</span></li>
            <li><span class="band-fact-value">68°7′–97°25′ E</span><span class="band-fact-label">Longitude</span></li>
            <li><span class="band-fact-value">3,214 km</span><span class="band-fact-label">North to south</span></li>
          </ul>
          <a class="band-link" href="./optional-pyqs/index.html">Practise mapping questions <span aria-hidden="true">→</span></a>
        </div>

        <figure class="band-map reveal">
{svg}
          <figcaption class="band-caption">
            Tropic of Cancer at 23.5° N. Marked points: New Delhi, Mumbai, Kolkata, Chennai and Kanyakumari.
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Working notes -->
    <section class="section" aria-labelledby="approach-heading">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Working notes</span>
          <h2 id="approach-heading">My approach</h2>
          <p class="lead">Three quiet rules that keep preparation grounded when the reading list grows too loud.</p>
        </div>

        <ol class="principles-list">
          <li class="principle-item reveal">
            <span class="principle-index" aria-hidden="true">01</span>
            <div>
              <h3>Syllabus and PYQs first, sources second</h3>
              <p>Every reading session starts with the official syllabus line and past UPSC questions, so books serve the exam rather than the other way around.</p>
            </div>
          </li>

          <li class="principle-item reveal">
            <span class="principle-index" aria-hidden="true">02</span>
            <div>
              <h3>Small, verifiable daily loops</h3>
              <p>Ticking off a syllabus sub-topic, logging one written Mains answer, or reviewing ten wrong Prelims MCQs beats ambitious plans that never survive a week.</p>
            </div>
          </li>

          <li class="principle-item reveal">
            <span class="principle-index" aria-hidden="true">03</span>
            <div>
              <h3>Spatial thinking across every paper</h3>
              <p>Geography is not confined to the Optional paper — maps, regional patterns and human-environment links sharpen GS I, GS III and International Relations alike.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  </main>

{footer(0)}

  <!-- Deferred data scripts for live desk counts (page remains fully functional if empty/pending) -->
  <script src="./data/syllabus-data.js?v={V}" defer></script>
  <script src="./data/mains-data.js?v={V}" defer></script>
  <script src="./data/optional-data.js?v={V}" defer></script>
  <script src="./data/prelims-data.js?v={V}" defer></script>

  <script src="./assets/js/storage.js?v={V}" defer></script>
  <script src="./assets/js/theme.js?v={V}" defer></script>
  <script src="./assets/js/data-counts.js?v={V}" defer></script>
  <script src="./assets/js/nav.js?v={V}" defer></script>
  <script src="./assets/js/motion.js?v={V}" defer></script>
  <script src="./assets/js/home.js?v={V}" defer></script>
</body>
</html>
"""

open("index.html", "w").write(html)
print("index.html written:", len(html), "bytes")
