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
        <h1>Historique des Réservations</h1>
        <p>Consultez et gérez les réservations enregistrées par l'agent.</p>
      </header>

      <div *ngIf="isLoading()" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des réservations...</p>
      </div>

      <div *ngIf="!isLoading()" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Voyage</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              @for (res of paginatedReservations(); track res.id) {
                <tr>
                  <td>#{{ res.id }}</td>
                  <td>{{ (res.user?.prenom ? (res.user.prenom + ' ' + res.user.nom) : (res.client?.prenom ? (res.client.prenom + ' ' + res.client.nom) : res.client_name)) || 'N/A' }}</td>
                  <td>{{ res.voyage?.trajet?.gare_depart?.ville ? (res.voyage.trajet.gare_depart.ville + ' → ' + res.voyage.trajet.gare_arrivee.ville) : (res.voyage?.ville_depart ? (res.voyage.ville_depart + ' → ' + res.voyage.ville_arrivee) : res.route_name || 'N/A') }}</td>
                  <td>{{ res.date || res.voyage?.date_depart || 'N/A' }}</td>
                  <td><span class="status-badge" [class]="res.statut || res.status">{{ res.statut || res.statusLabel || res.status || 'Inconnu' }}</span></td>
                <td>
                  <button class="icon-btn" title="Imprimer" (click)="printReservation(res.id)"><mat-icon>print</mat-icon></button>
                  <button class="icon-btn delete" title="Annuler" (click)="cancelReservation(res.id)"><mat-icon>cancel</mat-icon></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
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
    .reservations-page { animation: fadeIn 0.4s ease-in; max-width: 1100px; margin: 0 auto; padding: 1rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.75rem; font-weight: 800; color: #111827; margin: 0 0 0.5rem 0; }
    .page-header p { color: #6B7280; font-size: 0.95rem; margin: 0; }
    
    .table-container { background: white; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 1.25rem 1.5rem; background: #F9FAFB; font-size: 0.75rem; font-weight: 600; color: #6B7280; border-bottom: 1px solid #E5E7EB; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { padding: 1.25rem 1.5rem; font-size: 0.9rem; color: #374151; border-bottom: 1px solid #F3F4F6; }
    
    .status-badge { padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; }
    .status-badge.confirmed { background: #DCFCE7; color: #166534; }
    .status-badge.pending { background: #FEF3C7; color: #92400E; }
    
    .icon-btn { background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 6px; border-radius: 8px; transition: all 0.2s; margin-right: 0.5rem; }
    .icon-btn:hover { background: #EEF2FF; color: #3B82F6; }
    .icon-btn.delete:hover { background: #FEF2F2; color: #EF4444; }

    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; color: #6B7280; }
    .spinner { width: 35px; height: 35px; border: 3px solid #E5E7EB; border-top: 3px solid #3B82F6; border-radius: 50%; animation: spin 1s linear infinite; }

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
