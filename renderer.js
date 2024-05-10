/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
import {getScreenshotAsBase64} from "./screen-reader.js";
import {getImageChatResponse} from "./apis.js";
import {startRecording} from "./voice-recording.js";

// START   POSITION
async function onStartup() {
  // startRecording();
  screenshotAndRespond();
  // window.setInterval(startRecording, 60000);
  window.setInterval(screenshotAndRespond, 30000);
}

onStartup();


async function screenshotAndRespond() {
  const screenshotAsBase64 = await getScreenshotAsBase64();

  const response = await getImageChatResponse(screenshotAsBase64);

  showResponse(response.response.replace("\" ", "").replace(" \"", ""));
}

export function showResponse(response) {
  console.log(response);
  document.getElementsByClassName("popup")[0].innerHTML = response;
}
