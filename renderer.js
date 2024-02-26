/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
document.getElementById("popup1").innerHTML = "yo";

document.getElementById("popup1").innerHTML = "2";

// const { writeFile } = require('fs');

import { handleFormSubmission } from "./whisper-based-transcription.js";



async function selectSource() {
  const constraints = {
    audio: true,
    video: false
  }
  // Create a Stream

  const stream = await navigator.mediaDevices
    .getUserMedia(constraints);
  console.log(stream)
  console.log(await navigator.mediaDevices)
  // Preview the source in a video element
  // Create the Media Recorder
  mediaRecorder = new MediaRecorder(stream);
  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
  // Updates the UI

}

 //TODO https://github.com/fireship-io/223-electron-screen-recorder/blob/master/src/render.js

// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];



let recording = false;

const startBtn = document.getElementsByClassName('popup')[0];

startRecording();
window.setInterval(startRecording, 60000);

async function startRecording() {
  if(!recording){
    await selectSource();
    mediaRecorder.start();
    // startBtn.innerText = 'Recording';
    window.setTimeout(stopRecording, 10000);
  }
}

async function stopRecording() {
  mediaRecorder.stop();
  // startBtn.innerText = 'Ended';
  recording = false;
}

startBtn.addEventListener("click",  async  e => {

});




// Get the available video sources

// Change the videoSource window to record

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: "audio/ogg; codecs=opus"
  });

  await handleFormSubmission(blob);

}