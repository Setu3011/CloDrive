// const { Pool } = require('pg')
// require('dotenv').config()

// const connectionString = process.env.AZURE_POSTGRESQL_URL || process.env.DATABASE_URL
// const isSslEnabled = (process.env.DB_SSL || 'true').toLowerCase() === 'true'

// let pool = null

// if (!connectionString) {
//   console.error(
//     'Missing Azure PostgreSQL connection string. Set AZURE_POSTGRESQL_URL (or DATABASE_URL).'
//   )
// } else {
//   pool = new Pool({
//     connectionString,
//     ssl: isSslEnabled ? { rejectUnauthorized: false } : false
//   })

//   pool.on('error', (error) => {
//     console.error('PostgreSQL pool error:', error.message)
//   })
// }

// const db = {
//   query: async (...args) => {
//     if (!pool) {
//       throw new Error('Azure PostgreSQL is not configured. Please set AZURE_POSTGRESQL_URL')
//     }

//     return pool.query(...args)
//   }
// }

// module.exports = db



const { Pool } = require('pg')
require('dotenv').config()

// PostgreSQL connection configuration
const connectionString =
  process.env.DATABASE_URL ||
  process.env.AZURE_POSTGRESQL_URL

const isSslEnabled =
  (process.env.DB_SSL || 'false').toLowerCase() === 'true'

let pool = null

if (!connectionString) {
  console.error(
    'Missing PostgreSQL connection string. Please set DATABASE_URL in your .env file.'
  )
} else {
  pool = new Pool({
    connectionString,

    // SSL is disabled for local PostgreSQL.
    // Set DB_SSL=true when connecting to Azure PostgreSQL.
    ssl: isSslEnabled
      ? { rejectUnauthorized: false }
      : false,

    // Optional connection pool settings
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  })

  // Handle unexpected PostgreSQL connection errors
  pool.on('error', (error) => {
    console.error('PostgreSQL pool error:', error.message)
  })
}

const db = {
  query: async (...args) => {
    if (!pool) {
      throw new Error(
        'PostgreSQL is not configured. Please set DATABASE_URL in your .env file.'
      )
    }

    return pool.query(...args)
  }
}

module.exports = db
