import { Component, OnInit, ViewChild } from '@angular/core';
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
    'BedNo',
    // 'Hn',
    'Fullname',
  ];

  campaign = new FormGroup({
    picker: new FormControl(new Date()),
  });

  constructor(private service: AppService, private router: Router,
       private location: Location
  ) {
     this.assets = this.service.assets;
  }

  ngOnInit(): void {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    // console.log(this.userInfo);
    this.fetchHistory();
  }
  

  dateChange(event: any): void {
    this.service.playSound('click');
    this.selectedDate = moment(new Date(event.value)).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  setToday(): void {
    this.service.playSound('click');
    const today = new Date();
    this.campaign.get('picker')?.setValue(today);
    this.selectedDate = moment(today).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  changeDateByOffset(offsetDays: number): void {
    this.service.playSound('click');
    const current = moment(this.selectedDate, 'YYYY-MM-DD');
    const newDate = current.add(offsetDays, 'days').toDate();
    this.campaign.get('picker')?.setValue(newDate);
    this.selectedDate = moment(newDate).format('YYYY-MM-DD');
    if (this.userInfo) {
      this.fetchHistory();
    }
  }

  fetchHistory(): void {
    this.listHis = [];
    this.dataHis = null;

    let wardCode = this.userInfo.wardcode;
    if (wardCode.includes('|')) {
      wardCode = wardCode
        .split('|')
        .map((code: string) => `'${code}'`)
        .join(',');
    } else {
      wardCode = `'${wardCode}'`;
    }

    this.service
      .post('history-dispense', {
        selectedDate: this.selectedDate,
        wardCode: wardCode,
      })
      .subscribe({
        next: (response) => {
          // console.log(response);
          this.listHis = response;
          console.log(this.listHis);
          this.dataHis = new MatTableDataSource(this.listHis);
          setTimeout(() => {
            this.dataHis.sort = this.sortHis;
            this.dataHis.paginator = this.paginHis;
          });

          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
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
