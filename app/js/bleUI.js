/**
 * Updates the Bluetooth status in the UI.
 * @param {string} text - Status text to display.
 * @param {boolean} isConnected - Whether Bluetooth is connected.
 */
export function updateBleStatus(text, isConnected) {
    const bleStatusElem = document.getElementById("bleStatus");
    const dashboardBleElem = document.getElementById("statusBluetooth");
  
    if (bleStatusElem) {
      bleStatusElem.textContent = text;
      bleStatusElem.className = `badge ${isConnected ? "bg-success" : "bg-danger"}`;
    }
  
    if (dashboardBleElem) {
      dashboardBleElem.textContent = isConnected ? "Connected ✅" : "Disconnected";
      dashboardBleElem.className = `badge ${isConnected ? "bg-success" : "bg-danger"}`;
    }
  }
  
  /**
   * Toggles the Connect button between "Connect" and "Disconnect".
   * @param {boolean} isConnected - Whether Bluetooth is currently connected.
   */
  export function toggleConnectButton(isConnected) {
    const connectBtn = document.getElementById("connect");
  
    if (connectBtn) {
      connectBtn.textContent = isConnected ? "Disconnect" : "Connect";
      connectBtn.className = `btn ${isConnected ? "btn-danger" : "btn-primary"}`;
    }
  }
  
  /**
   * Enables or disables streaming buttons.
   * @param {boolean} enabled - Whether buttons should be enabled.
   */
  export function toggleStreamingButtons(enabled) {
    const btnStart = document.getElementById("start");
    const btnStop = document.getElementById("stop");
    if (btnStart) btnStart.disabled = !enabled;
    if (btnStop) btnStop.disabled = !enabled;
  }
  
  /**
   * Displays BLE data in the UI.
   * @param {Array} data - Latest IMU data received.
   */
  export function showBleData(data) {
    const dataElem = document.getElementById("data");
    if (!dataElem) return;
  
    dataElem.innerHTML = `
      <b>Timestamp:</b> ${data[0]} ms<br>
      <b>Temperature:</b> ${data[1]} °C<br>
      <b>Pressure:</b> ${data[2]} hPa<br>
      <b>IMU1 Accel:</b> X=${data[3]}, Y=${data[4]}, Z=${data[5]}<br>
      <b>IMU1 Gyro:</b> X=${data[6]}, Y=${data[7]}, Z=${data[8]}<br>
      <b>IMU2 Accel:</b> X=${data[9]}, Y=${data[10]}, Z=${data[11]}<br>
      <b>IMU2 Gyro:</b> X=${data[12]}, Y=${data[13]}, Z=${data[14]}<br>
    `;
  }
  
  /**
   * Displays debug log in the UI.
   * @param {Array} logs - Array of debug messages.
   */
  export function showDebugLog(logs) {
    const debugElem = document.getElementById("debug");
    if (!debugElem) return;
    debugElem.textContent = logs.join("\n");
  }
  