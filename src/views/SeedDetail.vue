<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="router.back()">←</button>
      <h2 class="header-title">詳細</h2>
      <router-link :to="`/seeds/${seed?.id}/edit`" class="btn-edit">編集</router-link>
    </header>

    <div v-if="loading" class="loading">読み込み中…</div>

    <template v-else-if="seed">
      <!-- ステータス・優先度 -->
      <div class="status-row">
        <span class="status-badge" :style="{ background: statusColor(seed.status) + '20', color: statusColor(seed.status) }">
          {{ seed.status }}
        </span>
        <span class="priority-label" :style="{ color: priorityColor(seed.priority) }">
          優先度: {{ PRIORITIES[seed.priority] || '中' }}
        </span>
        <span class="created-by">{{ seed.created_by_name }}</span>
      </div>

      <!-- タイトル -->
      <h1 class="seed-title">{{ seed.title }}</h1>

      <!-- メタ情報 -->
      <div class="meta-row" v-if="seed.source || seed.source_date">
        <span v-if="seed.source">📍 {{ seed.source }}</span>
        <span v-if="seed.source_date">🗓 {{ formatDate(seed.source_date) }}</span>
      </div>

      <!-- タグ -->
      <div v-if="seed.tags?.length" class="tags-row">
        <span v-for="tag in seed.tags" :key="tag" class="chip">{{ tag }}</span>
      </div>

      <!-- 説明 -->
      <section v-if="seed.description" class="section">
        <h3 class="section-title">内容・詳細</h3>
        <p class="description">{{ seed.description }}</p>
      </section>

      <!-- 関連人物 -->
      <section v-if="relPersons.length" class="section">
        <h3 class="section-title">関連人物</h3>
        <div class="rel-list">
          <div v-for="p in relPersons" :key="p.id" class="rel-item">
            <span class="rel-name">{{ p.name }}</span>
            <span class="rel-sub">{{ [p.role, p.affiliation].filter(Boolean).join(' / ') }}</span>
          </div>
        </div>
      </section>

      <!-- 関連企業 -->
      <section v-if="relCompanies.length" class="section">
        <h3 class="section-title">関連企業</h3>
        <div class="rel-list">
          <div v-for="c in relCompanies" :key="c.id" class="rel-item">
            <span class="rel-name">{{ c.name }}</span>
            <span class="rel-sub">{{ c.industry }}</span>
          </div>
        </div>
      </section>

      <!-- 更新日時 -->
      <div class="timestamp">
        最終更新: {{ formatDate(seed.updated_at) }}
      </div>

      <!-- 活動記録 -->
      <section class="section">
        <div class="section-head">
          <h3 class="section-title">活動記録</h3>
          <router-link :to="`/seeds/${seed.id}/activities/select`" class="btn-add-activity">
            ＋ 追加
          </router-link>
        </div>

        <div v-if="actStore.loading" class="act-loading">読み込み中…</div>

        <div v-else-if="actStore.activities.length === 0" class="act-empty">
          まだ活動記録はありません
        </div>

        <div v-else class="act-list">
          <router-link
            v-for="act in actStore.activities"
            :key="act.id"
            :to="`/seeds/${seed.id}/activities/${act.id}/edit/${act.type}`"
            class="act-card"
          >
            <div class="act-header">
              <span class="act-type-badge">
                {{ ACTIVITY_TYPES[act.type]?.icon }} {{ ACTIVITY_TYPES[act.type]?.label }}
              </span>
              <span class="act-date">{{ formatDate(act.date || act.created_at) }}</span>
            </div>
            <p class="act-summary">{{ act.summary }}</p>
            <p v-if="act.location" class="act-location">📍 {{ act.location }}</p>

            <!-- 手術立ち会い: 器具数表示 -->
            <p v-if="act.type === 'surgery' && act.detail?.instruments?.length"
               class="act-sub">
              🔧 器具 {{ act.detail.instruments.length }}件
            </p>
            <!-- 面談: 相手表示 -->
            <p v-if="act.type === 'meeting' && act.detail?.person_ids?.length"
               class="act-sub">
              👤 {{ act.detail.person_ids.map(id => personName(id)).join('・') }}
            </p>
            <span class="act-by">{{ act.created_by_name }}</span>
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeedsStore, PRIORITIES } from '../stores/seeds.js'
import { useMastersStore } from '../stores/masters.js'
import { useActivitiesStore, ACTIVITY_TYPES } from '../stores/activities.js'

