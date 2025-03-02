document.addEventListener('DOMContentLoaded', () => {
  const cameraView = document.getElementById('cameraView');

  if (!cameraView) {
      console.error("❌ Camera view container not found.");
      return;
  }

  // Create the "Start Camera" button
  const startCameraButton = document.createElement('button');
  startCameraButton.textContent = 'Start Camera';
  startCameraButton.classList.add('btn', 'btn-primary', 'w-100');
  cameraView.appendChild(startCameraButton);

  let videoStream = null;
  let availableCameras = [];
  let selectedCameraId = null;

  // Get list of available cameras
  async function getAvailableCameras() {
      try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          availableCameras = devices.filter(device => device.kind === 'videoinput');

          if (availableCameras.length === 0) {
              cameraView.innerHTML = '<p class="text-danger">No cameras detected.</p>';
              return;
          }

          populateCameraDropdown();
      } catch (error) {
          console.error('Error enumerating devices:', error);
          cameraView.innerHTML = '<p class="text-danger">Failed to access camera devices.</p>';
      }
  }

  // Populate camera dropdown if multiple cameras exist
  function populateCameraDropdown() {
      if (availableCameras.length > 1) {
          const cameraDropdown = document.createElement('select');
          cameraDropdown.classList.add('form-select', 'mb-2', 'w-100');

          availableCameras.forEach((camera, index) => {
              const option = document.createElement('option');
              option.value = camera.deviceId;
              option.textContent = camera.label || `Camera ${index + 1}`;
              cameraDropdown.appendChild(option);
          });

          cameraDropdown.addEventListener('change', (event) => {
              selectedCameraId = event.target.value;
          });

          cameraView.insertBefore(cameraDropdown, startCameraButton);
          selectedCameraId = availableCameras[0].deviceId;
      } else {
          selectedCameraId = availableCameras.length === 1 ? availableCameras[0].deviceId : null;
      }
  }

  // Start Camera Function
  async function startCamera() {
      try {
          const constraints = {
              video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          videoStream = stream;

          // Create video element
          const videoElement = document.createElement('video');
          videoElement.srcObject = stream;
          videoElement.autoplay = true;
          videoElement.classList.add('w-100', 'h-100');
          videoElement.style.objectFit = 'cover';

          // Clear previous content and show video
          cameraView.innerHTML = '';
          cameraView.appendChild(videoElement);

          // Create "Stop Camera" button
          const stopCameraButton = document.createElement('button');
          stopCameraButton.textContent = 'Stop Camera';
          stopCameraButton.classList.add('btn', 'btn-danger', 'w-100', 'mt-2');
          stopCameraButton.addEventListener('click', stopCamera);
          cameraView.appendChild(stopCameraButton);

      } catch (error) {
          console.error('Error accessing camera:', error);
          cameraView.innerHTML = '<p class="text-danger">Camera access denied or not available.</p>';
      }
  }

  // Stop Camera Function
  function stopCamera() {
      if (videoStream) {
          videoStream.getTracks().forEach(track => track.stop());
          videoStream = null;
      }

      // Restore initial UI
      cameraView.innerHTML = '';
      cameraView.appendChild(startCameraButton);

      if (availableCameras.length > 1) {
          populateCameraDropdown();
      }
  }

  // Initialize
  getAvailableCameras();
  startCameraButton.addEventListener('click', startCamera);
});
