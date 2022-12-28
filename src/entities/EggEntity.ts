import * as THREE from 'three';
import Entity from './Entity';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { entityManager, scene, stats, gameController } from '../globals';

class EggEntity extends Entity {
  private timespan: number = 30; // is destroyed after 30 seconds

  constructor(object: THREE.Object3D) {
    super(object);

    this.onClick = () => {
      stats.eggs += 1;
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
