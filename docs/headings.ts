export { headings };
export { headingsDetached };
export { categories };

import {
  type Config,
  type HeadingDefinition,
  type HeadingDetachedDefinition,
  iconCompass,
  iconGear,
  iconScroll,
} from "@brillout/docpress";

const categories: Config["categories"] = ["Overview", "Guide", "API"];

const headingsDetached: HeadingDetachedDefinition[] = [];

const headings: HeadingDefinition[] = [
  {
    level: 1,
    title: "Overview",
    titleIcon: iconCompass,
    color: "#646cff",
  },
  {
    level: 2,
    title: "Introduction",
    titleDocument: "Photon",
    url: "/",
  },
  {
    level: 2,
    title: "Why Photon",
    url: "/why",
  },
  {
    level: 2,
    title: "Get Started",
    url: "/get-started",
  },
  {
    level: 1,
    title: "Guide",
    titleIcon: iconScroll,
    color: "#42b883",
  },
  {
    level: 2,
    title: "What is Photon?",
    url: "/guide/concepts",
  },
  {
    level: 2,
    title: "Framework Integration",
    url: "/guide/framework-integration",
  },
  {
    level: 2,
    title: "Server Frameworks",
    url: "/guide/server-frameworks",
  },
  {
    level: 2,
    title: "Universal Middleware",
    url: "/guide/middleware",
  },
  {
    level: 2,
    title: "Configuration",
    url: "/guide/config",
  },
  {
    level: 2,
    title: "Ecosystem",
    url: "/guide/ecosystem",
  },
  {
    level: 4,
    title: "Deployment",
  },
  {
    level: 2,
    title: "Overview",
    url: "/guide/deploy",
  },
  {
    level: 2,
    title: "Cloudflare",
    url: "/guide/deploy/cloudflare",
  },
  {
    level: 1,
    title: "API",
    titleIcon: iconGear,
    color: "#f59e0b",
    menuModalFullWidth: true,
  },
  {
    level: 4,
    title: "Core",
  },
  {
    level: 2,
    title: "@photonjs/core",
    url: "/api/core",
  },
  {
    level: 2,
    title: "@photonjs/runtime",
    url: "/api/runtime",
  },
  {
    level: 4,
    title: "Server Adapters",
  },
  {
    level: 2,
    title: "@photonjs/hono",
    url: "/api/hono",
  },
  {
    level: 4,
    title: "Deployment Adapters",
  },
  {
    level: 2,
    title: "@photonjs/cloudflare",
    url: "/api/cloudflare",
  },
];
