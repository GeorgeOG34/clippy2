

export async function captureDesktop() {
  // const stream  = await navigator.mediaDevices.getDisplayMedia({video: { displaySurface: 'window' }})
  const stream  = await window.navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
       mandatory:{
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: "screen:0:0"
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

  const canvas = document.createElement('canvas')



  // this could be a document.createElement('canvas') if you want
  // draw weird image type to canvas so we can get a useful image
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const image = canvas.toDataURL("image/jpeg",).replace("data:image/jpeg;base64,", "")


 //
  // this turns the base 64 string to a [File] object
  // const res = await fetch(image)
  // const buff = await res.arrayBuffer();
  // clone so we can rename, and put into array for easy proccessing
  // const file = [
  //   new File([buff], `photo_${new Date()}.jpg`, {
  //     type: 'image/jpeg',
  //   }),
  // ]


  return image
}