import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { resolveResultContent, validateResultSearch } from "@/lib/result-content";

describe("result content", () => {
  it("prefers URL content over scanned history state", () => {
    expect(resolveResultContent("shared content", "private scan")).toBe("shared content");
  });

  it("uses scanned history state when the content parameter is absent", () => {
    expect(resolveResultContent(undefined, "private scan")).toBe("private scan");
  });

  it("keeps an explicit empty parameter instead of falling back to scanned text", () => {
    expect(resolveResultContent("", "private scan")).toBe("");
  });

  it("round-trips Unicode and URL punctuation through the router", () => {
    const content = "日本語 👋 café\nhttps://example.com/?a=1&b=two+three#part %";
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const location = router.buildLocation({ to: "/results", search: { content } });
    const decoded = router.options.parseSearch?.(location.searchStr);
    expect(validateResultSearch.parse(decoded)).toEqual({ content });
  });
});