import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Address, AddressList, AuthService, StylesService } from '@tc/tc-ngx-general';
import { AddressService } from '../../services/address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';
import { NavComponent } from '../nav/nav.component';

@Component({
    selector: 'app-address',
    imports: [CommonModule, FormsModule, NavComponent],
    templateUrl: './address.component.html',
    styleUrl: './address.component.css',
    standalone: true
})
export class AddressComponent {

  showSearchBar: boolean;
  searchAddressText: string = "";

  addressResults: Address[] = [];

  addressList: AddressList | undefined;

  ss: StylesService;

  constructor(private addressService: AddressService, ss: StylesService, authService: AuthService, router:Router) {

    this.ss = ss;

    this.showSearchBar = false;

    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        let endEvent : NavigationEnd = event;

        if(endEvent.url == "/address") {
          if(authService.tcUser){
            this.addressList = authService.tcUser.addressList

            if (!this.addressList)
            {
              this.addressList = new AddressList();
            }

            // let tempAddress = new Address();
            // tempAddress.address1 = "2223 Tyrrhenian Dr.";
            // tempAddress.country = "US";
            // tempAddress.postCode = "80504";
            // tempAddress.region = "CO";
            // tempAddress.township = "Longmont";

            // this.addressList.addressList.push(tempAddress);
            // this.addressList.billingAddress = 0;
          }
        }
      }
    });

  } 


  attemptSearch(){
    this.addressService.searchAddress(this.searchAddressText).subscribe({
      next: (list: Address[]) => {
        this.addressResults = list;
      }
    })
  }

  postAddress(address: Address){
    this.addressService.postAddress(address).subscribe({
      next: (ro: ResponseObj) => {
        this.addressList?.addressList.push(address);
        this.showSearchBar = false;
        this.addressResults = [];
      },
      error: (ro: ResponseObj) => alert(ro.message)
    })
  }

  updateAddress(i: number, isMailing: boolean) {
    this.addressService.setStatus(i, isMailing).subscribe({
      next: (ro: ResponseObj) => {
        if(!this.addressList) return; 
        if(isMailing)
          this.addressList.mailingAddress = i;
        else
          this.addressList.billingAddress = i;
      },
      error: (ro: ResponseObj) => alert(ro.message)
    })
  }

  removeAddress(i: number) {
    this.addressService.removeAddress(i).subscribe({
      next: (ro: ResponseObj) => {
        if(!this.addressList) return; 
        this.addressList.addressList.splice(i, 1);
      },
      error: (ro: ResponseObj) => alert(ro.message)
    })
  }

}
