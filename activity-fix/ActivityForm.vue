<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="router.back()">←</button>
      <h2>
        <span class="type-icon">{{ typeDef.icon }}</span>
        {{ isEdit ? typeDef.label + 'を編集' : typeDef.label }}
      </h2>
      <button class="btn-save" @click="save" :disabled="saving">
        {{ saving ? '保存中…' : '保存' }}
      </button>
    </header>

    <div v-if="loadingData" class="loading">読み込み中…</div>

    <form v-else class="form-body" @submit.prevent="save">
      <p v-if="errMsg" class="err">{{ errMsg }}</p>

      <!-- 共通フィールド -->
      <div class="field">
        <label>日付</label>
        <input v-model="form.date" type="date" />
      </div>

      <div class="field">
        <label>場所</label>
        <input v-model="form.location" :placeholder="locationPlaceholder" />
      </div>

      <div class="field">
        <label>概要 <span class="req">*</span></label>
        <textarea v-model="form.summary" rows="3" :placeholder="summaryPlaceholder"></textarea>
      </div>

      <!-- 手術立ち会い専用 -->
      <template v-if="type === 'surgery'">
        <div class="section-title">🏥 手術情報</div>

        <div class="field">
          <label>術式</label>
          <input v-model="form.detail.procedure" placeholder="例：腹腔鏡下胆嚢摘出術" />
        </div>
        <div class="field">
          <label>診療科</label>
          <input v-model="form.detail.department" placeholder="例：消化器外科" />
        </div>
        <div class="field">
          <label>術者</label>
          <div class="rel-chips">
            <span v-for="id in form.detail.surgeon_ids" :key="id" class="chip chip-person">
              {{ personName(id) }}
              <button type="button" @click="removeSurgeon(id)">×</button>
            </span>
          </div>
          <select @change="addSurgeon($event.target.value); $event.target.value=''" class="rel-select">
            <option value="">術者を追加…</option>
            <option v-for="p in masters.persons" :key="p.id" :value="p.id">
              {{ p.name }}{{ p.affiliation ? ` / ${p.affiliation}` : '' }}
            </option>
          </select>
        </div>

        <div class="section-title">🔧 使用器具</div>
        <div v-for="(item, i) in form.detail.instruments" :key="i" class="instrument-row">
          <div class="instrument-fields">
            <input v-model="item.name"     placeholder="器具名"   class="inst-name" />
            <input v-model="item.maker"    placeholder="メーカー" class="inst-maker" />
            <input v-model="item.category" placeholder="カテゴリ" class="inst-cat" />
          </div>
          <input v-model="item.note" placeholder="使用メモ（問題点など）" class="inst-note" />
          <button type="button" class="btn-remove-inst" @click="removeInstrument(i)">削除</button>
        </div>
        <button type="button" class="btn-add-inst" @click="addInstrument">＋ 器具を追加</button>

        <div class="section-title">📋 所見・気づき</div>
        <div class="field">
          <label>手順メモ</label>
          <textarea v-model="form.detail.procedure_notes" rows="4" placeholder="手術の流れ・各ステップの気づき"></textarea>
        </div>
        <div class="field">
          <label>現場課題・ビジネスインサイト</label>
          <textarea v-model="form.detail.insights" rows="4" placeholder="改善できる点、ビジネスチャンス等"></textarea>
        </div>
      </template>

      <!-- 面談・訪問専用 -->
      <template v-else-if="type === 'meeting'">
        <div class="section-title">🤝 面談情報</div>

        <div class="field">
          <label>面談相手</label>
          <div class="rel-chips">
            <span v-for="id in form.detail.person_ids" :key="id" class="chip chip-person">
              {{ personName(id) }}
              <button type="button" @click="removeMeetingPerson(id)">×</button>
            </span>
          </div>
          <select @change="addMeetingPerson($event.target.value); $event.target.value=''" class="rel-select">
            <option value="">面談相手を追加…</option>
            <option v-for="p in masters.persons" :key="p.id" :value="p.id">
              {{ p.name }}{{ p.affiliation ? ` / ${p.affiliation}` : '' }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>ヒアリング内容</label>
          <textarea v-model="form.detail.hearing_content" rows="5"
                    placeholder="聞いた内容、課題・要望など"></textarea>
        </div>

        <div class="section-title">🔧 器具・製品情報</div>
        <div v-for="(item, i) in form.detail.instruments" :key="i" class="instrument-row">
          <div class="instrument-fields">
            <input v-model="item.name"     placeholder="器具名"   class="inst-name" />
            <input v-model="item.maker"    placeholder="メーカー" class="inst-maker" />
            <input v-model="item.category" placeholder="カテゴリ" class="inst-cat" />
          </div>
          <input v-model="item.note" placeholder="詳細メモ" class="inst-note" />
          <button type="button" class="btn-remove-inst" @click="removeInstrument(i)">削除</button>
        </div>
        <button type="button" class="btn-add-inst" @click="addInstrument">＋ 器具・製品を追加</button>
      </template>

      <!-- 展示会・学会専用 -->
      <template v-else-if="type === 'event'">
        <div class="section-title">🎪 イベント情報</div>

        <div class="field">
          <label>イベント名</label>
          <input v-model="form.detail.event_name" placeholder="例：第○回 ○○学会" />
        </div>
        <div class="field">
          <label>収集情報・展示内容</label>
          <textarea v-model="form.detail.collected_info" rows="4"
                    placeholder="気になった製品、技術トレンドなど"></textarea>
        </div>
        <div class="field">
          <label>競合動向</label>
          <textarea v-model="form.detail.competition" rows="3"
                    placeholder="競合他社の動向、新製品情報など"></textarea>
        </div>
      </template>

      <!-- その他 -->
      <template v-else>
        <div class="field">
          <label>詳細メモ</label>
          <textarea v-model="form.detail.free_text" rows="8"
                    placeholder="自由に記載してください"></textarea>
        </div>
      </template>

      <!-- 削除（編集時） -->
      <div v-if="isEdit" class="danger-zone">
        <button type="button" class="btn-delete" @click="deleteActivity">この記録を削除</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivitiesStore, ACTIVITY_TYPES } from '../stores/activities.js'
