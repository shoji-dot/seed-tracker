<template>
  <div class="page">
    <header class="top-bar">
      <h1>🏥 活動記録</h1>
    </header>

    <!-- フィルター -->
    <div class="filter-bar">
      <div class="type-tabs">
        <button :class="{ active: filterType === '' }" @click="setType('')">すべて</button>
        <button
          v-for="(def, key) in ACTIVITY_TYPES" :key="key"
          :class="{ active: filterType === key }"
          @click="setType(key)"
        >
          {{ def.icon }} {{ def.label }}
        </button>
      </div>
    </div>

    <!-- 一覧 -->
    <div class="list">
      <div v-if="loading" class="empty">読み込み中…</div>
      <div v-else-if="filtered.length === 0" class="empty">
        活動記録がありません
      </div>

      <template v-else>
        <router-link
          v-for="act in filtered"
          :key="act.id"
          :to="`/seeds/${act.seed_id}/activities/${act.id}/edit/${act.type}`"
          class="act-card"
        >
          <div class="act-header">
            <span class="act-type-badge">
              {{ ACTIVITY_TYPES[act.type]?.icon }} {{ ACTIVITY_TYPES[act.type]?.label }}
            </span>
            <span class="act-date">{{ formatDate(act.date || act.created_at) }}</span>
          </div>

          <p class="act-summary">{{ act.summary }}</p>

          <div class="act-meta">
            <span v-if="act.location" class="meta-item">📍 {{ act.location }}</span>
            <span v-if="act.seed_title" class="meta-item seed-link">🌱 {{ act.seed_title }}</span>
            <span class="meta-item by">{{ act.created_by_name }}</span>
          </div>

          <!-- 手術: 器具数 -->
          <p v-if="act.type === 'surgery' && act.detail?.instruments?.length" class="act-sub">
            🔧 器具 {{ act.detail.instruments.length }}件
            <span v-if="act.detail.procedure"> · {{ act.detail.procedure }}</span>
          </p>
          <!-- 展示会: イベント名 -->
          <p v-if="act.type === 'event' && act.detail?.event_name" class="act-sub">
            🎪 {{ act.detail.event_name }}
          </p>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/client.js'
import { ACTIVITY_TYPES } from '../stores/activities.js'

const allActivities = ref([])
const loading       = ref(true)
const filterType    = ref('')

const filtered = computed(() =>
  filterType.value
    ? allActivities.value.filter(a => a.type === filterType.value)
    : allActivities.value
)

function setType(t) { filterType.value = t }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    // 全件取得（seed_titleも一緒に返す拡張APIを使う）
    allActivities.value = await api.get('/activities/all')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { padding-bottom: 80px; min-height: 100svh; background: var(--bg); }

.top-bar {
  display: flex; align-items: center; padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
}
.top-bar h1 { font-size: 18px; font-weight: 700; }

.filter-bar { padding: 0 16px 12px; }
.type-tabs {
  display: flex; gap: 6px; overflow-x: auto;
  scrollbar-width: none; padding-bottom: 2px;
}
.type-tabs::-webkit-scrollbar { display: none; }
.type-tabs button {
  flex-shrink: 0; background: var(--surface2); border: 1px solid var(--border);
  border-radius: 20px; color: var(--text3); font-size: 12px; padding: 4px 10px; cursor: pointer;
}
.type-tabs button.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
.empty { text-align: center; color: var(--text3); padding: 40px; }

.act-card {
  display: block; text-decoration: none;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px;
  transition: border-color .15s;
}
.act-card:active { border-color: var(--accent); }

.act-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.act-type-badge { font-size: 12px; font-weight: 600; color: var(--text2); }
.act-date { font-size: 11px; color: var(--text3); }

.act-summary { font-size: 14px; font-weight: 500; color: var(--text); line-height: 1.5; margin-bottom: 6px; }

.act-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.meta-item { font-size: 11px; color: var(--text3); }
.meta-item.seed-link { color: var(--accent-g); }
.meta-item.by { margin-left: auto; }

.act-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
</style>
