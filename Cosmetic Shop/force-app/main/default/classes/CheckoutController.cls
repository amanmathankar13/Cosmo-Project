public with sharing class CheckoutController {

    @AuraEnabled
    public static Id createOrder(String orderDataJson) {

        Map<String,Object> orderData =
            (Map<String,Object>)JSON.deserializeUntyped(orderDataJson);

        User currentUser = [
            SELECT Contact.AccountId
            FROM User
            WHERE Id = :UserInfo.getUserId()
        ];

        if(currentUser.Contact == null || currentUser.Contact.AccountId == null){
            throw new AuraHandledException('Customer Account not found.');
        }

        Order__c orderRec = new Order__c();

        orderRec.Account__c = currentUser.Contact.AccountId;
        orderRec.Order_Date__c = Date.today();
        orderRec.Order_Status__c = 'Placed';
        orderRec.Payment_Type__c = (String)orderData.get('paymentMethod');

        orderRec.Shipping_Address__c =
            (String)orderData.get('address')
            + ', ' +
            (String)orderData.get('city')
            + ', ' +
            (String)orderData.get('state')
            + ', ' +
            (String)orderData.get('country')
            + ' - ' +
            (String)orderData.get('pincode');

        insert orderRec;

        List<Object> products =
            (List<Object>)orderData.get('products');

        List<Order_Product__c> orderProducts = new List<Order_Product__c>();

        for(Object obj : products){

            Map<String,Object> item =
                (Map<String,Object>)obj;

            Order_Product__c op = new Order_Product__c();

            op.Order__c = orderRec.Id;

            op.Product__c = (String)item.get('id');
            

            Decimal price =
                Decimal.valueOf(String.valueOf(item.get('price')));

            Decimal qty =
                Decimal.valueOf(String.valueOf(item.get('quantity')));

            op.Quantity__c = qty;
            op.Unit_Price__c = price;

            orderProducts.add(op);
        }

        insert orderProducts;

        return orderRec.Id;
    }

}