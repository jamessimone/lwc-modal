import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ModalWrapper extends LightningElement {
    handleClick() {
        this.template.querySelector('c-modal').toggleModal();
    }

    //we have to use the fat arrow function here
    //to retain "this" as the wrapper context
    modalSaveHandler = (event) => {
        //you should stopPropagation in your save handler
        //to prevent unwanted side-effects
        event.stopPropagation();
        //normally here you would do things like
        //validate your inputs were correctly filled out
        this.handleClick();
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!',
                variant: 'success',
                message: 'Record successfully updated.'
            })
        );
    };
}
