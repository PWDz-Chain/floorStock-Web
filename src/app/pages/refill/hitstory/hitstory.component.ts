import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hitstory',
  templateUrl: './hitstory.component.html',
  styleUrls: ['./hitstory.component.css']
})
export class HitstoryComponent implements OnInit, AfterViewInit {

  assets: any = null;

  isLoading: boolean = false;

  listHis: any[] = [];
  dataHis: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @ViewChild('sortHis') sortHis!: MatSort;
  @ViewChild('paginHis') paginHis!: MatPaginator;
  displayHis: string[] = [
    'BinID',
    'DrugNm',
    'LotNo',
    'Exp',
    'In_Qty',
    'confirmDT',
    'Fullname',
  ];

  // Filter state — default = today
  filterDateFrom: string = this.getTodayStr();
  filterDateTo: string = this.getTodayStr();
  filterDrugCd: string = '';
  filterDrug: string = '';

  constructor(private service: AppService, private http: HttpClient, private location: Location) { }

  ngOnInit(): void {
    this.fecthHitRefill();
  }

  ngAfterViewInit(): void {
    // re-apply filter after view is ready (paginator/sort attached)
    setTimeout(() => this.applyFilter(), 0);
  }

  /** Returns today as yyyy-MM-dd string */
  getTodayStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  fecthHitRefill(): void {
    this.isLoading = true;
    this.service.get('history-refill').subscribe({
      next: (response) => {
        this.isLoading = false;
        this.listHis = response;
        this.dataHis = new MatTableDataSource<any>(this.listHis);
        this.dataHis.sort = this.sortHis;
        this.dataHis.paginator = this.paginHis;
        this.dataHis.filterPredicate = this.buildFilterPredicate();
        // Apply default date filter immediately
        this.applyFilter();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  buildFilterPredicate() {
    return (data: any, _filter: string): boolean => {
      // Date from
      if (this.filterDateFrom) {
        const from = new Date(this.filterDateFrom);
        from.setHours(0, 0, 0, 0);
        const dt = new Date(data.confirmDT);
        if (dt < from) return false;
      }
      // Date to
      if (this.filterDateTo) {
        const to = new Date(this.filterDateTo);
        to.setHours(23, 59, 59, 999);
        const dt = new Date(data.confirmDT);
        if (dt > to) return false;
      }
      // Drug code (รหัสยา)
      if (this.filterDrugCd) {
        const code: string = (data.DrugCd || '').toLowerCase();
        if (!code.includes(this.filterDrugCd.toLowerCase())) return false;
      }
      // Drug name (รายการยา)
      if (this.filterDrug) {
        const drugName: string = (data.DrugNm || '').toLowerCase();
        if (!drugName.includes(this.filterDrug.toLowerCase())) return false;
      }
      return true;
    };
  }

  applyFilter(): void {
    this.dataHis.filterPredicate = this.buildFilterPredicate();
    this.dataHis.filter = Math.random().toString();
    if (this.dataHis.paginator) {
      this.dataHis.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.filterDateFrom = this.getTodayStr();
    this.filterDateTo = this.getTodayStr();
    this.filterDrugCd = '';
    this.filterDrug = '';
    this.applyFilter();
  }

  goBack(): void {
    this.location.back();
  }

}
