<template>
  <div class="page">
    <header class="page-header">
      <h2>👤 人物マスタ</h2>
      <button class="btn-add" @click="openAdd">＋ 追加</button>
    </header>

    <div class="list">
      <div v-if="masters.persons.length === 0" class="empty">人物が登録されていません</div>
      <div v-for="p in masters.persons" :key="p.id" class="item-card">
        <div class="item-main">
          <span class="item-name">{{ p.name }}</span>
          <span class="item-sub">{{ [p.role, p.affiliation].filter(Boolean).join(' / ') }}</span>
        </div>
        <div class="item-actions">
          <button @click="openEdit(p)">編集</button>
          <button class="del" @click="remove(p.id)">削除</button>
        </div>
      </div>
    </div>

    <!-- モーダル -->
    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <h3>{{ editing ? '人物を編集' : '人物を追加' }}</h3>
        <div class="field"><label>氏名 *</label><input v-model="form.name" /></div>
        <div class="field"><label>役職</label><input v-model="form.role" /></div>
        <div class="field"><label>所属</label><input v-model="form.affiliation" /></div>
        <div class="field"><label>連絡先</label><input v-model="form.contact" /></div>
        <div class="field"><label>専門</label><input v-model="form.specialty" /></div>
        <div class="field"><label>メモ</label><textarea v-model="form.memo" rows="3"></textarea></div>
        <p v-if="errMsg" class="err">{{ errMsg }}</p>
        <div class="modal-actions">
          <button @click="modal=false">キャンセル</button>
          <button class="primary" @click="saveItem" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMastersStore } from '../stores/masters.js'

const masters = useMastersStore()
const modal   = ref(false)
const editing = ref(null)
const saving  = ref(false)
const errMsg  = ref('')

const form = reactive({ name:'', role:'', affiliation:'', contact:'', specialty:'', memo:'' })

function openAdd() {
  editing.value = null
  Object.assign(form, { name:'', role:'', affiliation:'', contact:'', specialty:'', memo:'' })
  modal.value = true
}
function openEdit(p) {
  editing.value = p
  Object.assign(form, { name: p.name, role: p.role||'', affiliation: p.affiliation||'', contact: p.contact||'', specialty: p.specialty||'', memo: p.memo||'' })
  modal.value = true
}
async function saveItem() {
  if (!form.name.trim()) { errMsg.value = '氏名は必須です'; return }
  saving.value = true
  errMsg.value = ''
  try {
    if (editing.value) await masters.updatePerson(editing.value.id, { ...form })
    else await masters.addPerson({ ...form })
    modal.value = false
  } catch(e) { errMsg.value = e.message }
  finally { saving.value = false }
}
async function remove(id) {
  if (!confirm('削除しますか？')) return
  await masters.deletePerson(id)
}
</script>

<style scoped>
.page { padding-bottom: 80px; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 16px 12px; }
.page-header h2 { font-size: 18px; font-weight: 700; }
.btn-add { background: var(--accent); border: none; color: #fff; border-radius: var(--radius-s); padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }

.list { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
.empty { text-align: center; color: var(--text3); padding: 40px; }

.item-card { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
.item-main { display: flex; flex-direction: column; gap: 2px; }
.item-name { font-size: 14px; font-weight: 600; color: var(--text); }
.item-sub  { font-size: 12px; color: var(--text3); }
.item-actions { display: flex; gap: 8px; }
.item-actions button { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text2); font-size: 12px; padding: 4px 10px; cursor: pointer; }
.item-actions .del { border-color: var(--accent-r); color: var(--accent-r); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: flex-end; z-index: 200; }
.modal { background: var(--surface); border-radius: var(--radius-l) var(--radius-l) 0 0; padding: 24px 20px; width: 100%; max-height: 90svh; overflow-y: auto; }
.modal h3 { font-size: 16px; font-weight: 700; margin-bottom: 18px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 5px; }
.field input, .field textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text); font-size: 14px; padding: 9px 11px; }
.field textarea { resize: vertical; }
.err { color: var(--accent-r); font-size: 13px; margin-bottom: 8px; }
.modal-actions { display: flex; gap: 10px; margin-top: 16px; }
.modal-actions button { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text2); padding: 10px; cursor: pointer; }
.modal-actions .primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
</style>
