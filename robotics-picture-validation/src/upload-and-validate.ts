import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";

import { uploadPicture } from "./upload-picture";
import { validateRequest } from "./utils";
import { gatherAndValidateComputerVisionResult } from "./computer-vision";
import { getFunctionConfig } from "./config";
import { postValidationResult } from "./game-server";

export const uploadAndValidatePicture: AzureFunction = async function (
  context: Context,
  req: HttpRequest
) {
  const logger = context.log;

  try {
    const config = getFunctionConfig();
    const robotName = req.query.robotName;
    const liveStream = req.query.liveStream;

    validateRequest(req);

    logger(`Starting upload and validate flow for robotName "${robotName}"...`);

    const pictureUrl = await uploadPicture({
      requestContentType: req.headers["content-type"],
      fileBuffer: Buffer.from(req.body),
      robotName,
      config,
      logger,
    });

    const isValidGuess = await gatherAndValidateComputerVisionResult(
      pictureUrl,
      config,
      logger
    ).catch((error) => {
      // when the validation fails we only log the error and assume it is an invalid guess
      // to be able to update the gameserver as it could be request limited at this point (using the free tier of Azure CS)
      logger.error(error.message);
      return false;
    });

    await postValidationResult({
      robotName,
      liveStream,
      isValidGuess,
      pictureUrl,
      config,
      logger,
    });
  } catch (err) {
    logger.error(err.message);

    context.res.body = `${err.message}`;
    context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
  }
  return context.res;
};
