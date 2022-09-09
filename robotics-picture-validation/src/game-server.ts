import fetch from "node-fetch";
import { FunctionConfig } from "./config";

type ValidationResult = {
  robotName: string;
  liveStream: string;
  isValidGuess: boolean;
  pictureUrl: string;
  config: FunctionConfig;
  logger: (message: string) => void;
};

export const postValidationResult = async ({
  robotName,
  liveStream,
  isValidGuess,
  pictureUrl,
  config,
  logger,
}: ValidationResult) => {
  if (config.gameServer.skipUpdate) {
    logger(
      `Skipped Game Server update because it's disabled in "config.gameServer.skipUpdate"`
    );
    return;
  }

  const params = [
    ["robotName", robotName],
    ["liveStream", liveStream],
    ["lastPhoto", pictureUrl],
    ["score", isValidGuess ? 1 : 0],
  ];
  const query = params.map((param) => param.join("=")).join("&");
  const url = `${config.gameServer.url}/updateRobot?${query}`;

  logger(`About to send an update to the Game Server: "POST ${url}"`);

  await fetch(url, { method: "POST" }).then((r) => {
    logger(`Game Server updated! ${r.status}`);
  });
};
