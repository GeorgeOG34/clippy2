
let lastUrl;
let lastWindow;

export function setLastUrl(url) {
  lastUrl = url;
}

export function openLastUrl() {
  console.log("Opened: " + lastUrl)
  lastWindow = window.open(lastUrl, '_blank', 'top=500,left=200,frame=false,nodeIntegration=no')
}

export function closeLastUrl() {
  console.log("Closed: " + lastWindow)
  if (lastWindow) {
    lastWindow.close();
    lastWindow = undefined;
  }
}

