# Madglove Sense Web Application

This web application provides a user interface for interfacing with the Madglove Sense v0.21 embedded system via Bluetooth Low Energy (BLE). It receives and displays IMU and BMP280 sensor data, visualizes hand movements using 3D models and webcam input, and manages patient and account information.

## Table of Contents

* [1. Introduction](#1-introduction)
* [2. Features](#2-features)
* [3. Getting Started](#3-getting-started)
    * [3.1. Prerequisites](#31-prerequisites)
    * [3.2. Installation](#32-installation)
    * [3.3. Usage](#33-usage)
* [4. Application Structure](#4-application-structure)
    * [4.1. HTML Structure](#41-html-structure)
    * [4.2. JavaScript Functionality](#42-javascript-functionality)
* [5. JavaScript Files](#5-javascript-files)
* [6. Dependencies](#6-dependencies)
* [7. Contributing](#7-contributing)
* [8. License](#8-license)
* [9. Contact](#9-contact)

## 1. Introduction

The Madglove Sense web application is designed to provide a comprehensive interface for the Madglove Sense v0.21 embedded system. It allows users to connect via Bluetooth, visualize sensor data, track hand movements, and manage user and patient information.

## 2. Features

* **Bluetooth Low Energy (BLE) Connectivity:** Connects to the Madglove Sense device to receive sensor data.
* **Real-time Sensor Data Visualization:** Displays IMU and BMP280 sensor data in charts and graphs.
* **3D Hand Model Visualization:** Visualizes hand movements using a 3D model based on sensor data.
* **Webcam Hand Tracking:** Integrates webcam input with MediaPipe for hand tracking and visualization.
* **Patient Data Management:** Allows users to select and manage patient data.
* **Account Management:** Handles user login/logout and account information.
* **Responsive User Interface:** Built with Bootstrap for a consistent and responsive experience across devices.

## 3. Getting Started

### 3.1. Prerequisites

* A web browser that supports Bluetooth Low Energy (Chrome, Edge, etc.).
* A Bluetooth-enabled device to connect to the Madglove Sense v0.21.
* Madglove Sense v0.21 device setup and running.

### 3.2. Installation

1.  Clone the repository or download the files.
2.  Open the `index.html` file in your web browser.

### 3.3. Usage

1.  Navigate to the "Bluetooth" tab and connect to the Madglove Sense device.
2.  Go to the "Dashboard" tab to view sensor data and hand movement visualizations.
3.  Use the "Patient" and "Account" tabs to manage patient and user information.
4.  Use the "START" and "STOP" commands to control data streaming from the device.

## 4. Application Structure

### 4.1. HTML Structure

The `index.html` file provides the main structure of the web application. It includes:

* A header with the application logo and title.
* Tab navigation for different views (Dashboard, Bluetooth, Patient, Account).
* Sections for sensor data visualization, hand model display, webcam input, and patient/account management.
* Inclusion of external libraries (Bootstrap, Three.js, MediaPipe, Chart.js).
* Loading of JavaScript files for application logic.

### 4.2. JavaScript Functionality

The JavaScript files handle the application's functionality, including:

* Bluetooth communication.
* Sensor data processing and visualization.
* 3D hand model rendering.
* Webcam hand tracking.
* User interface interactions.

## 5. JavaScript Files

* **`app/js/ble.js`:** Handles Bluetooth Low Energy (BLE) communication, including device connection, data reception, and command sending.
* **`app/js/charts.js`:** Manages the creation and updating of charts for sensor data visualization using Chart.js.
* **`app/js/webcam.js`:** Integrates webcam input and displays the video stream in the application.
* **`app/js/handModel.js`:** Uses Three.js to render and animate the 3D hand model based on sensor data.
* **`app/js/handTracking.js`:** Integrates MediaPipe for hand tracking using webcam input and overlays hand landmarks.
* **`app/js/bleStatus.js`:** Handles the display of the BLE connection status and connection/disconnection actions.
* **`app/js/bleRecording.js`:** Manages the data recording functions, like starting and stopping data collection.

## 6. Dependencies

* **Bootstrap:** For responsive styling.
* **Three.js:** For 3D rendering and animation.
* **MediaPipe:** For hand tracking using webcam input.
* **Chart.js:** For creating charts and graphs.
* **Material Components Web:** For mediapipe styling.

## 7. Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

**Contribution Guidelines:**

1.  **Fork the repository:** Create your own fork of the project.
2.  **Create a branch:** Make your changes in a separate branch.
3.  **Commit your changes:** Clearly describe your changes in the commit message.
4.  **Submit a pull request:** Explain the changes you've made and why they are needed.

## 8. License

Madglove Amsterdam B.V. holds the rights for this project.

## 9. Contact

For any questions or issues, please contact Tony at tony@olivabot.com or open an issue on this repository.
