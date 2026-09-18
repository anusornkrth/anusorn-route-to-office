<script setup lang="ts">
const props = defineProps<{
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  calculatedAt: string
}>()

const calculatedAtText = computed(() => new Date(props.calculatedAt).toLocaleString('th-TH'))
</script>

<template>
  <div class="card panel-content">
    <div class="stat">
      <div class="stat-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="9.5" width="17" height="6" rx="1.5" stroke="currentColor" stroke-width="1.6" />
          <path
            d="M7.5 9.5v2M11 9.5v3M14.5 9.5v2M18 9.5v3"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">ระยะทาง</span>
        <span class="stat-value">{{ distance.text }}</span>
      </div>
    </div>

    <div class="stat">
      <div class="stat-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7" />
          <path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">ระยะเวลาโดยประมาณ</span>
        <span class="stat-value">{{ duration.text }}</span>
      </div>
    </div>

    <p class="calculated-at">คำนวณจากสภาพการจราจร ณ เวลา {{ calculatedAtText }}</p>
  </div>
</template>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  height: 100%;
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
  flex-shrink: 0;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.calculated-at {
  margin: auto 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
