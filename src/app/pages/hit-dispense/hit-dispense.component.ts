import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hit-dispense',
  templateUrl: './hit-dispense.component.html',
  styleUrls: ['./hit-dispense.component.css'],
})
export class HitDispenseComponent implements OnInit {
  assets: any = null;
  isLoading: boolean = false;
  userInfo: any = null;
  selectedDate: string = moment(new Date()).format('YYYY-MM-DD');
  selectedDateObj: Date = new Date();
  showCalendar: boolean = false;

  listHis: Array<any> = [];
  dataHis: any;
  @ViewChild('sortHis') sortHis!: MatSort;
  @ViewChild('paginHis') paginHis!: MatPaginator;
  displayHis: string[] = [
    'DispenseDatetime',
    'DrugName',
    'DispensedDose',
    'DispensedUnit',
    'PatientName',
    'WardName',
    // 'Hn',
    'Fullname',
  ];

  campaign = new FormGroup({
    picker: new FormControl(new Date()),
  });

  wardList: any[] = [];
  selectedWard: string = 'W';
  isLevel0: boolean = false;
  showWardDropdown: boolean = false;
  wardSearchQuery: string = '';

  get filteredWardList(): any[] {
    if (!this.wardSearchQuery || !this.wardSearchQuery.trim()) {
      return this.wardList;
    }
    const q = this.wardSearchQuery.trim().toLowerCase();
    return this.wardList.filter(
      (w) =>
        (w.wardcode && String(w.wardcode).toLowerCase().includes(q)) ||
        (w.warddesc && String(w.warddesc).toLowerCase().includes(q))
    );
  }

  getSelectedWardName(): string {
    if (!this.selectedWard || this.selectedWard === 'W' || this.selectedWard === 'ALL') {
      return 'ทุกหอผู้ป่วย (All Wards)';
    }
    const found = this.wardList.find((w) => w.wardcode === this.selectedWard);
    return found ? `${found.wardcode} - ${found.warddesc}` : this.selectedWard;
  }

  constructor(
    private service: AppService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.assets = this.service.assets;
  }

  ngOnInit(): void {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!this.userInfo || !this.userInfo.UserId) {
      this.router.navigate(['/']);
      return;
    }
    const userLevel = this.userInfo?.Level ?? this.userInfo?.level;
    this.isLevel0 = (userLevel === 0 || userLevel === '0');
    this.fetchWards();
    this.fetchHistory();
  }

  fetchWards(): void {
    this.service.get('wards').subscribe({
      next: (res) => {
        if (res && Array.isArray(res.data)) {
          this.wardList = res.data;
        } else if (Array.isArray(res)) {
          this.wardList = res;
        }
      },
      error: (err) => console.error('Error fetching wards:', err),
    });
  }

  onWardChange(wardCode: string): void {
    this.service.playSound('click');
    this.selectedWard = wardCode;
    this.fetchHistory();
  }

  toggleWardDropdown(event: Event): void {
    event.stopPropagation();
    this.showWardDropdown = !this.showWardDropdown;
    if (this.showWardDropdown) {
      this.showCalendar = false;
      this.wardSearchQuery = '';
    }
  }

  closeWardDropdown(): void {
    this.showWardDropdown = false;
    this.wardSearchQuery = '';
  }

  selectWard(wardCode: string): void {
    this.service.playSound('click');
    this.selectedWard = wardCode;
    this.showWardDropdown = false;
    this.wardSearchQuery = '';
    this.fetchHistory();
  }

  dateChange(event: any): void {
    this.service.playSound('click');
    this.selectedDate = moment(new Date(event.value)).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  toggleCalendar(event: Event): void {
    event.stopPropagation();
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.showWardDropdown = false;
    }
  }

  closeCalendar(): void {
    this.showCalendar = false;
  }

  onCalendarDateChange(date: Date): void {
    this.service.playSound('click');
    this.selectedDateObj = date;
    this.selectedDate = moment(date).format('YYYY-MM-DD');
    this.campaign.get('picker')?.setValue(date);
    this.showCalendar = false;
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  setToday(): void {
    this.service.playSound('click');
    const today = new Date();
    this.selectedDateObj = today;
    this.campaign.get('picker')?.setValue(today);
    this.selectedDate = moment(today).format('YYYY-MM-DD');
    this.showCalendar = false;
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  changeDateByOffset(offsetDays: number): void {
    this.service.playSound('click');
    const current = moment(this.selectedDate, 'YYYY-MM-DD');
    const newDate = current.add(offsetDays, 'days').toDate();
    this.selectedDateObj = newDate;
    this.campaign.get('picker')?.setValue(newDate);
    this.selectedDate = moment(newDate).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  fetchHistory(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.listHis = [];
    this.dataHis = null;

    let wardCode = '';
    if (!this.selectedWard || this.selectedWard === 'W' || this.selectedWard === 'ALL') {
      wardCode = "'W'";
    } else {
      wardCode = `'${this.selectedWard.trim()}'`;
    }

    this.service
      .post('history-dispense', {
        selectedDate: this.selectedDate,
        wardCode: wardCode,
        Level: this.isLevel0 ? 0 : 1,
      })
      .subscribe({
        next: (response) => {
          this.listHis = Array.isArray(response) ? response : [];
          console.log(this.listHis);
          this.dataHis = new MatTableDataSource(this.listHis);
          setTimeout(() => {
            this.dataHis.sort = this.sortHis;
            this.dataHis.paginator = this.paginHis;
          });

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error(error);
        },
      });
  }

  logOut(): void {
    sessionStorage.removeItem('userInfo');
    this.router.navigate(['/Login']);
  }

   goBack(): void {
    this.location.back();
  }
}
