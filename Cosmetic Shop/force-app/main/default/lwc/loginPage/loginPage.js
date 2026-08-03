import { LightningElement } from 'lwc';
import login from '@salesforce/apex/LoginController.login';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LoginPage extends LightningElement {

    username = '';
    password = '';

    handleUsername(event) {
        this.username = event.target.value;
    }

    handlePassword(event) {
        this.password = event.target.value;
    }

    async login() {

        if (!this.username || !this.password) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please enter username and password.',
                    variant: 'error'
                })
            );

            return;
        }

        try {

            const redirectUrl = await login({
                username: this.username,
                password: this.password
            });

            window.location.href = redirectUrl;

        } catch (error) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Login Failed',
                    message: error.body.message,
                    variant: 'error'
                })
            );

        }

    }

}