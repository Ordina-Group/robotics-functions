import { REQUIRED_ENV_VARIABLES } from "./constants";

export type FunctionConfig = {
  cognitive: {
    key: string;
    endpoint: string;
    detections: {
      validObjects: string[];
      minConfidence: number;
    };
  };
  storage: {
    containerName: string;
    connectionString: string;
  };
  gameServer: {
    url: string;
    skipUpdate: boolean;
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
      detections: {
        validObjects: ["car"],
        minConfidence: 0.6,
      },
    },
    storage: {
      containerName: process.env["STORAGE_CONTAINER_NAME"],
      connectionString: process.env["AzureWebJobsStorage"],
    },
    gameServer: {
      url:
        process.env["GAME_SERVER_API_URL"] ||
        "https://robotics-ws-gamemanager.azurewebsites.net/api",
      skipUpdate: process.env["GAME_SERVER_SKIP_UPDATE"] === "true",
    },
  };
};
