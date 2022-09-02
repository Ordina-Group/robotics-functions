import { REQUIRED_ENV_VARIABLES } from "./constants";
import { getStorageAccountName } from "./utils";

export type FunctionConfig = {
  environment: "development" | "production";
  cognitive: {
    key: string;
    endpoint: string;
  };
  storage: {
    accountName: string;
  };
};

const validateEnv = () => {
  REQUIRED_ENV_VARIABLES.forEach((varName) => {
    if (!process?.env?.[varName]) {
      throw new Error(`Required environment variable "${varName}" is not set!`);
    }
  });

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

export const getFunctionConfig = (): FunctionConfig => {
  validateEnv();

  return {
    environment:
      process.env["NODE_ENV"] === "development" ? "development" : "production",
    cognitive: {
      key: process.env["COGNITIVE_API_KEY"],
      endpoint: process.env["COGNITIVE_API_URL"],
    },
    storage: {
      accountName: getStorageAccountName(),
    },
  };
};
