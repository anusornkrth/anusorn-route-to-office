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

const panelOpen = ref(true)

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuTriggerRef = ref<HTMLElement | null>(null)

function selectMode(target: Mode) {
  menuOpen.value = false
  if (target === 'auto') startAuto()
  else switchToCustom()
}

function handleClickOutside(event: MouseEvent) {
  if (!menuOpen.value) return
  const target = event.target as Node
  if (menuRef.value?.contains(target) || menuTriggerRef.value?.contains(target)) return
  menuOpen.value = false
}

onMounted(() => {
  startAuto()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Route Planner</p>
      <h1>เส้นทางไปบริษัท</h1>
    </header>

    <Transition name="fade" mode="out-in">
      <section v-if="directionsStatus === 'success' && result && mapOrigin" key="map" class="results">
        <p class="route-caption">
          จาก <strong>{{ originLabel }}</strong> ไปยัง <strong>{{ result.destination.name }}</strong>
        </p>
        <MapView :origin="mapOrigin" :destination="result.destination" :polyline="result.polyline" />
      </section>

      <section v-else key="placeholder" class="card map-placeholder">
        <span v-if="geoStatus === 'locating' || directionsStatus === 'loading'" class="spinner spinner-lg" />
        <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 4v14M15 6v14M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
        <p>
          {{
            geoStatus === 'locating'
              ? 'กำลังขอตำแหน่งปัจจุบันของคุณ...'
              : directionsStatus === 'loading'
                ? 'กำลังคำนวณเส้นทาง...'
                : 'เลือกโหมดและตำแหน่งในแถบด้านซ้าย เพื่อดูเส้นทางบนแผนที่'
          }}
        </p>
      </section>
    </Transition>
  </main>

  <aside class="route-drawer" :class="{ open: panelOpen }">
    <div class="mode-selector">
      <button
        ref="menuTriggerRef"
        type="button"
        class="mode-trigger"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span class="mode-icon">
          <svg v-if="mode === 'auto'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" stroke="currentColor" stroke-width="1.6" />
            <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="7" r="2.2" stroke="currentColor" stroke-width="1.6" />
            <circle cx="18" cy="17" r="2.2" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 8.5 16 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1 3" />
          </svg>
        </span>
        <span class="mode-label">{{ mode === 'auto' ? 'ตำแหน่งปัจจุบัน → บริษัท' : 'กำหนดจุด A → B เอง' }}</span>
        <svg class="chevron" :class="{ open: menuOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <Transition name="fade">
        <div v-if="menuOpen" ref="menuRef" class="mode-menu" role="menu">
          <button type="button" class="mode-menu-item" :class="{ active: mode === 'auto' }" @click="selectMode('auto')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" stroke="currentColor" stroke-width="1.6" />
              <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
            </svg>
            <span>ตำแหน่งปัจจุบัน → บริษัท</span>
          </button>
          <button type="button" class="mode-menu-item" :class="{ active: mode === 'custom' }" @click="selectMode('custom')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="7" r="2.2" stroke="currentColor" stroke-width="1.6" />
              <circle cx="18" cy="17" r="2.2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 8.5 16 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1 3" />
            </svg>
            <span>กำหนดจุด A → B เอง</span>
          </button>
        </div>
      </Transition>
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

    <RouteSummary
      v-if="directionsStatus === 'success' && result"
      :distance="result.distance"
      :duration="result.duration"
      :calculated-at="result.calculatedAt"
    />
  </aside>

  <button
    type="button"
    class="drawer-tab"
    :class="{ open: panelOpen }"
    :aria-expanded="panelOpen"
    title="แสดง/ซ่อนแถบควบคุม"
    @click="panelOpen = !panelOpen"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        :d="panelOpen ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
  </div>
</template>

<style scoped>
.page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: radial-gradient(circle at top, var(--bg-accent-1), var(--bg-accent-2) 60%);
}

.hero {
  text-align: center;
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
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
}

.mode-selector {
  position: relative;
  display: flex;
  justify-content: center;
}

.mode-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  max-width: 100%;
}

.mode-icon {
  display: flex;
  color: var(--primary);
  flex-shrink: 0;
}

.mode-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.mode-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: min(320px, 90vw);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
  z-index: 20;
}

.mode-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.mode-menu-item:hover {
  background: var(--surface-muted);
}

.mode-menu-item.active {
  background: var(--primary-soft);
  color: var(--primary);
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

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: min(82vh, 780px);
  color: var(--text-muted);
  text-align: center;
  padding: 24px;
}

.spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.route-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(max(340px, 30vw), 92vw);
  z-index: 50;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: transform 0.25s ease;
  transform: translateX(-100%);
}

.route-drawer.open {
  transform: translateX(0);
}

.drawer-tab {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 51;
  width: 26px;
  height: 48px;
  padding: 0;
  border: 1px solid var(--border);
  border-left: none;
  border-radius: 0 10px 10px 0;
  background: var(--surface);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: left 0.25s ease;
}

.drawer-tab:hover {
  color: var(--text);
}

.drawer-tab.open {
  left: min(max(340px, 30vw), 92vw);
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
