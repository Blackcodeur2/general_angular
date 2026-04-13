import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { Voyage } from '../../../models/voyage';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { Route } from '../../../models/route';
import { Bus } from '../../../models/bus';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user';
import { min } from 'rxjs';

@Component({
  selector: 'app-agency-voyages',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, ButtonComponent, PaginationComponent, DatePipe],
  templateUrl: './agency-voyages.page.html',
  styleUrl: './agency-voyages.page.css',
})
export class AgencyVoyagesPage implements OnInit {
  private agencyService = inject(AgencyOpsService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  buses = signal<Bus[]>([]);
  routesList = signal<Route[]>([]);
  voyages = signal<Voyage[]>([]);
  chauffeurs = signal<User[]>([]);
  showForm = signal(false);
  isLoading = signal(true);
  isSubmitting = signal(false);
  isEditing = signal(false);
  editId = signal<number | null>(null);

  currentPage = signal(1);
  pageSize = signal(5);

  paginatedVoyages = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.voyages().slice(start, end);
  });

  voyageForm = this.fb.group({
    date_depart: ['', Validators.required],
    duree_heure: ['', Validators.required,],
    trajet_id: [null as number | null, Validators.required],
    bus_id: [null as number | null, Validators.required],
    prix: [0, Validators.required],
    chauffeur_id: [null as number | null, Validators.required],
    statut: ['en attente'],
    gare_id: [null as number | null],
  });

  ngOnInit() {
    this.loadVoyages();
    this.loadBuses();
    this.loadRoutes();
    this.loadChauffeurs();

    this.voyageForm.get('trajet_id')?.valueChanges.subscribe((value: string | number | null) => {
      if (value === null || value === '') {
        return;
      }
      const route = this.routesList().find(r => r.id === Number(value));
      if (route) {
        this.voyageForm.patchValue({ prix: route.prix ?? 0 });
      }
    });
  }

  loadBuses() {
    this.agencyService.getBusesDispo().subscribe({
      next: (data: Bus[]) => {
        this.buses.set(data || []);
      },
      error: () => this.buses.set([])
    });
  }

  loadChauffeurs() {
    this.agencyService.getChauffeurs().subscribe({
      next: (data: User[]) => {
        this.chauffeurs.set(data || []);
      },
      error: () => this.chauffeurs.set([])
    });
  }

  loadRoutes() {
    this.agencyService.getRoutes().subscribe({
      next: (data: Route[]) => {
        this.routesList.set(data || []);
      },
      error: () => this.routesList.set([])
    });
  }

  loadVoyages() {
    this.isLoading.set(true);
    this.agencyService.getVoyages().subscribe({
      next: (data: Voyage[]) => {
        const sorted = (data || []).sort((a, b) => new Date(b.date_depart).getTime() - new Date(a.date_depart).getTime());
        this.voyages.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.voyages.set([]);
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    if (this.showForm()) {
        this.isEditing.set(false);
        this.editId.set(null);
        this.voyageForm.reset({ statut: 'en attente', prix: 0 });
        this.loadBuses(); // Reset to dispo buses
    }
    this.showForm.update(v => !v);
  }

  editVoyage(voyage: Voyage) {
    this.isEditing.set(true);
    this.editId.set(voyage.id || null);
    
    // Load all buses so we can see the current one even if it's not "disponible"
    this.agencyService.getBuses().subscribe(data => {
        this.buses.set(data);
        this.voyageForm.patchValue({
            date_depart: voyage.date_depart,
            trajet_id: voyage.trajet_id ?? voyage.trajet?.id,
            bus_id: voyage.bus_id ?? voyage.bus?.id,
            prix: voyage.prix,
            chauffeur_id: voyage.chauffeur_id ?? voyage.chauffeur?.id,
            statut: voyage.statut,
            gare_id: voyage.gare_id
        });
        this.showForm.set(true);
    });
  }

  onSubmit() {
    if (this.voyageForm.invalid) return;
    this.isSubmitting.set(true);
    
    const formValue = this.voyageForm.getRawValue();
    const payload = {
      ...formValue,
      id: this.editId(),
      gare_id: this.editId() ? formValue.gare_id : this.authService.currentUser()?.gare_id,
    };

    const request = this.isEditing() 
        ? this.agencyService.updateVoyage(payload as any)
        : this.agencyService.createVoyage(payload as any);

    const wasEditing = this.isEditing();

    request.subscribe({
      next: () => {
        this.loadVoyages(); 
        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.editId.set(null);
        this.voyageForm.reset({ statut: 'en attente', prix: 0 });
        this.loadBuses(); // Back to dispo buses
        Swal.fire({ 
          icon: 'success', 
          title: 'Succès', 
          text: wasEditing ? 'Voyage mis à jour' : 'Voyage programmé', 
          timer: 2000, 
          showConfirmButton: false 
        });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        let errorMsg = 'Impossible d\'enregistrer le voyage';
        if (error.status === 422 && error.error?.errors) {
          errorMsg = Object.values(error.error.errors).flat().join('\n');
        }
        Swal.fire({ icon: 'error', title: 'Erreur', text: errorMsg });
      }
    });
  }
}
