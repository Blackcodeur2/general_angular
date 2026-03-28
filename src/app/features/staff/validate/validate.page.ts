import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-validate',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="validate-page">
      <header class="page-header">
        <h1>Validation des Tickets</h1>
        <p>Scannez ou saisissez le code pour valider l'embarquement</p>
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
            <input type="text" placeholder="Entrer le code manuellement">
            <button class="btn-verify">Vérifier</button>
          </div>
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

    @keyframes scanning {
      0% { top: 20%; }
      50% { top: 80%; }
      100% { top: 20%; }
    }
  `]
})
export class ValidatePage {}
