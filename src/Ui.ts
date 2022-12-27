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

type ShopTab = 'poultry' | 'eggs' | 'food';

class Shop {
  public element: HTMLElement;
  public openButton: HTMLElement;
  public closeButton: HTMLElement;
  public tabs: Record<ShopTab, HTMLElement>;
  public isOpen: boolean;
  private _activeTab: ShopTab;

  get activeTab() {
    return this._activeTab;
  }

  set activeTab(tab: ShopTab) {
    if (this.activeTab && tab) {
      this.tabs[this.activeTab].classList.remove('active');
    }
    this.tabs[tab].classList.add('active');
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
    const tabs = {
      poultry: shop?.getElementsByClassName(
        'shop__tab--poultry'
      )[0] as HTMLElement,
      eggs: shop?.getElementsByClassName('shop__tab--eggs')[0] as HTMLElement,
      food: shop?.getElementsByClassName('shop__tab--food')[0] as HTMLElement
    };
    this.tabs = tabs;
    this.activeTab = 'poultry';
    this.element = shop;
    this.closeButton = closeButton;
    this.openButton = openButton;
    this.isOpen = false;
  }
}

class Ui {
  private pointer: Pointer;
  public popup: Popup;
  public shop: Shop;

  constructor(pointer: Pointer) {
    this.pointer = pointer;
    this.init();
  }

  private init() {
    this.initPopup();
    this.initShop();
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
}

export default Ui;
