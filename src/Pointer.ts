import * as THREE from 'three';
import Entity from './entities/Entity';

class Pointer {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private intersected: Entity | null;
  onClick: (entity: Entity, event: MouseEvent) => void | null;

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Add event listeners to update mouse position and to listen for clicks
    window.addEventListener(
      'mousemove',
      (event: MouseEvent) => this.onMouseMove(event),
      false
    );
    window.addEventListener(
      'click',
      (event) => this.handleOnClick(event),
      false
    );
  }

  // Return object that is currently intersected by the pointer
  getIntersectedObject() {
    return this.intersected;
  }

  // Models are made of different parts, for example chicken has wings, eyes, etc.
  // Interesection happens with those parts, but we want to know which entity(chicken) is intersected
  // This function traverse parent elements untill it gets to the root object which represents our entity
  private getContainerObject(object: THREE.Object3D): THREE.Object3D | null {
    if (object.userData.isContainer) return object;
    else if (object.parent) return this.getContainerObject(object.parent);
    else return null;
  }

  // Update pointer position and check if it intersects with any of the entities
  // Only update if we are poiting to different object than previously
  update(camera: THREE.Camera, entities: Entity[]) {
    this.raycaster.setFromCamera(this.mouse, camera);

    const intersects = this.raycaster.intersectObjects(
      entities.map((entity) => entity.object)
    );

    // if intersecting with an object
    if (intersects.length > 0) {
      // if we are pointing to different object than previously
      if (this.intersected?.object !== intersects[0].object) {
        // get root object of the entity
        const obj = this.getContainerObject(intersects[0].object);
        // find entity in entities array and set it as intersected
        this.intersected = obj
          ? entities.find((entity) => entity.object === obj) || null
          : null;
      }
    } else {
      // else we are not pointing to any object
      this.intersected = null;
    }
  }

  // If we are pointing to an entity and we click, call onClick function of entity
  private handleOnClick(event: MouseEvent) {
    if (this.onClick && this.intersected) this.onClick(this.intersected, event);
  }

  // Update mouse position
  private onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}

export default Pointer;
