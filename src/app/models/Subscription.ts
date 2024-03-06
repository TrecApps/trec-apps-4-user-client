
export class UserSubscription{
    subscription: string = "";
    level: number = 0;
}

export class UserSubscriptionList {
    nextBillDate : Date | undefined;
    subscriptionList: UserSubscription[] = [];
}

export class SubscriptionLevel{
    level: number | undefined; // Integer
    price: number | undefined;// float
    name: string | undefined;
    desc: string | undefined;
}

export class Subscription{
    id: string | undefined;
    name: string | undefined;
    desc: string | undefined;
    defaultPrice: number | undefined;

    levels: SubscriptionLevel[] = [];
}