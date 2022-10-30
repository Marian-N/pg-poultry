import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera();

const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(500, 500);
camera.position.setZ(40);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({
  color: 0xff6347,
  wireframe: true
});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

if (WebGL.isWebGLAvailable()) {
  // Initiate function or other initializations here
  document.body.appendChild(renderer.domElement);
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.y += 0.01;
}
