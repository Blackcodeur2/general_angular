import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AgentService } from '../../../services/agent/agent.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Tableau de bord Agent</h1>
        <p class="subtitle">Suivez en temps réel vos ventes et validations</p>
      </header>

      <div *ngIf="isLoading()" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des performances...</p>
      </div>

      <div *ngIf="!isLoading()" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>point_of_sale</mat-icon></div>
          <div class="stat-info">
            <h3>Ventes du jour</h3>
            <p class="value">{{ stats().salesToday }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>confirmation_number</mat-icon></div>
          <div class="stat-info">
            <h3>Réservations actives</h3>
            <p class="value">{{ stats().activeReservations }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
          <div class="stat-info">
            <h3>Chiffre d'affaire</h3>
            <p class="value">{{ stats().revenueToday | number }} FCFA</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>verified</mat-icon></div>
          <div class="stat-info">
            <h3>Validations en attente</h3>
            <p class="value">{{ stats().pendingValidations }}</p>
          </div>
        </div>
      </div>

      <section class="recent-actions">
        <h2>Actions Rapides</h2>
        <div class="actions-grid">
          <button class="action-btn primary" (click)="navigateTo('/agent/booking')">
            <mat-icon>add_shopping_cart</mat-icon>
            <span>Nouvelle Vente</span>
          </button>
          <button class="action-btn secondary" (click)="navigateTo('/agent/validate')">
            <mat-icon>qr_code_scanner</mat-icon>
            <span>Valider Ticket</span>
          </button>
          <button class="action-btn secondary" (click)="navigateTo('/agent/reservations')">
            <mat-icon>history</mat-icon>
            <span>Historique</span>
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { animation: fadeIn 0.5s ease-out; }
    .page-header h1 { color: #111827; font-size: 1.875rem; font-weight: 700; margin-bottom: 0.25rem; }
    .subtitle { color: #6B7280; margin-bottom: 2rem; }

    .loading-state { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1rem; padding: 4rem 0; }
    .spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top: 4px solid #047857; border-radius: 50%; animation: spin 1s linear infinite; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; }
    .stat-icon { width: 48px; height: 48px; background: #ECFDF5; color: #10B981; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .stat-info h3 { font-size: 0.875rem; color: #6B7280; font-weight: 500; margin-bottom: 0.25rem; }
    .stat-info .value { font-size: 1.5rem; font-weight: 700; color: #111827; }

    .recent-actions h2 { font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1rem; }
    .actions-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
    .action-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .action-btn:hover { transform: translateY(-2px); }
    .action-btn.primary { background: #064E3B; color: white; }
    .action-btn.secondary { background: white; color: #064E3B; border: 1px solid #064E3B; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class StaffDashboardPage implements OnInit {
  private agentService = inject(AgentService);
  private router = inject(Router);

  isLoading = signal(true);
  stats = signal({ salesToday: 0, activeReservations: 0, revenueToday: 0, pendingValidations: 0 });

  ngOnInit() {
    this.loadStats();
  }

  navigateTo(path: string) {
    void this.router.navigate([path]);
  }

  private loadStats() {
    this.agentService.getDashboardStats()
      .pipe(catchError((err: any) => {
        console.error('Error loading dashboard stats:', err);
        return of({ sales_today: 0, active_reservations: 0, revenue_today: 0, pending_validations: 0 });
      }))
      .subscribe((data: any) => {
        this.stats.set({
          salesToday: data.sales_today || 0,
          activeReservations: data.active_reservations || 0,
          revenueToday: data.revenue_today || 0,
          pendingValidations: data.pending_validations || 0
        });
        this.isLoading.set(false);
      });
  }
}
