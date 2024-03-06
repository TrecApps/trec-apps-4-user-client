import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'tc-ngx-general';
import { environment } from '../Environment/environment';
import { UserSubscriptionList } from '../models/Subscription';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private httpClient: HttpClient, private authService: AuthService, private router: Router) { }

  retrieveSubscriptions(list: Subscription[]){
    this.httpClient.get<Subscription[]>(`${environment.user_subscription_url}Subscriptions/List`, {headers: this.authService.getHttpHeaders(true, false)}).
    subscribe((sub:Subscription[]) => {
      for(let s of sub){
        list.push(s);
      }
    });
  }

  retrieveUserSubscriptions(callable:Function, isBilled: Boolean = false) {
    let observe = {
      next: (sub:UserSubscriptionList) => {
        callable(sub);
      }, 
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    }

    this.httpClient.get<UserSubscriptionList>(`${environment.user_subscription_url}Subscriptions/${isBilled ? 'Billed': 'Current'}`,
      {headers: this.authService.getHttpHeaders(true, false)}).pipe(take(1)).subscribe(observe);
  }

  updateUserSubscriptions(data: UserSubscriptionList) {
    let observe = {
      next: (str: string) => {
        alert(str);
      },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error ?.status == 403) {
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    }

    this.httpClient.post<string>(`${environment.user_subscription_url}Subscriptions/Insert`, data,
      {headers: this.authService.getHttpHeaders(true, true)}).pipe(take(1)).subscribe(observe);
  }
}
