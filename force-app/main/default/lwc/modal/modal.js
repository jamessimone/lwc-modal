import { api, LightningElement } from 'lwc';

const ESC_KEY_CODE = 27;
const ESC_KEY_STRING = 'Escape';
const TAB_KEY_CODE = 9;
const TAB_KEY_STRING = 'Tab';

export default class Modal extends LightningElement {
    isFirstRender = true;
    isOpen = false;

    outsideClickListener = (e) => {
        e.stopPropagation();
        if (!this.isOpen) {
            return;
        }
        this.toggleModal();
    };

    renderedCallback() {
        this.focusGained = false;
        if (this.isFirstRender) {
            this.isFirstRender = false;
            document.addEventListener('click', this.outsideClickListener);
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.outsideClickListener);
    }

    @api modalHeader;
    @api modalTagline;
    @api modalSaveHandler;

    @api
    toggleModal() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.focusFirstChild();
        }
    }

    @api
    get cssClass() {
        const baseClasses = ['slds-modal'];
        baseClasses.push([
            this.isOpen ? 'slds-visible slds-fade-in-open' : 'slds-hidden'
        ]);
        return baseClasses.join(' ');
    }

    @api
    get modalAriaHidden() {
        return !this.isOpen;
    }

    closeModal(event) {
        event.stopPropagation();
        this.toggleModal();
    }

    innerClickHandler(event) {
        event.stopPropagation();
    }

    innerKeyUpHandler(event) {
        if (event.keyCode === ESC_KEY_CODE || event.code === ESC_KEY_STRING) {
            this.toggleModal();
        } else if (
            event.keyCode === TAB_KEY_CODE ||
            event.code === TAB_KEY_STRING
        ) {
            const el = this.template.activeElement;
            let focusableElement;
            if (event.shiftKey && el && el.classList.contains('firstlink')) {
                //the save button is only shown
                //for modals with a saveHandler attached
                //fallback to the first button, otherwise
                focusableElement = this.template.querySelector('button.save');
                if (!focusableElement) {
                    focusableElement = this._getCloseButton();
                }
                focusableElement.focus();
            } else if (el && el.classList.contains('lastLink')) {
                focusableElement = this._getCloseButton();
            }
            if (focusableElement) {
                focusableElement.focus();
            }
        }
    }

    _getCloseButton() {
        return this.template.querySelector('button[title="Close"]');
    }

    _getSlotName(element) {
        let slotName = element.slot;
        while (!slotName && element.parentElement) {
            slotName = this._getSlotName(element.parentElement);
        }
        return slotName;
    }

    async focusFirstChild() {
        const children = [...this.querySelectorAll('*')];
        for (let child of children) {
            let hasBeenFocused = false;
            if (this._getSlotName(child) === 'body') {
                continue;
            }
            await this.setFocus(child).then((res) => {
                hasBeenFocused = res;
            });
            if (hasBeenFocused) {
                return;
            }
        }
        //if there is no focusable markup from slots
        //focus the first button
        const closeButton = this._getCloseButton();
        if (closeButton) {
            closeButton.focus();
        }
    }

    setFocus(el) {
        return new Promise((resolve) => {
            try {
                el.addEventListener('focus', () => resolve(true));
                el.focus();
                setTimeout(() => resolve(false), 0);
            } catch (ex) {
                resolve(false);
            }
        });
    }
}
