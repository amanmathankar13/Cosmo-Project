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


            // Create Account

            Account acc = new Account();

            acc.Name = firstName + ' ' + lastName + ' Account';

            insert acc;



            // Create Contact

            Contact con = new Contact();

            con.FirstName = firstName;

            con.LastName = lastName;

            con.Email = email;

            con.Phone = phone;

            con.AccountId = acc.Id;


            insert con;



            // Create External User

            // Create External User

            User user = new User();

            user.FirstName = firstName;

            user.LastName = lastName;

            user.Email = email;

            user.Username = email;

            user.CommunityNickname =
                firstName.toLowerCase()
                +
                lastName.toLowerCase()
                +
                String.valueOf(DateTime.now().getTime());


            user.ContactId = con.Id;


            user.ProfileId =
            [
                SELECT Id
                FROM Profile
                WHERE Name = 'Customer Community Login User'
                LIMIT 1
            ].Id;


            user.Alias =
                (firstName.substring(0,1)
                +
                lastName.substring(0,1))
                .toLowerCase();


            user.TimeZoneSidKey = 'Asia/Kolkata';

            user.LocaleSidKey = 'en_IN';

            user.EmailEncodingKey = 'UTF-8';

            user.LanguageLocaleKey = 'en_US';



            String userId =
                Site.createPortalUser(
                    user,
                    acc.Id,
                    password,
                    true
                );



        }
        catch(Exception e){


            throw new AuraHandledException(
                'Registration Failed: '
                + e.getMessage()
                + ' Line: '
                + e.getLineNumber()
            );


        }

    }

}