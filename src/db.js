import Dexie from 'dexie'

export const db = new Dexie('SeedTrackerDB')

// ── Version 1: MVP（seeds, tags）
db.version(1).stores({
  seeds: '++id, title, category, status, createdAt, updatedAt',
  tags:  '++id, name, createdAt'
})

// ── Version 2: Phase 2（persons, companies, attachments追加）
db.version(2).stores({
  seeds:       '++id, title, category, status, createdAt, updatedAt',
  tags:        '++id, name, createdAt',
  persons:     '++id, name, organization, createdAt',
  companies:   '++id, name, industry, createdAt',
  attachments: '++id, seedId, createdAt'
}).upgrade(tx => {
  // 既存seedsにpersonIds/companyIds/attachmentIdsを追加（undefined→[]）
  return tx.seeds.toCollection().modify(seed => {
    if (!seed.personIds)     seed.personIds     = []
    if (!seed.companyIds)    seed.companyIds    = []
    if (!seed.attachmentIds) seed.attachmentIds = []
  })
})

// ────────────────────────────────────
// 定数
// ────────────────────────────────────
export const CATEGORIES = [
  { value: 'issue',       label: '現場課題',       emoji: '📌' },
  { value: 'own_product', label: '自社製品改善',   emoji: '🔧' },
  { value: 'competitor',  label: '他社製品改善',   emoji: '🔍' },
  { value: 'new_product', label: '存在しない製品', emoji: '✨' },
  { value: 'new_biz',     label: '新規事業',       emoji: '🌱' },
  { value: 'tech_seed',   label: '技術シーズ',     emoji: '⚗️' },
]

export const STATUSES = [
  { value: 'issue',   label: '課題',        color: 'var(--s-issue)',  emoji: '📌' },
  { value: 'resolve', label: '解決案',      color: 'var(--s-idea)',   emoji: '💡' },
  { value: 'biz',     label: '事業アイデア', color: 'var(--s-biz)',   emoji: '🌱' },
  { value: 'review',  label: '検討中',      color: 'var(--s-review)', emoji: '🔍' },
  { value: 'dev',     label: '開発中',      color: 'var(--s-dev)',    emoji: '⚙️' },
  { value: 'launch',  label: '事業化',      color: 'var(--s-launch)', emoji: '🚀' },
]

export const INDUSTRIES = [
  '医療機器', '製薬', '病院・クリニック', '介護・福祉',
  '製造業', 'IT・ソフトウェア', '商社', '大学・研究機関',
  'スタートアップ', 'その他'
]

export const STATUS_MAP   = Object.fromEntries(STATUSES.map(s => [s.value, s]))
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

// ────────────────────────────────────
// Seeds CRUD
// ────────────────────────────────────
export async function addSeed(data) {
  const now = Date.now()
  return db.seeds.add({
    personIds: [], companyIds: [], attachmentIds: [],
    ...data,
    createdAt: now, updatedAt: now
  })
}

export async function updateSeed(id, data) {
  return db.seeds.update(id, { ...data, updatedAt: Date.now() })
}

export async function deleteSeed(id) {
  // 紐付き写真も削除
  const seed = await db.seeds.get(id)
  if (seed?.attachmentIds?.length) {
    await db.attachments.bulkDelete(seed.attachmentIds)
  }
  return db.seeds.delete(id)
}

export async function getAllSeeds() {
  return db.seeds.orderBy('updatedAt').reverse().toArray()
}

// ────────────────────────────────────
// Tags CRUD
// ────────────────────────────────────
export async function addTag(name, color) {
  return db.tags.add({ name, color, createdAt: Date.now() })
}

export async function updateTag(id, data) {
  return db.tags.update(id, data)
}

export async function deleteTag(id) {
  const seeds = await db.seeds.toArray()
  for (const seed of seeds) {
    if (seed.tagIds?.includes(id)) {
      await db.seeds.update(seed.id, {
        tagIds: seed.tagIds.filter(t => t !== id),
        updatedAt: Date.now()
      })
    }
  }
  return db.tags.delete(id)
}

export async function getAllTags() {
  return db.tags.orderBy('name').toArray()
}

// ────────────────────────────────────
// Persons CRUD
// ────────────────────────────────────
export async function addPerson(data) {
  return db.persons.add({ ...data, createdAt: Date.now() })
}

export async function updatePerson(id, data) {
  return db.persons.update(id, data)
}

export async function deletePerson(id) {
  // 関連seedsからも除去
  const seeds = await db.seeds.toArray()
  for (const seed of seeds) {
    if (seed.personIds?.includes(id)) {
      await db.seeds.update(seed.id, {
        personIds: seed.personIds.filter(p => p !== id),
        updatedAt: Date.now()
      })
    }
  }
  return db.persons.delete(id)
}

export async function getAllPersons() {
  return db.persons.orderBy('name').toArray()
}

// ────────────────────────────────────
// Companies CRUD
// ────────────────────────────────────
export async function addCompany(data) {
  return db.companies.add({ ...data, createdAt: Date.now() })
}

export async function updateCompany(id, data) {
  return db.companies.update(id, data)
}

export async function deleteCompany(id) {
  const seeds = await db.seeds.toArray()
  for (const seed of seeds) {
    if (seed.companyIds?.includes(id)) {
      await db.seeds.update(seed.id, {
        companyIds: seed.companyIds.filter(c => c !== id),
        updatedAt: Date.now()
      })
    }
  }
  return db.companies.delete(id)
}

export async function getAllCompanies() {
  return db.companies.orderBy('name').toArray()
}

// ────────────────────────────────────
// Attachments CRUD（写真: Base64保存）
// ────────────────────────────────────
export async function addAttachment(seedId, dataUrl, fileName) {
  return db.attachments.add({
    seedId, dataUrl, fileName,
    createdAt: Date.now()
  })
}

export async function deleteAttachment(id) {
  return db.attachments.delete(id)
}

export async function getAttachmentsBySeed(seedId) {
  return db.attachments.where('seedId').equals(seedId).toArray()
}
