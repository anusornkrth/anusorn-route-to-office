interface RateLimitBucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitBucket>()

let sweepCounter = 0

export function checkRateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()

  // Periodically drop expired buckets so the map doesn't grow unbounded on a long-lived server.
  sweepCounter += 1
  if (sweepCounter % 200 === 0) {
    for (const [bucketKey, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(bucketKey)
    }
  }

  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false

  bucket.count += 1
  return true
}
