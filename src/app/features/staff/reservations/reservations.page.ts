import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, MatIconModule, PaginationComponent],
  template: `
    <div class="reservations-page">
      <header class="page-header">
        <h1>Historique des Réservations</h1>
        <p>Consultez et gérez les réservations effectuées</p>
      </header>

      <div class="table-container">
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
                <td>{{ res.client }}</td>
                <td>{{ res.voyage }}</td>
                <td>{{ res.date }}</td>
                <td><span class="status-badge" [class]="res.status">{{ res.statusLabel }}</span></td>
                <td>
                  <button class="icon-btn" title="Imprimer"><mat-icon>print</mat-icon></button>
                  <button class="icon-btn delete" title="Annuler"><mat-icon>cancel</mat-icon></button>
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

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ReservationsPage {
  // Mock data extended for pagination
  reservations = signal([
    { id: 1024, client: 'Jean Dupont', voyage: 'Ydé -> DLA', date: '21/03/2026', status: 'confirmed', statusLabel: 'Confirmé' },
    { id: 1025, client: 'Marie Mbarga', voyage: 'DLA -> Ydé', date: '22/03/2026', status: 'pending', statusLabel: 'En attente' },
    { id: 1026, client: 'Paul Atangana', voyage: 'Ydé -> Baf', date: '23/03/2026', status: 'confirmed', statusLabel: 'Confirmé' },
    { id: 1027, client: 'Alice Bella', voyage: 'Baf -> Ydé', date: '23/03/2026', status: 'confirmed', statusLabel: 'Confirmé' },
    { id: 1028, client: 'Kevin Kamga', voyage: 'Ydé -> DLA', date: '24/03/2026', status: 'pending', statusLabel: 'En attente' },
    { id: 1029, client: 'Lucie Ngo', voyage: 'DLA -> Kribi', date: '24/03/2026', status: 'confirmed', statusLabel: 'Confirmé' },
    { id: 1030, client: 'Samuel Eto', voyage: 'Kribi -> DLA', date: '25/03/2026', status: 'confirmed', statusLabel: 'Confirmé' },
    { id: 1031, client: 'Marc Owona', voyage: 'Ydé -> Nga', date: '25/03/2026', status: 'pending', statusLabel: 'En attente' },
    { id: 1032, client: 'Sophie Tcha', voyage: 'Nga -> Ydé', date: '26/03/2026', status: 'confirmed', statusLabel: 'Confirmé' },
    { id: 1033, client: 'Ibrahim Diallo', voyage: 'Ydé -> Maroua', date: '27/03/2026', status: 'confirmed', statusLabel: 'Confirmé' }
  ]);

  currentPage = signal(1);
  pageSize = signal(4);

  paginatedReservations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.reservations().slice(start, end);
  });
}
