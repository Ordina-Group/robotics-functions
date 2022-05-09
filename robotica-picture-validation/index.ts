import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import HTTP_CODES from "http-status-enum";
import * as multipart from "parse-multipart";

const BYTE = 1;
const KBYTE = 1024 * BYTE;
const MBYTE = 1024 * KBYTE;

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 6 * MBYTE;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  return validateAndStorePicture(context, req);
};

const validateAndStorePicture: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  context.log("upload HTTP trigger function processed a request.");

  if (!req.query?.robotName) {
    context.res.body = `robotName is not defined`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }

  // `filename` is required property to use multi-part npm package
  if (!req.query?.filename) {
    context.res.body = `filename is not defined`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }

  if (!req.body || !req.body.length) {
    context.res.body = `Request body is not defined`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }

  const contentType = req.headers["content-type"];

  if (!req.headers || !contentType) {
    context.res.body = `Content type is not sent in header 'content-type'`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }

  context.log(
    `*** RobotName:${req.query?.robotName}, Filename:${req.query?.filename}, Content type:${contentType}, Length:${req.body.length}`
  );

  if (
    process?.env?.Environment === "Production" &&
    (!process?.env?.AzureWebJobsStorage ||
      process?.env?.AzureWebJobsStorage.length < 10)
  ) {
    throw Error(
      "Storage isn't configured correctly - get Storage Connection string from Azure portal"
    );
  }

  try {
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
      console.log(`Original filename = ${parts[0]?.filename}`);
    if (parts[0]?.type) console.log(`Content type = ${parts[0]?.type}`);
    if (parts[0]?.data?.length) console.log(`Size = ${parts[0]?.data?.length}`);

    // check for allowed file type
    const isAllowedContentType = ALLOWED_CONTENT_TYPES.includes(parts[0]?.type);
    if (!isAllowedContentType) {
      context.res.body = `Content type is not in allowed set: ${ALLOWED_CONTENT_TYPES.join(
        ", "
      )}`;
      context.res.status = HTTP_CODES.BAD_REQUEST;
      return context.res;
    }

    // check for allowed file size
    if (parts[0]?.data?.length > MAX_FILE_SIZE) {
      context.res.body = `File size exceeds limit of ${
        MAX_FILE_SIZE / MBYTE
      }MB`;
      context.res.status = HTTP_CODES.BAD_REQUEST;
      return context.res;
    }

    // Passed to Storage
    context.bindings.storage = parts[0]?.data;

    // returned to requestor
    const filePath = `https://roboticastorage.blob.core.windows.net/${req.query?.robotName}/${req.query?.filename}`;
    context.log(`Image saved as ${filePath}`);

    try {
      const key = process.env.COGNITIVE_API_KEY;
      const endpoint = process.env.COGNITIVE_API_URL;

      const computerVisionClient = new ComputerVisionClient(
        // @ts-ignore
        new ApiKeyCredentials({
          inHeader: { "Ocp-Apim-Subscription-Key": key },
        }),
        endpoint
      );

      context.res.body = await computerVisionClient.detectObjects(filePath);
    } catch (e) {
      context.res.body = e.message;
    }

    // return computerVisionClient.detectObjects(filePath);

    // context.res.body = filePath; //await computerVisionClient.detectObjects(filePath);
  } catch (err) {
    context.log.error(err.message);
    {
      context.res.body = `${err.message}`;
      context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
    }
  }
  return context.res;
};

// const gatherComputerVisionResult = async (filePath: string) => {
//   const key = process.env.COGNITIVE_API_KEY;
//   const endpoint = process.env.COGNITIVE_API_URL;

//   const computerVisionClient = new ComputerVisionClient(
//     // @ts-ignore
//     new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
//     endpoint
//   );

//   return computerVisionClient.detectObjects(filePath);
// };

export default httpTrigger;
