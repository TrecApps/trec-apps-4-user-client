import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Address, AuthService } from 'tc-ngx-general';
import { AddressService } from '../../services/address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent {

  showSearchBar: boolean;
  searchAddressText: string = "";

  addressResults: Address[] = [];

  constructor(private addressService: AddressService ,authService: AuthService, router:Router) {

    this.showSearchBar = false;

    // router.events.subscribe((event) => {
    //   if(event instanceof NavigationEnd) {
    //     let endEvent : NavigationEnd = event;

    //     if(endEvent.url == "/address") {

    //     }
    //   }
    // });

  } 


  attemptSearch(){
    this.addressService.searchAddress(this.searchAddressText).subscribe({
      next: (list: Address[]) => {
        this.addressResults = list;
      }
    })
  }

}
