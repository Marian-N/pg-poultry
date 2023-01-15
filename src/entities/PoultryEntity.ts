import * as THREE from 'three';
import Entity from './Entity';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Hen from '../../resources/models/poultry/Hen.fbx';
import Rooster from '../../resources/models/poultry/Rooster.fbx';
import HenTexture from '../../resources/models/poultry/Tex_Hen.png';
import RoosterTexture from '../../resources/models/poultry/Tex_Rooster.png';
import Goose from '../../resources/models/poultry/Goose.fbx';
import GooseTexture from '../../resources/models/poultry/Tex_Goose.png';
import Turkey from '../../resources/models/poultry/Turkey.fbx';
import TurkeyTexture from '../../resources/models/poultry/Tex_Turkey.png';
import Egg from '../../resources/models/poultry/Egg.gltf';
import { entityManager, scene, stats, ui } from '../globals';
import EggEntity from './EggEntity';
import Stats from '../Stats';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { poultryWeights, poultryScales } from './poultryConsts';

export type PoultryRepresentative = 'chicken' | 'goose' | 'turkey';
export type AgeCategory = 'child' | 'adult' | 'old';

const radius = 90;
const angle = 0;
const x = radius * Math.cos(angle);
const z = radius * Math.sin(angle);

class PoultryEntity extends Entity {
  private healthDecayTimer: number = 10;
  public gender: string; // m/f - random
  public age: number; // days 0-2 child, 3-9 adult, 10+ old (random death)
  public ageCategory: AgeCategory = 'child';
  public food: number; // 0-100 - 100 is full, 0 survives 30s then dies
  public care: number; // 0-100 - aritmetic mean of food, water and care
  public health: number; // 0-100 - on 0 food or 0 water starts to decrease after 30s; on age > 10 starts to decrease,
  public eggLayer: boolean; // true/false - f and adult and care > 70
  public weight: number; // depends on type and age
  private isDead: boolean = false;
  public type: PoultryRepresentative;

  constructor(
    object: THREE.Object3D,
    type: PoultryRepresentative,
    gender?: string,
    age?: number
  ) {
    super(object);
    this.age = age ? age : 0;
    this.food = 80;
    this.care = 80;
    this.health = 100;
    this.weight = 0.05;
    this.eggLayer = false;
    this.gender = gender ? gender : Math.random() > 0.5 ? 'm' : 'f';
    if (age) {
      this.elapsedTimeMin = age;
      this.elapsedTimeSec = age * 60;
      this.elapsedTime = age * 60;
      this.toggleEggLayer();
    }
    this.type = type;
  }

  private onStatUpdate() {
    if (ui.popup.entity == this)
      ui.popup.content.innerHTML = ui.getChickenPopupContent(this);
  }

  /**
   * Update food every second by 0.5
   * If food is 0 start decrease health timer
   * If it includes parameters to increase food, increase food by that number
   */
  updateFoodStat(increase?: boolean, increaseNumber?: number) {
    if (!increase) {
      if (this.food > 0) {
        this.food -= 1;
      }
    }
    if (increase && increaseNumber) {
      if (this.food <= 100 - increaseNumber) {
        this.food += increaseNumber;
      } else {
        this.food = 100;
      }
    }
    this.onStatUpdate();
  }

  /**
   * Update weight every 10s based on type, age gender and food
   * Change scale based on weight
   * Scale difference is max 0.01 (deltaWeight*10 * 0.0005)
   * Max deltaWeight is 2 (*10 = 20, *0.0005 = 0.01)
   */
  updateWeight() {
    // minmax weight based
    const minWeight =
      poultryWeights[this.type][this.ageCategory][this.gender].min;
    const maxWeight =
      poultryWeights[this.type][this.ageCategory][this.gender].max;

    // weight based on food
    let weight = minWeight + (maxWeight - minWeight) * (this.food / 100);
    this.weight = Math.round(weight * 100) / 100;

    // scale based on weight
    const deltaWeight = this.weight - minWeight;
    const roundScaleAdd = Math.round(deltaWeight * 10) * 0.0005;
    let scaleVectorAdd = new THREE.Vector3(
      roundScaleAdd,
      roundScaleAdd,
      roundScaleAdd
    );
    // scale is based on default scale + scale based on weight
    const scale = scaleVectorAdd.add(poultryScales[this.type][this.gender]);
    this.object.scale.set(scale.x, scale.y, scale.z);
  }

  /**
   * Update health every second
   * If food is 0 start decrease health timer
   * If health timer reaches 30s start decrease health
   * If food is > 0 start increase health and reset health timer
   * If age is > 10 = is old - start decrease health
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

    // if older than 10 years (is old) start to decrease health - 50% chance to decrease health
    if (this.ageCategory == 'old') {
      const decreaseRandom = Math.floor(Math.random() * 10);
      if (decreaseRandom > 5) {
        this.health -= 1;
      }
    }
    this.onStatUpdate();
  }

  /**
   * get model attributes based on gender and type
   * @returns {Object} {model: model, texture: texture, scale: scale}
   */
  getModelAttributes() {
    switch (this.type) {
      case 'chicken':
        if (this.gender == 'm') {
          return {
            model: Rooster,
            texture: RoosterTexture,
            scale: poultryScales.chicken[this.gender]
          };
        } else {
          return {
            model: Hen,
            texture: HenTexture,
            scale: poultryScales.chicken[this.gender]
          };
        }
      case 'goose':
        return {
          model: Goose,
          texture: GooseTexture,
          scale: poultryScales.goose[this.gender]
        };
      case 'turkey':
        return {
          model: Turkey,
          texture: TurkeyTexture,
          scale: poultryScales.turkey[this.gender]
        };
    }
  }

