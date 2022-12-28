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
import ChickenEntity from './entities/ChickenEntity';
import Pointer from './Pointer';
import Ui from './Ui';
import Farm from '../resources/models/farm/Farm.gltf';
import { entityManager, scene, stats, ui, gameController } from './globals';
import Stats from './Stats';
import GameController from './gameController';

class Game {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private running: boolean;
  private entityManager: EntityManager;
  private sun: THREE.DirectionalLight;
  private clock: THREE.Clock;
  private controls: OrbitControls;
  private animationActions: THREE.AnimationAction[] = [];
  private pointer: Pointer;
  private ui: Ui;
  private stats: Stats;
  private gameController: GameController;
  torus: THREE.Mesh;

  constructor() {
    this.running = false;
    this.init();
  }

  private init() {
    this.scene = scene;
    this.renderer = this.init_renderer();
    this.camera = this.init_camera();
    this.sun = this.init_sun();
    this.controls = this.init_controls();
    this.pointer = new Pointer();
    this.ui = ui.init(this.pointer);
    this.stats = stats.init({
      poultry: 0,
      eggs: 0,
      food: 100,
      money: 50
    });
    this.gameController = gameController;
    this.scene.add(this.sun);
    this.renderer.render(this.scene, this.camera);
    this.clock = new THREE.Clock();
    this.entityManager = entityManager;
    document.body.appendChild(this.renderer.domElement);
    this.addEventListeners();

    this.addLight();
    // this.addSkybox();
    this.addBackground();
    // this.addGround();  // ! delete this line
    this.addFarm();

    this.gameController.createChicken(new THREE.Vector3(0, 0, 0), 'm', 3);
    this.gameController.createChicken(new THREE.Vector3(0, 0, 10), 'f', 3);

    this.animate();
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

  private addFarm() {
    const loader = new GLTFLoader();
    loader.load(Farm, (gltf) => {
      // Add the GLTF object to the scene
      const farm = gltf.scene;
      const shadowCastObjects = [
        'tree',
        'bush',
        'fence',
        'house',
        'barrel',
        'wooden',
        'straw',
        'bucket'
      ];
      const shadowReceiveObjects = ['ground', 'Plane', 'grass'];
      farm.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (shadowCastObjects.some((name) => child.name.includes(name))) {
            child.castShadow = true;
          } else if (
            shadowReceiveObjects.some((name) => child.name.includes(name))
          ) {
            child.receiveShadow = true;
          }
        }
      });
      farm.scale.set(1.5, 1.5, 1.5);
      farm.position.set(-30, 0, -10);

      this.scene.add(farm);
    });
  }

  private addGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.MeshPhongMaterial({
        color: 0x50c878, // color of the ground
        side: THREE.DoubleSide, // render from both sides of the plane
        depthWrite: false, // do not write to the depth buffer
        reflectivity: 0.1, // how much light is reflected
        shininess: 10 // how shiny the reflection is
      })
    );
    ground.receiveShadow = true;
    ground.name = 'ground';
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    ground.geometry.computeBoundingBox();
  }

  private addLight() {
    const light = new THREE.AmbientLight(0x404040, 0.5); // soft white light
    this.scene.add(light);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.running) return;
    this.controls.update();
    this.pointer.update(this.camera, this.entityManager.getEntities());
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    const sun = new THREE.DirectionalLight(0xf4e99b, 1);
    sun.castShadow = true;
    sun.shadow.camera = new THREE.OrthographicCamera(
      -500,
      500,
      500,
      -500,
      0.5,
      1000
    );
    sun.shadow.mapSize.x = 8192;
    sun.shadow.mapSize.y = 8192;
    sun.position.set(100, 200, -100);
    sun.target.position.set(0, 0, 0);
    // DEBUG
    // var shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
    // this.scene.add(shadowHelper);
    // const helper = new THREE.DirectionalLightHelper(sun);
    // this.scene.add(helper);
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

  private addEventListeners() {
    window.addEventListener(
      'resize',
      () => {
        this.onWindowResize();
      },
      false
    );
    window.addEventListener('mousewheel', () => {
      this.onWindowScroll();
    });
    window.addEventListener('contextmenu', (event: MouseEvent) => {
      this.onWindowRightClick(event);
      return false;
    });
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onWindowRightClick(event: MouseEvent) {
    event.preventDefault();
    this.ui.popup.element.classList.remove('active');
  }

  private onWindowScroll() {
    this.ui.popup.element.classList.remove('active');
  }
}

export default Game;
