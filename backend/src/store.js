const files = [];

let fileId = 1;

/* ================= ADD FILE ================= */

function addFile({
  ownerId,
  originalName,
  storedName,
  size,
  url,
  azureBlobName,
  azureUrl,
}) {
  const file = {
    id: fileId++,

    ownerId,

    originalName,

    storedName,

    size,

    starred: false,

    deleted: false,

    url: url || `/uploads/${storedName}`,

    azureBlobName,

    azureUrl,

    createdAt: new Date().toISOString(),
  };

  files.push(file);

  return file;
}

/* ================= LIST FILES ================= */

function listFilesByOwner(ownerId) {
  return files.filter(
    (f) =>
      f.ownerId === ownerId &&
      !f.deleted
  );
}

/* ================= RECENT FILES ================= */

function listRecentFiles(ownerId) {
  return files
    .filter(
      (f) =>
        f.ownerId === ownerId &&
        !f.deleted
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
}

/* ================= STARRED FILES ================= */

function listStarredFiles(ownerId) {
  return files.filter(
    (f) =>
      f.ownerId === ownerId &&
      f.starred &&
      !f.deleted
  );
}

/* ================= TRASH ================= */

function listTrashFiles(ownerId) {
  return files.filter(
    (f) =>
      f.ownerId === ownerId &&
      f.deleted
  );
}

/* ================= TOGGLE STAR ================= */

function toggleStar(fileId, ownerId) {
  const file = files.find(
    (f) =>
      f.id === parseInt(fileId) &&
      f.ownerId === ownerId
  );

  if (!file) return null;

  file.starred = !file.starred;

  return file;
}

/* ================= DELETE ================= */

function getFile(fileId, ownerId) {
  return files.find(
    (f) =>
      f.id === parseInt(fileId) &&
      f.ownerId === ownerId
  );
}

function deleteFile(fileId, ownerId) {
  const file =
    getFile(fileId, ownerId);

  if (!file) return null;

  file.deleted = true;

  return file;
}

/* ================= RESTORE ================= */

function restoreFile(fileId, ownerId) {
  const file = files.find(
    (f) =>
      f.id === parseInt(fileId) &&
      f.ownerId === ownerId
  );

  if (!file) return null;

  file.deleted = false;

  return file;
}

module.exports = {
  addFile,
  listFilesByOwner,
  listRecentFiles,
  listStarredFiles,
  listTrashFiles,
  toggleStar,
  getFile,
  deleteFile,
  restoreFile,
};