  /**
   * Change model to adult
   * Change mixer to adult animation
   */
  changeModel() {
    let attributes = this.getModelAttributes(); // get gender specific attributes - model, texture, scale
    const loader = new FBXLoader(); //new GLTFLoader();
    var texture = new THREE.TextureLoader().load(attributes.texture);
    texture.encoding = THREE.sRGBEncoding;
    loader.load(attributes.model, (object) => {
      // get scene from parent
      const scene = this.object.parent;
      // create new object
      const newObject = object;
      // copy position, scale and rotation
      newObject.position.copy(this.object.position);
      newObject.scale.copy(this.object.scale);
      newObject.rotation.copy(this.object.rotation);
      newObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0.1, 0.1, 0.1),
            map: texture
          });
        }
      });

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
      this.object.scale.set(
        attributes.scale.x,
        attributes.scale.y,
        attributes.scale.z
      );

      // animation
      this.mixer = new THREE.AnimationMixer(newObject);
      // get all available animations
      const animations = object.animations;
      this.animationActions = [];
      // Iterate over the animations and push them into the animationActions array
      for (let i = 0; i < animations.length; i++) {
        //remove 'Rig|' from animation name of goose
        if (this.type == 'goose') {
          animations[i].name = animations[i].name.replace('Rig|', '');
          let deathAnimation, jumpAnimation;
          // goose doesnt have death and jump animation -> subbstite them
          if (animations[i].name == 'Roll') {
            deathAnimation = animations[i].clone();
            deathAnimation.name = 'Death';
            this.animationActions.push(this.mixer.clipAction(deathAnimation));
          }
          if (animations[i].name == 'Bounce') {
            jumpAnimation = animations[i].clone();
            jumpAnimation.name = 'Jump';
            this.animationActions.push(this.mixer.clipAction(jumpAnimation));
          }
        }
        // add animation to animationActions array
        const animation = animations[i];
        this.animationActions.push(this.mixer.clipAction(animation));
      }
      const animationClip = object.animations.find(
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
    this.onStatUpdate();
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
      // this.object.rotation.y += Math.PI;
      this.object.lookAt(new THREE.Vector3(0, 0, 0));
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
      const eggEntity = new EggEntity(egg, this.type);
      entityManager.add(eggEntity);
      // this.changeAnimation('Jump');
      this.playAnimationOnce('Jump');
    });
  }

  /**
   * Toggle eggLayer based on age, gender and care
   */
  toggleEggLayer() {
    //update eggLayer - f and adult and care > 50
    if (this.ageCategory == 'adult') {
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
      if (this.isDead) {
        this.mixer.stopAllAction();
      }
      this.lastAction = this.activeAction;
      this.activeAction = animationAction;
      animationAction?.setLoop(THREE.LoopOnce, 1);
      animationAction.clampWhenFinished = true;
      this.lastAction.fadeOut(0.5);
      animationAction.reset().fadeIn(0.5).play();

      if (!this.isDead) {
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
    this.isDead = true;
    this.playAnimationOnce('Death');
    setTimeout(() => {
      this.object.parent?.remove(this.object);
      entityManager.remove(this);
      stats.poultry--;
    }, 2000);
  }

  /**
   * Sells object - removes from scene and entityManager
   * Mark it as dead
   * Money is added in GameController
   */
  sell() {
    this.isDead = true;
    this.playAnimationOnce('Roll');
    setTimeout(() => {
      this.object.parent?.remove(this.object);
      entityManager.remove(this);
      stats.poultry--;
    }, 1000);
  }

  update(time: number) {
    super.update(time);
    this.elapsedTime += time;

    // update stats every 1s
    if (this.elapsedTimeSec != Math.floor(this.elapsedTime)) {
      this.elapsedTimeSec = Math.floor(this.elapsedTime);
      // update health
      this.updateHealth();

      // update every 2s
      if (this.elapsedTimeSec % 2 == 0 && this.elapsedTimeSec != 0) {
        // update food
        this.updateFoodStat();
      }

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
        if (this.ageCategory != 'child') {
          this.updateWeight();
        }
      }

      // lay egg every 30s
      if (this.elapsedTimeSec % 30 == 0 && this.elapsedTimeSec != 0) {
        if (this.eggLayer && !this.isDead) {
          this.toggleEggLayer();
          if (this.eggLayer) this.layEgg();
        }
      }

      // update to adult
      if (
        this.age > 2 &&
        this.age <= 10 &&
        this.ageCategory != 'adult' &&
        !this.isDead
      ) {
        this.ageCategory = 'adult';
        this.toggleEggLayer();
        this.updateWeight();
        this.onStatUpdate();
        // change model
        this.changeModel();
      } else if (this.age > 10 && this.ageCategory != 'old' && !this.isDead) {
        this.ageCategory = 'old';
        this.toggleEggLayer();
        this.updateWeight();
        this.onStatUpdate();
      }
    }

    // update stats every 1min
    if (this.elapsedTimeMin != Math.floor(this.elapsedTime / 60)) {
      this.elapsedTimeMin = Math.floor(this.elapsedTime / 60);
      //update age
      this.age = this.elapsedTimeMin;
      this.onStatUpdate();
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

export default PoultryEntity;
