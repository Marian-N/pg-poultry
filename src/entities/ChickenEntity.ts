import * as THREE from 'three';
import Entity from './Entity';

class ChickenEntity extends Entity {
  private elapsedTimeSec: number = 0;
  private elapsedTime: number = 0;
  private elapsedTimeMin: number = 0;
  private healthDecayTimer: number = 0;
  public gender: string; // m/f - random
  public age: number; // days 0-2 child, 3-9 adult, 10+ old (random death)
  public food: number; // 0-100 - 100 is full, 0 survives 30s then dies
  public care: number; // 0-100 - aritmetic mean of food, water and care
  public health: number; // 0-100 - on 0 food or 0 water starts to decrease after 30s; on age > 10 starts to decrease,
  public eggLayer: boolean; // true/false - f and adult and care > 70

  constructor(object: THREE.Object3D, gender?: string, age?: number) {
    super(object);
    this.age = age ? age : 0;
    this.food = 80;
    this.care = 80;
    this.health = 100;
    this.eggLayer = false;
    this.gender = gender ? gender : Math.random() > 0.5 ? 'm' : 'f';
  }

  /**
   * Update food every second by 0.5
   * If food is 0 start decrease health timer
   */
  updateFoodStat() {
    if (this.food > 0) {
      this.food -= 0.5;
    }
  }

  /**
   * Update health every second
   * If food is 0 start decrease health timer
   * If health timer reaches 30s start decrease health
   * If food is > 0 start increase health and reset health timer
   * If age is > 10 start decrease health
   * TODO if health is 0 = death
   */
  updateHealth() {
    if (this.food == 0) {
      this.healthDecayTimer += 1;
    } else {
      this.healthDecayTimer = 0;
    }

    if (this.healthDecayTimer >= 30 && this.health > 0) {
      this.health -= 1;
    }

    if (this.food > 0 && this.health < 100 && this.age <= 10) {
      this.health += 1;
    }

    if (this.age > 10) {
      this.health -= 1;
    }
  }

  /**
   * Update care every second
   * Aritmetic mean of food and care
   */
  updateCareStat() {
    this.care = (this.food + this.care) / 2;
  }

  update(time: number) {
    super.update(time);
    this.elapsedTime += time;

    // update stats every 1s
    if (this.elapsedTimeSec != Math.floor(this.elapsedTime)) {
      this.elapsedTimeSec = Math.floor(this.elapsedTime);
      // update food
      this.updateFoodStat();
      this.updateHealth();

      // update stats every 10s
      if (this.elapsedTimeSec % 10 == 0 && this.elapsedTimeSec != 0) {
        // update care
        this.updateCareStat();
        console.log(this);
      }

      // lay egg every 30s
      if (this.elapsedTimeSec % 30 == 0 && this.elapsedTimeSec != 0) {
        // TODO lay egg
      }
    }

    // update stats every 1min
    if (this.elapsedTimeMin != Math.floor(this.elapsedTime / 60)) {
      this.elapsedTimeMin = Math.floor(this.elapsedTime / 60);
      //update age
      this.age = this.elapsedTimeMin;

      //update eggLayer - f and adult and care > 70
      if (this.age > 2 && this.age < 10) {
        if (this.gender == 'f' && this.care > 70) this.eggLayer = true;
        else {
          this.eggLayer = false;
        }
      } else {
        this.eggLayer = false;
      }
    }
  }
}

export default ChickenEntity;
