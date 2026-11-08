# Glyph Qr

can you create apps that work entirely offline? they need to work even in places with zero reception

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://glyph-qr.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f3944d1c-c48d-4a53-8873-408113955f12).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## GitHub Pages

For `calvin-li-auto/glyph-qr`, open **Settings → Pages → Build and deployment**
and select **GitHub Actions** as the source. The included Pages workflow builds
and deploys on pushes to `main`; it can also be started manually in **Actions**.
The site address is https://calvin-li-auto.github.io/glyph-qr/.

The workflow sets `GITHUB_PAGES=true`, which puts navigation, scripts, icons,
and the service worker under `/glyph-qr/`. Ordinary builds keep `/` for Lovable
and other root hosts. To build for Pages locally:

```sh
GITHUB_PAGES=true bun run build
```

Serve or upload only `dist/client`, including `index.html` and
`results/index.html`. Do not upload the server folder or nest the artifact inside
another `glyph-qr` folder. Pages adds that URL prefix itself. Camera access and
offline installation require HTTPS (or localhost); a first online visit is
still needed to cache the app.
