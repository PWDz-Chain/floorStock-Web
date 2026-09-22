import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
const _window: any = window;
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';

declare global {
  interface Window {
    Android: {
      receiveJson: (json: string) => void;
    };
  }
}

@Component({
  selector: 'app-dispen',
  templateUrl: './dispen.component.html',
  styleUrls: ['./dispen.component.css'],
})
export class DispenComponent implements AfterViewInit {
  assets: any = null;
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  userInfo: any = null;
  selectedDate: string = moment(new Date()).format('YYYY-MM-DD');
  activeTab: string = 'wait';

  detailOrder: any[] = [];
  selectOrder: any = null;
  selectItem: any = null;

  listWait: Array<any> = [];
  dataWait: any;
  @ViewChild('sortWait') sortWait!: MatSort;
  @ViewChild('paginWait') paginWait!: MatPaginator;
  displayHis: string[] = [
    'WardName',
    'PrescriptionNo',
    'Hn',
    'An',
    'PatientName',
    'BedNo',
  ];

  listDone: Array<any> = [];
  dataDone: any;
  @ViewChild('sortDone') sortDone!: MatSort;
  @ViewChild('paginDone') paginDone!: MatPaginator;
  displayDone: string[] = [
    'WardName',
    'PrescriptionNo',
    'Hn',
    'An',
    'PatientName',
    'BedNo',
  ];

  listDetail: Array<any> = [];
  dataDetail: any;
  @ViewChild('sortDetail') sortDetail!: MatSort;
  @ViewChild('paginDetail') paginDetail!: MatPaginator;
  displayDetail: string[] = [
    'BinIDs',
    'DrugName',
    'In_Qty',
    'Total_Qty',
    'DispensedDose',
    'DispensedUnit',
    'status',
    'option',
  ];

  campaign = new FormGroup({
    picker: new FormControl(new Date()),
  });

  private isNavigatingHome: boolean = false;

  get isOrderScan(): boolean {
    return (
      this.userInfo?.isKiosk === true ||
      sessionStorage.getItem('isOrderScan') === 'true'
    );
  }

  constructor(
    private service: AppService,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.assets = this.service.assets;
  }

