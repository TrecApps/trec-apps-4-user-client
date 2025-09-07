import { Component, Inject, LOCALE_ID, ViewChild } from '@angular/core';
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
import { Address, AddressList, AuthService, PopupComponent, StylesService } from '@tc/tc-ngx-general';
import { ResponseObj } from '@tc/tc-ngx-general';

import {
  injectStripe,
  StripeElementsDirective,
  StripePaymentElementComponent
} from 'ngx-stripe';
import {
  StripeElementsOptions, 
  StripePaymentElementOptions
} from '@stripe/stripe-js';
import { environment } from '../../Environment/environment';


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
    imports: [NavComponent, CommonModule, FormsModule, StripeElementsDirective,
  StripePaymentElementComponent, PopupComponent],
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
  pay() {
    this.stripe
      .confirmPayment({
        elements: this.paymentElement.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: this.name as string,
              email: this.email as string,
              address: {
                line1: this.address as string,
                postal_code: this.zipcode as string,
                city: this.city as string
              }
            }
          }
        },
        redirect: 'if_required'
      })
  }

  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;


  subList: UserSubscription[] = [];

  availableList: TcSubscription[] = [];

  userList: UserSubscriptionList | undefined;

  stripe = injectStripe(environment.STRIPE_PUBLIC_KEY);

  currentYear = new Date().getFullYear();

  showPayment: boolean = false;


  elementsOptions: StripeElementsOptions = {};

  ss: StylesService;

  authService: AuthService;

  prepPayment(key: string){

    let user = this.authService.tcUser;
    if(!user || !user.verifiedEmail) return;
    this.elementsOptions = {
      clientSecret: key

    }

    this.name = user.displayName || "";
    this.email = user.verifiedEmail;

    if(user.addressList.billingAddress != -1) {
      let useAddress: Address = user.addressList.addressList[user.addressList.billingAddress];
      this.address = useAddress.address1 + " " + useAddress.address2;
      this.zipcode = useAddress.postCode;
      this.city = useAddress.township;
    } else {
      this.address = "";
      this.zipcode = "";
      this.city = "";
    }


    
  }

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false
    }
  };

  name: string = "";
  email: string = "";
  address: string = "";
  zipcode: string = "";
  city: string = "";


  // Mask Field Methods

  getMask(input: string) : string {
    let ret = "";
    for(let i = 0; i < input.length - 4; i++)
        ret += "•"
    for(let i = input.length - 4; i < input.length; i++)
      ret += input.charAt(i);
    return ret;
  }





  backupPaymentMethod: PaymentMethod | undefined;

  addressList: AddressList = new AddressList();

  showPaymentMethods: boolean = false;
  showActiveSubscriptions: boolean = false;
  showAvailableSubscriptions: boolean = false;

  constructor(
    private subscriptionService: SubscriptionService, 
    authService: AuthService, 
    private paymentService: PayMethodService, 
    private router: Router,
    ss: StylesService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.authService = authService;
    this.ss = ss;
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
