import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/client.js'

export const useMastersStore = defineStore('masters', () => {
  const tags      = ref([])
  const persons   = ref([])
  const companies = ref([])

  async function fetchAll() {
    const [t, p, c] = await Promise.all([
      api.get('/masters/tags'),
      api.get('/masters/persons'),
      api.get('/masters/companies'),
    ])
    tags.value      = t
    persons.value   = p
    companies.value = c
  }

  // Tags
  async function addTag(name) {
    const tag = await api.post('/masters/tags', { name })
    if (!tags.value.find(t => t.id === tag.id)) tags.value.push(tag)
    return tag
  }
  async function deleteTag(id) {
    await api.delete(`/masters/tags/${id}`)
    tags.value = tags.value.filter(t => t.id !== id)
  }

  // Persons
  async function addPerson(data) {
    const p = await api.post('/masters/persons', data)
    persons.value.push(p)
    return p
  }
  async function updatePerson(id, data) {
    const p = await api.put(`/masters/persons/${id}`, data)
    const idx = persons.value.findIndex(x => x.id === id)
    if (idx !== -1) persons.value[idx] = p
    return p
  }
  async function deletePerson(id) {
    await api.delete(`/masters/persons/${id}`)
    persons.value = persons.value.filter(x => x.id !== id)
  }

  // Companies
  async function addCompany(data) {
    const c = await api.post('/masters/companies', data)
    companies.value.push(c)
    return c
  }
  async function updateCompany(id, data) {
    const c = await api.put(`/masters/companies/${id}`, data)
    const idx = companies.value.findIndex(x => x.id === id)
    if (idx !== -1) companies.value[idx] = c
    return c
  }
  async function deleteCompany(id) {
    await api.delete(`/masters/companies/${id}`)
    companies.value = companies.value.filter(x => x.id !== id)
  }

  return {
    tags, persons, companies, fetchAll,
    addTag, deleteTag,
    addPerson, updatePerson, deletePerson,
    addCompany, updateCompany, deleteCompany,
  }
})
