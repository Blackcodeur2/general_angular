import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProprietaireService } from '../../../services/proprietaire/proprietaire.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buses',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './buses.page.html',
  styleUrls: ['./buses.page.css']
})
export class BusesPage implements OnInit {
  private proprietaireService = inject(ProprietaireService);

  buses = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadBuses();
  }

  loadBuses() {
    this.isLoading.set(true);
    this.proprietaireService.getMyBuses().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data as any).data ?? [];
        this.buses.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('Erreur', 'Impossible de charger les bus.', 'error');
      }
    });
  }
}
