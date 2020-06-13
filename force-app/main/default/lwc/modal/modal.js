import { api, LightningElement } from 'lwc';

const ESC_KEY_CODE = 27;
const ESC_KEY_STRING = 'Escape';
const FOCUSABLE_ELEMENTS = '.focusable';
const INNER_MODAL_CLASS = '.innerModal';
const TAB_KEY_CODE = 9;
const TAB_KEY_STRING = 'Tab';

export default class Modal extends LightningElement {
    isFirstRender = true;
    isOpen = false;
    modalDimensions = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    eventListeners = [
        { name: 'resize', listener: () => this._setModalSize() },
        { name: 'keyup', listener: (e) => this.handleKeyUp(e) }
    ];

    renderedCallback() {
        //always best to short-circuit when adding event listeners
        if (this.isFirstRender) {
            this.isFirstRender = false;
            this._setModalSize();
            for (let eventListener of this.eventListeners) {
                window.addEventListener(
                    eventListener.name,
                    eventListener.listener
                );
            }
        }
    }

    disconnectedCallback() {
        for (let eventListener of this.eventListeners) {
            window.removeEventListener(eventListener.name);
        }
    }

    @api modalHeader;
    @api modalTagline;
    @api modalSaveHandler;

    @api
    toggleModal() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            const focusableElems = this._getFocusableElements();
            this._focusFirstTabbableElement(focusableElems);
        }
    }

    @api
    get cssClass() {
        const baseClass = 'slds-modal ';
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

    handleInnerModalClick(event) {
        //stop the event from bubbling to the <section>
        //otherwise any click, anywhere in the modal,
        //will close it
        event.stopPropagation();

        const isWithinInnerXBoundary =
            event.clientX >= this.modalDimensions.left &&
            event.clientX <= this.modalDimensions.right;
        const isWithinInnerYBoundary =
            event.clientY >= this.modalDimensions.top &&
            event.clientY <= this.modalDimensions.bottom;
        if (isWithinInnerXBoundary && isWithinInnerYBoundary) {
            //do nothing, the click was properly within the modal bounds
            return;
        }
        this.toggleModal();
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

    _setModalSize() {
        const innerModalDimensions = this.template
            .querySelector(INNER_MODAL_CLASS)
            .getBoundingClientRect();
        this.modalDimensions.top = innerModalDimensions.top;
        this.modalDimensions.left = innerModalDimensions.left;
        this.modalDimensions.bottom = innerModalDimensions.bottom;
        this.modalDimensions.right = innerModalDimensions.right;
    }
}
