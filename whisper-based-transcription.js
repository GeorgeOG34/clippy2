

const MessageTypes = {
  DOWNLOADING: "DOWNLOADING",
  LOADING: "LOADING",
  RESULT: "RESULT",
  RESULT_PARTIAL: "RESULT_PARTIAL",
  INFERENCE_REQUEST: "INFERENCE_REQUEST",
  INFERENCE_DONE: "INFERENCE_DONE",
};

const LoadingStatus = {
  SUCCESS: "success",
  ERROR: "error",
  LOADING: "loading",
};
const ModelNames = {
  WHISPER_TINY_EN: "openai/whisper-tiny.en",
  WHISPER_TINY: "openai/whisper-tiny",
  WHISPER_BASE: "openai/whisper-base",
  WHISPER_BASE_EN: "openai/whisper-base.en",
  WHISPER_SMALL: "openai/whisper-small",
  WHISPER_SMALL_EN: "openai/whisper-small.en",
};

/** contants **/
const HIDDEN_CLASS = "d-none";
const GENERATED_TEXT_CLASS = "generated_text";
const START_TIME_ATTR = "data-timestamp-start";
const END_TIME_ATTR = "data-timestamp-end";

/** Form UI elements **/
const FILE_UPLOAD_BTN = document.getElementById("file-input");
const FORM_CONTAINER = document.getElementById("form-container");
const FORM_SUBMIT_BTN = document.getElementById("form-submit-btn");
const MODEL_NAME_SELECTION_INPUT = document.getElementById("model-name-input");

/** Transcription UI elements **/
const VIDEO_PLAYER = document.getElementById("video-player");
const RESULTS_CONTAINER = document.getElementById("results-container");
const PARTIAL_RESULTS_CONTAINER = document.getElementById(
  "partial-results-container"
);
const TRANSCRIPT_CONTAINER = document.getElementById("transcription-container");
const DOWNLOAD_TRANSCRIPT_BTN = document.getElementById(
  "download-results-as-csv-btn"
);
const CLOSE_TRANSCRIPT_BTN = document.getElementById(
  "close-transcription-container-btn"
);
const PROGRESS_BAR = document.getElementById("transcription-progress-bar");
const PROGRESS_BAR_CONTAINER = document.getElementById(
  "transcription-progress-bar-container"
);
const MODEL_NAME_DISPLAY = document.getElementById("model-name-display");
const LOADING_SPINNER_CONTAINER = document.getElementById(
  "loading-spinner-container"
);
const LOADING_MESSAGE_CONTAINER = document.getElementById(
  "loading-message-container"
);

/** Web worker **/
let WORKER;

document.addEventListener("DOMContentLoaded", function() {
  WORKER = createWorker();
});

function createWorker() {
  const worker = new Worker("./whisper.worker.js", { type: "module" });
  worker.onmessage = async (event) => {
    const {type} = event.data;
    if (type === MessageTypes.LOADING) {
      handleLoadingMessage(event.data);
    }
    if (type === MessageTypes.DOWNLOADING) {
      LOADING_MESSAGE_CONTAINER.innerHTML = "Downloading model...";
    }
    if (type === MessageTypes.RESULT) {
      const text = event.data.results.map(result => result.text).join(" ");
      try {
        const prompt = `You are a sassy microsoft clippy. In 20 words or less respond to the following trying to be mildly helpful: """${text}"""`

        const response = await (await fetch("http://localhost:11434/api/chat", {method: "POST", body: JSON.stringify({
            model: 'gemma:7b',
            messages: [{ role: 'user', content: prompt }],
            stream: false,
          })})).json();

        console.log(response)
        console.log(response.message.content)
        document.getElementsByClassName("popup")[0].innerHTML = response.message.content;
      } catch (e) {
        console.error(e);
      }

      try {
        console.log(text);
      } catch (e) {
        console.error(e);}
    }
    if (type === MessageTypes.RESULT_PARTIAL) {
      handlePartialResultMessage(event.data);
    }
    if (type === MessageTypes.INFERENCE_DONE) {
      handleInferenceDone(event.data);
    }
  };
  return worker;
}

function onFormInputChanges() {
  if (isFileUploaded() && isModelNameSelected()) {
    FORM_SUBMIT_BTN.disabled = false;
  }
  else {
    FORM_SUBMIT_BTN.disabled = true;
  }
}

function highlightCurrentChunk(currentTime) {
  const activeClassName = "chunk-span-active";
  const spans = document.getElementsByClassName(GENERATED_TEXT_CLASS);

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const start = parseFloat(span.getAttribute(START_TIME_ATTR));
    const end = parseFloat(span.getAttribute(END_TIME_ATTR));

    if (currentTime >= start && currentTime <= end) {
      span.classList.add(activeClassName);
    }
    else {
      span.classList.remove(activeClassName);
    }
  }
}

function handleLoadingMessage(data) {
  const {status} = event.data;
  showElement(LOADING_SPINNER_CONTAINER);
  showElement(LOADING_MESSAGE_CONTAINER);
  if (status === LoadingStatus.SUCCESS) {
    LOADING_MESSAGE_CONTAINER.innerHTML =
      "Model loaded successfully. Starting transcription...";
  }
  if (status === LoadingStatus.ERROR) {
    LOADING_MESSAGE_CONTAINER.innerHTML =
      "Oops! Something went wrong. Please refresh the page and try again.";
  }
  if (status === LoadingStatus.LOADING) {
    LOADING_MESSAGE_CONTAINER.innerHTML = "Loading model into memory...";
  }
}

