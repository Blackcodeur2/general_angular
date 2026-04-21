import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { Route } from '../../../models/route';
import { Ville } from '../../../models/ville';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

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
  villes = signal<Ville[]>([]);
  showForm = signal(false);
  isSubmitting = signal(false);
  isEditing = signal(false);
  isExporting = signal(false);
  editId = signal<number | null>(null);

  currentPage = signal(1);
  pageSize = signal(5);

  paginatedRoutes = computed(() => {
    const list = this.routesList();
    if (!Array.isArray(list)) return [];
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  totalVIP = computed(() => this.routesList().filter(r => r.type_trajet === 'vip').length);
  totalClassique = computed(() => this.routesList().filter(r => r.type_trajet === 'classique').length);

  routeForm = this.fb.group({
    ville_depart: [null as number | null, Validators.required],
    ville_arrive: [null as number | null, Validators.required],
    distance_km: [0, Validators.required],
    prix: [5000, [Validators.required, Validators.min(100)]],
    type_trajet: ['classique', [Validators.required]],
    gare_id: [null as number | null | undefined, [Validators.required]]
  });


  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.routeForm.patchValue({ gare_id: user.gare_id });
    }
    this.loadRoutes();
    this.loadVilles();
  }

  loadVilles() {
    this.agencyService.getVilles().subscribe({
      next: (data: Ville[]) => {
        this.villes.set(data || []);
      },
      error: () => this.villes.set([])
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

  toggleForm() {
    if (this.showForm()) {
      this.isEditing.set(false);
      this.editId.set(null);
      this.routeForm.reset({ gare_id: this.authService.currentUser()?.gare_id });
    }
    this.showForm.update(v => !v);
  }

  editRoute(route: Route) {
    this.isEditing.set(true);
    this.editId.set(route.id || null);
    this.routeForm.patchValue({
      ville_depart: route.ville_depart,
      ville_arrive: route.ville_arrive,
      prix: route.prix,
      distance_km: route.distance_km,
      type_trajet: route.type_trajet,
      gare_id: route.gare_id
    });
    this.showForm.set(true);
  }


  onSubmit() {
    if (this.routeForm.invalid) return;
    this.isSubmitting.set(true);

    const routeData = this.routeForm.value as any;
    const request = this.isEditing() 
      ? this.agencyService.updateRoute({ ...routeData, id: this.editId() }) 
      : this.agencyService.createRoute(routeData);

    request.subscribe({
      next: (res: Route) => {
        if (this.isEditing()) {
          this.routesList.update((list: Route[]) => list.map((r: Route) => r.id === this.editId() ? res : r));
          Swal.fire({ icon: 'success', title: 'Succès', text: 'Ligne mise à jour', timer: 2000, showConfirmButton: false });
        } else {
          this.routesList.update((list: Route[]) => [res, ...list]);
          Swal.fire({ icon: 'success', title: 'Succès', text: 'Ligne créée', timer: 2000, showConfirmButton: false });
        }

        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.editId.set(null);
        this.routeForm.reset({ gare_id: this.authService.currentUser()?.gare_id });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        let errorMsg = 'Impossible d\'enregistrer la ligne';
        if (error.status === 422 && error.error?.errors) {
          errorMsg = Object.values(error.error.errors).flat().join('\n');
        }
        Swal.fire({ icon: 'error', title: 'Erreur', text: errorMsg });
      }
    });
  }

  downloadPdf() {
    if (this.isExporting()) return;
    this.isExporting.set(true);

    this.agencyService.exportRoutesPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const now = new Date();
        const dateStr = `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}`;
        link.download = `trajets_agence_${dateStr}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Téléchargement réussi', timer: 2000, showConfirmButton: false });
      },
      error: (error) => {
        this.isExporting.set(false);
        if (error.status === 200) return;
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de télécharger le document PDF' });
      }
    });
  }
}
