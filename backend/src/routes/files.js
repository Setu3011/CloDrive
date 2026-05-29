const express = require("express");

const multer = require("multer");

const auth = require("../middleware/auth");

const db = require("../db");

const store = require("../store");

const {
  uploadToAzureBlob,
  deleteFromAzureBlob,
} = require("../azureBlob");

const router = express.Router();

/* ================= MULTER ================= */

const upload = multer({
  storage: multer.memoryStorage(),
});

/* ================= UPLOAD ================= */

router.post(
  "/upload",
  auth,
  upload.array("files", 100),
  async (req, res) => {
    try {
      const files =
        req.files || [];

      if (files.length === 0) {
        return res.status(400).json({
          message: "No files uploaded",
        });
      }

      const relativePaths =
        Array.isArray(req.body.relativePaths)
          ? req.body.relativePaths
          : [req.body.relativePaths];

      const savedFiles = [];

      const userResult =
        await db.query(
          "SELECT username FROM users WHERE id = $1",
          [req.user.id]
        );

      const ownerName =
        userResult.rows[0]?.username ||
        String(req.user.id);

      for (const [index, file] of files.entries()) {
        const azureFile =
          await uploadToAzureBlob({
            file,
            ownerId: req.user.id,
            ownerName,
            relativePath:
              relativePaths[index],
          });

        const saved = store.addFile({
          ownerId: req.user.id,

          originalName:
            relativePaths[index] ||
            file.originalname,

          storedName:
            azureFile.blobName,

          size: file.size,

          url: azureFile.url,

          azureBlobName:
            azureFile.blobName,

          azureUrl:
            azureFile.url,
        });

        savedFiles.push(saved);
      }

      return res.status(201).json({
        message: "Uploaded to Azure Blob Storage",
        files: savedFiles,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          error.message ||
          "Upload failed",
        code: error.code,
        statusCode: error.statusCode,
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
  async (req, res) => {
    try {
      const existingFile =
        store.getFile(
          req.params.id,
          req.user.id
        );

      if (!existingFile) {
        return res.status(404).json({
          message: "File not found",
        });
      }

      await deleteFromAzureBlob(
        existingFile.azureBlobName ||
          existingFile.storedName
      );

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
        message: "Deleted from Azure Blob Storage",
        file,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          error.message ||
          "Delete failed",
        code: error.code,
        statusCode: error.statusCode,
      });
    }
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
