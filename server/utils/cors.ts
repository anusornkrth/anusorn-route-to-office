import { handleCors } from 'h3'
import type { H3Event } from 'h3'

export function applyCors(event: H3Event) {
  const config = useRuntimeConfig()
  return handleCors(event, {
    origin: config.corsOrigin ? [config.corsOrigin] : '*',
    methods: ['POST', 'OPTIONS'],
    preflight: { statusCode: 204 }
  })
}
