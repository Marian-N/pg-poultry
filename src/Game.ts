import * as THREE from 'three';
import { randInt } from 'three/src/math/MathUtils';
import Entity from './entities/Entity';
import EntityManager from './entities/EntityManager';

class Game {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private running: boolean;
  private entityManager: EntityManager;
  torus: THREE.Mesh;

  constructor() {
    this.running = false;
    this.init();
  }

  private init() {
    this.scene = new THREE.Scene();
    this.renderer = this.init_renderer();
    this.camera = this.init_camera();
    this.renderer.render(this.scene, this.camera);
    this.entityManager = new EntityManager();
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener(
      'resize',
      () => {
        this.onWindowResize();
      },
      false
    );
    this.generateToruses();

    this.animate();
  }

  private generateToruses() {
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.TorusGeometry(randInt(10, 30), 3, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        wireframe: true
      });
      this.torus = new THREE.Mesh(geometry, material);
      this.scene.add(this.torus);
      this.torus.position.set(randInt(-10, 10), randInt(-10, 10), 0);

      const entity = new Entity(this.torus);
      entity.setUpdate(() => {
        entity.object.rotation.x += 0.01;
        entity.object.rotation.y += 0.005;
        entity.object.rotation.y += 0.01;
      });
      this.entityManager.add(entity);
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.running) return;
    this.renderer.render(this.scene, this.camera);
    this.entityManager.update();
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  private init_renderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }

  private init_camera(): THREE.PerspectiveCamera {
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 10000.0;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.setZ(50);
    return camera;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default Game;
