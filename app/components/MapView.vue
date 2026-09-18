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
    new g.maps.Marker({ position: props.origin, map, label: 'A', title: 'ตำแหน่งของคุณ' }),
    new g.maps.Marker({ position: props.destination, map, label: 'B', title: props.destination.name })
  )

  map.fitBounds(bounds)
}

onMounted(render)
watch(() => props.polyline, render)
</script>

<template>
  <div ref="mapContainer" class="map" />
</template>

<style scoped>
.map {
  width: 100%;
  height: 420px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
