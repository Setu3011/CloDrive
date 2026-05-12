const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const auth = require('../middleware/auth')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body
  const safeUsername = String(username || '').trim()
  const safeEmail = String(email || '').trim().toLowerCase()

  if (!safeUsername || !safeEmail || !password) {
    return res.status(400).json({ message: 'username, email, password are required' })
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [safeEmail])

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const createdUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [safeUsername, safeEmail, passwordHash]
    )

    await pool.query(
      'INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [createdUser.rows[0].id, safeUsername]
    )

    return res.status(201).json({
      message: 'User created',
      user: createdUser.rows[0]
    })
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, username, password } = req.body
  const loginId = String(email || username || '').trim().toLowerCase()

  if (!loginId || !password) {
    return res.status(400).json({ message: 'username/email and password are required' })
  }

  try {
    const userResult = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE LOWER(email) = $1 OR LOWER(username) = $1
       LIMIT 1`,
      [loginId]
    )

    const user = userResult.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Username or password is incorrect' })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return res.status(401).json({ message: 'Username or password is incorrect' })
    }

    await pool.query(
      'INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [user.id, user.username]
    )

    const profileResult = await pool.query(
      'SELECT id, user_id, display_name, bio, avatar_url, created_at FROM profiles WHERE user_id = $1',
      [user.id]
    )

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      profile: profileResult.rows[0] || null
    })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

router.get('/me', auth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const profileResult = await pool.query(
      'SELECT id, user_id, display_name, bio, avatar_url, created_at FROM profiles WHERE user_id = $1',
      [req.user.id]
    )

    return res.json({
      user: userResult.rows[0],
      profile: profileResult.rows[0] || null
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message })
  }
})

module.exports = router
