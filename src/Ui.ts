import PoultryEntity, { PoultryRepresentative } from './entities/PoultryEntity';
import Entity from './entities/Entity';
import { priceMultiplier, ShopTransactionAction } from './GameController';
import { gameController, ui } from './globals';
import Pointer from './Pointer';
import { Eggs } from './Stats';
import Flickity from 'flickity/js';

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
      this.close();
    });
    this.feedButton.addEventListener('click', () => {
      gameController.onAction('feedPoultry', { entity: this.entity });
    });
  }

  public close() {
    this.element.classList.remove('active');
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
  eggs?: Eggs;
  food?: number;
  money?: number;
}

class Hud {
  public element: HTMLElement;
  public $poultry: HTMLElement[];
  public $eggs: Record<PoultryRepresentative, HTMLElement[]>;
  public $food: HTMLElement[];
  public $money: HTMLElement[];
  public $audio: HTMLElement;
  private _poultry: number;
  private _eggs: Eggs;
  private _food: number;
  private _money: number;

  constructor() {
    this.init();
  }

  private init() {
    const hud = document.getElementById('hud') as HTMLElement;
    const poultry = hud?.querySelector('#hud-poultry .value') as HTMLElement;
    const eggs = hud?.querySelector('#hud-eggs') as HTMLElement;
    this.$eggs = {
      chicken: [eggs?.querySelector('#hud-eggs-chicken .value') as HTMLElement],
      turkey: [eggs?.querySelector('#hud-eggs-turkey .value') as HTMLElement],
      goose: [eggs?.querySelector('#hud-eggs-goose .value') as HTMLElement]
    };
    // for each egg element
    Object.keys(this.$eggs).forEach((key) => {
      // add listener to sell egg
      const el = eggs?.querySelector(`#hud-eggs-${key}`) as HTMLElement;
      el.addEventListener('click', () => {
        gameController.onAction('hatchEgg', { value: key });
      });
    });
    const food = hud?.querySelector('#hud-food .value') as HTMLElement;
    const money = hud?.querySelector('#open-shop .value') as HTMLElement;
    this.$audio = hud?.querySelector('#hud-audio') as HTMLElement;
    this.$audio.addEventListener('click', () =>
      this.toggleAudio(undefined, true)
    );
    this.element = hud;
    this.$poultry = [poultry];
    this.$food = [food];
    this.$money = [money];
  }

