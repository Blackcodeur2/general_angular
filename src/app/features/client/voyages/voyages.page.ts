import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClientVoyageService } from '../../../services/client/client-voyage.service';
import { Voyage } from '../../../models/voyage';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-voyages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './voyages.page.html',
  styleUrl: './voyages.page.css'
})
export class VoyagesPage implements OnInit {
  private fb = inject(FormBuilder);
  private voyageService = inject(ClientVoyageService);
  private router = inject(Router);

  // Signals
  voyages = signal<Voyage[]>([]);
  isLoading = signal<boolean>(false);
  
  searchForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadVoyages();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      villeDepart: [''],
      villeArrivee: [''],
      dateDepart: ['']
    });
  }

  loadVoyages(): void {
    this.isLoading.set(true);
    this.voyageService.getAvailableVoyages().subscribe({
      next: (voyages) => {
        this.voyages.set(voyages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des voyages:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    const { villeDepart, villeArrivee, dateDepart } = this.searchForm.value;
    
    // If all fields are empty, load all
    if (!villeDepart && !villeArrivee && !dateDepart) {
      this.loadVoyages();
      return;
    }

    this.isLoading.set(true);
    this.voyageService.searchVoyages(villeDepart, villeArrivee, dateDepart).subscribe({
      next: (voyages) => {
        this.voyages.set(voyages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la recherche:', err);
        this.isLoading.set(false);
      }
    });
  }

  onViewDetails(voyageId: number): void {
    this.router.navigate(['/client/voyage-details', voyageId]);
  }

  onReserve(voyage: Voyage): void {
    this.router.navigate(['/client/new-reservation', voyage.id]);
  }

  getAvailabilityPercentage(voyage: Voyage): number {
    if (!voyage.bus || !voyage.places_disponibles) return 0;
    const total = voyage.bus.nb_places || 1;
    const occupied = total - (voyage.places_disponibles || 0);
    return (occupied / total) * 100;
  }

  getStatutClass(statut: string): string {
    return `statut-${(statut || '').toLowerCase().replace(' ', '-')}`;
  }
}
