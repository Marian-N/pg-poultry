import * as THREE from 'three';
import Entity from './Entity';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Hen from '../../resources/models/poultry/Hen.gltf';
import Rooster from '../../resources/models/poultry/Rooster.gltf';
import Egg from '../../resources/models/poultry/Egg.gltf';
import { entityManager, scene, stats } from '../globals';
import EggEntity from './EggEntity';
import Stats from '../Stats';

const radius = 90;
const angle = 0;
const x = radius * Math.cos(angle);
const z = radius * Math.sin(angle);

class ChickenEntity extends Entity {
  private healthDecayTimer: number = 10;
  public gender: string; // m/f - random
  public age: number; // days 0-2 child, 3-9 adult, 10+ old (random death)
  private isAdult: boolean = false;
  public food: number; // 0-100 - 100 is full, 0 survives 30s then dies
  public care: number; // 0-100 - aritmetic mean of food, water and care
  public health: number; // 0-100 - on 0 food or 0 water starts to decrease after 30s; on age > 10 starts to decrease,
  public eggLayer: boolean; // true/false - f and adult and care > 70
  private isDead: boolean = false;

  constructor(object: THREE.Object3D, gender?: string, age?: number) {
    super(object);
    this.age = age ? age : 0;
    this.food = 80;
    this.care = 80;
    this.health = 100;
    this.eggLayer = false;
    this.gender = gender ? gender : Math.random() > 0.5 ? 'm' : 'f';
    if (age) {
      this.elapsedTimeMin = age;
      this.elapsedTimeSec = age * 60;
      this.elapsedTime = age * 60;
      this.toggleEggLayer();
    }
  }

  /**
   * Update food every second by 0.5
   * If food is 0 start decrease health timer
   * If it includes parameters to increase food, increase food by that number
   */
  updateFoodStat(increase?: boolean, increaseNumber?: number) {
    if (!increase) {
      if (this.food > 0) {
        this.food -= 0.5;
      }
    }
    if (increase && increaseNumber) {
      if (this.food <= 100 - increaseNumber) {
        this.food += increaseNumber;
      } else {
        this.food = 100;
      }
    }
  }

  /**
   * Update health every second
   * If food is 0 start decrease health timer
   * If health timer reaches 30s start decrease health
   * If food is > 0 start increase health and reset health timer
   * If age is > 10 start decrease health
   */
  updateHealth() {
    if (this.food == 0) {
      this.healthDecayTimer -= 1;
    } else {
      this.healthDecayTimer = 10;
    }

    if (this.healthDecayTimer <= 0 && this.health > 0) {
      this.health -= 1;
    }

    if (this.food > 0 && this.health < 100 && this.age <= 10) {
      this.health += 1;
    }

    if (this.age > 10) {
      this.health -= 1;
    }
  }

  /**
   * Change model to adult
   * Change mixer to adult animation
   */
  changeModel(model: any) {
    const loader = new GLTFLoader();
    loader.load(model, (gltf) => {
      // get scene from parent
      const scene = this.object.parent;
      // create new object
      const newObject = gltf.scene;
      // copy position, scale and rotation
      newObject.position.copy(this.object.position);
      newObject.scale.copy(this.object.scale);
      newObject.rotation.copy(this.object.rotation);
      // remove old object and replace with new one
      scene?.remove(this.object);
      this.object = newObject;
      // clickability
      this.object.userData.isContainer = true;
      // cast shadow
      this.object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
        }
      });

      // scale
      this.object.scale.set(0.06, 0.06, 0.06);

