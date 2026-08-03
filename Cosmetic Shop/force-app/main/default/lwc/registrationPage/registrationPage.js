import { LightningElement } from 'lwc';
import registerCustomer from '@salesforce/apex/RegistrationController.registerCustomer';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RegistrationPage extends LightningElement {

    firstName='';
    lastName='';
    email='';
    phone='';
    address='';
    city='';
    state='';
    country='India';
    pincode='';
    password='';
    confirmPassword='';

    handleFirstName(event){ this.firstName=event.target.value; }
    handleLastName(event){ this.lastName=event.target.value; }
    handleEmail(event){ this.email=event.target.value; }
    handlePhone(event){ this.phone=event.target.value; }
    handleAddress(event){ this.address=event.target.value; }
    handleCity(event){ this.city=event.target.value; }
    handleState(event){ this.state=event.target.value; }
    handleCountry(event){ this.country=event.target.value; }
    handlePincode(event){ this.pincode=event.target.value; }
    handlePassword(event){ this.password=event.target.value; }
    handleConfirmPassword(event){ this.confirmPassword=event.target.value; }

    register(){

        if(this.password!==this.confirmPassword){

            this.showToast(
                'Error',
                'Passwords do not match.',
                'error'
            );
            return;
        }

        const registrationData={

            firstName:this.firstName,
            lastName:this.lastName,
            email:this.email,
            phone:this.phone,
            address:this.address,
            city:this.city,
            state:this.state,
            country:this.country,
            pincode:this.pincode,
            password:this.password

        };

        registerCustomer({

            registrationJson:JSON.stringify(registrationData)

        })
        .then(()=>{

            this.showToast(
                'Success',
                'Registration Successful.',
                'success'
            );

            window.location.href='/login';

        })
        .catch(error=>{

            this.showToast(
                'Error',
                error.body.message,
                'error'
            );

        });

    }

    showToast(title,message,variant){

        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );

    }

}