<template>
  <div class="persons-view">
    <AppHeader title="関連人物" :sub="`${store.persons.length}名`" />

    <div class="view-body">

      <!-- 登録フォーム -->
      <div class="add-form">
        <p class="form-title">新しい人物を登録</p>
        <div class="form-fields">
          <div class="field-row">
            <div class="form-group">
              <label class="field-label">氏名 <span class="req">必須</span></label>
              <input v-model="form.name" type="text" placeholder="山田 太郎" maxlength="50" />
            </div>
            <div class="form-group">
              <label class="field-label">役職</label>
              <input v-model="form.role" type="text" placeholder="外科部長" maxlength="50" />
            </div>
          </div>
          <div class="field-row">
            <div class="form-group full">
              <label class="field-label">所属機関・企業</label>
              <input v-model="form.organization" type="text" placeholder="○○大学病院" maxlength="100" />
            </div>
          </div>
          <div class="field-row">
            <div class="form-group">
              <label class="field-label">連絡先</label>
              <input v-model="form.contact" type="text" placeholder="email / TEL" maxlength="100" />
            </div>
            <div class="form-group">
              <label class="field-label">専門領域</label>
              <input v-model="form.specialty" type="text" placeholder="消化器外科" maxlength="50" />
            </div>
          </div>
          <div class="form-group">
            <label class="field-label">メモ</label>
            <textarea v-model="form.memo" placeholder="関係性・注意事項など..." rows="2" />
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button class="btn-add" @click="handleAdd" :disabled="!form.name.trim()">登録する</button>
        </div>
      </div>

      <!-- 一覧 -->
      <div class="list-section">
        <div class="list-header">
          <p class="list-title">登録済み（{{ store.persons.length }}名）</p>
          <input v-model="search" type="search" placeholder="検索..." class="list-search" />
        </div>

        <div v-if="!filtered.length" class="empty-state">
          <span>👤</span>
          <p>{{ search ? '該当者なし' : '人物が登録されていません' }}</p>
        </div>

        <transition-group name="slide-up" tag="div" class="person-list">
          <div v-for="p in filtered" :key="p.id" class="person-card">
            <template v-if="editingId !== p.id">
              <!-- 表示 -->
              <div class="person-avatar">{{ initials(p.name) }}</div>
              <div class="person-info">
                <div class="person-name">{{ p.name }}</div>
                <div class="person-meta">
                  <span v-if="p.role">{{ p.role }}</span>
                  <span v-if="p.role && p.organization" class="sep"> / </span>
                  <span v-if="p.organization">{{ p.organization }}</span>
                </div>
                <div v-if="p.specialty" class="person-specialty">{{ p.specialty }}</div>
                <div v-if="p.contact" class="person-contact">{{ p.contact }}</div>
                <div v-if="p.memo" class="person-memo">{{ p.memo }}</div>
                <div class="person-seeds">
                  {{ seedCount(p.id) }}件のシードに関連
                </div>
              </div>
              <div class="person-actions">
                <button class="action-btn edit" @click="startEdit(p)">編集</button>
                <button class="action-btn del"  @click="handleDelete(p)">削除</button>
              </div>
            </template>

            <!-- 編集 -->
            <template v-else>
              <div class="edit-form">
                <div class="field-row">
                  <div class="form-group">
                    <label class="field-label">氏名</label>
                    <input v-model="editForm.name" type="text" maxlength="50" />
                  </div>
                  <div class="form-group">
                    <label class="field-label">役職</label>
                    <input v-model="editForm.role" type="text" maxlength="50" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="field-label">所属機関・企業</label>
                  <input v-model="editForm.organization" type="text" maxlength="100" />
                </div>
                <div class="field-row">
                  <div class="form-group">
                    <label class="field-label">連絡先</label>
                    <input v-model="editForm.contact" type="text" maxlength="100" />
                  </div>
                  <div class="form-group">
                    <label class="field-label">専門領域</label>
                    <input v-model="editForm.specialty" type="text" maxlength="50" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="field-label">メモ</label>
                  <textarea v-model="editForm.memo" rows="2" />
                </div>
                <div class="edit-actions">
                  <button class="btn-cancel" @click="editingId = null">キャンセル</button>
                  <button class="btn-save" @click="handleSave(p.id)" :disabled="!editForm.name.trim()">保存</button>
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
import AppHeader from '../components/AppHeader.vue'

const store  = useSeedStore()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return store.persons
  return store.persons.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.organization || '').toLowerCase().includes(q) ||
    (p.role || '').toLowerCase().includes(q) ||
    (p.specialty || '').toLowerCase().includes(q)
  )
})

// 登録フォーム
const form = ref({ name:'', role:'', organization:'', contact:'', specialty:'', memo:'' })
const formError = ref('')

