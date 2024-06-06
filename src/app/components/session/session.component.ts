import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SessionList, SessionListV2 } from '../../models/Sessions';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from 'tc-ngx-general';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css'
})
export class SessionComponent {

  sessionList: SessionListV2 | undefined;

  currentSession: string | undefined;

  constructor(private userService: UserService, private router: Router, private authService: AuthService) { 
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        let endEvent : NavigationEnd = event;

        if(endEvent.url == "/sessions"){
          this.refreshSessions();
        }
      }
      
    })
  }

  ngOnInit(): void {
  }

  refreshSessions() {
    this.userService.getSessions((sessionList : SessionListV2) => {
      this.sessionList = sessionList;
      console.log("Got Session!");
    },
      (currentSession: string) => {
        this.currentSession = currentSession;
        console.log("Current Session is ", this.currentSession);
      });
  }

  deleteSession(sessionId: string) {
    this.userService.removeSession(sessionId, () => {
      if(this.currentSession == sessionId){
        this.authService.clearAuth();
        this.router.navigateByUrl("logon");
      } else {
        this.refreshSessions()
      }
    
    });
  }
}
