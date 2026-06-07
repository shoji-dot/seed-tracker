<template>
  <div class="photo-attachment">
    <!-- サムネイルグリッド -->
    <div v-if="photos.length" class="photo-grid">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="photo-item"
        @click="openViewer(photo)"
      >
        <img :src="photo.dataUrl" :alt="photo.fileName" class="photo-thumb" />
        <button
          v-if="editable"
          class="photo-delete"
          @click.stop="removePhoto(photo)"
          type="button"
          title="削除"
        >✕</button>
      </div>

      <!-- 追加ボタン（グリッド内） -->
      <label v-if="editable && photos.length < MAX_PHOTOS" class="add-tile">
        <input type="file" accept="image/*" multiple capture="environment" class="file-input" @change="onFilePick" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <span>追加</span>
      </label>
    </div>

    <!-- 空の状態：大きい追加ボタン -->
    <label v-else-if="editable" class="add-area">
      <input type="file" accept="image/*" multiple capture="environment" class="file-input" @change="onFilePick" />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="1.8"/>
        <path d="M10 6l2-4h8l2 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="add-label">写真を追加</p>
      <p class="add-sub">タップしてカメラ撮影 / ライブラリから選択</p>
    </label>

    <!-- 読み取り専用で写真なし -->
    <p v-else-if="!photos.length" class="no-photo">写真なし</p>

    <p v-if="photos.length >= MAX_PHOTOS" class="limit-msg">
      最大{{ MAX_PHOTOS }}枚まで添付できます
    </p>

    <!-- ビューワーモーダル -->
    <Teleport to="body">
      <div v-if="viewing" class="viewer-overlay" @click.self="viewing = null">
        <div class="viewer-box">
          <img :src="viewing.dataUrl" :alt="viewing.fileName" class="viewer-img" />
          <div class="viewer-footer">
            <span class="viewer-name">{{ viewing.fileName }}</span>
            <button v-if="editable" class="viewer-delete" @click="removePhoto(viewing); viewing = null" type="button">
              削除
            </button>
          </div>
        </div>
        <button class="viewer-close" @click="viewing = null">✕</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const MAX_PHOTOS = 10
const MAX_SIZE_MB = 5

const props = defineProps({
  photos:   { type: Array,   default: () => [] },
  editable: { type: Boolean, default: true },
})

const emit = defineEmits(['add', 'remove'])
const viewing = ref(null)

function openViewer(photo) {
  viewing.value = photo
}

async function onFilePick(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  const remaining = MAX_PHOTOS - props.photos.length
  const toProcess = files.slice(0, remaining)

  for (const file of toProcess) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`${file.name} は${MAX_SIZE_MB}MB を超えています。スキップします。`)
      continue
    }
    const dataUrl = await readAsDataURL(file)
    const compressed = await compressImage(dataUrl, 1200, 0.75)
    emit('add', { dataUrl: compressed, fileName: file.name })
  }
  e.target.value = ''
}

function readAsDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res(reader.result)
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

function compressImage(dataUrl, maxWidth, quality) {
  return new Promise(res => {
    const img = new Image()
    img.onload = () => {
      const ratio  = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = img.width  * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      res(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

function removePhoto(photo) {
  emit('remove', photo)
}
</script>

<style scoped>
.photo-attachment { display: flex; flex-direction: column; gap: 10px; }

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-s);
  overflow: hidden;
  background: var(--surface2);
  cursor: pointer;
}

.photo-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.15s;
}

.photo-item:hover .photo-thumb { opacity: 0.85; }

.photo-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.photo-delete:hover { background: var(--accent-r); }

.add-tile {
  aspect-ratio: 1;
  border: 1.5px dashed var(--border2);
  border-radius: var(--radius-s);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: var(--text3);
  font-size: 11px;
  transition: border-color 0.15s, color 0.15s;
}

.add-tile:hover { border-color: var(--accent); color: var(--accent); }

.file-input { display: none; }

/* 大きい追加エリア */
.add-area {
  border: 1.5px dashed var(--border2);
  border-radius: var(--radius);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text3);
  transition: border-color 0.15s, background 0.15s;
}

.add-area:hover {
  border-color: var(--accent);
  background: rgba(79,124,255,0.04);
  color: var(--accent);
}

.add-label { font-size: 14px; font-weight: 600; }
.add-sub   { font-size: 12px; color: var(--text3); text-align: center; }

.no-photo { font-size: 13px; color: var(--text3); }

.limit-msg { font-size: 11px; color: var(--text3); }

/* ── ビューワーモーダル */
.viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.88);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.viewer-box {
  max-width: 100%;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.viewer-img {
  max-width: 100%;
  max-height: 80dvh;
  object-fit: contain;
  border-radius: var(--radius);
}

.viewer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.viewer-name { font-size: 12px; color: var(--text2); font-family: 'DM Mono', monospace; }

.viewer-delete {
  background: rgba(255,107,74,0.15);
  border: 1px solid rgba(255,107,74,0.35);
  color: var(--accent-r);
  padding: 6px 14px;
  border-radius: var(--radius-s);
  font-size: 13px;
  font-weight: 600;
  font-family: 'Noto Sans JP', sans-serif;
  transition: background 0.15s;
}

.viewer-delete:hover { background: rgba(255,107,74,0.28); }

.viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.viewer-close:hover { background: rgba(255,255,255,0.2); }
</style>
