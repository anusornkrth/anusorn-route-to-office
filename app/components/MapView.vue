<script setup lang="ts">
const props = defineProps<{
  origin: LatLng
  destination: LatLng & { name: string }
  polyline: string
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: google.maps.Map | null = null
let routeLine: google.maps.Polyline | null = null
const markers: google.maps.Marker[] = []

function originIcon(g: typeof google): google.maps.Icon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="17" fill="#4f46e5" fill-opacity="0.18" />
      <circle cx="20" cy="20" r="10.5" fill="#4f46e5" stroke="#ffffff" stroke-width="3.5" />
    </svg>
  `
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(40, 40),
    anchor: new g.maps.Point(20, 20)
  }
}

function destinationIcon(g: typeof google): google.maps.Icon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27C34 7.6 26.4 0 17 0Z" fill="#f97316" />
      <circle cx="17" cy="17" r="7.5" fill="#ffffff" />
    </svg>
  `
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.maps.Size(34, 44),
    anchor: new g.maps.Point(17, 44)
  }
}

async function render() {
  if (!mapContainer.value) return

  const g = await useGoogleMapsLoader().load()
  const path = decodePolyline(props.polyline)
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
    new g.maps.Marker({ position: props.origin, map, icon: originIcon(g), title: 'จุดเริ่มต้น' }),
    new g.maps.Marker({ position: props.destination, map, icon: destinationIcon(g), title: props.destination.name })
  )

  map.fitBounds(bounds)
}

onMounted(render)
watch(() => props.polyline, render)
</script>

<template>
  <div class="card map-card">
    <div ref="mapContainer" class="map" />
  </div>
</template>

<style scoped>
.map-card {
  padding: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: min(82vh, 780px);
  border-radius: 14px;
  overflow: hidden;
}
</style>
