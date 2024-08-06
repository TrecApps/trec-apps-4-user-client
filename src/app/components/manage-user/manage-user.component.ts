import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, ImageGalleryComponent, ImageInsert, ImageService } from 'tc-ngx-general';
import { BooleanRef } from '../../models/Holders';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { PasswordChange } from '../../models/Login';


class BirthdayDetails {
  setting: string;
  details: string;

  constructor(settings:string, details:string) {
    this.details = details;
    this.setting = settings;
  }
}

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, ImageGalleryComponent],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent {
  userService: UserService;

  
  changePassword: boolean = false;

  oldPassword: string = "";
  newPassword1: string = "";
  newPassword2: string = "";

  birthdayDetails: BirthdayDetails[] = [];

  currentBirthdayDetail: string;

  @ViewChild("imgGallery")
  imgGallery: ImageGalleryComponent | undefined;


  onShowGallery(show: boolean) {
    if(!this.imgGallery) return;
    if(show) {
      this.imgGallery.showGallery();
    }
  }

  setProfilePic(ii: ImageInsert){
    this.imageService.setProfile(ii.id, false, "Main").subscribe({
      next: () => {
        if(this.imgGallery) 
          this.imgGallery.hideGallery();
      }
    });
  }
  
  constructor(userService: UserService,
    private router: Router,
    private authService: AuthService,
    private imageService: ImageService) { 

   this.userService = userService;

   this.birthdayDetails = [];
   this.currentBirthdayDetail = "";

   this.birthdayDetails.push(new BirthdayDetails("Public", "Your Birthday is readable by anyone!"));
   this.birthdayDetails.push(new BirthdayDetails("Broadcast", "Your Birthday will be public and services with 'friends' will broadcast it to your 'friends'!"));
   this.birthdayDetails.push(new BirthdayDetails("Private Broadcast", "Your Birthday will be broadcast to 'friends' but hidden from anywhere else"));
   this.birthdayDetails.push(new BirthdayDetails("Friends", "Only your friends can see your birthday, but it will not be broadcast!"));
   this.birthdayDetails.push(new BirthdayDetails("Private", "Your birthday will be kept private! You can grant access to specific services!"));


   router.events.subscribe((event) => {
     if(event instanceof NavigationEnd){
       let endEvent : NavigationEnd = event;
       

       if(endEvent.url == "/user"){
         
         if(this.authService.hasActiveTokens()){
            this.refreshUser();
         } else {
           this.authService.attemptRefresh(() => this.refreshUser());
         }
       }
     }
     
   })
 }

 
 routeToSubscriptions()
 {
   this.router.navigate(['subscriptions']);
 }

 routeToBrands(){
   this.router.navigate(['brands']);
 }

 setChangePassword(b: boolean) {
   this.changePassword = b;
   this.oldPassword = "";
   this.newPassword1 = "";
   this.newPassword2 = "";
 }

 attemptEmailVerification() {
   this.userService.requestEmailVerification();
 }

 attemptPhoneVerification() {
   this.userService.requestPhoneVerification();
 }

 ngOnInit(): void {
 }

 refreshUser() {
   this.userService.refreshUser(() => {
     let currentBirthdaySetting = this.userService.currentUser.birthdaySetting;

     for(let birthdayDetail of this.birthdayDetails) {
       if(birthdayDetail.setting == currentBirthdaySetting){
         this.currentBirthdayDetail = birthdayDetail.setting;
         break;
       }
     }
   }).subscribe({
     next: (list: string[]) => {
       if (list.includes("TREC_VERIFIED")){
         this.userService.verificationStatus = 1;
       }
     }
   });
 }



 requestVerification() {
   this.userService.requestProfileVerification();
 }


 updateUser(){
   this.userService.currentUser.birthdaySetting = this.currentBirthdayDetail;

   this.userService.updateUser();
 }

 updatePassword() {
   if(this.newPassword1 != this.newPassword2) {
     alert("New Password Fields Must match!");
     return;
   }
   if(this.newPassword1.length < 12) {
     alert("Paswords must be a minumum of 12 characters");
     return;
   }

   let changePasswordObj = new PasswordChange();
   changePasswordObj.currentPassword = this.oldPassword;
   changePasswordObj.newPassword = this.newPassword1;
   this.userService.changePassword(changePasswordObj);
   this.setChangePassword(false);
 }
}
