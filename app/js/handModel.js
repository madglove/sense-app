import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, handModel, mixer, animationClip, animationAction; // Added animationAction

// using this model https://sketchfab.com/3d-models/low-poly_hand_with_animation.glb

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000); // Aspect ratio will be set later

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    const handModelContainer = document.getElementById('handModelView');

    // Get the width and height of the container
    const width = handModelContainer.offsetWidth;
    const height = handModelContainer.offsetHeight;

    console.log("handModelView div dimensions:", width, height); // *** DEBUG LOG 1: Container Dimensions ***

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    handModelContainer.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // 5. 3D Model Loading
    const loader = new GLTFLoader();
    loader.load('app/models/low-poly_hand_with_animation.glb', (gltf) => {
        handModel = gltf.scene;
        scene.add(handModel);

        console.log("Model loaded successfully:", handModel); // *** DEBUG LOG 2: Model Load Success ***

        // --- Animation Setup (Corrected) ---
        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(handModel);
            animationClip = gltf.animations[0];
            animationAction = mixer.clipAction(animationClip); // Create and store the action
            animationAction.play(); // Initially play the animation (important!)
            animationAction.paused = true; // Immediately pause it

            // Create a slider to control the animation
            createAnimationControlSlider();
        }
        // --- End Animation Setup ---

        // --- Calculate Bounding Box and Adjust Camera ---
        const boundingBox = new THREE.Box3().setFromObject(handModel);
        const size = boundingBox.getSize(new THREE.Vector3());
        const center = boundingBox.getCenter(new THREE.Vector3());

        // Adjust camera position
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 2.5;

        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);
        controls.target.copy(center);

        // --- Scale Down the Model (to 0.2) ---
        handModel.scale.set(0.2, 0.2, 0.2); // Scale down to 20%
        // --- End Model Scaling ---

        handModel.rotation.x = 0;
        handModel.rotation.y = Math.PI;
        handModel.rotation.z = 0;
        handModel.position.set(0, 0, 0);

        handModel.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x808080,
                    roughness: 0.7,
                    metalness: 0.2,
                });
            }
        });

        console.log("Camera Position:", camera.position); // *** DEBUG LOG 3: Camera Position ***
        console.log("Camera LookAt Target:", controls.target); // *** DEBUG LOG 4: Camera Target ***
        console.log("Hand Model Position:", handModel.position); // *** DEBUG LOG 5: Model Position ***
        console.log("Hand Model Scale:", handModel.scale); // *** DEBUG LOG 6: Model Scale ***
        console.log("Hand Model Rotation:", handModel.rotation); // *** DEBUG LOG 7: Model Rotation ***
        console.log("Bounding Box Size:", size); // *** DEBUG LOG 8: Bounding Box Size ***
        console.log("Bounding Box Center:", center); // *** DEBUG LOG 9: Bounding Box Center ***


    },
    undefined,
    (error) => {
        console.error('An error happened while loading the model:', error); // Error log remains
    });

    // 6. Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 100;

    // 7. Handle Window Resize
    window.addEventListener('resize', onWindowResize);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (mixer) {
        mixer.update(0); // Keep delta time at 0 for manual control
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    const handModelContainer = document.getElementById('handModelView');
    const newWidth = handModelContainer.offsetWidth;
    const newHeight = handModelContainer.offsetHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

// --- Corrected Animation Control Slider Function ---
function createAnimationControlSlider() {
    const handModelContainer = document.getElementById('handModelView');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = animationClip.duration;
    slider.step = 0.01;
    slider.value = 0;
    slider.style.width = '80%';
    slider.style.marginTop = '10px';

    const sliderContainer = document.createElement('div');
    sliderContainer.style.display = 'flex';
    sliderContainer.style.justifyContent = 'center';
    sliderContainer.style.alignItems = 'center';


    slider.addEventListener('input', () => {
        if (mixer && animationAction) { // Check for both mixer and action
            const time = parseFloat(slider.value);
            animationAction.paused = false; // Unpause before setting time
            animationAction.time = time;    // Directly set the time on the action
            animationAction.paused = true; // Pause again immediately
        }
    });


    sliderContainer.appendChild(slider);
    handModelContainer.appendChild(sliderContainer);
}
// --- End Corrected Function ---


// Cleanup (same as before)
function cleanup() {
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
    }
    if (scene) {
        scene.traverse(object => {
            if (!object.isMesh) return;

            object.geometry.dispose();

            if (object.material.isMaterial) {
                cleanMaterial(object.material);
            } else {
                // an array of materials
                for (const material of object.material) cleanMaterial(material);
            }
        });
        scene = null;
    }

    if(camera){
        camera = null;
    }

    if(controls){
        controls.dispose();
        controls = null;
    }

    if(mixer){
        mixer = null;
    }

    if(handModel){
        handModel = null;
    }

    if(animationAction) {
        animationAction = null;
    }

    //Remove from DOM
    const handModelContainer = document.getElementById('handModelView');
    while (handModelContainer.firstChild) {
        handModelContainer.removeChild(handModelContainer.firstChild);
    }

}

function cleanMaterial(material) {
    material.dispose();

    // dispose textures
    for (const key of Object.keys(material)) {
        const value = material[key]
        if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose()
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Directly call init() when the DOM is ready, no button click needed
    init();

    const views = ['btnLogin', 'btnPatient', 'btnBluetooth'];
    views.forEach(viewId => {
        document.getElementById(viewId).addEventListener('click', cleanup);
    });
});