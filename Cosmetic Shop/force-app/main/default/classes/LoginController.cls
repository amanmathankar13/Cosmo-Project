public with sharing class LoginController {

    @AuraEnabled(cacheable=true)
    public static String getLoginUrl() {

        return Site.getLoginUrl();
    }

}