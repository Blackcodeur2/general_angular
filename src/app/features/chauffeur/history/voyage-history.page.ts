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
    <div class="history-container">
      <header class="page-header animate-fade-in">
        <h2 class="title">Vos Archives</h2>
        <p class="subtitle">Récapitulatif de vos missions terminées</p>
      </header>

      <div *ngIf="isLoading()" class="loading-state">
        <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
      </div>

      <div *ngIf="!isLoading()" class="history-list">
        <div class="history-card animate-in" *ngFor="let voyage of paginatedHistory(); let i = index" [style.animation-delay]="(i * 0.1) + 's'">
          <div class="card-main">
            <div class="date-box">
              <span class="day">{{ voyage.date_depart | date:'dd' }}</span>
              <span class="month">{{ voyage.date_depart | date:'MMM' }}</span>
            </div>
            <div class="trip-content">
              <div class="path">
                {{ voyage.ville_depart }} 
                <mat-icon>trending_flat</mat-icon>
                {{ voyage.ville_arrivee }}
              </div>
              <div class="meta-grid">
                <div class="meta-item">
                  <mat-icon>schedule</mat-icon>
                  {{ voyage.heure_depart }}
                </div>
                <div class="meta-item">
                  <mat-icon>directions_bus</mat-icon>
                  {{ voyage.vehicule_immatriculation }}
                </div>
              </div>
            </div>
            <div class="status-badge">
              <mat-icon>check_circle</mat-icon>
            </div>
          </div>
          <div class="card-footer">
            <span class="trip-id">ID: {{ voyage.num_voyage }}</span>
            <button class="detail-btn">Détails <mat-icon>chevron_right</mat-icon></button>
          </div>
        </div>

        <div class="empty-state animate-fade-in" *ngIf="history().length === 0">
          <div class="empty-illustration">
            <mat-icon>history_toggle_off</mat-icon>
          </div>
          <h3>Aucun archive</h3>
          <p>Vos voyages terminés apparaîtront ici.</p>
        </div>
      </div>

      <div class="pagination-wrapper" *ngIf="history().length > pageSize()">
        <gev-pagination 
          [totalItems]="history().length" 
          [pageSize]="pageSize()" 
          [currentPage]="currentPage()"
          (pageChange)="currentPage.set($event)">
        </gev-pagination>
      </div>
    </div>
  `,
  styles: [`
    :host { --primary: #3B82F6; --success: #10B981; --slate: #1E293B; --gray: #64748B; --bg-card: #FFFFFF; }

    .history-container { display: flex; flex-direction: column; gap: 1.5rem; }

    .page-header { margin-bottom: 0.5rem; }
    .title { font-size: 1.5rem; font-weight: 800; color: var(--slate); margin: 0; }
    .subtitle { font-size: 0.85rem; color: var(--gray); margin-top: 4px; }

    .history-list { display: flex; flex-direction: column; gap: 1rem; }

    .history-card { 
      background: var(--bg-card); border-radius: 24px; border: 1px solid #E2E8F0;
      overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    
    .card-main { padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
    
    .date-box { 
      background: #F8FAFC; border-radius: 16px; width: 54px; height: 54px; 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 1px solid #F1F5F9; flex-shrink: 0;
    }
    .date-box .day { font-weight: 800; color: var(--slate); font-size: 1.2rem; line-height: 1; }
    .date-box .month { font-size: 0.65rem; font-weight: 800; color: var(--gray); text-transform: uppercase; }

    .trip-content { flex: 1; }
    .path { 
      font-weight: 700; color: var(--slate); font-size: 0.95rem; 
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    }
    .path mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--gray); opacity: 0.6; }

    .meta-grid { display: flex; gap: 1rem; }
    .meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--gray); font-weight: 500; }
    .meta-item mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .status-badge { color: var(--success); }
    .status-badge mat-icon { font-size: 24px; width: 24px; height: 24px; }

    .card-footer { 
      background: #F8FAFC; padding: 0.75rem 1.25rem; display: flex; 
      justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9;
    }
    .trip-id { font-size: 0.7rem; font-weight: 700; color: var(--gray); font-family: monospace; }
    .detail-btn { 
      background: none; border: none; color: var(--primary); font-size: 0.75rem; 
      font-weight: 700; display: flex; align-items: center; gap: 2px; padding: 0; cursor: pointer;
    }

    .pagination-wrapper { margin-top: 1rem; padding-bottom: 2rem; }

    /* Empty & Loading States */
    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--gray); }
    .empty-illustration { width: 64px; height: 64px; background: #F1F5F9; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .empty-illustration mat-icon { font-size: 32px; width: 32px; height: 32px; }
    
    .skeleton-card { height: 120px; background: #F1F5F9; border-radius: 24px; margin-bottom: 1rem; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    .animate-in { animation: slideUp 0.5s ease-out both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
      next: (data: Voyage[]) => {
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
