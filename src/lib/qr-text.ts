const URL_RE = /^(https?:\/\/|www\.)[^\s]+\.[^\s]+$/i;

export function isLink(text: string): boolean {
  return URL_RE.test(text.trim());
}

export function normalizeLink(text: string): string {
  const t = text.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function toExternalHref(
  url: string,
  env: { android: boolean; standalone: boolean },
): { href: string; intent: boolean } {
  const m = /^(https?):\/\/(.+)$/i.exec(url);
  if (!env.android || !env.standalone || !m) return { href: url, intent: false };
  const scheme = (m[1] ?? "https").toLowerCase();
  return {
    href:
      `intent://${m[2]}#Intent;scheme=${scheme};action=android.intent.action.VIEW;` +
      `category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`,
    intent: true,
  };
}
