import { LightningElement, track } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class CartPage extends NavigationMixin(LightningElement) {

    @track cart = [];

    userId = USER_ID;

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

    saveCart() {

        const updatedCart = this.cart.map(item => {
            return {
                ...item,
                total: item.price * item.quantity
            };
        });

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(updatedCart)
        );

        this.cart = [...updatedCart];
    }

    increaseQuantity(event) {

        const productId = event.currentTarget.dataset.id;

        this.cart = this.cart.map(item => {

            if (item.productId === productId) {

                if (item.quantity < item.stockQuantity) {

                    item.quantity++;
                    item.total = item.quantity * item.price;

                } else {

                    this.showToast(
                        'Error',
                        'Insufficient stock available.',
                        'error'
                    );

                }

            }

            return item;

        });

        this.saveCart();

    }

    decreaseQuantity(event) {

        const productId = event.currentTarget.dataset.id;

        this.cart = this.cart
            .map(item => {

                if (item.productId === productId) {

                    item.quantity--;

                    item.total = item.quantity * item.price;

                }

                return item;

            })
            .filter(item => item.quantity > 0);

        this.saveCart();

    }

    removeItem(event) {

        const productId = event.currentTarget.dataset.id;

        this.cart = this.cart.filter(
            item => item.productId !== productId
        );

        this.saveCart();

        this.showToast(
            'Success',
            'Product removed from cart.',
            'success'
        );

    }

    clearCart() {

        localStorage.removeItem(this.storageKey);

        this.cart = [];

        this.showToast(
            'Success',
            'Cart cleared successfully.',
            'success'
        );

    }

    checkout() {

        if (this.cart.length === 0) {

            this.showToast(
                'Error',
                'Your cart is empty.',
                'error'
            );

            return;

        }

        console.log('Checkout Data', JSON.stringify(this.cart));



        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',

            attributes: {

                apiName: 'Checkout_Page'

            }
        });
    }


    get cartCount() {

        return this.cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

    }

    get totalAmount() {

        return this.cart.reduce(
            (total, item) => total + item.total,
            0
        );

    }

    get isCartEmpty() {

        return this.cart.length === 0;

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