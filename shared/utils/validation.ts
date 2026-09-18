export function isValidLatLng(value: unknown): value is LatLng {
  if (!value || typeof value !== 'object') return false
  const { lat, lng } = value as { lat?: unknown; lng?: unknown }

  return (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === 'number' &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  )
}
