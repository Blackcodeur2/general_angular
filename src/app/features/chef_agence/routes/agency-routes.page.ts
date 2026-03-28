import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { Route } from '../../../models/route';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'app-agency-routes',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, ButtonComponent, PaginationComponent],
  templateUrl: './agency-routes.page.html',
  styleUrl: './agency-routes.page.css',
})
export class AgencyRoutesPage implements OnInit {
  private agencyService = inject(AgencyOpsService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  routesList = signal<Route[]>([]);
  showForm = signal(false);
  isSubmitting = signal(false);

  currentPage = signal(1);
  pageSize = signal(5);

  paginatedRoutes = computed(() => {
    const list = this.routesList();
    if (!Array.isArray(list)) return [];
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  routeForm = this.fb.group({
    depart: ['', Validators.required],
    arrivee: ['', Validators.required],
    prix: [0, [Validators.required, Validators.min(100)]],
    type_trajet: ['', [Validators.required]],
    gare_id: [null as number | null | undefined, [Validators.required]]
  });

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.routeForm.patchValue(
        {
          gare_id: user.gare_id,
        });
    }
    this.loadRoutes();
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

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.routeForm.invalid) return;
    this.isSubmitting.set(true);
    this.agencyService.createRoute(this.routeForm.value as any).subscribe({
      next: (newRoute) => {
        this.routesList.update(list => [newRoute, ...list]);
        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.routeForm.reset();
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Ligne créée avec succès', timer: 2000, showConfirmButton: false });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        let errorMsg = 'Impossible de créer la ligne';

        if (error.status === 422 && error.error?.errors) {
          errorMsg = Object.values(error.error.errors).flat().join('\n');
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
