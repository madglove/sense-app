// app/js/handTracking.js
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker;
let canvasElement;
let canvasCtx;
let animationFrameId = null;
let handTrackingEnabled = false;

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 2
  });
  console.log('HandLandmarker initialized');
};

export async function startHandTracking() {
  // Use the same video and canvas elements
  const videoElement = document.getElementById('cameraVideo');
  canvasElement = document.getElementById('outputCanvas');
  if (!videoElement || !canvasElement) {
    console.error('Required video or canvas element not found');
    return;
  }
  canvasCtx = canvasElement.getContext('2d');
  
  // Wait for video metadata if not yet available
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    await new Promise(resolve => {
      videoElement.onloadedmetadata = resolve;
    });
  }
  // Ensure canvas size matches video dimensions
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  
  if (!handLandmarker) await createHandLandmarker();
  
  handTrackingEnabled = true;
  predictWebcam();
  console.log('Hand tracking started');
}

function predictWebcam() {
  const videoElement = document.getElementById('cameraVideo');
  const processFrame = () => {
    if (!handTrackingEnabled || !handLandmarker) return;
    // Clear the canvas and draw the current video frame
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    const results = handLandmarker.detectForVideo(videoElement, performance.now());
    if (results.landmarks) {
      results.landmarks.forEach((landmarks) => {
        // drawConnectors, drawLandmarks, and HAND_CONNECTIONS are provided by MediaPipe drawing_utils.js
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
      });
    }
    animationFrameId = requestAnimationFrame(processFrame);
  };
  processFrame();
}

export function stopHandTracking() {
  handTrackingEnabled = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (canvasCtx && canvasElement) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
  console.log('Hand tracking stopped');
}

export function toggleHandTracking() {
  const btn = document.getElementById('btnToggleHandTracking');
  if (handTrackingEnabled) {
    stopHandTracking();
    btn.innerText = 'Enable Hand Tracking';
  } else {
    startHandTracking();
    btn.innerText = 'Disable Hand Tracking';
  }
}

window.startHandTracking = startHandTracking;
window.stopHandTracking = stopHandTracking;
window.toggleHandTracking = toggleHandTracking;
