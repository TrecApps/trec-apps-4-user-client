import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserSubscriptionList, UserSubscription } from '../../models/Subscription';
import { SubscriptionService, SubscriptionsSearchObject } from '../../services/subscription.service';
import { NavComponent } from "../nav/nav.component";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PaymentMethod, PayMethodService } from '../../services/pay-method.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankAccountType, CardInfoSubmission, SubscriptionPost, TcSubscription, UsBankInfo } from '../../models/Payments';
import { AddressList, AuthService } from '@tc/tc-ngx-general';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';


class PaymentMethodHolder {
  usBank: UsBankInfo| undefined;
  card: CardInfoSubmission | undefined;

  constructor(paymentMethod: PaymentMethod) {
    if(paymentMethod instanceof UsBankInfo){
      this.usBank = paymentMethod;
    }
    if(paymentMethod instanceof CardInfoSubmission){
      this.card = paymentMethod;
    }
  }

  getId(): string {
    if(this.usBank) return this.usBank.payId;
    if(this.card) return this.card.payId;
    return "";
  }
}

@Component({
    selector: 'app-subscription',
    imports: [NavComponent, CommonModule, FormsModule],
    templateUrl: './subscription.component.html',
    styleUrl: './subscription.component.css',
    standalone: true,
    animations: [
        trigger('translate', [
            state('collapse', style({ height: '0px', overflow: 'hidden' })),
            state('expanded', style({ height: '*', overflow: 'hidden' })),
            transition('collapse => expanded', [animate('0.33s')]),
            transition('expanded => collapse', [animate('0.33s')])
        ]),
        trigger('rotate', [
            state('collapse', style({ transform: 'rotate(180deg)' })),
            state('expanded', style({ transform: 'rotate(270deg)' })),
            transition('collapse => expanded', [animate('0.33s')]),
            transition('expanded => collapse', [animate('0.33s')])
        ])
    ]
})
export class SubscriptionComponent {


  subList: UserSubscription[] = [];

  availableList: TcSubscription[] = [];

  userList: UserSubscriptionList | undefined;

  

  paymentMethods: PaymentMethodHolder[] = [];

  newUsAccount: UsBankInfo | undefined;
  newCard: CardInfoSubmission | undefined;


  // Mask Fields
  routeNum = "";
  accountNum1 = "";

  checkingValue = BankAccountType.CHECKING;
  savingsValue = BankAccountType.SAVINGS;

  cardNumber = "";
  cardNumberError = false;
  cardCvc = "";
  cardCvcError = false;

  currentYear = new Date().getFullYear();


  // Mask Field Methods

  getMask(input: string) : string {
    let ret = "";
    for(let i = 0; i < input.length - 4; i++)
        ret += "•"
    for(let i = input.length - 4; i < input.length; i++)
      ret += input.charAt(i);
    return ret;
  }


  switchRoutingNum(focusing: boolean){
    if(!this.newUsAccount) return;
    if(focusing){
      this.routeNum = this.newUsAccount.routingNumber;
    } else {
      this.newUsAccount.routingNumber = this.routeNum;
      this.routeNum = this.getMask(this.routeNum);
    }
  }

  switchAccountNum(focusing: boolean){
    if(!this.newUsAccount) return;
    if(focusing){
      this.accountNum1 = this.newUsAccount.accountNumber;
    } else {
      this.newUsAccount.accountNumber = this.accountNum1;
      this.accountNum1 = this.getMask(this.accountNum1);
    }
  }
  
  switchCardNum(focusing: boolean) {
    if(!this.newCard) return;
    if(focusing){
      this.cardNumber = this.newCard.number;
    } else {

      let numStr = this.cardNumber.trim().replace(" ", "");
      this.cardNumberError = Number.isNaN(parseInt(numStr));
      if(this.cardNumberError) return;

      this.newCard.number = numStr;
      this.cardNumber = this.getMask(this.cardNumber);
    }
  }

  switchCvc(focusing: boolean) {
    if(!this.newCard) return;
    if(focusing){
      this.cardCvc = this.newCard.cvc.toString();
    } else {
      let numStr = this.cardCvc.trim().replace(" ", "");
      let num = parseInt(numStr);
      this.cardCvcError = Number.isNaN(num);
      if(this.cardCvcError) return;

      this.newCard.cvc = num;
      let temp = "";
      for(let i = 0; i < this.cardCvc.length; i++)
        temp += "•"
      this.cardCvc = temp;
    }
  }




  backupPaymentMethod: PaymentMethod | undefined;

  addressList: AddressList = new AddressList();

  showPaymentMethods: boolean = false;
  showActiveSubscriptions: boolean = false;
  showAvailableSubscriptions: boolean = false;

