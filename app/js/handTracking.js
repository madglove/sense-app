// app/js/handTracking.js
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker;
let animationFrameId = null;
let handTrackingEnabled = false;
let canvasElement, canvasCtx;

// Initialize the hand landmarker model.
async function createHandLandmarker() {
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
  console.log("HandLandmarker initialized");
}

// Start hand tracking.
export async function startHandTracking() {
  const videoElement = document.querySelector("#cameraView video");
  if (!videoElement) {
    console.error("No video element found in cameraView");
    return;
  }
  if (!videoElement.id) {
    videoElement.id = "cameraVideo";
  }
  
  // Ensure the container is relatively positioned.
  const cameraView = document.getElementById("cameraView");
  cameraView.style.position = "relative";
  
  // Create (or retrieve) the canvas and align it over the video.
  canvasElement = cameraView.querySelector("canvas#outputCanvas");
  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasElement.id = "outputCanvas";
    canvasElement.style.position = "absolute";
    // Position the canvas based on the video's offset inside cameraView.
    canvasElement.style.top = videoElement.offsetTop + "px";
    canvasElement.style.left = videoElement.offsetLeft + "px";
    canvasElement.style.pointerEvents = "none"; // Allow clicks to pass through.
    cameraView.appendChild(canvasElement);
  }
  canvasCtx = canvasElement.getContext("2d");

  // Wait until video metadata is loaded.
  if (!videoElement.videoWidth) {
    await new Promise(resolve => {
      videoElement.onloadedmetadata = resolve;
    });
  }
  
  // Use the displayed size of the video for the canvas dimensions.
  const videoRect = videoElement.getBoundingClientRect();
  canvasElement.width = videoRect.width;
  canvasElement.height = videoRect.height;

  // Initialize the hand landmarker if not already done.
  if (!handLandmarker) {
    await createHandLandmarker();
  }

  handTrackingEnabled = true;
  processVideoFrame();
  console.log("Hand tracking started");
}

// Process each video frame.
function processVideoFrame() {
  const videoElement = document.getElementById("cameraVideo");
  if (!handTrackingEnabled || !handLandmarker) return;
  
  // Update canvas size and alignment in case of dynamic layout changes.
  const videoRect = videoElement.getBoundingClientRect();
  canvasElement.width = videoRect.width;
  canvasElement.height = videoRect.height;
  // Ensure the canvas overlays the video correctly.
  canvasElement.style.top = videoElement.offsetTop + "px";
  canvasElement.style.left = videoElement.offsetLeft + "px";
  
  // Clear previous drawings.
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  // Process the current video frame.
  const results = handLandmarker.detectForVideo(videoElement, performance.now());
  if (results.landmarks) {
    results.landmarks.forEach(landmarks => {
      // Draw connectors and landmarks using MediaPipe drawing utils.
      if (typeof drawConnectors === "function" && typeof drawLandmarks === "function" && typeof HAND_CONNECTIONS !== "undefined") {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      } else {
        // Fallback: draw simple dots if drawing functions aren't available.
        canvasCtx.fillStyle = "red";
        landmarks.forEach(landmark => {
          const x = landmark.x * canvasElement.width;
          const y = landmark.y * canvasElement.height;
          canvasCtx.beginPath();
          canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
          canvasCtx.fill();
        });
      }
    });
  }
  animationFrameId = requestAnimationFrame(processVideoFrame);
}

// Stop hand tracking.
export function stopHandTracking() {
  handTrackingEnabled = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (canvasCtx && canvasElement) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
  console.log("Hand tracking stopped");
}

// Toggle tracking and update the button style.
export function toggleHandTracking() {
  const btn = document.getElementById("btnToggleHandTracking");
  if (handTrackingEnabled) {
    stopHandTracking();
    if (btn) {
      btn.innerText = "Enable Hand Tracking";
      btn.classList.remove("btn-success");
      btn.classList.add("btn-secondary");
    }
  } else {
    startHandTracking();
    if (btn) {
      btn.innerText = "Disable Hand Tracking";
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-success");
    }
  }
}

// Add the detect-hand button when the video element is added.
function addDetectHandButtonObserver() {
  const cameraView = document.getElementById("cameraView");
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === "VIDEO") {
            if (!cameraView.querySelector("#btnToggleHandTracking")) {
              const btn = document.createElement("button");
              btn.id = "btnToggleHandTracking";
              btn.textContent = "Enable Hand Tracking";
              btn.classList.add("btn", "btn-secondary", "w-100", "mt-2");
              btn.addEventListener("click", toggleHandTracking);
              cameraView.appendChild(btn);
            }
          }
        });
      }
    });
  });
  observer.observe(cameraView, { childList: true });
}

document.addEventListener("DOMContentLoaded", () => {
  addDetectHandButtonObserver();
});
