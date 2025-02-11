import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MfaService } from '../../services/mfa.service';
import { NavigationEnd, Router } from '@angular/router';
import { MfaMechanism, MfaReq, TcUser } from '@tc/tc-ngx-general';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MfaRegistrationData } from '../../models/Mfa';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';
import { FormsModule } from '@angular/forms';

interface MfaReqExt {
  data: MfaReq;
  saved: boolean;
}

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [NavComponent, CommonModule, FormsModule],
  templateUrl: './mfa.component.html',
  styleUrl: './mfa.component.css'
})
export class MfaComponent {



  mfaMethods: string[] = [
    "Email","Phone"
  ];

  mfaRequirements: MfaReqExt[] = [];

  user: TcUser;

  mfaMechanisms: MfaMechanism[] = [];

  registrationData: MfaRegistrationData | undefined;

  mfaCode: string = "";


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
              this.mfaMechanisms.push({source: method, name: undefined})
            }
          }

          this.prepareMfaRequirements();
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
        this.tidyMfaReqs();
      }
    })
  }

  tidyMfaReqs(){
    for(let mfaReqExt of this.mfaRequirements){
      let res = this.getAppReq(mfaReqExt.data.app)
      if(res){
        mfaReqExt.data = res;
      }
      
      mfaReqExt.saved = true;

      if(mfaReqExt.data.app == "Trec-Apps-User-Service"){
        mfaReqExt.data.requireMfa = true; 
      }
    }
  }

  testCode(){
    this.mfaService.sendMfaCode(this.mfaCode, this.prospectiveName || "",()=> {
      if(this.prospectiveName){
        console.log("Prospective Name:", this.prospectiveName);
        this.user.mfaMechanisms.push({source: "Token", name: this.prospectiveName});
      }
    })
  }

  removeTokenCode(name: string){
    this.mfaService.removeToken(name).subscribe({
      next: (ro: ResponseObj) => {
        this.user.mfaMechanisms = this.user.mfaMechanisms.filter(m => m.source != "Token" && m.name != name);
      }
    })
  }

  removeOtherMech(source: string, name: string | undefined) {
    if(source == "Token" && name){
      this.removeTokenCode(name);
    } else {
      alert("Not implemented for " + source);
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

  hasName(name: string): boolean {
    // If it is an empty string, the backend will assign a name automatically
    if(name.trim().length == 0) return false;
    for(let mech of this.user.mfaMechanisms){
      if(name == mech.name) return true;
    }
    return false;
  }



  enableEmailMfa() {
    this.mfaService.enableContactForMfa(this.user, true, (worked: boolean) => {
      if(worked){
        this.user.mfaMechanisms.push({source: "Email", name: undefined});
        this.mfaMechanisms = this.mfaMechanisms.filter(v => v.source != "Email");
      } else {
        alert("Faied to Enable Email MFA");
      }
    })
  }
  enablePhoneMfa() {
    this.mfaService.enableContactForMfa(this.user, false, (worked: boolean) => {
      if(worked){
        this.user.mfaMechanisms.push({source: "Phone", name: undefined});
        this.mfaMechanisms = this.mfaMechanisms.filter(v => v.source != "Phone");
      } else {
        alert("Faied to Enable Phone MFA");
      }
    })
  }

  prospectiveName: string | undefined;

  requestToken(autoDo: boolean = true) {

    let name: string = prompt("Token Name (make sure you're not already using it)", "") || "";

    if(this.hasName(name)){
      alert(`You are already using '${name}'`);
      return;
    }

    console.log(`Preparing name ${name}`);
      

    this.mfaService.registerToken(name).subscribe({
      next: (registrationData: MfaRegistrationData) => {
        this.registrationData = registrationData;
        this.prospectiveName = name;
        console.log(`Prospective Name set to ${this.prospectiveName}`);
      }, 
      error: () => {
        alert("Could not register Token");
      }
    })
  }

  doneWithCode(){
    this.registrationData = undefined;
  }

  setRequire(_t65: MfaReqExt,arg1: boolean, event: MouseEvent) {

    if(_t65.data.app == "Trec-Apps-User-Service"){
      alert("This app must require MFA");
      if(!arg1)
        (event.target as HTMLInputElement).checked = false;
      return;
    }

    _t65.data.requireMfa = arg1;
    _t65.saved = false;
  }



}
