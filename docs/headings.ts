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

const categories: Config["categories"] = [
  //
  "Guides",
  "Overview",
  { name: "Guides 2", hide: true },
];

const headingsDetached: HeadingDetachedDefinition[] = [
  {
    title: "Orphan Page",
    url: "/orphan",
    category: "Guides 2",
  },
];

const headings: HeadingDefinition[] = [
  {
    level: 1,
    title: "Overview",
    titleIcon: iconCompass,
    color: "#dfa727",
  },
  {
    level: 2,
    title: "Introduction",
    titleDocument: "Photon",
    url: "/",
  },
  {
    level: 2,
    title: "Get Started",
    url: "/start",
  },
  {
    level: 1,
    title: "Guides",
    titleIcon: iconScroll,
    color: "#fbe046",
  },
  {
    level: 2,
    title: "Some Page",
    url: "/some-page",
  },
  {
    level: 1,
    title: "API",
    titleIcon: iconGear,
    color: "#80c1db",
    menuModalFullWidth: true,
  },
  {
    level: 4,
    title: "Category 1",
  },
  {
    level: 2,
    title: "`Page 1`",
    url: "/page-1",
  },
  {
    level: 4,
    title: "Category 2",
  },
  {
    level: 2,
    title: "`Page 2`",
    url: "/page-2",
  },
];
