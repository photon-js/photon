export { config as default };

import type { Config } from "@brillout/docpress";
import logo from "./assets/logo.svg";
import logoWithText from "./assets/logo-with-text.svg";
import { categories, headings, headingsDetached } from "./headings";

const config: Config = {
  name: "Photon",
  version: "0.1.0",
  url: "photonjs.dev",
  tagline: "Next generation server toolkit",
  logo,

  github: "https://github.com/photon-js/photon",

  headings,
  headingsDetached,
  categories,

  navMaxWidth: 1000,
  navLogo: <img src={logoWithText} height={60} width={150} />,
};
