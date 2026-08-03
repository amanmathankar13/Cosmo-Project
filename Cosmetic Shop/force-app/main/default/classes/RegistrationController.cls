public without sharing class RegistrationController {

    @AuraEnabled
    public static String registerCustomer(
        String firstName,
        String lastName,
        String email,
        String phone
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


            System.debug('CONTACT CREATED: ' + con.Id);


            return 'SUCCESS';


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