public with sharing class LoginController {

    @AuraEnabled
    public static String login(String username, String password) {

        try {

            String startUrl = '/s';

            PageReference pageRef = Site.login(
                username,
                password,
                startUrl
            );

            if (pageRef != null) {
                return pageRef.getUrl();
            }

            throw new AuraHandledException('Invalid username or password.');

        } catch (Exception e) {

            throw new AuraHandledException(e.getMessage());

        }

    }

}