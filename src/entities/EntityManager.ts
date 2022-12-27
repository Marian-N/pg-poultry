import Entity from './Entity';

/** Entity manager stores all entities in map with their id as a key */
class EntityManager {
  private entitiesRecord: Record<string, Entity>;
  private entities: Entity[];
  private idCounter: number;

  constructor() {
    this.entitiesRecord = {};
    this.idCounter = 0;
    this.entities = [];
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

    if (this.entitiesRecord[id]) {
      throw new Error(`Entity with id ${id} already exists`);
    }

    entity.setId(id);
    this.entitiesRecord[id] = entity;
    this.entities.push(entity);

    return entity;
  }

  getEntities(): Entity[] {
    return Object.values(this.entities);
  }

  get(id: string): Entity | undefined {
    return this.entitiesRecord[id];
  }

  /** Update every entity in entity manager */
  update(time: number) {
    for (let entity of this.entities) {
      if (entity.update) entity.update(time);
    }
  }
}

export default EntityManager;
