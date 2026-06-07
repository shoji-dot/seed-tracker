import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from './auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/seeds
router.get('/', async (req, res) => {
  try {
    const { q, status, tag } = req.query
    let where = []
    let params = []
    let idx = 1

    if (q) {
      where.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR source ILIKE $${idx})`)
      params.push(`%${q}%`)
      idx++
    }
    if (status) {
      where.push(`status = $${idx}`)
      params.push(status)
      idx++
    }
    if (tag) {
      where.push(`$${idx} = ANY(tags)`)
      params.push(tag)
      idx++
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const { rows } = await pool.query(
      `SELECT s.*, u.display_name as created_by_name
       FROM seeds s
       LEFT JOIN users u ON s.created_by = u.id
       ${whereClause}
       ORDER BY s.updated_at DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/seeds/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, u.display_name as created_by_name
       FROM seeds s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = $1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/seeds
router.post('/', async (req, res) => {
  const { title, status, description, source, source_date, priority, tags, person_ids, company_ids, or_records, photos } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })

  try {
    const { rows } = await pool.query(
      `INSERT INTO seeds (title, status, description, source, source_date, priority, tags, person_ids, company_ids, or_records, photos, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        title,
        status || '課題',
        description || '',
        source || '',
        source_date || null,
        priority ?? 2,
        tags || [],
        person_ids || [],
        company_ids || [],
        JSON.stringify(or_records || []),
        JSON.stringify(photos || []),
        req.user.id
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/seeds/:id
router.put('/:id', async (req, res) => {
  const { title, status, description, source, source_date, priority, tags, person_ids, company_ids, or_records, photos } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE seeds SET
        title=$1, status=$2, description=$3, source=$4, source_date=$5,
        priority=$6, tags=$7, person_ids=$8, company_ids=$9,
        or_records=$10, photos=$11
       WHERE id=$12 RETURNING *`,
      [
        title, status, description, source, source_date || null,
        priority ?? 2, tags || [], person_ids || [], company_ids || [],
        JSON.stringify(or_records || []),
        JSON.stringify(photos || []),
        req.params.id
      ]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/seeds/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM seeds WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
