export type DirectionsStatus = 'idle' | 'loading' | 'success' | 'error'

export function useDirections() {
  const config = useRuntimeConfig()
  const result = ref<DirectionsResult | null>(null)
  const status = ref<DirectionsStatus>('idle')
  const errorMessage = ref('')

  async function fetchDirections(origin: LatLng, destination?: LatLng) {
    status.value = 'loading'
    errorMessage.value = ''

    try {
      result.value = await $fetch<DirectionsResult>('/api/directions', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        body: destination ? { origin, destination } : { origin }
      })
      status.value = 'success'
    } catch (err) {
      status.value = 'error'
      errorMessage.value = extractErrorMessage(err)
    }
  }

  function extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'data' in err) {
      const data = (err as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
    return err instanceof Error ? err.message : 'ไม่สามารถคำนวณเส้นทางได้'
  }

  return { result, status, errorMessage, fetchDirections }
}
