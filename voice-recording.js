import {handleFormSubmission} from "./whisper-based-transcription";


// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];



let recording = false;



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