import { useMastersStore } from '../stores/masters.js'

const route      = useRoute()
const router     = useRouter()
const activities = useActivitiesStore()
const masters    = useMastersStore()

const type    = computed(() => route.params.type || 'other')
const typeDef = computed(() => ACTIVITY_TYPES[type.value] || ACTIVITY_TYPES.other)
const isEdit  = computed(() => !!route.params.activityId)

const saving     = ref(false)
const loadingData= ref(false)
const errMsg     = ref('')

// 共通フォーム + detail（種別ごとに異なる）
const form = reactive({
  date:     '',
  location: '',
  summary:  '',
  detail:   makeDefaultDetail('other'),
})

function makeDefaultDetail(t) {
  if (t === 'surgery') return { procedure:'', department:'', surgeon_ids:[], procedure_notes:'', insights:'', instruments:[] }
  if (t === 'meeting') return { person_ids:[], hearing_content:'', instruments:[] }
  if (t === 'event')   return { event_name:'', collected_info:'', competition:'' }
  return { free_text:'' }
}

// プレースホルダー
const locationPlaceholder = computed(() => ({
  surgery: '例：○○病院 第3手術室',
  meeting: '例：○○病院 会議室 / オンライン',
  event:   '例：東京ビッグサイト',
  other:   '場所・状況',
}[type.value] || ''))

const summaryPlaceholder = computed(() => ({
  surgery: '立ち会いの全体的な概要・感想',
  meeting: '面談の目的・概要',
  event:   '参加目的・全体概要',
  other:   '記録の概要',
}[type.value] || ''))

const personName = (id) => masters.persons.find(p => p.id === Number(id))?.name || String(id)

// 器具
function addInstrument() { form.detail.instruments.push({ name:'', maker:'', category:'', note:'' }) }
function removeInstrument(i) { form.detail.instruments.splice(i, 1) }

// 手術: 術者
function addSurgeon(id) {
  const n = Number(id)
  if (n && !form.detail.surgeon_ids.includes(n)) form.detail.surgeon_ids.push(n)
}
function removeSurgeon(id) { form.detail.surgeon_ids = form.detail.surgeon_ids.filter(x => x !== id) }

