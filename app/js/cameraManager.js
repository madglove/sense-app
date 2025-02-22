// app/js/cameraManager.js
(function() {
  let currentStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let uiInitialized = false;
  let recordingStartTime = null;

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
    stopBtn.className = 'btn btn-danger me-2';

    // Create the Start Recording button
    const startRecordingBtn = document.createElement('button');
    startRecordingBtn.id = 'startRecordingBtn';
    startRecordingBtn.textContent = 'Start Recording';
    startRecordingBtn.className = 'btn btn-primary me-2';

    // Create the Stop Recording button
    const stopRecordingBtn = document.createElement('button');
    stopRecordingBtn.id = 'stopRecordingBtn';
    stopRecordingBtn.textContent = 'Stop Recording';
    stopRecordingBtn.className = 'btn btn-warning me-2';

    // Create the Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadBtn';
    downloadBtn.textContent = 'Download';
    downloadBtn.className = 'btn btn-info';
    downloadBtn.disabled = true;

    // Create the video element to display the camera feed
    const videoElem = document.createElement('video');
    videoElem.id = 'cameraVideo';
    videoElem.width = 640;
    videoElem.height = 480;
    videoElem.autoplay = true;
    videoElem.playsInline = true;
    videoElem.style.backgroundColor = '#000';
    videoElem.className = 'mt-3';

    // Create the recording status element
    const recordingStatus = document.createElement('div');
    recordingStatus.id = 'recordingStatus';
    recordingStatus.textContent = '';
    recordingStatus.className = 'mt-2 text-danger';

    // Create the file info element
    const fileInfo = document.createElement('div');
    fileInfo.id = 'fileInfo';
    fileInfo.textContent = '';
    fileInfo.className = 'mt-2';

    // Append the elements to the camera view
    cameraView.appendChild(startBtn);
    cameraView.appendChild(stopBtn);
    cameraView.appendChild(startRecordingBtn);
    cameraView.appendChild(stopRecordingBtn);
    cameraView.appendChild(downloadBtn);
    cameraView.appendChild(videoElem);
    cameraView.appendChild(recordingStatus);
    cameraView.appendChild(fileInfo);

    // Attach event listeners
    startBtn.addEventListener('click', startStream);
    stopBtn.addEventListener('click', stopStream);
    startRecordingBtn.addEventListener('click', startRecording);
    stopRecordingBtn.addEventListener('click', stopRecording);
    downloadBtn.addEventListener('click', downloadRecording);

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
      videoElem.controls = false; // Hide controls during streaming
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

  // Start recording the current stream
  function startRecording() {
    if (!currentStream) {
      alert('No active stream to record.');
      return;
    }

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'video/webm; codecs=vp9' });

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      console.log('[CameraManager] Recording stopped.');
      document.getElementById('downloadBtn').disabled = false;
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const duration = ((now - recordingStartTime) / 1000).toFixed(2);
      document.getElementById('fileInfo').textContent = `File: recording-${timestamp}.webm, Duration: ${duration} seconds`;
    };

    mediaRecorder.start();
    recordingStartTime = new Date();
    console.log('[CameraManager] Recording started.');
    document.getElementById('startRecordingBtn').disabled = true;
    document.getElementById('stopRecordingBtn').disabled = false;
    document.getElementById('recordingStatus').textContent = 'Recording...';
  }

  // Stop recording the current stream
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      console.log('[CameraManager] Stop recording requested.');
      document.getElementById('startRecordingBtn').disabled = false;
      document.getElementById('stopRecordingBtn').disabled = true;
      document.getElementById('recordingStatus').textContent = '';
    } else {
      console.log('[CameraManager] No active recording to stop.');
    }
  }

  // Download the recorded video
  function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    a.download = `recording-${timestamp}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    console.log('[CameraManager] Recording downloaded.');
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