function handlePartialResultMessage(data) {
  hideElement(LOADING_SPINNER_CONTAINER);
  hideElement(LOADING_MESSAGE_CONTAINER);

  const {result} = data;
  const resultElement = createResultLine(result, false);
  PARTIAL_RESULTS_CONTAINER.innerHTML = "";
  PARTIAL_RESULTS_CONTAINER.appendChild(resultElement);
}


function handleResultMessage(data) {
  const {results, completedUntilTimestamp} = data;
  // replace changed elements
  results
    .slice(0, RESULTS_CONTAINER.children.length)
    .forEach((result, index) => {
      const element = RESULTS_CONTAINER.children[index];
      if (hasResultChanged(result, element)) {
        RESULTS_CONTAINER.replaceChild(createResultLine(result, true), element);
      }
    });
  // add new elements
  results.slice(RESULTS_CONTAINER.children.length).forEach((result) => {
    RESULTS_CONTAINER.appendChild(createResultLine(result, true));
  });

  // Partial result are now in their own element
  PARTIAL_RESULTS_CONTAINER.innerHTML = "";

  // update progress bar
  const totalDuration = VIDEO_PLAYER.duration;
  const progress = (completedUntilTimestamp / totalDuration) * 100;
  setProgressBarTo(progress);
}

function hasResultChanged(result, element) {
  const start = parseInt(element.getAttribute(START_TIME_ATTR));
  const end = parseInt(element.getAttribute(END_TIME_ATTR));
  const text = element.innerText;
  return text !== result.text || start !== result.start || end !== result.end;
}

function handleInferenceDone(data) {
  DOWNLOAD_TRANSCRIPT_BTN.disabled = false;
  setProgressBarTo(100);

  // wait for 1 second then hide the progress bar
  setTimeout(() => {
    hideElement(PROGRESS_BAR_CONTAINER);
  }, 1000);
}

function createResultLine(result, isDone) {
  const {start, end, text} = result;

  const span = document.createElement("span");
  span.innerText = text;
  span.onclick = () => jumpVideoToTime(start);
  span.setAttribute("class", GENERATED_TEXT_CLASS);
  span.setAttribute(START_TIME_ATTR, `${start}`);
  span.setAttribute(END_TIME_ATTR, `${end}`);

  // no tooltip for partial results since they change to often
  // which can result in orphaned tooltips
  if (isDone) {
    span.setAttribute("data-bs-toggle", "tooltip");
    span.setAttribute("data-bs-placement", "top");
    span.setAttribute("title", `${start} - ${end}`);
    new Tooltip(span);
  }

  return span;
}

export async function handleFormSubmission(blob) {
  const model_name = `Xenova/whisper-tiny.en`;
  const audio = await readAudioFrom(blob);

  WORKER.postMessage({
    type: MessageTypes.INFERENCE_REQUEST,
    audio,
    model_name,
  });
}

async function readAudioFrom(blob) {
  const response = await blob.arrayBuffer();
  const audioCTX = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCTX.decodeAudioData(response);
  const audio = decoded.getChannelData(0);
  return audio;
}

function showFormView() {
  VIDEO_PLAYER.pause();
  hideElement(TRANSCRIPT_CONTAINER);
  showElement(FORM_CONTAINER);
  WORKER.terminate();
  WORKER = createWorker();
}

function isFileUploaded() {
  if (FILE_UPLOAD_BTN.files.length === 0) {
    return false;
  }
  //TODO: check if file is valid
  return true;
}

function isModelNameSelected() {
  const selectedValue = MODEL_NAME_SELECTION_INPUT.value;

  if (MODEL_NAME_SELECTION_INPUT.value === "") {
    return false;
  }
  const modelName = `openai/${selectedValue}`;
  return Object.values(ModelNames).indexOf(modelName) !== -1;
}

function hideElement(element) {
  if (!element.classList.contains(HIDDEN_CLASS)) {
    element.classList.add(HIDDEN_CLASS);
  }
}

function showElement(element) {
  if (element.classList.contains(HIDDEN_CLASS)) {
    element.classList.remove(HIDDEN_CLASS);
  }
}

function jumpVideoToTime(startTime) {
  if (FILE_UPLOAD_BTN.length === 0) {
    return;
  }
  VIDEO_PLAYER.currentTime = startTime;
  VIDEO_PLAYER.play();
  VIDEO_PLAYER.focus();
}

function setProgressBarTo(progress) {
  PROGRESS_BAR.style.width = `${progress}%`;
  PROGRESS_BAR.innerText = `${Math.round(progress)}%`;
  PROGRESS_BAR.setAttribute("aria-valuenow", `${Math.round(progress)}`);
}

function downloadTranscript() {
  if (!isFileUploaded()) {
    return;
  }

  const headers = ["start", "end", "text"];
  const data = [];
  const spans = document.getElementsByClassName(GENERATED_TEXT_CLASS);
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const start = parseFloat(span.getAttribute(START_TIME_ATTR));
    const end = parseFloat(span.getAttribute(END_TIME_ATTR));
    const text = span.innerText;
    data.push({start, end, text});
  }
  const fileName = replaceFileExtension(FILE_UPLOAD_BTN.files[0].name, ".csv");
  downloadAsCSV(headers, data, fileName);
}

function downloadAsCSV(headers, data, fileName) {
  const csvDataRows = data.map((row) =>
    headers.map((key) => `"${row[key]}"`).join(",")
  );
  const dataString = headers.join(",") + "\n" + csvDataRows.join("\n");
  const blob = new Blob([dataString], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function replaceFileExtension(fileName, newExtension) {
  let pos = fileName.lastIndexOf(".");
  return fileName.slice(0, pos < 0 ? fileName.length : pos) + newExtension;
}