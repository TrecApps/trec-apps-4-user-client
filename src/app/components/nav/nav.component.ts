import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@tc/tc-ngx-general';

@Component({
    selector: 'app-nav',
    imports: [],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.css',
    standalone: true
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
    this.authService.logout("/logon");
  }

}
