import { Routes } from '@angular/router';
import { LoginComponent } from 'tc-ngx-general';
import { BrandsComponent } from './components/brands/brands.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { ManageUserComponent } from './components/manage-user/manage-user.component';
import { SessionComponent } from './components/session/session.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';

export const routes: Routes = [
    {path: 'logon', component: LoginComponent},
    {path: 'create', component: CreateUserComponent},
    {path: 'user', component: ManageUserComponent},
    {path: 'brands', component: BrandsComponent},
    {path: 'subscriptions', component: SubscriptionComponent},
    {path: 'sessions', component: SessionComponent},
    {path: '', redirectTo: 'logon', pathMatch: 'full'}
];
