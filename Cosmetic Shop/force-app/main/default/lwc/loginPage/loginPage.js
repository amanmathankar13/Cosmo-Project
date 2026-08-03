import { LightningElement } from 'lwc';
import login from '@salesforce/apex/LoginController.login';

export default class CustomerLogin extends LightningElement {

    username;
    password;
    errorMessage;


    handleChange(event) {

        this[event.target.name] = event.target.value;

    }


    handleLogin() {

        login({
            username: this.username,
            password: this.password
        })
        .then(result => {

            window.location.href = result;

        })
        .catch(error => {

            this.errorMessage = error.body.message;

        });

    }

}