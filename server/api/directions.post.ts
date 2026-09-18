import type { GoogleDirectionsResponse } from '../utils/googleDirections'

interface DirectionsRequestBody {
  origin?: { lat: number; lng: number }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<DirectionsRequestBody>(event)

  if (!body?.origin || typeof body.origin.lat !== 'number' || typeof body.origin.lng !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'origin { lat, lng } is required' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.googleMapsApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GOOGLE_MAPS_API_KEY is not configured on the server' })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
  url.searchParams.set('origin', `${body.origin.lat},${body.origin.lng}`)
  url.searchParams.set('destination', `${COMPANY_LOCATION.lat},${COMPANY_LOCATION.lng}`)
  url.searchParams.set('departure_time', 'now')
  url.searchParams.set('key', apiKey)

  const data = await $fetch<GoogleDirectionsResponse>(url.toString())

  const route = data.routes[0]
  const leg = route?.legs[0]

  if (data.status !== 'OK' || !route || !leg) {
    throw createError({
      statusCode: 502,
      statusMessage: `Directions API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`
    })
  }

  return {
    distance: leg.distance,
    duration: leg.duration_in_traffic ?? leg.duration,
    polyline: route.overview_polyline.points,
    steps: leg.steps.map((step) => ({
      instructions: step.html_instructions,
      distance: step.distance,
      duration: step.duration
    })),
    destination: COMPANY_LOCATION,
    calculatedAt: new Date().toISOString()
  }
})
