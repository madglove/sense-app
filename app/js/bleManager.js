let device = null;
let characteristic = null;
const debugLog = [];
const DEBUG_LOG_LIMIT = 10;

// Global variable to store streaming data
window.latestIMUData = null;

// Import UI functions
import { updateBleStatus, showBleData, showDebugLog } from "./bleUI.js";

/**
 * Connects to the BLE device and sets up notifications.
 * @returns {Promise<boolean>} True if connected, false otherwise.
 */
export async function connectBluetooth() {
  try {
    await disconnectBluetooth(); // Ensure a fresh connection

    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"] }]
    });

    device.addEventListener("gattserverdisconnected", onDisconnected);
    console.log(`Connecting to ${device.name}...`);

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
    characteristic = await service.getCharacteristic("beb5483e-36e1-4688-b7f5-ea07361b26a8");

    console.log(`Connected to ${device.name}`);

    await characteristic.startNotifications();
    characteristic.addEventListener("characteristicvaluechanged", handleCharacteristicValueChanged);

    // ✅ Update BLE Status
    updateBleStatus("Connected ✅", true);

    return true;
  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    await disconnectBluetooth();
    return false;
  }
}

/**
 * Disconnects from the BLE device.
 */
export async function disconnectBluetooth() {
  if (device && device.gatt.connected) {
    console.log(`Disconnecting from ${device.name}...`);
    device.gatt.disconnect();
  }
  resetConnection();

  // ✅ Update BLE Status
  updateBleStatus("Disconnected", false);
}

/**
 * Starts data streaming.
 */
export function startStreaming() {
  if (characteristic) {
    const command = new TextEncoder().encode("START");
    characteristic.writeValue(command).then(() => {
      console.log("Streaming started");
    });
  }
}

/**
 * Stops data streaming.
 */
export function stopStreaming() {
  if (characteristic) {
    const command = new TextEncoder().encode("STOP");
    characteristic.writeValue(command).then(() => {
      console.log("Streaming stopped");
    });
  }
}

/**
 * Handles data received from the BLE device.
 */
function handleCharacteristicValueChanged(event) {
  const rawData = new TextDecoder().decode(event.target.value);
  const values = rawData.split(",");

  if (values.length < 15) {
    console.warn("Incomplete data received:", rawData);
    return;
  }

  window.latestIMUData = values.map(parseFloat);
  console.log("Latest IMU Data Updated:", window.latestIMUData);

  // ✅ Update UI with received data
  showBleData(window.latestIMUData);

  // ✅ Update Debug Log
  debugLog.push(rawData);
  if (debugLog.length > DEBUG_LOG_LIMIT) debugLog.shift();
  showDebugLog(debugLog);
}

/**
 * Resets the BLE connection state.
 */
function resetConnection() {
  device = null;
  characteristic = null;
}

/**
 * Handles device disconnection event.
 */
function onDisconnected() {
  console.log("Device disconnected.");
  disconnectBluetooth();
}
