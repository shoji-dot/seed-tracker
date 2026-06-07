<template>
  <router-view v-if="isLogin" />

  <template v-else>
    <router-view />

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">🌱</span>
        <span class="nav-label">シード</span>
      </router-link>
      <router-link to="/activities" class="nav-item" :class="{ active: $route.path === '/activities' }">
        <span class="nav-icon">🏥</span>
        <span class="nav-label">活動記録</span>
      </router-link>
      <router-link to="/persons" class="nav-item" :class="{ active: $route.path === '/persons' }">
        <span class="nav-icon">👤</span>
        <span class="nav-label">人物</span>
      </router-link>
      <router-link to="/companies" class="nav-item" :class="{ active: $route.path === '/companies' }">
        <span class="nav-icon">🏢</span>
        <span class="nav-label">企業</span>
      </router-link>
      <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">設定</span>
      </router-link>
    </nav>
  </template>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMastersStore } from './stores/masters.js'
import { useAuthStore } from './stores/auth.js'

const route   = useRoute()
const auth    = useAuthStore()
const masters = useMastersStore()

const isLogin = computed(() => route.path === '/login')

onMounted(async () => {
  if (auth.isLoggedIn) {
    masters.fetchAll()
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --bg:       #0d0f14;
  --surface:  #161921;
  --surface2: #1e2230;
  --surface3: #252a3a;
  --border:   #2a2f42;
  --border2:  #353b52;
  --accent:   #4f7cff;
  --accent-d: #3a62d4;
  --accent-g: #00d4aa;
  --accent-w: #ffc832;
  --accent-r: #ff6b4a;
  --accent-p: #b450ff;
  --accent-s: #32c864;
  --text:     #eaedf5;
  --text2:    #8890a8;
  --text3:    #535872;
  --radius:   10px;
  --radius-s: 6px;
  --radius-l: 16px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}

input, textarea, button, select { font-family: inherit; }

.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text3);
  transition: color .15s;
  padding: 6px 0;
}
.nav-item.active { color: var(--accent); }
.nav-icon  { font-size: 20px; line-height: 1; }
.nav-label { font-size: 9px; font-weight: 500; }
</style>
