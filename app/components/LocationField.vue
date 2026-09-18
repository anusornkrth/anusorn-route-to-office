<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: LatLng | null
}>()
const emit = defineEmits<{ 'update:modelValue': [value: LatLng | null] }>()

function formatLatLng(value: LatLng) {
  return `${value.lat}, ${value.lng}`
}

const text = ref(props.modelValue ? formatLatLng(props.modelValue) : '')
const error = ref('')

watch(
  () => props.modelValue,
  (value) => {
    const formatted = value ? formatLatLng(value) : ''
    if (formatted !== text.value) text.value = formatted
  }
)

function parse() {
  const trimmed = text.value.trim()

  if (!trimmed) {
    error.value = ''
    emit('update:modelValue', null)
    return
  }

  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) {
    error.value = 'รูปแบบต้องเป็น lat,lng เช่น 13.7563,100.5018'
    return
  }

  const lat = Number(match[1])
  const lng = Number(match[2])

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    error.value = 'ค่าพิกัดอยู่นอกช่วงที่ถูกต้อง'
    return
  }

  error.value = ''
  emit('update:modelValue', { lat, lng })
}

const { locate, location, status: geoStatus, errorMessage: geoError } = useGeolocation()

watch(location, (loc) => {
  if (!loc) return
  text.value = formatLatLng(loc)
  parse()
})
</script>

<template>
  <div class="field">
    <label class="field-label">{{ label }}</label>
    <div class="field-row">
      <input
        v-model="text"
        type="text"
        class="field-input"
        placeholder="lat,lng เช่น 13.7563,100.5018"
        @blur="parse"
        @keyup.enter="parse"
      />
      <button
        type="button"
        class="btn btn-icon"
        :disabled="geoStatus === 'locating'"
        title="ใช้ตำแหน่งปัจจุบัน"
        @click="locate"
      >
        <span v-if="geoStatus === 'locating'" class="spinner" />
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" stroke="currentColor" stroke-width="1.6" />
          <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="field-error">{{ error }}</p>
    <p v-else-if="geoStatus === 'denied'" class="field-error">ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง</p>
    <p v-else-if="geoStatus === 'unsupported'" class="field-error">เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง</p>
    <p v-else-if="geoStatus === 'error'" class="field-error">{{ geoError }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field-row {
  display: flex;
  gap: 8px;
}

.field-input {
  flex: 1;
  min-width: 0;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
}

.field-input:focus {
  outline: none;
  border-color: var(--primary);
}

.field-error {
  font-size: 0.8rem;
  color: var(--danger);
  margin: 0;
}
</style>
