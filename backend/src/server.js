const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const profileRoutes =
require("./routes/profile");

const authRoutes = require('./routes/auth')
const fileRoutes = require('./routes/files')
const initDb = require('./initDb')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json())

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
)

app.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Backend running'
  })
})

app.get('/api/health', async (_req, res) => {
  try {
    await initDb()

    res.json({
      status: 'success',
      backend: true,
      database: true
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      backend: true,
      database: false,
      message: error.message
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)

let hasStarted = false

app.use(
  "/api/profile",
  profileRoutes
);

async function startServer() {
  if (hasStarted) return

  try {
    await initDb()

    hasStarted = true

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`)
    })
  } catch (error) {
    console.error('❌ Database connection failed')
    console.error(error)

    console.log('🔄 Retrying in 10 seconds...')
    setTimeout(startServer, 10000)
  }
}

startServer()
