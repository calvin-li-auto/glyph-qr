# Make Glyph build as a plain static website

Yes. Everything that matters (camera, QR reading, QR making, offline caching) already runs in the browser as scripts. The server only builds the starting page for each visit, and that page is the same for everyone. So both pages can be built once ahead of time as plain HTML files with scripts attached.

## What changes
- The scanner page and the results page get built ahead of time as ordinary HTML files.
- Scanned text still travels privately between pages, and `?content=` links still work, because both are read by scripts in the browser after the page loads.
- Offline mode stays the same. The cached pages are now fixed files, which makes offline caching simpler.
- The output folder can be uploaded to any static host (GitHub Pages, Netlify, a USB stick served locally) with no server.

## Technical details
- `vite.config.ts`: add `pages: [{ path: "/" }, { path: "/results" }]` and `prerender: { enabled: true, autoStaticPathsDiscovery: false }` (config package is 2.26.5, which supports this).
- Confirm the build writes `index.html` and `results/index.html` and exits cleanly (no TanStack Query `gcTime` timers are set, so no hang expected).
- Add both HTML files to the service worker's precache list so the first offline open doesn't depend on an earlier visit to each page.
- Run existing tests; check both prebuilt pages load and that a scan still reaches the results page.
- Record the static-build rule in AGENTS.md.
- Optional GitHub Pages support: make the site's base folder configurable (e.g. `/<repo-name>/`) so links, icons, manifest and service worker resolve under a project subpath.
