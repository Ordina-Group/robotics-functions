import { AzureFunction } from "@azure/functions";
import {
  ContainerClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { randomUUID } from "crypto";

const httpTrigger: AzureFunction = async (context, req) => {
  const account = process.env.ACCOUNT_NAME;
  const accountKey = process.env.ACCOUNT_KEY;

  const contentType = req.headers["content-type"];
  const fileSize = req.body.length || req.headers["content-length"];

  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
  );

  const ext = contentType === "image/jpeg" ? "jpg" : "png";

  context.log("content type:", contentType);

  const containerName = `pictures/${req.query?.robotName}`;
  const containerClient = new ContainerClient(
    `https://${account}.blob.core.windows.net/${containerName}`,
    sharedKeyCredential
  );

  const bodyBase64 = req.body;
  const content = Buffer.from(bodyBase64, "base64");
  //   const content = Buffer.from(req.body, "utf-8").toString();

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

  context.res.status = 200;
  context.res.body = {
    result: uploadBlobResponse.requestId,
  };

  return context.res;
};

export default httpTrigger;
