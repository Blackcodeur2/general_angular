import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VoyageService } from '../../../services/chauffeur/voyage.service';
import { Voyage } from '../../../models/voyage';
import Swal from 'sweetalert2';

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

      <div class="loading-state" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Chargement de votre programme...</p>
      </div>

      <div class="empty-state" *ngIf="!isLoading() && !nextTrip && upcomingVoyages.length === 0">
        <mat-icon class="large-icon">event_busy</mat-icon>
        <p>Aucun voyage prévu pour le moment.</p>
      </div>

      <div class="next-trip animate-fade-in" *ngIf="!isLoading() && nextTrip">
        <div class="card-header">
          <span class="badge">PROCHAIN DÉPART</span>
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
          <button class="btn-start" (click)="demarrerVoyage(nextTrip.id)" [disabled]="isProcessing()">
            {{ isProcessing() ? 'Traitement...' : 'Démarrer le voyage' }}
          </button>
        </div>
      </div>

      <section class="upcoming" *ngIf="!isLoading() && upcomingVoyages.length > 0">
        <h3>Voyages à venir</h3>
        <div class="trip-list">
          <div class="trip-item animate-in" *ngFor="let voyage of upcomingVoyages">
            <div class="trip-info">
              <span class="trip-time">{{ voyage.heure_depart }} ({{ voyage.date_depart | date:'dd/MM' }})</span>
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

    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: #64748B; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3B82F6; border-radius: 50%; animate: spin 1s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

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
    .btn-start { background: #10B981; color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-start:hover { background: #059669; transform: scale(1.02); }
    .btn-start:disabled { background: #64748B; opacity: 0.7; cursor: not-allowed; }

    .upcoming h3 { font-size: 1.1rem; color: #1E293B; margin-bottom: 1rem; }
    .trip-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .trip-item { background: white; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #E2E8F0; }
    .trip-info { display: flex; flex-direction: column; gap: 2px; }
    .trip-time { font-weight: 700; color: #1E293B; }
    .trip-route { color: #64748B; font-size: 0.85rem; }

    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ChauffeurDashboardPage implements OnInit {
  private voyageService = inject(VoyageService);
  today = new Date();
  
  isLoading = signal(true);
  isProcessing = signal(false);
  nextTrip?: Voyage;
  upcomingVoyages: Voyage[] = [];

  ngOnInit() {
    this.loadProgramme();
  }

  loadProgramme() {
    this.isLoading.set(true);
    this.voyageService.getProgrammeChauffeur().subscribe({
      next: (data) => {
        const sorted = data.sort((a,b) => new Date(a.date_depart).getTime() - new Date(b.date_depart).getTime());
        this.nextTrip = sorted.find(v => v.statut === 'en attente');
        this.upcomingVoyages = sorted.filter(v => v.id !== this.nextTrip?.id);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('Erreur', 'Impossible de charger votre programme', 'error');
      }
    });
  }

  demarrerVoyage(id: number) {
    Swal.fire({
      title: 'Démarrer le voyage ?',
      text: "Le statut du voyage passera 'En cours' et les passagers seront notifiés.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, démarrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10B981'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isProcessing.set(true);
        this.voyageService.updateVoyageStatus(id, 'en cours').subscribe({
          next: () => {
            this.isProcessing.set(false);
            Swal.fire('Voyage démarré !', 'Bonne route !', 'success');
            this.loadProgramme();
          },
          error: (err) => {
            this.isProcessing.set(false);
            Swal.fire('Erreur', err.error?.message || 'Action impossible', 'error');
          }
        });
      }
    });
  }
}
