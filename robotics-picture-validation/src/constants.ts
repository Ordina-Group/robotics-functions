const BYTE = 1;
const KBYTE = 1024 * BYTE;
export const MBYTE = 1024 * KBYTE;

export const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png"];
export const MAX_FILE_SIZE = 6 * MBYTE;

export const DEFAULT_STORAGE_ACCOUNT_NAME = "stroboticsjohnny58314";

export const REQUIRED_ENV_VARIABLES = [
  "AzureWebJobsStorage",
  "COGNITIVE_API_KEY",
  "COGNITIVE_API_URL",
  "STORAGE_CONTAINER_NAME",
];
