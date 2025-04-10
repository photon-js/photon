export { headings }
export { headingsDetached }
export { categories }

import {
  iconScroll,
  iconCompass,
  iconGear,
  type HeadingDefinition,
  type HeadingDetachedDefinition,
  type Config,
} from '@brillout/docpress'

const categories: Config['categories'] = [
  //
  'Guides',
  'Overview',
  { name: 'Guides 2', hide: true },
]

const headingsDetached: HeadingDetachedDefinition[] = [
  {
    title: 'Orphan Page',
    url: '/orphan',
    category: 'Guides',
  },
  {
    title: 'Orphan Page Without Headings',
    url: '/orphan-2',
    category: 'Guides 2',
  },
  {
    title: 'Languages',
    url: '/languages',
  },
]

const headings: HeadingDefinition[] = [
  {
    level: 1,
    title: 'Overview',
    titleIcon: iconCompass,
    color: '#dfa727',
  },
  {
    level: 2,
    title: 'Introduction',
    titleDocument: 'DocPress Demo',
    url: '/',
  },
  {
    level: 2,
    title: 'Notes',
    url: '/notes',
  },
  {
    level: 2,
    title: 'Features',
    url: '/features',
  },
  {
    level: 1,
    title: 'Guides',
    titleIcon: iconScroll,
    color: '#fbe046',
  },
  {
    level: 2,
    title: 'Some Page',
    url: '/some-page',
  },
  {
    level: 4,
    title: 'Some category',
  },
  {
    level: 2,
    title: 'Tiny Page',
    url: '/tiny',
    pageDesign: {
      hideTitle: true,
      hideMenuLeft: true,
      contentMaxWidth: 4000,
    },
  },
  {
    level: 2,
    title: 'June Releases',
    url: '/releases/2024-06',
  },
  {
    level: 2,
    title: 'Press Kit',
    url: '/press',
  },
  {
    level: 2,
    title: 'Page wiht error',
    url: '/error',
  },
  {
    level: 1,
    title: 'API',
    titleIcon: iconGear,
    color: '#80c1db',
    menuModalFullWidth: true,
  },
  {
    level: 4,
    title: 'Category 1',
  },
  {
    level: 2,
    title: '`Page 1`',
    url: '/page-1',
  },
  {
    level: 4,
    title: 'Category 2',
  },
  {
    level: 2,
    title: 'Page 2',
    url: '/page-2',
  },
  {
    level: 4,
    title: 'Category 3',
  },
  {
    level: 2,
    title: 'Page 3',
    url: '/page-3',
  },
  {
    level: 2,
    title: 'Page 4',
    url: '/page-4',
  },
]
