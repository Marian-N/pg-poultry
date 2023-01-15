import { PoultryRepresentative } from './entities/PoultryEntity';
import { ui } from './globals';
import { IHudUpdateValues } from './Ui';

export type Eggs = Record<PoultryRepresentative, number>;

class Stats {
  private _eggs: Eggs;
  private _food: number;
  private _poultry: number;
  private _money: number;

  get eggs() {
    return this._eggs;
  }

  set eggs(value: Eggs) {
    this._eggs = value;
    ui.hud.eggs = value;
  }

  get food() {
    return this._food;
  }

  set food(value: number) {
    this._food = value;
    ui.hud.food = value;
  }

  get poultry() {
    return this._poultry;
  }

  set poultry(value: number) {
    this._poultry = value;
    ui.hud.poultry = value;
  }

  get money() {
    return this._money;
  }

  set money(value: number) {
    this._money = value;
    ui.hud.money = value;
  }

  update(values: IHudUpdateValues) {
    if (values.poultry !== undefined) {
      this.poultry = values.poultry;
    }
    if (values.eggs !== undefined) {
      this.eggs = values.eggs;
    }
    if (values.food !== undefined) {
      this.food = values.food;
    }
    if (values.money !== undefined) {
      this.money = values.money;
    }
  }

  constructor() {}

  public init(values?: IHudUpdateValues) {
    if (values) this.update(values);

    return this;
  }
}

export default Stats;
