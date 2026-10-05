import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WebsocketService, NewMedicineAlert } from 'src/app/websocket.service';
import { Subscription } from 'rxjs';

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
  wsOnline: boolean = false;

  latestMedicine: NewMedicineAlert | null = null;
  medicineBannerVisible: boolean = false;

  private timer: any = null;
  private healthTimer: any = null;
  private wsSub: Subscription | null = null;
  private wsConnSub: Subscription | null = null;

  constructor(
    private appService: AppService,
    private router: Router,
    private http: HttpClient,
    private wsService: WebsocketService
  ) {
    this.assets = this.appService.assets;
    sessionStorage.removeItem('userInfo');
  }

  ngOnInit(): void {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);

    // เช็ค API ครั้งแรกทันที แล้วเช็คซ้ำทุก 60 วินาที
    this.checkApiStatus();
    this.healthTimer = setInterval(() => this.checkApiStatus(), 60000);

    // ตรวจสอบและเชื่อมต่อ WebSocket ทันที
    this.wsService.connect();
    this.wsOnline = this.wsService.isConnected;
    this.wsConnSub = this.wsService.isConnected$.subscribe((connected) => {
      this.wsOnline = connected;
    });

    this.wsSub = this.wsService.onNewMedicine$.subscribe((medicine) => {
      this.latestMedicine = medicine;
      this.medicineBannerVisible = true;
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.healthTimer) clearInterval(this.healthTimer);
    if (this.wsSub) this.wsSub.unsubscribe();
    if (this.wsConnSub) this.wsConnSub.unsubscribe();
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

  dismissBanner(): void {
    this.medicineBannerVisible = false;
  }

  goToDispen(): void {
    this.dismissBanner();
    this.navigate('Dispen');
  }

  /**
   * ปุ่มจำลองส่งข้อมูลยาใหม่สำหรับทดสอบ WebSocket
   */
  triggerTestMedicine(): void {
    this.appService.playSound('click');
    const randomRx = 'RX-' + Math.floor(100000 + Math.random() * 900000);
    this.http.get(`${environment.baseUrl}/triggerNewMedicine?prescriptionNo=${randomRx}&name=นายทดสอบ+ระบบยา&ward=Ward+ICU&bed=12&drug=Ceftriaxone+1g+Inj.`)
      .subscribe({
        next: () => {
          console.log('[Test] Trigger sent successfully');
        },
        error: (err) => {
          console.error('[Test] Failed to trigger test medicine:', err);
        }
      });
  }

  navigate(path: string): void {
    this.appService.playSound('click');
    sessionStorage.setItem('path', path);
    this.router.navigate(['/Login']);
  }
}
