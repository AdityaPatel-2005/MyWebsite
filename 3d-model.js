import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 1. Get the container FIRST so we can measure its exact size
const container = document.getElementById('canvas-container') || document.getElementById('container3D');

if (!container) {
    console.error("Could not find the container div to append the 3D canvas.");
}

// Get the actual width and height of the container (fallback to window if not found)
const width = container ? container.clientWidth : window.innerWidth;
const height = container ? container.clientHeight : window.innerHeight;

// 2. Scene Setup
const scene = new THREE.Scene();
scene.background = null; // Keep background transparent for CSS themes

// 3. Camera Setup (Fixed Aspect Ratio)
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(5, 3, 5); // Adjust based on your model's scale

// 4. Renderer Setup (Fixed Size)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

if (container) {
    container.appendChild(renderer.domElement);
}

// 5. Realistic Environment Lighting
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// 6. Additional Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 7. Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 8. Loading the .glb Model
let mixer; // Used for animations
const loader = new GLTFLoader();

loader.load(
    './Untitled1.glb', 
    function (gltf) {
        // Hide loading text if it exists
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.style.display = 'none'; 
        
        const model = gltf.scene;
        
        // Center the model
        model.position.set(0, 0, 0);
        
        // Enable shadows for all meshes in the model
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(model);

        // Handle Animations
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened loading the model:', error);
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.innerText = 'Error loading model. Check console.';
    }
);

// 9. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Update the animation mixer if it exists
    if (mixer) {
        mixer.update(delta);
    }

    controls.update(); // Required for damping
    renderer.render(scene, camera);
}

animate();

// 10. Handle Container Resize (Upgraded to ResizeObserver)
// This watches the actual DIV instead of the whole window
const resizeObserver = new ResizeObserver(() => {
    if (!container) return; 
    
    // Get the exact, current dimensions of the red box
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    // Update the camera and renderer to match perfectly
    if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    }
});

// Start watching the container
if (container) {
    resizeObserver.observe(container);
}
