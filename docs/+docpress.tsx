export { config as default }

import type { Config } from '@brillout/docpress'
import logo from './assets/logo.svg'
import logoWithText from './assets/logo-with-text.svg'
import { headings, headingsDetached, categories } from './headings'
import { TopNavigation } from './TopNavigation'
import React from 'react'

const config: Config = {
  name: 'Photon',
  version: '0.0.0',
  url: 'photonjs.dev',
  tagline: 'Any server, deployed anywhere.',
  logo,

  github: 'https://github.com/photon-js/photon',

  headings,
  headingsDetached,
  categories,

  topNavigation: <TopNavigation />,
  navLogo: <img src={logoWithText} height={60} width={150} />
}
