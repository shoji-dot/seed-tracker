<template>
  <div class="page">
    <!-- ヘッダー -->
    <header class="top-bar">
      <h1>🌱 SeedTracker</h1>
      <span class="user-badge">{{ auth.user?.displayName }}</span>
    </header>

    <!-- 検索・フィルター -->
    <div class="filter-bar">
      <div class="search-wrap">
        <input v-model="query" @input="debounceFetch" placeholder="検索…" class="search-input" />
      </div>
      <div class="status-tabs">
        <button :class="{ active: filterStatus === '' }" @click="setStatus('')">すべて</button>
        <button v-for="s in STATUSES" :key="s"
                :class="{ active: filterStatus === s }"
                @click="setStatus(s)">{{ s }}</button>
      </div>
    </div>

    <!-- 一覧 -->
    <div class="list">
      <div v-if="seeds.loading" class="loading">読み込み中…</div>

      <div v-else-if="seeds.seeds.length === 0" class="empty">
        <p>シードがありません</p>
        <p class="empty-sub">＋ ボタンで最初のシードを登録しましょう</p>
      </div>

      <router-link
        v-for="seed in seeds.seeds"
        :key="seed.id"
        :to="`/seeds/${seed.id}`"
        class="seed-card"
      >
        <div class="card-top">
          <span class="status-badge" :style="{ background: statusColor(seed.status) + '20', color: statusColor(seed.status) }">
            {{ seed.status }}
          </span>
          <span class="priority-dot" :style="{ background: priorityColor(seed.priority) }"></span>
        </div>
        <p class="card-title">{{ seed.title }}</p>
        <div class="card-meta">
          <span v-if="seed.source" class="meta-item">📍 {{ seed.source }}</span>
          <span v-if="seed.tags?.length" class="meta-item">🏷️ {{ seed.tags.slice(0,3).join('・') }}</span>
          <span class="meta-item by">{{ seed.created_by_name }}</span>
        </div>
        <div class="card-date">{{ formatDate(seed.updated_at) }}</div>
      </router-link>
    </div>

    <!-- FAB -->
    <router-link to="/seeds/new" class="fab">＋</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useSeedsStore, STATUSES } from '../stores/seeds.js'

const auth  = useAuthStore()
const seeds = useSeedsStore()

const query        = ref('')
const filterStatus = ref('')
let debounceTimer  = null

const STATUS_COLORS = {
  '課題':'#4f7cff','解決案':'#00d4aa','事業アイデア':'#ffc832',
  '検討中':'#ff6b4a','開発中':'#b450ff','事業化':'#32c864'
}
const statusColor = (s) => STATUS_COLORS[s] || '#8890a8'
const priorityColor = (p) => ['#535872','#ffc832','#ff6b4a'][p] || '#535872'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { month:'short', day:'numeric' })
}

function debounceFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doFetch, 300)
}

function setStatus(s) {
  filterStatus.value = s
  doFetch()
}

function doFetch() {
  seeds.fetchSeeds({ q: query.value, status: filterStatus.value })
}

onMounted(doFetch)
</script>

<style scoped>
.page { padding-bottom: 80px; min-height: 100svh; background: var(--bg); }

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 10px;
  padding-top: max(16px, env(safe-area-inset-top));
}
.top-bar h1 { font-size: 18px; font-weight: 700; }
.user-badge { font-size: 12px; color: var(--text3); background: var(--surface2); padding: 3px 8px; border-radius: 20px; }

.filter-bar { padding: 0 16px 12px; }
.search-wrap { margin-bottom: 10px; }
.search-input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  color: var(--text);
  font-size: 14px;
  padding: 9px 12px;
}
.search-input:focus { outline: none; border-color: var(--accent); }

.status-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.status-tabs::-webkit-scrollbar { display: none; }
.status-tabs button {
  flex-shrink: 0;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text3);
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  white-space: nowrap;
}
.status-tabs button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }

.loading { text-align: center; color: var(--text3); padding: 40px; }
.empty { text-align: center; color: var(--text3); padding: 60px 0; }
.empty-sub { font-size: 12px; margin-top: 6px; }

.seed-card {
  display: block;
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  transition: border-color .15s;
}
.seed-card:active { border-color: var(--accent); }

.card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.status-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.priority-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; }

.card-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 8px; line-height: 1.4; }

.card-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.meta-item { font-size: 11px; color: var(--text3); }
.meta-item.by { margin-left: auto; color: var(--text3); }

.card-date { font-size: 11px; color: var(--text3); text-align: right; }

.fab {
  position: fixed;
  bottom: 76px;
  right: 20px;
  width: 52px;
  height: 52px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(79,124,255,.4);
}
</style>
