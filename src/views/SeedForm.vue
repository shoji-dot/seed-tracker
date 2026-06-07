<template>
  <div class="form-view">
    <AppHeader
      :title="isEdit ? 'シードを編集' : '新規シード登録'"
      :sub="isEdit ? `ID: ${id}` : ''"
      :back="true"
    >
      <template #actions>
        <button v-if="isEdit" class="delete-btn" @click="confirmDelete" title="削除">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5h12M7 5V3h4v2M14 5l-1 10H5L4 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </template>
    </AppHeader>

    <form class="form-body" @submit.prevent="handleSubmit">

      <!-- 種別 -->
      <div class="form-group">
        <label class="form-label">種別 <span class="required">必須</span></label>
        <div class="category-grid">
          <button
            v-for="c in CATEGORIES" :key="c.value" type="button"
            class="cat-btn" :class="{ active: form.category === c.value }"
            @click="form.category = c.value"
          >
            <span class="cat-emoji">{{ c.emoji }}</span>
            <span class="cat-label">{{ c.label }}</span>
          </button>
        </div>
      </div>

      <!-- タイトル -->
      <div class="form-group">
        <label class="form-label">タイトル <span class="required">必須</span></label>
        <input v-model="form.title" type="text" placeholder="課題・アイデアのタイトルを入力..."
          maxlength="100" required autofocus />
        <span class="char-count">{{ form.title.length }}/100</span>
      </div>

      <!-- ステータス -->
      <div class="form-group">
        <label class="form-label">ステータス</label>
        <StatusStepper v-model="form.status" />
      </div>

      <!-- 詳細メモ -->
      <div class="form-group">
        <label class="form-label">詳細メモ</label>
        <textarea v-model="form.body" placeholder="課題の背景、具体的な状況、数字など詳細を記録..." rows="5" />
      </div>

      <!-- タグ -->
      <div class="form-group">
        <label class="form-label">タグ</label>
        <TagSelector v-model="form.tagIds" :tags="store.tags" />
      </div>

      <!-- 関連人物 -->
      <div class="form-group">
        <label class="form-label">
          関連人物
          <router-link to="/persons" class="master-link" @click.stop>＋ 人物を登録</router-link>
        </label>
        <PersonSelector v-model="form.personIds" :persons="store.persons" />
      </div>

      <!-- 関連企業 -->
      <div class="form-group">
        <label class="form-label">
          関連企業・機関
          <router-link to="/companies" class="master-link" @click.stop>＋ 企業を登録</router-link>
        </label>
        <CompanySelector v-model="form.companyIds" :companies="store.companies" />
      </div>

      <!-- 写真添付 -->
      <div class="form-group">
        <label class="form-label">写真</label>
        <PhotoAttachment
          :photos="localPhotos"
          :editable="true"
          @add="onPhotoAdd"
          @remove="onPhotoRemove"
        />
      </div>

      <!-- 情報源 -->
      <div class="form-group">
        <label class="form-label">情報源（任意）</label>
        <input v-model="form.source" type="text" placeholder="例：△△病院 ○○先生、医療機器展示会2024..." />
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="$router.back()">キャンセル</button>
        <button type="submit" class="btn-submit" :disabled="submitting || !form.title.trim() || !form.category">
          <span v-if="submitting">保存中...</span>
          <span v-else>{{ isEdit ? '更新する' : '登録する' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeedStore } from '../stores/seeds'
import { CATEGORIES, db } from '../db'
import AppHeader      from '../components/AppHeader.vue'
import StatusStepper  from '../components/StatusStepper.vue'
import TagSelector    from '../components/TagSelector.vue'
import PersonSelector from '../components/PersonSelector.vue'
import CompanySelector from '../components/CompanySelector.vue'
import PhotoAttachment from '../components/PhotoAttachment.vue'

const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const store  = useSeedStore()

const isEdit   = computed(() => !!props.id)
const submitting = ref(false)
const error    = ref('')

const form = ref({
  category: '', title: '', status: 'issue', body: '',
  tagIds: [], personIds: [], companyIds: [], attachmentIds: [],
  source: '',
})

// 写真のローカル管理（新規追加分はpending、既存はDBから）
const localPhotos    = ref([])   // { id?, dataUrl, fileName, pending? }
const pendingPhotos  = ref([])   // 未保存の追加写真
const removedPhotoIds = ref([])  // 削除対象ID

onMounted(async () => {
  if (isEdit.value) {
    const key = Number(props.id) || props.id
    const seed = await db.seeds.get(key)
    if (!seed) { router.replace('/'); return }
    Object.assign(form.value, {
      category:      seed.category,
      title:         seed.title,
      status:        seed.status,
      body:          seed.body     || '',
      tagIds:        seed.tagIds        || [],
      personIds:     seed.personIds     || [],
      companyIds:    seed.companyIds    || [],
      attachmentIds: seed.attachmentIds || [],
      source:        seed.source   || '',
    })
    // 既存写真を読み込む
    if (seed.attachmentIds?.length) {
      const photos = await store.getPhotos(key)
      localPhotos.value = photos.map(p => ({ ...p, pending: false }))
    }
  }
})

function onPhotoAdd({ dataUrl, fileName }) {
  const tempId = 'tmp_' + Date.now() + '_' + Math.random()
  const photo  = { id: tempId, dataUrl, fileName, pending: true }
  localPhotos.value.push(photo)
  pendingPhotos.value.push(photo)
}

function onPhotoRemove(photo) {
  localPhotos.value = localPhotos.value.filter(p => p.id !== photo.id)
  if (photo.pending) {
    pendingPhotos.value = pendingPhotos.value.filter(p => p.id !== photo.id)
  } else if (photo.id) {
    removedPhotoIds.value.push(photo.id)
  }
}

async function handleSubmit() {
  if (!form.value.title.trim() || !form.value.category) return
  submitting.value = true
  error.value = ''
  try {
    let seedId = isEdit.value ? (Number(props.id) || props.id) : null

    if (isEdit.value) {
      // 削除された写真をDBから消す
      for (const attId of removedPhotoIds.value) {
        await store.removePhoto(seedId, attId)
      }
      // 保存
      const seed = await db.seeds.get(seedId)
      await store.editSeed(seedId, {
        ...form.value,
        attachmentIds: seed.attachmentIds || []
      })
    } else {
      seedId = await store.createSeed({ ...form.value })
    }

    // 新規写真を保存
    for (const p of pendingPhotos.value) {
      await store.addPhoto(seedId, p.dataUrl, p.fileName)
    }

    router.replace(`/seed/${seedId}`)
  } catch (e) {
    error.value = '保存に失敗しました: ' + e.message
  } finally {
    submitting.value = false
  }
}

async function confirmDelete() {
  if (!confirm('このシードを削除しますか？')) return
  const key = Number(props.id) || props.id
  await store.removeSeed(key)
  router.replace('/')
}
</script>

<style scoped>
.form-view { display:flex; flex-direction:column; min-height:100%; }
.form-body { padding:20px 16px; display:flex; flex-direction:column; gap:24px; }
.form-group { display:flex; flex-direction:column; gap:8px; }
.form-label {
  font-size:12px; font-weight:600; color:var(--text2);
  letter-spacing:.04em; text-transform:uppercase;
  display:flex; align-items:center; gap:8px;
}
.required {
  font-size:10px; background:rgba(255,107,74,.15); color:var(--accent-r);
  padding:1px 6px; border-radius:4px; text-transform:none; letter-spacing:0;
}
.master-link {
  font-size:11px; color:var(--accent); text-decoration:none;
  font-weight:600; text-transform:none; letter-spacing:0;
}
.master-link:hover { text-decoration:underline; }
.char-count { font-size:11px; color:var(--text3); text-align:right; font-family:'DM Mono',monospace; margin-top:-4px; }

/* Category grid */
.category-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.cat-btn {
  display:flex; flex-direction:column; align-items:center; gap:5px;
  padding:12px 8px; background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-s); transition:all .15s; font-family:'Noto Sans JP',sans-serif;
}
.cat-btn:hover { border-color:var(--border2); background:var(--surface2); }
.cat-btn.active { border-color:var(--accent); background:rgba(79,124,255,.1); }
.cat-emoji { font-size:20px; }
.cat-label { font-size:10px; color:var(--text2); text-align:center; line-height:1.3; }
.cat-btn.active .cat-label { color:var(--accent); font-weight:600; }

