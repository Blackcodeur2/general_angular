import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgenceService } from '../../../services/admin/agence.service';
import { Agence } from '../../../models/agence';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-admin-agencies',
    standalone: true,
    imports: [CommonModule, MatIconModule, ReactiveFormsModule, ButtonComponent, PaginationComponent],
    templateUrl: './admin-agencies.page.html',
    styleUrls: ['./admin-agencies.page.css']
})
export class AdminAgenciesPage implements OnInit {
    private agenceService = inject(AgenceService);
    private fb = inject(FormBuilder);

    agences = signal<Agence[]>([]);
    isLoading = signal<boolean>(true);
    error = signal<string | null>(null);

    // Pagination
    currentPage = signal<number>(1);
    pageSize = signal<number>(6);

    paginatedAgences = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.agences().slice(start, end);
    });

    showCreateForm = signal<boolean>(false);
    activeForm = signal<'GARE' | 'AGENCE'>('GARE');
    isCreating = signal<boolean>(false);

    gareForm = this.fb.group({
        agence_id: ['', Validators.required],
        ville: ['', Validators.required],
        quartier: ['', Validators.required],
        telephone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });

    agenceForm = this.fb.nonNullable.group({
        nom_agence: ['', Validators.required],
        email_agence: ['', Validators.required],
        telephone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        bp: [''],
        proprietaire: [Validators.required]
    });

    ngOnInit() {
        this.loadAgences();
    }

    loadAgences() {
        this.isLoading.set(true);
        this.error.set(null);
        this.agenceService.getAgences().subscribe({
            next: (data: any) => {
                const list = Array.isArray(data) ? data : (data.data || []);
                this.agences.set(list);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error("Erreur de chargement des agences", err);
                this.error.set("Impossible de charger la liste des agences.");
                this.isLoading.set(false);
            }
        });
    }

    setActiveForm(mode: 'GARE' | 'AGENCE') {
        this.activeForm.set(mode);
        if (!this.showCreateForm()) this.showCreateForm.set(true);
    }

    toggleForm() {
        this.showCreateForm.update(v => !v);
        if (!this.showCreateForm()) {
            this.gareForm.reset();
            this.agenceForm.reset();
        }
    }

    onSubmitAgence() {
        if (this.agenceForm.invalid) return;
        this.isCreating.set(true);
        this.agenceService.createAgence(this.agenceForm.getRawValue()).subscribe({
            next: (newAgence) => {
                this.agences.update(list => [newAgence, ...list]);
                this.isCreating.set(false);
                this.toggleForm();
                Swal.fire({ icon: 'success', title: 'Agence créée', text: 'L\'agence a été enregistrée.', timer: 2000, showConfirmButton: false });
            },
            error: (err) => {
                this.isCreating.set(false);
                Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de créer l\'agence.', confirmButtonColor: '#3b82f6' });
            }
        });
    }

    onSubmitGare() {
        if (this.gareForm.invalid) return;

        this.isCreating.set(true);
        const formData = this.gareForm.getRawValue() as any;

        this.agenceService.createGare(formData).subscribe({
            next: (newGare) => {
                // Ajout directement dans le state local
                this.agences.update(agences => {
                    const index = agences.findIndex(a => a.id == newGare.agence_id);
                    if (index !== -1) {
                        const agence = { ...agences[index] };
                        agence.gares = [...(agence.gares || []), newGare];
                        agences[index] = agence;
                    }
                    return [...agences];
                });

                this.isCreating.set(false);
                this.toggleForm();
                Swal.fire({
                    icon: 'success',
                    title: 'Gare créée',
                    text: 'La gare a été ajoutée avec succès.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: (err) => {
                console.error(err);
                this.isCreating.set(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de créer la gare. Vérifiez vos données.',
                    confirmButtonColor: '#3b82f6',
                });
            }
        });
    }
}
