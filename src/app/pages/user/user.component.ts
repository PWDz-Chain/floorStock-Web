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

  ngOnInit(): void {}
}
