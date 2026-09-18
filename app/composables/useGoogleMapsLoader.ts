let loaderPromise: Promise<typeof google> | null = null

export function useGoogleMapsLoader() {
  const config = useRuntimeConfig()

  function load(): Promise<typeof google> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Google Maps can only be loaded in the browser'))
    }

    if (window.google?.maps) {
      return Promise.resolve(window.google)
    }

    if (loaderPromise) {
      return loaderPromise
    }

    loaderPromise = new Promise((resolve, reject) => {
      const callbackName = '__onGoogleMapsLoaded__'
      ;(window as unknown as Record<string, () => void>)[callbackName] = () => resolve(window.google)

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.public.googleMapsJsKey)}&loading=async&callback=${callbackName}`
      script.async = true
      script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'))
      document.head.appendChild(script)
    })

    return loaderPromise
  }

  return { load }
}
