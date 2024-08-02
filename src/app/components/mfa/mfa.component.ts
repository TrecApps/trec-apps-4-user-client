import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MfaService } from '../../services/mfa.service';
import { NavigationEnd, Router } from '@angular/router';
import { MfaMechanism, MfaReq, TcUser } from 'tc-ngx-general';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MfaRegistrationData } from '../../models/Mfa';
import { ResponseObj } from 'tc-ngx-general/lib/models/ResponseObj';

interface MfaReqExt {
  data: MfaReq;
  saved: boolean;
}

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [NavComponent, CommonModule],
  templateUrl: './mfa.component.html',
  styleUrl: './mfa.component.css'
})
export class MfaComponent {



  mfaMethods: string[] = [
    "Email","Phone","Token"
  ];

  mfaRequirements: MfaReqExt[] = [];

  user: TcUser;

  mfaMechanisms: MfaMechanism[] = [];

  registrationData: MfaRegistrationData | undefined;


  hasMechanism(mechList: MfaMechanism[], type: string) : boolean {
    for(let mech of mechList){
      if(mech.source == type)return true;
    }
    return false;
  }

  getAppReq(appName: string) : MfaReq | undefined {
    for(let mfaReq of this.user.mfaRequirements){
      if(mfaReq.app == appName) return mfaReq;
    }

    return undefined;
  }

  constructor(private mfaService: MfaService, private router: Router, private userService: UserService){
    this.user = new TcUser();

    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        let endEvent : NavigationEnd = event;

        if(endEvent.url == "/mfa"){
          this.user = this.userService.currentUser;

          this.mfaMechanisms = [];
          for(let method of this.mfaMethods){
            if(!this.hasMechanism(this.user.mfaMechanisms, method)) {
              this.mfaMechanisms.push({source: method})
            }
          }
        }
      }
    })

  }

  prepareMfaRequirements(){
    this.mfaService.getAppList().subscribe({
      next: (list: string[]) => {
        this.mfaRequirements = [];
        for(let l of list) {
          this.mfaRequirements.push({
            saved: false,
            data: {
              app: l,
              requireMfa: false
            }
          })
        }

      }
    })
  }

  tidyMfaReqs(){
    for(let mfaReqExt of this.mfaRequirements){
      let res = this.getAppReq(mfaReqExt.data.app)
      if(res){
        mfaReqExt.data = res;
        mfaReqExt.saved = true;
      }

      if(mfaReqExt.data.app == "Trec-Apps-User-Service"){
        mfaReqExt.data.requireMfa = true; 
      }
    }
  }

  saveRequirement(mfaReq: MfaReqExt) {
    if(mfaReq.data.app == "Trec-Apps-User-Service" && !mfaReq.data.requireMfa)
    {
        alert("This app must require MFA when enabled!")
    }

    this.mfaService.setAppMfaReq(mfaReq.data).subscribe({
      next: (response: ResponseObj) => {
        mfaReq.saved = true;
      }
    })
  }



  enableEmailMfa() {
    this.mfaService.enableContactForMfa(this.user, true, (worked: boolean) => {
      if(worked){
        this.user.mfaMechanisms.push({source: "Email"});
        this.mfaMechanisms = this.mfaMechanisms.filter(v => v.source != "Email");
      } else {
        alert("Faied to Enable Email MFA");
      }
    })
  }
  enablePhoneMfa() {
    this.mfaService.enableContactForMfa(this.user, false, (worked: boolean) => {
      if(worked){
        this.user.mfaMechanisms.push({source: "Phone"});
        this.mfaMechanisms = this.mfaMechanisms.filter(v => v.source != "Phone");
      } else {
        alert("Faied to Enable Phone MFA");
      }
    })
  }
  requestToken() {
    this.mfaService.registerToken().subscribe({
      next: (registrationData: MfaRegistrationData) => {
        this.registrationData = registrationData;
      }, 
      error: () => {
        alert("Could not register Token");
      }
    })
  }

  doneWithCode(){
    this.registrationData = undefined;
  }

  setRequire(_t65: MfaReqExt,arg1: boolean) {
    _t65.data.requireMfa = arg1;
    _t65.saved = false;
  }



}
