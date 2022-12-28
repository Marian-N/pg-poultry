import ChickenEntity from './entities/ChickenEntity';
import Entity from './entities/Entity';
import {
  Action,
  priceMultiplier,
  ShopTransactionAction
} from './gameController';
import { gameController } from './globals';
import Pointer from './Pointer';

const dollarIcon = '<i class="bi bi-currency-dollar"></i>';

class Popup {
  public element: HTMLElement;
  public closeButton: HTMLElement;
  public title: HTMLElement;
  public content: HTMLElement;
  public sellButton: HTMLElement;
  public feedButton: HTMLElement;
  public entity: Entity;

  constructor() {
    this.init();
    this.closeButton.addEventListener('click', () => {
      this.element.classList.remove('active');
    });
    this.sellButton.addEventListener('click', () => {
      gameController.onAction('sellPoultry', { entity: this.entity });
    });
    this.feedButton.addEventListener('click', () => {
      gameController.onAction('feedPoultry', { entity: this.entity });
    });
  }

  private init() {
    const popup = document.getElementById('popup') as HTMLElement;
    const closeButton = popup?.getElementsByClassName(
      'popup__close'
    )[0] as HTMLElement;
    const popupTitle = popup?.getElementsByClassName(
      'popup__header__title'
    )[0] as HTMLElement;
    const popupContent = popup?.getElementsByClassName(
      'popup__body__content'
    )[0] as HTMLElement;
    this.sellButton = popup?.querySelector(
      '.button[data-action="sell"]'
    ) as HTMLElement;
    this.feedButton = popup?.querySelector(
      '.button[data-action="feed"]'
    ) as HTMLElement;
    this.element = popup;
    this.closeButton = closeButton;
    this.title = popupTitle;
    this.content = popupContent;
  }
}

export interface IHudUpdateValues {
  poultry?: number;
  eggs?: number;
  food?: number;
  money?: number;
}

class Hud {
  public element: HTMLElement;
  public $poultry: HTMLElement[];
  public $eggs: HTMLElement[];
  public $food: HTMLElement[];
  public $money: HTMLElement[];
  private _poultry: number;
  private _eggs: number;
  private _food: number;
  private _money: number;

  constructor() {
    this.init();
  }

  private init() {
    const hud = document.getElementById('hud') as HTMLElement;
    const poultry = hud?.querySelector('#hud-poultry .value') as HTMLElement;
    const eggs = hud?.querySelector('#hud-eggs .value') as HTMLElement;
    const food = hud?.querySelector('#hud-food .value') as HTMLElement;
    const money = hud?.querySelector('#open-shop .value') as HTMLElement;
    this.element = hud;
    this.$poultry = [poultry];
    this.$eggs = [eggs];
    this.$food = [food];
    this.$money = [money];
  }

  get poultry() {
    return this._poultry;
  }

  set poultry(value: number) {
    this._poultry = value;
    this.$poultry.forEach((el) => {
      el.innerText = value.toString();
    });
  }

  get eggs() {
    return this._eggs;
  }

  set eggs(value: number) {
    this._eggs = value;
    this.$eggs.forEach((el) => {
      el.innerText = value.toString();
    });
  }

  get food() {
    return this._food;
  }

  set food(value: number) {
    this._food = value;
    this.$food.forEach((el) => {
      el.innerText = value.toString();
    });
  }

  get money() {
    return this._money;
  }

  set money(value: number) {
    this._money = value;
    this.$money.forEach((el) => {
      el.innerText = value.toString();
    });
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
}

type ShopTab = 'poultry' | 'eggs' | 'food';

class ShopPageItem {
  public element: HTMLElement;
  public buyButton?: HTMLElement;
  public sellButton?: HTMLElement;
  public amount: number;

  constructor(element: HTMLElement) {
    this.init(element);

    if (this.buyButton) {
      const action = this.buyButton.dataset.action as ShopTransactionAction;
      const price = priceMultiplier[action] * this.amount;
      this.buyButton.innerHTML = `Buy ${dollarIcon}${price}`;
      this.buyButton.addEventListener('click', () => {
        gameController.onAction(action, { value: this.amount });
      });
    }
    if (this.sellButton) {
      const action = this.sellButton.dataset.action as ShopTransactionAction;
      const price = priceMultiplier[action] * this.amount;
      this.sellButton.innerHTML = `Sell ${dollarIcon}${price}`;
      this.sellButton.addEventListener('click', () => {
        gameController.onAction(action, { value: this.amount });
      });
    }
  }

