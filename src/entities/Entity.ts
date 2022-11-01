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

  setUpdate(update: Function) {
    this.update = update;
  }
}

export default Entity;
