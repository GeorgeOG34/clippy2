/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
//  */
import {startRecording} from "./voice-recording.js";
import {debounce} from "./utils.js";

// START   POSITION
startRecording();


export function showResponse(response) {
  console.log(response);
  document.getElementsByClassName("popup")[0].innerHTML = response;

  debounce(startRecording)();
}

