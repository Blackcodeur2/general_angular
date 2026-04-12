import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../services/agent/agent.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-validate',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="validate-page">
      <header class="page-header">
        <h1>Validation des Tickets</h1>
        <p>Scannez le QR Code ou saisissez le code du ticket pour valider.</p>
      </header>

      <div class="scanner-mock">
        <div class="scanner-box">
          <mat-icon class="camera-icon">qr_code_scanner</mat-icon>
          <div class="scan-line"></div>
          <p>Scannez le QR Code du client</p>
        </div>

        <div class="manual-input">
          <span>OU</span>
          <div class="input-group">
            <input type="text" [(ngModel)]="validationCode" placeholder="Entrer le code manuellement">
            <button class="btn-verify" (click)="verifyCode()" [disabled]="isValidating()">{{ isValidating() ? 'Vérification...' : 'Vérifier' }}</button>
          </div>
        </div>

        <div *ngIf="resultMessage()" class="validation-result" [class.success]="validationSuccess()" [class.error]="!validationSuccess()">
          {{ resultMessage() }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .validate-page { max-width: 600px; margin: 0 auto; text-align: center; padding-top: 2rem; }
    .page-header { margin-bottom: 3rem; }
    
    .scanner-box { background: white; border: 2px dashed #D1D5DB; border-radius: 20px; padding: 4rem 2rem; position: relative; overflow: hidden; margin-bottom: 2rem; }
    .camera-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #064E3B; margin-bottom: 1rem; }
    
    .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: #10B981; top: 50%; box-shadow: 0 0 10px #10B981; animation: scanning 2s linear infinite; }
    
    .manual-input { display: flex; flex-direction: column; gap: 1rem; }
    .manual-input span { color: #6B7280; font-size: 0.875rem; font-weight: 500; }
    
    .input-group { display: flex; gap: 0.5rem; }
    .input-group input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #D1D5DB; border-radius: 8px; outline: none; }
    .btn-verify { background: #064E3B; color: white; border: none; padding: 0 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-verify:disabled { opacity: 0.65; cursor: not-allowed; }

    .validation-result { margin-top: 1rem; padding: 1rem 1.25rem; border-radius: 10px; font-weight: 600; }
    .validation-result.success { background: #DCFCE7; color: #166534; }
    .validation-result.error { background: #FEE2E2; color: #B91C1C; }

    @keyframes scanning {
      0% { top: 20%; }
      50% { top: 80%; }
      100% { top: 20%; }
    }
  `]
})
export class ValidatePage {
  private agentService = inject(AgentService);

  validationCode = signal('');
  isValidating = signal(false);
  resultMessage = signal<string | null>(null);
  validationSuccess = signal(false);

  verifyCode() {
    if (!this.validationCode()) {
      this.resultMessage.set('Veuillez entrer un code avant de vérifier.');
      this.validationSuccess.set(false);
      return;
    }

    this.isValidating.set(true);
    this.resultMessage.set(null);

    this.agentService.validateTicket(this.validationCode())
      .pipe(catchError((err: any) => {
        console.error('Validation error:', err);
        return of({ statut: false, message: err.error?.message || 'Impossible de contacter le serveur.' });
      }))
      .subscribe((result: any) => {
        this.validationSuccess.set(!!result?.statut);
        this.resultMessage.set(result?.message || (result?.statut ? 'Ticket validé avec succès.' : 'Code invalide.'));
        this.isValidating.set(false);
      });
  }
}
