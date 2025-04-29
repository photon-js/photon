import { enhance } from '@universal-middleware/core'
import sirv from '@universal-middleware/sirv'

export default [
  enhance(sirv('dist/client'), {
    name: 'sirv'
  })
]
