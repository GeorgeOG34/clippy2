import {getImageChatResponse} from "./apis.js";
import {showResponse} from "./renderer.js";
import {clippyProcessing, clippyReading} from "./clippy-changer.js";

export async function screenshotAndRespond() {
  clippyReading()
  const screenshotAsBase64 = await getScreenshotAsBase64();

  const response = await getImageChatResponse(screenshotAsBase64);

  showResponse(response.response.replace("\" ", "").replace(" \"", ""));
}

async function getScreenshotAsBase64() {
  const bitmap = await captureDesktopBitmap();
  return convertToBase64(bitmap);
}


async function captureDesktopBitmap() {
  const stream  = await window.navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
       mandatory:{
        mediaSource: 'desktop',
        mediaSourceId: "screen:0:0"
      }
    }

  })
  console.log(stream);
  const track = stream.getVideoTracks()[0]
  // init Image Capture and not Video stream
  const imageCapture = new ImageCapture(track)
  // take first frame only
  const bitmap = await imageCapture.grabFrame()
  // destroy video track to prevent more recording / mem leak
  track.stop()


  return bitmap;
}

function convertToBase64(bitmap) {
  clippyProcessing();
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg",).replace("data:image/jpeg;base64,", "")
}
