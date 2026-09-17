import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-refill',
  templateUrl: './refill.component.html',
  styleUrls: ['./refill.component.css'],
})
export class RefillComponent implements OnInit {
  assets: any = null;
  userInfo: any = null;

  constructor(private service: AppService,private router: Router,
      private location: Location
  ) {
    this.assets = this.service.assets;
  }

  ngOnInit(): void {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (parseInt(this.userInfo.Position ) > 1) {
      // console.log(this.userInfo);
      this.service.alert(
        'error',
        'คุณไม่ได้รับอนุญาติให้เข้าถึง',
        'โปรดติดต่อผู้ดูแลระบบ'
      );
      this.router.navigate(['/Login']);
    } else{

    }
  }

  navigate(path: string): void {
    // console.log(path);
    sessionStorage.setItem('path', path);
    this.router.navigate(['/Login']);
  }
  
   goBack(): void {
    this.location.back();
  }
}
