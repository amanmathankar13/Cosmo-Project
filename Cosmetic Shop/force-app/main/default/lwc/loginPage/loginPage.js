import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';


export default class CustomerLogin extends NavigationMixin(LightningElement) {


    username;
    password;

    errorMessage;



    handleUsername(event){

        this.username = event.target.value;

    }



    handlePassword(event){

        this.password = event.target.value;

    }



    handleLogin(){


        window.location.href =
        '/servlet/servlet.su' +
        '?email=' + this.username +
        '&password=' + this.password;


    }


}