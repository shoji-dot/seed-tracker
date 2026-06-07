<template>
  <div class="detail-view" v-if="seed">
    <AppHeader :title="seed.title" back>
      <template #actions>
        <router-link :to="`/edit/${seed.id}`" class="edit-btn">編集</router-link>
      </template>
    </AppHeader>

    <div class="detail-body">

      <!-- ステータスステッパー -->
      <section class="detail-section">
        <p class="section-label">進捗ステータス</p>
        <StatusStepper :model-value="seed.status" @update:model-value="updateStatus" />
      </section>

      <!-- メタ情報 -->
      <section class="detail-section meta-section">
        <div class="meta-item">
          <span class="meta-key">種別</span>
          <span class="meta-val">{{ catInfo?.emoji }} {{ catInfo?.label }}</span>
        </div>
        <div v-if="seed.source" class="meta-item">
          <span class="meta-key">情報源</span>
          <span class="meta-val">{{ seed.source }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-key">登録日</span>
          <span class="meta-val mono">{{ formatDate(seed.createdAt) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-key">更新日</span>
          <span class="meta-val mono">{{ formatDate(seed.updatedAt) }}</span>
        </div>
      </section>

      <!-- 詳細メモ -->
      <section class="detail-section">
        <p class="section-label">詳細メモ</p>
        <div v-if="seed.body" class="body-text">{{ seed.body }}</div>
        <p v-else class="empty-field">未記入</p>
      </section>

      <!-- タグ -->
      <section class="detail-section">
        <p class="section-label">タグ</p>
        <div v-if="seedTags.length" class="tag-list">
          <span v-for="tag in seedTags" :key="tag.id"
            class="tag-chip" :style="{ '--tc': tag.color }">{{ tag.name }}</span>
        </div>
        <p v-else class="empty-field">タグなし</p>
      </section>

      <!-- 関連人物 -->
      <section class="detail-section">
        <p class="section-label">関連人物</p>
        <div v-if="seedPersons.length" class="persons-list">
          <div v-for="p in seedPersons" :key="p.id" class="person-item">
            <span class="person-avatar">{{ initials(p.name) }}</span>
            <div class="person-info">
              <span class="person-name">{{ p.name }}</span>
              <span class="person-sub">{{ [p.role, p.organization].filter(Boolean).join(' / ') }}</span>
            </div>
          </div>
        </div>
        <p v-else class="empty-field">関連人物なし</p>
      </section>

      <!-- 関連企業 -->
      <section class="detail-section">
        <p class="section-label">関連企業・機関</p>
        <div v-if="seedCompanies.length" class="companies-list">
          <div v-for="c in seedCompanies" :key="c.id" class="company-item">
            <span class="company-icon">🏢</span>
            <div class="company-info">
              <span class="company-name">{{ c.name }}</span>
              <span v-if="c.industry" class="company-industry">{{ c.industry }}</span>
            </div>
          </div>
        </div>
        <p v-else class="empty-field">関連企業なし</p>
      </section>

      <!-- 写真 -->
      <section class="detail-section">
        <p class="section-label">写真（{{ photos.length }}枚）</p>
        <PhotoAttachment
          :photos="photos"
          :editable="false"
        />
      </section>

      <!-- ステータス変更 -->
      <section class="detail-section">
        <p class="section-label">次のステータスへ進める</p>
        <div class="status-actions">
          <button v-if="prevStatus" class="status-btn prev" @click="updateStatus(prevStatus.value)">
            ← {{ prevStatus.emoji }} {{ prevStatus.label }}
          </button>
          <button v-if="nextStatus" class="status-btn next" :style="{ '--sc': nextStatus.color }"
            @click="updateStatus(nextStatus.value)">
            {{ nextStatus.emoji }} {{ nextStatus.label }}に進める →
          </button>
          <p v-if="!nextStatus" class="completed-msg">🚀 事業化まで到達しています</p>
        </div>
      </section>

    </div>
  </div>

  <div v-else-if="notFound" class="not-found">
    <p>シードが見つかりませんでした</p>
    <router-link to="/" class="back-link">一覧に戻る</router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeedStore } from '../stores/seeds'
import { STATUSES, CATEGORY_MAP, db } from '../db'
import AppHeader      from '../components/AppHeader.vue'
import StatusStepper  from '../components/StatusStepper.vue'
import PhotoAttachment from '../components/PhotoAttachment.vue'

const props    = defineProps({ id: { type: String, required: true } })
const router   = useRouter()
const store    = useSeedStore()
const seed     = ref(null)
const notFound = ref(false)
const photos   = ref([])

onMounted(async () => {
  const key = Number(props.id) || props.id
  seed.value = await db.seeds.get(key)
  if (!seed.value) { notFound.value = true; return }
  if (seed.value.attachmentIds?.length) {
    photos.value = await store.getPhotos(key)
  }
})

const catInfo       = computed(() => seed.value ? CATEGORY_MAP[seed.value.category] : null)
const currentIdx    = computed(() => STATUSES.findIndex(s => s.value === seed.value?.status))
const prevStatus    = computed(() => currentIdx.value > 0 ? STATUSES[currentIdx.value - 1] : null)
const nextStatus    = computed(() => currentIdx.value < STATUSES.length - 1 ? STATUSES[currentIdx.value + 1] : null)
const seedTags      = computed(() => (seed.value?.tagIds     || []).map(id => store.tagMap[id]).filter(Boolean))
const seedPersons   = computed(() => (seed.value?.personIds  || []).map(id => store.personMap[id]).filter(Boolean))
const seedCompanies = computed(() => (seed.value?.companyIds || []).map(id => store.companyMap[id]).filter(Boolean))

async function updateStatus(newStatus) {
  await store.editSeed(seed.value.id, { ...seed.value, status: newStatus })
  seed.value = { ...seed.value, status: newStatus, updatedAt: Date.now() }
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('ja-JP', {
    year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'
  })
}

function initials(name) { return (name||'?').replace(/\s+/g,'').slice(0,2) }
</script>

<style scoped>
.detail-view { display:flex; flex-direction:column; min-height:100%; }
.detail-body { padding:16px; display:flex; flex-direction:column; gap:10px; }

.detail-section {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:16px;
  display:flex; flex-direction:column; gap:10px;
}

.section-label {
  font-size:11px; font-weight:600; color:var(--text3);
  letter-spacing:.06em; text-transform:uppercase;
}

/* Meta */
.meta-section { gap:10px; }
.meta-item    { display:flex; align-items:flex-start; gap:12px; }
.meta-key     { font-size:12px; color:var(--text3); min-width:56px; flex-shrink:0; }
.meta-val     { font-size:13px; color:var(--text); }
.mono         { font-family:'DM Mono',monospace; font-size:12px; }

/* Body */
.body-text  { font-size:14px; color:var(--text2); line-height:1.8; white-space:pre-wrap; word-break:break-word; }
.empty-field { font-size:13px; color:var(--text3); }

/* Tags */
.tag-list { display:flex; flex-wrap:wrap; gap:6px; }
.tag-chip {
  font-size:12px; padding:4px 12px; border-radius:20px;
  background:color-mix(in srgb, var(--tc,var(--accent)) 15%, transparent);
  color:var(--tc,var(--accent));
  border:1px solid color-mix(in srgb, var(--tc,var(--accent)) 35%, transparent);
}

/* Persons */
.persons-list { display:flex; flex-direction:column; gap:8px; }
.person-item  { display:flex; align-items:center; gap:10px; }
.person-avatar {
  width:36px; height:36px; border-radius:50%; background:var(--accent);
  color:#fff; font-size:12px; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.person-info { display:flex; flex-direction:column; gap:2px; }
.person-name { font-size:13px; font-weight:600; }
.person-sub  { font-size:11px; color:var(--text3); }

/* Companies */
.companies-list { display:flex; flex-direction:column; gap:8px; }
.company-item   { display:flex; align-items:center; gap:10px; }
.company-icon   { font-size:20px; flex-shrink:0; }
.company-info   { display:flex; flex-direction:column; gap:2px; }
.company-name   { font-size:13px; font-weight:600; }
.company-industry { font-size:11px; color:var(--accent-g); }

/* Status actions */
.status-actions { display:flex; gap:8px; flex-wrap:wrap; }
.status-btn { padding:10px 16px; border-radius:var(--radius); font-size:13px; font-weight:600; font-family:'Noto Sans JP',sans-serif; transition:all .15s; }
.status-btn.prev { background:var(--surface2); border:1px solid var(--border); color:var(--text2); }
.status-btn.prev:hover { background:var(--surface3); color:var(--text); }
.status-btn.next {
  flex:1;
  background:color-mix(in srgb, var(--sc,var(--accent)) 15%, transparent);
  border:1px solid color-mix(in srgb, var(--sc,var(--accent)) 40%, transparent);
  color:var(--sc,var(--accent));
}
.status-btn.next:hover { background:color-mix(in srgb, var(--sc,var(--accent)) 22%, transparent); }
.completed-msg { font-size:14px; color:var(--accent-s); font-weight:600; }

/* Edit button */
.edit-btn {
  background:var(--surface2); border:1px solid var(--border);
  border-radius:8px; padding:7px 14px; color:var(--text2);
  font-size:13px; font-weight:600; text-decoration:none; transition:all .15s;
}
.edit-btn:hover { background:var(--surface3); color:var(--text); }

/* Not found */
.not-found { display:flex; flex-direction:column; align-items:center; justify-content:center; height:60dvh; gap:16px; color:var(--text2); }
.back-link { color:var(--accent); text-decoration:none; font-size:14px; }
</style>
