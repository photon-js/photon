import { enhance } from '@universal-middleware/core'

// tag this handler with a name, path and method
export const apiHandler = enhance(
  async () => {
    return new Response('/api Route', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  },
  // tag this handler with a name, path and method
  {
    name: 'awesome-framework:api-route',
    path: '/api',
    method: 'GET',
  },
)
