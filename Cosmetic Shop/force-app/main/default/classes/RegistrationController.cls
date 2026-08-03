public without sharing class RegistrationController {

    // IMPORTANT: update this to the EXACT Profile Name of your
    // Customer Community / Customer Community Plus profile
    // (Setup -> Profiles -> copy the exact label)
    private static final String CUSTOMER_PROFILE_NAME = 'Customer';

    @AuraEnabled
    public static String registerCustomer(String registrationJson) {

        // Tracks which stage we are in, so any failure tells you
        // exactly where it happened instead of a generic error.
        String currentStep = 'START';
        Savepoint sp = Database.setSavepoint();

        try {

            currentStep = 'PARSE_INPUT';
            Map<String, Object> data =
                (Map<String, Object>) JSON.deserializeUntyped(registrationJson);

            String firstName = (String) data.get('firstName');
            String lastName = (String) data.get('lastName');
            String email = (String) data.get('email');
            String phone = (String) data.get('phone');
            String address = (String) data.get('address');
            String city = (String) data.get('city');
            String state = (String) data.get('state');
            String country = (String) data.get('country');
            String pincode = (String) data.get('pincode');
            String password = (String) data.get('password');

            currentStep = 'VALIDATE_INPUT';
            if (String.isBlank(firstName) || String.isBlank(lastName)
                || String.isBlank(email) || String.isBlank(password)) {
                throw new AuraHandledException(
                    'STEP=' + currentStep
                    + ' | First name, last name, email and password are required.'
                );
            }

            currentStep = 'CHECK_DUPLICATE_USER';
            if ([SELECT COUNT() FROM User WHERE Username = :email] > 0) {
                throw new AuraHandledException(
                    'STEP=' + currentStep
                    + ' | A user with this email already exists.'
                );
            }

            currentStep = 'CREATE_ACCOUNT';
            Account acc = new Account();
            acc.Name = firstName + ' ' + lastName;
            acc.Phone = phone;
            insert acc;
            System.debug('STEP=' + currentStep + ' OK, AccountId=' + acc.Id);

            currentStep = 'CREATE_CONTACT';
            Contact con = new Contact();
            con.FirstName = firstName;
            con.LastName = lastName;
            con.Email = email;
            con.Phone = phone;
            con.MailingStreet = address;
            con.MailingCity = city;
            con.MailingState = state;
            con.MailingCountry = country;
            con.MailingPostalCode = pincode;
            con.AccountId = acc.Id;
            insert con;
            System.debug('STEP=' + currentStep + ' OK, ContactId=' + con.Id);

            currentStep = 'LOOKUP_PROFILE';
            List<Profile> profiles = [
                SELECT Id
                FROM Profile
                WHERE Name = :CUSTOMER_PROFILE_NAME
                LIMIT 1
            ];
            if (profiles.isEmpty()) {
                throw new AuraHandledException(
                    'STEP=' + currentStep
                    + ' | No Profile found named "' + CUSTOMER_PROFILE_NAME
                    + '". Check Setup -> Profiles and update CUSTOMER_PROFILE_NAME.'
                );
            }
            Profile p = profiles[0];
            System.debug('STEP=' + currentStep + ' OK, ProfileId=' + p.Id);

            currentStep = 'BUILD_USER';
            User u = new User();
            u.FirstName = firstName;
            u.LastName = lastName;

            // Username must be globally unique across ALL Salesforce orgs,
            // so we cannot safely use the raw email. We keep it in valid
            // email format but make it unique to this org.
            String usernameLocalPart = email.contains('@')
                ? email.substringBefore('@')
                : email;
            String usernameDomainPart = email.contains('@')
                ? email.substringAfter('@')
                : 'example.com';
            u.Username = usernameLocalPart + '.' + UserInfo.getOrganizationId()
                + '@' + usernameDomainPart;

            u.Email = email;
            u.ContactId = con.Id;
            u.ProfileId = p.Id;

            u.Alias = firstName.length() >= 4
                ? firstName.substring(0, 4)
                : firstName;

            u.CommunityNickname =
                firstName +
                String.valueOf(DateTime.now().getTime());

            u.TimeZoneSidKey = 'Asia/Kolkata';
            u.LocaleSidKey = 'en_US';
            u.EmailEncodingKey = 'UTF-8';
            u.LanguageLocaleKey = 'en_US';

            currentStep = 'CREATE_EXTERNAL_USER';
            String externalUserId = Site.createExternalUser(u, acc.Id, password);

            if (String.isBlank(externalUserId)) {
                throw new AuraHandledException(
                    'STEP=' + currentStep
                    + ' | Site.createExternalUser returned blank. '
                    + 'Check password policy, available licenses, and profile access.'
                );
            }

            System.debug('STEP=' + currentStep + ' OK, UserId=' + externalUserId);

            return 'SUCCESS';

        } catch (Exception e) {

            Database.rollback(sp);

            throw new AuraHandledException(
                'STEP=' + currentStep
                + ' | ERROR => ' + e.getTypeName()
                + ' | ' + e.getMessage()
                + ' | Line=' + e.getLineNumber()
            );
        }
    }
}