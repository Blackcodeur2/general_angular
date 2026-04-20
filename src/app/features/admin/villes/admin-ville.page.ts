import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { Ville } from '../../../models/ville';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-agency-villes',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, ButtonComponent, PaginationComponent],
  templateUrl: './admin-ville.page.html',
  styleUrl: './admin-ville.page.css',
})
export class AdminVillesPage implements OnInit {
  private agencyService = inject(AgencyOpsService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  villes = signal<Ville[]>([]);
  showForm = signal(false);
  isSubmitting = signal(false);
  isEditing = signal(false);
  isExporting = signal(false);
  editId = signal<number | null>(null);

  currentPage = signal(1);
  pageSize = signal(5);

  paginatedV = computed(() => {
    const list = this.villes();
    if (!Array.isArray(list)) return [];
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  totalVilles = computed(() => this.villes().length);

  villeForm = this.fb.group({
    nom: ['', Validators.required],
    region: ['', Validators.required],
  });


  ngOnInit() {
    const user = this.authService.currentUser();
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

  toggleForm() {
    if (this.showForm()) {
      this.isEditing.set(false);
      this.editId.set(null);
    }
    this.showForm.update(v => !v);
  }

  editVille(ville: Ville) {
    this.isEditing.set(true);
    this.editId.set(ville.id || null);
    this.villeForm.patchValue({
      nom: ville.nom,
      region: ville.region,
    });
    this.showForm.set(true);
  }


  onSubmit() {
    if (this.villeForm.invalid) return;
    this.isSubmitting.set(true);

    const villeData = this.villeForm.value as any;
    const request = this.isEditing() 
      ? this.agencyService.updateVille({ ...villeData, id: this.editId() }) 
      : this.agencyService.createVille(villeData);

    request.subscribe({
      next: (res: Ville) => {
        if (this.isEditing()) {
          this.villes.update((list: Ville[]) => list.map((r: Ville) => r.id === this.editId() ? res : r));
          Swal.fire({ icon: 'success', title: 'Succès', text: 'Ville mise à jour', timer: 2000, showConfirmButton: false });
        } else {
          this.villes.update((list: Ville[]) => [res, ...list]);
          Swal.fire({ icon: 'success', title: 'Succès', text: 'Ville créée', timer: 2000, showConfirmButton: false });
        }

        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.editId.set(null);
        this.villeForm.reset();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        let errorMsg = 'Impossible d\'enregistrer la ville';
        if (error.status === 422 && error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 422 && error.error?.errors) {
          errorMsg = Object.values(error.error.errors).flat().join('\n');
        }
        Swal.fire({ icon: 'error', title: 'Erreur', text: errorMsg });
      }
    });
  }

  deleteVille(id: number | undefined) {
    if (!id) return;

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment supprimer cette ville ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agencyService.deleteVille(id).subscribe({
          next: () => {
            this.villes.update(list => list.filter(v => v.id !== id));
            Swal.fire({ icon: 'success', title: 'Supprimé !', text: 'La ville a été supprimée.', timer: 2000, showConfirmButton: false });
          },
          error: (error) => {
            let errorMsg = 'Impossible de supprimer la ville.';
            if (error.error?.message) errorMsg = error.error.message;
            Swal.fire({ icon: 'error', title: 'Erreur', text: errorMsg });
          }
        });
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
      error: () => {
        this.isExporting.set(false);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de télécharger le document PDF' });
      }
    });
  }
}
