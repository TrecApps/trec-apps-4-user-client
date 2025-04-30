import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginResult } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BackendService, DisplayService } from '@tc/tc-ngx-general';
import { GlobalConstants } from '../../common/GlobalConstants';

import { Login, LoginToken } from '@tc/tc-ngx-general/lib/models/Login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  color1 ="white"
  color2 = "black"
  color3 = "gray"
  color4 = "yellow"
  color5 = "red"
  loginGradient = ""

  login: Login;
  loginFail: boolean;

  

  backendService: BackendService;
  displayService: DisplayService;
  authService: AuthService;

  constructor(
    authService: AuthService,
    backendService: BackendService,
    displayService: DisplayService,
    private router: Router) {
      this.displayService = displayService;
      this.login = new Login();
      this.loginFail = false;
      this.backendService = backendService;
      this.authService = authService;
   }

   naveToCreateUser(){
    this.router.navigateByUrl("/create")
   }

   ngOnInit(): void {
    
    this.color1 = GlobalConstants.lightBlue
    this.color2 = GlobalConstants.salmon
    this.color3 = GlobalConstants.siteBackground
    this.color4 = GlobalConstants.crownYellow
    this.color5 = GlobalConstants.red
    this.loginGradient = 'linear-gradient(45deg,' + this.color4 + ' 50%, ' + this.color1 + ' 80%)'

    // this.authService.attemptRefresh(undefined);
  }

  showSpinner: boolean = false;

  logon() {

    if(this.showSpinner) return;

    this.showSpinner = true;
    this.color3 = GlobalConstants.siteBackgroundDark;

    this.authService.loginThroughTrecApps(this.login, (result: LoginResult) => {

      this.showSpinner = false;
      this.color3 = GlobalConstants.siteBackground;

      this.loginFail = false;

      switch(result){
        case LoginResult.SUCCESS_MFA:
          this.useMfaPage = true;
          break;
        case LoginResult.SUCCESS:
          
          break;
        default:
          this.loginFail = true;
      }
    });
  }
  // MFA Variables
  useMfaPage: boolean = false;
  mfaSelection: string = "";

  mfaName: string | undefined;
  mfaCode: string = "";


  prepMfaValidation(mfaS:string, mfaN: string | undefined) {
    this.authService.prepareMfaValidation(mfaS, (s: string, n: string | undefined) => {
      this.mfaSelection = s;
      this.mfaName = n;
    }, mfaN);
  }

  sendMfaCode() {
    if(this.showSpinner) return;
    this.showSpinner = true;
    this.authService.sendMfaCode(this.mfaCode, this.mfaSelection, this.mfaName, (result: LoginResult)=> {
      this.showSpinner = false;
      switch(result){
        case LoginResult.SUCCESS:

        break;
        case LoginResult.CLIENT_FAILURE:

        break;
        case LoginResult.SERVER_FAILURE:
      }
    })
  }
}
