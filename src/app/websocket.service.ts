import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from './app.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface NewMedicineAlert {
  prescriptionNo?: string;
  patientName?: string;
  wardName?: string;
  bedNo?: string;
  drugName?: string;
  hn?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;

  public onNewMedicine$ = new Subject<NewMedicineAlert>();
  public isConnected$ = new BehaviorSubject<boolean>(false);

  public get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  constructor(
    private readonly appService: AppService,
    private readonly router: Router
  ) {}

  /**
   * ดึง WebSocket URL อัตโนมัติตาม environment.baseUrl
   * - dev: http://localhost:3000 -> ws://localhost:3000
   * - prod: http://200.200.200.10:3000 -> ws://200.200.200.10:3000
   */
  private getWsUrl(): string {
    const base = (environment.baseUrl || 'http://localhost:3000').trim();
    const wsProtocol = base.startsWith('https') ? 'wss:' : 'ws:';
    const host = base.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${host}`;
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.isConnected$.next(true);
      }
      return;
    }

    this.isExplicitlyClosed = false;
    const url = this.getWsUrl();

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected successfully to:', url);
        this.isConnected$.next(true);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('[WebSocket] Error parsing message:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected$.next(false);
        if (!this.isExplicitlyClosed) {
          console.warn('[WebSocket] Disconnected. Reconnecting in 5s...');
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (err) => {
        console.error('[WebSocket] Connection error:', err);
        this.socket?.close();
      };
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * นำทางไปยังหน้ารับยา (Dispen)
   */
  public goToDispense(): void {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
      this.router.navigate(['/Dispen']);
    } else {
      sessionStorage.setItem('path', 'Dispen');
      this.router.navigate(['/Login']);
    }
  }

  private handleMessage(data: any): void {
    if (data?.type === 'newMedicine') {
      const p: NewMedicineAlert = data.payload || {};

      // เล่นเสียงแจ้งเตือนวนซ้ำตลอดเวลาที่ SweetAlert แสดงอยู่ (จังหวะรัว เร่งรีบ)
      this.appService.playSound('medicineAlert');
      const soundLoopInterval = setInterval(() => {
        this.appService.playSound('medicineAlert');
      }, 800);

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      // แสดง Popup แจ้งเตือนรายการยาใหม่ สไตล์ Modern Hospital Smart Kiosk
      Swal.fire({
        html: `
          <div class="kiosk-alert-container">
            <!-- Header Tag -->
            <div class="kiosk-alert-badge">
              <span style="display: inline-flex; align-items: center;">
                <span class="badge-pulse-dot-red"></span>
                <span>🚨 มีรายการยาใหม่เข้าตู้ • STAT ORDER</span>
              </span>
              <span class="badge-time">${timeStr} น.</span>
            </div>

            <!-- Primary Rx Card -->
            <div class="kiosk-rx-highlight">
              <div>
                <div class="rx-label">เลขที่ใบสั่งยา (Prescription No.)</div>
                <div class="rx-code">${p.prescriptionNo || '-'}</div>
              </div>
              <div style="font-size: 2rem;">📋</div>
            </div>

            <!-- Grid Details -->
            <div class="kiosk-alert-grid">
              <div class="kiosk-info-item">
                <span class="info-label">👤 ผู้ป่วย:</span>
                <span class="info-value">${p.patientName || '-'}</span>
                ${p.hn ? `<span class="hn-tag">${p.hn}</span>` : ''}
              </div>

              ${p.drugName ? `
              <div class="kiosk-info-item full-width">
                <span class="info-label">💊 รายการยา:</span>
                <div class="drug-name-text">${p.drugName}</div>
              </div>
              ` : ''}
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '💊 ไปหน้ารับยาทันที (Dispen)',
        cancelButtonText: 'รับทราบ (ปิด)',
        customClass: {
          popup: 'kiosk-medicine-modal',
          confirmButton: 'btn-kiosk-confirm',
          cancelButton: 'btn-kiosk-cancel',
        },
        buttonsStyling: false,
        timer: 4500,
        timerProgressBar: true,
        willClose: () => {
          clearInterval(soundLoopInterval);
        },
      }).then((result) => {
        clearInterval(soundLoopInterval);
        if (result.isConfirmed) {
          this.appService.playSound('click');
          this.goToDispense();
        }
      });

      this.onNewMedicine$.next(p);
    }
  }
}
