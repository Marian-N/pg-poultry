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
      'popup__header__close'
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

class Ui {
  private pointer: Pointer;
  public popup: Popup;

  constructor(pointer: Pointer) {
    this.pointer = pointer;
    this.init();
  }

  private init() {
    this.initPopup();
  }

  private initPopup() {
    this.popup = new Popup();
    this.pointer.onClick = (entity, event) => {
      entity.handleClick(event);
    };
  }
}

export default Ui;
