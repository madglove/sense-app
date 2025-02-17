document.addEventListener('DOMContentLoaded', () => {
    const backendStatusEl = document.getElementById('backendStatus');
    const bluetoothStatusEl = document.getElementById('bluetoothStatus');
  
    // Expose global helper functions to update statuses.
    // You can call these from anywhere in your code via window.updateBackendStatus(...)
    window.updateBackendStatus = function (statusText) {
      backendStatusEl.textContent = statusText;
    };
  
    window.updateBluetoothStatus = function (statusText) {
      bluetoothStatusEl.textContent = statusText;
    };
  
    // Optionally, you can also define methods to change
    // the styling (like turning the status text green/red).
  });
  