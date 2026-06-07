<template>
  <div class="companies-view">
    <AppHeader title="関連企業・機関" :sub="`${store.companies.length}件`" />

    <div class="view-body">

      <!-- 登録フォーム -->
      <div class="add-form">
        <p class="form-title">新しい企業・機関を登録</p>
        <div class="form-fields">
          <div class="field-row">
            <div class="form-group full">
              <label class="field-label">企業・機関名 <span class="req">必須</span></label>
              <input v-model="form.name" type="text" placeholder="○○大学附属病院" maxlength="100" />
            </div>
          </div>
          <div class="field-row">
            <div class="form-group">
              <label class="field-label">業種・種別</label>
              <select v-model="form.industry">
                <option value="">選択してください</option>
                <option v-for="ind in INDUSTRIES" :key="ind" :value="ind">{{ ind }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="field-label">所在地</label>
              <input v-model="form.location" type="text" placeholder="東京都○○区" maxlength="100" />
            </div>
          </div>
          <div class="field-row">
            <div class="form-group">
              <label class="field-label">担当窓口</label>
              <input v-model="form.contact" type="text" placeholder="購買部 TEL..." maxlength="100" />
            </div>
            <div class="form-group">
              <label class="field-label">Webサイト</label>
              <input v-model="form.website" type="url" placeholder="https://..." maxlength="200" />
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">メモ・特記事項</label>
            <textarea v-model="form.memo" placeholder="取引実績・注意事項・重点顧客など..." rows="2" />
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button class="btn-add" @click="handleAdd" :disabled="!form.name.trim()">登録する</button>
        </div>
      </div>

      <!-- 一覧 -->
      <div class="list-section">
        <div class="list-header">
          <p class="list-title">登録済み（{{ store.companies.length }}件）</p>
          <input v-model="search" type="search" placeholder="検索..." class="list-search" />
        </div>

        <div v-if="!filtered.length" class="empty-state">
          <span>🏢</span>
          <p>{{ search ? '該当なし' : '企業・機関が登録されていません' }}</p>
        </div>

        <transition-group name="slide-up" tag="div" class="company-list">
          <div v-for="c in filtered" :key="c.id" class="company-card">
            <template v-if="editingId !== c.id">
              <!-- 表示 -->
              <div class="company-icon">🏢</div>
              <div class="company-info">
                <div class="company-name">{{ c.name }}</div>
                <div class="company-meta">
                  <span v-if="c.industry" class="industry-badge">{{ c.industry }}</span>
                  <span v-if="c.location" class="location">📍 {{ c.location }}</span>
                </div>
                <div v-if="c.contact" class="company-contact">{{ c.contact }}</div>
                <a v-if="c.website" :href="c.website" target="_blank" rel="noopener" class="company-website" @click.stop>
                  🔗 {{ c.website }}
                </a>
                <div v-if="c.memo" class="company-memo">{{ c.memo }}</div>
                <div class="company-seeds">{{ seedCount(c.id) }}件のシードに関連</div>
              </div>
              <div class="company-actions">
                <button class="action-btn edit" @click="startEdit(c)">編集</button>
                <button class="action-btn del"  @click="handleDelete(c)">削除</button>
              </div>
            </template>

            <!-- 編集 -->
            <template v-else>
              <div class="edit-form">
                <div class="form-group">
                  <label class="field-label">企業・機関名</label>
                  <input v-model="editForm.name" type="text" maxlength="100" />
                </div>
                <div class="field-row">
                  <div class="form-group">
                    <label class="field-label">業種</label>
                    <select v-model="editForm.industry">
                      <option value="">-</option>
                      <option v-for="ind in INDUSTRIES" :key="ind" :value="ind">{{ ind }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="field-label">所在地</label>
                    <input v-model="editForm.location" type="text" maxlength="100" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="form-group">
                    <label class="field-label">担当窓口</label>
                    <input v-model="editForm.contact" type="text" maxlength="100" />
                  </div>
                  <div class="form-group">
                    <label class="field-label">Webサイト</label>
                    <input v-model="editForm.website" type="url" maxlength="200" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="field-label">メモ</label>
                  <textarea v-model="editForm.memo" rows="2" />
                </div>
                <div class="edit-actions">
                  <button class="btn-cancel" @click="editingId = null">キャンセル</button>
                  <button class="btn-save" @click="handleSave(c.id)" :disabled="!editForm.name.trim()">保存</button>
                </div>
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
import { INDUSTRIES } from '../db'
import AppHeader from '../components/AppHeader.vue'

const store  = useSeedStore()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return store.companies
  return store.companies.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.industry || '').toLowerCase().includes(q) ||
    (c.location || '').toLowerCase().includes(q)
  )
})

const form = ref({ name:'', industry:'', location:'', contact:'', website:'', memo:'' })
const formError = ref('')

