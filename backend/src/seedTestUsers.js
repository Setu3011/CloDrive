const bcrypt = require('bcryptjs')
const pool = require('./db')
const initDb = require('./initDb')

const testUsers = [
  {
    username: 'testuser1',
    email: 'testuser1@clodrive.com',
    password: 'Test@1234'
  },
  {
    username: 'testuser2',
    email: 'testuser2@clodrive.com',
    password: 'Testma@1234'
  },
  {
    username: 'testuser3',
    email: 'testuser3@clodrive.com',
    password: 'Test@1234'
  }
]

async function seedUsers() {
  try {
    await initDb()

    for (const user of testUsers) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [user.email])

      if (existing.rows.length > 0) {
        console.log(`Skipped (already exists): ${user.email}`)
        continue
      }

      const passwordHash = await bcrypt.hash(user.password, 10)

      const created = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [user.username, user.email, passwordHash]
      )

      await pool.query(
        'INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
        [created.rows[0].id, user.username]
      )

      console.log(`Created: ${user.email} (password: ${user.password})`)
    }

    console.log('Test user seeding completed.')
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed test users:', error.message)
    process.exit(1)
  }
}

seedUsers()
