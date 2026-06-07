import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/client.js'

// 活動種別の定義（ここを変えれば全体に反映）
export const ACTIVITY_TYPES = {
  surgery: { label: '手術立ち会い', icon: '🏥' },
  meeting: { label: '面談・訪問',   icon: '🤝' },
  event:   { label: '展示会・学会', icon: '🎪' },
  other:   { label: 'その他',       icon: '📝' },
}

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref([])
  const loading    = ref(false)

  async function fetchBySeed(seedId) {
    loading.value = true
    try {
      activities.value = await api.get(`/activities?seed_id=${seedId}`)
    } finally {
      loading.value = false
    }
  }

  async function getActivity(id) {
    return await api.get(`/activities/${id}`)
  }

  async function addActivity(data) {
    const created = await api.post('/activities', data)
    activities.value.unshift(created)
    return created
  }

  async function updateActivity(id, data) {
    const updated = await api.put(`/activities/${id}`, data)
    const idx = activities.value.findIndex(a => a.id === id)
    if (idx !== -1) activities.value[idx] = updated
    return updated
  }

  async function deleteActivity(id) {
    await api.delete(`/activities/${id}`)
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return { activities, loading, fetchBySeed, getActivity, addActivity, updateActivity, deleteActivity }
})
