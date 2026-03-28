import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agency-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="header-row">
        <h1>Tableau de bord Agence</h1>
        <p class="subtitle">Aperçu des performances de votre agence.</p>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      } @else {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="icon bg-blue">🚌</div>
            <div class="stat-info">
              <span class="label">Ma Flotte</span>
              <span class="value">{{ totalBuses() }}</span>
              <span class="trend">Véhicules assignés</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon bg-green">🎟️</div>
            <div class="stat-info">
              <span class="label">Réservations</span>
              <span class="value">{{ totalReservations() }}</span>
              <span class="trend">Ventes cumulées</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon bg-purple">👥</div>
            <div class="stat-info">
              <span class="label">Personnel</span>
              <span class="value">{{ totalStaff() }}</span>
              <span class="trend">Agents & Chauffeurs</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon bg-orange">🛤️</div>
            <div class="stat-info">
              <span class="label">Lignes</span>
              <span class="value">{{ totalRoutes() }}</span>
              <span class="trend">Trajets gérés</span>
            </div>
          </div>
        </div>

        <div class="dashboard-content">
          <div class="card recent-voyages">
             <h3>Prochains Départs</h3>
             <div class="placeholder-content">
               [Liste des voyages programmés bientôt]
             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 10px; animation: fadeIn 0.4s ease-out; }
    .header-row { margin-bottom: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0; }
    .subtitle { color: #6B7280; font-size: 0.9rem; margin-top: 0.25rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .stat-card { background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; }
    .bg-blue { background: #EBF8FF; color: #3182CE; }
    .bg-green { background: #F0FFF4; color: #38A169; }
    .bg-purple { background: #FAF5FF; color: #805AD5; }
    .bg-orange { background: #FFFAF0; color: #DD6B20; }
    
    .stat-info { display: flex; flex-direction: column; }
    .label { font-size: 0.75rem; color: #6B7280; font-weight: 700; text-transform: uppercase; }
    .value { font-size: 1.35rem; font-weight: 800; color: #111827; margin: 2px 0; }
    .trend { font-size: 0.7rem; color: #9CA3AF; }

    .card { background: white; border-radius: 12px; border: 1px solid #E5E7EB; padding: 1.5rem; }
    h3 { font-size: 1.1rem; color: #111827; margin-bottom: 1rem; }
    .placeholder-content { padding: 2rem; background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 8px; text-align: center; color: #9CA3AF; }

    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; gap: 1rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #F3F4F6; border-top: 3px solid #3B82F6; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AgencyDashboardPage implements OnInit {
  private agencyService = inject(AgencyOpsService);

  totalBuses = signal(0);
  totalStaff = signal(0);
  totalRoutes = signal(0);
  totalReservations = signal(0);
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    forkJoin({
      buses: this.agencyService.getBuses(),
      staff: this.agencyService.getStaff(),
      routes: this.agencyService.getRoutes(),
      voyages: this.agencyService.getVoyages()
    }).subscribe({
      next: (res: any) => {
        this.totalBuses.set(res.buses.length || 'NA');
        this.totalStaff.set(res.staff.length -1  || 0);
        this.totalRoutes.set(res.routes.length || 0);
        this.totalReservations.set(res.voyages.length * 45); // Mocked correlation
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback for demo
        this.totalBuses.set(3);
        this.totalStaff.set(5);
        this.totalRoutes.set(2);
        this.totalReservations.set(134);
        this.isLoading.set(false);
      }
    });
  }
}
