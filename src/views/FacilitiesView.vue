<template>
  <div class="page">
    <header class="page-header">
      <h2>🏥 施設名マスタ</h2>
    </header>

    <section class="card">
      <div class="add-row">
        <input v-model="newName" placeholder="施設名を入力" @keyup.enter="add" />
        <button class="btn-add" @click="add" :disabled="adding">追加</button>
      </div>
      <p v-if="errMsg" class="err">{{ errMsg }}</p>

      <div class="import-row">
        <button class="btn-secondary" @click="fileInput.click()">CSVインポート</button>
        <span class="hint">1列に施設名を並べたCSV（ヘッダー行があっても可）</span>
        <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden-file" @change="onFile" />
      </div>
      <p v-if="importMsg" class="import-msg">{{ importMsg }}</p>
    </section>

    <div class="list">
      <div v-if="masters.facilities.length === 0" class="empty">施設名が登録されていません</div>
      <div v-for="f in masters.facilities" :key="f.id" class="item-card">
        <span class="item-name">{{ f.name }}</span>
        <button class="del" @click="remove(f.id)">削除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMastersStore } from '../stores/masters.js'

const masters = useMastersStore()

const newName  = ref('')
const adding   = ref(false)
const errMsg   = ref('')
const fileInput = ref(null)
const importMsg = ref('')

async function add() {
  const name = newName.value.trim()
  if (!name) { errMsg.value = '施設名を入力してください'; return }
  if (masters.facilities.some(f => f.name === name)) { errMsg.value = '同じ施設名が既に登録されています'; return }
  adding.value = true
  errMsg.value = ''
  try {
    await masters.addFacility(name)
    newName.value = ''
  } catch (e) {
    errMsg.value = e.message
  } finally {
    adding.value = false
  }
}

async function remove(id) {
  if (!confirm('削除しますか？')) return
  await masters.deleteFacility(id)
}

function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    const text  = String(reader.result || '')
    const names = text.split(/\r?\n/)
      .map(line => line.split(',')[0].trim().replace(/^"|"$/g, ''))
      .filter(Boolean)

    const existing = new Set(masters.facilities.map(f => f.name))
    const seen = new Set()
    let added = 0, skipped = 0

    for (const name of names) {
      if (name === '施設名' || name === 'name') continue // ヘッダー行スキップ
      if (existing.has(name) || seen.has(name)) { skipped++; continue }
      seen.add(name)
      try {
        await masters.addFacility(name)
        added++
      } catch {
        skipped++
      }
    }
    importMsg.value = `${added} 件登録しました（${skipped} 件は重複のためスキップ）`
    e.target.value = ''
  }
  reader.readAsText(file, 'utf-8')
}
</script>

<style scoped>
.page { padding-bottom: 80px; }
.page-header { padding: 20px 16px 12px; }
.page-header h2 { font-size: 18px; font-weight: 700; }
.card { margin: 0 16px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.add-row { display: flex; gap: 8px; }
.add-row input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text); font-size: 14px; padding: 9px 11px; }
.btn-add { background: var(--accent); border: none; color: #fff; border-radius: var(--radius-s); padding: 0 16px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-add:disabled { opacity: 0.6; }
.err { color: var(--accent-r); font-size: 12px; margin-top: 8px; }
.import-row { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); flex-wrap: wrap; }
.btn-secondary { background: var(--surface2); border: 1px solid var(--border); color: var(--text); border-radius: var(--radius-s); padding: 8px 14px; cursor: pointer; font-size: 13px; }
.hint { font-size: 11px; color: var(--text3); }
.hidden-file { display: none; }
.import-msg { font-size: 12px; color: var(--text2); margin-top: 8px; }

.list { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
.empty { text-align: center; color: var(--text3); padding: 40px; }
.item-card { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
.item-name { font-size: 14px; color: var(--text); }
.item-card .del { background: var(--surface2); border: 1px solid var(--accent-r); color: var(--accent-r); border-radius: var(--radius-s); font-size: 12px; padding: 4px 10px; cursor: pointer; }
</style>
