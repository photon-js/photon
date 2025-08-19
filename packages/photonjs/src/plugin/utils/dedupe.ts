import type { Plugin } from "vite";

export function singleton(originalPlugin: Plugin): Plugin {
  const originalConfigResolved = originalPlugin.configResolved;

  originalPlugin.configResolved = {
    order: originalConfigResolved && "order" in originalConfigResolved ? originalConfigResolved.order : "pre",
    handler(c) {
      const duplicates = c.plugins.filter((p) => p.name === originalPlugin.name).slice(1);
      for (const p of duplicates) {
        const keysToDelete = Object.keys(p).filter((k) => k !== "name");
        p.name += ":disabled";
        for (const key of keysToDelete) {
          // @ts-ignore
          delete p[key];
        }
      }
      if (originalConfigResolved) {
        if (typeof originalConfigResolved === "function") {
          return originalConfigResolved.call(this, c);
        }
        return originalConfigResolved.handler.call(this, c);
      }
    },
  };

  return originalPlugin;
}
