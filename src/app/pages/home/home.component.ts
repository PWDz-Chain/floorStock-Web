import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  assets: any = null;
  currentTime: string = '';
  currentDate: string = '';
  apiOnline: boolean = false;
  private timer: any = null;
  private healthTimer: any = null;

  constructor(private appService: AppService, private router: Router, private http: HttpClient) {
    this.assets = this.appService.assets;
    sessionStorage.removeItem('userInfo');
  }

  ngOnInit(): void {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
    // เช็ค API ครั้งแรกทันที แล้วเช็คซ้ำทุก 60 วินาที
    this.checkApiStatus();
    this.healthTimer = setInterval(() => this.checkApiStatus(), 60000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.healthTimer) clearInterval(this.healthTimer);
  }

  checkApiStatus(): void {
    this.http.get(`${environment.baseUrl}/health`, { observe: 'response' })
      .subscribe({
        next: () => { this.apiOnline = true; },
        error: () => { this.apiOnline = false; },
      });
  }

  updateClock(): void {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear() + 543;
    this.currentDate = `วัน${dayName}ที่ ${date} ${month} ${year}`;
  }

  navigate(path: string): void {
    this.appService.playSound('click');
    sessionStorage.setItem('path', path);
    this.router.navigate(['/Login']);
  }
}
