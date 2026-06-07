import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'seed-tracker-secret-change-in-prod'

// ミドルウェア: JWT検証
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username/password required' })

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'ユーザーが見つかりません' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'パスワードが違います' })

    const token = jwt.sign(
      { id: user.id, username: user.username, displayName: user.display_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
    res.json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/register  (管理者のみ or 初回セットアップ)
router.post('/register', async (req, res) => {
  const { username, password, displayName, adminSecret } = req.body

  // 初回セットアップ（usersが0件）または管理者シークレット
  const { rows } = await pool.query('SELECT COUNT(*) FROM users')
  const userCount = parseInt(rows[0].count)
  const isFirstUser = userCount === 0
  const hasAdminSecret = adminSecret === (process.env.ADMIN_SECRET || 'seed-admin-2024')

  if (!isFirstUser && !hasAdminSecret) {
    return res.status(403).json({ error: '管理者シークレットが必要です' })
  }

  if (!username || !password) return res.status(400).json({ error: 'username/password required' })
  if (password.length < 6) return res.status(400).json({ error: 'パスワードは6文字以上にしてください' })

  try {
    const hashed = await bcrypt.hash(password, 10)
    const role = isFirstUser ? 'admin' : 'member'
    const { rows: newUser } = await pool.query(
      'INSERT INTO users (username, password, display_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, display_name, role',
      [username.trim().toLowerCase(), hashed, displayName || username, role]
    )
    res.json({ success: true, user: newUser[0] })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'そのユーザー名はすでに使われています' })
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user })
})

// GET /api/auth/users (管理者のみ)
router.get('/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { rows } = await pool.query('SELECT id, username, display_name, role, created_at FROM users ORDER BY id')
  res.json(rows)
})

export default router
