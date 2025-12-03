import type { Plugin } from "vite";
import { awesomeFrameworkPlugin } from "./awesomeFrameworkPlugin.js";
import { photonPlugin } from "./photonPlugin.js";

export function awesomeFramework(): Plugin[] {
  return [...awesomeFrameworkPlugin(), ...photonPlugin()];
}
