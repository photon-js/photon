export { config as default };

import type { Config } from "@brillout/docpress";
import logo from "./assets/logo.svg";
import logoWithText from "./assets/logo-with-text.svg";
import { categories, headings, headingsDetached } from "./headings";
import { TopNavigation } from "./TopNavigation";

const config: Config = {
  name: "Photon",
  version: "0.0.7",
  url: "photonjs.dev",
  tagline: "Next generation server toolkit",
  logo,

  github: "https://github.com/photon-js/photon",

  headings,
  headingsDetached,
  categories,

  topNavigation: <TopNavigation />,
  navMaxWidth: 1000,
  navLogo: <img src={logoWithText} height={60} width={150} />,
};
