import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalConstants } from '../../common/GlobalConstants';
import { UserPost, PasswordProfile } from '../../models/User';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private userService:UserService, private router: Router, private datePipe: DatePipe) { 

    this.birthday = undefined
    this.user = new UserPost();
    this.user.passwordProfile = new PasswordProfile();
    this.user.passwordProfile.password = "";
    this.usernameFree = true;
    this.updateFail = this.needsFields = false;
    this.firstPassword = "";
    this.secondPassword = "";
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
    console.log("entered")
    var termBox = document.getElementById("termBox")
    if(termBox) {
      termBox.style.display ="inline-block"
    }
  }

  checkFormsCompletion() {
    console.log("completion check----------")
    console.log(this.user.userPrincipalName)
    console.log(this.user.displayName)
    console.log(this.firstPassword)
    console.log(this.secondPassword )
    console.log(this.user.mobilePhone)
    console.log(this.birthday)
    console.log(this.user.mail)
    if(this.user.userPrincipalName != undefined && this.user.displayName != undefined && this.firstPassword != "" && this.secondPassword != "" && this.user.mobilePhone != undefined && this.birthday != undefined && this.user.mail != undefined ) {
      console.log("inside")
      let termBox = document.getElementById("termBox")
      if(termBox) {
        termBox.style.transition = "height 0.75s ease-in"
        termBox.style.height = "40%"
        let newsLetterEl = document.getElementById("newsLetterId")
        if(newsLetterEl) {
          if(!this.displayingSubscribe ) {
            this.unfade(newsLetterEl)
            this.displayingSubscribe = true 
          }
        }
      }
    }

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
    if(this.firstPassword != this.secondPassword){
      return;
    }


    if(!this.usernameFree){
      return;
    }
    
    this.user.passwordProfile = new PasswordProfile();
    this.user.passwordProfile.password = this.firstPassword;

    this.user.birthday = this.datePipe.transform(this.birthday, "yyyy-MM-ddThh:mm:ss") + '+01:00';

    this.user.mailNickname = this.user.userPrincipalName;

    this.user.mobilePhone = this.user.mobilePhone;

    if(!this.user.validate()) {
      this.needsFields = true;
    } else {
      this.needsFields = false;

    
      

      this.userService.createUser(this.user);
      //this.moveToLogin();
    }
  }

  moveToLogin() {
    this.router.navigate(['/logon']);
  }
}
