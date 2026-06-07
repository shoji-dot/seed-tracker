<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="logo">
        <span class="logo-icon">🌱</span>
        <h1>SeedTracker</h1>
      </div>

      <!-- ログイン -->
      <form v-if="mode === 'login'" @submit.prevent="doLogin">
        <div class="field">
          <label>ユーザー名</label>
          <input v-model="form.username" type="text" autocomplete="username"
                 placeholder="username" required autofocus />
        </div>
        <div class="field">
          <label>パスワード</label>
          <input v-model="form.password" type="password" autocomplete="current-password"
                 placeholder="••••••" required />
        </div>
        <p v-if="errMsg" class="err">{{ errMsg }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'ログイン中…' : 'ログイン' }}
        </button>
        <p class="switch">初回セットアップ / ユーザー追加は
          <button type="button" @click="mode='register'">こちら</button>
        </p>
      </form>

      <!-- ユーザー登録 -->
      <form v-else @submit.prevent="doRegister">
        <h2 class="sub-title">ユーザー登録</h2>
        <div class="field">
          <label>ユーザー名（英数字）</label>
          <input v-model="form.username" type="text" placeholder="yamada" required />
        </div>
        <div class="field">
          <label>表示名</label>
          <input v-model="form.displayName" type="text" placeholder="山田 太郎" />
        </div>
        <div class="field">
          <label>パスワード（6文字以上）</label>
          <input v-model="form.password" type="password" placeholder="••••••" required />
        </div>
        <div class="field">
          <label>管理者シークレット <small>（初回は不要）</small></label>
          <input v-model="form.adminSecret" type="password" placeholder="管理者から取得" />
        </div>
        <p v-if="errMsg" class="err">{{ errMsg }}</p>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '登録中…' : '登録する' }}
        </button>
        <p class="switch">
          <button type="button" @click="mode='login'">← ログインに戻る</button>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router   = useRouter()
const auth     = useAuthStore()
const mode     = ref('login')
const loading  = ref(false)
const errMsg   = ref('')
const successMsg = ref('')

const form = reactive({ username:'', password:'', displayName:'', adminSecret:'' })

async function doLogin() {
  errMsg.value = ''
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    router.replace('/')
  } catch(e) {
    errMsg.value = e.message
  } finally {
    loading.value = false
  }
}

async function doRegister() {
  errMsg.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    await auth.register(form.username, form.password, form.displayName, form.adminSecret)
    successMsg.value = '登録完了！ログインしてください'
    form.password = ''
    setTimeout(() => { mode.value = 'login' }, 1500)
  } catch(e) {
    errMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 360px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-l);
  padding: 36px 28px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}
.logo-icon { font-size: 28px; }
.logo h1 { font-size: 20px; font-weight: 700; color: var(--text); margin: 0; }
.sub-title { font-size: 15px; font-weight: 600; color: var(--text2); margin: 0 0 20px; }

.field { margin-bottom: 16px; }
.field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 6px; }
.field small { color: var(--text3); }
.field input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  color: var(--text);
  font-size: 15px;
  padding: 10px 12px;
  box-sizing: border-box;
}
.field input:focus {
  outline: none;
  border-color: var(--accent);
}
.btn-primary {
  width: 100%;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-s);
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.err     { color: var(--accent-r); font-size: 13px; margin: 8px 0; }
.success { color: var(--accent-s); font-size: 13px; margin: 8px 0; }
.switch  { text-align: center; font-size: 12px; color: var(--text3); margin-top: 16px; }
.switch button { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px; }
</style>
