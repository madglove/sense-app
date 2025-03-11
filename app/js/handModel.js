import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Get the container div and clear its content
const container = document.getElementById('handModelView');
container.innerHTML = '';
container.style.height = '500px';
container.style.width = '100%';

// Create a Bootstrap-styled toggle button to start/stop the render loop
const toggleButton = document.createElement('button');
toggleButton.id = 'toggleRenderButton';
toggleButton.className = 'btn btn-primary mb-2';
toggleButton.textContent = 'Start Render';
container.appendChild(toggleButton);

// Create a text element to display the hand state (0 = closed, 100 = open)
const handText = document.createElement('p');
handText.id = 'handText';
handText.textContent = 'Hand Open: 0';
container.appendChild(handText);

// Create a div to host the renderer's canvas
const canvasContainer = document.createElement('div');
canvasContainer.id = 'canvasContainer';
canvasContainer.style.height = '500px';
canvasContainer.style.width = '100%';
canvasContainer.style.display = 'none'; // Initially hidden
container.appendChild(canvasContainer);

// Use the container's dimensions (which are always visible) for initial sizing
const fixedHeight = 500;
const initialWidth = container.clientWidth;

// Scene setup
const scene = new THREE.Scene();

// Set up camera using the container's dimensions
const camera = new THREE.PerspectiveCamera(
    50, 
    initialWidth / fixedHeight, 
    0.01, 
    500
);
camera.position.set(0, 2, 3);

// Renderer setup using container dimensions
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(initialWidth, fixedHeight);
canvasContainer.appendChild(renderer.domElement);

// Add two lights for better visibility
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, -5, 5);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xffffff, 0.2);
light2.position.set(-5, 5, -5);
scene.add(light2);

// OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 1;

// Global variables for animation control
let mixer;
let action; // Reference to the animation action
let animationId = null;
let running = false;

// Load GLB model
const loader = new GLTFLoader();
loader.load('app/models/low-poly_hand_with_animation.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    // Compute bounding box to auto-adjust camera
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Center the model
    model.position.sub(center);

    // Auto-scale model if it's too large
    const maxDim = Math.max(size.x, size.y, size.z);
    const idealCameraZ = maxDim * 1.5;

    // Adjust camera for a better angle
    camera.position.set(-idealCameraZ / 3, maxDim / 2, idealCameraZ);

    // Update camera settings
    camera.far = idealCameraZ * 3;
    camera.updateProjectionMatrix();

    // Set OrbitControls target to model center
    controls.target.copy(center);
    controls.update();

    // Handle animation if present
    mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
        action = mixer.clipAction(gltf.animations[0]);
        action.play();
        // Immediately pause the action so it doesn't advance automatically.
        action.paused = true;
    }
}, undefined, function (error) {
    console.error('Error loading model:', error);
});

// Global variable to keep track of the last hand value for smoothing.
// Start fully open at 0 (or partially open at 50, or fully closed at 100).
let cumulativeHandValue = 0; 
let previousHandValue = 0;    // Used for smoothing


function updateHandAnimation() {
    // Ensure the global IMU data exists and the animation is ready.
    if (window.latestIMUData && action && mixer) {
        const imuData = window.latestIMUData;
        // Indices for x-axis gyro:
        // imu1.gyro.x -> index 6, imu2.gyro.x -> index 12
        const rawDiff = imuData[12] - imuData[6];
        
        // 1) Interpret rawDiff as the incremental change in the hand's "angle."
        //    Positive -> closes more, Negative -> opens more.
        //    Adjust the factor if the effect is too small/large.
        const integrationFactor = 0.1;
        
        // Update the cumulative hand value. 
        // For example, if rawDiff is +5 => we close more, if -5 => open more.
        cumulativeHandValue += rawDiff * integrationFactor;
        
        // 2) Clamp between 0 (fully open) and 100 (fully closed).
        if (cumulativeHandValue < 0) {
            cumulativeHandValue = 0;
        } else if (cumulativeHandValue > 100) {
            cumulativeHandValue = 100;
        }
        
        // 3) Optionally smooth the transition from the old position to the new one.
        //    If you want more immediate changes, increase smoothingFactor
        //    or remove smoothing entirely.
        const smoothingFactor = 0.005;  
        const handValue =
            previousHandValue + smoothingFactor * (cumulativeHandValue - previousHandValue);
        previousHandValue = handValue;
        
        // 4) Map 0–100 to the first half of the animation clip duration.
        const duration = action.getClip().duration;
        action.time = (handValue / 100) * (duration / 2);
        
        // 5) Force an immediate update so the change is visible now.
        mixer.update(0);
        
        // 6) Update your text element.
        handText.textContent = `Hand State: ${Math.round(handValue)}`;
    }
}

// Animation loop function.
// Note: We no longer update the mixer automatically—only our IMU-based function drives it.
function animate() {
    if (!running) return;
    animationId = requestAnimationFrame(animate);
    // Update the hand animation based on the latest IMU data.
    updateHandAnimation();
    controls.update();
    renderer.render(scene, camera);
}

// Toggle button event listener to start/stop the render loop
toggleButton.addEventListener('click', function() {
    if (!running) {
        running = true;
        toggleButton.textContent = 'Stop Render';
        canvasContainer.style.display = 'block';
        const width = container.clientWidth;
        renderer.setSize(width, fixedHeight);
        camera.aspect = width / fixedHeight;
        camera.updateProjectionMatrix();
        animate();
    } else {
        running = false;
        toggleButton.textContent = 'Start Render';
        canvasContainer.style.display = 'none';
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
});

// Resize handling using container's dimensions
window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    camera.aspect = newWidth / fixedHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, fixedHeight);
});
