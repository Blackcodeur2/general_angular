import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Tableau de bord Agent</h1>
        <p class="subtitle">Bienvenue sur votre espace de gestion des ventes</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>point_of_sale</mat-icon></div>
          <div class="stat-info">
            <h3>Ventes du jour</h3>
            <p class="value">24</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>confirmation_number</mat-icon></div>
          <div class="stat-info">
            <h3>Réservations actives</h3>
            <p class="value">12</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
          <div class="stat-info">
            <h3>Chiffre d'affaire</h3>
            <p class="value">450,000 FCFA</p>
          </div>
        </div>
      </div>

      <section class="recent-actions">
        <h2>Actions Rapides</h2>
        <div class="actions-grid">
          <button class="action-btn primary">
            <mat-icon>add_shopping_cart</mat-icon>
            <span>Nouvelle Vente</span>
          </button>
          <button class="action-btn secondary">
            <mat-icon>qr_code_scanner</mat-icon>
            <span>Valider Ticket</span>
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { animation: fadeIn 0.5s ease-out; }
    .page-header h1 { color: #111827; font-size: 1.875rem; font-weight: 700; margin-bottom: 0.25rem; }
    .subtitle { color: #6B7280; margin-bottom: 2rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; }
    .stat-icon { width: 48px; height: 48px; background: #ECFDF5; color: #10B981; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .stat-info h3 { font-size: 0.875rem; color: #6B7280; font-weight: 500; margin-bottom: 0.25rem; }
    .stat-info .value { font-size: 1.5rem; font-weight: 700; color: #111827; }

    .recent-actions h2 { font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1rem; }
    .actions-grid { display: flex; gap: 1rem; }
    .action-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .action-btn:hover { transform: translateY(-2px); }
    .action-btn.primary { background: #064E3B; color: white; }
    .action-btn.secondary { background: white; color: #064E3B; border: 1px solid #064E3B; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StaffDashboardPage {}
