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
    companyLat: process.env.COMPANY_LAT || '13.805384',
    companyLng: process.env.COMPANY_LNG || '100.537707',
    // Allowed frontend origin when the API is deployed separately from the frontend (e.g. Render + Vercel).
    corsOrigin: process.env.CORS_ORIGIN || '',
    public: {
      // Exposed to the browser to render the Maps JavaScript API. Restrict it by HTTP referrer in Google Cloud Console.
      googleMapsJsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_JS_KEY || '',
      // Base URL of the backend API. Leave empty for same-origin full-stack deployments/local dev.
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || ''
    }
  }
})
