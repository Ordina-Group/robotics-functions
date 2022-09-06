import { REQUIRED_ENV_VARIABLES } from "./constants";

export type FunctionConfig = {
  cognitive: {
    key: string;
    endpoint: string;
  };
  storage: {
    containerName: string;
    connectionString: string;
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
    cognitive: {
      key: process.env["COGNITIVE_API_KEY"],
      endpoint: process.env["COGNITIVE_API_URL"],
    },
    storage: {
      containerName: process.env["STORAGE_CONTAINER_NAME"],
      connectionString: process.env["AzureWebJobsStorage"],
    },
  };
};