async function handleAdd() {
  if (!form.value.name.trim()) return
  try {
    await store.createCompany({ ...form.value })
    Object.assign(form.value, { name:'', industry:'', location:'', contact:'', website:'', memo:'' })
  } catch(e) { formError.value = e.message }
}

const editingId = ref(null)
const editForm  = ref({})

function startEdit(c) {
  editingId.value = c.id
  editForm.value  = { name:c.name, industry:c.industry||'', location:c.location||'', contact:c.contact||'', website:c.website||'', memo:c.memo||'' }
}

async function handleSave(id) {
  await store.editCompany(id, { ...editForm.value })
  editingId.value = null
}

async function handleDelete(c) {
  const cnt = seedCount(c.id)
  const msg = cnt > 0
    ? `「${c.name}」を削除します。${cnt}件のシードから紐付けも解除されます。`
    : `「${c.name}」を削除しますか？`
  if (confirm(msg)) await store.removeCompany(c.id)
}

function seedCount(id) {
  return store.seeds.filter(s => (s.companyIds||[]).includes(id)).length
}
</script>

<style scoped>
.companies-view { display:flex; flex-direction:column; min-height:100%; }
.view-body      { padding:16px; display:flex; flex-direction:column; gap:20px; }

.add-form {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:16px;
}
.form-title { font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:.04em; margin-bottom:12px; }
.form-fields { display:flex; flex-direction:column; gap:10px; }
.field-row   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.field-row .full { grid-column:1/-1; }
.form-group  { display:flex; flex-direction:column; gap:4px; }
.field-label { font-size:11px; font-weight:600; color:var(--text3); letter-spacing:.04em; display:flex; gap:6px; align-items:center; }
.req { font-size:10px; background:rgba(255,107,74,.15); color:var(--accent-r); padding:1px 5px; border-radius:3px; }
.error-msg { font-size:12px; color:var(--accent-r); padding:8px 12px; background:rgba(255,107,74,.1); border-radius:var(--radius-s); }

.btn-add {
  padding:12px; background:var(--accent); color:#fff; border:none;
  border-radius:var(--radius); font-size:14px; font-weight:700;
  font-family:'Noto Sans JP',sans-serif; transition:background .15s;
}
.btn-add:hover:not(:disabled) { background:var(--accent-d); }
.btn-add:disabled { opacity:.4; cursor:not-allowed; }

.list-section { display:flex; flex-direction:column; gap:12px; }
.list-header  { display:flex; align-items:center; gap:12px; }
.list-title   { font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; }
.list-search  { flex:1; height:34px; font-size:13px; padding:6px 12px; }

.company-list { display:flex; flex-direction:column; gap:10px; }

.company-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:14px 16px;
  display:flex; gap:12px; align-items:flex-start;
}

.company-icon { font-size:24px; flex-shrink:0; margin-top:2px; }
.company-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
.company-name { font-size:14px; font-weight:700; }
.company-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

.industry-badge {
  font-size:11px; padding:2px 8px; border-radius:10px;
  background:rgba(0,212,170,.12); color:var(--accent-g);
  border:1px solid rgba(0,212,170,.25);
}
.location     { font-size:11px; color:var(--text3); }
.company-contact { font-size:11px; color:var(--text3); }
.company-website {
  font-size:11px; color:var(--accent); text-decoration:none;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.company-website:hover { text-decoration:underline; }
.company-memo  { font-size:12px; color:var(--text2); line-height:1.5; }
.company-seeds { font-size:11px; color:var(--text3); margin-top:2px; }

.company-actions { display:flex; flex-direction:column; gap:4px; flex-shrink:0; }
.action-btn {
  font-size:11px; padding:5px 10px; border-radius:var(--radius-s);
  font-family:'Noto Sans JP',sans-serif; font-weight:600; transition:all .15s;
}
.action-btn.edit { background:var(--surface2); border:1px solid var(--border); color:var(--text2); }
.action-btn.edit:hover { background:var(--surface3); color:var(--text); }
.action-btn.del  { background:rgba(255,107,74,.08); border:1px solid rgba(255,107,74,.2); color:var(--accent-r); }
.action-btn.del:hover  { background:rgba(255,107,74,.18); }

.edit-form { flex:1; display:flex; flex-direction:column; gap:8px; }
.edit-actions { display:flex; gap:8px; }
.btn-cancel { flex:1; padding:10px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); color:var(--text2); font-family:'Noto Sans JP',sans-serif; font-weight:600; }
.btn-save   { flex:2; padding:10px; background:var(--accent); border:none; border-radius:var(--radius); color:#fff; font-family:'Noto Sans JP',sans-serif; font-weight:700; transition:background .15s; }
.btn-save:hover:not(:disabled) { background:var(--accent-d); }
.btn-save:disabled { opacity:.4; cursor:not-allowed; }

.empty-state { display:flex; align-items:center; gap:10px; padding:24px; color:var(--text3); font-size:13px; }
</style>
