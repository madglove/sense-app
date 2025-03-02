// cameraManager.js

document.addEventListener('DOMContentLoaded', () => {
    const cameraView = document.getElementById('cameraView');
    const startCameraButton = document.createElement('button');
    startCameraButton.textContent = 'Start Camera';
    startCameraButton.classList.add('btn', 'btn-primary', 'w-100');
    cameraView.appendChild(startCameraButton);
  
    let videoStream = null;
    let availableCameras = [];
    let selectedCameraId = null;
  
    async function getAvailableCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        populateCameraDropdown();
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    }
  
    function populateCameraDropdown() {
      if (availableCameras.length > 1) {
        const cameraDropdown = document.createElement('select');
        cameraDropdown.classList.add('form-select', 'mb-2', 'w-100');
        availableCameras.forEach(camera => {
          const option = document.createElement('option');
          option.value = camera.deviceId;
          option.textContent = camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`;
          cameraDropdown.appendChild(option);
        });
        cameraDropdown.addEventListener('change', (event) => {
          selectedCameraId = event.target.value;
        });
        cameraView.insertBefore(cameraDropdown, startCameraButton);
        selectedCameraId = availableCameras[0].deviceId;
      } else if (availableCameras.length === 1) {
        selectedCameraId = availableCameras[0].deviceId;
      }
    }
  
    async function startCamera() {
      try {
        const constraints = {
          video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoStream = stream;
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.classList.add('w-100', 'h-100');
        videoElement.style.objectFit = 'cover'; // retain for proper cover behavior
        cameraView.innerHTML = '';
        cameraView.appendChild(videoElement);
  
        const stopCameraButton = document.createElement('button');
        stopCameraButton.textContent = 'Stop Camera';
        stopCameraButton.classList.add('btn', 'btn-danger', 'w-100');
        stopCameraButton.addEventListener('click', stopCamera);
        cameraView.appendChild(stopCameraButton);
      } catch (error) {
        console.error('Error accessing camera:', error);
        cameraView.innerHTML = '<p>Camera access denied or not available.</p>';
      }
    }
  
    function stopCamera() {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        cameraView.innerHTML = '';
        startCameraButton.classList.add('btn', 'btn-primary', 'w-100');
        cameraView.appendChild(startCameraButton);
        if (availableCameras.length > 1) {
          populateCameraDropdown();
        }
      }
    }
  
    getAvailableCameras();
    startCameraButton.addEventListener('click', startCamera);
  });
  