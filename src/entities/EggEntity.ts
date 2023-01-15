import * as THREE from 'three';
import Entity from './Entity';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { entityManager, scene, stats, gameController } from '../globals';
import { PoultryRepresentative } from './PoultryEntity';

class EggEntity extends Entity {
  private timespan: number = 30; // is destroyed after 30 seconds
  public type: PoultryRepresentative;

  constructor(object: THREE.Object3D, type: PoultryRepresentative) {
    super(object);
    this.type = type;

    this.onClick = () => {
      stats.eggs = { ...stats.eggs, [this.type]: stats.eggs[this.type] + 1 };
      gameController.audio.play('pickup');
      this.destroy();
    };
  }

  update(time: number) {
    super.update(time);
    this.elapsedTime += time;

    if (this.elapsedTimeSec != Math.floor(this.elapsedTime)) {
      this.elapsedTimeSec = Math.floor(this.elapsedTime);

      // destroys itself after 30 seconds
      this.timespan -= 1;
      if (this.timespan <= 0) {
        this.destroy();
      }
    }
  }
}

export default EggEntity;
