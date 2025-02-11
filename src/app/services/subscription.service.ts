import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, take } from 'rxjs';
import { AuthService } from '@tc/tc-ngx-general';
import { environment } from '../Environment/environment';
import { UserSubscription, UserSubscriptionList } from '../models/Subscription';
import { SubscriptionPost, TcSubscription } from '../models/Payments';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';

export class SubscriptionsSearchObject {
  category: string | undefined;
  page: number | undefined;
  size: number | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private httpClient: HttpClient, private authService: AuthService, private router: Router) { }

  getActiveSubscriptions(searchObj: SubscriptionsSearchObject): Observable<UserSubscription[]> {
    let params = new HttpParams();
    if(searchObj.category) params = params.append("category", searchObj.category);
    if(searchObj.page)params = params.append("page", searchObj.page);
    if(searchObj.size)params = params.append("size", searchObj.size);

    return this.httpClient.get<UserSubscription[]>(`${environment.user_subscription_url}/Subscriptions/Active`, {
      headers: this.authService.getHttpHeaders(false, false),
      params
    })
  }

  getAvailableSubscriptions(searchObj: SubscriptionsSearchObject): Observable<TcSubscription[]>{
    let params = new HttpParams();
    if(searchObj.category) params = params.append("category", searchObj.category);
    if(searchObj.page)params = params.append("page", searchObj.page);
    if(searchObj.size)params = params.append("size", searchObj.size);

    return this.httpClient.get<TcSubscription[]>(`${environment.user_subscription_url}/Subscriptions/Available`, {
      headers: this.authService.getHttpHeaders(false, false),
      params
    })
  }

  addSubscription(postSub: SubscriptionPost): Observable<ResponseObj> {
    return this.httpClient.post<ResponseObj>(`${environment.user_subscription_url}/Subscriptions`, postSub, {
      headers: this.authService.getHttpHeaders(true, true)
    })
  }

  updateSubscription(postSub: SubscriptionPost): Observable<ResponseObj> {
    return this.httpClient.put<ResponseObj>(`${environment.user_subscription_url}/Subscriptions`, postSub, {
      headers: this.authService.getHttpHeaders(true, true)
    })
  }


  stopSubscription(id: string): Observable<ResponseObj> {
    return this.httpClient.delete<ResponseObj>(`${environment.user_subscription_url}/Subscriptions`, {
      headers: this.authService.getHttpHeaders(false, false),
      params: new HttpParams().append("id", id)
  });
  }
}
