<template>
  <div class="settings-view">
    <AppHeader title="設定" />

    <div class="settings-body">

      <!-- データ統計 -->
      <section class="settings-section">
        <p class="section-title">データ概要</p>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-num">{{ store.seeds.length }}</span>
            <span class="stat-label">シード総数</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ store.tags.length }}</span>
            <span class="stat-label">タグ数</span>
          </div>
          <div class="stat-card" v-for="s in topStatuses" :key="s.value" :style="{ '--sc': s.color }">
            <span class="stat-num status-num">{{ store.statusCounts[s.value] || 0 }}</span>
            <span class="stat-label">{{ s.emoji }} {{ s.label }}</span>
          </div>
        </div>
      </section>

      <!-- エクスポート -->
      <section class="settings-section">
        <p class="section-title">データ出力</p>
        <div class="action-list">
          <button class="action-item" @click="store.exportCSV()">
            <div class="action-icon csv">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v9M6 9l4 4 4-4M4 14v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-text">
              <span class="action-name">CSVエクスポート</span>
              <span class="action-desc">全シードをCSVファイルで出力（Excel対応）</span>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <button class="action-item" @click="exportJSON">
            <div class="action-icon json">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>
                <path d="M7 8c-1 0-1.5.5-1.5 1.5v1c0 1 .5 1.5 1.5 1.5M9 7v6M13 8c1 0 1.5.5 1.5 1.5v1c0 1-.5 1.5-1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="action-text">
              <span class="action-name">JSONバックアップ</span>
              <span class="action-desc">全データをJSONで保存（インポート対応）</span>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- インポート -->
      <section class="settings-section">
        <p class="section-title">データ読み込み</p>
        <div class="action-list">
          <label class="action-item import-label">
            <input type="file" accept=".json" class="file-input" @change="importJSON" />
            <div class="action-icon import">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 14V5M6 8l4-4 4 4M4 14v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-text">
              <span class="action-name">JSONインポート</span>
              <span class="action-desc">バックアップから復元（既存データに追加）</span>
            </div>
            <svg class="action-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </label>
        </div>
        <p v-if="importMsg" class="import-msg" :class="importOk ? 'ok' : 'ng'">{{ importMsg }}</p>
      </section>

      <!-- データリセット -->
      <section class="settings-section danger-section">
        <p class="section-title danger">危険な操作</p>
        <button class="action-item danger-item" @click="resetAll">
          <div class="action-icon danger">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 6h12M7 6V4h6v2M15 6l-1 11H6L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="action-text">
            <span class="action-name danger">全データを削除</span>
            <span class="action-desc">シードとタグをすべて削除します（取消不可）</span>
          </div>
        </button>
      </section>

      <!-- アプリ情報 -->
      <section class="settings-section app-info">
        <div class="info-row">
          <span class="mono">SeedTracker</span>
          <span class="mono text3">v1.0.0 MVP</span>
        </div>
        <p class="info-desc">現場課題から事業化まで追跡する社内業務アプリ。<br>データはすべてローカルのIndexedDBに保存されます。</p>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSeedStore } from '../stores/seeds'
import { db, STATUSES } from '../db'
import AppHeader from '../components/AppHeader.vue'

const store = useSeedStore()

const topStatuses = STATUSES.slice(0, 3)

const importMsg = ref('')
const importOk  = ref(false)

// JSONエクスポート
async function exportJSON() {
  const [seeds, tags, persons, companies] = await Promise.all([db.seeds.toArray(), db.tags.toArray(), db.persons.toArray(), db.companies.toArray()])
  const data = { version: 2, exportedAt: new Date().toISOString(), seeds, tags, persons, companies }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `seeds_backup_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// JSONインポート
async function importJSON(e) {
  const file = e.target.files?.[0]
  if (!file) return
  importMsg.value = ''
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!data.seeds || !Array.isArray(data.seeds)) throw new Error('不正なフォーマット')

    let seedCount = 0, tagCount = 0

    for (const tag of (data.tags || [])) {
      const exists = await db.tags.get(tag.id)
      if (!exists) {
        await db.tags.put(tag)
        tagCount++
      }
    }
    for (const person of (data.persons || [])) {
      const exists = await db.persons.get(person.id)
      if (!exists) { await db.persons.put(person); tagCount++ }
    }
    for (const company of (data.companies || [])) {
      const exists = await db.companies.get(company.id)
      if (!exists) { await db.companies.put(company); tagCount++ }
    }
    for (const seed of data.seeds) {
      const exists = await db.seeds.get(seed.id)
      if (!exists) {
        await db.seeds.put(seed)
        seedCount++
      }
    }

    await store.fetchAll()
    importOk.value  = true
    importMsg.value = `インポート完了：シード ${seedCount}件、タグ ${tagCount}件 を追加しました`
  } catch (err) {
    importOk.value  = false
    importMsg.value = 'インポートに失敗しました: ' + err.message
  }
  e.target.value = ''
}

// 全削除
async function resetAll() {
  if (!confirm('全データを削除します。この操作は取り消せません。本当によろしいですか？')) return
  if (!confirm('最終確認：全シード・全タグを完全に削除します。')) return
  await Promise.all([db.seeds.clear(), db.tags.clear(), db.persons.clear(), db.companies.clear(), db.attachments.clear()])
  await store.fetchAll()
}
</script>

<style scoped>
.settings-view { display: flex; flex-direction: column; min-height: 100%; }

.settings-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.settings-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title.danger { color: var(--accent-r); }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.stat-num {
  font-family: 'DM Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.stat-num.status-num { color: var(--sc, var(--text)); }

.stat-label {
  font-size: 10px;
  color: var(--text3);
  text-align: center;
}

/* Action list */
.action-list { display: flex; flex-direction: column; gap: 8px; }

.action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: left;
  width: 100%;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: 'Noto Sans JP', sans-serif;
}

.action-item:hover { background: var(--surface3); border-color: var(--border2); }

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-s);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.csv    { background: rgba(50,200,100,0.15); color: var(--accent-s); }
.action-icon.json   { background: rgba(255,200,50,0.15); color: var(--accent-w); }
.action-icon.import { background: rgba(79,124,255,0.15); color: var(--accent); }
.action-icon.danger { background: rgba(255,107,74,0.15); color: var(--accent-r); }

.action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.action-name.danger { color: var(--accent-r); }

.action-desc {
  font-size: 11px;
  color: var(--text3);
  line-height: 1.4;
}

.action-arrow { color: var(--text3); flex-shrink: 0; }

/* Import */
.import-label { cursor: pointer; }
.file-input   { display: none; }

.import-msg {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-s);
}

.import-msg.ok {
  background: rgba(50,200,100,0.1);
  border: 1px solid rgba(50,200,100,0.25);
  color: var(--accent-s);
}

.import-msg.ng {
  background: rgba(255,107,74,0.1);
  border: 1px solid rgba(255,107,74,0.25);
  color: var(--accent-r);
}

/* Danger */
.danger-section { border-color: rgba(255,107,74,0.2); }
.danger-item { border-color: rgba(255,107,74,0.15); }
.danger-item:hover { border-color: rgba(255,107,74,0.35); background: rgba(255,107,74,0.06); }

/* App info */
.app-info { gap: 8px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-desc { font-size: 12px; color: var(--text3); line-height: 1.7; }
.mono { font-family: 'DM Mono', monospace; font-size: 12px; }
.text3 { color: var(--text3); }
</style>
