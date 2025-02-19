// app/js/cameraManager.js

// Global variables for camera management
let cameraVideoElement = null;
let cameraStream = null;
let currentCameraId = null;
let videoDevices = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Assume the cameraView div is already in the DOM.
  cameraVideoElement = document.getElementById('cameraVideo');
  const cameraSelect = document.getElementById('cameraSelect');

  // Populate the camera dropdown
  videoDevices = await getVideoDevices();
  cameraSelect.innerHTML = '';
  videoDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label || `Camera ${index + 1}`;
    cameraSelect.appendChild(option);
  });
  // Set currentCameraId to the first available device if any.
  if (videoDevices.length > 0) {
    currentCameraId = videoDevices[0].deviceId;
    cameraSelect.value = currentCameraId;
  }

  // Attach event listeners to buttons
  document.getElementById('btnStartStreaming').addEventListener('click', () => {
    currentCameraId = cameraSelect.value;
    startCamera(currentCameraId);
  });
  document.getElementById('btnStopStreaming').addEventListener('click', stopCamera);
  document.getElementById('btnSwitchCamera').addEventListener('click', switchCamera);
  document.getElementById('btnToggleHandTracking').addEventListener('click', () => {
    if (window.toggleHandTracking) {
      window.toggleHandTracking();
    } else {
      console.error('toggleHandTracking is not available');
    }
  });
});

// Retrieve available video input devices
async function getVideoDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'videoinput');
}

// Start streaming from the specified (or default) camera
async function startCamera(deviceId = null) {
  if (!cameraVideoElement) {
    cameraVideoElement = document.getElementById('cameraVideo');
    if (!cameraVideoElement) {
      console.error('Camera video element not found');
      return;
    }
  }
  if (!deviceId) {
    if (currentCameraId) {
      deviceId = currentCameraId;
    } else {
      const devices = await getVideoDevices();
      if (devices.length > 0) {
        deviceId = devices[0].deviceId;
      } else {
        console.error('No video devices found');
        return;
      }
    }
  }
  currentCameraId = deviceId;

  // Stop any existing stream
  if (cameraStream) {
    stopCamera();
  }

  try {
    const constraints = { video: { deviceId: { exact: deviceId } }, audio: false };
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraVideoElement.srcObject = cameraStream;
    cameraVideoElement.style.display = 'block';
    await cameraVideoElement.play();
    console.log('Camera started with device:', deviceId);
  } catch (error) {
    console.error('Error accessing the camera:', error);
    const errorMessageElement = document.getElementById('cameraErrorMessage');
    if (errorMessageElement) {
      errorMessageElement.textContent = 'Error accessing the camera: ' + error.message;
      errorMessageElement.style.display = 'block';
    }
  }
}

// Stop the current video stream
function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if (cameraVideoElement) {
    cameraVideoElement.srcObject = null;
    cameraVideoElement.style.display = 'none';
  }
  // Also stop hand tracking if running
  if (window.stopHandTracking) {
    window.stopHandTracking();
  }
  console.log('Camera stopped');
}

// Switch to the next available camera
async function switchCamera() {
  const devices = await getVideoDevices();
  if (devices.length <= 1) {
    console.warn('No alternative cameras found');
    return;
  }
  let currentIndex = devices.findIndex(device => device.deviceId === currentCameraId);
  let nextIndex = (currentIndex + 1) % devices.length;
  const nextDeviceId = devices[nextIndex].deviceId;
  console.log('Switching camera to device:', nextDeviceId);
  // Update the dropdown selection
  const cameraSelect = document.getElementById('cameraSelect');
  if (cameraSelect) {
    cameraSelect.value = nextDeviceId;
  }
  await startCamera(nextDeviceId);
}

window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.switchCamera = switchCamera;
