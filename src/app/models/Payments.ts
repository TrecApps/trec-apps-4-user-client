export enum BankAccountType {
    CHECKING,
    SAVINGS
}

export class UsBankInfo {
    isIndividual: boolean = true;
    accountType:BankAccountType = BankAccountType.CHECKING;

    routingNumber: string = "";

    accountNumber: string = "";

    countryId: string = "US";

    email: string | undefined;

    name: string = "";
    payId: string = "";
}


export class CardInfoSubmission {
    expMonth: number = 0;
    expYear: number = 0;

    number: string = "";

    cvc: number = 0;

    email: string | undefined;

    name: string = "";

    payId: string = "";
}


export class UserSubscription {
    id: string | undefined;

    subscriptionId: string = "";

    category: string | undefined;


    level: number = 0; // The Level the user is using
    initiated: Date | undefined;
    lastUpdate: Date | undefined;
}

export class SubscriptionLevel {
    level: number = 0;
    description: string = "";
    currentPrice: number = 0.0;
}

export class TcSubscription {
    id: string = "";
    name: string = "";

    desc: string = "";

    category: string | undefined;

    removalDate: Date | undefined;
    alternativeId: string | undefined;

    subscriptionLevels: SubscriptionLevel[] = [];
}


export class SubscriptionPost {
    subscriptionID: string;
    level: number;

    constructor(subscriptionID: string, level: number) {
        this.subscriptionID = subscriptionID;
        this.level = level;
    }
}