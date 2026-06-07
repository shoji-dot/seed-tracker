<template>
  <div class="company-selector">
    <!-- 選択済みチップ -->
    <div class="selected-list">
      <div v-for="c in selectedCompanies" :key="c.id" class="selected-chip">
        <span class="chip-icon">🏢</span>
        <div class="chip-info">
          <span class="chip-name">{{ c.name }}</span>
          <span v-if="c.industry" class="chip-sub">{{ c.industry }}</span>
        </div>
        <button class="chip-remove" @click="toggle(c.id)" type="button">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <span v-if="!modelValue?.length" class="placeholder">企業・機関を選択...</span>
    </div>

    <!-- 検索 + 候補一覧 -->
    <div class="dropdown">
      <input
        v-model="search"
        type="text"
        placeholder="企業名・業種で絞り込み..."
        class="search-input"
      />
      <div class="options-list">
        <button
          v-for="c in filtered"
          :key="c.id"
          type="button"
          class="option-item"
          :class="{ active: modelValue?.includes(c.id) }"
          @click="toggle(c.id)"
        >
          <span class="opt-icon">🏢</span>
          <div class="opt-info">
            <span class="opt-name">{{ c.name }}</span>
            <span class="opt-sub">{{ [c.industry, c.location].filter(Boolean).join(' · ') }}</span>
          </div>
          <svg v-if="modelValue?.includes(c.id)" class="check-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <p v-if="!filtered.length && search" class="no-result">「{{ search }}」は見つかりません</p>
        <p v-if="!companies.length" class="no-result">企業マスタに登録がありません</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  companies:  { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return props.companies
  return props.companies.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.industry  || '').toLowerCase().includes(q) ||
    (c.location  || '').toLowerCase().includes(q)
  )
})

const selectedCompanies = computed(() =>
  (props.modelValue || []).map(id => props.companies.find(c => c.id === id)).filter(Boolean)
)

function toggle(id) {
  const cur = props.modelValue || []
  emit('update:modelValue', cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])
}
</script>

<style scoped>
.company-selector { display: flex; flex-direction: column; gap: 10px; }

.selected-list {
  display: flex; flex-wrap: wrap; gap: 8px;
  min-height: 36px; align-items: center;
}

.placeholder { font-size: 13px; color: var(--text3); }

.selected-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,212,170,0.1);
  border: 1px solid rgba(0,212,170,0.3);
  border-radius: 20px;
  padding: 4px 10px 4px 8px;
}

.chip-icon { font-size: 14px; }
.chip-info { display: flex; flex-direction: column; line-height: 1.2; }
.chip-name { font-size: 12px; font-weight: 600; color: var(--accent-g); }
.chip-sub  { font-size: 10px; color: var(--text2); }

.chip-remove {
  background: none; color: var(--accent-g);
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; opacity: 0.7; transition: opacity 0.15s;
}
.chip-remove:hover { opacity: 1; }

.dropdown {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}

.search-input {
  border: none; border-bottom: 1px solid var(--border);
  border-radius: 0; background: var(--surface3);
  font-size: 13px; padding: 10px 14px;
}

.options-list { max-height: 200px; overflow-y: auto; padding: 4px 0; }

.option-item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: none; border: none;
  text-align: left; cursor: pointer; transition: background 0.12s;
  font-family: 'Noto Sans JP', sans-serif;
}

.option-item:hover  { background: var(--surface3); }
.option-item.active { background: rgba(0,212,170,0.08); }

.opt-icon  { font-size: 18px; flex-shrink: 0; }
.opt-info  { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.opt-name  { font-size: 13px; font-weight: 600; color: var(--text); }
.opt-sub   { font-size: 11px; color: var(--text3); }
.check-icon { color: var(--accent-g); flex-shrink: 0; }
.no-result { padding: 14px; font-size: 12px; color: var(--text3); text-align: center; }
</style>
