<template>
  <div class="tag-selector">
    <div class="selected-tags">
      <span
        v-for="id in modelValue"
        :key="id"
        class="tag-chip selected"
        :style="tagMap[id] ? { '--tc': tagMap[id].color } : {}"
        @click="toggle(id)"
      >
        {{ tagMap[id]?.name }}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </span>
      <span v-if="!modelValue?.length" class="placeholder-text">タグを選択...</span>
    </div>

    <div class="tag-options">
      <button
        v-for="tag in tags"
        :key="tag.id"
        class="tag-option"
        :class="{ active: modelValue?.includes(tag.id) }"
        :style="{ '--tc': tag.color }"
        @click="toggle(tag.id)"
        type="button"
      >
        {{ tag.name }}
      </button>
      <span v-if="!tags.length" class="no-tags">タグがありません（タグ管理から追加）</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  tags:       { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const tagMap = computed(() =>
  Object.fromEntries(props.tags.map(t => [t.id, t]))
)

function toggle(id) {
  const current = props.modelValue || []
  if (current.includes(id)) {
    emit('update:modelValue', current.filter(t => t !== id))
  } else {
    emit('update:modelValue', [...current, id])
  }
}
</script>

<style scoped>
.tag-selector { display: flex; flex-direction: column; gap: 10px; }

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 32px;
  align-items: center;
}

.placeholder-text { font-size: 13px; color: var(--text3); }

.tag-chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--tc, var(--accent)) 15%, transparent);
  color: var(--tc, var(--accent));
  border: 1px solid color-mix(in srgb, var(--tc, var(--accent)) 35%, transparent);
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.tag-chip:hover { opacity: 0.7; }

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-option {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 20px;
  background: var(--surface2);
  color: var(--text2);
  border: 1px solid var(--border);
  transition: all 0.15s;
  font-family: 'Noto Sans JP', sans-serif;
}

.tag-option:hover {
  border-color: var(--tc, var(--accent));
  color: var(--tc, var(--accent));
}

.tag-option.active {
  background: color-mix(in srgb, var(--tc, var(--accent)) 15%, transparent);
  color: var(--tc, var(--accent));
  border-color: color-mix(in srgb, var(--tc, var(--accent)) 40%, transparent);
}

.no-tags { font-size: 12px; color: var(--text3); }
</style>
