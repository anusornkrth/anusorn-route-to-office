export interface GoogleDirectionsTextValue {
  text: string
  value: number
}

export interface GoogleDirectionsStep {
  html_instructions: string
  distance: GoogleDirectionsTextValue
  duration: GoogleDirectionsTextValue
}

export interface GoogleDirectionsLeg {
  distance: GoogleDirectionsTextValue
  duration: GoogleDirectionsTextValue
  duration_in_traffic?: GoogleDirectionsTextValue
  steps: GoogleDirectionsStep[]
}

export interface GoogleDirectionsRoute {
  overview_polyline: { points: string }
  legs: GoogleDirectionsLeg[]
}

export interface GoogleDirectionsApiResponse {
  status: string
  error_message?: string
  routes: GoogleDirectionsRoute[]
}

export function fetchGoogleDirections(origin: LatLng, destination: LatLng, apiKey: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`)
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`)
  url.searchParams.set('departure_time', 'now')
  url.searchParams.set('key', apiKey)

  return $fetch<GoogleDirectionsApiResponse>(url.toString())
}
