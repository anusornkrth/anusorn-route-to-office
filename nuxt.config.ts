// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['google.maps']
      }
    }
  },
  runtimeConfig: {
    // Server-only: used by server/api/directions to call the Directions API. Never exposed to the client.
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    public: {
      // Exposed to the browser to render the Maps JavaScript API. Restrict it by HTTP referrer in Google Cloud Console.
      googleMapsBrowserKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || ''
    }
  }
})
