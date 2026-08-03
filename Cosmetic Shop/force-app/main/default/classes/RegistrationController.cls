public with sharing class RegistrationController {


    @AuraEnabled
    public static String registerCustomer(
        String firstName,
        String lastName,
        String email,
        String phone
    ){

        try{


            Account acc = new Account();

            acc.Name =
            firstName + ' ' + lastName + ' Account';


            insert acc;



            Contact con = new Contact();

            con.FirstName = firstName;

            con.LastName = lastName;

            con.Email = email;

            con.Phone = phone;

            con.AccountId = acc.Id;


            insert con;



            return 'SUCCESS';


        }
        catch(Exception e){

            throw new AuraHandledException(
                e.getMessage()
            );

        }

    }

}