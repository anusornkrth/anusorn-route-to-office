import type { GoogleDirectionsApiResponse } from './googleMaps'

interface CacheEntry {
  data: GoogleDirectionsApiResponse
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

const CACHE_TTL_MS = 90_000

function cacheKey(origin: LatLng, destination: LatLng): string {
  const round = (n: number) => n.toFixed(4)
  return `${round(origin.lat)},${round(origin.lng)}|${round(destination.lat)},${round(destination.lng)}`
}

export async function fetchGoogleDirectionsCached(
  origin: LatLng,
  destination: LatLng,
  apiKey: string
): Promise<GoogleDirectionsApiResponse> {
  const key = cacheKey(origin, destination)
  const now = Date.now()
  const cached = cache.get(key)

  if (cached && cached.expiresAt > now) return cached.data

  const data = await fetchGoogleDirections(origin, destination, apiKey)

  if (data.status === 'OK') {
    cache.set(key, { data, expiresAt: now + CACHE_TTL_MS })
  }

  return data
}
