import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-buttombar',
  templateUrl: './buttombar.component.html',
  styleUrls: ['./buttombar.component.css']
})
export class ButtombarComponent implements OnInit {

  assets: any = null;
  versionTag: string = environment.tag || 'v1.0.0';
  buildTime: string = environment.buildTime || '';

  constructor(private service: AppService,
       private location: Location
  ) {
    this.assets = this.service.assets;
   }

  ngOnInit(): void {
  }

  get soundEnabled(): boolean {
    return this.service.soundEnabled;
  }

  toggleSound(): void {
    this.service.soundEnabled = !this.service.soundEnabled;
    if (this.service.soundEnabled) {
      this.service.playSound('click');
    }
  }

  goBack(): void {
    this.service.playSound('click');
    this.location.back();
  }

  onHomeClick(): void {
    this.service.playSound('click');
  }
}

