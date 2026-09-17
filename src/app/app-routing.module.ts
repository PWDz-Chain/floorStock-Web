import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './bar/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { DispenComponent } from './pages/dispen/dispen.component';
import { RefillComponent } from './pages/refill/refill.component';
import { ScanQrComponent } from './pages/refill/scan-qr/scan-qr.component';
import { LoginComponent } from './pages/login/login.component';
import { InvsComponent } from './pages/invs/invs.component';
import { HitstoryComponent } from './pages/refill/hitstory/hitstory.component';
import { UserComponent } from './pages/user/user.component';
import { HitDispenseComponent } from './pages/hit-dispense/hit-dispense.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Login', component: LoginComponent },
  { path: 'Dispen', component: DispenComponent },
  { path: 'Refill', component: RefillComponent },
  { path: 'Refill/ScanQr', component: ScanQrComponent },
  { path: 'Invs', component: InvsComponent },
  { path: 'Refill/Hitstory', component: HitstoryComponent },
  { path: 'User', component: UserComponent },
  { path: 'History/Dispense', component: HitDispenseComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
