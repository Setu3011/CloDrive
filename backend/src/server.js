const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const fileRoutes = require('./routes/files')
const initDb = require('./initDb')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/', (_req, res) => {
  res.json({ message: 'Backend running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)

let hasStarted = false

async function startServer() {
  if (hasStarted) {
    return
  }

  try {
    await initDb()
    hasStarted = true
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Database not ready:', error.message)
    console.error('Retrying DB connection in 10 seconds...')
    setTimeout(startServer, 10000)
  }
}

startServer()
