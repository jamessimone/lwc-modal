import { createElement } from 'lwc';

import Modal from 'c/modal';

//just a little syntax sugar for testing
function assertForTestConditions() {
    const resolvedPromise = Promise.resolve();
    return resolvedPromise.then.apply(resolvedPromise, arguments);
}

describe('modal tests', () => {
    afterEach(() => {
        //the dom has to be reset after every test to prevent
        //the modal from preserving state
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('shows modal header elements when header is set', () => {
        const modal = createElement('c-modal', {
            is: Modal
        });
        document.body.appendChild(modal);

        const headerElementBeforeHeaderSet = modal.shadowRoot.querySelector(
            '.slds-modal__header'
        );
        expect(headerElementBeforeHeaderSet).toBeNull();

        //setting an @api value on a LWC triggers a re-render,
        //but the re-render only completes in a resolved promise
        //you can gather variables to test the initial state
        //prior to returning the resolved promise to the test runner
        //but all updated state must be gathered / asserted for
        //within the promise
        modal.modalHeader = 'Some Header';
        modal.modalTagline = 'Some tag line';

        return assertForTestConditions(() => {
            const headerElementAfterHeaderSet = modal.shadowRoot.querySelector(
                '.slds-modal__header'
            );
            expect(headerElementAfterHeaderSet).not.toBeNull();
            expect(
                modal.shadowRoot.querySelector('.slds-modal__title').textContent
            ).toEqual('Some Header');

            const modalTagline = modal.shadowRoot.querySelector(
                '.slds-m-top_x-small'
            );
            expect(modalTagline.textContent).toEqual('Some tag line');
        });
    });

    it('shows the modal with backdrop when toggled', () => {
        const modal = createElement('c-modal', {
            is: Modal
        });
        document.body.appendChild(modal);

        const backdropBeforeToggle = modal.shadowRoot.querySelector(
            '.slds-backdrop_open'
        );
        expect(backdropBeforeToggle).toBeNull();
        expect(modal.modalAriaHidden).toBeTruthy();

        modal.toggleModal();

        return assertForTestConditions(() => {
            expect(modal.modalAriaHidden).toBeFalsy();
            const modalSection = modal.shadowRoot.querySelector(
                `section[role="dialog"]`
            );
            expect([...modalSection.classList].join(' ')).toEqual(
                'slds-modal outerModalContent slds-visible slds-fade-in-open'
            );

            const backdropAfterOpen = modal.shadowRoot.querySelector(
                '.slds-backdrop_open'
            );
            expect(backdropAfterOpen).toBeTruthy();

            //it should auto-focus the cancel button when opened
            const cancelButton = modal.shadowRoot.querySelector(
                'button[class="slds-button slds-button_neutral focusable"]'
            );
            expect(cancelButton).toBeTruthy();
            expect(modal.shadowRoot.activeElement).toEqual(cancelButton);
        });
    });

    it('hides the modal when outer modal is clicked', () => {
        const modal = createElement('c-modal', {
            is: Modal
        });
        document.body.appendChild(modal);

        modal.toggleModal();

        const anyOuterElement = modal.shadowRoot.querySelector(
            '.outerModalContent'
        );
        anyOuterElement.click();

        return assertForTestConditions(() => {
            expect(anyOuterElement).toBeTruthy();
            expect(modal.cssClass).toEqual(
                'slds-modal outerModalContent slds-hidden'
            );
            expect(modal.modalAriaHidden).toBeTruthy();
        });
    });

    it('hides the modal when the esc key is pressed', () => {
        const modal = createElement('c-modal', {
            is: Modal
        });
        document.body.appendChild(modal);

        modal.toggleModal();

        var event = new KeyboardEvent('keyup', { code: 'Escape' });
        window.dispatchEvent(event);

        return assertForTestConditions(() => {
            expect(modal.modalAriaHidden).toBeTruthy();
        });
    });

    it('shows a save button when the modalSaveHandler is provided', () => {
        const modal = createElement('c-modal', {
            is: Modal
        });
        document.body.appendChild(modal);

        let wasCalled = false;
        const modalSaveHandler = () => (wasCalled = true);
        modal.modalSaveHandler = modalSaveHandler;

        const saveButtonBefore = modal.shadowRoot.querySelector(
            `button[class="slds-button slds-button_brand focusable"]`
        );

        return assertForTestConditions(() => {
            expect(wasCalled).toBeFalsy();
            expect(saveButtonBefore).toBeNull();

            const saveButtonAfter = modal.shadowRoot.querySelector(
                `button[class="slds-button slds-button_brand focusable"]`
            );
            expect(saveButtonAfter).toBeTruthy();
            saveButtonAfter.click();
            expect(wasCalled).toBeTruthy();
        });
    });
});
