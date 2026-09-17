import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  assets: string = environment.assets;
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  post(endpoint: string, data: any, options: any = {}): Observable<any> {
    const url = `${this.apiUrl}/${endpoint}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, data, { headers, ...options });
  }

  get(endpoint: string, options: any = {}): Observable<any> {
    const url = `${this.apiUrl}/${endpoint}`;
    return this.http.get(url, options);
  }

  generatePdf(print_slip: any): Observable<any> {
    // console.log(print_slip);
    // return this.post('generatePdf', '');

    return this.post('generatePdf', print_slip);
  }

  private audioCtx: any = null;
  public soundEnabled: boolean = true;

  private getAudioContext(): any {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playSound(type: 'click' | 'scan' | 'success' | 'error' | 'warning' = 'click'): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'scan') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        // Medical 3-note ascending chime (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.09;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.2);
        });
      } else if (type === 'error' || type === 'warning') {
        // Medical low alert chime
        const notes = [320, 240];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.11;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.18);
        });
      }
    } catch (e) {
      // Audio context ignored if not supported
    }
  }

  public alert = (
    icon: 'error' | 'success' | 'warning',
    title: string,
    text: string = '',
  ): Promise<any> => {
    this.playSound(icon === 'success' ? 'success' : 'error');
    return Swal.fire({
      icon: icon,
      title: title,
      text: text,
      confirmButtonText: 'ตกลง',
    });
  };

  public alertTime = (
    icon: 'error' | 'success' | 'warning',
    title: string,
    text: string = '',
  ): Promise<any> => {
    this.playSound(icon === 'success' ? 'success' : 'error');
    return Swal.fire({
      icon: icon,
      title: title,
      text: text,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };
}

