<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="router.back()">←</button>
      <h2>活動記録を追加</h2>
    </header>

    <div class="seed-label">
      <span class="seed-label-icon">🌱</span>
      <span class="seed-label-title">{{ seedTitle }}</span>
    </div>

    <p class="guide">活動の種別を選んでください</p>

    <div class="type-grid">
      <button
        v-for="(def, key) in ACTIVITY_TYPES"
        :key="key"
        class="type-card"
        @click="goToForm(key)"
      >
        <span class="type-icon">{{ def.icon }}</span>
        <span class="type-label">{{ def.label }}</span>
        <span class="type-arrow">›</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ACTIVITY_TYPES } from '../stores/activities.js'
import { useSeedsStore } from '../stores/seeds.js'

const route  = useRoute()
const router = useRouter()
const seeds  = useSeedsStore()

const seedTitle = ref('読み込み中…')

onMounted(async () => {
  try {
    const seed = await seeds.getSeed(route.params.seedId)
    seedTitle.value = seed.title
  } catch {
    seedTitle.value = '不明なシード'
  }
})

function goToForm(type) {
  router.push(`/seeds/${route.params.seedId}/activities/new/${type}`)
}
</script>

<style scoped>
.page { min-height: 100svh; background: var(--bg); padding-bottom: 40px; }

.page-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: var(--bg); z-index: 10;
}
.page-header h2 { font-size: 16px; font-weight: 700; }
.btn-back { background: none; border: none; color: var(--accent); font-size: 18px; cursor: pointer; padding: 4px 8px; }

.seed-label {
  display: flex; align-items: center; gap: 8px;
  margin: 16px 16px 0;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 10px 14px;
}
.seed-label-icon { font-size: 16px; }
.seed-label-title { font-size: 13px; color: var(--text2); flex: 1; }

.guide {
  font-size: 13px; color: var(--text3);
  margin: 20px 16px 12px;
}

.type-grid {
  display: flex; flex-direction: column; gap: 10px;
  padding: 0 16px;
}

.type-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px 16px;
  cursor: pointer; text-align: left; width: 100%;
  transition: border-color .15s, background .15s;
}
.type-card:active {
  border-color: var(--accent);
  background: var(--surface2);
}

.type-icon  { font-size: 28px; line-height: 1; }
.type-label { flex: 1; font-size: 16px; font-weight: 600; color: var(--text); }
.type-arrow { font-size: 22px; color: var(--text3); }
</style>
