import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  seconds = 0;
  interval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCounter();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  startCounter() {
    this.interval = setInterval(() => {
      this.seconds++;

      if (this.seconds >= 180) {
        this.logOut();
      }
    }, 1000);
  }

  @HostListener('document:click')
  onClick() {
    this.seconds = 0;
  }

  logOut(): void {
    const data = {
      PrescriptionNo: null,
      SeqNo: null,
      check: 2,
      userPrint: null,
    };

    if ((window as any).Android?.receiveJson) {
      const json = JSON.stringify(data);
      (window as any).Android.receiveJson(json);
    } else {
      console.warn('Android interface not found');
    }

    sessionStorage.removeItem('userInfo');
    clearInterval(this.interval);
    this.router.navigate(['/']);
  }
}
