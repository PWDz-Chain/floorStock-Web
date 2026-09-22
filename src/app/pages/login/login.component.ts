import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  assets: any = null;
  path: any = null;
  jobType: string = '';
  @ViewChild('cardInput') cardInput!: ElementRef;
  isLoading: boolean = false;
  private keepFocusInterval: any = null;

  constructor(private service: AppService, private router: Router) {
    this.assets = this.service.assets;
    this.path = sessionStorage.getItem('path') || null;
    if (this.path == 'Dispen') {
      this.jobType = 'รับยา';
    }
    else if (this.path == 'History/Dispense') {
      this.jobType = 'ประวัติรับยา';
    }
    else if (this.path == 'Refill') {
      this.jobType = 'คลังยา';
    }
  }

  ngAfterViewInit(): void {
    this.resetAndFocusInput();

    // Keep focus alive continuously on Kiosk
    this.keepFocusInterval = setInterval(() => {
      this.keepFocus();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.keepFocusInterval) {
      clearInterval(this.keepFocusInterval);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.closest('button') || target.closest('a'))) {
      return;
    }
    this.keepFocus();
  }

  keepFocus(): void {
    if (!this.isLoading && this.cardInput?.nativeElement && document.activeElement !== this.cardInput.nativeElement) {
      this.cardInput.nativeElement.focus({ preventScroll: true });
    }
  }

  resetAndFocusInput(): void {
    setTimeout(() => {
      if (this.cardInput?.nativeElement) {
        this.cardInput.nativeElement.value = '';
        this.cardInput.nativeElement.focus();
        this.cardInput.nativeElement.select();
      }
    }, 150);
  }

  scanUser(inputData: string): void {
    const rawData = (inputData || '').trim();
    if (!rawData) {
      this.resetAndFocusInput();
      return;
    }

    this.service.playSound('scan');

    // ล้างค่าใน input ทันทีเพื่อเตรียมรับการสแกนครั้งต่อไป
    if (this.cardInput?.nativeElement) {
      this.cardInput.nativeElement.value = '';
    }

    this.isLoading = true;

    this.service.post('login', { UserId: rawData }).subscribe({
      next: (response) => {
        if (response && response.UserId) {
          this.isLoading = false;
          sessionStorage.setItem('userInfo', JSON.stringify(response));
          this.service.playSound('success');
          this.router.navigate([`/${this.path}`]);
        } else {
          // ไม่พบข้อมูล User ถ้าเป็นหน้า Dispen ให้ลองเช็คว่าเป็น QR_Order หรือไม่
          this.checkIfOrder(rawData);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        if (this.path === 'Dispen') {
          // ถ้า login error หรือ 404 ให้ลองค้นหาจาก QR_Order
          this.checkIfOrder(rawData);
        } else {
          this.isLoading = false;
          if (error.status === 404) {
            this.service.alert('error', 'ไม่พบข้อมูลผู้ใช้', 'กรุณาลองใหม่อีกครั้ง').then(() => {
              this.resetAndFocusInput();
            });
          } else {
            this.service.alert('error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'กรุณาลองใหม่อีกครั้ง').then(() => {
              this.resetAndFocusInput();
            });
          }
        }
      },
    });
  }

  private checkIfOrder(rawData: string): void {
    if (this.path === 'Dispen') {
      this.service.post('fetchOrderByQR', { qrCode: rawData }).subscribe({
        next: (order) => {
          this.isLoading = false;
          if (order && order.PrescriptionNo) {
            // พบใบสั่งยาจาก QR_Order หรือ PrescriptionNo
            const kioskUser = {
              UserId: 'KIOSK',
              Fullname: 'ระบบตู้ยา (Kiosk)',
              wardcode: order.WardCd || '04',
              warddesc: order.WardName || 'หอผู้ป่วย',
              isKiosk: true,
            };
            sessionStorage.setItem('userInfo', JSON.stringify(kioskUser));
            sessionStorage.setItem('autoOpenOrder', JSON.stringify(order));

            this.service.playSound('success');
            this.router.navigate(['/Dispen']);
          } else {
            this.showNotFoundAlert();
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.isLoading = false;
          this.showNotFoundAlert();
        },
      });
    } else {
      this.isLoading = false;
      this.service.alert('error', 'ไม่พบข้อมูลผู้ใช้', 'กรุณาลองใหม่อีกครั้ง').then(() => {
        this.resetAndFocusInput();
      });
    }
  }

  private showNotFoundAlert(): void {
    this.service
      .alert(
        'error',
        'ไม่พบข้อมูลผู้ใช้ หรือ ใบสั่งยา',
        'กรุณาตรวจสอบรหัสบัตร หรือ QR Code ใบสั่งยาอีกครั้ง'
      )
      .then(() => {
        this.resetAndFocusInput();
      });
  }
}
