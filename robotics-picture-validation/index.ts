import { AzureFunction } from "@azure/functions";
import { uploadAndValidatePicture } from "./src/upload-and-validate";

const httpTrigger: AzureFunction = uploadAndValidatePicture;

export default httpTrigger;
