import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Address, AddressList, AuthService } from 'tc-ngx-general';
import { AddressService } from '../../services/address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResponseObj } from 'tc-ngx-general/lib/models/ResponseObj';

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

  addressList: AddressList | undefined;

  constructor(private addressService: AddressService ,authService: AuthService, router:Router) {

    let tempAddress = new Address();
    tempAddress.address1 = "1700 W 76th St.";
    tempAddress.address2 = "Apt 1B";
    tempAddress.country = "US";
    tempAddress.postCode = "55423";
    tempAddress.region = "MN";
    tempAddress.township = "Richfield";

    this.addressResults.push(tempAddress);

    this.showSearchBar = false;

    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        let endEvent : NavigationEnd = event;

        if(endEvent.url == "/address") {
          if(authService.tcUser){
            this.addressList = authService.tcUser.addressList

            let tempAddress = new Address();
            tempAddress.address1 = "2223 Tyrrhenian Dr.";
            tempAddress.country = "US";
            tempAddress.postCode = "80504";
            tempAddress.region = "CO";
            tempAddress.township = "Longmont";

            this.addressList.addressList.push(tempAddress);
            this.addressList.billingAddress = 0;
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
