import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="booking-page">
      <header class="page-header">
        <h1>Nouvelle Vente / Réservation</h1>
        <p>Vendez des tickets ou effectuez des réservations pour les clients</p>
      </header>

      <div class="booking-card">
        <form class="booking-form">
          <div class="form-section">
            <h3>Informations du Voyage</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Départ</label>
                <select class="form-control">
                  <option>Yaoundé</option>
                  <option>Douala</option>
                  <option>Bafoussam</option>
                </select>
              </div>
              <div class="form-group">
                <label>Destination</label>
                <select class="form-control">
                  <option>Douala</option>
                  <option>Yaoundé</option>
                  <option>Garoua</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" class="form-control">
              </div>
              <div class="form-group">
                <label>Heure</label>
                <select class="form-control">
                  <option>06:00</option>
                  <option>08:00</option>
                  <option>10:00</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Informations Client</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nom complet</label>
                <input type="text" class="form-control" placeholder="Nom du client">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" class="form-control" placeholder="Ex: 6XXXXXXXX">
              </div>
              <div class="form-group">
                <label>CNI (Optionnel)</label>
                <input type="text" class="form-control" placeholder="Numéro de CNI">
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn-submit">
              <mat-icon>confirmation_number</mat-icon>
              Générer le Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .booking-page { animation: slideIn 0.4s ease-out; }
    .page-header h1 { font-size: 1.75rem; font-weight: 700; color: #111827; }
    .booking-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; margin-top: 2rem; border: 1px solid #E5E7EB; }
    
    .form-section { margin-bottom: 2rem; }
    .form-section h3 { font-size: 1.1rem; font-weight: 600; color: #374151; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #F3F4F6; }
    
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #6B7280; margin-bottom: 0.5rem; }
    .form-control { width: 100%; padding: 0.625rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
    .form-control:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
    
    .form-footer { display: flex; justify-content: flex-end; padding-top: 1rem; }
    .btn-submit { background: #064E3B; color: white; border: none; padding: 0.875rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
    .btn-submit:hover { background: #065F46; }

    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class BookingPage {}
