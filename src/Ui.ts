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
