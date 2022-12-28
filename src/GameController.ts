import * as THREE from 'three';
import ChickenEntity from './entities/ChickenEntity';
import Chick from '../resources/models/poultry/Chick.gltf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { entityManager, scene, ui, stats } from './globals';
import Entity from './entities/Entity';

type Action = 'feedPoultry' | 'sellPoultry' | 'buyFood' | 'sellFood';
type Payload = {
  entity?: Entity;
  value?: number;
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
        popup.content.innerHTML = `
        <table height="100%" width="100%"
        style="border-spacing: 10px 0;">
          <tr>
            <td>Health</td>
            <td>${chickEntity.health}%</td>
          </tr>
          <tr>
            <td>Food</td>
            <td>${chickEntity.food}%</td>
          </tr>
          <tr>
            <td>Care</td>
            <td>${Math.round(chickEntity.care * 100) / 100}%</td>
          </tr>
          <tr>
            <td>Age</td>
            <td>${chickEntity.age}</td>
          </tr>
        </table>
      `;
        // popup.content.innerHTML = 'cluck '.repeat(8);
        popup.element.style.left = event.clientX + 'px';
        popup.element.style.top = event.clientY + 'px';
      };
      scene.add(chick);
      stats.poultry++;
    });
  }
}

export default GameController;
