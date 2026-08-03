public without sharing class RegistrationController {

    @AuraEnabled
    public static String registerCustomer(
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        String city,
        String state,
        String country,
        String pincode
    ) {

        try {

            // Create Customer Account

            Account acc = new Account();

            acc.Name = firstName + ' ' + lastName + ' Account';

            insert acc;



            // Create Customer Contact

            Contact con = new Contact();

            con.FirstName = firstName;

            con.LastName = lastName;

            con.Email = email;

            con.Phone = phone;

            con.AccountId = acc.Id;


            if(address != null){
                con.MailingStreet = address;
            }

            if(city != null){
                con.MailingCity = city;
            }

            if(state != null){
                con.MailingState = state;
            }

            if(country != null){
                con.MailingCountry = country;
            }

            if(pincode != null){
                con.MailingPostalCode = pincode;
            }


            try{

                insert con;

            }
            catch(Exception e){

                System.debug('ERROR MESSAGE : ' + e.getMessage());
                System.debug('ERROR LINE : ' + e.getLineNumber());
                System.debug('STACK TRACE : ' + e.getStackTraceString());

                throw new AuraHandledException(
                    'Registration Failed: ' +
                    e.getTypeName() +
                    ' - ' +
                    e.getMessage() +
                    ' Line: ' +
                    e.getLineNumber()
                );

}



            return 'SUCCESS';


        }
        catch(Exception e){

            throw new AuraHandledException(
                'Registration Failed: ' +
                e.getMessage() +
                ' Line: ' +
                e.getLineNumber()
            );

        }

    }

}