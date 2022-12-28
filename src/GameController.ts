import * as THREE from 'three';
import ChickenEntity from './entities/ChickenEntity';
import Chick from '../resources/models/poultry/Chick.gltf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { entityManager, scene, ui, stats } from './globals';

class GameController {
  constructor() {}

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
