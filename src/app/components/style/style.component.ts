import { Component, OnDestroy } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService, HttpContentType, ResponseObj, StyleSpec, StylesService } from '@tc/tc-ngx-general';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../Environment/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorOption, ColorPanelComponent } from "../color-panel/color-panel.component";

export interface FullStyleSpec {
  app: string;
  updating: boolean;
  styleSpec: StyleSpec;
  currentSpec: StyleSpec;
}

@Component({
  selector: 'app-style',
  imports: [CommonModule, FormsModule, NavComponent, ColorPanelComponent],
  templateUrl: './style.component.html',
  styleUrl: './style.component.css'
})
export class StyleComponent implements OnDestroy{

  colorList: ColorOption[] = [
    {
      colorStyle: '#d1d1d1',
      styleName: 'default'
    },{
      colorStyle: '#ff0000ff',
      styleName: 'red'
    },{
      colorStyle: 'rgb(0, 171, 255)',
      styleName: 'blue'
    },{
      colorStyle: 'rgb(8, 223, 41)',
      styleName: 'green'
    },{
      colorStyle: 'rgb(255, 239, 1)',
      styleName: 'yellow'
    },{
      colorStyle: 'rgb(255, 120, 1)',
      styleName: 'orange'
    },{
      colorStyle: 'rgb(221, 99, 255)',
      styleName: 'purple'
    },{
      colorStyle: 'rgb(255, 59, 243)',
      styleName: 'pink'
    }
  ]

  apps: string[];

  appStyles: FullStyleSpec[];

  getDefaultSpec(): StyleSpec {
    return {
      style: "default",
      useDark: false
    }
  }

  copySpec(spec: StyleSpec): StyleSpec {
    return {
      style: spec.style,
      useDark: spec.useDark
    };
  }

  areSpecsEqual(spec: FullStyleSpec): boolean {
    return spec.currentSpec.style == spec.styleSpec.style &&
     spec.currentSpec.useDark == spec.styleSpec.useDark;
  }

  refreshStyles(){
    this.appStyles = [];
    for(let app of this.apps){
      let styleSpec = this.getDefaultSpec();
      if(this.authService.tcUser?.extensions?.styles && this.authService.tcUser?.extensions?.styles[app])
      {
        styleSpec = this.authService.tcUser?.extensions?.styles[app];
      }
      this.appStyles.push({
        app,
        updating: false,
        styleSpec: this.copySpec(styleSpec),
        currentSpec: this.copySpec(styleSpec)
      })
    }
  }

  routeSubscription: Subscription;
  
  styleService: StylesService;

  constructor(
    private client: HttpClient,
    private authService: AuthService, 
    styleService: StylesService,
    private router: Router)
  {
    this.apps = [
      "Trec-Apps-User-Service",
      "Trec-Apps-Falsehoods-Service",
      "Trec-Apps-Brands-Service"
    ];

    this.appStyles = [];

    this.refreshStyles();

    this.styleService = styleService;

    this.routeSubscription = this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd){
        let endEvent = event as NavigationEnd;

        if(endEvent.url.startsWith("/styles") || endEvent.url.startsWith("/styles/")){
          this.refreshStyles();
        }
      }
    })
  }
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  isPreviewing: boolean = false;

  preview(spec: StyleSpec) {
    if(this.isPreviewing) return;

    this.isPreviewing = true;

    let curStyle = this.styleService.style;
    if(curStyle.startsWith("dark-"))
      curStyle = curStyle.substring(5);
    let curDark = this.styleService.isDark;

    this.styleService.setStyle(spec.style);
    this.styleService.setDarkMode(spec.useDark);

    setTimeout(() => {
      this.styleService.setStyle(curStyle);
      this.styleService.setDarkMode(curDark);
      this.isPreviewing = false;
    }, 3000);
  }

  updateStyle(fullSpec: FullStyleSpec){

    if(fullSpec.updating) return;
    fullSpec.updating = true;

    this.client.patch<ResponseObj>(`${environment.user_service_url}Users/styles`, fullSpec.styleSpec, {
      params: new HttpParams().append("app", fullSpec.app),
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON)
    }).subscribe({
      next: (val: ResponseObj) => {
        fullSpec.currentSpec = this.copySpec(fullSpec.styleSpec);
        fullSpec.updating = false;
      },
      error: ()=> {
        fullSpec.updating = false;
      }
    })
  }



}
