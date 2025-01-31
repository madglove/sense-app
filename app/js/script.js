document.addEventListener('DOMContentLoaded', () => {
    const statusElem = document.querySelector('#status');
    const debugElem = document.querySelector('#debug');
    const dataElem = document.querySelector('#data');
    const connectBtn = document.querySelector('#connect');
    const startBtn = document.querySelector('#start');
    const stopBtn = document.querySelector('#stop');

    let device = null;
    let characteristic = null;
    const debugLog = []; // Array to hold debug messages
    const DEBUG_LOG_LIMIT = 10; // Limit debug log size

    // Global variable to store the latest IMU data
    window.latestIMUData = null;

    connectBtn.addEventListener('click', async () => {
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

            startBtn.disabled = false;
            stopBtn.disabled = false;

            // Handle notifications
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', event => {
                const rawData = new TextDecoder().decode(event.target.value);

                // Parse the data
                const values = rawData.split(',');
                const timestamp = parseFloat(values[0]);
                const temperature = parseFloat(values[1]);
                const pressure = parseFloat(values[2]);
                const imu1 = {
                    accel: { x: parseFloat(values[3]), y: parseFloat(values[4]), z: parseFloat(values[5]) },
                    gyro: { x: parseFloat(values[6]), y: parseFloat(values[7]), z: parseFloat(values[8]) }
                };
                const imu2 = {
                    accel: { x: parseFloat(values[9]), y: parseFloat(values[10]), z: parseFloat(values[11]) },
                    gyro: { x: parseFloat(values[12]), y: parseFloat(values[13]), z: parseFloat(values[14]) }
                };

                // Store the latest IMU data in a global variable
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

                // Display the latest data
                dataElem.innerHTML = `
                    <b>Timestamp:</b> ${timestamp} ms<br>
                    <b>Temperature:</b> ${temperature} °C<br>
                    <b>Pressure:</b> ${pressure} hPa<br>
                    <b>IMU1 Accel:</b> X=${imu1.accel.x}, Y=${imu1.accel.y}, Z=${imu1.accel.z}<br>
                    <b>IMU1 Gyro:</b> X=${imu1.gyro.x}, Y=${imu1.gyro.y}, Z=${imu1.gyro.z}<br>
                    <b>IMU2 Accel:</b> X=${imu2.accel.x}, Y=${imu2.accel.y}, Z=${imu2.accel.z}<br>
                    <b>IMU2 Gyro:</b> X=${imu2.gyro.x}, Y=${imu2.gyro.y}, Z=${imu2.gyro.z}<br>
                `;

                // Update debug log
                debugLog.push(rawData); // Add the latest message
                if (debugLog.length > DEBUG_LOG_LIMIT) {
                    debugLog.shift(); // Remove the oldest message if over the limit
                }
                debugElem.textContent = debugLog.join('\n'); // Display the log
            });
        } catch (error) {
            console.error(error);
            statusElem.textContent = `Error: ${error.message}`;
            resetConnection();
        }
    });

    startBtn.addEventListener('click', () => {
        if (characteristic) {
            const command = new TextEncoder().encode('START');
            characteristic.writeValue(command).then(() => {
                statusElem.textContent = 'Streaming started...';
            });
        }
    });

    stopBtn.addEventListener('click', () => {
        if (characteristic) {
            const command = new TextEncoder().encode('STOP');
            characteristic.writeValue(command).then(() => {
                statusElem.textContent = 'Streaming stopped.';
            });
        }
    });

    function resetConnection() {
        if (device) {
            if (device.gatt.connected) {
                device.gatt.disconnect();
            }
            device = null;
        }
        characteristic = null;
        startBtn.disabled = true;
        stopBtn.disabled = true;
        statusElem.textContent = 'Disconnected.';
    }

    function onDisconnected() {
        statusElem.textContent = 'Device disconnected. Resetting...';
        resetConnection();
    }
});
