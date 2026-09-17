import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import * as moment from 'moment';
const _window: any = window;

@Component({
  selector: 'app-scan-qr',
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.css'],
})
export class ScanQrComponent implements OnInit, AfterViewInit, OnDestroy {
  assets: any = null;
  userInfo: any = null;
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  @ViewChild('cardInput') cardInput!: ElementRef;
  inventory: any[] = [];

  refillLog: any = null;

  refillData = {
    qrCode: null as any,
    BinID: null as any,
    DrugCd: null as any,
    DrugNm: null as any,
    In_Qty: null as any,
    LotNo: null as any,
    Exp: null as any,
  };

  intervalId: any = null;
  private keepFocusInterval: any = null;

  constructor(
    private service: AppService,
    private http: HttpClient,
    private location: Location
  ) {
    this.assets = this.service.assets;
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  }

  goBack(): void {
    this.service.playSound('click');
    this.location.back();
  }

  ngOnInit(): void {
    this.service.get('inventory').subscribe({
      next: (response) => {
        this.inventory = Array.isArray(response) ? response : [];
      },
      error: (err) => console.error(err),
    });
  }

  ngAfterViewInit(): void {
    this.resetAndFocusInput();

    // Auto-refocus keep alive (runs every 1000ms if focus gets lost accidentally)
    this.keepFocusInterval = setInterval(() => {
      this.keepFocus();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.keepFocusInterval) {
      clearInterval(this.keepFocusInterval);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.closest('button') || target.closest('.modal') || target.closest('a'))) {
      return;
    }
    this.keepFocus();
  }

  keepFocus(): void {
    if (!this.isModalOpen && !this.isLoading) {
      if (this.cardInput?.nativeElement && document.activeElement !== this.cardInput.nativeElement) {
        this.cardInput.nativeElement.focus({ preventScroll: true });
      }
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

  scanQRcode(inputData: string): void {
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
    this.clearData();
    this.refillLog = null;
    this.service
      .post('getRefillLogByBarcode', { qrCode: rawData })
      .subscribe({
        next: (response) => {
          this.refillLog = response ? response[0] : null;
          this.isLoading = false;

          if (this.refillLog) {
            if (this.refillLog.confirmDT) {
              this.service.alert('warning', 'QR Code ถูกใช้งานไปแล้ว', '').then(() => {
                this.resetAndFocusInput();
              });
            } else {
              this.service.playSound('success');
              this.refillData = {
                qrCode: this.refillLog.Refill_Barcode,
                BinID: this.refillLog.BinID,
                DrugCd: this.refillLog.vc_DrugCd,
                DrugNm: this.refillLog.DrugNm,
                In_Qty: this.refillLog.In_Qty,
                LotNo: this.refillLog.LotNo,
                Exp: this.refillLog.Exp,
              };
              this.isModalOpen = true;
              _window.$(`#staticBackdrop`).modal('show');
              this.Highlights();
            }
          } else {
            this.service.alert('error', 'QR Code ไม่ถูกต้อง', 'ไม่พบข้อมูลกล่องยา กรุณาลองใหม่อีกครั้ง').then(() => {
              this.resetAndFocusInput();
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error(error);
          this.service.alert('error', 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้', 'กรุณาลองใหม่อีกครั้ง').then(() => {
            this.resetAndFocusInput();
          });
        },
      });
  }

  Highlights(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // เริ่มต้น setInterval ใหม่
    this.intervalId = setInterval(() => {
      const numberElement = document.getElementById('number');
      if (numberElement) {
        if (numberElement.classList.contains('green')) {
          numberElement.classList.remove('green');
          numberElement.classList.add('grey');
        } else {
          numberElement.classList.remove('grey');
          numberElement.classList.add('green');
        }
      }
    }, 800);

    this.service
      .post('getBinid', {
        BinID: this.refillData.BinID,
      })
      .subscribe({
        next: () => {},
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  submitRefill(): void {
    this.isLoading = true;
    this.service
      .post('refillLog', {
        DrugCd: this.refillData.DrugCd,
        In_Qty: this.refillData.In_Qty,
        LotNo: this.refillData.LotNo,
        Exp: this.refillData.Exp,
        UserId: this.userInfo.UserId,
        BinID: this.refillData.BinID,
        qrCode: this.refillData.qrCode,
      })
      .subscribe({
        next: (response) => {
          if (response.update) {
            this.service
              .post('updateLot', {
                BinID: this.refillData.BinID,
                DrugCd: this.refillData.DrugCd,
                In_Qty: this.refillData.In_Qty,
                LotNo: this.refillData.LotNo,
                Exp: this.refillData.Exp,
              })
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    this.isLoading = false;
                    this.clearData();
                    this.isModalOpen = false;
                    _window.$(`#staticBackdrop`).modal('hide');
                    this.service.alertTime('success', 'เติมยาสำเร็จ', '');
                    setTimeout(() => {
                      this.resetAndFocusInput();
                    }, 2000);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  console.error(error);
                },
              });
          } else {
            this.isLoading = false;
            this.service.alert('error', 'เติมยาไม่สำเร็จ', '');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error(error);
          this.service.alert('error', 'เติมยาไม่สำเร็จ', '');
        },
      });
  }

  cancelRefill(): void {
    this.clearData();
    this.isLoading = false;
    this.isModalOpen = false;
    _window.$(`#staticBackdrop`).modal('hide');
    this.resetAndFocusInput();
  }

  clearData(): void {
    this.refillData = {
      qrCode: null,
      BinID: null,
      DrugCd: null,
      DrugNm: null,
      In_Qty: null,
      LotNo: null,
      Exp: null,
    };
  }
}
