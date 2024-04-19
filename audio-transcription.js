import {handleVoiceResponse} from "./voice-recording";

const MessageTypes = {
  DOWNLOADING: "DOWNLOADING",
  LOADING: "LOADING",
  RESULT: "RESULT",
  RESULT_PARTIAL: "RESULT_PARTIAL",
  INFERENCE_REQUEST: "INFERENCE_REQUEST",
  INFERENCE_DONE: "INFERENCE_DONE",
};

/** Web worker **/
let WORKER;

document.addEventListener("DOMContentLoaded", function() {
  WORKER = createWorker();
});

function createWorker() {
  const worker = new Worker("./whisper.worker.js", { type: "module" });
  worker.onmessage = async (event) => {
    const {type} = event.data;
    if (type === MessageTypes.RESULT) {
      await handleVoiceResponse(event)
    }

  };
  return worker;
}

export async function transcribeAudio(audioData) {
  const model_name = `Xenova/whisper-tiny.en`;

  WORKER.postMessage({
    type: MessageTypes.INFERENCE_REQUEST,
    audioData,
    model_name,
  });
}
