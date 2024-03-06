import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'tc-ngx-general';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

  authService: AuthService;
  constructor(authService: AuthService, private router: Router) {
    this.authService = authService;
   }

  ngOnInit(): void {
  }

  doNavigate(target: string){
    this.router.navigateByUrl(target);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl("/logon");
  }

}
