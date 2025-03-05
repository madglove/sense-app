let recording = false;
let recordedData = [];
let recordingStartTime = null;

document.addEventListener('DOMContentLoaded', () => {
  const bleDataRecording = document.querySelector('#bleDataRecording');

  // Inject CSS for the blinking recording indicator.
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes blink {
      50% { opacity: 0; }
    }
    .recording-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      background-color: red;
      border-radius: 50%;
      margin-right: 5px;
      animation: blink 1s step-start infinite;
    }
  `;
  document.head.appendChild(style);

  // Create the recording indicator element (hidden by default)
  const recordingIndicator = document.createElement('span');
  recordingIndicator.id = 'recordingIndicator';
  recordingIndicator.className = 'recording-indicator';
  recordingIndicator.style.display = 'none';

  // Create the Toggle Recording button
  const toggleRecordingBtn = document.createElement('button');
  toggleRecordingBtn.id = 'toggleRecording';
  toggleRecordingBtn.className = 'btn btn-success';
  toggleRecordingBtn.textContent = 'Start Recording';
  toggleRecordingBtn.disabled = true; // Start disabled

  // Create the Download CSV button (initially hidden)
  const downloadCSVBtn = document.createElement('button');
  downloadCSVBtn.id = 'downloadCSV';
  downloadCSVBtn.className = 'btn btn-primary';
  downloadCSVBtn.textContent = 'Download CSV';
  downloadCSVBtn.disabled = true;
  downloadCSVBtn.style.display = 'none';

  // Create a span to display the CSV file name (initially hidden)
  const csvFilenameSpan = document.createElement('span');
  csvFilenameSpan.id = 'csvFilename';
  csvFilenameSpan.className = 'ms-2';
  csvFilenameSpan.style.display = 'none';

  // Add some spacing using Bootstrap margin utility classes
  toggleRecordingBtn.classList.add('me-2');

  // Append the recording indicator, buttons, and file name span to the bleDataRecording div.
  bleDataRecording.appendChild(recordingIndicator);
  bleDataRecording.appendChild(toggleRecordingBtn);
  bleDataRecording.appendChild(downloadCSVBtn);
  bleDataRecording.appendChild(csvFilenameSpan);

  // Toggle recording logic
  toggleRecordingBtn.addEventListener('click', () => {
    if (recording) {
      // Stop recording
      recording = false;
      toggleRecordingBtn.textContent = 'Start Recording';
      toggleRecordingBtn.className = 'btn btn-success me-2';
      // Hide the blinking indicator when recording stops
      recordingIndicator.style.display = 'none';
      
      // Show the download CSV button and update file name display if data exists
      if (recordedData.length > 0) {
        downloadCSVBtn.disabled = false;
        downloadCSVBtn.style.display = 'inline-block';
        csvFilenameSpan.textContent = `File: Madglove_IMU_Data_${recordingStartTime}.csv`;
        csvFilenameSpan.style.display = 'inline';
      }
    } else {
      // Start recording
      recording = true;
      recordedData = [];
      recordingStartTime = new Date().toISOString();
      toggleRecordingBtn.textContent = 'Stop Recording';
      toggleRecordingBtn.className = 'btn btn-danger me-2';
      // Show the blinking indicator when recording starts
      recordingIndicator.style.display = 'inline-block';
      
      // Hide download CSV button and file name during recording
      downloadCSVBtn.style.display = 'none';
      csvFilenameSpan.style.display = 'none';
      downloadCSVBtn.disabled = true;
    }
  });

  // Download CSV logic
  downloadCSVBtn.addEventListener('click', () => {
    if (recordedData.length > 0) {
      const csvContent = generateCSV();
      downloadCSV(csvContent);
    }
  });

  // Continuously record the latest IMU data if recording is enabled
  setInterval(() => {
    if (recording && window.latestIMUData) {
      recordedData.push([...window.latestIMUData]);
    }
  }, 100); // Collect data every 100ms

  // Periodically check if Bluetooth is connected and data is streaming.
  // We use the existence of window.latestIMUData as a proxy for data streaming.
  setInterval(() => {
    if (window.bleConnected && window.latestIMUData) {
      // Show the recording controls and enable the record button.
      bleDataRecording.hidden = false;
      toggleRecordingBtn.disabled = false;
    } else {
      // Hide the recording controls and disable the record button.
      bleDataRecording.hidden = true;
      toggleRecordingBtn.disabled = true;
    }
  }, 500);
});

function generateCSV() {
  const headers = [
    "Timestamp",
    "Temperature (°C)",
    "Pressure (hPa)",
    "IMU1 Accel X", "IMU1 Accel Y", "IMU1 Accel Z",
    "IMU1 Gyro X", "IMU1 Gyro Y", "IMU1 Gyro Z",
    "IMU2 Accel X", "IMU2 Accel Y", "IMU2 Accel Z",
    "IMU2 Gyro X", "IMU2 Gyro Y", "IMU2 Gyro Z"
  ];

  let csvRows = [headers.join(',')]; // Add headers

  recordedData.forEach(row => {
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Madglove_IMU_Data_${recordingStartTime}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
