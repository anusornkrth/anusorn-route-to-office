<script setup lang="ts">
const { location, status: geoStatus, errorMessage: geoError, locate } = useGeolocation()
const { result, status: dirStatus, errorMessage: dirError, fetchDirections } = useDirections()

watch(location, (loc) => {
  if (loc) fetchDirections(loc)
})

onMounted(locate)
</script>

<template>
  <main class="page">
    <h1>เส้นทางไปบริษัท</h1>

    <p v-if="geoStatus === 'locating'" class="status">กำลังขอตำแหน่งปัจจุบันของคุณ...</p>
    <p v-else-if="dirStatus === 'loading'" class="status">กำลังคำนวณเส้นทาง...</p>

    <div v-else-if="geoStatus === 'denied' || geoStatus === 'unsupported'" class="fallback">
      <p>
        {{
          geoStatus === 'denied'
            ? 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์แล้วลองใหม่อีกครั้ง'
            : 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
        }}
      </p>
      <button @click="locate">ลองอีกครั้ง</button>
    </div>

    <div v-else-if="geoStatus === 'error' || dirStatus === 'error'" class="fallback">
      <p>เกิดข้อผิดพลาด: {{ geoError || dirError }}</p>
      <button @click="locate">ลองอีกครั้ง</button>
    </div>

    <template v-else-if="dirStatus === 'success' && result && location">
      <RouteSummary :distance="result.distance" :duration="result.duration" :calculated-at="result.calculatedAt" />
      <MapView :origin="location" :destination="result.destination" :polyline="result.polyline" />
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
</style>
