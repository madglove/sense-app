// app/js/cameraManager.js
(function() {
  let currentStream = null;
  let uiInitialized = false;

  // Create the camera UI inside the #cameraView div
  function createCameraUI() {
    const cameraView = document.getElementById('cameraView');
    console.log('[CameraManager] Creating camera UI...');
    cameraView.innerHTML = '';
    cameraView.style.display = 'block';

    // Create the Start Streaming button
    const startBtn = document.createElement('button');
    startBtn.id = 'startBtn';
    startBtn.textContent = 'Start Streaming';
    startBtn.className = 'btn btn-success me-2';

    // Create the Stop Streaming button
    const stopBtn = document.createElement('button');
    stopBtn.id = 'stopBtn';
    stopBtn.textContent = 'Stop Streaming';
    stopBtn.className = 'btn btn-danger';

    // Create the video element to display the camera feed
    const videoElem = document.createElement('video');
    videoElem.id = 'cameraVideo';
    videoElem.width = 640;
    videoElem.height = 480;
    videoElem.autoplay = true;
    videoElem.playsInline = true;
    videoElem.style.backgroundColor = '#000';
    videoElem.className = 'mt-3';

    // Append the elements to the camera view
    cameraView.appendChild(startBtn);
    cameraView.appendChild(stopBtn);
    cameraView.appendChild(videoElem);

    // Attach event listeners
    startBtn.addEventListener('click', startStream);
    stopBtn.addEventListener('click', stopStream);

    uiInitialized = true;
    console.log('[CameraManager] UI created successfully.');
  }

  // Start streaming using the default camera
  async function startStream() {
    console.log('[CameraManager] Start streaming requested.');
    stopStream(); // Stop any existing stream

    const videoElem = document.getElementById('cameraVideo');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      currentStream = stream;
      videoElem.srcObject = stream;
      console.log('[CameraManager] Streaming started.');
    } catch (err) {
      console.error('[CameraManager] Error accessing camera:', err);
      alert('Error accessing camera: ' + err.message);
    }
  }

  // Stop the current camera stream
  function stopStream() {
    console.log('[CameraManager] Stop streaming requested.');
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
        console.log('[CameraManager] Stopped track:', track);
      });
      currentStream = null;
      const videoElem = document.getElementById('cameraVideo');
      if (videoElem) {
        videoElem.srcObject = null;
        console.log('[CameraManager] Cleared video element source.');
      }
    } else {
      console.log('[CameraManager] No active stream to stop.');
    }
  }

  // Use a MutationObserver to monitor #cameraView visibility changes
  document.addEventListener('DOMContentLoaded', () => {
    const cameraView = document.getElementById('cameraView');
    console.log('[CameraManager] DOM content loaded. Setting up MutationObserver for cameraView...');
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'style') {
          const computedStyle = window.getComputedStyle(cameraView);
          console.log('[CameraManager] Camera view style changed. Current display:', computedStyle.display);
          if (computedStyle.display !== 'none') {
            if (!uiInitialized) {
              console.log('[CameraManager] Camera view is visible and UI not initialized. Creating UI...');
              createCameraUI();
            } else {
              console.log('[CameraManager] Camera view is visible and UI already initialized.');
            }
          } else {
            console.log('[CameraManager] Camera view is hidden. Stopping any active stream.');
            stopStream();
          }
        }
      });
    });
    observer.observe(cameraView, { attributes: true, attributeFilter: ['style'] });
  });
})();
