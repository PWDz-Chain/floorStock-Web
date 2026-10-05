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

  public playSound(type: 'click' | 'scan' | 'success' | 'error' | 'warning' | 'medicineAlert' = 'click'): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'medicineAlert') {
        // Urgent Heavy Rush Pulse (หนักแน่น ดุดัน ทรงพลัง ตึ้ด! ตึ้ด! ตึ้ด! ฟ้าวมาเอายาเด้อ)
        const rushPulses = [
          { leadFreq: 1300, bodyFreq: 650, time: 0.00, dur: 0.095 },
          { leadFreq: 1300, bodyFreq: 650, time: 0.12, dur: 0.095 },
          { leadFreq: 1550, bodyFreq: 775, time: 0.24, dur: 0.15 }, // จังหวะท้ายหนักแน่น พุ่งชัด
        ];

        rushPulses.forEach((pulse) => {
          const startTime = now + pulse.time;

          // 1. Lead Crisp Wave (Sawtooth - คม พุ่ง ด่วน)
          const oscLead = ctx.createOscillator();
          const gainLead = ctx.createGain();
          oscLead.type = 'sawtooth';
          // Punch attack: หัวโน้ตกระแทกแน่นช่วง 15ms แรก
          oscLead.frequency.setValueAtTime(pulse.leadFreq * 1.25, startTime);
          oscLead.frequency.exponentialRampToValueAtTime(pulse.leadFreq, startTime + 0.015);

          gainLead.gain.setValueAtTime(0.36, startTime);
          gainLead.gain.exponentialRampToValueAtTime(0.001, startTime + pulse.dur);

          oscLead.connect(gainLead);
          gainLead.connect(ctx.destination);
          oscLead.start(startTime);
          oscLead.stop(startTime + pulse.dur);

          // 2. Heavy Body Sub-Layer (Square/Triangle - เนื้อเสียงแน่น ทุ้ม มีมวลน้ำหนัก ไม่แบน)
          const oscBody = ctx.createOscillator();
          const gainBody = ctx.createGain();
          oscBody.type = 'square';
          oscBody.frequency.setValueAtTime(pulse.bodyFreq * 1.2, startTime);
          oscBody.frequency.exponentialRampToValueAtTime(pulse.bodyFreq, startTime + 0.015);

          gainBody.gain.setValueAtTime(0.24, startTime);
          gainBody.gain.exponentialRampToValueAtTime(0.001, startTime + pulse.dur);

          oscBody.connect(gainBody);
          gainBody.connect(ctx.destination);
          oscBody.start(startTime);
          oscBody.stop(startTime + pulse.dur);
        });
      } else if (type === 'click') {
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
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
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
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.22);
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

