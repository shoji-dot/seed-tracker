import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/client.js'

export const STATUSES = ['課題', '解決案', '事業アイデア', '検討中', '開発中', '事業化']
export const PRIORITIES = ['低', '中', '高']

export const useSeedsStore = defineStore('seeds', () => {
  const seeds    = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchSeeds(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.q)      params.set('q',      filters.q)
      if (filters.status) params.set('status', filters.status)
      if (filters.tag)    params.set('tag',    filters.tag)
      const query = params.toString()
      seeds.value = await api.get(`/seeds${query ? '?' + query : ''}`)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function getSeed(id) {
    return await api.get(`/seeds/${id}`)
  }

  async function addSeed(data) {
    const created = await api.post('/seeds', data)
    seeds.value.unshift(created)
    return created
  }

  async function updateSeed(id, data) {
    const updated = await api.put(`/seeds/${id}`, data)
    const idx = seeds.value.findIndex(s => s.id === id)
    if (idx !== -1) seeds.value[idx] = updated
    return updated
  }

  async function deleteSeed(id) {
    await api.delete(`/seeds/${id}`)
    seeds.value = seeds.value.filter(s => s.id !== id)
  }

  // CSV出力
  function exportCSV() {
    const headers = ['ID','タイトル','ステータス','優先度','説明','情報源','日付','タグ','作成者','更新日時']
    const rows = seeds.value.map(s => [
      s.id,
      `"${(s.title||'').replace(/"/g,'""')}"`,
      s.status,
      PRIORITIES[s.priority] || '中',
      `"${(s.description||'').replace(/"/g,'""')}"`,
      `"${(s.source||'').replace(/"/g,'""')}"`,
      s.source_date || '',
      `"${(s.tags||[]).join(', ')}"`,
      s.created_by_name || '',
      s.updated_at ? new Date(s.updated_at).toLocaleDateString('ja-JP') : ''
    ].join(','))
    const bom = '\uFEFF'
    const csv = bom + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seeds_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { seeds, loading, error, fetchSeeds, getSeed, addSeed, updateSeed, deleteSeed, exportCSV }
})
