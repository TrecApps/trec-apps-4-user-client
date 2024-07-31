import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'tc-ngx-general';
import { TcUser, MfaReq } from 'tc-ngx-general';
import { environment } from '../Environment/environment';
import { Observable } from 'rxjs';
import { MfaRegistrationData } from '../models/Mfa';
import { ResponseObj } from 'tc-ngx-general/lib/models/ResponseObj';

@Injectable({
  providedIn: 'root'
})
export class MfaService {

  constructor(private authService: AuthService, private client: HttpClient) { }


  enableContactForMfa(user: TcUser, useEmail: boolean, callable: Function){
    if(useEmail && !user.emailVerified){
      callable(false);
      return;
    }
    if(!useEmail && !user.phoneVerified){
      callable(false);
      return;
    }

    this.client.get(`${environment.user_service_url}/mfa/${ useEmail ? 'EnableEmail' : 'EnablePhone' }`, {
      headers: this.authService.getHttpHeaders(false, false)
    }).subscribe({
      next: () => callable(true),
      error: () => callable(false)
    })
  }

  registerToken(): Observable<MfaRegistrationData> {
    
    return this.client.get<MfaRegistrationData>(`${environment.user_service_url}/mfa/register`, {
      headers: this.authService.getHttpHeaders(false, false)
    })

  }


  getAppList(): Observable<string[]> {
    return this.client.get<string[]>(`${environment.user_service_url}/mfa/appList`, {
      headers: this.authService.getHttpHeaders(false, false)
    })
  }

  setAppMfaReq(req: MfaReq) :Observable<ResponseObj> {

    return this.client.post<ResponseObj>(`${environment.user_service_url}/mfa/app`, req, {
      headers: this.authService.getHttpHeaders(true, true)
    })

  }

}