  constructor(private subscriptionService: SubscriptionService, private authService: AuthService, private paymentService: PayMethodService, private router: Router) {
    this.subListChanged = false;
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        let endEvent : NavigationEnd = event;

        if(endEvent.url == "/subscriptions"){
          if(this.authService.tcUser?.addressList){
            this.addressList = this.authService.tcUser.addressList;
            console.log("address list is ", this.addressList)
          } else {
            console.log("address list not set")
          }




          if(this.addressList.billingAddress < 0) return;
          this.paymentService.getPaymentMethods().subscribe({
            next: (pm: PaymentMethod[]) => this.paymentMethods = pm.map(pm => new PaymentMethodHolder(pm))
          })

          this.subscriptionService.getActiveSubscriptions(new SubscriptionsSearchObject()).subscribe({
            next: (us: UserSubscription[]) => this.subList = us
          })
          
        }
      }      
    })
   }

  subListChanged: Boolean;

  ngOnInit(): void {
  }

  prepUsBankAccount() {
    if(this.backupPaymentMethod && this.backupPaymentMethod instanceof UsBankInfo){
      this.newUsAccount = this.backupPaymentMethod;
    } else {
      this.newUsAccount = new UsBankInfo();
    }

    if(this.newCard) {
      this.backupPaymentMethod = this.newCard;
    }

    this.newCard = undefined;
  }

  prepCardAccount(){
    if(this.backupPaymentMethod && this.backupPaymentMethod instanceof CardInfoSubmission){
      this.newCard = this.backupPaymentMethod;
    } else {
      this.newCard = new CardInfoSubmission();
    }

    if(this.newUsAccount) {
      this.backupPaymentMethod = this.newUsAccount;
    }

    this.newUsAccount = undefined;
  }

  postUsBank(){
    if(!this.newUsAccount) return;
    this.paymentService.postUsBank(this.newUsAccount).subscribe({
      next:(value: ResponseObj) => {
        alert("Successfully Added!");
        if(this.newUsAccount){
          this.newUsAccount.payId = value.id?.toString() || "";
          this.paymentMethods.push(new PaymentMethodHolder(this.newUsAccount))
          this.newUsAccount = undefined;
        }
      },
      error: (e: ResponseObj) => {
        alert(e.message);
      }
    })
  }

  postCard(){
    if(!this.newCard) return;
    this.paymentService.postCard(this.newCard).subscribe({
      next:(value: ResponseObj) => {
        alert("Successfully Added!");
        if(this.newCard){
          this.newCard.payId = value.id?.toString() || "";
          this.paymentMethods.push(new PaymentMethodHolder(this.newCard))
          this.newCard = undefined;
        }
      },
      error: (e: ResponseObj) => {
        alert(e.message);
      }
    })
  }

  cancelUsBankSubmission(){
    this.backupPaymentMethod = this.newUsAccount;
    this.newUsAccount = undefined;
  }

  cancelCardSubmission(){
    this.backupPaymentMethod = this.newCard;
    this.newCard = undefined;
  }

  removePaymentMethod(paymentMethodId: string) {
    this.paymentService.removePaymentMethod(paymentMethodId).subscribe({
      next: (ro: ResponseObj)=> {
        alert(ro.message);
        this.paymentMethods = this.paymentMethods.filter(pm => pm.getId() != paymentMethodId);
      },
      error: (ro: ResponseObj) => {
        alert(ro.message);
      }
    });
  }

  setDefault(paymentMethodId: string) {
    this.paymentService.setDefault(paymentMethodId).subscribe({
      next: (ro: ResponseObj)=> {
        alert(ro.message);
      },
      error: (ro: ResponseObj) => {
        alert(ro.message);
      }
    })
    
  }

  removeSubscription(id: string) {
    this.subscriptionService.stopSubscription(id).subscribe({
      next: (ro: ResponseObj) => {
        this.subList = this.subList.filter((sub: UserSubscription)=> sub.id != id);
      },
      error: (ro: ResponseObj) => alert(ro.message)
    })
  }

  prepUpdate(us: UserSubscription, level: number) {
    us.subscriptionDesiredLevel = level;
  }

  updateSubscription(us: UserSubscription) {
    let subPost = new SubscriptionPost(us.id, us.subscriptionDesiredLevel);
    this.subscriptionService.updateSubscription(subPost).subscribe({
      next: (ro: ResponseObj) => {
        us.level = us.subscriptionDesiredLevel
        us.refreshPrice()
      }
    })
  }

  hasSubscription(id: string): boolean {
    for(let us of this.subList){
      if(us.subscriptionId == id) return true;
    }
    return false;
  }

  beginSubscription(id: string, level: number) {
    this.subscriptionService.addSubscription(new SubscriptionPost(id, level)).subscribe({
      next: (ro: ResponseObj) => {

        for(let sub of this.availableList){
          if(sub.id == id){

            let us = new UserSubscription();
            us.id = ro.id?.toString() || "";
            us.initiated = new Date();
            us.lastUpdate = us.initiated;
            us.level = level;
            us.subscriptionDetails = sub;
            us.showDetails = true;
            us.subscriptionId = sub.id;
            us.refreshPrice();
            us.subscriptionDesiredLevel = us.level;

            this.subList.push(us);

            return;
          }
        }


      }
    })
  }

  // updateSub(){
  //   if(!this.userList)return;
  //   this.subscriptionService.updateUserSubscriptions(this.userList);
  //   this.subListChanged = false;
  // }

  routeToUserManagement(){
    this.router.navigate(['user']);
  }
}
