<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Scanner and results use separate TanStack routes and a shared GlyphShell so both pages register offline support.
- Start camera access on scanner mount and invalidate pending requests when stopped or unmounted so navigation never leaves a camera stream running.
- Transfer decoded QR text through router history state by default; results accept optional validated URL content with precedence over history state, and only an explicit user action publishes edited text into the URL, keeping scans private by default.
- Write prompts into the prompt.md file. Just use whatever I typed in, with a blank line separating prompts. Clear the prompt.md file contents after every git commit

- Scanner and results pages are prerendered to static HTML (vite.config pages + router trailingSlash "preserve", since the prerenderer requests /results/); keep them free of per-visitor server data.
- GitHub Pages builds opt into a project base through GITHUB_PAGES; keep Vite, router, prerender paths, public asset links and service-worker scope aligned, and deploy only dist/client so root-hosted Lovable builds remain unchanged.
