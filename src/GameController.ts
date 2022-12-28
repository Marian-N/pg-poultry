import * as THREE from 'three';
import ChickenEntity from './entities/ChickenEntity';
import Chick from '../resources/models/poultry/Chick.gltf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { entityManager, scene, ui, stats } from './globals';
import Entity from './entities/Entity';

export type ShopTransactionAction =
  | 'buyEggs'
  | 'sellEggs'
  | 'buyFood'
  | 'sellFood'
  | 'buyPoultry'
  | 'sellPoultry';
export type GameAction = 'feedPoultry';
export type Action = ShopTransactionAction | GameAction;
export type Payload = {
  entity?: Entity;
  value?: number;
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
      stats.money -= value;
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
      stats.money += value / 2;
    }
  }

  /**
   * Sells chicken based on care
   * Calculates price: 50 + care rounded to 10 / 2
   * @param entity
   */
  private sellChicken(entity: ChickenEntity) {
    // TODO sell based on: age, health, care (weigth if implemented)
    // base price - 50 for adult, 20 for child
    const basePrice = entity.isAdult ? 50 : 10;
    // care - rounded to 10 and divided by 2
    const roundedCare = (Math.round(entity.care / 10) * 10) / 2;
    let price = basePrice + roundedCare;
    // sell chicken
    entity.sell();
    // add money to stats
    stats.money += price;
  }

  onAction(action: Action, payload: Payload) {
    // TODO action response - failure, success - UI
    console.log(action, payload);
    const { entity, value } = payload;
    // Feeds poultry with constraints: 1. Can't feed more than 10 food 2. Can't feed more than food capacity (100) 3. Can't feed more than the amount of food you have
    if (action === 'feedPoultry') {
      if (entity instanceof ChickenEntity) {
        const updateFoodValue = Math.min(10, 100 - entity.food, stats.food);
        entity.updateFoodStat(true, updateFoodValue);
        stats.food -= updateFoodValue;
      }
    }
    if (action === 'sellPoultry' && entity instanceof ChickenEntity) {
      this.sellChicken(entity);
    }
    if (action === 'buyFood' && value) {
      this.buyFood(value);
    }
    if (action === 'sellFood' && value) {
      this.sellFood(value);
    }
  }

  createChicken(pos?: THREE.Vector3, gender?: string, age?: number) {
    const loader = new GLTFLoader();
    const position = pos ? pos : new THREE.Vector3(0, 0, 0);
    loader.load(Chick, (gltf) => {
      const chick = gltf.scene;

      chick.position.set(position.x, position.y, position.z);
      chick.scale.set(0.05, 0.05, 0.05);
      chick.rotateY(0.5);

      const chickEntity = entityManager.add(
        new ChickenEntity(chick, gender, age)
      ) as ChickenEntity;
      // get all available animations
      const animations = gltf.animations;
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
        popup.title.innerHTML = 'Chick - ' + chickEntity.getId();
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
