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

export interface GoogleDirectionsResponse {
  status: string
  error_message?: string
  routes: GoogleDirectionsRoute[]
}
