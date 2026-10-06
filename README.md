# FutureNest

A static, multi-page marketing website built with HTML, CSS, and vanilla JavaScript. No build step, client-side router, framework, or server-side rendering is required.

## Routes

| URL | Entry point |
| --- | --- |
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/services/` | `services/index.html` |
| `/refer/` | `refer/index.html` |
| `/contact/` | `contact/index.html` |

Serve the repository root and preserve directory-index routing:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Do not open the HTML files directly: navigation uses root-relative URLs.

## Structure

- `assets/`: local images, icons, and fonts, grouped by page; `mobile/` folders contain responsive image variants.
- `css/`: design tokens, resets, shared layout/components, page styles, and responsive overrides.
- `css/components/`: shared FAQ and success-story layouts, independent of page styles.
- `js/site.js`: shared initialization, mobile-menu accessibility, placement carousel, newsletter status, and footer year.
- `js/navigation.js`: native page navigation state, mobile-menu controls, and same-page scrolling.
- `js/theme.js`: stored theme preference and initial theme handling.
- `js/components/`: reusable FAQ disclosure animations and story-carousel keyboard controls.
- `js/pages/`: page-specific behavior for Home, About, Services, and Contact.
- `scripts/`: repeatable static and browser checks.

Each route is a complete HTML document. Load shared styles before page styles, then mobile overrides. `home.css` currently includes the shared `fn-*` marketing components used across routes; retain its place in the cascade. Load shared scripts before page scripts. Pages use native links and browser history; do not replace page content with an AJAX router.

The header and footer remain ordinary HTML in each entry point, so they render without JavaScript. Keep their navigation and contact information consistent when editing. Shared interaction code belongs in `js/site.js` or `js/components/`, not another page's script.

Desktop containers grow smoothly from 1200px at a 1440px viewport to 1380px at 1920px, 1620px at 2560px, and at most 1920px on ultrawide displays. Reading-heavy sections and image cards use tighter limits. The shared `--fn-layout-width` token caps viewport-based type and spacing at the 1440px design scale, so wider layouts do not magnify typography or controls. Home and Services use the same story markup, shared stylesheet/script, and `assets/shared/stories/` mobile images.

Use `<picture>` for mobile image variants, keep assets local, and preserve image dimensions to avoid layout shifts. Interactive additions must work with keyboard input and respect `prefers-reduced-motion`.

## Verification

Dependency-free link, asset, fragment, ID, and accessibility-reference checks:

```sh
python3 scripts/check-site.py
find js -name '*.js' -exec node --check {} \;
git diff --check
```

Browser verification requires Node.js and Playwright. Install the optional verification tools locally:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
```

With the preview server running:

```sh
node scripts/check-browser.cjs
```

This checks all five routes at 320, 440, 768, 1024, 1440, 1920, 2560, and 3440 pixels, plus service tabs, FAQs, carousels, mobile navigation, browser history, form validation, query-string prefills, and motion preferences. Screenshots are written to the ignored `.preview/` directory.

Run `node scripts/check-client-changes.cjs` to check banner text containment, mobile card edges, FAQ contact links, and Home carousel looping, pause, and resume.

Optional environment variables: `BASE_URL` selects another preview server, `CHROME_PATH` selects an installed Chromium browser, and `PLAYWRIGHT_MODULE` selects an existing Playwright installation.

## Deployment and integration boundaries

Publish the five HTML entry points and the `assets/`, `css/`, and `js/` directories to a static host. No SPA fallback is needed. Google Fonts requires network access; the stylesheet defines fallback fonts.

Contact and newsletter forms are previews: they validate inputs but do not send or store submissions. Story play overlays are visual until testimonial video sources are connected. The “Watch more success story” link currently points to `/`, pending a final destination. Keep these states explicit until real integrations are implemented.