  ngAfterViewInit(): void {
    this.isNavigatingHome = false;
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    console.log(this.userInfo);
    if (this.userInfo && this.userInfo.UserId) {
      const data = {
        PrescriptionNo: null,
        SeqNo: null,
        check: 2,
        userPrint: null,
      };

      if (window.Android && window.Android.receiveJson) {
        const json = JSON.stringify(data);
        window.Android.receiveJson(json);
      } else {
        console.warn('Android interface not found');
      }

      this.fetchOrder(() => {
        // ตรวจสอบว่ามีการสแกน QR_Order ส่งมาจากหน้า Login หรือไม่
        const autoOpenStr = sessionStorage.getItem('autoOpenOrder');
        if (autoOpenStr) {
          sessionStorage.removeItem('autoOpenOrder');
          try {
            const autoOrder = JSON.parse(autoOpenStr);
            if (autoOrder && autoOrder.PrescriptionNo) {
              this.getDetail(autoOrder, true);
            }
          } catch (e) {
            console.error('Error parsing autoOpenOrder', e);
          }
        }
      });

      // ดักจับเมื่อ modal ปิดลง: หากเป็นการสแกนด้วย order ให้กลับสู่หน้า home เลย ไม่ต้องกดอีก
      const _window: any = window;
      if (_window.$) {
        _window.$('#detailModal').off('hidden.bs.modal').on('hidden.bs.modal', () => {
          if (this.isOrderScan && !this.isNavigatingHome) {
            this.isNavigatingHome = true;
            sessionStorage.removeItem('isOrderScan');
            this.logOut();
          }
        });
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  private scanBuffer: string = '';
  private lastKeyTime: number = 0;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardScan(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    const now = Date.now();
    if (now - this.lastKeyTime > 250) {
      this.scanBuffer = '';
    }
    this.lastKeyTime = now;

    if (event.key === 'Enter') {
      const code = this.scanBuffer.trim();
      this.scanBuffer = '';
      if (code.length >= 2) {
        this.onScanOrder(code);
      }
    } else if (event.key.length === 1) {
      this.scanBuffer += event.key;
    }
  }

  onScanOrder(code: string): void {
    const raw = (code || '').trim();
    if (!raw) return;

    this.service.playSound('scan');
    this.isLoading = true;
    this.cdr.detectChanges();

    this.service.post('fetchOrderByQR', { qrCode: raw }).subscribe({
      next: (order) => {
        if (order && order.PrescriptionNo) {
          this.service.playSound('success');
          this.getDetail(order, false);
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.service.alert('warning', 'ไม่พบใบสั่งยานี้', `รหัสที่สแกน: ${raw}`);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.service.alert('error', 'ไม่พบข้อมูลใบสั่งยา', `รหัสที่สแกน: ${raw}`);
      },
    });
  }

  dateChange(event: any): void {
    this.service.playSound('click');
    this.selectedDate = moment(new Date(event.value)).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchOrder();
    }
  }

  setToday(): void {
    this.service.playSound('click');
    const today = new Date();
    this.campaign.get('picker')?.setValue(today);
    this.selectedDate = moment(today).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchOrder();
    }
  }

  changeDateByOffset(offsetDays: number): void {
    this.service.playSound('click');
    const current = moment(this.selectedDate, 'YYYY-MM-DD');
    const newDate = current.add(offsetDays, 'days').toDate();
    this.campaign.get('picker')?.setValue(newDate);
    this.selectedDate = moment(newDate).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchOrder();
    }
  }

  switchTab(tab: string): void {
    this.service.playSound('click');
    this.activeTab = tab;
  }

  refreshOrders(): void {
    this.service.playSound('click');
    this.isRefreshing = true;
    this.fetchOrder(() => {
      this.isRefreshing = false;
      this.cdr.detectChanges();
    });
  }

  fetchOrder(callback?: () => void, showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    let wardCode = this.userInfo?.wardcode ?? '';
    if (wardCode.includes('|')) {
      wardCode = wardCode
        .split('|')
        .map((code: string) => `'${code}'`)
        .join(',');
    } else {
      wardCode = `'${wardCode}'`;
    }

    let completedRequests = 0;
    const checkComplete = () => {
      completedRequests++;
      if (completedRequests >= 2) {
        if (showLoading) {
          this.isLoading = false;
        }
        if (callback) {
          callback();
        }
        this.cdr.detectChanges();
      }
    };

    this.service
      .post('fetchWaitOrder', {
        selectedDate: this.selectedDate,
        wardCode: wardCode,
      })
      .subscribe({
        next: (response) => {
          this.listWait = Array.isArray(response) ? response : [];
          if (this.dataWait) {
            this.dataWait.data = this.listWait;
          } else {
            this.dataWait = new MatTableDataSource(this.listWait);
          }
          if (this.paginWait) this.dataWait.paginator = this.paginWait;
          if (this.sortWait) this.dataWait.sort = this.sortWait;
          checkComplete();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          checkComplete();
        },
      });

    this.service
      .post('fetchSuccessOrder', {
        selectedDate: this.selectedDate,
        wardCode: wardCode,
      })
      .subscribe({
        next: (response) => {
          this.listDone = Array.isArray(response) ? response : [];
          if (this.dataDone) {
            this.dataDone.data = this.listDone;
          } else {
            this.dataDone = new MatTableDataSource(this.listDone);
          }
          if (this.paginDone) this.dataDone.paginator = this.paginDone;
          if (this.sortDone) this.dataDone.sort = this.sortDone;
          checkComplete();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          checkComplete();
        },
      });
  }

  getDetail(order: any, playSound: boolean = true): void {
    if (playSound) {
      this.service.playSound('click');
    }
    this.selectOrder = order;
    this.isLoading = true;
    this.cdr.detectChanges();

    if (!order || !order.PrescriptionNo) {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.service.alert(
        'error',
        'ไม่พบเลขที่ใบสั่งยา',
        'กรุณาลองใหม่อีกครั้ง'
      );
      return;
    }

    this.service
      .post('fetchDetailOrder_V2', {
        prescriptionNo: this.selectOrder.PrescriptionNo,
      })
      .subscribe({
        next: (response) => {
          const rawDetail = Array.isArray(response) ? response : [];
          const detailWithAvailable = rawDetail.map((item) => ({
            ...item,
            AvailableQty: this.getAvailableQty(item),
          }));
          this.listDetail = this.selectDetailBySeqNo(detailWithAvailable);
          console.log('listDetail from DB:', this.listDetail);

          if (this.dataDetail) {
            this.dataDetail.data = [...this.listDetail];
          } else {
            this.dataDetail = new MatTableDataSource([...this.listDetail]);
          }
          setTimeout(() => {
            if (this.dataDetail) {
              this.dataDetail.paginator = this.paginDetail;
              this.dataDetail.sort = this.sortDetail;
            }
          });

          if (this.activeTab === 'wait') {
            const hasPendingItems = this.listDetail.some(
              (item) => !item.DispenseDatetime
            );
            if (hasPendingItems) {
              this.isLoading = false;
              this.cdr.detectChanges();
              setTimeout(() => {
                _window.$(`#detailModal`).modal('show');
              }, 50);
            } else {
              // จ่ายยาครบทุกรายการแล้ว
              this.listDetail = [];
              this.isLoading = false;
              this.cdr.detectChanges();
              if (_window.$) {
                _window.$(`#detailModal`).modal('hide');
                _window.$('.modal-backdrop').remove();
                _window.$('body').removeClass('modal-open');
              }

              if (this.isOrderScan) {
                // สแกนด้วย order (Kiosk): แจ้งเตือนเสร็จสิ้น แล้วกลับสู่หน้า home เลย ไม่ต้องกดอีก
                if (!this.isNavigatingHome) {
                  this.isNavigatingHome = true;
                  this.service.playSound('success');
                  this.service.alertTime(
                    'success',
                    'รับยาเสร็จสิ้น',
                    'ดำเนินการจ่ายยาครบทุกรายการแล้ว กำลังกลับสู่หน้าหลัก...'
                  );
                  sessionStorage.removeItem('isOrderScan');
                  setTimeout(() => {
                    this.logOut();
                  }, 1200);
                }
              } else {
                // Flow เดิมของ User (เจ้าหน้าที่): ดึงข้อมูลรายการรอจ่ายใหม่ อยู่หน้าเดิม ทำงานต่อได้ตามปกติ
                this.fetchOrder(undefined, false);
              }
            }
          } else {
            this.isLoading = false;
            this.cdr.detectChanges();
            setTimeout(() => {
              _window.$(`#detailModal`).modal('show');
            }, 50);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.isLoading = false;
          this.cdr.detectChanges();
          if (error.status === 404) {
            this.service.alert(
              'error',
              'ไม่พบข้อมูลการสั่งยา',
              'กรุณาลองใหม่อีกครั้ง'
            );
          } else {
            this.service.alert(
              'error',
              'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
              'กรุณาลองใหม่อีกครั้ง'
            );
          }
        },
      });
  }

  private selectDetailBySeqNo(items: any[]): any[] {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const groups = new Map<string, any[]>();
    items.forEach((item, index) => {
      const key =
        item?.SeqNo !== null && item?.SeqNo !== undefined
          ? String(item.SeqNo)
          : `__index_${index}`;
      const group = groups.get(key);
      if (group) {
        group.push(item);
      } else {
        groups.set(key, [item]);
      }
    });

    const result: any[] = [];
    groups.forEach((group) => {
      result.push(this.pickBestBinForSeq(group));
    });

    return result;
  }

  private pickBestBinForSeq(items: any[]): any {
    if (!items || items.length === 0) {
      return null;
    }
    if (items.length === 1) {
      return items[0];
    }

    const dose = this.toNumber(items[0]?.DispensedDose);
    const enoughQty = items.filter(
      (item) => this.getAvailableQty(item) >= dose
    );
    const candidates = enoughQty.length > 0 ? enoughQty : items;

    const eligiblePack = candidates.filter((item) => {
      const pack = this.toNumber(item?.pack);
      return pack > 0 && pack <= dose;
    });
    const pool = eligiblePack.length > 0 ? eligiblePack : candidates;

    const sorted = [...pool].sort((a, b) => {
      const packA = this.toNumber(a?.pack);
      const packB = this.toNumber(b?.pack);
      const countA =
        packA > 0 && dose > 0 ? Math.ceil(dose / packA) : Number.POSITIVE_INFINITY;
      const countB =
        packB > 0 && dose > 0 ? Math.ceil(dose / packB) : Number.POSITIVE_INFINITY;

      if (countA !== countB) {
        return countA - countB;
      }
      if (packA !== packB) {
        return packA - packB;
      }

      const qtyA = this.toNumber(a?.In_Qty);
      const qtyB = this.toNumber(b?.In_Qty);
      if (qtyA !== qtyB) {
        return qtyA - qtyB;
      }

      const binA = this.toNumber(a?.BinID);
      const binB = this.toNumber(b?.BinID);
      return binA - binB;
    });

    return sorted[0];
  }

  private toNumber(value: any): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private getAvailableQty(item: any): number {
    const qty = this.toNumber(item?.In_Qty);
    const pack = this.toNumber(item?.pack);
    if (pack > 0) {
      return pack * qty;
    }
    return qty;
  }

  // submitPrint(): void {
  //   this.service
  //     .post('updatePrint', { prescriptionNo: this.selectOrder.PrescriptionNo })
  //     .subscribe({
  //       next: (response) => {
  //         console.log(response);
  //         // _window.$(`#detailModal`).modal('hide');
  //         this.service.alert(
  //           'success',
  //           'ส่งรายการสำเร็จ',
  //           'กรุณารอรับยาสักครู่'
  //         );
  //       },
  //       error: (error: HttpErrorResponse) => {
  //         console.error(error);
  //         this.isLoading = false;
  //       },
  //     });

  //   this.service.generatePdf(this.selectOrder, this.detailOrder).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       _window.$(`#detailModal`).modal('hide');
  //       this.service.alert('success', 'ส่งรายการสำเร็จ', 'กรุณารอรับยาสักครู่');
  //     },
  //     error: (error) => {
  //       console.error('Error generating PDF:', error);
  //       // this.service.alert(
  //       //   'error',
  //       //   'ไม่สามารถสร้าง PDF ได้',
  //       //   'กรุณาลองใหม่อีกครั้ง'
  //       // );
  //     },
  //   });
  // }

  async sendPrint(): Promise<void> {
    // console.log(this.selectOrder);
    // console.log(this.selectItem);

    let print_slip = [
      {
        confrim: '',
        frequencycode: '',
        prescriptionNo: this.selectOrder?.PrescriptionNo ?? '',
        patientname: this.selectOrder?.PatientName ?? '',
        hn: this.selectOrder?.Hn ?? '',
        an: this.selectOrder?.An ?? '',
        orderitemname: this.selectItem?.DrugName ?? '',
        orderqty: this.selectItem?.DispensedDose ?? '',
        freetext1: this.selectItem?.Freetext1 ?? '',
        freetext2: this.selectItem?.Freetext2 ?? '',
        freetext3: this.selectItem?.Freetext3 ?? '',
        freetext4: this.selectItem?.Freetext4 ?? '',
        freetext5: this.selectItem?.Freetext5 ?? '',
        alltimedetailcode: this.selectItem?.AllTimeCodes ?? '',
        timedetailcode: this.selectItem?.timecode ?? '',
        timecode: this.selectItem?.Freq_Desc_Code ?? '',
        orderitemnameTH: this.selectItem?.orderitemnameTH ?? '',
        wardname: this.selectOrder?.WardName ?? '',
        bedcode: this.selectOrder?.BedNo ?? '',
      },
    ];

    // console.log(print_slip);

    this.service.generatePdf(print_slip).subscribe({
      next: (response) => {
        // console.log(response);
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
      },
    });

    if (
      this.getAvailableQty(this.selectItem) <
      this.toNumber(this.selectItem?.DispensedDose)
    ) {
      let print_slip_again = [
        {
          confrim: '',
          frequencycode: '',
          prescriptionNo: this.selectOrder?.PrescriptionNo ?? '',
          patientname: this.selectOrder?.PatientName ?? '',
          hn: this.selectOrder?.Hn ?? '',
          an: this.selectOrder?.An ?? '',
          orderitemname: this.selectItem?.DrugName ?? '',
          orderqty: this.selectItem?.DispensedDose ?? '',
          freetext1: 'รับยาที่ห้องยา',
          freetext2: '',
          freetext3: '',
          freetext4: '',
          freetext5: '',
          alltimedetailcode: this.selectItem?.AllTimeCodes ?? '',
          timedetailcode: this.selectItem?.timecode ?? '',
          timecode: this.selectItem?.Freq_Desc_Code ?? '',
          orderitemnameTH: this.selectItem?.orderitemnameTH ?? '',
          wardname: this.selectOrder?.WardName ?? '',
          bedcode: this.selectOrder?.BedNo ?? '',
        },
      ];

      this.service.generatePdf(print_slip_again).subscribe({
        next: (response) => {
          // console.log(response);
        },
        error: (error) => {
          console.error('Error generating PDF:', error);
        },
      });
    }
  }

  async sendItem(item: any): Promise<void> {
    this.selectItem = item;
    this.checkDispenseRetries = 0;

    const data = {
      PrescriptionNo: this.selectOrder.PrescriptionNo,
      SeqNo: this.selectItem.SeqNo,
      check: 1,
      userPrint: this.userInfo?.UserId || 'KIOSK',
    };

    if (window.Android && window.Android.receiveJson) {
      const json = JSON.stringify(data);
      window.Android.receiveJson(json);
    } else {
      console.warn('Android interface not found');
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    await this.sendPrint();

    this.service
      .post('itemPrint', {
        prescriptionNo: this.selectOrder.PrescriptionNo,
        SeqNo: this.selectItem.SeqNo,
        UserId: this.userInfo?.UserId || 'KIOSK',
      })
      .subscribe({
        next: (response) => {
          // console.log(response);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.service.alert(
            'error',
            'ส่งรายการยาไม่สำเร็จ',
            'กรุณาลองใหม่อีกครั้ง'
          );
        },
      });

    this.checkDispense();
  }

  async dispenItem(item: any): Promise<void> {
    this.selectItem = item;
    this.checkDispenseRetries = 0;
    this.isLoading = true;
    this.cdr.detectChanges();

    await this.sendPrint();

    this.service
      .post('itemDispen', {
        prescriptionNo: this.selectOrder.PrescriptionNo,
        SeqNo: this.selectItem.SeqNo,
        UserId: this.userInfo?.UserId || 'KIOSK',
      })
      .subscribe({
        next: (response) => {
          // console.log(response);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.service.alert(
            'error',
            'ส่งรายการยาไม่สำเร็จ',
            'กรุณาลองใหม่อีกครั้ง'
          );
        },
      });

    this.checkDispense();
  }

  getReadyCount(): number {
    if (!Array.isArray(this.listDetail)) return 0;
    return this.listDetail.filter(
      (item) => !item.DispenseDatetime && item.DispensedDose <= item.AvailableQty
    ).length;
  }

  async sendAll(): Promise<void> {
    const readyItems = (this.listDetail || []).filter(
      (item) => !item.DispenseDatetime && item.DispensedDose <= item.AvailableQty
    );

    if (readyItems.length === 0) {
      this.service.alert('warning', 'ไม่พบรายการยาที่พร้อมจ่ายในตู้', '');
      return;
    }

    this.service.playSound('click');
    this.isLoading = true;
    this.checkDispenseRetries = 0;
    this.cdr.detectChanges();

    const data = {
      PrescriptionNo: this.selectOrder.PrescriptionNo,
      SeqNo: '',
      check: 1,
      userPrint: this.userInfo?.UserId || 'KIOSK',
    };

    if (window.Android && window.Android.receiveJson) {
      const json = JSON.stringify(data);
      window.Android.receiveJson(json);
    } else {
      console.warn('Android interface not found');
    }

    for (const item of readyItems) {
      this.selectItem = item;
      await this.sendPrint();

      this.service
        .post('itemDispen', {
          prescriptionNo: this.selectOrder.PrescriptionNo,
          SeqNo: item.SeqNo,
          UserId: this.userInfo?.UserId || 'KIOSK',
        })
        .subscribe({
          next: (response) => {
            // console.log(response);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
    }

    this.checkDispense();
  }

  async printAgian(item: any): Promise<void> {
    this.selectItem = item;
    await this.sendPrint();
  }

  private checkDispenseRetries: number = 0;

  checkDispense(): void {
    const seq = this.selectItem?.SeqNo ?? '';
    this.service
      .post('checkDispense', {
        prescriptionNo: this.selectOrder?.PrescriptionNo,
        SeqNo: seq,
      })
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            this.isLoading = false;
            this.checkDispenseRetries = 0;
            this.fetchOrder(undefined, false);
            this.getDetail(this.selectOrder, false);
          } else if (this.checkDispenseRetries < 30) {
            this.checkDispenseRetries++;
            setTimeout(() => {
              this.checkDispense();
            }, 1000);
          } else {
            this.isLoading = false;
            this.checkDispenseRetries = 0;
            this.fetchOrder(undefined, false);
            this.getDetail(this.selectOrder, false);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.isLoading = false;
          this.checkDispenseRetries = 0;
          this.getDetail(this.selectOrder, false);
          this.service.alert(
            'error',
            'ส่งรายการยาไม่สำเร็จ',
            'กรุณาลองใหม่อีกครั้ง'
          );
        },
      });
  }

  handleCloseModal(): void {
    const _window: any = window;
    if (_window.$) {
      _window.$('#detailModal').modal('hide');
      _window.$('.modal-backdrop').remove();
      _window.$('body').removeClass('modal-open');
    }

    if (this.isOrderScan) {
      if (!this.isNavigatingHome) {
        this.isNavigatingHome = true;
        sessionStorage.removeItem('isOrderScan');
        this.logOut();
      }
    } else {
      // Flow เดิมของ User (เจ้าหน้าที่): ปิด modal แล้วดึงข้อมูลใหม่ อยู่หน้าเดิมทำงานต่อ
      this.fetchOrder();
    }
  }

  closeModalAndGoHome(): void {
    this.handleCloseModal();
  }

  logOut(): void {
    const _window: any = window;
    if (_window.$) {
      _window.$('#detailModal').modal('hide');
      _window.$('.modal-backdrop').remove();
      _window.$('body').removeClass('modal-open');
    }
    this.service.playSound('click');
    const data = {
      PrescriptionNo: null,
      SeqNo: null,
      check: 2,
      userPrint: null,
    };

    if (window.Android && window.Android.receiveJson) {
      const json = JSON.stringify(data);
      window.Android.receiveJson(json);
    } else {
      console.warn('Android interface not found');
    }

    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('autoOpenOrder');
    sessionStorage.removeItem('isOrderScan');
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.service.playSound('click');
    this.location.back();
  }
}
