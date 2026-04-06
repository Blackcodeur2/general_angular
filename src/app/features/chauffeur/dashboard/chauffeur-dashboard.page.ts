import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VoyageService } from '../../../services/chauffeur/voyage.service';
import { Voyage } from '../../../models/voyage';

@Component({
  selector: 'app-chauffeur-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="dashboard">
      <header class="welcome">
        <h2>Mon Programme</h2>
        <p>Aujourd'hui, {{ today | date:'dd MMMM yyyy' }}</p>
      </header>

      <div class="next-trip" *ngIf="nextTrip">
        <div class="card-header">
          <span class="badge">PROCHAIN DEPART</span>
          <span class="time">{{ nextTrip.heure_depart }}</span>
        </div>
        <div class="route">
          <div class="city">
            <span class="label">Départ</span>
            <span class="name">{{ nextTrip.ville_depart }}</span>
          </div>
          <mat-icon>trending_flat</mat-icon>
          <div class="city">
            <span class="label">Arrivée</span>
            <span class="name">{{ nextTrip.ville_arrivee }}</span>
          </div>
        </div>
        <div class="trip-footer">
          <span><mat-icon>directions_bus</mat-icon> {{ nextTrip.vehicule_immatriculation }}</span>
          <button class="btn-start">Démarrer le voyage</button>
        </div>
      </div>

      <section class="upcoming">
        <h3>Voyages à venir</h3>
        <div class="trip-list">
          <div class="trip-item" *ngFor="let voyage of upcomingVoyages">
            <div class="trip-info">
              <span class="trip-time">{{ voyage.heure_depart }}</span>
              <span class="trip-route">{{ voyage.ville_depart }} -> {{ voyage.ville_arrivee }}</span>
            </div>
            <mat-icon>chevron_right</mat-icon>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.5rem; }
    .welcome h2 { font-size: 1.5rem; color: #1E293B; font-weight: 800; margin-bottom: 0.25rem; }
    .welcome p { color: #64748B; font-size: 0.9rem; }

    .next-trip { background: #1E293B; color: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .badge { background: #3B82F6; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
    .time { font-size: 1.25rem; font-weight: 700; }
    
    .route { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .city { display: flex; flex-direction: column; }
    .label { font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; }
    .name { font-size: 1.1rem; font-weight: 600; }
    
    .trip-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; }
    .trip-footer span { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #CBD5E1; }
    .btn-start { background: #10B981; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

    .upcoming h3 { font-size: 1.1rem; color: #1E293B; margin-bottom: 1rem; }
    .trip-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .trip-item { background: white; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #E2E8F0; }
    .trip-info { display: flex; flex-direction: column; gap: 2px; }
    .trip-time { font-weight: 700; color: #1E293B; }
    .trip-route { color: #64748B; font-size: 0.85rem; }
  `]
})
export class ChauffeurDashboardPage implements OnInit {
  private voyageService = inject(VoyageService);
  today = new Date();
  
  nextTrip?: Voyage;
  upcomingVoyages: Voyage[] = [];

  ngOnInit() {
    // Mock data for demonstration if API fails or not yet populated
    this.nextTrip = {
      id: 1,
      chauffeur_id: 1,
      vehicule_immatriculation: 'LT 123 AA',
      ville_depart: 'Yaoundé',
      ville_arrivee: 'Douala',
      date_depart: '2026-03-21',
      heure_depart: '14:30',
      statut: 'PROGRAMME'
    };

    this.upcomingVoyages = [
      { id: 2, chauffeur_id: 1, vehicule_immatriculation: 'LT 123 AA', ville_depart: 'Douala', ville_arrivee: 'Yaoundé', date_depart: '2026-03-22', heure_depart: '08:00', statut: 'PROGRAMME' },
      { id: 3, chauffeur_id: 1, vehicule_immatriculation: 'LT 123 AA', ville_depart: 'Yaoundé', ville_arrivee: 'Bafoussam', date_depart: '2026-03-22', heure_depart: '16:00', statut: 'PROGRAMME' }
    ];
  }
}
