import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take, Observable } from 'rxjs';
import { AuthService, HttpContentType } from '@tc/tc-ngx-general';
import { LoginToken, PasswordChange } from '@tc/tc-ngx-general/lib/models/Login';
import { filterUser } from '../models/User';
import { environment } from '../Environment/environment';
import { SessionListV2 } from '../models/Sessions';
import { UserPost } from '../models/User';
import { BooleanRef } from '../models/Holders';
import { TcUser } from '@tc/tc-ngx-general';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser: TcUser;
  profileFallback = "/assets/Unknown_Profile.png";
  profilePic: String;


  verificationStatus: number = -2;


  constructor(private httpClient: HttpClient, private authService: AuthService, private router: Router) {
    this.currentUser = new TcUser();
    this.profilePic = this.profileFallback;
   }

   emailAvailable = true;

   requestEmailVerification() {

    if(!this.emailAvailable) return;

    this.emailAvailable = false;

    setTimeout(() => {
      this.emailAvailable = true;
    }, 60000);

    let error = (error: Response | any) => { 
      alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
    }

    let observe = {
      next: (response: Object) => { 
        let code = prompt(`Check your Email ${this.currentUser.email} for a Code from TrecApps and enter it here (within ten minutes):`);

        this.httpClient.post(`${environment.user_service_url}Email`, code,
         {headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe({
          error,
          next: () => {
            this.currentUser.emailVerified = true;
          }
         })
      },
      error
    }


    this.httpClient.get(`${environment.user_service_url}Email`,
     {headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe(observe);
   }

   requestPhoneVerification() {

    let error = (error: Response | any) => { 
      alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
    }

    let observe = {
      next: (response: Object) => { 
        let code = prompt(`Check your Phone ${this.currentUser?.mobilePhone?.number} for a Code from TrecApps and enter it here (within ten minutes):`);

        this.httpClient.post(`${environment.user_service_url}Sms`, code,
         {headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe({
          error,
          next: () => {
            this.currentUser.phoneVerified = true;
          }
         })
      },
      error
    }


    this.httpClient.get(`${environment.user_service_url}Sms`,
     {headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe(observe);
   }

   private updateProfilePic()
   {
    if(this.currentUser.profilePics && "main" in this.currentUser.profilePics){
      this.profilePic = `${environment.image_service_url_2}Images/profile/User-${this.currentUser?.id}`;
    } else {
      this.profilePic = this.profileFallback;
    }

   }

   requestProfileVerification() {
    let observe = {
      next: (response: string) => {
        this.verificationStatus = 0;
      },
      error: (error: Response | any) => {
        if(error.status && error.status == 409) {
          this.verificationStatus = 0;
          alert("You already have a Verification Request in Place");
        }
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    }


    this.httpClient.get<string>(`${environment.user_admin_url}Verify/requestVerification`,{headers: this.authService.getHttpHeaders2(HttpContentType.NONE)})
      .pipe(take(1)).subscribe(observe);
   }

   checkAuthClear(error: Response | any) {
    if(error.status && (error.status == 401 || error.status == 403)) {
      this.authService.clearAuth();
      this.currentUser = new TcUser();
      this.profilePic = this.profileFallback;
    }
   }

   copyUser(newUser: TcUser): TcUser {
    let retUser = new TcUser();
    retUser.address = newUser.address;
    retUser.addressList = newUser.addressList;
    retUser.authRoles = newUser.authRoles;
    retUser.birthday = newUser.birthday;
    retUser.birthdaySetting = newUser.birthdaySetting;
    retUser.credibilityRating = newUser.credibilityRating;
    retUser.customerId = newUser.customerId;
    retUser.displayName = newUser.displayName;
    retUser.email = newUser.email;
    retUser.emailVerified = newUser.emailVerified;
    retUser.id = newUser.id;
    retUser.mfaMechanisms = newUser.mfaMechanisms;
    retUser.mfaRequirements = newUser.mfaRequirements;
    retUser.mobilePhone = newUser.mobilePhone;
    retUser.pastEmails = newUser.pastEmails;
    retUser.phoneVerified = newUser.phoneVerified;
    retUser.profilePics = newUser.profilePics;
    retUser.proposedEmail = newUser.proposedEmail;
    
    retUser.proposedNumber = newUser.proposedNumber;
    retUser.restrictions = newUser.restrictions;
    retUser.subscriptionId = newUser.subscriptionId;
    retUser.userProfile = newUser.userProfile;
    retUser.verifiedEmail = newUser.verifiedEmail;
    retUser.verifiedNumber = newUser.verifiedNumber;

    return retUser;
   }

  refreshUser(callable: Function): Observable<string[]> {
    let observe = {
      next: (response: TcUser) => { 
        console.info("Birthday Value: ", response.birthday);
        this.currentUser = this.copyUser(response);
        console.info("Current User Set!", this.currentUser);
        this.updateProfilePic();
        
        callable();
        
        if( response.profilePics && "Main" in response.profilePics){
          this.profilePic = `${environment.image_service_url}Profile/of/${response.id}`;
        } else {
          console.log("Pics are ", response.profilePics);
        }
      },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    };

    this.httpClient.get<TcUser>(`${environment.user_service_url}Users/Current`,{headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe(observe);
    
    return this.httpClient.get<string[]>(`${environment.user_service_url}Auth/permissions`,{headers: this.authService.getHttpHeaders2(HttpContentType.NONE)});
    
    //this.refreshAdminVerificationStatus();
  }

  async refreshAdminVerificationStatus()
  {
    let observeError = (error: Response | any) => { 
      alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
      if(error?.status == 401 || error?.status == 403){
        this.authService.clearAuth();
        this.router.navigate(['logon']);
      }
    };
    let observe2 = {
      next: (response: Boolean) => {
        this.verificationStatus = response ? -1 : 0;
      },
      error: observeError
    }

    let observe1 = {
      next: (response: Boolean) => {
        if(response){
          this.verificationStatus = 1;
        } else {
          this.httpClient.get<Boolean>(`${environment.user_admin_url}Verify/hasVerification`,{headers: this.authService.getHttpHeaders2(HttpContentType.NONE)})
          .pipe(take(1)).subscribe(observe2);
        }
      }
    }

    this.httpClient.get<Boolean>(`${environment.user_admin_url}Verify/isVerified`,{headers: this.authService.getHttpHeaders2(HttpContentType.NONE)})
    .pipe(take(1)).subscribe(observe1);
  }

  async createUser(userPost: UserPost, ender: Function) {
    let observe = {
      next: (response: LoginToken) => {

        this.authService.setAuthorization(response);
        this.router.navigate(['/user']);
       },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }, finally: ()=> {
        ender();
      }
    };

    this.httpClient.post<LoginToken>(`${environment.user_service_url}Users/createUser`, userPost).pipe(take(1)).subscribe(observe);
  }



  async uploadVerificationPic(data:string, ext:string)
  {
    let header = this.authService.getHttpHeaders2(HttpContentType.NONE).append("Content-Type", `image/${ext}`);
    let observe = {
      next: () =>{
        alert("Successfully Uploaded!");
      },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    }

    this.httpClient.post(`${environment.user_admin_url}Verify/AddEvidence`, data,{headers: header}).pipe(take(1)).subscribe(observe);
  }

  async changePassword(passwordChange: PasswordChange) {
    let observe = {
      next: (response: Object) => { },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    };

    this.httpClient.post(`${environment.user_service_url}Users/passwordUpdate`, passwordChange,
        {headers: this.authService.getHttpHeaders2(HttpContentType.JSON)}).pipe(take(1)).subscribe(observe);
  }

  async updateUser() {
    let observe = {
      next: (response: Object) => { },
      error: (error: Response | any) => { 
        alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    };

    let fUser = filterUser(this.currentUser);
    fUser.birthday = undefined;

    this.httpClient.put(`${environment.user_service_url}Users/UserUpdate`, fUser,
      {headers: this.authService.getHttpHeaders2(HttpContentType.JSON)}).pipe(take(1)).subscribe(observe);
  }

  async getSessions(sessionListFunction: Function, currentSessionFunction : Function) {
    let observe1 = {
      next: (response: SessionListV2) => { 
        console.log("SessionList is ", response.sessions.length);
        sessionListFunction(response);
        let observe2 = {
          next: (response: Object) => { 
            currentSessionFunction(response.toString());
          },
          error: (error: Response | any) => { 
            console.error("Error Getting Current Session!", error);

            if(error.error?.text) {
              currentSessionFunction(error.error.text.toString());
            }
            else if(error?.status == 401 || error?.status == 403){
              this.authService.clearAuth();
              this.router.navigate(['logon']);
            }
            else {
              alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
            }
            
          }
        };
        let headers = this.authService.getHttpHeaders2(HttpContentType.NONE);
        headers = headers.append("Accept","text/plain;charset=UTF-8");
        this.httpClient.get(`${environment.user_service_url}Sessions/Current`,
          {headers, responseType: 'text' }).pipe(take(1)).subscribe(observe2);


      },
      error: (error: Response | any) => { 
        
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        } else {
          alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        }
      }
    };



    this.httpClient.get<SessionListV2>(`${environment.user_service_url}Sessions/List`,
      {headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe(observe1);
    
  }

  async removeSession(sessionId: string, doNext: Function) {
    let observe = {
      next: (response: Object) => { 
        doNext();
      },
      error: (error: Response | any) => { 
        if(error.status && error.status == 200) {
          doNext();
        } else {
          alert((error instanceof Response) ? error.text : (error.message ? error.message : error.toString()));
        }
        if(error?.status == 401 || error?.status == 403){
          this.authService.clearAuth();
          this.router.navigate(['logon']);
        }
      }
    };

    this.httpClient.delete(`${environment.user_service_url}Sessions/${sessionId}`,
      {headers: this.authService.getHttpHeaders2(HttpContentType.NONE)}).pipe(take(1)).subscribe(observe);
  }
}
