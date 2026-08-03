import { LightningElement } from 'lwc';

import registerCustomer 
from '@salesforce/apex/RegistrationController.registerCustomer';


export default class CustomerRegistration extends LightningElement {


    firstName;
    lastName;
    email;
    phone;
    password;

    message;



    handleChange(event){

        this[event.target.dataset.field]
        =
        event.target.value;

    }



    register(){


        registerCustomer({

            firstName:this.firstName,

            lastName:this.lastName,

            email:this.email,

            phone:this.phone,

            password:this.password

        })

        .then(result=>{


            this.message =
            'Registration successful';


        })

        .catch(error=>{


            this.message =
            error.body.message;


        });


    }


}