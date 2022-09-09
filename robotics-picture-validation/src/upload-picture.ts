import * as multipart from "parse-multipart";
import { randomUUID } from "crypto";
import { BlobServiceClient } from "@azure/storage-blob";

import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE, MBYTE } from "./constants";
import { FunctionConfig } from "./config";

type UploadPictureParams = {
  requestContentType: string;
  robotName: string;
  fileBuffer: Buffer;
  config: FunctionConfig;
  logger: (message: string) => void;
};

export const uploadPicture = async ({
  requestContentType,
  robotName,
  fileBuffer,
  config,
  logger: log,
}: UploadPictureParams) => {
  // Each chunk of the file is delimited by a special string
  const boundary = multipart.getBoundary(requestContentType);
  const parts = multipart.Parse(fileBuffer, boundary);

  // The file buffer is corrupted or incomplete
  if (!parts?.length) {
    throw new Error("File buffer is incorrect");
  }

  const fileContentType = parts[0].type;
  const fileData = parts[0].data;

  // check for allowed file type
  const isAllowedContentType = ALLOWED_CONTENT_TYPES.includes(fileContentType);
  if (!isAllowedContentType) {
    throw new Error(
      `Content type is not in allowed set: ${ALLOWED_CONTENT_TYPES.join(", ")}`
    );
  }

  // check for allowed file size
  if (fileData.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / MBYTE}MB`);
  }

  log(`Content-Type: ${fileContentType}`);
  log(`File size: ${fileData.length} bytes`);

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.storage.connectionString
  );

  const ext = fileContentType === "image/jpeg" ? "jpg" : "png";

  const containerName = `${config.storage.containerName}/${robotName}`;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `${randomUUID()}.${ext}`;
  const picturePath = `${containerClient.url}/${blobName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  log(`Start uploading to: ${picturePath}`);

  await blockBlobClient.upload(fileData, Buffer.byteLength(parts[0]?.data));

  log(`Success! Picture uploaded to: ${picturePath}`);

  return picturePath;
};
