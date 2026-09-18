<script setup lang="ts">
const props = defineProps<{
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  calculatedAt: string
}>()

const calculatedAtText = computed(() => new Date(props.calculatedAt).toLocaleString('th-TH'))
</script>

<template>
  <div>
    <div class="summary">
      <div class="card">
        <span class="label">ระยะทาง</span>
        <span class="value">{{ distance.text }}</span>
      </div>
      <div class="card">
        <span class="label">ระยะเวลาโดยประมาณ</span>
        <span class="value">{{ duration.text }}</span>
      </div>
    </div>
    <p class="calculated-at">คำนวณจากสภาพการจราจร ณ เวลา {{ calculatedAtText }}</p>
  </div>
</template>

<style scoped>
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
</style>
