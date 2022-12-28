import Pointer from './Pointer';

class Popup {
  public element: HTMLElement;
  public closeButton: HTMLElement;
  public title: HTMLElement;
  public content: HTMLElement;

  constructor() {
    this.init();
    this.closeButton.addEventListener('click', () => {
      this.element.classList.remove('active');
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
    this.element = popup;
    this.closeButton = closeButton;
    this.title = popupTitle;
    this.content = popupContent;
  }
}

interface IHudUpdateValues {
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

class Shop {
  public element: HTMLElement;
  public openButton: HTMLElement;
  public closeButton: HTMLElement;
  public money: HTMLElement;
  private tabs: Record<ShopTab, HTMLElement>;
  private _activeTab: ShopTab;
  private pages: Record<ShopTab, HTMLElement>;

  public isOpen: boolean;

  get activeTab() {
    return this._activeTab;
  }

  set activeTab(tab: ShopTab) {
    if (this.activeTab && tab) {
      this.tabs[this.activeTab].classList.remove('active');
      this.pages[this.activeTab].classList.remove('active');
    }
    this.tabs[tab].classList.add('active');
    this.pages[tab].classList.add('active');
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
      poultry: shop?.querySelector(
        '.shop__page[data-page="poultry"]'
      ) as HTMLElement,
      eggs: shop?.querySelector('.shop__page[data-page="eggs"]') as HTMLElement,
      food: shop?.querySelector('.shop__page[data-page="food"]') as HTMLElement
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

  constructor(pointer: Pointer) {
    this.pointer = pointer;
    this.init();
  }

  private init() {
    this.initPopup();
    this.initShop();
    this.initHud();
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
}

export default Ui;
