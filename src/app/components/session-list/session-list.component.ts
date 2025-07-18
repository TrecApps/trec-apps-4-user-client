import { Component } from '@angular/core';
import { SessionListV2, SessionV2 } from '../../models/Sessions';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { DisplayService, AuthService, StylesService, SortedList } from '@tc/tc-ngx-general';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-list',
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.css'
})
export class SessionListComponent {
  sessionList: SessionListV2 | undefined;

  currentSession: string | undefined;

  ss: StylesService;

  selectedList: SortedList<string> = new SortedList<string>((s1: string, s2: string) => s1.localeCompare(s2));

  constructor(private userService: UserService, private router: Router, private authService: AuthService, ss: StylesService) { 
    this.ss = ss;
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
    },
      (currentSession: string) => {
        this.currentSession = currentSession;
      });
  }

  deleteSession(sessionId: string) {
    this.userService.removeSession(sessionId, () => {

      this.selectedList.items = this.selectedList.items.filter((value: string) => value != sessionId);

      if(this.currentSession == sessionId){
        this.authService.clearAuth();
        this.router.navigateByUrl("logon");
      } else {
        this.refreshSessions()
      }
    
    });
  }

  deleteSessions() {
    this.userService.removeSessions(this.selectedList.items, () => {

      let list = this.selectedList.items;
      this.selectedList.clear();

      if(this.currentSession && list.includes(this.currentSession)){
        this.authService.clearAuth();
        this.router.navigateByUrl("logon");
      } else {
        this.refreshSessions()
      }
    
    });
  }

  getAppList(session: SessionV2) : string {
    let ret = "";

    for(let app of session.apps){
      if(ret.length) ret += ", ";
      ret += app.app;
    }

    return ret.trim();
  }

  onSessionChecked(event: Event, sessionId: string){
    const checkbox = event.target as HTMLInputElement;
    let isChecked = checkbox.checked;

    if(isChecked) {
      if(!this.selectedList.contains(sessionId))
        this.selectedList.add(sessionId);
    } else {
      this.selectedList.items = this.selectedList.items.filter((value: string) => value != sessionId);
    }
  }
}
