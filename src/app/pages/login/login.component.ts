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
        this.isLoading = false;
        sessionStorage.setItem('userInfo', JSON.stringify(response));
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');

        if (userInfo && userInfo.UserId) {
          this.service.playSound('success');
          this.router.navigate([`/${this.path}`]);
        } else {
          this.service.alert('error', 'ไม่พบข้อมูลผู้ใช้', 'กรุณาลองใหม่อีกครั้ง').then(() => {
            this.resetAndFocusInput();
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.isLoading = false;
        if (error.status === 404) {
          this.service.alert(
            'error',
            'ไม่พบข้อมูลผู้ใช้',
            'กรุณาลองใหม่อีกครั้ง'
          ).then(() => {
            this.resetAndFocusInput();
          });
        } else {
          this.service.alert(
            'error',
            'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
            'กรุณาลองใหม่อีกครั้ง'
          ).then(() => {
            this.resetAndFocusInput();
          });
        }
      },
    });
  }
}
