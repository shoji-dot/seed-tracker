import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { migrate } from './migrate.js'
import authRouter from './routes/auth.js'
import seedsRouter from './routes/seeds.js'
import mastersRouter from './routes/masters.js'
import activitiesRouter from './routes/activities.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '50mb' })) // 写真Base64対応

// API routes
app.use('/api/auth', authRouter)
app.use('/api/seeds', seedsRouter)
app.use('/api/masters', mastersRouter)
app.use('/api/activities', activitiesRouter)

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }))

// フロントエンド静的配信（本番）
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_, res) => res.sendFile(join(distPath, 'index.html')))
}

// 起動
migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] ✓ Listening on port ${PORT}`)
  })
}).catch(err => {
  console.error('[server] ✗ Startup failed:', err)
  process.exit(1)
})
