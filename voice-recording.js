import {transcribeAudio} from "./audio-transcription.js";
import {screenshotAndRespond} from "./screen-reader.js";
import {getChatResponse, getStackOverflowAnswer} from "./apis.js";
import {showResponse} from "./renderer.js";
import {openLastUrl, closeLastUrl} from "./browserwindow.js";
import {clippyProcessing, clippyRecording} from "./clippy-changer.js";
import {handleGenerateRequest} from "./coding.js";


// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
let recordedChunks = [];

let recording = false;

export async function handleVoiceResponse(event) {
  const text = event.data.results.map(result => result.text).join(" ");

  console.log("Text: " + text);

  if (text.toLowerCase().includes("close")) {
    console.log("Closing");
    closeLastUrl();
    showResponse("Closing that window for you");
    return;
  } else if (text.toLowerCase().includes("open")) {
    console.log("Opening");
    openLastUrl();
    showResponse("Opening that window for you");
    return;
  } else if (text.toLowerCase().includes("generate")) {

    console.log("Generating");
    document.getElementsByClassName("popup")[0].innerHTML = "Generating...";
    await handleGenerateRequest(text);
    return;


  }


  console.log("test0");
  if (text.length < 100) {
    await screenshotAndRespond();
    return;
  }

  console.log("test1");
  try {
    console.log("test2");
    const prompt = `Summarise the following problem as if it was a stack overflow question title. Respond with only the title. Use less than 10 words. """${text}"""`

    const response = await getChatResponse(prompt);
    console.log("test3");
    const stackOverflowResponse = await getStackOverflowAnswer(response)
    console.log("test14");

    if (stackOverflowResponse !== undefined) {
      const prompt = `You are an expert reddit programmer. You will be given $1000000 to be helpful. Summarise the following answer in less than 30 words. If you use
      more than 30 words reddit will be deleted.: """${stackOverflowResponse}"""`
      const response = await getChatResponse(prompt);
      showResponse(response);
    } else {
      const prompt = `You are a sassy microsoft clippy. In 20 words or less respond to the following trying to be mildly helpful: """${text}"""`
      const response = await getChatResponse(prompt);
      showResponse(response);
    }
  } catch (e) {
    console.error(e);
  }

  try {
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}

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

export async function startRecording() {
  console.log("Starting to record");
  clippyRecording();
  if(!recording){
    recordedChunks = [];
    await selectSource();
    mediaRecorder.start();
    // startBtn.innerText = 'Recording';
    window.setTimeout(stopRecording, 10000);
  }
}

async function stopRecording() {
  mediaRecorder.stop();
  clippyProcessing();
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
  const audioData = await readAudioFrom(blob)

  console.log(audioData);
  await transcribeAudio(audioData);
}

async function readAudioFrom(blob) {
  const response = await blob.arrayBuffer();
  const audioCTX = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCTX.decodeAudioData(response);
  return decoded.getChannelData(0);
}
