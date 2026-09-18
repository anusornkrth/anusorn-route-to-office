<script setup lang="ts">
type Mode = 'auto' | 'custom'

const mode = ref<Mode>('auto')

const { location: autoLocation, status: geoStatus, errorMessage: geoError, locate: locateAuto } = useGeolocation()
const { result, status: directionsStatus, errorMessage: directionsError, fetchDirections } = useDirections()

const config = useRuntimeConfig()
const customOrigin = ref<LatLng | null>(null)
const customDestination = ref<LatLng | null>({
  lat: Number(config.public.companyLat),
  lng: Number(config.public.companyLng)
})

watch(autoLocation, (loc) => {
  if (loc && mode.value === 'auto') fetchDirections(loc)
})

function startAuto() {
  mode.value = 'auto'
  result.value = null
  locateAuto()
}

function switchToCustom() {
  mode.value = 'custom'
  result.value = null
}

function swapCustomPoints() {
  const previousOrigin = customOrigin.value
  customOrigin.value = customDestination.value
  customDestination.value = previousOrigin
}

function calculateCustom() {
  if (!customOrigin.value || !customDestination.value) return
  fetchDirections(customOrigin.value, customDestination.value)
}

const originLabel = computed(() =>
  mode.value === 'auto'
    ? 'ตำแหน่งปัจจุบันของคุณ'
    : customOrigin.value
      ? `${customOrigin.value.lat}, ${customOrigin.value.lng}`
      : ''
)

const mapOrigin = computed<LatLng | null>(() => (mode.value === 'auto' ? autoLocation.value : customOrigin.value))

onMounted(startAuto)
</script>

<template>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Route Planner</p>
      <h1>เส้นทางไปบริษัท</h1>
      <p class="subtitle">คำนวณระยะทางและเวลาเดินทางแบบเรียลไทม์ ด้วย Google Maps</p>
    </header>

    <div class="card tabs" role="tablist">
      <button class="tab" :class="{ active: mode === 'auto' }" role="tab" type="button" @click="startAuto">
        ตำแหน่งปัจจุบัน → บริษัท
      </button>
      <button class="tab" :class="{ active: mode === 'custom' }" role="tab" type="button" @click="switchToCustom">
        กำหนดจุด A → B เอง
      </button>
    </div>

    <section v-if="mode === 'auto'" class="card panel">
      <p v-if="geoStatus === 'locating'" class="status">
        <span class="spinner" /> กำลังขอตำแหน่งปัจจุบันของคุณ...
      </p>
      <p v-else-if="directionsStatus === 'loading'" class="status">
        <span class="spinner" /> กำลังคำนวณเส้นทาง...
      </p>
      <div v-else-if="geoStatus === 'denied' || geoStatus === 'unsupported'" class="alert">
        <p>
          {{
            geoStatus === 'denied'
              ? 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์แล้วลองใหม่อีกครั้ง'
              : 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
          }}
        </p>
        <button class="btn btn-primary" type="button" @click="startAuto">ลองอีกครั้ง</button>
      </div>
      <div v-else-if="geoStatus === 'error' || directionsStatus === 'error'" class="alert">
        <p>เกิดข้อผิดพลาด: {{ geoError || directionsError }}</p>
        <button class="btn btn-primary" type="button" @click="startAuto">ลองอีกครั้ง</button>
      </div>
      <p v-else class="hint">ตรวจจับตำแหน่งปัจจุบันของคุณโดยอัตโนมัติ แล้วคำนวณเส้นทางไปยังสำนักงานใหญ่</p>
    </section>

    <section v-else class="card panel custom-panel">
      <div class="custom-fields">
        <LocationField v-model="customOrigin" label="จุด A (ต้นทาง)" />
        <button type="button" class="btn btn-icon swap-btn" title="สลับจุด A และ B" @click="swapCustomPoints">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <LocationField v-model="customDestination" label="จุด B (ปลายทาง)" />
      </div>
      <button
        class="btn btn-primary calculate-btn"
        type="button"
        :disabled="!customOrigin || !customDestination || directionsStatus === 'loading'"
        @click="calculateCustom"
      >
        <span v-if="directionsStatus === 'loading'" class="spinner" />
        <span v-else>คำนวณเส้นทาง</span>
      </button>
      <p v-if="directionsStatus === 'error'" class="field-error">{{ directionsError }}</p>
    </section>

    <Transition name="fade">
      <section v-if="directionsStatus === 'success' && result && mapOrigin" class="results">
        <p class="route-caption">
          จาก <strong>{{ originLabel }}</strong> ไปยัง <strong>{{ result.destination.name }}</strong>
        </p>
        <RouteSummary :distance="result.distance" :duration="result.duration" :calculated-at="result.calculatedAt" />
        <MapView :origin="mapOrigin" :destination="result.destination" :polyline="result.polyline" />
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: radial-gradient(circle at top, var(--bg-accent-1), var(--bg-accent-2) 60%);
}

.hero {
  text-align: center;
  margin-bottom: 4px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 1.9rem;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.tabs {
  display: flex;
  padding: 6px;
  gap: 4px;
}

.tab {
  flex: 1;
  padding: 12px 14px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  font-family: inherit;
}

.tab.active {
  background: var(--primary);
  color: var(--primary-contrast);
}

.panel {
  padding: 24px;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  margin: 0;
}

.hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.custom-fields {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 16px;
}

.swap-btn {
  margin-bottom: 4px;
}

.calculate-btn {
  width: 100%;
}

.field-error {
  font-size: 0.8rem;
  color: var(--danger);
  margin: 10px 0 0;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.route-caption {
  margin: 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-muted);
}

@media (max-width: 520px) {
  .custom-fields {
    flex-direction: column;
    align-items: stretch;
  }
  .swap-btn {
    align-self: center;
    transform: rotate(90deg);
  }
}
</style>
