import { TcSubscription } from "./Payments";

export class UserSubscription{
    id: string = "";
    subscriptionId: string = "";
    level: number = 0;
    price: number = 0.0;
    initiated: Date | undefined;
    lastUpdate: Date | undefined;
    subscriptionDetails: TcSubscription | undefined;

    showDetails: boolean = false;

    subscriptionDesiredLevel: number = 0;

    refreshPrice(){
        if(!this.subscriptionDetails) return;

        for(let l of this.subscriptionDetails.subscriptionLevels){
            if(l.level == this.level){
                this.price = l.currentPrice;
            }
        }
    }
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