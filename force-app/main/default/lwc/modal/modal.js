import { api, LightningElement } from 'lwc';

const ESC_KEY_CODE = 27;
const ESC_KEY_STRING = 'Escape';
const FOCUSABLE_ELEMENTS = '.focusable';
const OUTER_MODAL_CLASS = 'outerModalContent';
const TAB_KEY_CODE = 9;
const TAB_KEY_STRING = 'Tab';

export default class Modal extends LightningElement {
    isFirstRender = true;
    isOpen = false;

    constructor() {
        super();
        this.template.addEventListener('click', (event) => {
            const classList = [...event.target.classList];
            if (classList.includes(OUTER_MODAL_CLASS)) {
                this.toggleModal();
            }
        });
    }

    renderedCallback() {
        if (this.isFirstRender) {
            this.isFirstRender = false;

            window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        }
    }

    disconnectedCallback() {
        window.removeEventListener('keyup');
    }

    @api modalHeader;
    @api modalTagline;
    @api modalSaveHandler;

    @api
    toggleModal() {
        debugger;
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            const focusableElems = this._getFocusableElements();
            this._focusFirstTabbableElement(focusableElems);
        }
    }

    @api
    get cssClass() {
        const baseClass = 'slds-modal outerModalContent ';
        return (
            baseClass +
            (this.isOpen ? 'slds-visible slds-fade-in-open' : 'slds-hidden')
        );
    }

    @api
    get modalAriaHidden() {
        return !this.isOpen;
    }

    closeModal(event) {
        event.stopPropagation();
        this.toggleModal();
    }

    handleModalLostFocus() {
        const focusableElems = this._getFocusableElements();
        this._focusFirstTabbableElement(focusableElems);
    }

    handleKeyUp(event) {
        if (event.keyCode === ESC_KEY_CODE || event.code === ESC_KEY_STRING) {
            this.toggleModal();
        } else if (
            event.keyCode === TAB_KEY_CODE ||
            event.code === TAB_KEY_STRING
        ) {
            const focusableElems = this._getFocusableElements();
            if (this._shouldRefocusToModal(focusableElems)) {
                this._focusFirstTabbableElement(focusableElems);
            }
        }
    }

    _shouldRefocusToModal(focusableElems) {
        return focusableElems.indexOf(this.template.activeElement) === -1;
    }

    _getFocusableElements() {
        /*a not obvious distinct between slotted components
        and the rest of the component's markup:
        markup injected by slot appears with this.querySelector
        or this.querySelectorAll; all other markup for a component
        appears with this.template.querySelector/querySelectorAll.
        unfortunately, at the present moment I cannot use the focusable
        elements returned by this.querySelectorAll, because this.template.activeElement
        is not set when markup injected via slot is focused. I have filed
        an issue on the LWC github (https://github.com/salesforce/lwc/issues/1923)
        and will fix the below lines once the issue has been resolved

        const potentialElems = [...this.querySelectorAll(FOCUSABLE_ELEMENTS)];
        potentialElems.push(
            ...this.template.querySelectorAll(FOCUSABLE_ELEMENTS)
        ); */

        const potentialElems = [
            ...this.template.querySelectorAll(FOCUSABLE_ELEMENTS)
        ];

        return potentialElems;
    }

    _focusFirstTabbableElement(focusableElems) {
        if (focusableElems.length > 0) {
            focusableElems[0].focus();
        }
    }
}
