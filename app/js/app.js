import { connectBluetooth, disconnectBluetooth, startStreaming, stopStreaming } from "./bleManager.js";
import { updateBleStatus, toggleConnectButton, toggleStreamingButtons } from "./bleUI.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeBluetoothControls();
});

/**
 * Initializes Bluetooth controls and event listeners.
 */
function initializeBluetoothControls() {
  const bluetoothControlsDiv = document.getElementById("bluetoothControls");
  if (!bluetoothControlsDiv) return;

  bluetoothControlsDiv.innerHTML = `
    <button id="connect" class="btn btn-primary">Connect</button>
    <button id="start" class="btn btn-success" disabled>Start Streaming</button>
    <button id="stop" class="btn btn-danger" disabled>Stop Streaming</button>
  `;

  setupBluetoothEventListeners();
}

/**
 * Sets up event listeners for Bluetooth buttons.
 */
function setupBluetoothEventListeners() {
  const connectBtn = document.getElementById("connect");

  connectBtn.addEventListener("click", async () => {
    if (connectBtn.textContent === "Connect") {
      const success = await connectBluetooth();
      if (success) {
        toggleConnectButton(true);
        toggleStreamingButtons(true);
      }
    } else {
      await disconnectBluetooth();
      toggleConnectButton(false);
      toggleStreamingButtons(false);
    }
  });

  document.getElementById("start").addEventListener("click", startStreaming);
  document.getElementById("stop").addEventListener("click", stopStreaming);
}
