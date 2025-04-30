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
  // tag this handler with a name, path and method
  {
    name: 'awesome-framework:default-route',
    path: '/**',
    method: 'GET',
  },
)
