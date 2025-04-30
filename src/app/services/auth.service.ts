import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, TcBrand, TcUser, UserInfo } from '@tc/tc-ngx-general';
import { Login, LoginToken } from '@tc/tc-ngx-general/lib/models/Login';

export enum LoginResult{
  CLIENT_FAILURE,     // Login failed due to invalid credientials
  SERVER_FAILURE,     // Login failed due to server or connection issues
  SUCCESS,            // Login was successful, no further login required
  SUCCESS_MFA         // Login was successful, but additional verification required
}


export enum HttpContentType{
  NONE,
  PLAIN_TEXT = "text/plain",
  JSON = "application/json",
  FORM = "multipart/form_data"
}

export type LoginResultHandler = (res: LoginResult)=> void;

export type BoolResultHandler = (res: boolean)=> void;

export type TwoStringHandler = (s1: string, s2: string | undefined) => void;



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loginToken: LoginToken | undefined;

  loginRoute: string;
  
  loginSuccessRoute: string = "";

  tcUser: TcUser | undefined;
  tcBrand: TcBrand | undefined;

  onFullyLoggedOn: Function | undefined;
  requireAuth: boolean = false;

  constructor(private httpClient: HttpClient, private router: Router, private backendService: BackendService) { 
    this.loginRoute = "logon";
  }

  setLogOnAction(action: Function | undefined){
    this.onFullyLoggedOn = action;
  }

  isCurrentUser(id: string | null) : boolean {
    if(!id){ return true; }
    let ret = `User-${this.tcUser?.id}` == id || `Brand-${this.tcBrand?.id}` == id;
    return ret;
  }

  getCurrentUserId(): string | undefined{
    if(this.tcBrand?.id){
      return `Brand-${this.tcBrand.id}`;
    }
    if(this.tcUser?.id){
      return `User-${this.tcUser.id}`;
    }
    return undefined;
  }

  getCurrentDisplayName() : string | undefined {
    return this.tcBrand?.name || this.tcUser?.displayName;
  }

  getProfileImageByProfile(profile: string, appName: string | undefined = undefined): string {
    let baseUrl = this.backendService.getUrlOrThrow("ImageService",
       "Could not read URL of Image-Service Backend. Declare an 'ImageService' as a dependency of a singular component or service and set the 'UserService' parameter to an appropriate URL!")
    
    
    if(profile.startsWith('Brand-')){
      baseUrl += `/Profile/byBrand/${profile.substring(6)}`; // `?app=${environment.app_name}`
    } else {
      baseUrl += `/Profile/of/${profile.substring(5)}`;
    }
    if(appName){
      baseUrl += `?app=${appName}`;
    }
    return baseUrl;
  }

  getProfileImageByProfileV2(profile: string, appName: string | undefined = undefined): string {
    let baseUrl = this.backendService.getUrlOrThrow("ImageServiceV2",
       "Could not read URL of Image-Service Backend. Declare an 'ImageService' as a dependency of a singular component or service and set the 'UserService' parameter to an appropriate URL!")

    baseUrl += `/Images/profile/${profile}`;
    if(appName){
      baseUrl += `?app=${appName}`;
    }
    return baseUrl;
  }

  getProfileImageV2(appName: string | undefined = undefined): string {

    let baseUrl = this.backendService.getUrlOrThrow("ImageServiceV2",
      "Could not read URL of Image-Service Backend. Declare an 'ImageService' as a dependency of a singular component or service and set the 'UserService' parameter to an appropriate URL!")
    

    if(this.tcBrand?.id){
      baseUrl += `/Images/profile/Brand-${this.tcBrand.id}`;//?app=${environment.app_name}`;
    } else if(this.tcUser?.id){
      baseUrl += `/Images/profile/User-${this.tcUser.id}`;
    } else {
      return "assets/icons/non-profile.png";
    }
    if(appName){
      baseUrl += `?app=${appName}`;
    }
    return baseUrl;

  }

  getProfileImage(appName: string | undefined = undefined): string {

    let baseUrl = this.backendService.getUrlOrThrow("ImageService",
      "Could not read URL of Image-Service Backend. Declare an 'ImageService' as a dependency of a singular component or service and set the 'UserService' parameter to an appropriate URL!")
    

    if(this.tcBrand?.id){
      baseUrl += `/Profile/byBrand/${this.tcBrand.id}`;//?app=${environment.app_name}`;
    } else if(this.tcUser?.id){
      baseUrl += `/Profile/of/${this.tcUser.id}`;
    } else {
      return "assets/icons/non-profile.png";
    }
    if(appName){
      baseUrl += `?app=${appName}`;
    }
    return baseUrl;

  }

  setLoginSuccessRoute(route: string){
    this.loginSuccessRoute = route;
  }

  setRoute(loginRoute: string){
    this.loginRoute = loginRoute;
  }

  getUrl(endpoint: string): string{

    let baseUrl = this.backendService.getUrlOrThrow("UserService", 
    "Could not read URL of User-Service Backend. Declare a 'BackendService' as a dependency of a singular component or service and set the 'UserService' parameter to an appropriate URL!");

    if(baseUrl.endsWith('/')){
      return `${baseUrl}${endpoint}`;
    }

    return `${baseUrl}/${endpoint}`;
  }

  hasActiveTokens(): boolean {
    return this.loginToken != null;
  }

  hasPermission(perm: string): boolean {
    return this.tcUser != undefined && this.tcUser.authRoles.includes(perm);
  }

  attemptRefresh(func: LoginResultHandler | undefined): void {
    // If we have a cookie, then we'll send it to the refresh Endpoint
    let params = new HttpParams().append("app", this.backendService.appName);

    this.httpClient.get<LoginToken>(this.getUrl(`refresh_token`), {
      withCredentials: true,
      params
    }).subscribe(
    {
      next: (tok: LoginToken) => {
        this.loginToken = tok;

        this.getUserInfo(func);

        
      },
      error:  (e) => {

        if(e instanceof Response && func){
          let r = e as Response;
          if(r.status >= 500){
            func(LoginResult.SERVER_FAILURE);
          } else {
            func(LoginResult.CLIENT_FAILURE);
          }
        }
        console.log("Failed to Refresh", e);
        if(this.requireAuth) this.router.navigateByUrl(this.loginRoute);
      }
    })
  }


  loginThroughTrecApps(login: Login, callable: LoginResultHandler) {

    let observe = {
      next: (response: LoginToken) => {
        this.loginToken = response;
          
        this.getUserInfo(callable);
      },
      error: (e: Response | any) => { 
        if(e instanceof Response && callable){
          let r = e as Response;
          if(r.status >= 500){
            callable(LoginResult.SERVER_FAILURE);
          } else {
            callable(LoginResult.CLIENT_FAILURE);
          }
        }
        
      }
    };

    let params: HttpParams = new HttpParams().append("app", this.backendService.getAppName());

    this.httpClient.post<LoginToken>(this.getUrl(`Auth/login`), login, {params}).subscribe(observe);
  }

  getUserInfo(callable: LoginResultHandler | undefined){

    let observe = {
      next: (ui: UserInfo)=> {
        this.tcUser = ui.user;
        this.tcBrand = ui.brand;
        if(this.loginToken?.token_type?.includes("requires_mfa")){
          if(callable) callable(LoginResult.SUCCESS_MFA);
        }
        else{
          if(this.onFullyLoggedOn)
            this.onFullyLoggedOn();
          if(callable){
            callable(LoginResult.SUCCESS);
          }
        }
          
      },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.clearAuth();
          this.router.navigate([this.loginRoute]);
        }

        else if(error instanceof Response && callable){
          let r = error as Response;
          callable(r.status >= 500 ? LoginResult.SERVER_FAILURE : LoginResult.CLIENT_FAILURE);
        }
      }
    }


    this.httpClient.get<UserInfo>(this.getUrl(`Auth/User`),{headers: this.getHttpHeaders2(HttpContentType.NONE)}).subscribe(observe);
  }

  getHttpHeaders2(contentType: HttpContentType){
    let ret:HttpHeaders = new HttpHeaders();
    let authString = this.getAuthorization().trim();
    if(authString.length){
      ret = ret.append("Authorization", authString);
    }
    if(contentType != HttpContentType.NONE){
      ret = ret.append("Content-Type", contentType);
    }
    return ret;
  }


  setAuthorization(loginToken: LoginToken) {
    this.loginToken = loginToken;
  }

  getAuthorization() : string {
    return this.loginToken && this.loginToken.access_token ? this.loginToken.access_token : "";
  }

  logout(navByUrl:string | undefined) {
    this.httpClient.get(this.getUrl(`Auth/logout`), {headers:this.getHttpHeaders2(HttpContentType.NONE)}).subscribe({
      next: () => {
        if(navByUrl){
          this.router.navigateByUrl(navByUrl);
        }
        this.clearAuth();
      }
    });
    
  }

  clearAuth() {
    this.loginToken = undefined;
  }

  sendMfaCode(mfaCode: string, mfaSelection: string, mfaName: string, callable: LoginResultHandler){
    this.httpClient.post(this.getUrl(`mfa`), {
      code: mfaCode, type: mfaSelection, name: mfaName
    }, {
      headers: this.getHttpHeaders2(HttpContentType.JSON),
      responseType: "text"
    }).subscribe({
      next: (value: string) => {
        if(!this.loginToken) return;
        this.loginToken.access_token = value;
        this.loginToken.token_type = "user-mfa";
        if(this.onFullyLoggedOn)
          this.onFullyLoggedOn();
        this.getUserInfo(callable);
      }, 
      error: (e: Response) => {
        callable(e.status >= 500 ? LoginResult.SERVER_FAILURE : LoginResult.CLIENT_FAILURE);
      }
    })
  }

  sendMfaCodeMid(code: string, name:string, callable: LoginResultHandler){
    this.httpClient.post(this.getUrl(`mfa`), {
      code: code, type: "Token", name
    }, {
      headers: this.getHttpHeaders2(HttpContentType.JSON),
      responseType: "text"
    }).subscribe({
      next: (value: string) => {
        if(!this.loginToken) return;
        this.loginToken.access_token = value;
        this.loginToken.token_type = "user-mfa";
        this.getUserInfo(callable);
      }, 
      error: (e: Response) => {
        callable(e.status >= 500 ? LoginResult.SERVER_FAILURE : LoginResult.CLIENT_FAILURE);
      }
    })
  }
}
