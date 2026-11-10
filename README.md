# ctxzero.github.io

Source of [www.ctxzero.dev](https://www.ctxzero.dev/) – hand-built, no framework, no build step.

## Structure

- `index.html` – markup and styles
- `assets/js/boot.js` – one line, sets the `js` class before first paint
- `assets/js/site.js` – all site behaviour
- `assets/js/vendor/` – marked, DOMPurify and highlight.js, self-hosted and loaded only when a writeup is opened
- `assets/fonts/` – self-hosted Archivo and JetBrains Mono (site), Mona Sans and Martian Mono (advisory card), all SIL OFL
- `assets/og-v5.png` – social preview image (1200×630)
- `404.html`, `robots.txt`, `sitemap.xml`
- Writeups load live from [ctxzero/writeups](https://github.com/ctxzero/writeups) via the GitHub API (listing cached per tab for 10 minutes)

## Content Security Policy

`script-src 'self'` – no inline scripts, no third-party script hosts. Keep it that way:
no `<script>` blocks with code and no `on…=` attributes in `index.html` (the JSON-LD block is data, not script, and is fine).

## Updating a vendored library

Drop the new file into `assets/js/vendor/` with the version in its name, update the `LIBS`
array in `assets/js/site.js`, delete the old file. Sources: npm packages `marked` (`lib/marked.umd.js`),
`dompurify` (`dist/purify.min.js`), `@highlightjs/cdn-assets` (`highlight.min.js`).

## Adding a disclosure

Duplicate the `<article class="adv">` block in the Disclosures section, update the text,
the CVSS marker (`style="--at:68%"` = score × 10) and the links. Also bump the CVE count
in the About stats (both `data-count` and the number inside the element).

The PoC step of CVE-2026-106933 switches to "released" automatically after 30 Oct 2026.

## About stats

The numbers are written into the markup so they are correct without JavaScript. "Machines documented"
is a fallback value that the live GitHub listing overrides; bump it now and then.
