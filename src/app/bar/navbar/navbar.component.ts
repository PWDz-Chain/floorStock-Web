import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  assets:any = null;

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.assets = this.appService.assets
  }

}
