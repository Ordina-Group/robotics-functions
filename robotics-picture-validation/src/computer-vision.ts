import {
  ComputerVisionClient,
  ComputerVisionModels,
} from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";

import { FunctionConfig } from "./config";

type DetectObjectsResponse = ComputerVisionModels.DetectObjectsResponse;

export const gatherAndValidateComputerVisionResult = async (
  filePath: string,
  config: FunctionConfig,
  logger: (message: string) => void
) => {
  const { key, endpoint } = config.cognitive;
  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
    endpoint
  );

  const { objects } = await computerVisionClient.detectObjects(filePath);

  logger(JSON.stringify(objects));

  return validateComputerVisionResult(objects, config);
};

const validateComputerVisionResult = (
  objects: DetectObjectsResponse["objects"],
  config: FunctionConfig
): boolean => {
  const { validObjects, minConfidence } = config.cognitive.detections;
  const isValidGuess = createGuessValidator(validObjects, minConfidence);

  return objects.some(({ object, confidence, parent }) => {
    const isObjectValidGuess = isValidGuess(object, confidence);
    const isParentObjectValidGuess = isValidGuess(
      parent.object,
      parent.confidence
    );

    return isObjectValidGuess || isParentObjectValidGuess;
  });
};

const createGuessValidator =
  (validObjects: string[], minConfidence: number) =>
  (object: string, confidence: number) => {
    return validObjects.includes(object) && confidence >= minConfidence;
  };
