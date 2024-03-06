

export class PasswordProfile {
    password: string | undefined;
}

export class UserPost {
    
    displayName : string | undefined;
    mailNickname : string | undefined;
    userPrincipalName : string | undefined;
    passwordProfile: PasswordProfile | undefined;
    mobilePhone : string | undefined;
    birthday: string | null | undefined;
    mail : string | undefined;

    validate() : boolean {
        console.log(this);
        return !!(this.displayName && this.userPrincipalName && this.passwordProfile?.password &&
            this.mobilePhone && this.birthday && this.mailNickname && this.mail);

    }
}

export class UserResponse{
    message : string | undefined;
    user : string | undefined;
}

export class PhoneNumber {
    number : number = 0;
    countryCode: number = 1;
}

export class TcUser {
    id : string | undefined;
    displayName : string | undefined;
    userProfile : string | undefined;
    mobilePhone : PhoneNumber | undefined = new PhoneNumber();
    phoneVerified: boolean | undefined;

    email : string | undefined;
    emailVerified : boolean | undefined;

    birthday: Date | undefined;
    birthdaySetting: string | undefined;

    address: string[] | undefined;
    restrictions: string | undefined;

    credibilityRating: number | undefined;

    profilePics: Object | undefined;
}