const route      = useRoute()
const router     = useRouter()
const seeds      = useSeedsStore()
const masters    = useMastersStore()
const actStore   = useActivitiesStore()

const seed    = ref(null)
const loading = ref(true)

const personName = (id) => masters.persons.find(p => p.id === Number(id))?.name || String(id)

const STATUS_COLORS = {
  '課題':'#4f7cff','解決案':'#00d4aa','事業アイデア':'#ffc832',
  '検討中':'#ff6b4a','開発中':'#b450ff','事業化':'#32c864'
}
const statusColor   = (s) => STATUS_COLORS[s] || '#8890a8'
const priorityColor = (p) => ['#535872','#ffc832','#ff6b4a'][p] || '#535872'

const relPersons  = computed(() =>
  (seed.value?.person_ids || []).map(id => masters.persons.find(p => p.id === id)).filter(Boolean)
)
const relCompanies = computed(() =>
  (seed.value?.company_ids || []).map(id => masters.companies.find(c => c.id === id)).filter(Boolean)
)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { year:'numeric', month:'short', day:'numeric' })
}

onMounted(async () => {
  try {
    seed.value = await seeds.getSeed(route.params.id)
    actStore.fetchBySeed(route.params.id)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { padding-bottom: 40px; min-height: 100svh; }
.page-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border); position: sticky; top: 0;
  background: var(--bg); z-index: 10;
}
.header-title { flex: 1; font-size: 16px; font-weight: 700; }
.btn-back { background: none; border: none; color: var(--accent); font-size: 18px; cursor: pointer; padding: 4px 8px; }
.btn-edit { background: none; border: 1px solid var(--accent); border-radius: var(--radius-s); color: var(--accent); font-size: 13px; padding: 5px 12px; text-decoration: none; }

.loading { text-align: center; color: var(--text3); padding: 40px; }

.status-row { display: flex; align-items: center; gap: 10px; padding: 14px 16px 0; flex-wrap: wrap; }
.status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.priority-label { font-size: 12px; }
.created-by { margin-left: auto; font-size: 11px; color: var(--text3); }

.seed-title { font-size: 20px; font-weight: 700; color: var(--text); padding: 10px 16px 8px; line-height: 1.4; }

.meta-row { display: flex; gap: 14px; padding: 0 16px 10px; font-size: 13px; color: var(--text3); }

.tags-row { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 10px; }
.chip { background: var(--surface3); border: 1px solid var(--border2); border-radius: 20px; font-size: 12px; color: var(--text2); padding: 3px 10px; }

.section { margin: 0 16px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
.section-title { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }

.description { font-size: 14px; color: var(--text); line-height: 1.7; white-space: pre-wrap; }

.rel-list { display: flex; flex-direction: column; gap: 8px; }
.rel-item { display: flex; align-items: baseline; gap: 8px; }
.rel-name { font-size: 14px; color: var(--text); font-weight: 500; }
.rel-sub  { font-size: 12px; color: var(--text3); }

.timestamp { font-size: 11px; color: var(--text3); text-align: right; padding: 4px 16px 16px; }

/* 活動記録セクション */
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-head .section-title { margin-bottom: 0; }
.btn-add-activity {
  background: var(--accent); color: #fff; border-radius: var(--radius-s);
  font-size: 12px; font-weight: 600; padding: 4px 10px; text-decoration: none;
}
.act-loading, .act-empty { font-size: 13px; color: var(--text3); text-align: center; padding: 12px 0; }
.act-list { display: flex; flex-direction: column; gap: 10px; }

.act-card {
  display: block; text-decoration: none;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 12px;
  transition: border-color .15s;
}
.act-card:active { border-color: var(--accent); }
.act-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.act-type-badge { font-size: 12px; font-weight: 600; color: var(--text2); }
.act-date { font-size: 11px; color: var(--text3); }
.act-summary { font-size: 13px; color: var(--text); line-height: 1.5; margin-bottom: 4px; }
.act-location { font-size: 11px; color: var(--text3); margin-bottom: 4px; }
.act-sub { font-size: 11px; color: var(--text3); margin-bottom: 4px; }
.act-by { font-size: 10px; color: var(--text3); }
</style>
