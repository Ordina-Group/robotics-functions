import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";

import { uploadPicture } from "./upload-picture";
import { validateRequest } from "./utils";
import { gatherAndValidateComputerVisionResult } from "./computer-vision";
import { getFunctionConfig } from "./config";

export const uploadAndValidatePicture: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  const logger = context.log;

  try {
    const config = getFunctionConfig();

    validateRequest(req);

    const filePath = await uploadPicture({
      requestContentType: req.headers["content-type"],
      robotName: req.query.robotName,
      fileBuffer: Buffer.from(req.body),
      config,
      logger,
    });

    const isValidGuess = await gatherAndValidateComputerVisionResult(
      filePath,
      config,
      logger
    );

    logger(`Score: ${isValidGuess}`);

    // POST to gameserver
  } catch (err) {
    logger.error(err.message);

    context.res.body = `${err.message}`;
    context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
  }
  return context.res;
};
