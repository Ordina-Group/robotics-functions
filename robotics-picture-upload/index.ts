import { AzureFunction } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";

const httpTrigger: AzureFunction = async (context, req) => {
  const contentType = req.headers["content-type"];
  const fileSize = req.body.length || req.headers["content-length"];

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AzureWebJobsStorage
  );

  const ext = contentType === "image/jpeg" ? "jpg" : "png";

  context.log("content type:", contentType);

  const containerName = `pictures/${req.query?.robotName}`;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const bodyBase64 = req.body;
  const content = Buffer.from(bodyBase64, "base64");

  const blobName = `${randomUUID()}.${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(
    content,
    Buffer.byteLength(content)
  );

  context.log(
    `Uploaded block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );

  context.res.body = {
    pictureUrl: `${containerClient.url}/${blobName}`,
  };

  return context.res;
};

export default httpTrigger;
