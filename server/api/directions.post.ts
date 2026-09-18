export default defineEventHandler(async (event) => {
  if (applyCors(event)) return

  const body = await readBody<DirectionsRequest>(event)

  if (!body?.origin || typeof body.origin.lat !== 'number' || typeof body.origin.lng !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: 'origin { lat, lng } is required',
      data: { error: true, message: 'origin { lat, lng } is required' }
    })
  }

  const hasCustomDestination =
    !!body.destination && typeof body.destination.lat === 'number' && typeof body.destination.lng === 'number'

  if (body.destination && !hasCustomDestination) {
    throw createError({
      statusCode: 400,
      statusMessage: 'destination { lat, lng } is invalid',
      data: { error: true, message: 'destination { lat, lng } is invalid' }
    })
  }

  const config = useRuntimeConfig()
  const apiKey = config.googleMapsApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GOOGLE_MAPS_API_KEY is not configured',
      data: { error: true, message: 'GOOGLE_MAPS_API_KEY is not configured on the server' }
    })
  }

  let destination: LatLng
  let destinationName: string

  if (hasCustomDestination) {
    destination = body.destination as LatLng
    destinationName = 'ปลายทางที่กำหนด'
  } else {
    const companyLat = Number(config.companyLat)
    const companyLng = Number(config.companyLng)

    if (!Number.isFinite(companyLat) || !Number.isFinite(companyLng)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'COMPANY_LAT/COMPANY_LNG is not configured',
        data: { error: true, message: 'COMPANY_LAT/COMPANY_LNG is not configured on the server' }
      })
    }

    destination = { lat: companyLat, lng: companyLng }
    destinationName = 'สำนักงานใหญ่'
  }

  const data = await fetchGoogleDirections(body.origin, destination, apiKey)

  const route = data.routes[0]
  const leg = route?.legs[0]

  if (data.status !== 'OK' || !route || !leg) {
    console.error(`Directions API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`)
    throw createError({
      statusCode: 502,
      statusMessage: `Directions API error: ${data.status}`,
      data: { error: true, message: 'ไม่สามารถคำนวณเส้นทางได้' }
    })
  }

  const result: DirectionsResult = {
    distance: leg.distance,
    duration: leg.duration_in_traffic ?? leg.duration,
    polyline: route.overview_polyline.points,
    steps: leg.steps.map((step) => ({
      instructions: step.html_instructions,
      distance: step.distance,
      duration: step.duration
    })),
    destination: { ...destination, name: destinationName },
    calculatedAt: new Date().toISOString()
  }

  return result
})
