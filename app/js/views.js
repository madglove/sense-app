document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.querySelector('#appContainer');

    const navLogin = document.querySelector('#navLogin');
    const navDevice = document.querySelector('#navDevice');
    const navLogout = document.querySelector('#navLogout');

    // Function to show a specific view
    function showView(view) {
        if (view === 'login') {
            appContainer.innerHTML = `
                <div id="authContainer" class="mt-5"></div>
            `;
            loadAuthForm();
            navLogin.style.display = 'none';
            navDevice.style.display = 'none';
            navLogout.style.display = 'none';
        } else if (view === 'device') {
            appContainer.innerHTML = `
                <div class="container mt-5">
                    <h2>BLE Sensor Data</h2>
                    <p id="status" class="alert alert-info">Disconnected</p>
                    <button id="connect" class="btn btn-primary">Connect to BLE Device</button>
                    <button id="start" class="btn btn-success" disabled>Start Streaming</button>
                    <button id="stop" class="btn btn-danger" disabled>Stop Streaming</button>

                    <br>
                    <div class="mt-3">
                        <button id="startRecording" class="btn btn-warning">Start Recording</button>
                        <button id="stopRecording" class="btn btn-secondary" disabled>Stop Recording</button>
                        <button id="downloadCSV" class="btn btn-info" disabled>Download CSV</button>
                    </div>    

                    <h3 class="mt-4">Real-Time Sensor Data</h3>
                    <div id="data" class="border p-3 bg-light">No data received yet.</div>
                </div>

                <h2 class="text-center mb-4">Madglove Sense - IMU Data Visualization</h2>
                <div id="chartsContainer" class="row"></div>

                <div>
                    <h3 class="mt-4">Raw BLE Data</h3>
                    <pre id="debug" class="border p-3 bg-light">Debug log will appear here.</pre>
                </div>
            `;

            loadCharts();
            navLogin.style.display = 'none';
            navDevice.style.display = 'block';
            navLogout.style.display = 'block';
        }
    }

    // Load authentication form
    function loadAuthForm() {
        const authContainer = document.querySelector('#authContainer');
        if (!authContainer) return;
        authContainer.innerHTML = `
            <h3>Enter Credentials to Connect</h3>
            <form id="authForm">
                <div class="mb-3">
                    <label for="consumerKey" class="form-label">OAuth Consumer Key</label>
                    <input type="text" id="consumerKey" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="consumerSecret" class="form-label">OAuth Consumer Secret</label>
                    <input type="password" id="consumerSecret" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Connect</button>
            </form>
            <p id="connectionStatus" class="mt-3 text-info">Waiting for user input...</p>
        `;

        document.querySelector('#authForm').addEventListener('submit', (event) => {
            event.preventDefault();
            // Simulate login success
            showView('device');
        });
    }

    // Load charts dynamically
    function loadCharts() {
        const chartsContainer = document.querySelector('#chartsContainer');
        if (!chartsContainer) return;

        chartsContainer.innerHTML = `
            <div class="col-md-6">
                <h3 class="text-center">Wrist - IMU1 Accelerometer</h3>
                <canvas id="imu1AccelChart"></canvas>
                <h3 class="text-center mt-4">Wrist - IMU1 Gyroscope</h3>
                <canvas id="imu1GyroChart"></canvas>
            </div>
            <div class="col-md-6">
                <h3 class="text-center">Finger - IMU2 Accelerometer</h3>
                <canvas id="imu2AccelChart"></canvas>
                <h3 class="text-center mt-4">Finger - IMU2 Gyroscope</h3>
                <canvas id="imu2GyroChart"></canvas>
            </div>
        `;

        // Call charts initialization
        initializeCharts();
    }

    // Handle navigation
    navLogin.addEventListener('click', () => showView('login'));
    navDevice.addEventListener('click', () => showView('device'));
    navLogout.addEventListener('click', () => showView('login'));

    // Default to login view
    showView('login');
});
