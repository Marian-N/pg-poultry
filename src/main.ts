import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL';

let scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  clock: THREE.Clock,
  torus: THREE.Mesh;

if (WebGL.isWebGLAvailable()) {
  init();
  animate();
} else {
  // Display error message if webgl is not supported
  const warning = WebGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    100
  );
  renderer = new THREE.WebGLRenderer();
  clock = new THREE.Clock();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.setZ(40);

  renderer.render(scene, camera);

  const geometry = new THREE.TorusGeometry(window.innerWidth / 100, 3, 16, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff6347,
    wireframe: true
  });
  torus = new THREE.Mesh(geometry, material);

  window.addEventListener('resize', onWindowResize);
  document.body.appendChild(renderer.domElement);
  scene.add(torus);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.y += 0.01;
}
