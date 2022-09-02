import { Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";
import * as multipart from "parse-multipart";
import { randomUUID } from "crypto";

import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE, MBYTE } from "./constants";
import { FunctionConfig } from "./config";
import { generateReadOnlySASUrl } from "./azure-storage-blob-sas-url";

export const uploadPicture = async (
  req: HttpRequest,
  contentType: string,
  context: Context,
  config: FunctionConfig
) => {
  // check for allowed file type
  const isAllowedContentType = ALLOWED_CONTENT_TYPES.includes(contentType);
  if (!isAllowedContentType) {
    throw new Error(
      `Content type is not in allowed set: ${ALLOWED_CONTENT_TYPES.join(", ")}`
    );
  }

  // check for allowed file size
  if (req.body.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / MBYTE}MB`);
  }

  // context.log("req.body.length", req.body.length);

  // let header = req.headers["content-type"];
  // let boundary = header.split(" ")[1];
  // boundary = header.split("=")[1];
  // let body = req.body;

  // //console.log("Boundary - "+ boundary)
  // let parts = multipart.Parse(body, boundary);

  // Each chunk of the file is delimited by a special string
  const bodyBuffer = Buffer.from(req.body);

  // context.log(JSON.stringify(bodyBuffer));

  // const boundary = multipart.getBoundary(contentType);
  // const parts = multipart.Parse(bodyBuffer, boundary);

  const fileExt = contentType === "image/jpeg" ? "jpg" : "png";

  const containerName = req.query?.robotName;
  const fileName = `${randomUUID()}.${fileExt}`;

  // // The file buffer is corrupted or incomplete ?
  // if (!parts.length) {
  //   throw new Error(`File buffer is incorrect`);
  // }

  // context.log(JSON.stringify(parts));

  // filename is a required property of the parse-multipart package
  // if (parts[0]?.filename)
  //   context.log(`Original filename = ${parts[0]?.filename}`);
  // if (parts[0]?.type) context.log(`Content type = ${parts[0]?.type}`);
  // if (parts[0]?.data?.length) context.log(`Size = ${parts[0]?.data?.length}`);

  context.bindings.storage = bodyBuffer;

  // Get SAS token
  const sasInfo = await generateReadOnlySASUrl(
    process.env.AzureWebJobsStorage,
    containerName,
    fileName
  );

  // Returned to requestor
  return {
    fileName,
    storageAccountName: sasInfo.storageAccountName,
    containerName,
    url: sasInfo.accountSasTokenUrl,
  };
};
