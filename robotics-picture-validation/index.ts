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

const validateAndStorePicture: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    validateEnv();
    validateRequest(req);

    const filePath = await uploadPhoto(
      req,
      req.headers["content-type"],
      context
    );
    const result = await gatherComputerVisionResult(filePath);

    context.res.body = result;
  } catch (err) {
    context.log.error(err.message);

    context.res.body = `${err.message}`;
    context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
  }
  return context.res;
};

const validateEnv = () => {
  const requiredVariables = [
    "AzureWebJobsStorage",
    "COGNITIVE_API_KEY",
    "COGNITIVE_API_URL",
  ];

  requiredVariables.forEach((varName) => {
    if (!process?.env?.[varName]) {
      throw new Error(`Required environment variable "${varName}" is not set!`);
    }
  });
};

const validateRequest = (req: HttpRequest) => {
  if (!req.query?.robotName) {
    throw new Error(`robotName is not defined`);
  }

  // `filename` is required property to use multi-part npm package
  if (!req.query?.filename) {
    throw new Error(`filename is not defined`);
  }

  if (!req.body || !req.body.length) {
    throw new Error(`Request body is not defined`);
  }

  const contentType = (req?.headers && req?.headers["content-type"]) || false;

  if (!contentType) {
    throw new Error(`Content type is not sent in header 'content-type'`);
  }

  if (
    process?.env?.Environment === "Production" &&
    (!process?.env?.AzureWebJobsStorage ||
      process?.env?.AzureWebJobsStorage.length < 10)
  ) {
    throw Error(
      "Storage isn't configured correctly - get Storage Connection string from Azure portal"
    );
  }
};

const uploadPhoto = async (
  req: HttpRequest,
  contentType: string,
  context: Context
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

  return `https://${
    getStorageAccountName() || "rgroboticab733"
  }.blob.core.windows.net/${req.query?.robotName}/${req.query?.filename}`;
};

const gatherComputerVisionResult = async (filePath: string) => {
  const key = process.env["COGNITIVE_API_KEY"];
  const endpoint = process.env["COGNITIVE_API_URL"];

  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
    endpoint
  );

  return computerVisionClient.detectObjects(filePath);
};

// Parses a config string to an object (Test=123;AnotherTest=aaa -> {Test:'123',AnotherTest:'aaa'})
const parseConfigString = (configStr: string): Record<string, string> => {
  return configStr
    .split(";")
    .reduce((settings: Record<string, string>, setting: string) => {
      const [key, value] = setting.split("=");
      return {
        ...settings,
        [key]: value,
      };
    }, {});
};

const getStorageAccountName = () => {
  const storageConfig = parseConfigString(process?.env?.AzureWebJobsStorage);
  return storageConfig.AccountName;
};

const httpTrigger: AzureFunction = validateAndStorePicture;

export default httpTrigger;
