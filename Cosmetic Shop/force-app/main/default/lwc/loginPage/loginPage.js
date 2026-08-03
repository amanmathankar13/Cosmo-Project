import { LightningElement } from 'lwc';
import getLoginUrl from '@salesforce/apex/LoginController.getLoginUrl';


export default class CustomerLogin extends LightningElement {


    handleLogin(){

        getLoginUrl()
            .then(url => {

                window.location.href = url;

            })
            .catch(error => {

                console.error(error);

            });

    }

}