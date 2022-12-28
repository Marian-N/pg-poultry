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

  onAction(action: Action, payload: Payload) {
    console.log(action);
    const { entity, value } = payload;
    if (action === 'feedPoultry') {
      if (entity instanceof ChickenEntity) {
        const updateFoodValue = Math.min(10, 100 - entity.food, stats.food);
        entity.updateFoodStat(true, updateFoodValue);
        stats.food -= updateFoodValue;
      }
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
