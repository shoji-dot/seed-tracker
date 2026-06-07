<template>
  <article class="seed-card" @click="$router.push(`/seed/${seed.id}`)">
    <div class="card-top">
      <span class="category-badge">
        {{ categoryInfo?.emoji }} {{ categoryInfo?.label }}
      </span>
      <span class="status-chip" :style="{ '--sc': statusInfo?.color }">
        {{ statusInfo?.emoji }} {{ statusInfo?.label }}
      </span>
    </div>

    <h3 class="card-title">{{ seed.title }}</h3>

    <p v-if="seed.body" class="card-body">{{ seed.body }}</p>

    <div class="card-footer">
      <div class="card-tags">
        <span
          v-for="id in (seed.tagIds || []).slice(0, 4)"
          :key="id"
          class="tag-chip"
          :style="tagMap[id] ? { '--tc': tagMap[id].color } : {}"
        >{{ tagMap[id]?.name }}</span>
        <span v-if="(seed.tagIds || []).length > 4" class="tag-more">
          +{{ seed.tagIds.length - 4 }}
        </span>
      </div>
      <span class="card-date">{{ formatDate(seed.updatedAt) }}</span>
    </div>

    <div v-if="seed.source" class="card-source">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1a5 5 0 100 10A5 5 0 006 1zM6 5v4M6 3.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      {{ seed.source }}
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { CATEGORY_MAP, STATUS_MAP } from '../db'

const props = defineProps({
  seed:   { type: Object, required: true },
  tagMap: { type: Object, default: () => ({}) },
})

const categoryInfo = computed(() => CATEGORY_MAP[props.seed.category])
const statusInfo   = computed(() => STATUS_MAP[props.seed.status])

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) {
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 86400000 * 7) {
    return `${Math.floor(diff / 86400000)}日前`
  }
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.seed-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
  position: relative;
  overflow: hidden;
}

.seed-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.15s;
}

.seed-card:hover {
  border-color: var(--border2);
  background: var(--surface2);
  transform: translateY(-1px);
}

.seed-card:hover::before { opacity: 1; }
.seed-card:active { transform: translateY(0); }

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.category-badge {
  font-size: 11px;
  color: var(--text2);
  font-family: 'DM Mono', monospace;
}

.status-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--sc, var(--accent)) 15%, transparent);
  color: var(--sc, var(--accent));
  border: 1px solid color-mix(in srgb, var(--sc, var(--accent)) 35%, transparent);
  white-space: nowrap;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.card-body {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.tag-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--tc, var(--accent)) 15%, transparent);
  color: var(--tc, var(--accent));
  border: 1px solid color-mix(in srgb, var(--tc, var(--accent)) 30%, transparent);
}

.tag-more {
  font-size: 11px;
  color: var(--text3);
}

.card-date {
  font-size: 11px;
  color: var(--text3);
  font-family: 'DM Mono', monospace;
  white-space: nowrap;
}

.card-source {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text3);
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
</style>
