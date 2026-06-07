import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllSeeds, addSeed, updateSeed, deleteSeed,
  getAllTags,  addTag,  updateTag,  deleteTag,
  getAllPersons,  addPerson,  updatePerson,  deletePerson,
  getAllCompanies, addCompany, updateCompany, deleteCompany,
  addAttachment, deleteAttachment, getAttachmentsBySeed,
  db
} from '../db'

export const useSeedStore = defineStore('seeds', () => {
  const seeds     = ref([])
  const tags      = ref([])
  const persons   = ref([])
  const companies = ref([])
  const loading   = ref(false)

  // ── 検索・フィルター状態
  const searchQuery    = ref('')
  const activeStatus   = ref('all')
  const activeCategory = ref('all')

  // ── 全データ取得
  async function fetchAll() {
    loading.value = true
    try {
      ;[seeds.value, tags.value, persons.value, companies.value] = await Promise.all([
        getAllSeeds(), getAllTags(), getAllPersons(), getAllCompanies()
      ])
    } finally {
      loading.value = false
    }
  }

  // ── フィルタリング済みシード
  const filteredSeeds = computed(() => {
    let list = seeds.value
    if (activeStatus.value !== 'all')
      list = list.filter(s => s.status === activeStatus.value)
    if (activeCategory.value !== 'all')
      list = list.filter(s => s.category === activeCategory.value)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.body    || '').toLowerCase().includes(q) ||
        (s.source  || '').toLowerCase().includes(q)
      )
    }
    return list
  })

  // ── ステータス別カウント
  const statusCounts = computed(() => {
    const counts = { all: seeds.value.length }
    for (const s of seeds.value)
      counts[s.status] = (counts[s.status] || 0) + 1
    return counts
  })

  // ── Map系
  const tagMap     = computed(() => Object.fromEntries(tags.value.map(t     => [t.id, t])))
  const personMap  = computed(() => Object.fromEntries(persons.value.map(p  => [p.id, p])))
  const companyMap = computed(() => Object.fromEntries(companies.value.map(c => [c.id, c])))

  // ── Seeds CRUD
  async function createSeed(data) {
    const id = await addSeed(data)
    await fetchAll()
    return id
  }
  async function editSeed(id, data) {
    await updateSeed(id, data)
    await fetchAll()
  }
  async function removeSeed(id) {
    await deleteSeed(id)
    seeds.value = seeds.value.filter(s => s.id !== id)
  }

  // ── Tags CRUD
  async function createTag(name, color) { await addTag(name, color); await fetchAll() }
  async function editTag(id, data)      { await updateTag(id, data); await fetchAll() }
  async function removeTag(id)          { await deleteTag(id);       await fetchAll() }

  // ── Persons CRUD
  async function createPerson(data) { await addPerson(data);   await fetchAll() }
  async function editPerson(id, data){ await updatePerson(id, data); await fetchAll() }
  async function removePerson(id)   { await deletePerson(id);  await fetchAll() }

  // ── Companies CRUD
  async function createCompany(data) { await addCompany(data);    await fetchAll() }
  async function editCompany(id, data){ await updateCompany(id, data); await fetchAll() }
  async function removeCompany(id)   { await deleteCompany(id);   await fetchAll() }

  // ── Attachments
  async function addPhoto(seedId, dataUrl, fileName) {
    const attId = await addAttachment(seedId, dataUrl, fileName)
    // seedのattachmentIdsを更新
    const seed = await db.seeds.get(seedId)
    const ids  = seed?.attachmentIds || []
    await updateSeed(seedId, { attachmentIds: [...ids, attId] })
    await fetchAll()
    return attId
  }
  async function removePhoto(seedId, attId) {
    await deleteAttachment(attId)
    const seed = await db.seeds.get(seedId)
    const ids  = (seed?.attachmentIds || []).filter(i => i !== attId)
    await updateSeed(seedId, { attachmentIds: ids })
    await fetchAll()
  }
  async function getPhotos(seedId) {
    return getAttachmentsBySeed(seedId)
  }

  // ── CSV出力（人物・企業列追加）
  function exportCSV(list = null) {
    const target = list || filteredSeeds.value
    const names = (ids, map) =>
      (ids || []).map(id => map[id]?.name || '').filter(Boolean).join('/')

    const rows = [
      ['ID','タイトル','カテゴリ','ステータス','詳細','タグ','情報源','関連人物','関連企業','作成日','更新日'],
      ...target.map(s => [
        s.id, s.title, s.category, s.status,
        (s.body || '').replace(/\n/g, ' '),
        names(s.tagIds, tagMap.value),
        s.source || '',
        names(s.personIds, personMap.value),
        names(s.companyIds, companyMap.value),
        new Date(s.createdAt).toLocaleDateString('ja-JP'),
        new Date(s.updatedAt).toLocaleDateString('ja-JP'),
      ])
    ]

    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `seeds_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    seeds, tags, persons, companies, loading,
    searchQuery, activeStatus, activeCategory,
    filteredSeeds, statusCounts,
    tagMap, personMap, companyMap,
    fetchAll,
    createSeed, editSeed, removeSeed,
    createTag,  editTag,  removeTag,
    createPerson, editPerson, removePerson,
    createCompany, editCompany, removeCompany,
    addPhoto, removePhoto, getPhotos,
    exportCSV
  }
})
