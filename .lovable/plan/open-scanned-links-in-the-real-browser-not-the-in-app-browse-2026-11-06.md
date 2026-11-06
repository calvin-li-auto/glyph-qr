# Open scanned links in the real browser, not the in-app browser

## Why it happens
When Glyph is installed on Android, links that leave the app open in a Chrome "Custom Tab" overlay (the in-app browser). A normal web link can't turn this off, because Android decides it.

## Fix
- On Android, when Glyph runs as an installed app, rewrite the tapped link into an Android "intent" link (`intent://host/path#Intent;scheme=https;end`). Android then hands it to your default browser app as a separate app.
- Everywhere else (desktop, iPhone, a normal browser tab), keep today's behavior: open in a new tab.
- The link text shown stays the original address. Only what happens on tap changes.
- Only http/https links get rewritten. Other kinds like `mailto:` and `tel:` already open their own apps.

## Technical details
- Add `toExternalHref(url, { android, standalone })` in `src/lib/qr-text.ts`. It returns the intent URL only when both flags are true and the scheme is http(s).
- In `src/routes/results.tsx`, detect after hydration: `/Android/i.test(navigator.userAgent)` and `matchMedia('(display-mode: standalone)').matches`. Use the returned href and drop `target="_blank"` in the intent case.
- Unit tests in `src/test/qr-text.test.ts`: https becomes an intent URL on Android standalone, it's left alone off Android or when not installed, and mailto is never rewritten.
- Add the prompt to prompt.md.

## Limitation
I can't test this on a real phone here. Once it's published, check it on your Android device.