  private init(element: HTMLElement) {
    this.element = element;
    this.buyButton = element.querySelector('.buy-button') as HTMLElement;
    this.sellButton = element.querySelector('.sell-button') as HTMLElement;
    const amount =
      element.querySelector('.button-group')?.getAttribute('data-amount') ||
      '0';
    this.amount = parseInt(amount);
  }
}

class ShopPage {
  public element: HTMLElement;
  public items: ShopPageItem[];

  constructor(element: HTMLElement) {
    this.element = element;

    const items = this.element.getElementsByClassName('shop__item');
    this.items = [];
    for (let i = 0; i < items.length; i++) {
      this.items.push(new ShopPageItem(items[i] as HTMLElement));
    }
  }
}

class Shop {
  public element: HTMLElement;
  public openButton: HTMLElement;
  public closeButton: HTMLElement;
  public money: HTMLElement;
  private tabs: Record<ShopTab, HTMLElement>;
  private _activeTab: ShopTab;
  private pages: Record<ShopTab, ShopPage>;

  public isOpen: boolean;

  get activeTab() {
    return this._activeTab;
  }

  set activeTab(tab: ShopTab) {
    if (this.activeTab && tab) {
      this.tabs[this.activeTab].classList.remove('active');
      this.pages[this.activeTab].element.classList.remove('active');
    }
    this.tabs[tab].classList.add('active');
    this.pages[tab].element.classList.add('active');
    this._activeTab = tab;
  }

  constructor() {
    this.init();
    this.closeButton.addEventListener('click', () => {
      this.isOpen = false;
      this.element.classList.remove('active');
    });
    this.openButton.addEventListener('click', () => {
      this.isOpen = true;
      this.element.classList.toggle('active');
    });
    Object.keys(this.tabs).forEach((key) => {
      const tab = this.tabs[key as ShopTab];
      tab.addEventListener('click', () => {
        this.activeTab = key as ShopTab;
      });
    });
  }

  private init() {
    const shop = document.getElementById('shop') as HTMLElement;
    const closeButton = shop?.getElementsByClassName(
      'shop__close'
    )[0] as HTMLElement;
    const openButton = document.getElementById('open-shop') as HTMLElement;
    this.tabs = {
      poultry: shop?.querySelector(
        '.shop__tab[data-tab="poultry"]'
      ) as HTMLElement,
      eggs: shop?.querySelector('.shop__tab[data-tab="eggs"]') as HTMLElement,
      food: shop?.querySelector('.shop__tab[data-tab="food"]') as HTMLElement
    };
    this.pages = {
      poultry: new ShopPage(
        shop?.querySelector('.shop__page[data-page="poultry"]') as HTMLElement
      ),
      eggs: new ShopPage(
        shop?.querySelector('.shop__page[data-page="eggs"]') as HTMLElement
      ),
      food: new ShopPage(
        shop?.querySelector('.shop__page[data-page="food"]') as HTMLElement
      )
    };
    this.activeTab = 'poultry';
    this.element = shop;
    this.closeButton = closeButton;
    this.openButton = openButton;
    this.isOpen = false;
    this.money = shop?.querySelector('.shop__header .value') as HTMLElement;
  }
}

class Ui {
  private pointer: Pointer;
  public popup: Popup;
  public shop: Shop;
  public hud: Hud;

  constructor() {}

  public init(pointer: Pointer) {
    this.pointer = pointer;
    this.initPopup();
    this.initShop();
    this.initHud();

    return this;
  }

  private initPopup() {
    this.popup = new Popup();
    this.pointer.onClick = (entity, event) => {
      if (this.shop.isOpen) return;
      entity.handleClick(event);
    };
  }

  private initShop() {
    this.shop = new Shop();
  }

  private initHud() {
    this.hud = new Hud();
    this.hud.$money.push(this.shop.money);
  }

  public getChickenPopupContent(chicken: ChickenEntity) {
    return `
    <table height="100%" width="100%"
    style="border-spacing: 10px 0;">
      <tr>
        <td>Health</td>
        <td>${chicken.health}%</td>
      </tr>
      <tr>
        <td>Food</td>
        <td>${chicken.food}%</td>
      </tr>
      <tr>
        <td>Care</td>
        <td>${Math.round(chicken.care * 100) / 100}%</td>
      </tr>
      <tr>
        <td>Age</td>
        <td>${chicken.age}</td>
      </tr>
    </table>
  `;
  }
}

export default Ui;
