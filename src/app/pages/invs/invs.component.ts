import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
const _window: any = window;
import * as moment from 'moment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-invs',
  templateUrl: './invs.component.html',
  styleUrls: ['./invs.component.css'],
})
export class InvsComponent implements OnInit, AfterViewInit, OnDestroy {
  assets: any = null;
  userInfo: any = null;
  isLoading: boolean = false;

  inventory: any[] = [];
  groupedInventory: { rowId: number; items: any[] }[] = [];
  selectItem: any = null;
  locationInv: any[] = [];
  searchDrugCd: string = '';
  matchingInventory: any[] = [];

  activeFilter: 'all' | 'instock' | 'empty' | 'full' = 'all';
  stats = {
    total: 0,
    withStock: 0,
    empty: 0,
    full: 0,
  };

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  newLotInput: { LotNo: string; Exp: string; In_Qty: number | null } = {
    LotNo: '',
    Exp: '',
    In_Qty: null,
  };

  isSavingNewLot: boolean = false;
  isModalOpen: boolean = false;
  private keepFocusInterval: any = null;

  constructor(private service: AppService, private http: HttpClient, private location: Location) {}

  ngOnInit(): void {
    this.fecthInventory();
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    // console.log(this.userInfo);
  }

  ngAfterViewInit(): void {
    if (this.searchInput?.nativeElement) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus({ preventScroll: true });
      });
    }

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
    if (target && (target.closest('button') || target.closest('.modal') || target.closest('.inventory-card') || target.closest('a'))) {
      return;
    }
    this.keepFocus();
  }

  keepFocus(): void {
    if (!this.isModalOpen && !this.isLoading) {
      if (this.searchInput?.nativeElement && document.activeElement !== this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus({ preventScroll: true });
      }
    }
  }

  fecthInventory(): void {
    this.isLoading = true;
    this.service.get('inventory').subscribe({
      next: (response) => {
        this.isLoading = false;
        if (Array.isArray(response)) {
          this.inventory = response.sort((a: any, b: any) => {
            return Number(a.binID || 0) - Number(b.binID || 0);
          });
        } else {
          this.inventory = response || [];
        }
        this.groupInventoryRows();
        console.log(this.inventory);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  groupInventoryRows(): void {
    const groups: { [key: number]: any[] } = {};
    let withStock = 0;
    let empty = 0;
    let full = 0;

    for (const item of this.inventory) {
      const binNum = Number(item.binID);
      const rowKey = !isNaN(binNum) ? Math.floor(binNum / 100) : 0;
      if (!groups[rowKey]) {
        groups[rowKey] = [];
      }
      groups[rowKey].push(item);

      const total = Number(item.Total_In_Qty || 0);
      const max = Number(item.Max_Qty || 0);
      if (total > 0) {
        withStock++;
        if (max > 0 && total >= max) {
          full++;
        }
      } else {
        empty++;
      }
    }

    this.stats = {
      total: this.inventory.length,
      withStock,
      empty,
      full,
    };

    this.groupedInventory = Object.keys(groups)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        rowId: Number(key),
        items: groups[Number(key)],
      }));
  }

  setFilter(filter: 'all' | 'instock' | 'empty' | 'full'): void {
    this.service.playSound('click');
    this.activeFilter = filter;
  }

  isItemMatchingFilter(item: any): boolean {
    if (this.activeFilter === 'all') return true;
    const total = Number(item.Total_In_Qty || 0);
    const max = Number(item.Max_Qty || 0);

    if (this.activeFilter === 'instock') return total > 0;
    if (this.activeFilter === 'empty') return total === 0 || !item.DrugNm;
    if (this.activeFilter === 'full') return total >= max && max > 0;
    return true;
  }

  isNewRow(index: number): boolean {
    if (index === 0 || !this.inventory[index] || !this.inventory[index - 1]) return false;
    const currentBinID = Number(this.inventory[index].binID);
    const previousBinID = Number(this.inventory[index - 1].binID);

    if (isNaN(currentBinID) || isNaN(previousBinID)) return false;

    return Math.floor(currentBinID / 100) > Math.floor(previousBinID / 100);
  }

  getProgressWidth(total: number, max: number): string {
    const safeTotal = Number(total);
    const safeMax = Number(max);

    if (
      !Number.isFinite(safeMax) ||
      safeMax <= 0 ||
      !Number.isFinite(safeTotal)
    ) {
      return '0%';
    }

    const percentage = (safeTotal / safeMax) * 100;

    if (!Number.isFinite(percentage)) {
      return '0%';
    }

    const clamped = Math.min(Math.max(percentage, 0), 100);
    const normalized = Math.round(clamped * 100) / 100;

    return `${normalized}%`;
  }

  resetAndFocusSearch(): void {
    this.searchDrugCd = '';
    setTimeout(() => {
      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.value = '';
        this.searchInput.nativeElement.focus();
        this.searchInput.nativeElement.select();
      }
    }, 150);
  }

  onSearchDrugCd(): void {
    let query = (this.searchDrugCd || '').trim();

    // ถ้ามี ";" ให้เอาเฉพาะด้านหน้า
    if (query.includes(';')) {
      query = query.split(';')[0].trim();
    }

    if (!query) {
      this.resetAndFocusSearch();
      return;
    }

    // ล้างค่าในช่องค้นหาทันที
    this.searchDrugCd = '';
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }

    const matches = this.inventory.filter(
      (item) =>
        (item.DrugCd ?? '').toString().toLowerCase() === query.toLowerCase() ||
        (item.Barcode ?? '').toString().toLowerCase() === query.toLowerCase()
    );

    if (matches.length === 0) {
      this.service
        .alert('warning', 'ไม่พบข้อมูล', 'กรุณาตรวจสอบรหัสยาอีกครั้ง')
        .then(() => {
          this.resetAndFocusSearch();
        });
      return;
    }

    if (matches.length === 1) {
      this.fecthLocationInv(matches[0]);
      return;
    }

    this.matchingInventory = matches;
    console.log(this.matchingInventory);

    setTimeout(() => {
      _window.$(`#selectBinModal`).modal('show');
    }, 100);
  }

  selectBinFromSearch(item: any): void {
    this.matchingInventory = [];
    _window.$(`#selectBinModal`).modal('hide');
    this.fecthLocationInv(item);
  }

  closeSelectBinModal(): void {
    this.matchingInventory = [];
    _window.$(`#selectBinModal`).modal('hide');
  }

  activeInputTarget: 'newInQty' | 'newLotNo' | 'newExp' = 'newInQty';
  keyboardMode: 'alpha' | 'numeric' = 'numeric';
  isCaps: boolean = true;

  expDisplay: string = '';

  resetNewLotInput(): void {
    const todayLot = 'LOT' + moment().format('YYYYMMDD');
    const defaultExpMoment = moment().add(2, 'years').endOf('month');
    this.expDisplay = defaultExpMoment.format('DD/MM/YYYY');

    const max = Number(this.selectItem?.Max_Qty || 10);
    const total = Number(this.selectItem?.Total_In_Qty || 0);
    const defaultQty = Math.max(1, max - total);

    this.newLotInput = {
      LotNo: todayLot,
      Exp: defaultExpMoment.format('YYYY-MM-DD'),
      In_Qty: defaultQty,
    };
    this.activeInputTarget = 'newInQty';
    this.keyboardMode = 'numeric';
  }

  setInputTarget(target: 'newInQty' | 'newLotNo' | 'newExp'): void {
    this.service.playSound('click');
    this.activeInputTarget = target;
    if (target === 'newInQty' || target === 'newExp') {
      this.keyboardMode = 'numeric';
    } else {
      this.keyboardMode = 'alpha';
    }
  }

  onKeyTouch(key: string): void {
    this.service.playSound('click');
    if (this.activeInputTarget === 'newLotNo') {
      let current = this.newLotInput.LotNo || '';
      current += this.isCaps ? key.toUpperCase() : key.toLowerCase();
      this.newLotInput.LotNo = current;
    } else if (this.activeInputTarget === 'newExp') {
      if (/^[0-9]$/.test(key)) {
        let digits = (this.expDisplay || '').replace(/\D/g, '');
        // If already full (8 digits), do not clear or add more digits
        if (digits.length < 8) {
          digits += key;
          let formatted = '';
          if (digits.length > 0) formatted += digits.slice(0, 2);
          if (digits.length >= 3) formatted += '/' + digits.slice(2, 4);
          if (digits.length >= 5) formatted += '/' + digits.slice(4, 8);
          this.expDisplay = formatted;

          if (digits.length === 8) {
            const day = digits.slice(0, 2);
            const month = digits.slice(2, 4);
            const year = digits.slice(4, 8);
            this.newLotInput.Exp = `${year}-${month}-${day}`;
          } else {
            this.newLotInput.Exp = '';
          }
        }
      }
    } else if (this.activeInputTarget === 'newInQty') {
      let current = this.newLotInput.In_Qty !== null ? String(this.newLotInput.In_Qty) : '';
      current += key;
      const parsed = parseInt(current, 10);
      this.newLotInput.In_Qty = isNaN(parsed) ? 0 : parsed;
    }
  }

  onKeyBackspace(): void {
    this.service.playSound('click');
    if (this.activeInputTarget === 'newLotNo') {
      const current = this.newLotInput.LotNo || '';
      this.newLotInput.LotNo = current.slice(0, -1);
    } else if (this.activeInputTarget === 'newExp') {
      let digits = (this.expDisplay || '').replace(/\D/g, '');
      if (digits.length > 0) {
        digits = digits.slice(0, -1);
        let formatted = '';
        if (digits.length > 0) formatted += digits.slice(0, 2);
        if (digits.length >= 3) formatted += '/' + digits.slice(2, 4);
        if (digits.length >= 5) formatted += '/' + digits.slice(4, 8);
        this.expDisplay = formatted;

        if (digits.length === 8) {
          const day = digits.slice(0, 2);
          const month = digits.slice(2, 4);
          const year = digits.slice(4, 8);
          this.newLotInput.Exp = `${year}-${month}-${day}`;
        } else {
          this.newLotInput.Exp = '';
        }
      }
    } else if (this.activeInputTarget === 'newInQty') {
      const current = this.newLotInput.In_Qty !== null ? String(this.newLotInput.In_Qty) : '';
      const sliced = current.slice(0, -1);
      const parsed = parseInt(sliced, 10);
      this.newLotInput.In_Qty = isNaN(parsed) ? 0 : parsed;
    }
  }

  onKeyClear(): void {
    this.service.playSound('click');
    if (this.activeInputTarget === 'newLotNo') {
      this.newLotInput.LotNo = '';
    } else if (this.activeInputTarget === 'newExp') {
      this.expDisplay = '';
      this.newLotInput.Exp = '';
    } else if (this.activeInputTarget === 'newInQty') {
      this.newLotInput.In_Qty = 0;
    }
  }

  onExpInputChange(event: any): void {
    const val = event?.target?.value || '';
    let digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length >= 3) formatted += '/' + digits.slice(2, 4);
    if (digits.length >= 5) formatted += '/' + digits.slice(4, 8);
    this.expDisplay = formatted;
    if (event?.target) {
      event.target.value = formatted;
    }

    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      this.newLotInput.Exp = `${year}-${month}-${day}`;
    } else {
      this.newLotInput.Exp = '';
    }
  }

  toggleCaps(): void {
    this.service.playSound('click');
    this.isCaps = !this.isCaps;
  }

  setKeyboardMode(mode: 'alpha' | 'numeric'): void {
    this.service.playSound('click');
    this.keyboardMode = mode;
  }

  adjustQty(delta: number): void {
    this.service.playSound('click');
    const current = Number(this.newLotInput.In_Qty || 0);
    const max = Number(this.selectItem?.Max_Qty || 50);
    const next = current + delta;
    if (next >= 1 && next <= max) {
      this.newLotInput.In_Qty = next;
    }
  }

  setPresetQty(qty: number): void {
    this.service.playSound('click');
    this.newLotInput.In_Qty = qty;
  }

  setFullQty(): void {
    this.service.playSound('click');
    const max = Number(this.selectItem?.Max_Qty || 10);
    const total = Number(this.selectItem?.Total_In_Qty || 0);
    this.newLotInput.In_Qty = Math.max(1, max - total);
  }

  getThaiFormattedExp(): string {
    const target = this.newLotInput.Exp || this.expDisplay;
    if (!target) return '';
    const m = moment(target, ['YYYY-MM-DD', 'DD/MM/YYYY']);
    if (!m.isValid()) return '';
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${m.date()} ${thaiMonths[m.month()]} พ.ศ. ${m.year() + 543}`;
  }

  prefillNewLot(order: any): void {
    if (!order) return;
    const lotNo = order.LotNo ?? '';
    const rawExp = order.Exp ?? '';
    const expValue = typeof rawExp === 'string' ? rawExp.slice(0, 10) : '';
    const qtyNumber = Number(order.In_Qty ?? 0);

    if (expValue) {
      const m = moment(expValue);
      if (m.isValid()) {
        this.expDisplay = m.format('DD/MM/YYYY');
        this.newLotInput.Exp = m.format('YYYY-MM-DD');
      }
    }

    this.newLotInput = {
      LotNo: typeof lotNo === 'string' ? lotNo : String(lotNo),
      Exp: expValue,
      In_Qty: Number.isFinite(qtyNumber) ? qtyNumber : 0,
    };
  }

  private normalizeNewLotInput(): {
    lotNo: string;
    exp: string;
    qty: number;
  } | null {
    const lotNo = (this.newLotInput.LotNo ?? '').trim();
    let exp = (this.newLotInput.Exp ?? '').trim();

    if (!exp && this.expDisplay && /^\d{2}\/\d{2}\/\d{4}$/.test(this.expDisplay)) {
      const [d, m, y] = this.expDisplay.split('/');
      exp = `${y}-${m}-${d}`;
      this.newLotInput.Exp = exp;
    }

    const qtyInput = this.newLotInput.In_Qty;

    if (!lotNo || !exp || qtyInput === null || qtyInput === undefined) {
      this.service.alert('warning', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'ตรวจสอบเลข Lot, วันหมดอายุ (วว/ดด/ปปปป) และจำนวนยา');
      return null;
    }

    const qty = Number(qtyInput);

    if (!Number.isFinite(qty) || qty <= 0) {
      this.service.alert('warning', 'จำนวนต้องมากกว่า 0', '');
      return null;
    }

    return { lotNo, exp, qty };
  }

  private refreshAfterLotChange(): void {
    this.resetNewLotInput();

    if (this.selectItem) {
      this.fecthLocationInv(this.selectItem);
    }

    this.fecthInventory();
  }

  private handleLotSaveSuccess(): void {
    this.service.playSound('success');
    this.service.alertTime('success', 'บันทึกข้อมูลสำเร็จ', 'สต็อกได้รับการอัปเดตเรียบร้อย');
    this.refreshAfterLotChange();
  }

  addNewLotEntry(): void {
    if (!this.selectItem) {
      return;
    }

    const normalized = this.normalizeNewLotInput();

    if (!normalized) {
      return;
    }

    const { lotNo, exp, qty } = normalized;

    if (!this.selectItem.DrugCd) {
      this.service.alert('error', 'ไม่พบรหัสยา', 'ไม่สามารถบันทึกได้');
      return;
    }

    const userId = this.userInfo?.UserId || '1';

    const datetime = moment().format('YYYYMMDDHHmmss');
    const qrCode = `${this.selectItem.binID}|${this.selectItem.DrugCd}|${qty}|${lotNo}|${exp}|${datetime}`;

    const payload = {
      BinID: this.selectItem.binID,
      DrugCd: this.selectItem.DrugCd,
      LotNo: lotNo,
      Exp: exp,
      In_Qty: qty,
      UserId: userId,
      qrCode,
    };

    this.isSavingNewLot = true;

    this.service.post('updateLot', payload).subscribe({
      next: (response) => {
        if (response?.success) {
          this.service.post('insertRefill', payload).subscribe({
            next: (insertResponse) => {
              this.isSavingNewLot = false;

              if (insertResponse) {
                this.handleLotSaveSuccess();
              } else {
                this.refreshAfterLotChange();
                this.service.alert(
                  'warning',
                  'บันทึกข้อมูลสำเร็จบางส่วน',
                  'ไม่สามารถบันทึกประวัติการเติมได้'
                );
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error(error);
              this.isSavingNewLot = false;
              this.refreshAfterLotChange();
              this.service.alert(
                'warning',
                'บันทึกข้อมูลสำเร็จบางส่วน',
                'ไม่สามารถบันทึกประวัติการเติมได้'
              );
            },
          });
        } else {
          this.isSavingNewLot = false;
          this.service.alert('error', 'บันทึกข้อมูลไม่สำเร็จ', '');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.isSavingNewLot = false;
        this.service.alert('error', 'บันทึกข้อมูลไม่สำเร็จ', '');
      },
    });
  }

  overwriteLotLotEntry(): void {
    if (!this.selectItem) {
      return;
    }

    const normalized = this.normalizeNewLotInput();

    if (!normalized) {
      return;
    }

    const { lotNo, exp, qty } = normalized;

    if (!this.selectItem.DrugCd) {
      this.service.alert('error', 'ไม่พบรหัสยา', 'ไม่สามารถบันทึกได้');
      return;
    }

    const payload = {
      BinID: this.selectItem.binID,
      DrugCd: this.selectItem.DrugCd,
      LotNo: lotNo,
      Exp: exp,
      In_Qty: qty,
    };

    this.isSavingNewLot = true;

    this.service.post('overwriteLot', payload).subscribe({
      next: (response) => {
        this.isSavingNewLot = false;

        if (response?.success) {
          this.handleLotSaveSuccess();
        } else {
          this.service.alert('error', 'บันทึกข้อมูลไม่สำเร็จ', '');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.isSavingNewLot = false;
        this.service.alert('error', 'บันทึกข้อมูลไม่สำเร็จ', '');
      },
    });
  }

  fecthLocationInv(val: any): void {
    this.service.playSound('click');
    this.selectItem = val;
    this.resetNewLotInput();
    this.isSavingNewLot = false;
    this.isLoading = true;
    this.locationInv = [];
    this.isModalOpen = true;

    this.service
      .post('fecthLocationInv', {
        binID: val.binID,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.locationInv = Array.isArray(response) ? response : [];

          setTimeout(() => {
            _window.$(`#detailModal`).modal('show');
          }, 150);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.isLoading = false;
          this.service.alert(
            'error',
            'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
            'กรุณาลองใหม่อีกครั้ง'
          );
        },
      });
  }

  closeDetailModal(): void {
    this.service.playSound('click');
    this.isModalOpen = false;
    _window.$(`#detailModal`).modal('hide');
    this.resetAndFocusSearch();
  }

  goBack(): void {
    this.service.playSound('click');
    this.location.back();
  }
}
