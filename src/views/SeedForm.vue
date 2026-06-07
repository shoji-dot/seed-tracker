<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="router.back()">←</button>
      <h2>{{ isEdit ? 'シードを編集' : '新しいシード' }}</h2>
      <button class="btn-save" @click="save" :disabled="saving">
        {{ saving ? '保存中…' : '保存' }}
      </button>
    </header>

    <div v-if="loadingData" class="loading">読み込み中…</div>

    <form v-else class="form-body" @submit.prevent="save">
      <p v-if="errMsg" class="err">{{ errMsg }}</p>

      <!-- タイトル -->
      <div class="field">
        <label>タイトル <span class="req">*</span></label>
        <input v-model="form.title" placeholder="例：手術中の器具受け渡し手間" required />
      </div>

      <!-- ステータス -->
      <div class="field">
        <label>ステータス</label>
        <div class="status-grid">
          <button type="button"
            v-for="s in STATUSES" :key="s"
            :class="['status-btn', { active: form.status === s }]"
            @click="form.status = s">{{ s }}</button>
        </div>
      </div>

      <!-- 優先度 -->
      <div class="field">
        <label>優先度</label>
        <div class="priority-row">
          <button type="button" v-for="(label, i) in PRIORITIES" :key="i"
            :class="['pri-btn', { active: form.priority === i }]"
            @click="form.priority = i">{{ label }}</button>
        </div>
      </div>

      <!-- 説明 -->
      <div class="field">
        <label>内容・詳細</label>
        <textarea v-model="form.description" rows="5" placeholder="課題の詳細、解決アイデア、観察内容など"></textarea>
      </div>

      <!-- 情報源 -->
      <div class="field">
        <label>情報源</label>
        <input v-model="form.source" placeholder="例：○○病院 山田先生" />
      </div>

      <!-- 日付 -->
      <div class="field">
        <label>日付</label>
        <input v-model="form.source_date" type="date" />
      </div>

      <!-- タグ -->
      <div class="field">
        <label>タグ</label>
        <div class="tag-input-wrap">
          <div class="tag-chips">
            <span v-for="tag in form.tags" :key="tag" class="chip">
              {{ tag }}
              <button type="button" @click="removeTag(tag)">×</button>
            </span>
          </div>
          <div class="inline-add">
            <input v-model="tagInput" @keydown.enter.prevent="addTag"
                   placeholder="タグを入力…" list="tag-list" />
            <datalist id="tag-list">
              <option v-for="t in masters.tags" :key="t.id" :value="t.name" />
            </datalist>
            <button type="button" @click="addTag">追加</button>
          </div>
        </div>
      </div>

      <!-- 関連人物 -->
      <div class="field">
        <label>関連人物</label>
        <div class="rel-chips">
          <span v-for="id in form.person_ids" :key="id" class="chip chip-person">
            {{ personName(id) }}
            <button type="button" @click="removePerson(id)">×</button>
          </span>
        </div>
        <select @change="addPerson($event.target.value); $event.target.value=''" class="rel-select">
          <option value="">人物を追加…</option>
          <option v-for="p in availablePersons" :key="p.id" :value="p.id">
            {{ p.name }}{{ p.affiliation ? ` / ${p.affiliation}` : '' }}
          </option>
        </select>
      </div>

      <!-- 関連企業 -->
      <div class="field">
        <label>関連企業</label>
        <div class="rel-chips">
          <span v-for="id in form.company_ids" :key="id" class="chip chip-company">
            {{ companyName(id) }}
            <button type="button" @click="removeCompany(id)">×</button>
          </span>
        </div>
        <select @change="addCompany($event.target.value); $event.target.value=''" class="rel-select">
          <option value="">企業を追加…</option>
          <option v-for="c in availableCompanies" :key="c.id" :value="c.id">
            {{ c.name }}{{ c.industry ? ` / ${c.industry}` : '' }}
          </option>
        </select>
      </div>

      <!-- 削除ボタン（編集時） -->
      <div v-if="isEdit" class="danger-zone">
        <button type="button" class="btn-delete" @click="deleteSeed">このシードを削除</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeedsStore, STATUSES, PRIORITIES } from '../stores/seeds.js'
import { useMastersStore } from '../stores/masters.js'

const route   = useRoute()
const router  = useRouter()
const seeds   = useSeedsStore()
const masters = useMastersStore()

const isEdit     = computed(() => !!route.params.id)
const saving     = ref(false)
const loadingData= ref(false)
const errMsg     = ref('')
const tagInput   = ref('')

const form = reactive({
  title: '', status: '課題', priority: 1, description: '',
  source: '', source_date: '',
  tags: [], person_ids: [], company_ids: []
})

