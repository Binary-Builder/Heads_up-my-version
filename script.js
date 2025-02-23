const wordDisplay = document.getElementById('word-display');
const startButton = document.getElementById('start-game');
const videoElement = document.getElementById('camera');
const downloadLink = document.getElementById('download');
const themeSelect = document.getElementById('theme');

const themes = {
    animals: ["Lion", "Tiger", "Elephant", "Giraffe", "Zebra"],
    actions: ["Jumping", "Running", "Dancing", "Singing", "Swimming"],
    bollywood: ["Sholay", "Dhoom", "Kabir Singh", "Dilwale", "Krrish"]
};

let selectedTheme = "animals"; // Default theme
let words = themes[selectedTheme];
let wordIndex = 0;
let gameActive = false;
let mediaRecorder;
let recordedChunks = [];
let stream;

// Handle theme selection
themeSelect.addEventListener("change", function () {
    selectedTheme = this.value;
    words = themes[selectedTheme];
    wordIndex = 0;
});

// Function to get the next word
function getNextWord() {
    if (wordIndex >= words.length) {
        wordDisplay.textContent = 'Game Over!';
        stopGame();
        return;
    }
    wordDisplay.textContent = words[wordIndex++];
}

// Tilt detection (Up = Correct, Down = Pass)
window.addEventListener("deviceorientation", (event) => {
    if (!gameActive) return;

    if (event.beta > 60) { // Tilt Up (Correct Answer)
        getNextWord();
    } else if (event.beta < -30) { // Tilt Down (Pass)
        getNextWord();
    }
});

// Function to start the game
startButton.addEventListener("click", async function () {
    if (gameActive) return;
    
    gameActive = true;
    wordIndex = 0;
    getNextWord();

    // Start camera
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoElement.srcObject = stream;
        startRecording(stream);
    } catch (err) {
        console.error("Camera access denied:", err);
        alert("Allow camera access to play!");
        return;
    }

    // Auto-stop the game after 20 seconds
    setTimeout(stopGame, 20000);
});

// Function to start recording
function startRecording(stream) {
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => recordedChunks.push(event.data);
    mediaRecorder.onstop = () => {
        let blob = new Blob(recordedChunks, { type: "video/mp4" });
        let url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "charades_video.mp4";
        downloadLink.style.display = "block";
    };

    mediaRecorder.start();
}

// Function to stop the game & recording
function stopGame() {
    gameActive = false;
    wordDisplay.textContent = "Game Over!";
    
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// Request permission for motion sensors (iOS 13+ and some Androids)
if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
        .then(permissionState => {
            if (permissionState === "granted") {
                console.log("Motion access granted!");
            }
        })
        .catch(console.error);
}
