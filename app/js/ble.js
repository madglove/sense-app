document.addEventListener('DOMContentLoaded', () => {
  // Locate the container where the BLE UI should be rendered.
  const deviceView = document.querySelector('#deviceView');
  if (!deviceView) {
    console.error('deviceView element not found.');
    return;
  }

  // Render the UI inside deviceView with two separate sections:
  // 1. Real Time Variables (current sensor readings)
  // 2. Data Stream (raw data log)
  deviceView.innerHTML = `
    <h2>Bluetooth</h2>
    <div class="btn-group mb-3" role="group">
      <button id="connect" class="btn btn-primary">Connect</button>
      <button id="stream" class="btn btn-success" disabled>Start Data Stream</button>
    </div>
    <div id="realTimeSection" class="mb-3">
      <h4>Real Time Variables</h4>
      <p>Current sensor readings from the device.</p>
      <div id="status" class="mb-2">Disconnected.</div>
      <div id="data"></div>
    </div>
    <div id="dataStreamSection" class="mb-3">
      <h4>Data Stream</h4>
      <p>Log of raw data received from the device.</p>
      <div id="debug" style="white-space: pre-wrap;"></div>
    </div>
  `;

  // Grab references to our UI elements.
  const statusElem = document.querySelector('#status');
  const dataElem = document.querySelector('#data');
  const debugElem = document.querySelector('#debug');
  const connectBtn = document.querySelector('#connect');
  const streamBtn = document.querySelector('#stream');

  let device = null;
  let characteristic = null;
  let streamingActive = false; // Flag to track streaming state.
  const debugLog = []; // Array to hold debug messages.
  const DEBUG_LOG_LIMIT = 10; // Limit debug log size.

  // Global variable to store the latest IMU data.
  window.latestIMUData = null;

  // Toggle connect/disconnect functionality.
  connectBtn.addEventListener('click', async () => {
    // If already connected, disconnect.
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
      updateConnectButton(false);
      updateStreamButton(false);
      statusElem.textContent = 'Disconnected.';
      return;
    }

    // Otherwise, attempt to connect.
    statusElem.textContent = 'Scanning for devices...';
    debugElem.textContent = '';
    resetConnection();

    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] }]
      });

      device.addEventListener('gattserverdisconnected', onDisconnected);
      statusElem.textContent = 'Connecting...';

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

      statusElem.textContent = 'Connected! Ready to receive data';

      // Update the global Bluetooth status if available.
      if (window.updateBluetoothStatus) {
        window.updateBluetoothStatus('BLE Connected');
      }

      updateConnectButton(true);
      streamBtn.disabled = false;

      // Start notifications and listen for incoming data.
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const rawData = new TextDecoder().decode(event.target.value);

        // Parse the incoming data.
        const values = rawData.split(',');
        const timestamp = parseFloat(values[0]);
        const temperature = parseFloat(values[1]);
        const pressure = parseFloat(values[2]);
        const imu1 = {
          accel: {
            x: parseFloat(values[3]),
            y: parseFloat(values[4]),
            z: parseFloat(values[5])
          },
          gyro: {
            x: parseFloat(values[6]),
            y: parseFloat(values[7]),
            z: parseFloat(values[8])
          }
        };
        const imu2 = {
          accel: {
            x: parseFloat(values[9]),
            y: parseFloat(values[10]),
            z: parseFloat(values[11])
          },
          gyro: {
            x: parseFloat(values[12]),
            y: parseFloat(values[13]),
            z: parseFloat(values[14])
          }
        };

        // Store the latest IMU data in a global variable.
        window.latestIMUData = [
          timestamp,
          temperature,
          pressure,
          imu1.accel.x,
          imu1.accel.y,
          imu1.accel.z,
          imu1.gyro.x,
          imu1.gyro.y,
          imu1.gyro.z,
          imu2.accel.x,
          imu2.accel.y,
          imu2.accel.z,
          imu2.gyro.x,
          imu2.gyro.y,
          imu2.gyro.z
        ];

        console.log('Latest IMU Data Updated:', window.latestIMUData);

        // Update the "Real Time Variables" display.
        dataElem.innerHTML = `
          <b>Timestamp:</b> ${timestamp} ms<br>
          <b>Temperature:</b> ${temperature} °C<br>
          <b>Pressure:</b> ${pressure} hPa<br>
          <b>IMU1 Accel:</b> X=${imu1.accel.x}, Y=${imu1.accel.y}, Z=${imu1.accel.z}<br>
          <b>IMU1 Gyro:</b> X=${imu1.gyro.x}, Y=${imu1.gyro.y}, Z=${imu1.gyro.z}<br>
          <b>IMU2 Accel:</b> X=${imu2.accel.x}, Y=${imu2.accel.y}, Z=${imu2.accel.z}<br>
          <b>IMU2 Gyro:</b> X=${imu2.gyro.x}, Y=${imu2.gyro.y}, Z=${imu2.gyro.z}<br>
        `;

        // Update the Data Stream log.
        debugLog.push(rawData);
        if (debugLog.length > DEBUG_LOG_LIMIT) {
          debugLog.shift();
        }
        debugElem.textContent = debugLog.join('\n');
      });
    } catch (error) {
      console.error(error);
      statusElem.textContent = `Error: ${error.message}`;
      resetConnection();
      updateConnectButton(false);
      updateStreamButton(false);
    }
  });

  // Toggle data stream functionality.
  streamBtn.addEventListener('click', async () => {
    if (!characteristic) return;

    // If streaming is active, send STOP command.
    if (streamingActive) {
      const command = new TextEncoder().encode('STOP');
      try {
        await characteristic.writeValue(command);
        statusElem.textContent = 'Streaming stopped.';
        streamingActive = false;
        updateStreamButton(false);
      } catch (error) {
        console.error('Error stopping data stream:', error);
        statusElem.textContent = `Error: ${error.message}`;
      }
    } else {
      // If streaming is not active, send START command.
      const command = new TextEncoder().encode('START');
      try {
        await characteristic.writeValue(command);
        statusElem.textContent = 'Streaming started...';
        streamingActive = true;
        updateStreamButton(true);
      } catch (error) {
        console.error('Error starting data stream:', error);
        statusElem.textContent = `Error: ${error.message}`;
      }
    }
  });

  // Helper function to update the Connect/Disconnect button.
  function updateConnectButton(isConnected) {
    if (isConnected) {
      connectBtn.textContent = 'Disconnect';
      connectBtn.className = 'btn btn-warning';
    } else {
      connectBtn.textContent = 'Connect';
      connectBtn.className = 'btn btn-primary';
    }
  }

  // Helper function to update the Stream button.
  function updateStreamButton(isStreaming) {
    if (isStreaming) {
      streamBtn.textContent = 'Stop Data Stream';
      streamBtn.className = 'btn btn-danger';
    } else {
      streamBtn.textContent = 'Start Data Stream';
      streamBtn.className = 'btn btn-success';
    }
  }

  function resetConnection() {
    if (device) {
      if (device.gatt.connected) {
        device.gatt.disconnect();
      }
      device = null;
    }
    characteristic = null;
    streamingActive = false;
    streamBtn.disabled = true;
    statusElem.textContent = 'Disconnected.';
  }

  function onDisconnected() {
    statusElem.textContent = 'Device disconnected. Resetting...';
    resetConnection();
    updateConnectButton(false);
    updateStreamButton(false);
    if (window.updateBluetoothStatus) {
      window.updateBluetoothStatus('BLE Disconnected');
    }
  }
});
