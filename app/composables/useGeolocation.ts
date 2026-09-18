export type GeolocationStatus = 'idle' | 'locating' | 'success' | 'denied' | 'unsupported' | 'error'

export function useGeolocation() {
  const location = ref<LatLng | null>(null)
  const status = ref<GeolocationStatus>('idle')
  const errorMessage = ref('')

  function locate(isRetry = false) {
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
        // macOS CoreLocation can report a transient "location unknown" failure even with
        // Location Services enabled. One silent retry clears most of these without
        // bothering the user with an error screen.
        if (error.code === error.POSITION_UNAVAILABLE && !isRetry) {
          setTimeout(() => locate(true), 1000)
          return
        }

        status.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'error'
        errorMessage.value = error.message
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  return { location, status, errorMessage, locate }
}
