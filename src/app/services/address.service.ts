import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Address, AuthService, HttpContentType } from '@tc/tc-ngx-general';
import { environment } from '../Environment/environment';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private authService: AuthService, private client: HttpClient) { }

  searchAddress(query: string): Observable<Address[]> {
    let q = query.trim();
    if(q.length < 10) return of([]);

    


    return this.client.get<Address[]>(`${environment.user_subscription_url}/Address/search`,{
      params: new HttpParams().append("query", q),
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE)
    });
  }

  postAddress(address: Address): Observable<ResponseObj> {
    return this.client.post<ResponseObj>(`${environment.user_subscription_url}/Address`, address, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    });
  }

  setStatus(index: number, isMailing: boolean): Observable<ResponseObj> {
    return this.client.put<ResponseObj>(`${environment.user_subscription_url}/Address/${isMailing ? 'Mailing': 'Billing'}`, null, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("index", index)
  });
  }

  removeAddress(index: number): Observable<ResponseObj> {
    return this.client.delete<ResponseObj>(`${environment.user_subscription_url}/Address`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("index", index)
  });
  }

  unhookAddress(isMailing: boolean): Observable<ResponseObj> {
    return this.client.delete<ResponseObj>(`${environment.user_subscription_url}/Address`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("index", isMailing ? 'Mailing': 'Billing')
  });
  }
}
