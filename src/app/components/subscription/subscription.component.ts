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
import { CardInfoSubmission, TcSubscription, UsBankInfo } from '../../models/Payments';
import { AddressList, AuthService } from 'tc-ngx-general';
import { ResponseObj } from 'tc-ngx-general/lib/models/ResponseObj';


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
  standalone: true,
  imports: [NavComponent, CommonModule, FormsModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css',
  animations: [
    trigger('translate', [
      state('collapse', style({ height: '0px', overflow: 'hidden'})),
      state('expanded', style({ height: '*', overflow: 'hidden'})),
      transition('collapse => expanded', [ animate('0.33s')]),
      transition('expanded => collapse', [animate('0.33s')])
    ]),
    trigger('rotate', [
      state('collapse', style({ transform: 'rotate(180deg)'})),
      state('expanded', style({ transform: 'rotate(270deg)'})),
      transition('collapse => expanded', [ animate('0.33s')]),
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

  // refreshUserSubScription(isBilled: Boolean) {
  //   this.subscriptionService.getActiveSubscriptions((sub:UserSubscriptionList) => {
  //     this.userList = sub;
  //     this.subListChanged = false;
  //   } );
  // }

  // refreshSubList() {
  //   this.refreshUserSubScription(false);

  //   this.subscriptionService.retrieveSubscriptions(this.subList);
  // }

  notIncluded(name: string) : Boolean{
    if(!this.userList){
      //this.refreshUserSubScription(false);
      return true;
    }
    
    for(let sub of this.userList.subscriptionList) {
      if(sub.subscription == name) {
        return false;
      }
    }

    return true;
  }

  isIncluded(name: string, level: number) : Boolean {
    if(!this.userList){
      //this.refreshUserSubScription(false);
      return false;
    }
    for(let sub of this.userList.subscriptionList) {
      if(sub.subscription == name && sub.level == level) {
        return true;
      }
    }
    return false;
  }

  addBasicList(name: string) {
    if(!this.userList)return;

    let userSub = new UserSubscription();
    userSub.subscription = name;

    this.userList.subscriptionList.push(userSub);
    this.subListChanged = true;
  }

  addLevelList(name: string, level: number){
    if(!this.userList)return;

    for(let sub of this.userList.subscriptionList) {
      if(sub.subscription == name) {
        sub.level = level;
        return;
      }
    }

    let userSub = new UserSubscription();
    userSub.level = level;
    userSub.subscription = name;

    this.userList.subscriptionList.push(userSub);
    this.subListChanged = true;
  }
  removeSub(name: string){
    if(!this.userList)return;

    let newList :UserSubscription[] = [];

    for(let sub of this.userList.subscriptionList) {
      if(sub.subscription != name) {
        newList.push(sub);
      }
    }

    this.userList.subscriptionList = newList;
    this.subListChanged = true;
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
