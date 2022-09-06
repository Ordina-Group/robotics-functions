import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";

import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE, MBYTE } from "./constants";
import { FunctionConfig } from "./config";

export const uploadPicture = async (
  bodyBase64: string,
  contentType: string,
  robotName: string,
  config: FunctionConfig
) => {
  // check for allowed file type
  const isAllowedContentType = ALLOWED_CONTENT_TYPES.includes(contentType);
  if (!isAllowedContentType) {
    throw new Error(
      `Content type is not in allowed set: ${ALLOWED_CONTENT_TYPES.join(", ")}`
    );
  }

  const imageContent = Buffer.from(bodyBase64.trim(), "base64");

  // check for allowed file size
  if (imageContent.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / MBYTE}MB`);
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.storage.connectionString
  );

  const ext = contentType === "image/jpeg" ? "jpg" : "png";

  const containerName = `${config.storage.containerName}/${robotName}`;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `${randomUUID()}.${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(imageContent, Buffer.byteLength(imageContent));

  return `${containerClient.url}/${blobName}`;
};
