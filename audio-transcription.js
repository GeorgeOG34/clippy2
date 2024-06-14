import {handleVoiceResponse} from "./voice-recording.js";
import {debounce} from "./utils.js";

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
    if (type === MessageTypes.INFERENCE_DONE) {
      await handleVoiceResponse(event);
    }

  };
  return worker;
}

export async function transcribeAudio(audioData) {
  const model_name = `Xenova/whisper-base.en`;

  WORKER.postMessage({
    type: MessageTypes.INFERENCE_REQUEST,
    audio: audioData,
    model_name,
  });
}
