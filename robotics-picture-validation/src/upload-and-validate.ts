import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";

import { uploadPicture } from "./upload-picture";
import { validateRequest } from "./utils";
import { gatherComputerVisionResult } from "./computer-vision";
import { getFunctionConfig } from "./config";

export const uploadAndValidatePicture: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  try {
    const config = getFunctionConfig();

    validateRequest(req);

    const filePath = await uploadPicture(
      req.body,
      req.headers["content-type"],
      req.params.robotName,
      config
    );

    context.log(`Upload complete, image should be accessible on ${filePath}`);

    const result = await gatherComputerVisionResult(filePath, config);

    context.res.body = result;
  } catch (err) {
    context.log.error(err.message);

    context.res.body = `${err.message}`;
    context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
  }
  return context.res;
};
