import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { enhance, type UniversalMiddleware } from "@universal-middleware/core";
import sirv from "@universal-middleware/sirv";

function getDefaultStaticDir() {
  const argv1 = process.argv[1];
  const entrypointDirAbs = argv1
    ? dirname(isAbsolute(argv1) ? argv1 : join(process.cwd(), argv1))
    : dirname(fileURLToPath(import.meta.url));
  return join(entrypointDirAbs, "..", "client");
}

const mid = sirv(getDefaultStaticDir(), {
  etag: true,
});

export default [
  enhance(mid, {
    name: "photon:sirv",
    immutable: true,
  }),
] satisfies UniversalMiddleware[];
