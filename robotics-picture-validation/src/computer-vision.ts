import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";

import { FunctionConfig } from "./config";

export const gatherComputerVisionResult = async (
  filePath: string,
  config: FunctionConfig
) => {
  const { key, endpoint } = config.cognitive;
  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
    endpoint
  );

  return computerVisionClient.detectObjects(filePath);
};
