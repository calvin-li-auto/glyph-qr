// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Opt in only for GitHub Pages; Lovable and other root hosts keep their addresses.
const base = process.env['GITHUB_PAGES'] === "true" ? "/glyph-qr/" : "/";

export default defineConfig({
  nitro: { output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" } },
  tanstackStart: {
    router: { basepath: base },
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Both pages render identically for every visitor, so build them as static HTML.
    pages: [{ path: base }, { path: `${base}results` }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
  vite: {
    base,
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        filename: "sw.js",
        scope: base,
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,png,svg,ico,webmanifest,woff2}"],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" && url.origin === self.location.origin && url.pathname.startsWith(new URL("./", self.location.href).pathname) && !url.pathname.startsWith(`${new URL("./", self.location.href).pathname}~oauth`),
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 20 },
              },
            },
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && url.pathname.startsWith(`${new URL("./", self.location.href).pathname}assets/`),
              handler: "CacheFirst",
              options: { cacheName: "assets", expiration: { maxEntries: 200 } },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === "https://fonts.googleapis.com" ||
                url.origin === "https://fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "fonts", expiration: { maxEntries: 20 } },
            },
          ],
        },
      }),
    ],
  },
});
