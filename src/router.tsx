import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    context: { queryClient },
    scrollRestoration: true,
    // Static hosts serve results/index.html at /results/; don't redirect it away.
    trailingSlash: "preserve",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
