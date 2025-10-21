export { headings };
export { headingsDetached };
export { categories };

import {
  type Config,
  type HeadingDefinition,
  type HeadingDetachedDefinition,
  iconCompass,
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
];
