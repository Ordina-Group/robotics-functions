import { Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";
import * as multipart from "parse-multipart";

import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE, MBYTE } from "./constants";
import { FunctionConfig } from "./config";

export const uploadPicture = async (
  req: HttpRequest,
  contentType: string,
  context: Context,
  config: FunctionConfig
) => {
  // Each chunk of the file is delimited by a special string
  const bodyBuffer = Buffer.from(req.body);
  const boundary = multipart.getBoundary(contentType);
  const parts = multipart.Parse(bodyBuffer, boundary);

  // The file buffer is corrupted or incomplete ?
  if (!parts?.length) {
    context.res.body = `File buffer is incorrect`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }

  // filename is a required property of the parse-multipart package
  if (parts[0]?.filename)
    context.log(`Original filename = ${parts[0]?.filename}`);
  if (parts[0]?.type) context.log(`Content type = ${parts[0]?.type}`);
  if (parts[0]?.data?.length) context.log(`Size = ${parts[0]?.data?.length}`);

  // check for allowed file type
  const isAllowedContentType = ALLOWED_CONTENT_TYPES.includes(parts[0]?.type);
  if (!isAllowedContentType) {
    throw new Error(
      `Content type is not in allowed set: ${ALLOWED_CONTENT_TYPES.join(", ")}`
    );
  }

  // check for allowed file size
  if (parts[0]?.data?.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / MBYTE}MB`);
  }

  context.bindings.storage = parts[0]?.data;

  const pictureName = `${req.query?.robotName}/${req.query?.filename}`;

  const getPictureUrl = () => {
    if (config.environment === "development") {
      return `http://127.0.0.1:10000/${pictureName}`;
    }

    return `https://${config.storage.accountName}.blob.core.windows.net/${pictureName}`;
  };

  return getPictureUrl();
};