async function handleAdd() {
  if (!form.value.name.trim()) return
  formError.value = ''
  try {
    await store.createPerson({ ...form.value })
    Object.assign(form.value, { name:'', role:'', organization:'', contact:'', specialty:'', memo:'' })
  } catch(e) { formError.value = e.message }
}

// 編集フォーム
const editingId = ref(null)
const editForm  = ref({})

function startEdit(p) {
  editingId.value = p.id
  editForm.value  = { name: p.name, role: p.role||'', organization: p.organization||'', contact: p.contact||'', specialty: p.specialty||'', memo: p.memo||'' }
}

async function handleSave(id) {
  await store.editPerson(id, { ...editForm.value })
  editingId.value = null
}

async function handleDelete(p) {
  const cnt = seedCount(p.id)
  const msg = cnt > 0
    ? `「${p.name}」を削除します。${cnt}件のシードから紐付けも解除されます。続けますか？`
    : `「${p.name}」を削除しますか？`
  if (confirm(msg)) await store.removePerson(p.id)
}

function seedCount(id) {
  return store.seeds.filter(s => (s.personIds||[]).includes(id)).length
}

function initials(name) {
  return (name||'?').replace(/\s+/g,'').slice(0,2)
}
</script>

<style scoped>
.persons-view { display: flex; flex-direction: column; min-height: 100%; }
.view-body    { padding: 16px; display: flex; flex-direction: column; gap: 20px; }

/* Add form */
.add-form {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px;
}
.form-title { font-size: 12px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing:.04em; margin-bottom:12px; }
.form-fields { display: flex; flex-direction: column; gap: 10px; }
.field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-row .full { grid-column: 1/-1; }
.form-group  { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing:.04em; display:flex; gap:6px; align-items:center; }
.req { font-size:10px; background:rgba(255,107,74,.15); color:var(--accent-r); padding:1px 5px; border-radius:3px; }
.error-msg { font-size:12px; color:var(--accent-r); padding:8px 12px; background:rgba(255,107,74,.1); border-radius:var(--radius-s); }

.btn-add {
  padding: 12px; background: var(--accent); color: #fff; border: none;
  border-radius: var(--radius); font-size: 14px; font-weight: 700;
  font-family: 'Noto Sans JP', sans-serif; transition: background .15s;
}
.btn-add:hover:not(:disabled) { background: var(--accent-d); }
.btn-add:disabled { opacity:.4; cursor:not-allowed; }

/* List */
.list-section { display: flex; flex-direction: column; gap: 12px; }
.list-header  { display: flex; align-items: center; gap: 12px; }
.list-title   { font-size: 12px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing:.04em; white-space: nowrap; }
.list-search  { flex:1; height:34px; font-size:13px; padding:6px 12px; }

.person-list { display: flex; flex-direction: column; gap: 10px; }

.person-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 16px;
  display: flex; gap: 12px; align-items: flex-start;
}

.person-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: var(--accent);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.person-info  { flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.person-name  { font-size:14px; font-weight:700; }
.person-meta  { font-size:12px; color:var(--text2); }
.sep          { color:var(--text3); }
.person-specialty { font-size:11px; color:var(--accent-g); }
.person-contact   { font-size:11px; color:var(--text3); font-family:'DM Mono',monospace; }
.person-memo      { font-size:12px; color:var(--text2); margin-top:4px; line-height:1.5; }
.person-seeds     { font-size:11px; color:var(--text3); margin-top:4px; }

.person-actions { display:flex; flex-direction:column; gap:4px; flex-shrink:0; }
.action-btn {
  font-size:11px; padding:5px 10px; border-radius:var(--radius-s);
  font-family:'Noto Sans JP',sans-serif; font-weight:600; transition:all .15s;
}
.action-btn.edit { background:var(--surface2); border:1px solid var(--border); color:var(--text2); }
.action-btn.edit:hover { background:var(--surface3); color:var(--text); }
.action-btn.del  { background:rgba(255,107,74,.08); border:1px solid rgba(255,107,74,.2); color:var(--accent-r); }
.action-btn.del:hover  { background:rgba(255,107,74,.18); }

/* Edit form inside card */
.edit-form { flex:1; display:flex; flex-direction:column; gap:8px; }
.edit-actions { display:flex; gap:8px; }
.btn-cancel {
  flex:1; padding:10px; background:var(--surface2); border:1px solid var(--border);
  border-radius:var(--radius); color:var(--text2); font-family:'Noto Sans JP',sans-serif; font-weight:600;
}
.btn-save {
  flex:2; padding:10px; background:var(--accent); border:none; border-radius:var(--radius);
  color:#fff; font-family:'Noto Sans JP',sans-serif; font-weight:700; transition:background .15s;
}
.btn-save:hover:not(:disabled) { background:var(--accent-d); }
.btn-save:disabled { opacity:.4; cursor:not-allowed; }

.empty-state {
  display:flex; align-items:center; gap:10px;
  padding:24px; color:var(--text3); font-size:13px;
}
</style>
