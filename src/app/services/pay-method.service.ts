import { Injectable } from '@angular/core';
import { CardInfoSubmission, UsBankInfo } from '../models/Payments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService, HttpContentType } from '@tc/tc-ngx-general';
import { Observable } from 'rxjs';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';
import { environment } from '../Environment/environment';

export type PaymentMethod = UsBankInfo | CardInfoSubmission; 

@Injectable({
  providedIn: 'root'
})
export class PayMethodService {

  constructor(private authService: AuthService, private client: HttpClient) { }

  postUsBank(body: UsBankInfo) : Observable<ResponseObj> {
    return this.client.post<ResponseObj>(`${environment.user_subscription_url}/paymentMethods/us-bank`, body, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    });
  }

  postCard(body: CardInfoSubmission) : Observable<ResponseObj> {
    return this.client.post<ResponseObj>(`${environment.user_subscription_url}/paymentMethods/card`, body, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    });
  }

  getPaymentMethods() : Observable<PaymentMethod[]> {
    return this.client.get<PaymentMethod[]>(`${environment.user_subscription_url}/paymentMethods`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE)
    })
  }

  removePaymentMethod(id: string) : Observable<ResponseObj> {
    return this.client.delete<ResponseObj>(`${environment.user_subscription_url}/paymentMethods`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("payId", id)
  });
  }

  setDefault(id: string) : Observable<ResponseObj> {
    return this.client.put<ResponseObj>(`${environment.user_subscription_url}/paymentMethods/default`, null, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("payId", id)
  });
  }
}
