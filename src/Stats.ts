import { ui } from './globals';

class Stats {
  private _eggs: number;
  private _food: number;
  private _poultry: number;
  private _money: number;

  get eggs() {
    return this._eggs;
  }

  set eggs(value: number) {
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

  constructor() {}

  public init() {
    this.eggs = 0;
    this.food = 0;
    this.poultry = 0;
    this.money = 0;

    return this;
  }
}

export default Stats;
