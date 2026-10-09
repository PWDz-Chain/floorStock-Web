import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  assets: any = null;
  constructor(private appService: AppService, private router: Router) {
    this.assets = this.appService.assets;
  }

  ngOnInit(): void {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    const userLevel = userInfo?.Level ?? userInfo?.level;
    if (userLevel === 0 || userLevel === '0') {
      this.appService.alert(
        'warning',
        'เฉพาะเจ้าหน้าที่เติมยาเท่านั้น',
        'ท่านไม่มีสิทธิ์เข้าถึงเมนูนี้'
      );
      this.router.navigate(['/']);
      return;
    }
  }
}
