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
  
    // Variables for recording
    let mediaRecorder = null;
    let recordedChunks = [];
    let recordingStartTime = null;
  
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
  
            // Create a controls container div
            const controlsContainer = document.createElement('div');
            controlsContainer.classList.add('w-100', 'mt-2');
  
            // Create "Stop Camera" button
            const stopCameraButton = document.createElement('button');
            stopCameraButton.textContent = 'Stop Camera';
            stopCameraButton.classList.add('btn', 'btn-danger', 'w-100', 'mt-2');
            stopCameraButton.addEventListener('click', stopCamera);
            controlsContainer.appendChild(stopCameraButton);
  
            // Create "Record" button - initially green to indicate 'Start Recording'
            const recordButton = document.createElement('button');
            recordButton.textContent = 'Start Recording';
            recordButton.classList.add('btn', 'btn-success', 'w-100', 'mt-2');
            controlsContainer.appendChild(recordButton);
  
            // Create Download button (hidden by default)
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download Recording';
            downloadButton.classList.add('btn', 'btn-primary', 'w-100', 'mt-2');
            downloadButton.style.display = 'none';
            controlsContainer.appendChild(downloadButton);
  
            // Create a span to display the file name (hidden by default)
            const fileNameSpan = document.createElement('span');
            fileNameSpan.classList.add('ms-2');
            fileNameSpan.style.display = 'none';
            controlsContainer.appendChild(fileNameSpan);
  
            // Append controls container to cameraView
            cameraView.appendChild(controlsContainer);
  
            // Record button logic
            recordButton.addEventListener('click', () => {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    // Stop recording
                    mediaRecorder.stop();
                    recordButton.textContent = 'Start Recording';
                    recordButton.classList.remove('btn-danger');
                    recordButton.classList.add('btn-success');
                } else {
                    // Start recording
                    recordedChunks = [];
                    recordingStartTime = new Date().toISOString();
                    try {
                        mediaRecorder = new MediaRecorder(videoStream);
                    } catch (error) {
                        console.error("MediaRecorder error:", error);
                        return;
                    }
                    mediaRecorder.ondataavailable = event => {
                        if (event.data && event.data.size > 0) {
                            recordedChunks.push(event.data);
                        }
                    };
                    mediaRecorder.onstop = () => {
                        // When recording stops, show the download button and file name
                        downloadButton.style.display = 'inline-block';
                        fileNameSpan.textContent = `File: Webcam_Record_${recordingStartTime}.webm`;
                        fileNameSpan.style.display = 'inline-block';
                    };
                    mediaRecorder.start();
                    recordButton.textContent = 'Stop Recording';
                    recordButton.classList.remove('btn-success');
                    recordButton.classList.add('btn-danger');
                }
            });
  
            // Download button logic
            downloadButton.addEventListener('click', () => {
                if (recordedChunks.length > 0) {
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `Webcam_Record_${recordingStartTime}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            });
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
  