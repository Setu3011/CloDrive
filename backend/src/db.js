const { Pool } = require('pg')
require('dotenv').config()

const connectionString = process.env.AZURE_POSTGRESQL_URL || process.env.DATABASE_URL
const isSslEnabled = (process.env.DB_SSL || 'true').toLowerCase() === 'true'

let pool = null

if (!connectionString) {
  console.error(
    'Missing Azure PostgreSQL connection string. Set AZURE_POSTGRESQL_URL (or DATABASE_URL).'
  )
} else {
  pool = new Pool({
    connectionString,
    ssl: isSslEnabled ? { rejectUnauthorized: false } : false
  })

  pool.on('error', (error) => {
    console.error('PostgreSQL pool error:', error.message)
  })
}

const db = {
  query: async (...args) => {
    if (!pool) {
      throw new Error('Azure PostgreSQL is not configured. Please set AZURE_POSTGRESQL_URL')
    }

    return pool.query(...args)
  }
}

module.exports = db
