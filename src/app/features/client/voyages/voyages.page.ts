import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientVoyageService } from '../../../services/client/client-voyage.service';
import { Voyage } from '../../../models/voyage';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-voyages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CapitalizePipe],
  templateUrl: './voyages.page.html',
  styleUrl: './voyages.page.css'
})
export class VoyagesPage implements OnInit {
  private fb = inject(FormBuilder);
  private voyageService = inject(ClientVoyageService);
  private router = inject(Router);

  searchForm!: FormGroup;
  voyages: Voyage[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadVoyages();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      villeDepart: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      dateDepart: ['']
    });
  }

  loadVoyages(): void {
    this.isLoading = true;
    this.voyageService.getAvailableVoyages().subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des voyages:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) return;

    const { villeDepart, villeArrivee, dateDepart } = this.searchForm.value;
    this.isLoading = true;

    this.voyageService.searchVoyages(villeDepart, villeArrivee, dateDepart).subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la recherche:', err);
        this.isLoading = false;
      }
    });
  }

  onViewDetails(voyageId: number): void {
    this.router.navigate(['/client/voyage-details', voyageId]);
  }

  onReserve(voyageId: number): void {
    this.router.navigate(['/client/new-reservation', voyageId]);
  }

  getStatutClass(statut: string): string {
    return `statut-${statut.toLowerCase().replace(' ', '-')}`;
  }
}
