let recording = false;
let recordedData = [];
let recordingStartTime = null;

document.addEventListener('DOMContentLoaded', () => {
    const startRecordingBtn = document.querySelector('#startRecording');
    const stopRecordingBtn = document.querySelector('#stopRecording');
    const downloadCSVBtn = document.querySelector('#downloadCSV');

    startRecordingBtn.addEventListener('click', () => {
        recording = true;
        recordedData = [];
        recordingStartTime = new Date().toISOString();
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        downloadCSVBtn.disabled = true;
    });

    stopRecordingBtn.addEventListener('click', () => {
        recording = false;
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        downloadCSVBtn.disabled = recordedData.length > 0 ? false : true;
    });

    downloadCSVBtn.addEventListener('click', () => {
        if (recordedData.length > 0) {
            const csvContent = generateCSV();
            downloadCSV(csvContent);
        }
    });

    // Record the latest IMU data if recording is enabled
    setInterval(() => {
        if (recording && window.latestIMUData) {
            recordedData.push([...window.latestIMUData]);
        }
    }, 100); // Collect data every 100ms
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
