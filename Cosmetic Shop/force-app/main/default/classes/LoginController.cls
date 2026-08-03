public without sharing class LoginController {

    @AuraEnabled
    public static String login(
        String username,
        String password
    ) {

        try {

            PageReference pageRef = Site.login(
                username,
                password,
                '/s/'
            );


            if(pageRef != null){

                return pageRef.getUrl();

            }

            return null;

        }
        catch(Exception e){

            throw new AuraHandledException(
                'Invalid username or password'
            );

        }

    }

}