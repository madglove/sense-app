import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Get the container div
const container = document.getElementById('handModelView');

// Dynamically update the div's height
container.style.height = '500px';
container.style.width = '100%';

// Scene setup
const scene = new THREE.Scene();

// Adjust near/far planes to prevent clipping
const camera = new THREE.PerspectiveCamera(
    50, // Field of View (FoV)
    container.clientWidth / container.clientHeight, 
    0.01, // Near plane to avoid clipping
    500   // Far plane to keep objects visible
);
camera.position.set(0, 2, 3); // Temporary starting position

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.innerHTML = ''; 
container.appendChild(renderer.domElement);

// 🔥 FIX: ADD TWO LIGHTS FOR BETTER VISIBILITY
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, -5, 5); // Light from front-right
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xffffff, 0.2);
light2.position.set(-5, 5, -5); // Light from back-left (opposite direction)
scene.add(light2);

// Load GLB model
const loader = new GLTFLoader();
loader.load('/app/models/low-poly_hand_with_animation.glb', function (gltf) {
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

    // Move camera slightly left (-X) for better angle
    camera.position.set(-idealCameraZ / 3, maxDim / 2, idealCameraZ);

    // Prevent objects from disappearing
    camera.far = idealCameraZ * 3;
    camera.updateProjectionMatrix();

    // Set OrbitControls target to model center
    controls.target.set(center.x, center.y, center.z);
    controls.update();

    // Handle animation if present
    const mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        mixer.update(0.01);
        renderer.render(scene, camera);
    }
    animate();
}, undefined, function (error) {
    console.error('Error loading model:', error);
});

// Orbit Controls for better interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 1;

// Resize handling
window.addEventListener('resize', () => {
    container.style.height = '500px';
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
