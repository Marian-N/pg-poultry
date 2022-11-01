class Entity {
  private id: string;
  update?: Function;
  object: THREE.Object3D;

  constructor(object: THREE.Object3D) {
    this.object = object;
  }

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
  setUpdate(update: Function) {
    this.update = update;
    return this;
  }
}

export default Entity;
