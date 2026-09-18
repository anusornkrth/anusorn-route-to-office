export type GeolocationStatus = 'idle' | 'locating' | 'success' | 'denied' | 'unsupported' | 'error'

export function useGeolocation() {
  const location = ref<LatLng | null>(null)
  const status = ref<GeolocationStatus>('idle')
  const errorMessage = ref('')

  function locate() {
    status.value = 'locating'
    errorMessage.value = ''

    if (!('geolocation' in navigator)) {
      status.value = 'unsupported'
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        location.value = { lat: position.coords.latitude, lng: position.coords.longitude }
        status.value = 'success'
      },
      (error) => {
        status.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'error'
        errorMessage.value = error.message
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  return { location, status, errorMessage, locate }
}
