import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Scene Setup
const container = document.getElementById('container3D');
const scene = new THREE.Scene();

// 2. Camera Setup
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 5;

// 3. Renderer Setup (THIS MAKES THE BACKGROUND TRANSPARENT)
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true 
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0); 
container.appendChild(renderer.domElement);

// 4. Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight1.position.set(5, 5, 5);
scene.add(directionalLight1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight2.position.set(-5, 5, 5);
scene.add(directionalLight2);

// 5. Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.autoRotate = true; 
controls.autoRotateSpeed = 2.50;
controls.enableZoom = false; 

// 6. Load Your Actual .glb Model
const loader = new GLTFLoader();

// *** CHANGE THIS NAME TO MATCH YOUR ACTUAL FILE ***
loader.load('rabbit4.glb', function (gltf) {
    const model = gltf.scene;
    
    // Auto-center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    
    scene.add(model);
}, undefined, function (error) {
    console.error('An error happened loading the model:', error);
});

// 7. Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// 8. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}

animate();
