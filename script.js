const wordDisplay = document.getElementById('word-display');
const startButton = document.getElementById('start-game');
const stopButton = document.getElementById('stop-game');
const videoElement = document.getElementById('camera');
const downloadLink = document.getElementById('download');
let currentWord = '';
const words = ['Elephant', 'Dancing', 'Superman', 'Basketball', 'Singing'];
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