  public toggleAudio(value?: boolean, isFromClick: boolean = false) {
    const audio = this.$audio.querySelector('.bi') as HTMLAudioElement;
    if (value === undefined) {
      audio.classList.toggle('bi-volume-up-fill');
      audio.classList.toggle('bi-volume-mute-fill');
      audio.classList.toggle('allow');
      if (isFromClick)
        gameController.audio.allowed = !gameController.audio.allowed;
    } else if (value) {
      audio.classList.add('bi-volume-up-fill');
      audio.classList.remove('bi-volume-mute-fill');
      audio.classList.add('allow');
      if (isFromClick) gameController.audio.allowed = true;
    } else {
      audio.classList.add('bi-volume-mute-fill');
      audio.classList.remove('bi-volume-up-fill');
      audio.classList.remove('allow');
      if (isFromClick) gameController.audio.allowed = false;
    }
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

  set eggs(value: Eggs) {
    this._eggs = value;
    // for each item in value
    Object.keys(value).forEach((key) => {
      // get the element
      const el = this.$eggs[key as PoultryRepresentative];
      // set the text
      el.forEach((e) => {
        e.innerText = value[key as PoultryRepresentative].toString();
      });
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
      const type = this.buyButton.dataset.type as string;
      this.buyButton.innerHTML = `Buy ${dollarIcon}${price}`;
      this.buyButton.addEventListener('click', () => {
        gameController.onAction(action, {
          value: { amount: this.amount, type: type }
        });
      });
    }
    if (this.sellButton) {
      const action = this.sellButton.dataset.action as ShopTransactionAction;
      const price = priceMultiplier[action] * this.amount;
      const type = this.sellButton.dataset.type as string;
      this.sellButton.innerHTML = `Sell ${dollarIcon}${price}`;
      this.sellButton.addEventListener('click', () => {
        gameController.onAction(action, {
          value: { amount: this.amount, type: type }
        });
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

  open() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('active');
    ui.help.close();
  }

  close() {
    this.isOpen = false;
    this.element.classList.remove('active');
  }

  constructor() {
    this.init();
    this.closeButton.addEventListener('click', () => {
      this.close();
    });
    this.openButton.addEventListener('click', () => {
      this.open();
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
    this.activeTab = 'eggs';
    this.element = shop;
    this.closeButton = closeButton;
    this.openButton = openButton;
    this.isOpen = false;
    this.money = shop?.querySelector('.shop__header .value') as HTMLElement;
  }
}

class Help {
  public element: HTMLElement;
  public closeButton: HTMLElement;
  public openButton: HTMLElement;
  public isOpen: boolean;

  open() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('active');
    ui.shop.close();
  }

  close() {
    this.isOpen = false;
    this.element.classList.remove('active');
  }

  constructor() {
    this.init();
    this.closeButton.addEventListener('click', () => {
      this.close();
    });
    this.openButton.addEventListener('click', () => {
      this.open();
    });
  }

  private init() {
    this.element = document.getElementById('help') as HTMLElement;
    this.closeButton = this.element?.getElementsByClassName(
      'help__close'
    )[0] as HTMLElement;
    this.openButton = document.getElementById('hud-help') as HTMLElement;
    this.isOpen = false;
    new Flickity('#help-carousel', {
      resize: true,
      contain: true,
      cellAlign: 'left'
    });
  }
}

export type NotificationMessageType =
  | 'no-eggs'
  | 'no-food'
  | 'no-money'
  | 'not-enough-to-sell';
export type NotificationMessage = {
  message: string;
  values?: Record<string, string>;
};
export type NotificationMessages = Record<
  NotificationMessageType,
  NotificationMessage
>;
export const notificationMessages: NotificationMessages = {
  'no-eggs': {
    message: "You don't have any {{type}} eggs!",
    values: {
      type: 'type'
    }
  },
  'no-food': {
    message: "You don't have any food!"
  },
  'no-money': {
    message: "You don't have enough money!"
  },
  'not-enough-to-sell': {
    message: "You don't have enough {{type}} to sell!",
    values: {
      type: 'type'
    }
  }
};

class Notification {
  public element: HTMLElement;
  public timeouts: number[];

  constructor() {
    this.init();
  }

  display(message: string) {
    this.element.innerHTML = message;
    this.element.classList.remove('active');
    this.element.getBoundingClientRect();
    this.element.classList.add('active');
    this.timeouts.forEach((timeout) => {
      window.clearTimeout(timeout);
    });
    const timeout = window.setTimeout(() => {
      this.element.classList.remove('active');
    }, 1000);
    this.timeouts.push(timeout);
  }

  showMessage(type: NotificationMessageType, values?: Record<string, string>) {
    const message = notificationMessages[type];
    let messageText = message.message;
    if (message.values && values) {
      Object.keys(message.values).forEach((key) => {
        const value = values[key];
        messageText = messageText.replace(`{{${key}}}`, value);
      });
    }
    this.display(messageText);
  }

  private init() {
    this.element = document.getElementById('notification') as HTMLElement;
    this.timeouts = [];
  }
}

class Ui {
  private pointer: Pointer;
  public popup: Popup;
  public shop: Shop;
  public hud: Hud;
  public help: Help;
  public notification: Notification;

  constructor() {}

  public init(pointer: Pointer) {
    this.pointer = pointer;
    this.initPopup();
    this.initShop();
    this.initHud();
    this.help = new Help();
    this.notification = new Notification();

    return this;
  }

  private initPopup() {
    this.popup = new Popup();
    this.pointer.onClick = (entity, event) => {
      if (this.shop.isOpen) return;
      if (this.help.isOpen) return;
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

  public getChickenPopupContent(chicken: PoultryEntity) {
    return `
    <table height="100%" width="100%"
    style="border-spacing: 10px 0;">
      <tr>
        <td>Gender</td>
        <td>${
          chicken.gender == 'f'
            ? `<i class="bi bi-gender-female" style="color:red"></i>`
            : `<i class="bi bi-gender-male" style="color:blue"></i>`
        }</td>
      </tr>
      <tr>
        <td>Health</td>
        <td>${chicken.health}%</td>
      </tr>
      <tr>
        <td>Food</td>
        <td>${chicken.food}%</td>
      </tr>
      <tr>
        <td>Weight</td>
        <td>${chicken.weight}kg</td>
      </tr>
      <tr>
        <td>Care</td>
        <td>${Math.round(chicken.care * 100) / 100}%</td>
      </tr>
      <tr>
        <td>Age</td>
        <td>${chicken.age} (${chicken.ageCategory})</td>
      </tr>
    </table>
  `;
  }
}

export default Ui;
