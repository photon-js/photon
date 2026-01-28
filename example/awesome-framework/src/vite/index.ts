import { catchAll, devServer } from "@universal-deploy/store/vite";
import type { Plugin } from "vite";
import { awesomeFrameworkPlugin } from "./awesomeFrameworkPlugin.js";

export function awesomeFramework(): Plugin[] {
  return [...awesomeFrameworkPlugin(), catchAll(), devServer()];
}
