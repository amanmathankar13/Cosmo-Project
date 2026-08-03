import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CosmeticNavbar extends NavigationMixin(LightningElement) {

    navigateToPage(pageName) {

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: pageName
            }
        });

    }


    handleRegister() {
        this.navigateToPage('userRegister__c');
    }


    handleLogin() {
        this.navigateToPage('userlogin__c');
    }


    handleHome() {
        this.navigateToPage('Home');
    }


    handleShop() {
        this.navigateToPage('Shop');
    }


    handleCart() {
        this.navigateToPage('Cart');
    }

}