// 面談: 相手
function addMeetingPerson(id) {
  const n = Number(id)
  if (n && !form.detail.person_ids.includes(n)) form.detail.person_ids.push(n)
}
function removeMeetingPerson(id) { form.detail.person_ids = form.detail.person_ids.filter(x => x !== id) }

onMounted(async () => {
  // detail の初期化（typeに合わせて）
  form.detail = makeDefaultDetail(type.value)

  if (isEdit.value) {
    loadingData.value = true
    try {
      const act = await activities.getActivity(route.params.activityId)
      form.date     = act.date ? act.date.split('T')[0] : ''
      form.location = act.location || ''
      form.summary  = act.summary  || ''
      form.detail   = { ...makeDefaultDetail(type.value), ...(act.detail || {}) }
    } finally {
      loadingData.value = false
    }
  }
})

async function save() {
  if (!form.summary.trim()) { errMsg.value = '概要は必須です'; return }
  saving.value = true
  errMsg.value = ''
  try {
    const payload = {
      type:     type.value,
      date:     form.date || null,
      location: form.location,
      summary:  form.summary,
      detail:   form.detail,
    }
    if (isEdit.value) {
      await activities.updateActivity(Number(route.params.activityId), payload)
    } else {
      await activities.addActivity(payload)
    }
    router.back()
  } catch(e) {
    errMsg.value = e.message
  } finally {
    saving.value = false
  }
}

async function deleteActivity() {
  if (!confirm('この活動記録を削除しますか？')) return
  await activities.deleteActivity(Number(route.params.activityId))
  router.go(-2)
}
</script>

<style scoped>
.page { padding-bottom: 40px; min-height: 100svh; }
.page-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px; padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: var(--bg); z-index: 10;
}
.page-header h2 { flex: 1; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.type-icon { font-size: 18px; }
.btn-back { background: none; border: none; color: var(--accent); font-size: 18px; cursor: pointer; padding: 4px 8px; }
.btn-save { background: var(--accent); border: none; color: #fff; font-size: 14px; font-weight: 600; border-radius: var(--radius-s); padding: 6px 14px; cursor: pointer; flex-shrink: 0; }
.btn-save:disabled { opacity: 0.6; }
.loading { text-align: center; color: var(--text3); padding: 40px; }

.form-body { padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }
.err { color: var(--accent-r); font-size: 13px; }

.section-title {
  font-size: 12px; font-weight: 700; color: var(--text3);
  text-transform: uppercase; letter-spacing: .06em;
  padding: 8px 0 4px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 6px; }
.req { color: var(--accent-r); }
.field input, .field textarea, .field select {
  width: 100%; background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-s); color: var(--text); font-size: 14px; padding: 10px 12px;
}
.field input:focus, .field textarea:focus { outline: none; border-color: var(--accent); }
.field textarea { resize: vertical; min-height: 80px; }

/* 器具リスト */
.instrument-row {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.instrument-fields { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr; gap: 6px; }
.instrument-fields input, .inst-note {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-s); color: var(--text); font-size: 13px; padding: 7px 10px; width: 100%;
}
.btn-remove-inst { align-self: flex-end; background: none; border: none; color: var(--accent-r); font-size: 12px; cursor: pointer; padding: 4px 0; }
.btn-add-inst {
  background: var(--surface2); border: 1px dashed var(--border2);
  border-radius: var(--radius-s); color: var(--text3); font-size: 13px;
  padding: 10px; cursor: pointer; text-align: center;
}

/* 人物チップ */
.rel-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.chip { display: inline-flex; align-items: center; gap: 4px; background: var(--surface3); border: 1px solid var(--border2); border-radius: 20px; font-size: 12px; color: var(--text); padding: 3px 8px; }
.chip button { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 14px; line-height: 1; }
.chip-person { border-color: var(--accent-g); }
.rel-select { width: 100%; font-size: 13px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-s); color: var(--text); padding: 9px 11px; }

.danger-zone { border-top: 1px solid var(--border); padding-top: 20px; }
.btn-delete { width: 100%; background: none; border: 1px solid var(--accent-r); color: var(--accent-r); border-radius: var(--radius-s); padding: 10px; cursor: pointer; font-size: 14px; }
</style>
