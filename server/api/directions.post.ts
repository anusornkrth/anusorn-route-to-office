export default defineEventHandler(async (event) => {
  if (applyCors(event)) return

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(clientIp)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: { error: true, message: 'เรียกใช้งานถี่เกินไป กรุณาลองใหม่อีกครั้งในอีกสักครู่' }
    })
  }

  const body = await readBody<DirectionsRequest>(event)

  if (!isValidLatLng(body?.origin)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'origin { lat, lng } is required and must be within a valid range',
      data: { error: true, message: 'origin { lat, lng } is required and must be within a valid range' }
    })
  }

  if (body.destination !== undefined && !isValidLatLng(body.destination)) {
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

  if (body.destination) {
    destination = body.destination
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

  let data
  try {
    data = await fetchGoogleDirectionsCached(body.origin, destination, apiKey)
  } catch (err) {
    console.error('Directions API request failed:', err)
    throw createError({
      statusCode: 504,
      statusMessage: 'Directions API request timed out',
      data: { error: true, message: 'เชื่อมต่อ Google Maps ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' }
    })
  }

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
