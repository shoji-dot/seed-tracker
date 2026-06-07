<template>
  <header class="app-header">
    <div class="header-inner">
      <button v-if="back" class="back-btn" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-title-wrap">
        <h1 class="header-title">{{ title }}</h1>
        <p v-if="sub" class="header-sub">{{ sub }}</p>
      </div>
      <div class="header-actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  sub:   { type: String, default: '' },
  back:  { type: Boolean, default: false },
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(13,15,20,0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding-top: var(--safe-top);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
}

.back-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.back-btn:hover { background: var(--surface3); color: var(--text); }

.header-title-wrap { flex: 1; min-width: 0; }

.header-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-sub {
  font-size: 11px;
  color: var(--text3);
  margin-top: 1px;
  font-family: 'DM Mono', monospace;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
</style>
