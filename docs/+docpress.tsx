export { config as default }

import type { Config } from '@brillout/docpress'
import logoUrl from './assets/logo.svg'
import faviconUrl from './assets/logo.svg'
import { headings, headingsDetached, categories } from './headings'
import { TopNavigation } from './TopNavigation'
import React from 'react'

const config: Config = {
  projectInfo: {
    projectName: 'Photon' as const,
    projectVersion: '0.0.0',
    githubRepository: 'https://github.com/photon-js/photon' as const,
    githubIssues: 'https://github.com/photon-js/photon/issues/new' as const,
    twitterProfile: 'https://twitter.com/brillout' as const,
    // discordInvite: 'https://example.org/some-discord-invite',
    // blueskyHandle: 'vike.dev',
  },
  logoUrl,
  faviconUrl,
  algolia: null,
  tagline: 'Any server, deployed anywhere.',
  headings,
  headingsDetached,
  categories,
  topNavigation: <TopNavigation />,
  websiteUrl: 'photonjs.dev',
  twitterHandle: 'fake-twitter-handle',
  navMaxWidth: 1140,
}
