import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL';

class PoultryGame {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  torus: THREE.Mesh;
  _running: boolean;

  constructor() {
    this._running = false;
    this._init();
  }

  _init() {
    this.scene = new THREE.Scene();
    this.renderer = this._init_renderer();
    this.camera = this._init_camera();
    this.renderer.render(this.scene, this.camera);
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener(
      'resize',
      () => {
        this._onWindowResize();
      },
      false
    );

    const geometry = new THREE.TorusGeometry(
      window.innerWidth / 100,
      3,
      16,
      100
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6347,
      wireframe: true
    });
    this.torus = new THREE.Mesh(geometry, material);

    this.scene.add(this.torus);
    this._animate();
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    if (!this._running) return;
    this.renderer.render(this.scene, this.camera);
    this.torus.rotation.x += 0.01;
    this.torus.rotation.y += 0.005;
    this.torus.rotation.y += 0.01;
  }

  start() {
    this._running = true;
  }

  stop() {
    this._running = false;
  }

  _init_renderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }

  _init_camera(): THREE.PerspectiveCamera {
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 10000.0;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.setZ(50);
    return camera;
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

let P: PoultryGame;
window.addEventListener('DOMContentLoaded', () => {
  if (WebGL.isWebGLAvailable()) {
    P = new PoultryGame();
    P.start();
  } else {
    // Display error message if webgl is not supported
    const warning = WebGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
  }
});
