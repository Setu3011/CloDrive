const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const auth = require('../middleware/auth')
const store = require('../store')

const router = express.Router()

const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-')
    cb(null, `${Date.now()}-${safe}`)
  }
})

const upload = multer({ storage })

router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  const saved = store.addFile({
    ownerId: req.user.id,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size
  })

  return res.status(201).json({ message: 'Uploaded', file: saved })
})

router.get('/', auth, (req, res) => {
  const files = store.listFilesByOwner(req.user.id)
  return res.json({ files })
})

module.exports = router
