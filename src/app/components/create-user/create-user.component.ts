import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalConstants } from '../../common/GlobalConstants';
import { UserPost, PasswordProfile } from '../../models/User';
import { UserService } from '../../services/user.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DisplayService } from 'tc-ngx-general';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatProgressSpinnerModule],
  providers: [DatePipe],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {

  usernameFree: boolean;
  updateFail:boolean;
  needsFields: boolean;
  user: UserPost;

  firstPassword:string;
  secondPassword: string;

  birthday: any;

  countryCode: number = 1;

  color1 ="white"
  color2 = "black"
  color3 = "gray"
  color4 = "yellow"
  color5 = "red"
  loginGradient = 'linear-gradient(45deg, white 50%, gray 80%)'
  gardiantTwo = 'linear-gradient(45deg, white 50%, gray 80%, black 20%)'
  showTerms = "none"
  displayingSubscribe: boolean = false
  displayService: DisplayService;

  showSpinner: boolean = false;

  createForm: FormGroup;

  constructor(private userService:UserService, private router: Router, private datePipe: DatePipe, private fb: FormBuilder, ds: DisplayService) {
    this.displayService = ds; 

    this.birthday = undefined
    this.user = new UserPost();
    this.user.passwordProfile = new PasswordProfile();
    this.user.passwordProfile.password = "";
    this.usernameFree = true;
    this.updateFail = this.needsFields = false;
    this.firstPassword = "";
    this.secondPassword = "";


    this.createForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      displayName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      birthday: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    })
  }

  ngOnInit(): void {
    this.color1 = GlobalConstants.lightBlue
    this.color2 = GlobalConstants.salmon
    this.color3 = GlobalConstants.siteBackground
    this.color4 = GlobalConstants.crownYellow
    this.color5 = GlobalConstants.red
    this.gardiantTwo = 'linear-gradient(45deg,'  + this.color5 + ' 30%, ' + this.color4 + ' 30%, ' + this.color1 + ' 99%)'
    this.loginGradient = 'linear-gradient(45deg,' + this.color4 + ' 50%, ' + this.color1 + ' 80%)'
  }

  enterInput() {
    var termBox = document.getElementById("termBox")
    if(termBox) {
      termBox.style.display ="inline-block"
    }
  }

  checkFormsCompletion() {
    return;
    // if(this.user.userPrincipalName != undefined && this.user.displayName != undefined && this.firstPassword != "" && this.secondPassword != "" && this.user.mobilePhone != undefined && this.birthday != undefined && this.user.mail != undefined ) {
    //   let termBox = document.getElementById("termBox")
    //   if(termBox) {
    //     termBox.style.transition = "height 0.75s ease-in"
    //     termBox.style.height = "40%"
    //     let newsLetterEl = document.getElementById("newsLetterId")
    //     if(newsLetterEl) {
    //       if(!this.displayingSubscribe ) {
    //         this.unfade(newsLetterEl)
    //         this.displayingSubscribe = true 
    //       }
    //     }
    //   }
    // }

  }

  hasErrors(): boolean {
    if(this.firstPassword != this.secondPassword) return true;
    for(let key in this.createForm.controls) {
      let control = this.createForm.controls[key] as AbstractControl<any, any>;
      if(control.untouched || control.errors){ 
        return true;
      }
    }
    return false;
  }
  
   unfade(element:any) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.075;
    }, 25);
}

  create() {
    if(this.hasErrors()) return;
    
    this.user.passwordProfile = new PasswordProfile();
    this.user.passwordProfile.password = this.firstPassword;

    this.user.birthday = this.datePipe.transform(this.birthday, "yyyy-MM-ddThh:mm:ss") + '+01:00';

    this.user.mailNickname = this.user.userPrincipalName;

    let validated = this.user.validate();

    if(validated.length){
      this.needsFields = true;
      alert(validated)
    } else {
      this.needsFields = false;
      this.showSpinner = true;

      this.userService.createUser(this.user, ()=> {this.showSpinner = false;});
    }
  }

  moveToLogin() {
    this.router.navigate(['/logon']);
  }
}
