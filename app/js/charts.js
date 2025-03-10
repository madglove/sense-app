document.addEventListener('DOMContentLoaded', () => {
  const chartsContainer = document.querySelector('#chartsAndDataRow');

  if (!chartsContainer) {
    console.error("❌ Charts container not found in the HTML.");
    return;
  }

  // Initially hide the charts container until BLE is connected.
  chartsContainer.style.display = 'none';
  chartsContainer.innerHTML = `<p class="text-center text-muted">Waiting for BLE connection to display charts...</p>`;

  let chartsInitialized = false;

  // Function that injects the chart elements and initializes the charts.
  function initCharts() {
    chartsContainer.style.display = 'block';
    chartsContainer.innerHTML = `
      <div class="row">
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
      </div>
    `;

    // Function to create a horizontal bar chart
    const createBarChart = (ctx, label, yLabel) => {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Accel X', 'Accel Y', 'Accel Z'],
          datasets: [
            {
              label,
              data: [0, 0, 0],
              backgroundColor: ['#ff6384', '#36a2eb', '#4caf50']
            }
          ]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              suggestedMin: -1.1,
              suggestedMax: 1.1,
              title: { display: true, text: yLabel }
            }
          },
          responsive: true,
          animation: { duration: 300 },
          plugins: { legend: { display: false } }
        }
      });
    };

    // Function to create a line chart with interpolation
    const createLineChart = (ctx, label, yLabel) => {
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            { label: `${label} X`, data: [], borderColor: 'red', fill: false, tension: 0.4 },
            { label: `${label} Y`, data: [], borderColor: 'green', fill: false, tension: 0.4 },
            { label: `${label} Z`, data: [], borderColor: 'blue', fill: false, tension: 0.4 }
          ]
        },
        options: {
          scales: {
            x: { title: { display: true, text: 'Time (ms)' } },
            y: {
              suggestedMin: -100,
              suggestedMax: 100,
              title: { display: true, text: yLabel }
            }
          },
          responsive: true,
          animation: { duration: 500, easing: 'easeOutQuad' },
          plugins: { legend: { display: true } }
        }
      });
    };

    // Initialize charts
    const imu1AccelChart = createBarChart(
      document.getElementById('imu1AccelChart').getContext('2d'),
      'IMU1 Accelerometer',
      'Acceleration (g)'
    );
    const imu2AccelChart = createBarChart(
      document.getElementById('imu2AccelChart').getContext('2d'),
      'IMU2 Accelerometer',
      'Acceleration (g)'
    );
    const imu1GyroChart = createLineChart(
      document.getElementById('imu1GyroChart').getContext('2d'),
      'IMU1 Gyroscope',
      'Rotation (°/s)'
    );
    const imu2GyroChart = createLineChart(
      document.getElementById('imu2GyroChart').getContext('2d'),
      'IMU2 Gyroscope',
      'Rotation (°/s)'
    );

    // Real-time data updates every 100ms
    setInterval(() => {
      if (window.latestIMUData) {
        const timestamp = window.latestIMUData[0];

        // Extract IMU1 data
        const imu1AccelX = window.latestIMUData[3],
              imu1AccelY = window.latestIMUData[4],
              imu1AccelZ = window.latestIMUData[5];
        const imu1GyroX = window.latestIMUData[6],
              imu1GyroY = window.latestIMUData[7],
              imu1GyroZ = window.latestIMUData[8];

        // Extract IMU2 data
        const imu2AccelX = window.latestIMUData[9],
              imu2AccelY = window.latestIMUData[10],
              imu2AccelZ = window.latestIMUData[11];
        const imu2GyroX = window.latestIMUData[12],
              imu2GyroY = window.latestIMUData[13],
              imu2GyroZ = window.latestIMUData[14];

        const maxDataPoints = 25; // Rolling window size

        // Update IMU1 Accelerometer Chart
        imu1AccelChart.data.datasets[0].data = [imu1AccelX, imu1AccelY, imu1AccelZ];
        imu1AccelChart.update('none');

        // Update IMU2 Accelerometer Chart
        imu2AccelChart.data.datasets[0].data = [imu2AccelX, imu2AccelY, imu2AccelZ];
        imu2AccelChart.update('none');

        // Update IMU1 Gyroscope Chart
        imu1GyroChart.data.labels.push(timestamp);
        imu1GyroChart.data.datasets[0].data.push(imu1GyroX);
        imu1GyroChart.data.datasets[1].data.push(imu1GyroY);
        imu1GyroChart.data.datasets[2].data.push(imu1GyroZ);

        if (imu1GyroChart.data.labels.length > maxDataPoints) {
          imu1GyroChart.data.labels.shift();
          imu1GyroChart.data.datasets.forEach((dataset) => dataset.data.shift());
        }
        imu1GyroChart.update('none');

        // Update IMU2 Gyroscope Chart
        imu2GyroChart.data.labels.push(timestamp);
        imu2GyroChart.data.datasets[0].data.push(imu2GyroX);
        imu2GyroChart.data.datasets[1].data.push(imu2GyroY);
        imu2GyroChart.data.datasets[2].data.push(imu2GyroZ);

        if (imu2GyroChart.data.labels.length > maxDataPoints) {
          imu2GyroChart.data.labels.shift();
          imu2GyroChart.data.datasets.forEach((dataset) => dataset.data.shift());
        }
        imu2GyroChart.update('none');
      }
    }, 100); // Update every 100ms
  }

  // Check every 500ms if BLE is connected and charts are not yet initialized.
  const checkBLEInterval = setInterval(() => {
    if (window.bleConnected && !chartsInitialized) {
      initCharts();
      chartsInitialized = true;
      clearInterval(checkBLEInterval);
    }
  }, 500);
});
