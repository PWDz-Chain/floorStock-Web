import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './bar/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { MaterialModules } from './materialModule';
import { DispenComponent } from './pages/dispen/dispen.component';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from './app.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ButtombarComponent } from './bar/buttombar/buttombar.component';
import { RefillComponent } from './pages/refill/refill.component';
import { ScanQrComponent } from './pages/refill/scan-qr/scan-qr.component';
import { LoginComponent } from './pages/login/login.component';
import { InvsComponent } from './pages/invs/invs.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { HitstoryComponent } from './pages/refill/hitstory/hitstory.component';
import { UserComponent } from './pages/user/user.component';
import { HitDispenseComponent } from './pages/hit-dispense/hit-dispense.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    DispenComponent,
    ButtombarComponent,
    RefillComponent,
    ScanQrComponent,
    LoginComponent,
    InvsComponent,
    HitstoryComponent,
    UserComponent,
    HitDispenseComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModules,
    HttpClientModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule
  ],
  providers: [
    AppService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

