const URL_RE = /^(https?:\/\/|www\.)[^\s]+\.[^\s]+$/i;

export function isLink(text: string): boolean {
  return URL_RE.test(text.trim());
}

export function normalizeLink(text: string): string {
  const t = text.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
