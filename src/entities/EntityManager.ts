import Entity from './Entity';

class EntityManager {
  private entities: Record<number, Entity>;
  private idCounter: number;

  constructor() {
    this.entities = {};
    this.idCounter = 0;
  }

  add(object: THREE.Object3D) {
    this.idCounter++;
    const entity = new Entity(this.idCounter, object);
    this.entities[this.idCounter] = entity;
    return entity;
  }

  get(id: number) {
    return this.entities[id];
  }

  update() {
    for (const id in this.entities) {
      const entity = this.entities[id];
      if (entity.update) entity.update();
    }
  }
}

export default EntityManager;
