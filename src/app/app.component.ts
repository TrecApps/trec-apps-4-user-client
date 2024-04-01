import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {BackendService, AuthService} from 'tc-ngx-general';

import { environment } from './Environment/environment';
import { GlobalConstants } from './common/GlobalConstants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'user-client';

  
  constructor(private backEndService: BackendService, private authService: AuthService){
    this.backEndService.appendUrl("UserService", environment.user_service_url);
    this.backEndService.appendUrl("ImageService", environment.image_service_url);
    this.backEndService.setUserService(true);
    this.authService.setLoginSuccessRoute("user");
    this.authService.attemptRefresh(undefined);

  }

  ngOnInit(): void {
    document.body.style.backgroundColor = GlobalConstants.lightBlue;
    console.log("Initializing Component!");

  }
}
