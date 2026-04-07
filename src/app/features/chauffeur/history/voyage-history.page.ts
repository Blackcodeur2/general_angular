import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VoyageService } from '../../../services/chauffeur/voyage.service';
import { Voyage } from '../../../models/voyage';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-voyage-history',
  standalone: true,
  imports: [CommonModule, MatIconModule, PaginationComponent],
  template: `
    <div class="history">
      <header>
        <h2>Historique des Voyages</h2>
        <p>Liste de vos voyages terminés</p>
      </header>

      <div *ngIf="isLoading()" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement de l'historique...</p>
      </div>

      <div *ngIf="!isLoading()" class="history-list">
        @for (voyage of paginatedHistory(); track voyage.id) {
          <div class="history-card">
            <div class="date-badge">
              <span class="day">{{ voyage.date_depart | date:'dd' }}</span>
              <span class="month">{{ voyage.date_depart | date:'MMM' }}</span>
            </div>
            <div class="details">
              <div class="trip-path">{{ voyage.ville_depart }} -> {{ voyage.ville_arrivee }}</div>
              <div class="meta">
                <span><mat-icon>schedule</mat-icon> {{ voyage.heure_depart }}</span>
                <span><mat-icon>directions_bus</mat-icon> {{ voyage.vehicule_immatriculation }}</span>
              </div>
            </div>
            <div class="status-icon">
              <mat-icon class="check">check_circle</mat-icon>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <p>Aucun voyage dans l'historique.</p>
          </div>
        }
      </div>

      <gev-pagination 
        [totalItems]="history().length" 
        [pageSize]="pageSize()" 
        [currentPage]="currentPage()"
        (pageChange)="currentPage.set($event)">
      </gev-pagination>
    </div>
  `,
  styles: [`
    .history { display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px; margin: 0 auto; padding-bottom: 2rem; }
    header h2 { font-size: 1.5rem; color: #1E293B; font-weight: 800; margin: 0; }
    header p { color: #64748B; font-size: 0.9rem; margin: 0.25rem 0 0 0; }

    .history-list { display: flex; flex-direction: column; gap: 1rem; min-height: 400px; }
    .history-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1.25rem; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .history-card:hover { transform: scale(1.02); }
    
    .date-badge { background: #F8FAFC; border-radius: 12px; width: 56px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #F1F5F9; }
    .day { font-weight: 900; color: #334155; font-size: 1.25rem; line-height: 1; }
    .month { font-size: 0.7rem; color: #64748B; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
    
    .details { flex: 1; }
    .trip-path { font-weight: 800; color: #1E293B; margin-bottom: 0.35rem; font-size: 1rem; }
    .meta { display: flex; gap: 1.25rem; color: #64748B; font-size: 0.85rem; }
    .meta span { display: flex; align-items: center; gap: 6px; }
    .meta mat-icon { font-size: 16px; width: 16px; height: 16px; color: #94A3B8; }
    
    .status-icon .check { color: #10B981; font-size: 24px; width: 24px; height: 24px; }
    
    .loading-state { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1rem; padding: 4rem 0; color: #64748B; }
    .spinner { width: 40px; height: 40px; border: 4px solid #E2E8F0; border-top: 4px solid #10B981; border-radius: 50%; animation: spin 1s linear infinite; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: #94A3B8; }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 1rem; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VoyageHistoryPage implements OnInit {
  private voyageService = inject(VoyageService);
  
  history = signal<Voyage[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  pageSize = signal(4);

  paginatedHistory = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.history().slice(start, end);
  });

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.isLoading.set(true);
    this.voyageService.getHistoriqueChauffeur().subscribe({
      next: (data) => {
        this.history.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.history.set([]);
      }
    });
  }
}
