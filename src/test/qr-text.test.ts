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
