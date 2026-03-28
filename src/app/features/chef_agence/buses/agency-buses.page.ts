import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { Bus } from '../../../models/bus';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'app-agency-buses',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, ButtonComponent, PaginationComponent],
  templateUrl: './agency-buses.page.html',
  styleUrl: './agency-buses.page.css'
})
export class AgencyBusesPage implements OnInit {
  private agencyService = inject(AgencyOpsService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
   currentUser = this.authService.currentUser();

  buses = signal<Bus[]>([]);
  showForm = signal(false);
  isSubmitting = signal(false);

  currentPage = signal(1);
  pageSize = signal(5);
  searchQuery = signal('');

  filteredBuses = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const list = this.buses();
    if (!Array.isArray(list)) return [];
    if (!query) return list;
    return list.filter(bus => 
      bus.immatriculation?.toLowerCase().includes(query) || 
      bus.code_bus?.toLowerCase().includes(query)
    );
  });

  paginatedBuses = computed(() => {
    const list = this.filteredBuses();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  busForm = this.fb.group({
    immatriculation: ['OU 954 CM', Validators.required],
    code_bus: ['bus_001', [Validators.required]],
    type_bus: ['gros porteur', Validators.required],
    classe_bus: ['classique', Validators.required],
    nb_places: [70, [Validators.required]],
    gare_id: [null as number | null | undefined, [Validators.required]],
    statut: ['disponible', Validators.required]
  });

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.busForm.patchValue({ gare_id: user.gare_id });
    }
    this.loadBuses();
  }

  loadBuses() {
    this.agencyService.getBuses().subscribe({
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

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.busForm.invalid) return;
    this.isSubmitting.set(true);
    this.agencyService.createBus(this.busForm.value as any).subscribe({
      next: (newBus) => {
        this.buses.update(list => [newBus, ...list]);
        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.busForm.reset({ nb_places: 70, statut: 'disponible' });
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Bus ajouté avec succès', timer: 2000, showConfirmButton: false });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Bus creation error', error);
        console.log('Data sent:', this.busForm.getRawValue());
        
        let errorMsg = 'Impossible d\'ajouter le bus';
        
        if (error.status === 422 && error.error?.errors) {
            // Extract Laravel-style validation errors WITH field names
            errorMsg = Object.entries(error.error.errors)
                .map(([key, value]: [string, any]) => `${key}: ${value.join(', ')}`)
                .join('\n');
        } else if (error.error?.message) {
            errorMsg = error.error.message;
        }

        Swal.fire({ 
            icon: 'error', 
            title: 'Erreur de validation', 
            text: errorMsg,
            confirmButtonColor: '#3b82f6'
        });
      }
    });
  }
}
