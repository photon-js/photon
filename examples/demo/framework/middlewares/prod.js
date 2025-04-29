import { enhance } from '@universal-middleware/core'
import sirv from '@universal-middleware/sirv'

// sirv middleware in prod (node)
export default [
  enhance(sirv('dist/client'), {
    name: 'sirv',
  }),
]
