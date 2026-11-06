import { describe, expect, it } from "vitest";
import { isLink, normalizeLink } from "@/lib/qr-text";

describe("link detection", () => {
  it("treats http(s) URLs as links", () => expect(isLink("https://example.com/a")).toBe(true));
  it("treats www. addresses as links and adds https", () => {
    expect(isLink("www.example.com")).toBe(true);
    expect(normalizeLink("www.example.com")).toBe("https://example.com".replace("https://", "https://www."));
  });
  it("does not treat plain text as a link", () => expect(isLink("hello world")).toBe(false));
});

import { toExternalHref } from "@/lib/qr-text";
describe("toExternalHref", () => {
  it("uses an intent link on installed Android", () =>
    expect(toExternalHref("https://a.com/x?y=1", { android: true, standalone: true }).href).toBe(
      "intent://a.com/x?y=1#Intent;scheme=https;end",
    ));
  it("keeps the link when not installed", () =>
    expect(toExternalHref("https://a.com", { android: true, standalone: false }).href).toBe("https://a.com"));
  it("keeps the link off Android", () =>
    expect(toExternalHref("https://a.com", { android: false, standalone: true }).href).toBe("https://a.com"));
  it("never rewrites mailto", () =>
    expect(toExternalHref("mailto:a@b.c", { android: true, standalone: true }).href).toBe("mailto:a@b.c"));
});
