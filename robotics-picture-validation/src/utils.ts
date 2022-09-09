import { HttpRequest } from "@azure/functions";
import { DEFAULT_STORAGE_ACCOUNT_NAME } from "./constants";

export const validateRequest = (req: HttpRequest) => {
  if (!req.query?.robotName) {
    throw new Error(`robotName is not defined`);
  }

  if (!req.query?.liveStream) {
    throw new Error(`liveStream is not defined`);
  }

  if (!req.body || !req.body.length) {
    throw new Error(`Request body is not defined`);
  }

  const contentType = (req?.headers && req?.headers["content-type"]) || false;

  if (!contentType) {
    throw new Error(`Content type is not sent in header 'content-type'`);
  }
};
