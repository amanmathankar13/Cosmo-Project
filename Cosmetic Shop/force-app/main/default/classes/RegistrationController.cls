public without sharing class RegistrationController {

    @AuraEnabled
    public static String registerCustomer(
        String firstName,
        String lastName,
        String email,
        String phone,
        String password
    ) {

        try {

            System.debug('STEP 1: Creating Account');


            Account acc = new Account();

            acc.Name = firstName + ' ' + lastName + ' Account';

            insert acc;


            System.debug('ACCOUNT CREATED: ' + acc.Id);


            System.debug('STEP 2: Creating Contact');


            Contact con = new Contact();

            con.FirstName = firstName;

            con.LastName = lastName;

            con.Email = email;

            con.Phone = phone;

            con.AccountId = acc.Id;


            insert con;

            User user = new User();

            user.FirstName = firstName;
            user.LastName = lastName;
            user.Email = email;
            user.Username = email+'.customer';
            user.CommunityNickname = firstName.toLowerCase() + lastName.toLowerCase() + String.valueOf(DateTime.now().getTime());
            user.ContactId = con.Id;

            user.ProfileId = [
                SELECT Id
                FROM Profile
                WHERE Name = 'Cosmetic Customer'
                LIMIT 1
            ].Id;

            user.Alias = (firstName.substring(0, 1) + lastName.substring(0, 4)).toLowerCase();
            user.TimeZoneSidKey = 'Asia/Kolkata';
            user.LocaleSidKey = 'en_IN';
            user.EmailEncodingKey = 'UTF-8';
            user.LanguageLocaleKey = 'en_US';

            String userId = Site.createExternalUser(user, acc.Id, password);


            System.debug('CONTACT CREATED: ' + con.Id);


            return userId;


        }
        catch(Exception e){

            System.debug('ERROR TYPE : ' + e.getTypeName());
            System.debug('ERROR MESSAGE : ' + e.getMessage());
            System.debug('ERROR LINE : ' + e.getLineNumber());
            System.debug('STACK TRACE : ' + e.getStackTraceString());


            throw new AuraHandledException(
                'Registration Failed: ' 
                + e.getTypeName()
                + ' - '
                + e.getMessage()
                + ' Line: '
                + e.getLineNumber()
            );

        }

    }

}