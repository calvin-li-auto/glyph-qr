# Deploy Glyph to GitHub Pages

GitHub Pages only serves static files, but the app is currently built to run on a server. The plan adds a static build alongside the current one and publishes it automatically from your GitHub repo. Lovable publishing keeps working as it does now.

## What you'll get
- Every push to the main branch builds the app and publishes it to `https://calvin-li-auto.github.io/<repo-name>/`.
- The scanner, results page, links you share with `?content=` and offline install all work there, just like on the Lovable address.
- One manual step on GitHub: Repo Settings → Pages → Source: "GitHub Actions".

## Steps
1. **Static build mode:** add a build option that pre-renders the scanner and results pages to plain HTML and includes a fallback page, so opening a link directly or refreshing still loads the app.
2. **Repo sub-path:** make the app work under `/<repo-name>/` instead of the site root. That means the start address, links between pages, icons, the install file (manifest) and offline caching scope. This only applies to the GitHub build.
3. **Offline check:** make sure the offline worker caches the pre-rendered pages and starts from the right sub-path, so the app opens with no signal after the first visit.
4. **Automatic publishing:** add a GitHub workflow that installs, builds the static version and publishes it to Pages on every push to main.
5. **Verify:** build the static version in the sandbox, serve it under the sub-path and test it in a browser. Check that both pages load, the scanner works on an image, `?content=` opens and the app works offline after the first load.

## Technical details
- `vite.config.ts`: when `GH_PAGES=1`, set `base: "/<repo>/"` and enable TanStack Start SPA/prerender (`spa.enabled`, prerender `/` and `/results`), with the static output in `.output/public`. When it isn't set, the default Cloudflare build is unchanged.
- Router `basepath` comes from `import.meta.env.BASE_URL`. Manifest `start_url`/`scope` and icon links become relative to base. Workbox `navigateFallback` points at the SPA shell, for the GH build only.
- Copy `index.html` to `404.html` so deep links work on Pages.
- `.github/workflows/pages.yml`: uses bun install, `GH_PAGES=1 bun run build`, then `actions/upload-pages-artifact` and `actions/deploy-pages`.
- The repo name is read from `GITHUB_REPOSITORY` in the workflow, so nothing is hard-coded.
- Record this as a rule in AGENTS.md: the static GitHub Pages build is env-gated, and the default build stays the Lovable/Cloudflare one.
