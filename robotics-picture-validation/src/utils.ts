import { HttpRequest } from "@azure/functions";

export const validateRequest = (req: HttpRequest) => {
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
};

// Parses a config string to an object (Test=123;AnotherTest=aaa -> {Test:'123',AnotherTest:'aaa'})
export const parseConfigString = (
  configStr: string
): Record<string, string> => {
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

export const getStorageAccountName = () => {
  const storageConfig = parseConfigString(process?.env?.AzureWebJobsStorage);
  return storageConfig.AccountName;
};
