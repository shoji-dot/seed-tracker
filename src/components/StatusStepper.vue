<template>
  <div class="stepper">
    <div
      v-for="(s, i) in STATUSES"
      :key="s.value"
      class="step-wrap"
    >
      <button
        class="step"
        :class="{
          done:    stepIndex(s.value) < currentIndex,
          current: s.value === modelValue,
          future:  stepIndex(s.value) > currentIndex,
        }"
        :style="s.value === modelValue ? { '--sc': s.color } : {}"
        @click="$emit('update:modelValue', s.value)"
        :title="s.label"
      >
        <span class="step-emoji">{{ s.emoji }}</span>
        <span class="step-label">{{ s.label }}</span>
      </button>
      <div
        v-if="i < STATUSES.length - 1"
        class="step-line"
        :class="{ filled: stepIndex(STATUSES[i+1].value) <= currentIndex }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STATUSES } from '../db'

const props = defineProps({
  modelValue: { type: String, required: true }
})
defineEmits(['update:modelValue'])

const currentIndex = computed(() =>
  STATUSES.findIndex(s => s.value === props.modelValue)
)

function stepIndex(val) {
  return STATUSES.findIndex(s => s.value === val)
}
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.step-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px 8px;
  border-radius: var(--radius-s);
  cursor: pointer;
  transition: background 0.15s;
  min-width: 52px;
}

.step:hover { background: var(--surface2); }

.step-emoji {
  font-size: 18px;
  line-height: 1;
  filter: grayscale(1);
  opacity: 0.4;
  transition: filter 0.2s, opacity 0.2s;
}

.step-label {
  font-size: 10px;
  color: var(--text3);
  white-space: nowrap;
  transition: color 0.2s;
}

/* done */
.step.done .step-emoji { filter: grayscale(0.3); opacity: 0.7; }
.step.done .step-label { color: var(--text2); }

/* current */
.step.current .step-emoji { filter: grayscale(0); opacity: 1; font-size: 22px; }
.step.current .step-label { color: var(--sc, var(--accent)); font-weight: 700; font-size: 11px; }

.step-line {
  width: 20px;
  height: 2px;
  background: var(--border);
  border-radius: 2px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.step-line.filled { background: var(--border2); }
</style>
