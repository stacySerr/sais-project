# Secure Asset Intelligence Services

Multi-page static site for SAS public-records and surplus-funds research.

Generator: `node build.js` (no npm packages).

## Local

```bash
npm run build
```

Writes `dist/`.

## Publish

GitHub Pages: Settings → Pages → Source: GitHub Actions. Push to `main` runs `.github/workflows/pages.yml`.

Expected URL after Pages is enabled: https://stacyserr.github.io/sais-project/

Netlify / Cloudflare: build `npm run build`, publish `dist`.

## Edit the site

- Pages: `src/pages/*.html` (front matter + main HTML only)
- Nav / name / email: `src/data/site.json`
- Header/footer: `src/includes/layout.html`
- CSS: `src/styles.css`
