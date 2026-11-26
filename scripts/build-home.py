#!/usr/bin/env python3
"""Compose the redesigned index.html, reusing the vetted India map SVG from the
current file verbatim (the outline path must never be retyped by hand)."""
import re

V = "20261127h"
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
            <g transform="translate(-3.30 1.55)">
            <path d="M32.7 32.4 L34.1 31.0 L35.4 29.9 L36.4 28.7 L37.0 27.2 L37.9 25.7 L38.9 24.3 L40.2 22.9 L41.8 21.6 L43.6 20.4 L45.7 19.3 L48.2 18.4 L51.0 17.4 L51.0 17.4 L48.1 16.3 L45.2 15.9 L42.4 16.0 L39.6 16.4 L37.0 17.1 L34.5 18.2 L32.2 19.5 L30.1 21.1 L28.2 22.9 L27.0 25.1 L26.5 27.6 L26.4 29.9Z" class="mark-flame mark-flame--deep"/>
            <path d="M34.9 35.2 L37.1 34.2 L39.0 33.4 L40.7 32.4 L42.1 31.1 L43.8 29.9 L45.7 28.9 L47.9 28.1 L50.3 27.6 L53.1 27.3 L56.0 27.5 L59.2 28.0 L62.8 28.7 L62.8 28.7 L60.2 26.0 L57.2 24.0 L54.0 22.6 L50.7 21.6 L47.4 21.1 L44.1 21.1 L40.9 21.5 L37.9 22.2 L35.0 23.4 L32.6 25.3 L30.9 27.7 L29.7 30.2Z" class="mark-flame mark-flame--deep"/>
            <path d="M35.7 38.4 L37.7 38.4 L39.5 38.5 L41.1 38.4 L42.8 37.8 L44.5 37.5 L46.3 37.3 L48.3 37.4 L50.5 37.7 L52.7 38.4 L55.0 39.4 L57.4 40.8 L60.1 42.5 L60.1 42.5 L58.9 39.5 L57.1 36.9 L55.1 34.7 L52.8 32.8 L50.4 31.3 L47.8 30.2 L45.1 29.4 L42.4 28.9 L39.7 28.7 L37.2 29.4 L35.0 30.8 L33.2 32.3Z" class="mark-flame mark-flame--deep"/>
            <path d="M35.1 41.7 L36.4 42.4 L37.5 43.1 L38.5 43.6 L39.7 43.6 L41.0 43.7 L42.2 44.1 L43.6 44.6 L44.9 45.3 L46.3 46.2 L47.7 47.4 L49.0 48.9 L50.6 50.5 L50.6 50.5 L50.7 48.1 L50.2 45.9 L49.5 43.9 L48.5 42.0 L47.3 40.2 L45.9 38.7 L44.4 37.3 L42.7 36.1 L41.0 35.1 L39.0 34.8 L37.1 35.1 L35.4 35.7Z" class="mark-flame mark-flame--deep"/>
            <path d="M33.5 44.4 L33.9 45.4 L34.3 46.2 L34.7 46.7 L35.5 46.9 L36.2 47.3 L37.0 47.7 L37.7 48.3 L38.5 48.9 L39.2 49.8 L39.9 50.7 L40.7 51.8 L41.6 53.1 L41.6 53.1 L42.3 51.6 L42.5 50.1 L42.6 48.7 L42.5 47.2 L42.2 45.8 L41.8 44.4 L41.2 43.1 L40.5 41.9 L39.7 40.7 L38.5 40.0 L37.2 39.7 L35.8 39.7Z" class="mark-flame mark-flame--deep"/>
            <path d="M28.4 30.3 L28.9 28.8 L29.2 27.4 L29.2 26.1 L28.7 24.8 L28.2 23.6 L27.6 22.3 L27.1 21.0 L26.7 19.6 L26.2 18.3 L25.7 16.9 L25.2 15.4 L24.4 13.9 L24.4 13.9 L23.2 15.2 L22.5 16.7 L21.9 18.2 L21.4 19.7 L21.0 21.2 L20.6 22.7 L20.3 24.3 L20.1 25.8 L19.9 27.4 L20.3 28.9 L21.2 30.2 L22.2 31.5Z" class="mark-flame mark-flame--deep"/>
            <path d="M23.1 31.1 L22.8 29.8 L22.3 28.7 L21.5 27.7 L20.4 27.3 L19.2 26.8 L18.0 26.4 L16.8 26.0 L15.6 25.7 L14.4 25.5 L13.2 25.4 L11.9 25.3 L10.5 25.6 L10.5 25.6 L11.1 26.9 L11.8 27.9 L12.5 28.8 L13.1 29.7 L13.7 30.6 L14.3 31.5 L14.9 32.4 L15.5 33.3 L16.0 34.2 L16.9 34.7 L18.0 35.0 L19.2 35.2Z" class="mark-flame mark-flame--deep"/>
            <path d="M19.2 34.8 L18.3 34.1 L17.3 33.5 L16.2 33.3 L15.1 33.6 L14.0 34.0 L13.0 34.4 L12.0 35.0 L11.0 35.5 L10.0 36.2 L9.2 37.0 L8.4 37.8 L7.8 39.0 L7.8 39.0 L9.0 39.4 L10.0 39.6 L11.0 39.8 L11.9 40.0 L12.8 40.2 L13.7 40.5 L14.5 40.8 L15.3 41.1 L16.0 41.4 L16.8 41.3 L17.6 40.8 L18.5 40.3Z" class="mark-flame mark-flame--deep"/>
            <path d="M18.5 40.9 L17.4 40.9 L16.3 41.0 L15.4 41.4 L14.8 42.3 L14.3 43.2 L13.8 44.1 L13.4 45.0 L13.1 46.0 L12.8 47.0 L12.5 48.0 L12.4 49.0 L12.6 50.2 L12.6 50.2 L13.8 49.9 L14.7 49.5 L15.5 49.2 L16.3 48.9 L17.1 48.6 L17.9 48.3 L18.7 48.0 L19.4 47.8 L20.2 47.6 L20.6 47.1 L20.9 46.3 L21.3 45.4Z" class="mark-flame mark-flame--deep"/>
            <path d="M28.9 47.3 L28.7 48.2 L28.5 48.9 L28.5 49.6 L29.0 50.1 L29.4 50.7 L29.8 51.3 L30.2 52.0 L30.6 52.7 L30.9 53.5 L31.2 54.4 L31.6 55.4 L32.0 56.5 L32.0 56.5 L33.0 55.8 L33.7 54.9 L34.3 53.9 L34.8 52.9 L35.1 51.8 L35.4 50.7 L35.6 49.6 L35.7 48.5 L35.7 47.4 L35.2 46.4 L34.3 45.6 L33.4 45.0Z" class="mark-flame mark-flame--deep"/>
            <path d="M24.9 47.2 L24.3 47.9 L23.8 48.4 L23.6 49.0 L23.8 49.6 L24.0 50.3 L24.1 51.0 L24.2 51.7 L24.3 52.5 L24.4 53.3 L24.4 54.1 L24.4 55.0 L24.6 56.1 L24.6 56.1 L25.7 55.8 L26.5 55.2 L27.3 54.6 L28.0 54.0 L28.6 53.3 L29.2 52.5 L29.8 51.7 L30.2 50.9 L30.7 50.0 L30.6 49.1 L30.3 48.1 L29.7 47.3Z" class="mark-flame mark-flame--deep"/>
            <path d="M32.0 35.4 L33.2 34.7 L34.3 34.0 L35.1 33.3 L35.7 32.3 L36.5 31.4 L37.3 30.4 L38.3 29.6 L39.5 28.8 L40.8 28.1 L42.3 27.4 L43.9 26.9 L45.8 26.3 L45.8 26.3 L44.0 25.4 L42.1 24.9 L40.2 24.7 L38.3 24.8 L36.4 25.1 L34.6 25.5 L32.9 26.2 L31.3 27.1 L29.8 28.1 L28.7 29.4 L28.1 31.1 L27.7 32.7Z" class="mark-flame mark-flame--mid"/>
            <path d="M33.0 38.1 L34.2 38.1 L35.3 38.1 L36.3 37.9 L37.2 37.4 L38.1 36.9 L39.2 36.6 L40.3 36.3 L41.5 36.1 L42.8 36.1 L44.3 36.2 L45.8 36.5 L47.6 36.8 L47.6 36.8 L46.6 35.3 L45.3 34.0 L43.9 33.0 L42.4 32.2 L40.8 31.6 L39.2 31.2 L37.5 31.0 L35.9 30.9 L34.3 31.0 L32.8 31.7 L31.6 32.7 L30.7 33.9Z" class="mark-flame mark-flame--mid"/>
            <path d="M32.7 40.8 L33.5 41.3 L34.2 41.8 L34.8 42.0 L35.5 41.9 L36.3 41.9 L37.1 41.9 L37.9 42.0 L38.8 42.3 L39.7 42.6 L40.7 43.0 L41.7 43.6 L42.9 44.2 L42.9 44.2 L42.8 42.8 L42.3 41.5 L41.7 40.4 L41.0 39.4 L40.2 38.4 L39.3 37.6 L38.3 36.8 L37.2 36.2 L36.1 35.6 L34.9 35.6 L33.7 35.9 L32.7 36.4Z" class="mark-flame mark-flame--mid"/>
            <path d="M29.8 33.5 L30.5 32.6 L31.0 31.8 L31.3 30.9 L31.2 30.0 L31.1 29.0 L31.0 28.1 L30.9 27.1 L30.9 26.1 L30.9 25.1 L30.9 24.0 L30.8 22.9 L30.7 21.7 L30.7 21.7 L29.5 22.3 L28.6 23.0 L27.8 23.9 L27.1 24.8 L26.4 25.7 L25.8 26.7 L25.2 27.7 L24.7 28.7 L24.2 29.8 L24.2 30.9 L24.5 32.0 L25.0 33.1Z" class="mark-flame mark-flame--mid"/>
            <path d="M24.9 33.2 L24.8 32.3 L24.5 31.4 L24.1 30.7 L23.3 30.3 L22.5 30.0 L21.7 29.6 L20.9 29.3 L20.1 29.1 L19.2 28.9 L18.3 28.7 L17.4 28.6 L16.4 28.8 L16.4 28.8 L16.7 29.7 L17.1 30.5 L17.5 31.2 L17.9 31.9 L18.3 32.6 L18.6 33.2 L18.9 33.9 L19.3 34.6 L19.6 35.2 L20.1 35.6 L20.9 35.8 L21.7 36.0Z" class="mark-flame mark-flame--mid"/>
            <path d="M21.1 37.5 L20.4 37.2 L19.7 36.9 L19.0 36.9 L18.3 37.3 L17.8 37.7 L17.2 38.2 L16.6 38.7 L16.1 39.2 L15.6 39.7 L15.2 40.3 L14.8 41.0 L14.6 41.9 L14.6 41.9 L15.5 42.0 L16.2 42.1 L16.8 42.1 L17.4 42.2 L18.0 42.2 L18.6 42.3 L19.1 42.4 L19.7 42.5 L20.2 42.6 L20.7 42.4 L21.1 42.0 L21.6 41.5Z" class="mark-flame mark-flame--mid"/>
            <path d="M29.2 44.5 L29.1 45.2 L29.1 45.7 L29.2 46.2 L29.6 46.5 L30.0 46.8 L30.4 47.2 L30.8 47.5 L31.2 48.0 L31.6 48.5 L32.0 49.0 L32.4 49.6 L33.0 50.2 L33.0 50.2 L33.5 49.5 L33.8 48.8 L34.1 48.1 L34.2 47.3 L34.3 46.5 L34.3 45.8 L34.3 45.0 L34.2 44.2 L34.1 43.5 L33.6 42.9 L32.9 42.5 L32.2 42.2Z" class="mark-flame mark-flame--mid"/>
            <circle cx="27.0" cy="39.0" r="15.0" class="mark-ball"/>
            <path d="M30.6 39.3 L31.6 37.9 L32.4 36.5 L32.7 35.2 L32.5 33.8 L32.3 32.4 L32.1 31.0 L31.9 29.5 L31.8 28.1 L31.7 26.6 L31.7 25.0 L31.6 23.4 L31.4 21.5 L31.4 21.5 L29.7 22.4 L28.3 23.6 L27.2 24.9 L26.1 26.3 L25.2 27.7 L24.3 29.2 L23.5 30.7 L22.7 32.3 L22.1 33.8 L22.1 35.5 L22.7 37.1 L23.4 38.7Z" class="mark-flame mark-flame--bright"/>
            <path d="M29.3 39.2 L29.9 38.3 L30.4 37.5 L30.6 36.6 L30.4 35.7 L30.3 34.8 L30.1 33.9 L29.9 33.0 L29.8 32.1 L29.6 31.2 L29.5 30.2 L29.3 29.3 L28.9 28.2 L28.9 28.2 L28.0 28.8 L27.3 29.6 L26.6 30.5 L26.1 31.3 L25.5 32.2 L25.1 33.1 L24.6 34.0 L24.2 35.0 L23.8 35.9 L23.9 36.9 L24.2 37.9 L24.7 38.8Z" class="mark-core"/>
            <path d="M52.50 19.90C49.44 15.99 50.80 13.95 52.50 13.10C54.20 13.95 55.56 15.99 52.50 19.90Z" class="mark-flame mark-flame--mid" transform="rotate(28 52.50 16.50)"/>
            <path d="M58.50 8.90C56.34 6.14 57.30 4.70 58.50 4.10C59.70 4.70 60.66 6.14 58.50 8.90Z" class="mark-flame mark-flame--bright" transform="rotate(34 58.50 6.50)"/>
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
