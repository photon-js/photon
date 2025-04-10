export { config as default }

import type { Config } from '@brillout/docpress'
import logoUrl from './assets/logo.svg'
import faviconUrl from './assets/favicon.svg'
import { headings, headingsDetached, categories } from './headings'

const config: Config = {
  projectInfo: {
    projectName: 'Demo' as const,
    projectVersion: '0.4.200',
    githubRepository: 'https://github.com/brillout/docpress' as const,
    githubIssues: 'https://github.com/brillout/docpress/issues/new' as const,
    twitterProfile: 'https://twitter.com/brillout' as const,
    discordInvite: 'https://example.org/some-discord-invite',
    blueskyHandle: 'vike.dev',
  },
  logoUrl,
  faviconUrl,
  algolia: {
    appId: 'YMV9Y4B58S',
    apiKey: '9ac178c1a29ba00e8afb98365015f677',
    indexName: 'vike',
  },
  // i18n: true,
  pressKit: true,
  tagline: 'DocPress Demonstration.',
  headings,
  headingsDetached,
  categories,
  websiteUrl: 'fake-website.example.org',
  twitterHandle: 'fake-twitter-handle',
  // globalNote: <GlobalNoteWarning />,
  navMaxWidth: 1140,
}

/*
function GlobalNoteWarning() {
  return (
    <>
      <div style={{ maxWidth: 500, margin: 'auto' }}>
        <Warning>Some global note.</Warning>
      </div>
    </>
  )
}
*/
