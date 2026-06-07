<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <router-link to="/"
        class="nav-item"
        :class="{ active: ['list','detail','new','edit'].includes($route.name) }">
        <span class="nav-icon">🌱</span>
        <span class="nav-label">シード</span>
      </router-link>

      <!-- マスタメニュー（タグ・人物・企業） -->
      <button class="nav-item" :class="{ active: masterOpen || isMasterRoute }" @click="masterOpen = !masterOpen">
        <span class="nav-icon">📂</span>
        <span class="nav-label">マスタ</span>
      </button>

      <!-- FAB -->
      <router-link to="/new" class="nav-fab">
        <span class="fab-icon">＋</span>
      </router-link>

      <router-link to="/settings"
        class="nav-item"
        :class="{ active: $route.name === 'settings' }">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">設定</span>
      </router-link>

      <div class="nav-placeholder"></div>
    </nav>

    <!-- マスタサブメニュー -->
    <transition name="slide-up">
      <div v-if="masterOpen" class="master-menu" @click.self="masterOpen = false">
        <div class="master-panel">
          <p class="master-title">マスタ管理</p>
          <router-link to="/tags"      class="master-item" @click="masterOpen=false">
            <span class="mi-icon">🏷️</span><span class="mi-label">タグ管理</span>
            <span class="mi-count">{{ store.tags.length }}</span>
          </router-link>
          <router-link to="/persons"   class="master-item" @click="masterOpen=false">
            <span class="mi-icon">👤</span><span class="mi-label">関連人物</span>
            <span class="mi-count">{{ store.persons.length }}</span>
          </router-link>
          <router-link to="/companies" class="master-item" @click="masterOpen=false">
            <span class="mi-icon">🏢</span><span class="mi-label">関連企業・機関</span>
            <span class="mi-count">{{ store.companies.length }}</span>
          </router-link>
          <button class="master-close" @click="masterOpen=false">閉じる</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSeedStore } from './stores/seeds'

const store = useSeedStore()
const route = useRoute()

const masterOpen = ref(false)
const isMasterRoute = computed(() =>
  ['tags','persons','companies'].includes(route.name)
)

// ルート変わったらメニュー閉じる
watch(() => route.name, () => { masterOpen.value = false })

import { onMounted } from 'vue'
onMounted(() => store.fetchAll())
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-bottom: calc(72px + var(--safe-bot));
}

.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: calc(64px + var(--safe-bot));
  padding-bottom: var(--safe-bot);
  background: rgba(22,25,33,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  text-decoration: none; color: var(--text3);
  transition: color 0.15s;
  padding: 8px 16px; border-radius: var(--radius);
  flex: 1; min-width: 0;
  background: none; font-family: inherit;
}
.nav-item.active { color: var(--accent); }
.nav-item:hover  { color: var(--text2); }

.nav-icon  { font-size: 20px; line-height: 1; }
.nav-label { font-size: 10px; font-weight: 500; white-space: nowrap; }
.nav-placeholder { flex: 1; }

.nav-fab {
  width: 52px; height: 52px;
  background: var(--accent); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; color: #fff;
  font-size: 24px; font-weight: 300; line-height: 1;
  box-shadow: 0 4px 20px rgba(79,124,255,0.5);
  flex-shrink: 0; margin-top: -10px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.nav-fab:hover, .nav-fab:active {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(79,124,255,0.65);
}
.fab-icon { line-height: 1; margin-top: -1px; }

/* ── マスタサブメニュー */
.master-menu {
  position: fixed; inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: flex-end;
}

.master-panel {
  width: 100%;
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-radius: var(--radius-l) var(--radius-l) 0 0;
  padding: 20px 16px calc(16px + var(--safe-bot));
  display: flex; flex-direction: column; gap: 8px;
}

.master-title {
  font-size: 11px; font-weight: 700; color: var(--text3);
  text-transform: uppercase; letter-spacing: .08em;
  margin-bottom: 8px;
}

.master-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius); text-decoration: none; color: var(--text);
  transition: background 0.15s;
}
.master-item:hover { background: var(--surface3); }

.mi-icon  { font-size: 20px; }
.mi-label { flex: 1; font-size: 14px; font-weight: 600; }
.mi-count {
  font-size: 12px; font-family: 'DM Mono', monospace;
  color: var(--text3);
  background: var(--surface3); border: 1px solid var(--border);
  padding: 2px 8px; border-radius: 10px;
}

.master-close {
  margin-top: 4px; padding: 12px;
  background: none; border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text2);
  font-family: 'Noto Sans JP', sans-serif; font-size: 14px; font-weight: 600;
  transition: background 0.15s;
}
.master-close:hover { background: var(--surface2); }
</style>
