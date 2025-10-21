export { headings };
export { headingsDetached };
export { categories };

import { type Config, type HeadingDefinition, type HeadingDetachedDefinition, iconCompass } from "@brillout/docpress";

const categories: Config["categories"] = ["Overview"];

const headingsDetached: HeadingDetachedDefinition[] = [];

const headings: HeadingDefinition[] = [
  {
    level: 1,
    title: "Overview",
    titleIcon: iconCompass,
    color: "#e1a524",
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
