<script setup lang="ts">
type Status = 'locating' | 'loading' | 'ready' | 'geolocation-denied' | 'geolocation-unsupported' | 'error'

interface DirectionsResult {
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  polyline: string
  steps: { instructions: string; distance: { text: string; value: number }; duration: { text: string; value: number } }[]
  destination: { lat: number; lng: number; name: string }
  calculatedAt: string
}

const status = ref<Status>('locating')
const errorMessage = ref('')
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const result = ref<DirectionsResult | null>(null)

const mapContainer = ref<HTMLDivElement | null>(null)
let map: google.maps.Map | null = null
let routeLine: google.maps.Polyline | null = null
const markers: google.maps.Marker[] = []

function locateUser() {
  status.value = 'locating'
  errorMessage.value = ''

  if (!('geolocation' in navigator)) {
    status.value = 'geolocation-unsupported'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = { lat: position.coords.latitude, lng: position.coords.longitude }
      fetchDirections()
    },
    (error) => {
      status.value = error.code === error.PERMISSION_DENIED ? 'geolocation-denied' : 'error'
      errorMessage.value = error.message
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function fetchDirections() {
  if (!userLocation.value) return
  status.value = 'loading'

  try {
    result.value = await $fetch<DirectionsResult>('/api/directions', {
      method: 'POST',
      body: { origin: userLocation.value }
    })
    status.value = 'ready'
    await renderMap()
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : 'Failed to load directions'
  }
}

async function renderMap() {
  if (!result.value || !userLocation.value || !mapContainer.value) return

  const g = await useGoogleMapsLoader().load()
  const path = decodePolyline(result.value.polyline)
  const bounds = new g.maps.LatLngBounds()
  path.forEach((point) => bounds.extend(point))

  if (!map) {
    map = new g.maps.Map(mapContainer.value, { center: path[0], zoom: 13 })
  }

  routeLine?.setMap(null)
  routeLine = new g.maps.Polyline({
    path,
    map,
    strokeColor: '#2563eb',
    strokeWeight: 5,
    strokeOpacity: 0.85
  })

  markers.forEach((marker) => marker.setMap(null))
  markers.length = 0
  markers.push(
    new g.maps.Marker({ position: userLocation.value, map, label: 'A', title: 'ตำแหน่งของคุณ' }),
    new g.maps.Marker({ position: result.value.destination, map, label: 'B', title: result.value.destination.name })
  )

  map.fitBounds(bounds)
}

const calculatedAtText = computed(() =>
  result.value ? new Date(result.value.calculatedAt).toLocaleString('th-TH') : ''
)

onMounted(locateUser)
</script>

<template>
  <main class="page">
    <h1>เส้นทางไปบริษัท</h1>

    <p v-if="status === 'locating'" class="status">กำลังขอตำแหน่งปัจจุบันของคุณ...</p>
    <p v-else-if="status === 'loading'" class="status">กำลังคำนวณเส้นทาง...</p>

    <div v-else-if="status === 'geolocation-denied' || status === 'geolocation-unsupported'" class="fallback">
      <p>
        {{
          status === 'geolocation-denied'
            ? 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์แล้วลองใหม่อีกครั้ง'
            : 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
        }}
      </p>
      <button @click="locateUser">ลองอีกครั้ง</button>
    </div>

    <div v-else-if="status === 'error'" class="fallback">
      <p>เกิดข้อผิดพลาด: {{ errorMessage }}</p>
      <button @click="locateUser">ลองอีกครั้ง</button>
    </div>

    <template v-else-if="status === 'ready' && result">
      <div class="summary">
        <div class="card">
          <span class="label">ระยะทาง</span>
          <span class="value">{{ result.distance.text }}</span>
        </div>
        <div class="card">
          <span class="label">ระยะเวลาโดยประมาณ</span>
          <span class="value">{{ result.duration.text }}</span>
        </div>
      </div>
      <p class="calculated-at">คำนวณจากสภาพการจราจร ณ เวลา {{ calculatedAtText }}</p>

      <div ref="mapContainer" class="map" />
    </template>
  </main>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: system-ui, sans-serif;
}

.status {
  color: #555;
}

.fallback {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.fallback button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.summary {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 8px;
  background: #f1f5f9;
}

.label {
  font-size: 0.85rem;
  color: #64748b;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
}

.calculated-at {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 16px;
}

.map {
  width: 100%;
  height: 420px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
