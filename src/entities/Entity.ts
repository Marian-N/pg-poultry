class Entity {
  id: number;
  update?: Function;
  object: THREE.Object3D;

  constructor(id: number, object: THREE.Object3D) {
    this.id = id;
    this.object = object;
  }

  setUpdate(update: Function) {
    this.update = update;
  }
}

export default Entity;
