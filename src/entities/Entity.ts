import * as THREE from 'three';
import { entityManager, scene } from '../globals';

class Entity {
  private id: string;
  public animationActions: THREE.AnimationAction[] = [];
  public activeAction: THREE.AnimationAction;
  public lastAction: THREE.AnimationAction;
  public elapsedTimeSec: number = 0;
  public elapsedTime: number = 0;
  public elapsedTimeMin: number = 0;
  object: THREE.Object3D;
  public mixer: THREE.AnimationMixer;

  constructor(object: THREE.Object3D) {
    this.object = object;
    this.mixer = new THREE.AnimationMixer(object);
    object.userData.isContainer = true;
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  onClick?: (event: MouseEvent) => void;

  setId(id: string) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  /** add update function that is called every animation frame
   * @param {Function} update - the update function
   * @returns {Entity} - the entity so you can chain the function
   */

  update(time: number) {
    if (this.mixer) {
      this.mixer.update(time);
    }
  }

  destroy() {
    scene.remove(this.object);
    entityManager.remove(this);
  }

  handleClick(event: MouseEvent) {
    if (this.onClick) this.onClick(event);
  }
}

export default Entity;
