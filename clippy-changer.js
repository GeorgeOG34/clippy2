export function clippyRecording(){
  setClippy("-green")
}
export function clippyReading(){
  setClippy("-purple")
}
export function clippyProcessing(){
  setClippy("")
}

function setClippy(variant) {
  let clippy = document.getElementById("clippy");
  clippy.src = `./Clippyicon${variant}.png`

}
