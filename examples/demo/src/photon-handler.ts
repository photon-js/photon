import { enhance } from '@universal-middleware/core'
import { render } from './entry-server.js'

export const handler = (template: string) =>
  enhance(
    async (request: Request) => {
      const rendered = render(request.url)
      const html = template.replace('<!--app-html-->', rendered.html ?? '')

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    },
    {
      name: 'photon-example-route',
      path: '/**',
      method: 'GET',
    },
  )
