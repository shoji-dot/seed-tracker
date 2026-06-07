import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from './auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/activities/all  窶・蜈ｨ莉ｶ + seed_title莉倥″
router.get('/all', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.display_name as created_by_name, s.title as seed_title
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN seeds s ON a.seed_id = s.id
      ORDER BY a.date DESC, a.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/activities?seed_id=xxx
router.get('/', async (req, res) => {
  try {
    const { seed_id } = req.query
    let query = `
      SELECT a.*, u.display_name as created_by_name
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
    `
    const params = []
    if (seed_id) {
      query += ' WHERE a.seed_id = $1'
      params.push(seed_id)
    }
    query += ' ORDER BY a.date DESC, a.created_at DESC'
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/activities/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.display_name as created_by_name
       FROM activities a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/activities
router.post('/', async (req, res) => {
  const { seed_id, type, date, location, summary, detail } = req.body
  if (!seed_id || !type) return res.status(400).json({ error: 'seed_id and type required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO activities (seed_id, type, date, location, summary, detail, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [seed_id, type, date || null, location || '', summary || '', JSON.stringify(detail || {}), req.user.id]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/activities/:id
router.put('/:id', async (req, res) => {
  const { type, date, location, summary, detail } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE activities SET type=$1, date=$2, location=$3, summary=$4, detail=$5
       WHERE id=$6 RETURNING *`,
      [type, date || null, location || '', summary || '', JSON.stringify(detail || {}), req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/activities/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

