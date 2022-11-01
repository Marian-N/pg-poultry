import Entity from './Entity';

/** Entity manager stores all entities in map with their id as a key */
class EntityManager {
  private entities: Record<string, Entity>;
  private idCounter: number;

  constructor() {
    this.entities = {};
    this.idCounter = 0;
  }

  private generateUid() {
    this.idCounter++;
    return this.idCounter.toString();
  }

  /**
   * Add an entity to the manager
   * @param {Entity} entity - the entity to add
   * @param {string} id - the id to assign to the entity
   * @throws Will throw en error when entity with the same id already exists
   */
  add(entity: Entity, id?: string) {
    // Generate a unique id if none is provided
    if (!id) {
      id = this.generateUid();
    }

    if (this.entities[id]) {
      throw new Error(`Entity with id ${id} already exists`);
    }

    entity.setId(id);
    this.entities[id] = entity;
  }

  get(id: number): Entity | undefined {
    return this.entities[id];
  }

  /** Update every entity in entity manager */
  update() {
    for (let id in this.entities) {
      const entity = this.entities[id];
      if (entity.update) entity.update();
    }
  }
}

export default EntityManager;
