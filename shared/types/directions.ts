export interface LatLng {
  lat: number
  lng: number
}

export interface DirectionsRequest {
  origin: LatLng
}

export interface TextValue {
  text: string
  value: number
}

export interface DirectionsStep {
  instructions: string
  distance: TextValue
  duration: TextValue
}

export interface DirectionsResult {
  distance: TextValue
  duration: TextValue
  polyline: string
  steps: DirectionsStep[]
  destination: LatLng & { name: string }
  calculatedAt: string
}
