import Pointer from "./Pointer";

class Ui {
    private pointer: Pointer;

    constructor(pointer: Pointer) {
        this.pointer = pointer;
        this.init();
    }
    
    private init() {
        this.initPopup();
    }

    private initPopup() {
        const popup = document.getElementById('popup');
        const closeButton = popup?.getElementsByClassName('popup__header__close')[0];
        popup?.addEventListener('click', () => {
            popup.classList.remove('active');
        });
        this.pointer.onClick = (entity, event) => {
            entity.handleClick(event);
        };
    }
}

export default Ui;