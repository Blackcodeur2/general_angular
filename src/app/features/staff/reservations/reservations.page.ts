import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { AgentService } from '../../../services/agent/agent.service';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../services/agent/ticket.service';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, MatIconModule, PaginationComponent],
  template: `
    <div class="reservations-page">
      <header class="page-header">
        <div class="header-content">
          <h1>Historique des Réservations</h1>
          <p>Consultez et gérez les réservations enregistrées par l'agence.</p>
        </div>
        <div class="stats-mini">
          <div class="stat-item">
            <span class="label">Total</span>
            <span class="value">{{ reservations().length }}</span>
          </div>
        </div>
      </header>

      <div *ngIf="isLoading()" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des réservations...</p>
      </div>

      <div *ngIf="!isLoading()" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Voyage / Bus</th>
              <th>Siège</th>
              <th>Prix</th>
              <th>Date Dédiée</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              @for (res of paginatedReservations(); track res.id) {
                <tr class="res-row">
                  <td class="ref-cell">
                    <span class="ref-text">{{ res.num_reservation || ('#' + res.id) }}</span>
                  </td>
                  <td>
                    <div class="client-info">
                      <span class="name">{{ (res.user?.prenom ? (res.user.prenom + ' ' + res.user.nom) : (res.client?.prenom ? (res.client.prenom + ' ' + res.client.nom) : res.client_name)) || 'N/A' }}</span>
                      <span class="phone">
                        <mat-icon>phone</mat-icon>
                        {{ res.user?.telephone || res.client?.telephone || 'Non fourni' }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="voyage-info">
                      <span class="trip-id">{{ res.voyage?.num_voyage || 'N/A' }}</span>
                      <span class="bus-tag">
                        <mat-icon>directions_bus</mat-icon>
                        {{ res.voyage?.bus?.immatriculation || 'Express' }}
                      </span>
                    </div>
                  </td>
                  <td class="center">
                    <span class="seat-badge">{{ res.place || '--' }}</span>
                  </td>
                  <td class="price-cell">
                    <span class="amount">{{ res.prix | number:'1.0-0' }}</span>
                    <span class="currency">FCFA</span>
                  </td>
                  <td class="date-cell">
                    {{ (res.date || res.voyage?.date_depart) | date:'dd MMM yyyy, HH:mm' }}
                  </td>
                  <td>
                    <span class="status-badge" [class]="res.statut || res.status">
                      <mat-icon class="status-icon" *ngIf="res.statut === 'validee' || res.status === 'validee'">check_circle</mat-icon>
                      <mat-icon class="status-icon" *ngIf="res.statut === 'annule' || res.status === 'annule'">cancel</mat-icon>
                      <mat-icon class="status-icon" *ngIf="res.statut === 'en attente' || res.status === 'en attente'">schedule</mat-icon>
                      {{ res.statut || res.statusLabel || res.status || 'Inconnu' }}
                    </span>
                  </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn print" title="Imprimer le ticket" (click)="printReservation(res.id)">
                      <mat-icon>print</mat-icon>
                    </button>
                    <button class="action-btn cancel" *ngIf="res.statut !== 'annule'" title="Annuler la réservation" (click)="cancelReservation(res.id)">
                      <mat-icon>block</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        
        <div *ngIf="reservations().length === 0" class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <p>Aucune réservation trouvée.</p>
        </div>
      </div>

      <gev-pagination 
        [totalItems]="reservations().length" 
        [pageSize]="pageSize()" 
        [currentPage]="currentPage()"
        (pageChange)="currentPage.set($event)">
      </gev-pagination>
    </div>
  `,
  styles: [`
    .reservations-page { animation: fadeIn 0.4s ease-in; max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.85rem; font-weight: 850; color: #1e293b; margin: 0 0 0.5rem 0; letter-spacing: -0.025em; }
    .page-header p { color: #64748b; font-size: 1rem; margin: 0; }

    .stats-mini { background: white; padding: 0.75rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .stat-item { display: flex; flex-direction: column; align-items: center; }
    .stat-item .label { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; }
    .stat-item .value { font-size: 1.25rem; font-weight: 800; color: #2563eb; }
    
    .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    
    .data-table th { padding: 1rem 1.25rem; background: #f8fafc; font-size: 0.7rem; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { padding: 1.25rem; font-size: 0.9rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    
    .res-row:hover { background-color: #f8fafc; }
    
    .ref-cell { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #2563eb; font-size: 0.85rem; }
    
    .client-info, .voyage-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .client-info .name { font-weight: 700; color: #1e293b; }
    .client-info .phone, .voyage-info .bus-tag { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #64748b; }
    .client-info .phone mat-icon, .voyage-info .bus-tag mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #94a3b8; }
    
    .trip-id { font-weight: 600; color: #334155; }
    .bus-tag { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; width: fit-content; }
    
    .seat-badge { background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.85rem; border: 1px solid #dbeafe; }
    
    .price-cell .amount { font-weight: 800; color: #1e293b; font-size: 1rem; }
    .price-cell .currency { font-size: 0.65rem; font-weight: 700; color: #94a3b8; margin-left: 0.25rem; }
    
    .date-cell { font-size: 0.8rem; color: #64748b; line-height: 1.4; }
    
    .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 6px 12px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
    .status-badge .status-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    
    .status-badge.validee { background: #dcfce7; color: #15803d; }
    .status-badge.annule { background: #fee2e2; color: #b91c1c; }
    .status-badge.en.attente { background: #fef9c3; color: #854d0e; }
    
    .action-buttons { display: flex; gap: 0.5rem; }
    .action-btn { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 0.5rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .action-btn:hover { border-color: #cbd5e1; background: #f8fafc; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .action-btn.print:hover { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
    .action-btn.cancel:hover { color: #dc2626; border-color: #fecaca; background: #fef2f2; }
    .action-btn mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }

    .empty-state { padding: 4rem; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }

    .center { text-align: center; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 6rem 0; color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top: 3px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ReservationsPage implements OnInit {
  private agentService = inject(AgentService);
  private agencyService = inject(AgencyOpsService);
  private authService = inject(AuthService);
  private ticketService = inject(TicketService);

  reservations = signal<any[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  pageSize = signal(6);

  paginatedReservations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.reservations().slice(start, end);
  });

  ngOnInit() {
    this.loadReservations();
  }

  private loadReservations() {
    const role = this.authService.currentUser()?.role_user;
    const request = role === 'CHEF_AGENCE' 
      ? this.agencyService.getReservations() 
      : this.agentService.getReservations();

    request.pipe(catchError((err: any) => {
        console.error('Error loading reservations:', err);
        return of([]);
      }))
      .subscribe((data: any[]) => {
        this.reservations.set(data);
        this.isLoading.set(false);
      });
  }

  cancelReservation(id: number) {
    Swal.fire({
      title: 'Annuler la réservation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Fermer'
    }).then((result: any) => {
      if (result.isConfirmed) {
        const role = this.authService.currentUser()?.role_user;
        const request = role === 'CHEF_AGENCE'
          ? this.agencyService.cancelReservation(id)
          : this.agentService.cancelReservation(id);

        request.subscribe({
          next: () => {
            this.reservations.update((list: any[]) => list.filter((r: any) => r.id !== id));
            Swal.fire('Annulée !', 'La réservation a été annulée.', 'success');
          },
          error: (err: any) => {
            Swal.fire('Erreur', err.error?.message || 'Impossible d\'annuler la réservation.', 'error');
          }
        });
      }
    });
  }

  printReservation(id: number) {
    this.ticketService.openTicket(id);
  }
}
