import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientAgenceService } from '../../../services/client/client-agence.service';
import { Agence } from '../../../models/agence';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-agences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agences.page.html',
  styleUrl: './agences.page.css'
})
export class AgencesPage implements OnInit {
  private agenceService = inject(ClientAgenceService);
  private router = inject(Router);

  // States using Signals
  agencies = signal<Agence[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);

  // Derived filtered list
  filteredAgencies = computed(() => {
    const list = this.agencies();
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return list;

    return list.filter(agence =>
      agence.nom?.toLowerCase().includes(term) ||
      agence.adresse?.toLowerCase().includes(term) ||
      agence.email?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadAgencies();
  }

  loadAgencies(): void {
    this.isLoading.set(true);
    this.agenceService.getAgencies().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => {
        console.log('Agencies loaded:', data);
        this.agencies.set(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des agences:', err);
      }
    });
  }

  onViewAgencyVoyages(agencyId: number): void {
    this.router.navigate(['/client/agence-voyages', agencyId]);
  }
}
