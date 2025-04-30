import { enhance } from '@universal-middleware/core'
import { render } from '../../entry-server.js'
import indexHtml from '../../index-html.js'

export const defaultHandler = enhance(
  async (request: Request) => {
    const rendered = render(request.url)
    const html = indexHtml.replace('<!--app-html-->', rendered.html ?? '')

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
