import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, HttpContentType } from '@tc/tc-ngx-general';
import { TcUser, MfaReq } from '@tc/tc-ngx-general';
import { environment } from '../Environment/environment';
import { Observable } from 'rxjs';
import { MfaRegistrationData } from '../models/Mfa';
import { ResponseObj } from '@tc/tc-ngx-general';

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
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE)
    }).subscribe({
      next: () => callable(true),
      error: () => callable(false)
    })
  }

  registerToken(name: string): Observable<MfaRegistrationData> {
    
    return this.client.get<MfaRegistrationData>(`${environment.user_service_url}/mfa/register`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("name", name)
    })

  }

  sendMfaCode(mfaCode: string, mfaName:string, onSuccess: Function){
    this.authService.sendMfaCodeMid(mfaCode, mfaName,()=> {
      alert("Successfully Validated Code!");
      onSuccess();
    })
  }

  removeToken(name:string) : Observable<ResponseObj>{
    
    return this.client.delete<ResponseObj>(`${environment.user_service_url}/mfa/Token`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("name", name)
    });
  }


  getAppList(): Observable<string[]> {
    return this.client.get<string[]>(`${environment.user_service_url}/mfa/appList`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE)
    })
  }

  setAppMfaReq(req: MfaReq) :Observable<ResponseObj> {

    return this.client.post<ResponseObj>(`${environment.user_service_url}/mfa/app`, req, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    })

  }

}