const availablePersons  = computed(() => masters.persons.filter(p => !form.person_ids.includes(p.id)))
const availableCompanies= computed(() => masters.companies.filter(c => !form.company_ids.includes(c.id)))
const personName  = (id) => masters.persons.find(p => p.id === id)?.name || id
const companyName = (id) => masters.companies.find(c => c.id === id)?.name || id

onMounted(async () => {
  if (isEdit.value) {
    loadingData.value = true
    try {
      const seed = await seeds.getSeed(route.params.id)
      Object.assign(form, {
        title: seed.title,
        status: seed.status,
        priority: seed.priority ?? 1,
        description: seed.description || '',
        source: seed.source || '',
        source_date: seed.source_date ? seed.source_date.split('T')[0] : '',
        tags: seed.tags || [],
        person_ids: seed.person_ids || [],
        company_ids: seed.company_ids || [],
      })
    } finally {
      loadingData.value = false
    }
  }
})

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t)) {
    form.tags.push(t)
    masters.addTag(t).catch(() => {})
  }
  tagInput.value = ''
}
function removeTag(t) { form.tags = form.tags.filter(x => x !== t) }

function addPerson(id) {
  const n = Number(id)
  if (n && !form.person_ids.includes(n)) form.person_ids.push(n)
}
function removePerson(id) { form.person_ids = form.person_ids.filter(x => x !== id) }

function addCompany(id) {
  const n = Number(id)
  if (n && !form.company_ids.includes(n)) form.company_ids.push(n)
}
function removeCompany(id) { form.company_ids = form.company_ids.filter(x => x !== id) }

async function save() {
  if (!form.title.trim()) { errMsg.value = 'タイトルは必須です'; return }
  saving.value = true
  errMsg.value = ''
  try {
    const payload = { ...form }
    if (isEdit.value) {
      await seeds.updateSeed(Number(route.params.id), payload)
    } else {
      const created = await seeds.addSeed(payload)
      router.replace(`/seeds/${created.id}`)
      return
    }
    router.back()
  } catch(e) {
    errMsg.value = e.message
  } finally {
    saving.value = false
  }
}

async function deleteSeed() {
  if (!confirm('このシードを削除しますか？')) return
  await seeds.deleteSeed(Number(route.params.id))
  router.replace('/')
}
</script>

<style scoped>
.page { padding-bottom: 40px; min-height: 100svh; }
.page-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border); position: sticky; top: 0;
  background: var(--bg); z-index: 10;
}
.page-header h2 { flex: 1; font-size: 16px; font-weight: 700; }
.btn-back { background: none; border: none; color: var(--accent); font-size: 18px; cursor: pointer; padding: 4px 8px; }
.btn-save { background: var(--accent); border: none; color: #fff; font-size: 14px; font-weight: 600; border-radius: var(--radius-s); padding: 6px 14px; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; }

.loading { text-align: center; color: var(--text3); padding: 40px; }

.form-body { padding: 20px 16px; display: flex; flex-direction: column; gap: 20px; }
.err { color: var(--accent-r); font-size: 13px; }

.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 8px; font-weight: 500; }
.req { color: var(--accent-r); }
.field input, .field textarea, .field select {
  width: 100%; background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-s); color: var(--text); font-size: 14px; padding: 10px 12px;
}
.field input:focus, .field textarea:focus { outline: none; border-color: var(--accent); }
.field textarea { resize: vertical; min-height: 100px; }

.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.status-btn { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text2); font-size: 12px; padding: 8px 4px; cursor: pointer; }
.status-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }

.priority-row { display: flex; gap: 8px; }
.pri-btn { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text2); font-size: 13px; padding: 8px; cursor: pointer; }
.pri-btn.active { background: var(--accent-w); border-color: var(--accent-w); color: #000; font-weight: 600; }

.tag-chips, .rel-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--surface3); border: 1px solid var(--border2);
  border-radius: 20px; font-size: 12px; color: var(--text); padding: 3px 8px;
}
.chip button { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 14px; line-height: 1; padding: 0; }
.chip-person { border-color: var(--accent-g); }
.chip-company { border-color: var(--accent-p); }

.inline-add { display: flex; gap: 6px; }
.inline-add input { flex: 1; }
.inline-add button { background: var(--surface3); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text2); font-size: 13px; padding: 8px 12px; cursor: pointer; white-space: nowrap; }

.rel-select { font-size: 13px; }

.danger-zone { border-top: 1px solid var(--border); padding-top: 20px; }
.btn-delete { width: 100%; background: none; border: 1px solid var(--accent-r); color: var(--accent-r); border-radius: var(--radius-s); padding: 10px; cursor: pointer; font-size: 14px; }
</style>
