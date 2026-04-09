import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientAgenceService } from '../../../services/client/client-agence.service';
import { Agence } from '../../../models/agence';

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

  agencies: Agence[] = [];
  filteredAgencies: Agence[] = [];
  searchTerm = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadAgencies();
  }

  loadAgencies(): void {
    this.isLoading = true;
    this.agenceService.getAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.filteredAgencies = agencies;
        // Charger les gares pour chaque agence
        agencies.forEach(agence => {
          this.agenceService.getAgencyGares(agence.id).subscribe({
            next: (gares) => {
              agence.gares = gares;
            },
            error: (err) => {
              console.error(`Erreur lors du chargement des gares pour l'agence ${agence.id}:`, err);
            }
          });
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des agences:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchAgency(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAgencies = this.agencies;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredAgencies = this.agencies.filter(agence =>
      agence.nom.toLowerCase().includes(term) ||
      agence.adresse.toLowerCase().includes(term) ||
      agence.email.toLowerCase().includes(term)
    );
  }

  onViewAgencyVoyages(agencyId: number): void {
    this.router.navigate(['/client/agence-voyages', agencyId]);
  }
}
