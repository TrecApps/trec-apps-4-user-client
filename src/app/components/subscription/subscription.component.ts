import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserSubscriptionList, UserSubscription } from '../../models/Subscription';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent {


  subList: Subscription[] = [];

  userList: UserSubscriptionList | undefined;

  constructor(private subscriptionService: SubscriptionService, private router: Router) {
    this.subListChanged = false;
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        let endEvent : NavigationEnd = event;

        console.log("Navigation End url is "+ endEvent.url);

        if(endEvent.url == "/subscriptions"){
          this.refreshUserSubScription(false);
        }
      }      
    })
   }

  subListChanged: Boolean;

  ngOnInit(): void {
  }

  refreshUserSubScription(isBilled: Boolean) {
    this.subscriptionService.retrieveUserSubscriptions((sub:UserSubscriptionList) => {
      this.userList = sub;
      this.subListChanged = false;
    } ,isBilled);
  }

  refreshSubList() {
    this.refreshUserSubScription(false);

    this.subscriptionService.retrieveSubscriptions(this.subList);
  }

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

  updateSub(){
    if(!this.userList)return;
    this.subscriptionService.updateUserSubscriptions(this.userList);
    this.subListChanged = false;
  }

  routeToUserManagement(){
    this.router.navigate(['user']);
  }
}
