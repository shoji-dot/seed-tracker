import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from './auth.js'

const router = Router()
router.use(authMiddleware)

// ===== TAGS =====
router.get('/tags', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tags ORDER BY name')
  res.json(rows)
})

router.post('/tags', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *',
      [name.trim()]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/tags/:id', async (req, res) => {
  await pool.query('DELETE FROM tags WHERE id=$1', [req.params.id])
  res.json({ success: true })
})

// ===== FACILITIES =====
router.get('/facilities', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM facilities ORDER BY name')
  res.json(rows)
})

router.post('/facilities', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO facilities (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *',
      [name.trim()]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/facilities/:id', async (req, res) => {
  await pool.query('DELETE FROM facilities WHERE id=$1', [req.params.id])
  res.json({ success: true })
})

// ===== EQUIPMENT CATEGORIES =====
router.get('/equipment-categories', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM equipment_categories ORDER BY name')
  res.json(rows)
})

router.post('/equipment-categories', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO equipment_categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *',
      [name.trim()]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/equipment-categories/:id', async (req, res) => {
  await pool.query('DELETE FROM equipment_categories WHERE id=$1', [req.params.id])
  res.json({ success: true })
})

// ===== PERSONS =====
router.get('/persons', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM persons ORDER BY name')
  res.json(rows)
})

router.post('/persons', async (req, res) => {
  const { name, role, affiliation, contact, specialty, memo } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO persons (name,role,affiliation,contact,specialty,memo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, role||'', affiliation||'', contact||'', specialty||'', memo||'']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/persons/:id', async (req, res) => {
  const { name, role, affiliation, contact, specialty, memo } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE persons SET name=$1,role=$2,affiliation=$3,contact=$4,specialty=$5,memo=$6 WHERE id=$7 RETURNING *',
      [name, role||'', affiliation||'', contact||'', specialty||'', memo||'', req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/persons/:id', async (req, res) => {
  await pool.query('DELETE FROM persons WHERE id=$1', [req.params.id])
  res.json({ success: true })
})

// ===== COMPANIES =====
router.get('/companies', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM companies ORDER BY name')
  res.json(rows)
})

router.post('/companies', async (req, res) => {
  const { name, industry, location, contact, url, memo } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO companies (name,industry,location,contact,url,memo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, industry||'', location||'', contact||'', url||'', memo||'']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/companies/:id', async (req, res) => {
  const { name, industry, location, contact, url, memo } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE companies SET name=$1,industry=$2,location=$3,contact=$4,url=$5,memo=$6 WHERE id=$7 RETURNING *',
      [name, industry||'', location||'', contact||'', url||'', memo||'', req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/companies/:id', async (req, res) => {
  await pool.query('DELETE FROM companies WHERE id=$1', [req.params.id])
  res.json({ success: true })
})

export default router
