export { config }

import type { Config } from 'vike/types'
import docpress from '@brillout/docpress/config'

// Default configs (can be overridden by pages)
const config = {
  extends: docpress,
} satisfies Config
