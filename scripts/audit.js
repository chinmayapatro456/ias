/* Layout audit across viewports (run from the repo root: node scripts/audit.js) — horizontal overflow, truncation, tap targets. */
const puppeteer = require('/usr/lib/node_modules/puppeteer-core');

const PAGES = [
  'index.html',
  'syllabus/index.html',
  'mains-pyqs/index.html',
  'optional-pyqs/index.html',
  'prelims-practice/index.html'
];
const WIDTHS = [360, 390, 412, 768, 1280, 1440];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/chromium',
    headless: 'shell',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--hide-scrollbars']
  });

  const results = [];
  for (const page of PAGES) {
    for (const w of WIDTHS) {
      const p = await browser.newPage();
      const errors = [];
      p.on('pageerror', e => errors.push(e.message.slice(0, 100)));
      await p.setViewport({ width: w, height: 900 });
      await p.goto('file://' + process.cwd() + '/' + page, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 700));

      const data = await p.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const offenders = [];
        const trunc = [];
        const small = [];

        document.querySelectorAll('body *').forEach(el => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          if (el.ownerSVGElement) return; /* SVG geometry is clipped by its viewport */
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;

          /* horizontal overflow beyond the viewport */
          if (r.right > docW + 1 || r.left < -1) {
            /* ignore intentionally scrollable strips and decorative overhangs */
            const scrollable = el.closest('.chart-wrap, .palette-grid, .tabs, .topic-chips, .hero, .table-scroll');
            if (!scrollable) {
              offenders.push({
                sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
                left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width)
              });
            }
          }

          /* clipped text */
          const isSvg = el.ownerSVGElement || el.tagName.toLowerCase() === 'svg';
          const isText = !isSvg && el.children.length === 0 && el.textContent.trim().length > 0;
          if (isText && el.scrollWidth > el.clientWidth + 1) {
            const clipped = cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis' || cs.whiteSpace === 'nowrap';
            if (clipped) {
              trunc.push({ text: el.textContent.trim().slice(0, 40), sw: el.scrollWidth, cw: el.clientWidth });
            }
          }

          /* tap targets on phone widths */
          if (window.innerWidth < 768) {
            const interactive = el.matches('a, button, input, select, [role="button"], [tabindex="0"]');
            const exempt = el.closest('.skip-link, .sr-only') ||
              el.classList.contains('sr-only') ||
              (el.tagName === 'INPUT' && el.closest('label')) ||
              (el.tagName === 'A' && el.closest('.footer-links, p'));
            if (interactive && !exempt) {
              if (r.height < 43.5 || r.width < 43.5) {
                small.push({
                  sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''),
                  txt: (el.textContent || '').trim().slice(0, 24),
                  w: Math.round(r.width), h: Math.round(r.height)
                });
              }
            }
          }
        });

        return {
          docW, scrollW,
          overflow: scrollW - docW,
          offenders: offenders.slice(0, 8),
          trunc: trunc.slice(0, 8),
          small: small.slice(0, 10),
          smallCount: small.length
        };
      });

      results.push({ page, width: w, ...data, errors });
      await p.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 1));
})();
