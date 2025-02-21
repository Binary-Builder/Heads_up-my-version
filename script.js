const wordDisplay = document.getElementById('word-display');
const startButton = document.getElementById('start-game');
const stopButton = document.getElementById('stop-game');
const videoElement = document.getElementById('camera');
const downloadLink = document.getElementById('download');
let currentWord = '';
const words = ['Squirrel', 'DDLJ', 'Superman', 'Basketball', 'kARAOKE'];
let wordIndex = 0;
function getNextWord() {
    if (wordIndex >= words.length) {
        wordDisplay.textContent = 'Game Over!';
        return;
    }
    currentWord = words[wordIndex++];
    wordDisplay.textContent = currentWord;
}
window.addEventListener('deviceorientation', (event) => {
    if (event.beta > 60) { // Tilt Up (Correct Answer)
        getNextWord();
    } else if (event.beta < -30) { // Tilt Down (Pass)
        getNextWord();
    }
});
let mediaRecorder;
let recordedChunks = [];
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
      videoElement.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => recordedChunks.push(event.data);
      mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          downloadLink.href = url;
          downloadLink.download = 'charades.mp4';
          downloadLink.style.display = 'block';
      };
  });
startButton.addEventListener('click', () => {
    getNextWord();
    mediaRecorder.start();
    stopButton.disabled = false;
});
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    stopButton.disabled = true;
});
// Request permission for motion sensors (needed for iOS 13+ and some Androids)
if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
        .then(permissionState => {
            if (permissionState === "granted") {
                console.log("Motion access granted!");
            }
        })
        .catch(console.error);
}
async function requestCameraAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('videoElement').srcObject = stream;
        console.log("Camera access granted!");
    } catch (error) {
        console.error("Camera access denied:", error);
        alert("Please enable camera access in browser settings.");
    }
}

// Call this function when the game starts
requestCameraAccess();
