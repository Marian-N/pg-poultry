import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import EntityManager from './entities/EntityManager';
import Cow from '../resources/models/poultry/Cow.gltf';
import Entity from './entities/Entity';

class Game {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private running: boolean;
  private entityManager: EntityManager;
  private sun: THREE.DirectionalLight;
  private clock: THREE.Clock;
  torus: THREE.Mesh;

  constructor() {
    this.running = false;
    this.init();
  }

  private init() {
    this.scene = new THREE.Scene();
    this.renderer = this.init_renderer();
    this.camera = this.init_camera();
    this.sun = this.init_sun();
    this.scene.add(this.sun);
    this.renderer.render(this.scene, this.camera);
    this.clock = new THREE.Clock();
    this.entityManager = new EntityManager();
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener(
      'resize',
      () => {
        this.onWindowResize();
      },
      false
    );
    this.addCow();

    this.animate();
  }

  private addCow() {
    const loader = new GLTFLoader();
    loader.load(Cow, (gltf) => {
      const cow = gltf.scene;
      cow.position.set(0, -5, 30);
      cow.scale.set(2, 2, 2);
      cow.rotateY(0.5);

      const mixer = new THREE.AnimationMixer(cow);
      const action = mixer.clipAction(gltf.animations[4]);
      action.play();
      this.entityManager.add(
        new Entity(cow).setUpdate(() => {
          mixer.update(this.clock.getDelta());
        })
      );
      this.scene.add(cow);
    });
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

  private init_sun() {
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(0, 0, 1);
    return sun;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default Game;
