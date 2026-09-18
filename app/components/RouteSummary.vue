<script setup lang="ts">
const props = defineProps<{
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  calculatedAt: string
}>()

const calculatedAtText = computed(() => new Date(props.calculatedAt).toLocaleString('th-TH'))
</script>

<template>
  <div class="card summary">
    <div class="stat">
      <div class="stat-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

    <div class="divider" />

    <div class="stat">
      <div class="stat-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
.summary {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 20px 24px;
  gap: 20px;
}

.calculated-at {
  grid-column: 1 / -1;
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
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
  font-size: 0.78rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.divider {
  width: 1px;
  height: 36px;
  background: var(--border);
}

@media (max-width: 520px) {
  .summary {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .divider {
    width: 100%;
    height: 1px;
  }
}
</style>
