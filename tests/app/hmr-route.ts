import { enhance } from "@universal-middleware/core";

export const hmrRoute = enhance(
  async () => {
    return new Response("BEFORE HMR", {
      status: 200,
    });
  },
  {
    name: "photon-test:hmr",
    path: "/hmr",
    method: "GET",
  },
);
