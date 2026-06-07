<template>
  <div class="list-view">
    <AppHeader title="SeedTracker" sub="新規事業シード管理">
      <template #actions>
        <button class="icon-btn" @click="store.exportCSV()" title="CSVエクスポート">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v9M5 8l4 4 4-4M3 13v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </template>
    </AppHeader>

    <!-- 検索バー -->
    <div class="search-wrap">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="store.searchQuery"
          type="search"
          placeholder="タイトル・本文・情報源で検索..."
          class="search-input"
          @input="onSearch"
        />
        <button v-if="store.searchQuery" class="clear-btn" @click="store.searchQuery = ''">✕</button>
      </div>
    </div>

    <!-- ステータスタブ -->
    <div class="status-tabs">
      <button
        class="status-tab"
        :class="{ active: store.activeStatus === 'all' }"
        @click="store.activeStatus = 'all'"
      >
        全て
        <span class="tab-count">{{ store.statusCounts.all || 0 }}</span>
      </button>
      <button
        v-for="s in STATUSES"
        :key="s.value"
        class="status-tab"
        :class="{ active: store.activeStatus === s.value }"
        :style="store.activeStatus === s.value ? { '--sc': s.color } : {}"
        @click="store.activeStatus = s.value"
      >
        {{ s.emoji }}
        <span class="tab-count">{{ store.statusCounts[s.value] || 0 }}</span>
      </button>
    </div>

    <!-- カテゴリフィルター -->
    <div class="category-filter">
      <button
        class="cat-chip"
        :class="{ active: store.activeCategory === 'all' }"
        @click="store.activeCategory = 'all'"
      >すべて</button>
      <button
        v-for="c in CATEGORIES"
        :key="c.value"
        class="cat-chip"
        :class="{ active: store.activeCategory === c.value }"
        @click="store.activeCategory = c.value"
      >{{ c.emoji }} {{ c.label }}</button>
    </div>

    <!-- リスト本体 -->
    <main class="list-body">
      <div v-if="store.loading" class="empty-state">
        <span class="empty-emoji">⏳</span>
        <p>読み込み中...</p>
      </div>

      <template v-else-if="store.filteredSeeds.length">
        <transition-group name="slide-up" tag="div" class="card-list">
          <SeedCard
            v-for="seed in store.filteredSeeds"
            :key="seed.id"
            :seed="seed"
            :tag-map="store.tagMap"
          />
        </transition-group>
      </template>

      <div v-else class="empty-state">
        <span class="empty-emoji">{{ store.searchQuery ? '🔍' : '🌱' }}</span>
        <p class="empty-title">{{ store.searchQuery ? '見つかりませんでした' : 'まだシードがありません' }}</p>
        <p class="empty-sub">{{ store.searchQuery ? '別のキーワードで検索してください' : '＋ボタンから最初のシードを登録しましょう' }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useSeedStore } from '../stores/seeds'
import { STATUSES, CATEGORIES } from '../db'
import AppHeader from '../components/AppHeader.vue'
import SeedCard  from '../components/SeedCard.vue'

const store = useSeedStore()

function onSearch() {
  // リアルタイム検索はcomputedで自動実行
}
</script>

<style scoped>
.list-view { display: flex; flex-direction: column; min-height: 100%; }

.search-wrap {
  padding: 14px 16px 10px;
  background: var(--bg);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text3);
  pointer-events: none;
}

.search-input {
  padding-left: 38px;
  padding-right: 36px;
  background: var(--surface);
  height: 42px;
}

.search-input::-webkit-search-cancel-button { display: none; }

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  color: var(--text3);
  font-size: 13px;
  padding: 4px;
  border-radius: 4px;
}

.clear-btn:hover { color: var(--text); }

/* Status tabs */
.status-tabs {
  display: flex;
  gap: 4px;
  padding: 0 16px 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.status-tabs::-webkit-scrollbar { display: none; }

.status-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text2);
  font-size: 12px;
  font-family: 'Noto Sans JP', sans-serif;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.status-tab:hover { border-color: var(--border2); color: var(--text); }

.status-tab.active {
  background: color-mix(in srgb, var(--sc, var(--accent)) 15%, transparent);
  border-color: color-mix(in srgb, var(--sc, var(--accent)) 40%, transparent);
  color: var(--sc, var(--accent));
  font-weight: 600;
}

.tab-count {
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  opacity: 0.8;
}

/* Category filter */
.category-filter {
  display: flex;
  gap: 6px;
  padding: 0 16px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-filter::-webkit-scrollbar { display: none; }

.cat-chip {
  padding: 4px 10px;
  border-radius: 20px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text3);
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: 'Noto Sans JP', sans-serif;
  transition: all 0.15s;
}

.cat-chip:hover { border-color: var(--border2); color: var(--text2); }

.cat-chip.active {
  background: var(--surface2);
  border-color: var(--accent);
  color: var(--accent);
}

/* List */
.list-body { flex: 1; padding: 4px 16px 16px; }

.card-list { display: flex; flex-direction: column; gap: 10px; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  gap: 8px;
}

.empty-emoji { font-size: 48px; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 600; }
.empty-sub   { font-size: 13px; color: var(--text2); line-height: 1.6; }

/* Icon button */
.icon-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  transition: background 0.15s, color 0.15s;
}

.icon-btn:hover { background: var(--surface3); color: var(--text); }

/* Transition group */
.slide-up-move { transition: transform 0.3s; }
</style>
