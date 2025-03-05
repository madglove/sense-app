document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#bleStatusView');
    if (!container) {
        console.error('BLE Status container not found.');
        return;
    }

    // Function to render the simple UI
    function renderUI() {
        const connected = window.bleConnected;
        let html = `
            <strong>BLE Status: </strong>
            <span id="bleStatusText">${connected ? 'Connected' : 'Disconnected'}</span>
        `;
        if (connected) {
            if (window.latestIMUData) {
                const data = window.latestIMUData;
                html += `
                    <p><strong>Temperature:</strong> ${data[1]} °C</p>
                    <p><strong>Pressure:</strong> ${data[2]} hPa</p>
                    <p><strong>IMU1 Accel:</strong> X: ${data[3]}, Y: ${data[4]}, Z: ${data[5]}</p>
                    <p><strong>IMU1 Gyro:</strong> X: ${data[6]}, Y: ${data[7]}, Z: ${data[8]}</p>
                    <p><strong>IMU2 Accel:</strong> X: ${data[9]}, Y: ${data[10]}, Z: ${data[11]}</p>
                    <p><strong>IMU2 Gyro:</strong> X: ${data[12]}, Y: ${data[13]}, Z: ${data[14]}</p>
                `;
            } else {
                html += `<p>No sensor data available.</p>`;
            }
        } else {
            html += `<p>Bluetooth is disconnected.</p>`;
        }
        
        // Button to switch to the Bluetooth tab
        html += `
                    <button id="goToBluetooth" class="btn btn-primary mt-3">Go to Bluetooth Tab</button>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    // Attach the event handler for the "Go to Bluetooth Tab" button
    function attachBluetoothButtonHandler() {
        const btn = document.getElementById('goToBluetooth');
        if (btn) {
            btn.addEventListener('click', () => {
                // Find the button that targets the Bluetooth tab and simulate a click
                const btTab = document.querySelector('button[data-bs-target="#deviceView"]');
                if (btTab) {
                    btTab.click();
                } else {
                    console.error('Bluetooth tab button not found.');
                }
            });
        }
    }

    // Initial render and attach button handler
    renderUI();
    attachBluetoothButtonHandler();

    // Auto-update the UI every 50 milliseconds
    setInterval(() => {
        renderUI();
        attachBluetoothButtonHandler();
    }, 100);
});
