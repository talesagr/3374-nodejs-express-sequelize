import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLogoGroupFromFile } from './ribbon.js';

const canvas = document.getElementById('logo-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f5f0);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 3.1);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.5;
controls.maxDistance = 6;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
keyLight.position.set(2.5, 3, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xfff0dd, 0.5);
fillLight.position.set(-3, -1, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffe8cc, 0.65);
rimLight.position.set(0, 2, -3);
scene.add(rimLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.28));

const materials = {
  gold: new THREE.MeshPhysicalMaterial({
    color: 0xc9a227,
    metalness: 0.75,
    roughness: 0.28,
    clearcoat: 0.2,
    clearcoatRoughness: 0.25,
    emissive: 0x3a2800,
    emissiveIntensity: 0.08,
  }),
  burgundy: new THREE.MeshPhysicalMaterial({
    color: 0x722f37,
    metalness: 0.5,
    roughness: 0.32,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  }),
};

const logo = await createLogoGroupFromFile(materials);
logo.traverse((obj) => {
  if (obj.isMesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});
scene.add(logo);

const animateToggle = document.getElementById('toggle-animate');
const exportBtn = document.getElementById('export-png');
let autoRotate = true;

animateToggle.addEventListener('click', () => {
  autoRotate = !autoRotate;
  animateToggle.textContent = autoRotate ? 'Pausar rotação' : 'Rotacionar';
});

exportBtn.addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = 'logo-3d.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  if (autoRotate) {
    logo.rotation.y = Math.sin(t * 0.35) * 0.5;
    logo.rotation.x = Math.sin(t * 0.22) * 0.1;
  }
  controls.update();
  renderer.render(scene, camera);
}

animate();
