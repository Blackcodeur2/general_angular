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

  currentPage = signal(1);
  pageSize = signal(5);

  paginatedVoyages = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.voyages().slice(start, end);
  });

  voyageForm = this.fb.group({
    date_depart: ['', Validators.required],
    trajet_id: ['', Validators.required],
    bus_id: ['', Validators.required],
    prix: [0, Validators.required],
    chauffeur_id: ['', Validators.required],
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
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.buses.set(data);
        } else if (data && typeof data === 'object') {
          let arrayData = data.data || data.buses;
          if (!arrayData) {
            const values = Object.values(data);
            if (values.length > 0 && typeof values[0] === 'object') {
              arrayData = values;
            }
          }
          this.buses.set(Array.isArray(arrayData) ? arrayData : []);
        } else {
          this.buses.set([]);
        }
      },
      error: () => {
        this.buses.set([]);
      }
    });
  }
 loadChauffeurs() {
    this.agencyService.getChauffeurs().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.chauffeurs.set(data);
        } else if (data && typeof data === 'object') {
          let arrayData = data.data || data.users;

          if (!arrayData) {
            const values = Object.values(data);
            if (values.length > 0 && typeof values[0] === 'object') {
              arrayData = values;
            }
          }

          this.chauffeurs.set(Array.isArray(arrayData) ? arrayData : []);
        } else {
          this.chauffeurs.set([]);
        }
      },
      error: () => {
        this.chauffeurs.set([]);
      }
    });
  }

  loadRoutes() {
    this.agencyService.getRoutes().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.routesList.set(data);
        } else if (data && typeof data === 'object') {
          let arrayData = data.data || data.trajets || data.routes;
          if (!arrayData) {
            const values = Object.values(data);
            if (values.length > 0 && typeof values[0] === 'object') {
              arrayData = values;
            }
          }
          this.routesList.set(Array.isArray(arrayData) ? arrayData : []);
        } else {
          this.routesList.set([]);
        }
      },
      error: () => {
        this.routesList.set([]);
      }
    });
  }

  loadVoyages() {
    this.isLoading.set(true);
    this.agencyService.getVoyages().subscribe({
      next: (data) => {
        this.voyages.set(data.sort((a,b) => new Date(b.date_depart).getTime() - new Date(a.date_depart).getTime()));
        this.isLoading.set(false);
      },
      error: () => {
        this.voyages.set([]);
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.voyageForm.invalid) return;
    this.isSubmitting.set(true);
    const payload = {
      ...this.voyageForm.getRawValue(),
      gare_id: this.authService.currentUser()?.gare_id,
    };

    this.agencyService.createVoyage(payload as any).subscribe({
      next: () => {
        this.loadVoyages(); // Refresh to get joined data
        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.voyageForm.reset({ statut: 'en attente', prix: 0 });
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Voyage programmé', timer: 2000, showConfirmButton: false });
      },
      error: () => {
        this.isSubmitting.set(false);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de programmer le voyage' });
      }
    });
  }
}
