const express = require("express");

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const auth = require("../middleware/auth");

const store = require("../store");

const router = express.Router();

/* ================= UPLOAD DIR ================= */

const uploadsDir = path.join(
  __dirname,
  "../../uploads"
);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

/* ================= MULTER ================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(
      /\s+/g,
      "-"
    );

    cb(
      null,
      `${Date.now()}-${safe}`
    );
  },
});

const upload = multer({ storage });

/* ================= UPLOAD ================= */

router.post(
  "/upload",
  auth,
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const saved = store.addFile({
        ownerId: req.user.id,

        originalName:
          req.file.originalname,

        storedName:
          req.file.filename,

        size: req.file.size,
      });

      return res.status(201).json({
        message: "Uploaded",
        file: saved,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Upload failed",
      });
    }
  }
);

/* ================= MY FILES ================= */

router.get("/", auth, (req, res) => {
  const files =
    store.listFilesByOwner(
      req.user.id
    );

  res.json({ files });
});

/* ================= RECENT ================= */

router.get(
  "/recent",
  auth,
  (req, res) => {
    const files =
      store.listRecentFiles(
        req.user.id
      );

    res.json({ files });
  }
);

/* ================= STARRED ================= */

router.get(
  "/starred",
  auth,
  (req, res) => {
    const files =
      store.listStarredFiles(
        req.user.id
      );

    res.json({ files });
  }
);

/* ================= TRASH ================= */

router.get(
  "/trash",
  auth,
  (req, res) => {
    const files =
      store.listTrashFiles(
        req.user.id
      );

    res.json({ files });
  }
);

/* ================= TOGGLE STAR ================= */

router.put(
  "/star/:id",
  auth,
  (req, res) => {
    const file =
      store.toggleStar(
        req.params.id,
        req.user.id
      );

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json({
      message: "Updated",
      file,
    });
  }
);

/* ================= DELETE ================= */

router.delete(
  "/:id",
  auth,
  (req, res) => {
    const file =
      store.deleteFile(
        req.params.id,
        req.user.id
      );

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json({
      message: "Moved to trash",
    });
  }
);

/* ================= RESTORE ================= */

router.put(
  "/restore/:id",
  auth,
  (req, res) => {
    const file =
      store.restoreFile(
        req.params.id,
        req.user.id
      );

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json({
      message: "Restored",
      file,
    });
  }
);

module.exports = router;