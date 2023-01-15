import * as THREE from 'three';
import PoultryEntity from './entities/PoultryEntity';
import Chick from '../resources/models/poultry/Chick.fbx';
import ChickTexture from '../resources/models/poultry/Tex_Chick.png';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { entityManager, scene, ui, stats } from './globals';
import Entity from './entities/Entity';
import { PoultryRepresentative } from './entities/PoultryEntity';

export type ShopTransactionAction =
  | 'buyEggs'
  | 'sellEggs'
  | 'buyFood'
  | 'sellFood'
  | 'buyPoultry'
  | 'sellPoultry';
export type GameAction = 'feedPoultry' | 'hatchEgg';
export type Action = ShopTransactionAction | GameAction;
export type Payload = {
  entity?: Entity;
  value?: any;
};

export const priceMultiplier: Record<ShopTransactionAction, number> = {
  buyEggs: 20,
  sellEggs: 10,
  buyFood: 1,
  sellFood: 0.5,
  buyPoultry: 100,
  sellPoultry: 50
};

class GameController {
  constructor() {}

  /**
   * Increase food by value, if money is enough
   * Value = number of food to buy, price == value
   * @param value
   */
  private buyFood(value: number) {
    if (stats.money >= value) {
      stats.food += value;
      stats.money -= value * priceMultiplier.buyFood;
    }
  }

  /**
   * Decrease food by value and increase money by value / 2 if food is enough
   * Value = number of food to sell, price == value / 2
   * @param value
   */
  private sellFood(value: number) {
    if (stats.food >= value) {
      stats.food -= value;
      stats.money += value * priceMultiplier.sellFood;
    }
  }

  /**
   * Sells chicken based on care
   * Calculates price: 50 + care rounded to 10 / 2
   * @param entity
   */
  private sellChicken(entity: PoultryEntity) {
    // TODO sell based on: age, health, care (weigth if implemented)
    // base price - 50 for adult, 20 for child
    var basePrice;
    if (entity.ageCategory == 'child') {
      basePrice = 10;
    } else if (entity.ageCategory == 'adult') {
      basePrice = 50;
    } else {
      basePrice = 0;
    }
    // care - rounded to 10 and divided by 2
    const roundedCare = (Math.round(entity.care / 10) * 10) / 2;
    let price = basePrice + roundedCare;
    // sell chicken
    entity.sell();
    // add money to stats
    stats.money += price;
  }

  /**
   * Buys eggs based on priceMultiplier => value * priceMultiplier.buyEggs
   * @param value
   */
  private buyEggs(value: number, type: PoultryRepresentative) {
    const price = value * priceMultiplier.buyEggs;
    if (stats.money >= price) {
      stats.eggs = { ...stats.eggs, [type]: stats.eggs[type] + value };
      stats.money -= price;
    }
  }

  /**
   * Sells eggs based on priceMultiplier => value * priceMultiplier.sellEggs
   * @param value
   */
  private sellEggs(value: number, type: PoultryRepresentative) {
    const price = value * priceMultiplier.sellEggs;
    if (stats.eggs[type] >= value) {
      stats.eggs = { ...stats.eggs, [type]: stats.eggs[type] - value };
      stats.money += price;
    }
  }

  /**
   * Creates chicken and adds it to scene
   * Remove egg from stats
   */
  private hatchEgg(type: PoultryRepresentative) {
    if (stats.eggs[type] > 0) {
      this.createPoultry(type);
      stats.eggs = { ...stats.eggs, [type]: stats.eggs[type] - 1 };
    }
  }

  onAction(action: Action, payload: Payload = {}) {
    // TODO action response - failure, success - UI
    console.log(action, payload);
    const { entity, value } = payload;
    // Feeds poultry with constraints: 1. Can't feed more than 10 food 2. Can't feed more than food capacity (100) 3. Can't feed more than the amount of food you have
    if (action === 'feedPoultry') {
      if (entity instanceof PoultryEntity) {
        const updateFoodValue = Math.min(10, 100 - entity.food, stats.food);
        entity.updateFoodStat(true, updateFoodValue);
        stats.food -= updateFoodValue;
      }
    }
    if (action === 'sellPoultry' && entity instanceof PoultryEntity) {
      this.sellChicken(entity);
    }
    if (action === 'buyFood' && value) {
      this.buyFood(value.amount);
    }
    if (action === 'sellFood' && value) {
      this.sellFood(value.amount);
    }
    if (action === 'buyEggs' && value) {
      this.buyEggs(value.amount, value.type);
    }
    if (action === 'sellEggs' && value) {
      this.sellEggs(value.amount, value.type);
    }
    if (action === 'hatchEgg' && value) {
      this.hatchEgg(value);
    }
  }

  createPoultry(
    type: PoultryRepresentative,
    pos?: THREE.Vector3,
    gender?: string,
    age?: number
  ) {
    const loader = new FBXLoader();
    const position = pos ? pos : new THREE.Vector3(0, 0, 0);
    var texture = new THREE.TextureLoader().load(ChickTexture);
    texture.encoding = THREE.sRGBEncoding;
    loader.load(Chick, (object) => {
      const chick = object;

      chick.position.set(position.x, position.y, position.z);
      chick.scale.set(0.03, 0.03, 0.03);
      chick.rotateY(0.5);

      chick.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            emissive: new THREE.Color(0.1, 0.1, 0.1),
            map: texture
          });
        }
      });

      const chickEntity = entityManager.add(
        new PoultryEntity(chick, type, gender, age)
      ) as PoultryEntity;
      // get all available animations
      const animations = object.animations;
      // Iterate over the animations and push them into the animationActions array
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        chickEntity.animationActions.push(
          chickEntity.mixer.clipAction(animation)
        );
      }
      chickEntity.changeAnimation('Idle');
      chickEntity.onClick = (event) => {
        const popup = ui.popup;
        popup.entity = chickEntity;
        chickEntity.playAnimationOnce('Clicked');
        popup.element.classList.add('active');
        popup.title.innerHTML = chickEntity.type + ' - ' + chickEntity.getId();
        popup.content.innerHTML = ui.getChickenPopupContent(chickEntity);
        popup.element.style.left = event.clientX + 'px';
        popup.element.style.top = event.clientY + 'px';
      };
      scene.add(chick);
      stats.poultry++;
    });
  }
}

export default GameController;