      // animation
      this.mixer = new THREE.AnimationMixer(newObject);
      // get all available animations
      const animations = gltf.animations;
      this.animationActions = [];
      // Iterate over the animations and push them into the animationActions array
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        this.animationActions.push(this.mixer.clipAction(animation));
      }
      const animationClip = gltf.animations.find(
        (animation) => animation.name === this.activeAction.getClip().name
      );
      if (animationClip) {
        const action = this.mixer.clipAction(animationClip);
        action.play();
      }

      // add to scene
      scene?.add(newObject);
    });
  }

  /**
   * Update care every second
   * Aritmetic mean of food and care
   */
  updateCareStat() {
    this.care = (this.food + this.care) / 2;
  }

  /**
   *
   * @param animationName
   *
   * Change animation to animationName
   */
  changeAnimation(animationName: string) {
    const animationAction = this.animationActions.find(
      (action) => action.getClip().name === animationName
    );
    if (animationAction) {
      this.lastAction = this.activeAction;
      this.activeAction = animationAction;
      this.mixer.stopAllAction();
      animationAction?.play();
    }
  }

  /**
   * Do walk animation
   * If out of bounds rotate 180 degrees
   */
  walkSquare() {
    const plane = this.object.parent?.getObjectByName('ground') as THREE.Mesh;
    if (plane) {
      const boundingBox = plane.geometry.boundingBox;

      const minX = boundingBox ? boundingBox.min.x : 0;
      const maxX = boundingBox ? boundingBox.max.x : 0;
      const minZ = boundingBox ? boundingBox.min.y : 0;
      const maxZ = boundingBox ? boundingBox.max.y : 0;

      // Check if the this.object has moved outside the boundaries
      if (
        this.object.position.x < minX + 5 ||
        this.object.position.x > maxX - 5 ||
        this.object.position.z < minZ + 5 ||
        this.object.position.z > maxZ - 5
      ) {
        // Rotate the object 180 degrees around the y-axis
        this.object.rotation.y += Math.PI;
      }
    }

    const speed = 0.1;
    let direction = new THREE.Vector3(0, 0, 1);

    this.object.translateOnAxis(direction, speed);
  }

  walkCircle() {
    if (this.object.position.length() > radius) {
      // Rotate the object 180 degrees around the y-axis
      this.object.rotation.y += Math.PI;
    }

    const speed = 0.1;
    let direction = new THREE.Vector3(0, 0, 1);

    this.object.translateOnAxis(direction, speed);
  }

  /**
   * Create egg object
   */
  layEgg() {
    const loader = new GLTFLoader();
    loader.load(Egg, (gltf) => {
      const egg = gltf.scene;
      egg.position.copy(this.object.position);
      egg.position.y += 1;
      // egg.position.z -= 8;
      // egg.position.x -= 3;
      egg.scale.set(5, 5, 5);
      scene.add(egg);
      const eggEntity = new EggEntity(egg);
      entityManager.add(eggEntity);
      // this.changeAnimation('Jump');
      this.playAnimationOnce('Jump');
    });
  }

  /**
   * Toggle eggLayer based on age, gender and care
   */
  toggleEggLayer() {
    //update eggLayer - f and adult and care > 70
    if (this.age > 2 && this.age < 10) {
      if (this.gender == 'f' && this.care > 50) {
        this.eggLayer = true;
      } else {
        this.eggLayer = false;
      }
    } else {
      this.eggLayer = false;
    }
  }

  /**
   * Play animation once, then return to active animation
   */
  playAnimationOnce(animationName: string) {
    const animationAction = this.animationActions.find(
      (action) => action.getClip().name === animationName
    );
    if (animationAction) {
      this.lastAction = this.activeAction;
      this.activeAction = animationAction;
      animationAction?.setLoop(THREE.LoopOnce, 1);
      animationAction.clampWhenFinished = true;
      this.lastAction.fadeOut(0.5);
      animationAction.reset().fadeIn(0.5).play();

      if (animationName != 'Death') {
        this.activeAction = this.lastAction;
        animationAction?.fadeOut(0.5);
        this.lastAction.reset().fadeIn(0.5).play();
      }
    }
  }

  /**
   * Takes care of death of object
   */
  die() {
    this.playAnimationOnce('Death');
    this.isDead = true;
    setTimeout(() => {
      this.object.parent?.remove(this.object);
      entityManager.remove(this);
      stats.poultry--;
    }, 2000);
  }

  update(time: number) {
    super.update(time);
    this.elapsedTime += time;

    // update stats every 1s
    if (this.elapsedTimeSec != Math.floor(this.elapsedTime)) {
      this.elapsedTimeSec = Math.floor(this.elapsedTime);
      // update food
      this.updateFoodStat();
      // update health
      this.updateHealth();

      // update stats every 5s
      if (this.elapsedTimeSec % 5 == 0 && this.elapsedTimeSec != 0) {
        // update animation - idle 20% chance / walk 60% chance / peck 20% chance
        const random = Math.random();
        if (!this.isDead) {
          // TODO fear animation probability 0.8 if health < 20%
          if (random < 0.2) {
            this.changeAnimation('Idle');
          } else if (random < 0.8) {
            this.changeAnimation('Walk');
          } else {
            this.changeAnimation('Peck');
          }
          this.object.rotation.y = (Math.random() * 2 - 1) * Math.PI;
        }
      }

      // update stats every 10s
      if (this.elapsedTimeSec % 10 == 0 && this.elapsedTimeSec != 0) {
        // update care
        this.updateCareStat();
      }

      // lay egg every 30s
      if (this.elapsedTimeSec % 30 == 0 && this.elapsedTimeSec != 0) {
        if (this.eggLayer && !this.isDead) {
          this.toggleEggLayer();
          if (this.eggLayer) this.layEgg();
        }
      }

      // update to adult
      if (this.age > 2 && !this.isAdult && !this.isDead) {
        this.isAdult = true;
        if (this.gender == 'f') this.changeModel(Hen);
        else this.changeModel(Rooster);
      }
    }

    // update stats every 1min
    if (this.elapsedTimeMin != Math.floor(this.elapsedTime / 60)) {
      this.elapsedTimeMin = Math.floor(this.elapsedTime / 60);
      //update age
      this.age = this.elapsedTimeMin;
      this.toggleEggLayer();
    }

    // walk
    if (this.activeAction.getClip().name == 'Walk') {
      this.walkCircle();
    }

    // death
    if (this.health <= 0 && !this.isDead) {
      this.die();
    }
  }
}

export default ChickenEntity;
