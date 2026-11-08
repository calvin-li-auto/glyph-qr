import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the separate scan results page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/results").at(-1)?.routeId).toBe("/results");
  });

  it("matches scanner and results under the glyph-qr GitHub Pages folder", () => {
    const router = createRouter({
      routeTree,
      basepath: "/glyph-qr/",
      trailingSlash: "preserve",
      context: { queryClient: new QueryClient() },
    });
    expect(router.matchRoutes("/glyph-qr/").at(-1)?.routeId).toBe("/");
    expect(router.matchRoutes("/glyph-qr/results/").at(-1)?.routeId).toBe("/results");
    expect(router.buildLocation({ to: "/" }).href).toBe("/glyph-qr/");
    expect(router.buildLocation({ to: "/results", search: { content: "你好" } }).href)
      .toBe("/glyph-qr/results?content=%E4%BD%A0%E5%A5%BD");
  });
});
