<template>
  <div class="page">
    <header class="page-header">
      <h2>🔧 機器カテゴリマスタ</h2>
    </header>

    <section class="card">
      <div class="add-row">
        <input v-model="newName" placeholder="カテゴリ名を入力" @keyup.enter="add" />
        <button class="btn-add" @click="add" :disabled="adding">追加</button>
      </div>
      <p v-if="errMsg" class="err">{{ errMsg }}</p>
    </section>

    <div class="list">
      <div v-if="masters.equipmentCategories.length === 0" class="empty">カテゴリが登録されていません</div>
      <div v-for="c in masters.equipmentCategories" :key="c.id" class="item-card">
        <span class="item-name">{{ c.name }}</span>
        <button class="del" @click="remove(c.id)">削除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMastersStore } from '../stores/masters.js'

const masters = useMastersStore()

const newName = ref('')
const adding  = ref(false)
const errMsg  = ref('')

async function add() {
  const name = newName.value.trim()
  if (!name) { errMsg.value = 'カテゴリ名を入力してください'; return }
  if (masters.equipmentCategories.some(c => c.name === name)) { errMsg.value = '同じカテゴリが既に登録されています'; return }
  adding.value = true
  errMsg.value = ''
  try {
    await masters.addEquipmentCategory(name)
    newName.value = ''
  } catch (e) {
    errMsg.value = e.message
  } finally {
    adding.value = false
  }
}

async function remove(id) {
  if (!confirm('削除しますか？')) return
  await masters.deleteEquipmentCategory(id)
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

.list { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
.empty { text-align: center; color: var(--text3); padding: 40px; }
.item-card { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
.item-name { font-size: 14px; color: var(--text); }
.item-card .del { background: var(--surface2); border: 1px solid var(--accent-r); color: var(--accent-r); border-radius: var(--radius-s); font-size: 12px; padding: 4px 10px; cursor: pointer; }
</style>
</content>
