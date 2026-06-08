<template>
  <div class="page">
    <header class="page-header">
      <h2>設定</h2>
    </header>

    <!-- ユーザー情報 -->
    <section class="card">
      <h3>ログイン中のユーザー</h3>
      <div class="info-row">
        <span class="label">表示名</span>
        <span>{{ auth.user?.displayName }}</span>
      </div>
      <div class="info-row">
        <span class="label">ユーザー名</span>
        <span>{{ auth.user?.username }}</span>
      </div>
      <div class="info-row">
        <span class="label">権限</span>
        <span :class="auth.isAdmin ? 'badge-admin' : 'badge-member'">
          {{ auth.isAdmin ? '管理者' : 'メンバー' }}
        </span>
      </div>
      <button class="btn-logout" @click="doLogout">ログアウト</button>
    </section>

    <!-- ユーザー一覧（管理者のみ） -->
    <section v-if="auth.isAdmin" class="card">
      <h3>ユーザー一覧</h3>
      <p class="hint">新しいメンバーには登録画面で管理者シークレットを伝えてください</p>
      <div class="admin-secret-box">
        <span class="label">管理者シークレット</span>
        <code class="secret" @click="showSecret = !showSecret">
          {{ showSecret ? adminSecret : '••••••••••' }}
        </code>
        <span class="tap-hint">タップで表示</span>
      </div>

      <div v-if="usersLoading" class="loading-sm">読み込み中…</div>
      <table v-else class="user-table">
        <thead>
          <tr><th>表示名</th><th>ユーザー名</th><th>権限</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.display_name }}</td>
            <td>{{ u.username }}</td>
            <td>
              <span :class="u.role === 'admin' ? 'badge-admin' : 'badge-member'">
                {{ u.role === 'admin' ? '管理者' : 'メンバー' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- マスタ管理 -->
    <section class="card">
      <h3>マスタ管理</h3>
      <p class="hint">活動記録で使う選択肢（施設名・機器カテゴリ）を管理します</p>
      <div class="master-links">
        <button class="btn-secondary" @click="router.push('/facilities')">🏥 施設名マスタ</button>
        <button class="btn-secondary" @click="router.push('/equipment-categories')">🔧 機器カテゴリマスタ</button>
        <button class="btn-secondary" @click="router.push('/persons')">👤 人物マスタ</button>
        <button class="btn-secondary" @click="router.push('/companies')">🏢 企業マスタ</button>
      </div>
    </section>

    <!-- CSVエクスポート -->
    <section class="card">
      <h3>データエクスポート</h3>
      <p class="hint">現在の検索結果を含む全シードをCSV形式で出力します</p>
      <button class="btn-secondary" @click="doExport">CSV エクスポート</button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useSeedsStore } from '../stores/seeds.js'
import { api } from '../api/client.js'

const router   = useRouter()
const auth     = useAuthStore()
const seeds    = useSeedsStore()

const users        = ref([])
const usersLoading = ref(false)
const showSecret   = ref(false)
const adminSecret  = import.meta.env.VITE_ADMIN_SECRET || '（環境変数 VITE_ADMIN_SECRET を設定）'

onMounted(async () => {
  if (auth.isAdmin) {
    usersLoading.value = true
    try {
      users.value = await api.get('/auth/users')
    } finally {
      usersLoading.value = false
    }
  }
})

async function doExport() {
  await seeds.fetchSeeds()
  seeds.exportCSV()
}

function doLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.page { padding: 0 0 100px; }
.page-header { padding: 20px 16px 12px; }
.page-header h2 { font-size: 20px; font-weight: 700; margin: 0; color: var(--text); }
.card {
  margin: 0 16px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
}
.card h3 { font-size: 14px; font-weight: 600; color: var(--text2); margin: 0 0 14px; text-transform: uppercase; letter-spacing: .04em; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text); }
.info-row:last-of-type { border-bottom: none; }
.label { color: var(--text3); font-size: 12px; }
.hint { font-size: 12px; color: var(--text3); margin: 0 0 12px; }
.badge-admin  { background: #2a1f60; color: var(--accent); font-size: 11px; padding: 2px 8px; border-radius: 20px; }
.badge-member { background: var(--surface3); color: var(--text2); font-size: 11px; padding: 2px 8px; border-radius: 20px; }
.btn-logout   { width: 100%; margin-top: 14px; background: none; border: 1px solid var(--accent-r); color: var(--accent-r); border-radius: var(--radius-s); padding: 10px; cursor: pointer; font-size: 14px; }
.btn-secondary { background: var(--surface2); border: 1px solid var(--border); color: var(--text); border-radius: var(--radius-s); padding: 10px 16px; cursor: pointer; font-size: 14px; }
.master-links { display: flex; flex-direction: column; gap: 8px; }
.master-links .btn-secondary { text-align: left; }

.admin-secret-box { display: flex; align-items: center; gap: 10px; background: var(--surface2); border-radius: var(--radius-s); padding: 10px 12px; margin-bottom: 14px; flex-wrap: wrap; }
.secret { font-family: monospace; font-size: 14px; color: var(--accent-w); cursor: pointer; user-select: none; }
.tap-hint { font-size: 11px; color: var(--text3); }

.loading-sm { color: var(--text3); font-size: 13px; }
.user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.user-table th { color: var(--text3); text-align: left; padding: 6px 0; border-bottom: 1px solid var(--border); font-weight: 500; }
.user-table td { padding: 8px 0; border-bottom: 1px solid var(--border); color: var(--text); }
.user-table tr:last-child td { border-bottom: none; }
</style>
