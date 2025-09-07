import { Component, HostListener } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {BackendService, 
  AuthService, 
  DisplayService} from '@tc/tc-ngx-general';

import { environment } from './Environment/environment';
import { GlobalConstants } from './common/GlobalConstants';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'user-client';

  screenHeight: number;
  screenWidth: number;
  displayService: DisplayService;
  
  constructor(displayService: DisplayService, private backEndService: BackendService, private authService: AuthService){
    this.backEndService.appendUrl("UserService", environment.user_service_url);
    this.backEndService.appendUrl("ImageService", environment.image_service_url_2);
    this.backEndService.setUserService(true);
    this.backEndService.setAppName(environment.app_name);
    this.authService.setLoginSuccessRoute("user");
    this.authService.requireAuth = true;
    this.authService.attemptRefresh(undefined);
    // this.authService.requireAuthentication();


    this.screenHeight = 0;
    this.screenWidth = 0;
    this.displayService = displayService;
    this.getScreenSize();

  }

  ngOnInit(): void {
    document.body.style.backgroundColor = GlobalConstants.lightBlue;
    console.log("Initializing Component!");

  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(_event?: any) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    this.displayService.setMobile(this.screenWidth < 768);
    this.displayService.setScreenHeight(this.screenHeight);
  }
}
