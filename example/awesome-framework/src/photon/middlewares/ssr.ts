import { enhance } from '@universal-middleware/core'
import { renderUrl } from '../../renderUrl.js'

export const defaultHandler = enhance(
  async (request: Request) => {
    const html = renderUrl(request.url)

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: 'awesome-framework:default-route',
    path: '/**',
    method: 'GET',
  },
)
