import * as THREE from 'three';
import Entity from './Entity';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Hen from '../../resources/models/poultry/Hen.gltf';
import Rooster from '../../resources/models/poultry/Rooster.gltf';

class ChickenEntity extends Entity {
  private elapsedTimeSec: number = 0;
  private elapsedTime: number = 0;
  private elapsedTimeMin: number = 0;
  private healthDecayTimer: number = 0;
  public gender: string; // m/f - random
  public age: number; // days 0-2 child, 3-9 adult, 10+ old (random death)
  private isAdult: boolean = false;
  public food: number; // 0-100 - 100 is full, 0 survives 30s then dies
  public care: number; // 0-100 - aritmetic mean of food, water and care
  public health: number; // 0-100 - on 0 food or 0 water starts to decrease after 30s; on age > 10 starts to decrease,
  public eggLayer: boolean; // true/false - f and adult and care > 70

  constructor(object: THREE.Object3D, gender?: string, age?: number) {
    super(object);
    this.age = age ? age : 0;
    this.food = 80;
    this.care = 80;
    this.health = 100;
    this.eggLayer = false;
    this.gender = gender ? gender : Math.random() > 0.5 ? 'm' : 'f';
  }

  /**
   * Update food every second by 0.5
   * If food is 0 start decrease health timer
   */
  updateFoodStat() {
    if (this.food > 0) {
      this.food -= 0.5;
    }
  }

  /**
   * Update health every second
   * If food is 0 start decrease health timer
   * If health timer reaches 30s start decrease health
   * If food is > 0 start increase health and reset health timer
   * If age is > 10 start decrease health
   * TODO if health is 0 = death
   */
  updateHealth() {
    if (this.food == 0) {
      this.healthDecayTimer += 1;
    } else {
      this.healthDecayTimer = 0;
    }

    if (this.healthDecayTimer >= 30 && this.health > 0) {
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
  walk() {
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
        if (random < 0.2) {
          this.changeAnimation('Idle');
        } else if (random < 0.8) {
          this.changeAnimation('Walk');
          this.object.rotation.y = (Math.random() * 2 - 1) * Math.PI;
        } else {
          this.changeAnimation('Peck');
        }
      }

      // update stats every 10s
      if (this.elapsedTimeSec % 10 == 0 && this.elapsedTimeSec != 0) {
        // update care
        this.updateCareStat();
      }

      // lay egg every 30s
      if (this.elapsedTimeSec % 30 == 0 && this.elapsedTimeSec != 0) {
        // TODO lay egg
      }

      // update to adult
      if (this.age > 2 && !this.isAdult) {
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

      //update eggLayer - f and adult and care > 70
      if (this.age > 2 && this.age < 10) {
        if (this.gender == 'f' && this.care > 70) this.eggLayer = true;
        else {
          this.eggLayer = false;
        }
      } else {
        this.eggLayer = false;
      }
    }

    // walk
    if (this.activeAction.getClip().name == 'Walk') {
      this.walk();
    }
  }
}

export default ChickenEntity;
