# ctxzero.github.io

Source of [www.ctxzero.dev](https://www.ctxzero.dev/) – a single hand-built `index.html`, no framework, no build step.

## Structure

- `index.html` – markup, styles and scripts
- `assets/fonts/` – self-hosted Archivo and JetBrains Mono (site), Mona Sans and Martian Mono (advisory card), all SIL OFL
- `assets/og-v5.png` – social preview image (1200×630)
- Writeups load live from [ctxzero/writeups](https://github.com/ctxzero/writeups) via the GitHub API

## Adding a disclosure

Duplicate the `<article class="adv">` block in the Disclosures section, update the text,
the CVSS marker (`style="--at:68%"` = score × 10) and the links. Also bump the CVE count
in the About stats (`data-count`).

The PoC step of CVE-2026-106933 switches to "released" automatically after 30 Oct 2026.