/* Actions */
.form-actions { display:flex; gap:10px; padding-bottom:8px; }
.btn-cancel {
  flex:1; padding:14px; background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); color:var(--text2); font-family:'Noto Sans JP',sans-serif;
  font-size:14px; font-weight:600; transition:all .15s;
}
.btn-cancel:hover { background:var(--surface2); }
.btn-submit {
  flex:2; padding:14px; background:var(--accent); border:none; border-radius:var(--radius);
  color:#fff; font-family:'Noto Sans JP',sans-serif; font-size:14px; font-weight:700;
  transition:all .15s; box-shadow:0 4px 16px rgba(79,124,255,.4);
}
.btn-submit:hover:not(:disabled) { background:var(--accent-d); box-shadow:0 6px 20px rgba(79,124,255,.5); }
.btn-submit:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; }
.delete-btn {
  background:rgba(255,107,74,.1); border:1px solid rgba(255,107,74,.3); border-radius:8px;
  width:36px; height:36px; display:flex; align-items:center; justify-content:center;
  color:var(--accent-r); transition:background .15s;
}
.delete-btn:hover { background:rgba(255,107,74,.2); }
.error-msg {
  font-size:13px; color:var(--accent-r); background:rgba(255,107,74,.1);
  border:1px solid rgba(255,107,74,.2); border-radius:var(--radius-s); padding:10px 14px;
}
</style>
