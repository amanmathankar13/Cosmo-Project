public with sharing class ProductController {

    public class ProductWrapper {

        @AuraEnabled public Id productId;
        @AuraEnabled public String name;
        @AuraEnabled public String category;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String description;
        @AuraEnabled public Decimal stockQuantity;
        @AuraEnabled public String imageUrl;
    }

    @AuraEnabled(cacheable=true)
    public static List<ProductWrapper> getProducts() {

        List<Product2> products = [
            SELECT Id,
                   Name,
                   Category__c,
                   Price__c,
                   Description,
                   Stock_Quantity__c
            FROM Product2
            ORDER BY CreatedDate DESC
        ];

        Set<Id> productIds = new Set<Id>();

        for(Product2 product : products){
            productIds.add(product.Id);
        }

        Map<Id,String> imageMap = new Map<Id,String>();

        if(!productIds.isEmpty()){

            for(ContentDocumentLink cdl : [
                SELECT LinkedEntityId,
                       ContentDocument.LatestPublishedVersionId
                FROM ContentDocumentLink
                WHERE LinkedEntityId IN :productIds
            ]){

                imageMap.put(
                    cdl.LinkedEntityId,
                    URL.getOrgDomainUrl().toExternalForm() +
                    '/sfc/servlet.shepherd/version/download/' +
                    cdl.ContentDocument.LatestPublishedVersionId
                );
            }
        }

        List<ProductWrapper> result =
            new List<ProductWrapper>();

        for(Product2 product : products){

            ProductWrapper wrapper =
                new ProductWrapper();

            wrapper.productId = product.Id;
            wrapper.name = product.Name;
            wrapper.category = product.Category__c;
            wrapper.price = product.Price__c;
            wrapper.description = product.Description;
            wrapper.stockQuantity = product.Stock_Quantity__c;

            wrapper.imageUrl = imageMap.get(product.Id);

            result.add(wrapper);
        }

        return result;
    }

    @AuraEnabled
    public static Id createProduct(
        String productName,
        String category,
        Decimal price,
        Decimal stockQuantity,
        String description,
        String fileName,
        String base64Data
    ) {

        Product2 product = new Product2();

        product.Name = productName;
        product.Category__c = category;
        product.Price__c = price;
        product.Description = description;
        product.Stock_Quantity__c = stockQuantity;
        product.IsActive = true;

        insert product;

        if(String.isNotBlank(base64Data)){

            uploadProductImage(
                product.Id,
                fileName,
                base64Data
            );
        }

        return product.Id;
    }

    @AuraEnabled
    public static void updateProduct(
        Id productId,
        String productName,
        String category,
        Decimal price,
        Decimal stockQuantity,
        String description,
        String fileName,
        String base64Data
    ) {

        Product2 product = [
            SELECT Id,
                   Name,
                   Category__c,
                   Price__c,
                   Description,
                   Stock_Quantity__c
            FROM Product2
            WHERE Id = :productId
            LIMIT 1
        ];

        product.Name = productName;
        product.Category__c = category;
        product.Price__c = price;
        product.Description = description;
        product.Stock_Quantity__c = stockQuantity;

        update product;

        if(String.isNotBlank(base64Data)){

            uploadProductImage(
                productId,
                fileName,
                base64Data
            );
        }
    }

    @AuraEnabled
    public static void deleteProduct(
        Id productId
    ) {

        Product2 product = [
            SELECT Id
            FROM Product2
            WHERE Id = :productId
            LIMIT 1
        ];

        delete product;
    }

    private static void uploadProductImage(
        Id recordId,
        String fileName,
        String base64Data
    ){

        ContentVersion cv =
            new ContentVersion();

        cv.Title = fileName;
        cv.PathOnClient = fileName;
        cv.VersionData =
            EncodingUtil.base64Decode(base64Data);

        insert cv;

        cv = [
            SELECT Id,
                   ContentDocumentId
            FROM ContentVersion
            WHERE Id = :cv.Id
            LIMIT 1
        ];

        ContentDocumentLink cdl =
            new ContentDocumentLink();

        cdl.ContentDocumentId =
            cv.ContentDocumentId;

        cdl.LinkedEntityId =
            recordId;

        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';

        insert cdl;
    }
}