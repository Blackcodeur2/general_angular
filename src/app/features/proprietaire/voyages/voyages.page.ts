import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProprietaireService } from '../../../services/proprietaire/proprietaire.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voyages',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './voyages.page.html',
  styleUrls: ['./voyages.page.css']
})
export class VoyagesPage implements OnInit {
  private proprietaireService = inject(ProprietaireService);

  voyages = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadVoyages();
  }

  loadVoyages() {
    this.isLoading.set(true);
    this.proprietaireService.getMyVoyages().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data as any).data ?? [];
        this.voyages.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('Erreur', 'Impossible de charger les voyages.', 'error');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PLANIFIE':
        return 'status-planned';
      case 'EN_COURS':
        return 'status-ongoing';
      case 'TERMINE':
        return 'status-completed';
      case 'ANNULE':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }
}
