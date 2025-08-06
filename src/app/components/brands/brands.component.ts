import { Component, ViewChild } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { AuthService, ElementContainerDirective, ElementItemDirective, ImageGalleryV2Component, ImageSelectionPurpose, PopupComponent, ResponseObj, TcBrand } from '@tc/tc-ngx-general';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../Environment/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandsService } from '../../services/brands.service';

@Component({
    selector: 'app-brands',
    imports: [NavComponent, CommonModule, FormsModule,
        ElementContainerDirective, ElementItemDirective,
    ImageGalleryV2Component, PopupComponent],
    templateUrl: './brands.component.html',
    styleUrl: './brands.component.css',
    standalone: true
})
export class BrandsComponent {

    aus: AuthService;

    routeSubscription: Subscription;

    dedicatedBrand: TcBrand | undefined;

    baseUrlImage: string = environment.image_service_url_2;

    showGallery: boolean = false;
    imagePurpose: ImageSelectionPurpose = ImageSelectionPurpose.PROFILE;

    @ViewChild("imgGalleryBrand")
    imgGallery!: ImageGalleryV2Component;

    imageError(event: Event){
        const target = event.target as HTMLImageElement;
        target.src = '/assets/Unknown_Profile.png'
    }

    editingBrandId: string | undefined;
    editingBrandName: string = "";

    constructor(as: AuthService, router: Router, private brandService: BrandsService) {
        this.aus = as;

        this.routeSubscription = router.events.subscribe((event) => {
            if(!(event instanceof NavigationEnd)) return;

            let navEvent = event as NavigationEnd;

            let dedicatedBrandId = as.tcUser?.dedicatedBrandAccount;

            if(navEvent.url.startsWith("/brands") && dedicatedBrandId) {
                for(let brand of as.ownedAccounts) {
                    if(brand.id == dedicatedBrandId){
                        this.dedicatedBrand = brand;
                        break;
                    }
                }
            }
        })
    }


    prepareBrandProfile(brand: TcBrand | undefined) {
        if(!brand) return;

        this.aus.tcBrand = brand;

        this.showGallery = true;

    }


    updatingName: boolean = false;
    saveName(brand: TcBrand){

        if(this.updatingName || !brand.id) return;
        this.updatingName = true;

        brand.name = this.editingBrandName;

        this.brandService.updateBrandName(brand.name, brand.id)
        .subscribe({
            next: () => {
                this.updatingName = false;
            }, error: () => {
                this.updatingName = false;

                // ToDo - indicate error to user
            }
        })
    }


    // Resources for creating new Brand
    

    newName: string = "";

    makeDedicated: boolean = false;
    addMask: boolean = false;

    showNewDialog: boolean = false;
    prepNewDialog(ded: boolean) {
        this.makeDedicated = this.dedicatedBrand ? false : ded;

        this.showNewDialog = true;
    }

    updateDedicatedField(event: any){
        this.makeDedicated = event.target.checked;
    }

    makingNewAccount: boolean = false;
    submitNewBrandAccount(){

        if(this.makingNewAccount) return;
        this.makingNewAccount = true;

        this.brandService.postNewBrandAccount(this.newName, false, this.makeDedicated).subscribe({
            next: (value: ResponseObj) => {
                let newAccount = new TcBrand();
                newAccount.id = value.id?.toString();
                newAccount.name = this.newName;
                if(this.makeDedicated && !this.dedicatedBrand){
                    this.dedicatedBrand = newAccount;
                }
                this.makingNewAccount = false;
            }, error: () => {
                this.makingNewAccount = false;
            }
        }
            
        )
    }

    

}
