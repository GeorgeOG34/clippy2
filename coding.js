import { getCodeResponse } from "./apis.js";
import {showResponse} from "./renderer.js";
const { clipboard } = require('electron');

export async function handleGenerateRequest(request) {
  let response = await getCodeResponse(request);
  clipboard.writeText(response);

  // TODO tell user you did something
  showResponse("Added to your clipboard!");
}
