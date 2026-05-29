const {
  BlobServiceClient,
  ContainerClient,
} = require("@azure/storage-blob");

const connectionString =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

const containerSasUrl =
  process.env.AZURE_STORAGE_CONTAINER_SAS_URL;

const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME ||
  "clodrive";

let containerClient;

async function getContainerClient() {
  if (connectionString && !containerClient) {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(
        connectionString
      );

    containerClient =
      blobServiceClient.getContainerClient(
        containerName
      );

    await containerClient.createIfNotExists();
  }

  if (!containerClient && containerSasUrl) {
    containerClient =
      new ContainerClient(
        containerSasUrl
      );
  }

  if (!containerClient) {
    throw new Error(
      "Azure upload is not configured. Add AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_CONTAINER_SAS_URL in backend/.env."
    );
  }

  return containerClient;
}

function cleanPath(value) {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part.replace(/[^\w.\- ]+/g, "-")
    )
    .join("/");
}

async function uploadToAzureBlob({
  file,
  ownerId,
  ownerName,
  relativePath,
}) {
  const client =
    await getContainerClient();

  const originalPath =
    cleanPath(
      relativePath || file.originalname
    );

  const blobName =
    [
      `users/${cleanPath(ownerName || String(ownerId))}`,
      `${Date.now()}-${originalPath}`,
    ].join("/");

  const blockBlobClient =
    client.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(
    file.buffer,
    {
      blobHTTPHeaders: {
        blobContentType:
          file.mimetype ||
          "application/octet-stream",
      },
    }
  );

  return {
    blobName,
    url: blockBlobClient.url,
  };
}

async function deleteFromAzureBlob(blobName) {
  if (!blobName) return;

  const client =
    await getContainerClient();

  const blockBlobClient =
    client.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists({
    deleteSnapshots: "include",
  });
}

module.exports = {
  uploadToAzureBlob,
  deleteFromAzureBlob,
};
