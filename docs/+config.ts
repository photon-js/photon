export { config }

import type { Config } from 'vike/types'
import docpress from '@brillout/docpress/config'

const config = {
  extends: docpress,
} satisfies Config
