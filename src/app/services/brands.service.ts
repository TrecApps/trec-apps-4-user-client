import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, HttpContentType, ResponseObj } from '@tc/tc-ngx-general';
import { Observable } from 'rxjs';
import { environment } from '../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {

  constructor(private authService: AuthService, private client: HttpClient) { }

  postNewBrandAccount(name: string, useMask: boolean = false, makeDedicated: boolean = false): Observable<ResponseObj> {
    return this.client.post<ResponseObj>(`${environment.user_service_url}Brands/New`, {
      name, useMask, makeDedicated
    }, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    })
  }

  updateBrandName(name: string, brandId: string): Observable<ResponseObj> {
    return this.client.patch<ResponseObj>(`${environment.user_service_url}Brands/New`, {
      name,
      username: name,
      brandId,
      password: brandId
    }, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    })
  }
}
