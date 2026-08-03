import { LightningElement, track } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { NavigationMixin } from 'lightning/navigation';
import createOrder from '@salesforce/apex/CheckoutController.createOrder';

export default class CheckoutPage extends NavigationMixin(LightningElement)  {

    @track cart = [];

    userId = USER_ID;

    customerName = '';
    email = '';
    phone = '';
    address = '';
    city = '';
    state = '';
    country = 'India';
    pincode = '';

    paymentMethod = 'COD';

    paymentOptions = [
        { label: 'Cash On Delivery', value: 'COD' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Credit / Debit Card', value: 'CARD' }
    ];

    connectedCallback() {
        this.loadCart();
    }

    get storageKey() {
        return `COSMETIC_CART_${this.userId}`;
    }

    loadCart() {

        const data = localStorage.getItem(this.storageKey);

        if (data) {

            this.cart = JSON.parse(data).map(item => {

                return {

                    ...item,

                    total: item.price * item.quantity

                };

            });

        } else {

            this.cart = [];

        }

    }

    handleName(event) {
        this.customerName = event.target.value;
    }

    handleEmail(event) {
        this.email = event.target.value;
    }

    handlePhone(event) {
        this.phone = event.target.value;
    }

    handleAddress(event) {
        this.address = event.target.value;
    }

    handleCity(event) {
        this.city = event.target.value;
    }

    handleState(event) {
        this.state = event.target.value;
    }

    handleCountry(event) {
        this.country = event.target.value;
    }

    handlePincode(event) {
        this.pincode = event.target.value;
    }

    handlePayment(event) {
        this.paymentMethod = event.detail.value;
    }

    get subtotal() {

        return this.cart.reduce(

            (sum, item) => sum + item.total,

            0

        );

    }

    get deliveryCharge() {

        return this.subtotal >= 999 ? 0 : 50;

    }

    get gst() {

        return Math.round(this.subtotal * 0.18);

    }

    get grandTotal() {

        return this.subtotal + this.deliveryCharge + this.gst;

    }

    validateForm() {

        if (
            !this.customerName ||
            !this.email ||
            !this.phone ||
            !this.address ||
            !this.city ||
            !this.state ||
            !this.country ||
            !this.pincode
        ) {

            this.showToast(
                'Error',
                'Please fill all required fields.',
                'error'
            );

            return false;

        }

        return true;

    }

    async placeOrder() {

        if (this.cart.length === 0) {

            this.showToast(
                'Error',
                'Your cart is empty.',
                'error'
            );
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        const orderData = {

            customerName: this.customerName,
            email: this.email,
            phone: this.phone,
            address: this.address,
            city: this.city,
            state: this.state,
            country: this.country,
            pincode: this.pincode,
            paymentMethod: this.paymentMethod,
            subtotal: this.subtotal,
            deliveryCharge: this.deliveryCharge,
            gst: this.gst,
            grandTotal: this.grandTotal,
            products: this.cart

        };

        try {

            const orderId = await createOrder({
                orderDataJson: JSON.stringify(orderData)
            });

            console.log('Order Created : ' + orderId);

            localStorage.removeItem(this.storageKey);
            this.cart = [];

            this.showToast(
                'Success',
                'Order placed successfully.',
                'success'
            );

            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'Order_Success'
                }
            });

        } catch (error) {

            console.error(error);

            this.showToast(
                'Error',
                error.body ? error.body.message : 'Unable to place order.',
                'error'
            );
        }

    }

    backToCart() {

        window.history.back();

    }

    showToast(title, message, variant) {

        this.dispatchEvent(

            new ShowToastEvent({

                title,
                message,
                variant

            })

        );

    }

}