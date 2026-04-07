import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgentService } from '../../../services/agent/agent.service';
import { catchError, of } from 'rxjs';
import { Route } from '../../../models/route';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="booking-page">
      <header class="page-header">
        <h1>Nouvelle Vente / Réservation</h1>
        <p>Enregistrez rapidement un ticket et envoyez la confirmation au client.</p>
      </header>

      <div class="booking-card">
        <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="booking-form">
          <div class="form-section">
            <h3>Informations du Voyage</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Trajet</label>
                <select formControlName="route_id" class="form-control">
                  <option value="">Sélectionnez un trajet</option>
                  <option *ngFor="let route of routes()" [value]="route.id">{{ route.depart }} → {{ route.arrivee }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" formControlName="date" class="form-control">
              </div>
              <div class="form-group">
                <label>Heure</label>
                <select formControlName="time" class="form-control">
                  <option value="">Sélectionnez l'heure</option>
                  <option *ngFor="let item of availableTimes" [value]="item">{{ item }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Informations Client</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nom complet</label>
                <input type="text" formControlName="clientName" class="form-control" placeholder="Nom du client">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" formControlName="telephone" class="form-control" placeholder="Ex: 6XXXXXXXX">
              </div>
              <div class="form-group">
                <label>CNI (Optionnel)</label>
                <input type="text" formControlName="cni" class="form-control" placeholder="Numéro de CNI">
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn-submit" [disabled]="bookingForm.invalid || submitting()">
              <mat-icon>confirmation_number</mat-icon>
              {{ submitting() ? 'Enregistrement...' : 'Générer le Ticket' }}
            </button>
          </div>

          <div class="form-message success" *ngIf="message() === 'success'">Réservation enregistrée avec succès.</div>
          <div class="form-message error" *ngIf="message() === 'error'">Impossible d’enregistrer la réservation, vérifiez votre connexion.</div>
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

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #6B7280; margin-bottom: 0.5rem; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
    .form-control:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }

    .form-footer { display: flex; justify-content: flex-end; padding-top: 1rem; }
    .btn-submit { background: #064E3B; color: white; border: none; padding: 0.875rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
    .btn-submit:hover:not(:disabled) { background: #065F46; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .form-message { margin-top: 1rem; font-size: 0.95rem; }
    .form-message.success { color: #047857; }
    .form-message.error { color: #B91C1C; }

    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class BookingPage implements OnInit {
  private agentService = inject(AgentService);
  private fb = inject(FormBuilder);

  routes = signal<Route[]>([]);
  submitting = signal(false);
  message = signal<'success' | 'error' | null>(null);

  bookingForm = this.fb.group({
    route_id: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    time: ['', Validators.required],
    clientName: ['', Validators.required],
    telephone: ['', [Validators.required, Validators.pattern('^6[0-9]{8}$')]],
    cni: ['']
  });

  availableTimes = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  ngOnInit() {
    this.loadRoutes();
  }

  submitBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.message.set(null);

    const payload = {
      route_id: this.bookingForm.value.route_id,
      date_depart: this.bookingForm.value.date,
      heure_depart: this.bookingForm.value.time,
      client_name: this.bookingForm.value.clientName,
      telephone: this.bookingForm.value.telephone,
      cni: this.bookingForm.value.cni
    };

    this.agentService.createBooking(payload).pipe(
      catchError(() => {
        this.message.set('error');
        this.submitting.set(false);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.message.set('success');
        this.bookingForm.reset({ date: new Date().toISOString().slice(0, 10), route_id: '', time: '', clientName: '', telephone: '', cni: '' });
      }
      this.submitting.set(false);
    });
  }

  private loadRoutes() {
    this.agentService.getRoutes().pipe(catchError(() => of([] as Route[]))).subscribe(routes => this.routes.set(routes));
  }
}
