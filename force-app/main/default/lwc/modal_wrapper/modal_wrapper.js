import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ModalWrapper extends LightningElement {
    handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.template.querySelector('c-modal').toggleModal();
    }

    //we have to use the fat arrow function here
    //to retain "this" as the wrapper context
    modalSaveHandler = (event) => {
        //normally here you would do things like
        //validate your inputs were correctly filled out
        event.stopPropagation();
        this.handleClick();
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                variant: 'success',
                message: 'Record successfully updated!'
            })
        );
    };
}
