import * as THREE from 'three';

class Entity {
  private id: string;
  public animateAction: THREE.AnimationAction[] = [];
  public activeAction: THREE.AnimationAction;
  public lastAction: THREE.AnimationAction;
  object: THREE.Object3D;
  public mixer: THREE.AnimationMixer;

  constructor(object: THREE.Object3D) {
    this.object = object;
    this.mixer = new THREE.AnimationMixer(object);
    object.userData.isContainer = true;
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

  handleClick(event: MouseEvent) {
    if (this.onClick) this.onClick(event);
  }
}

export default Entity;
