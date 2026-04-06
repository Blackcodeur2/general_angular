import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'gev-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="pagination-container" *ngIf="totalItems() > pageSize()">
      <button 
        class="pagination-btn" 
        [disabled]="currentPage() === 1" 
        (click)="onPageChange(currentPage() - 1)"
        title="Précédent">
        <mat-icon>chevron_left</mat-icon>
      </button>

      <div class="page-numbers">
        @for (page of pages(); track page) {
          @if (page === -1) {
            <span class="ellipsis">...</span>
          } @else {
            <button 
              class="page-number-btn" 
              [class.active]="page === currentPage()"
              (click)="onPageChange(page)">
              {{ page }}
            </button>
          }
        }
      </div>

      <button 
        class="pagination-btn" 
        [disabled]="currentPage() === totalPages()" 
        (click)="onPageChange(currentPage() + 1)"
        title="Suivant">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.5rem 0;
      user-select: none;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      background: white;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background-color: #F3F4F6;
      border-color: #D1D5DB;
      color: #111827;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-number-btn {
      min-width: 36px;
      height: 36px;
      padding: 0 0.5rem;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: #6B7280;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .page-number-btn:hover {
      background-color: #F3F4F6;
      color: #111827;
    }

    .page-number-btn.active {
      background-color: #3B82F6;
      color: white;
      border-color: #3B82F6;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }

    .ellipsis {
      color: #9CA3AF;
      padding: 0 0.25rem;
    }
  `]
})
export class PaginationComponent {
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  currentPage = input<number>(1);
  pageChange = output<number>();

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push(-1); // Ellipsis

      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 3) pages.push(-1); // Ellipsis
      if (!pages.includes(total)) pages.push(total);
    }

    return pages;
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
