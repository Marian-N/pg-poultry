import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import EntityManager from './entities/EntityManager';
import Chick from '../resources/models/poultry/Chick.gltf';
import Goose from '../resources/models/poultry/Goose.gltf';
import Hen from '../resources/models/poultry/Hen.gltf';
import Turkey from '../resources/models/poultry/Turkey.gltf';
import Rooster from '../resources/models/poultry/Rooster.gltf';
import Sky from '../resources/background/sky_1.jpg';
import Entity from './entities/Entity';

class Game {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private running: boolean;
  private entityManager: EntityManager;
  private sun: THREE.DirectionalLight;
  private clock: THREE.Clock;
  private controls: OrbitControls;
  private animationActions: THREE.AnimationAction[] = []
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
    this.controls = this.init_controls();
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

    this.addLight();
    // this.addSkybox();
    this.addBackground();
    this.addGround();
    this.addChick(new THREE.Vector3(0, 0, 0));
    this.addChick(new THREE.Vector3(0, 0, 10));

    this.animate();
  }

  private addChick(pos: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    const loader = new GLTFLoader();
    loader.load(Chick, (gltf) => {
      const chick = gltf.scene;

      chick.position.set(pos.x, pos.y, pos.z);
      chick.scale.set(0.05, 0.05, 0.05);
      chick.rotateY(0.5);

      const chickEntity = this.entityManager.add(
        new Entity(chick)
      );

      const action = chickEntity.mixer.clipAction(gltf.animations[4]);
      chickEntity.animateAction.push(action);
      chickEntity.activeAction = chickEntity.animateAction[0];
      chickEntity.activeAction.play();
      
      this.scene.add(chick);
    });
  }

  private addSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      '../resources/skybox/px.png',
      '../resources/skybox/nx.png',
      '../resources/skybox/py.png',
      '../resources/skybox/ny.png',
      '../resources/skybox/pz.png',
      '../resources/skybox/nz.png'
    ]);
    this.scene.background = texture;
  }

  private addBackground() {
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load(Sky);
    this.scene.background = bgTexture;
  }

  private addGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({
        color: 0x50c878, // color of the ground
        side: THREE.DoubleSide, // render from both sides of the plane
        depthWrite: false, // do not write to the depth buffer
        reflectivity: 0.1, // how much light is reflected
        shininess: 10 // how shiny the reflection is
      })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }

  private addLight() {
    const light = new THREE.AmbientLight(0x404040, 0.2); // soft white light
    this.scene.add(light);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.running) return;
    this.renderer.render(this.scene, this.camera);
    this.entityManager.update(this.clock.getDelta());
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
    camera.position.setZ(100);
    camera.position.setY(100);
    camera.position.setX(100);
    return camera;
  }

  private init_sun() {
    const sun = new THREE.DirectionalLight(0xf4e99b, 1.0);
    sun.position.set(0, 1, 1);
    return sun;
  }

  private init_controls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 3; // decrease to 2.1 max
    controls.minPolarAngle = Math.PI / 5; // remove this line to remove the limit
    return controls;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default Game;
