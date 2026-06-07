<template>
  <div class="tags-view">
    <AppHeader title="タグ管理" :sub="`${store.tags.length}件`" />

    <div class="tags-body">

      <!-- 新規追加フォーム -->
      <div class="add-form">
        <p class="form-title">新しいタグを追加</p>
        <div class="add-row">
          <div class="color-picker-wrap">
            <input
              v-model="newColor"
              type="color"
              class="color-input"
              title="カラーを選択"
            />
            <span class="color-dot" :style="{ background: newColor }"></span>
          </div>
          <input
            v-model="newName"
            type="text"
            placeholder="タグ名..."
            class="name-input"
            maxlength="20"
            @keyup.enter="addTag"
          />
          <button class="add-btn" @click="addTag" :disabled="!newName.trim()">追加</button>
        </div>
        <p v-if="addError" class="error-msg">{{ addError }}</p>
      </div>

      <!-- タグ一覧 -->
      <div class="tag-list">
        <p class="list-title">タグ一覧</p>

        <div v-if="!store.tags.length" class="empty-state">
          <span>🏷️</span>
          <p>タグがまだありません</p>
        </div>

        <transition-group name="slide-up" tag="div" class="tag-items">
          <div
            v-for="tag in store.tags"
            :key="tag.id"
            class="tag-item"
          >
            <!-- 表示モード -->
            <template v-if="editingId !== tag.id">
              <div class="tag-left">
                <span class="tag-dot" :style="{ background: tag.color }"></span>
                <span class="tag-name" :style="{ color: tag.color }">{{ tag.name }}</span>
                <span class="tag-count">{{ countForTag(tag.id) }}件</span>
              </div>
              <div class="tag-actions">
                <button class="action-btn edit" @click="startEdit(tag)">編集</button>
                <button class="action-btn del"  @click="removeTag(tag)">削除</button>
              </div>
            </template>

            <!-- 編集モード -->
            <template v-else>
              <div class="edit-row">
                <input
                  v-model="editColor"
                  type="color"
                  class="color-input small"
                />
                <span class="color-dot" :style="{ background: editColor }"></span>
                <input
                  v-model="editName"
                  type="text"
                  class="name-input"
                  maxlength="20"
                  @keyup.enter="saveEdit(tag.id)"
                />
                <button class="add-btn" @click="saveEdit(tag.id)" :disabled="!editName.trim()">保存</button>
                <button class="cancel-btn" @click="editingId = null">✕</button>
              </div>
            </template>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSeedStore } from '../stores/seeds'
import AppHeader from '../components/AppHeader.vue'

const store = useSeedStore()

// 新規追加
const newName  = ref('')
const newColor = ref('#4f7cff')
const addError = ref('')

const PRESET_COLORS = [
  '#4f7cff','#00d4aa','#ffc832','#ff6b4a',
  '#b450ff','#32c864','#ff4e8a','#00aaff'
]

async function addTag() {
  if (!newName.value.trim()) return
  addError.value = ''
  if (store.tags.some(t => t.name === newName.value.trim())) {
    addError.value = '同じ名前のタグが既に存在します'
    return
  }
  await store.createTag(newName.value.trim(), newColor.value)
  newName.value  = ''
  newColor.value = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
}

// 編集
const editingId = ref(null)
const editName  = ref('')
const editColor = ref('')

function startEdit(tag) {
  editingId.value = tag.id
  editName.value  = tag.name
  editColor.value = tag.color
}

async function saveEdit(id) {
  if (!editName.value.trim()) return
  await store.editTag(id, { name: editName.value.trim(), color: editColor.value })
  editingId.value = null
}

async function removeTag(tag) {
  const count = countForTag(tag.id)
  const msg = count > 0
    ? `「${tag.name}」タグを削除します。このタグは${count}件のシードに使用されています。続けますか？`
    : `「${tag.name}」タグを削除しますか？`
  if (!confirm(msg)) return
  await store.removeTag(tag.id)
}

function countForTag(id) {
  return store.seeds.filter(s => (s.tagIds || []).includes(id)).length
}
</script>

<style scoped>
.tags-view { display: flex; flex-direction: column; min-height: 100%; }

.tags-body { padding: 16px; display: flex; flex-direction: column; gap: 20px; }

/* Add form */
.add-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.add-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.edit-row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.color-picker-wrap {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
}

.color-input.small {
  position: relative;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: block;
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
  transition: transform 0.15s;
}

.color-dot:hover { transform: scale(1.1); }

.name-input {
  flex: 1;
  height: 38px;
  padding: 8px 12px;
}

.add-btn {
  padding: 8px 16px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-s);
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s;
}

.add-btn:hover:not(:disabled) { background: var(--accent-d); }
.add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.cancel-btn {
  padding: 8px 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  color: var(--text2);
  font-size: 13px;
}

/* Tag list */
.tag-list { display: flex; flex-direction: column; gap: 10px; }

.list-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tag-items { display: flex; flex-direction: column; gap: 8px; }

.tag-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tag-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-count {
  font-size: 11px;
  color: var(--text3);
  font-family: 'DM Mono', monospace;
  white-space: nowrap;
}

.tag-actions { display: flex; gap: 6px; flex-shrink: 0; }

.action-btn {
  font-size: 12px;
  padding: 5px 10px;
  border-radius: var(--radius-s);
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: 600;
  transition: all 0.15s;
}

.action-btn.edit {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
}

.action-btn.edit:hover { background: var(--surface3); color: var(--text); }

.action-btn.del {
  background: rgba(255,107,74,0.08);
  border: 1px solid rgba(255,107,74,0.2);
  color: var(--accent-r);
}

.action-btn.del:hover { background: rgba(255,107,74,0.18); }

/* Empty */
.empty-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: var(--text3);
  font-size: 13px;
}

.error-msg {
  font-size: 12px;
  color: var(--accent-r);
  padding: 8px 12px;
  background: rgba(255,107,74,0.1);
  border: 1px solid rgba(255,107,74,0.2);
  border-radius: var(--radius-s);
}
</style>
