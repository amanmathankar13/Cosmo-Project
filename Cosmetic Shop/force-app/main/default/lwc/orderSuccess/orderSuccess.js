import { LightningElement } from 'lwc';

export default class OrderSuccess extends LightningElement {

    orderNumber;
    orderDate;
    paymentMethod;
    totalAmount;
    deliveryDate;

    connectedCallback() {

        this.orderNumber =
            localStorage.getItem('ORDER_NUMBER') || 'ORD100001';

        this.paymentMethod =
            localStorage.getItem('PAYMENT_METHOD') || 'Cash On Delivery';

        this.totalAmount =
            localStorage.getItem('ORDER_TOTAL') || 0;

        this.orderDate =
            new Date().toLocaleDateString('en-IN');

        const date = new Date();

        date.setDate(date.getDate() + 5);

        this.deliveryDate =
            date.toLocaleDateString('en-IN');

    }

    continueShopping() {

        localStorage.removeItem('ORDER_TOTAL');
        localStorage.removeItem('ORDER_NUMBER');
        localStorage.removeItem('PAYMENT_METHOD');

        window.location.href = '/customer';

    }

}