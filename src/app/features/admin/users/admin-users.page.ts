import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { AgenceService } from '../../../services/agence/agence.service';
import { User } from '../../../models/user';
import { Agence } from '../../../models/agence';
import { Gare } from '../../../models/gare';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, MatIconModule, DatePipe, TitleCasePipe, ReactiveFormsModule, ButtonComponent, PaginationComponent],
    templateUrl: './admin-users.page.html',
    styleUrls: ['./admin-users.page.css']
})
export class AdminUsersPage implements OnInit {
    private userService = inject(UserService);
    private agenceService = inject(AgenceService);
    private fb = inject(FormBuilder);

    users = signal<User[]>([]);
    agences = signal<Agence[]>([]);
    garesDisponibles = signal<Gare[]>([]);

    isLoading = signal<boolean>(true);
    error = signal<string | null>(null);

    // Pagination
    currentPage = signal<number>(1);
    pageSize = signal<number>(4);

    paginatedUsers = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.users().slice(start, end);
    });

    showCreateForm = signal<boolean>(false);
    isCreating = signal<boolean>(false);

    roles = ['ADMIN', 'CHEF_AGENCE', 'AGENT', 'CHAUFFEUR', 'CONTROLEUR', 'CLIENT'];

    userForm = this.fb.group({
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        num_cni: ['', Validators.required],
        date_naissance: ['', Validators.required],
        telephone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        role_user: ['', Validators.required],
        agence_id: [''],
        gare_id: [''],
        password: ['12345678', Validators.required]
    });

    ngOnInit() {
        this.loadUsers();
        this.loadAgences();

        // Ecouter le changement de l'agence pour filtrer les gares disponibles
        this.userForm.get('agence_id')?.valueChanges.subscribe(agenceId => {
            this.userForm.get('gare_id')?.setValue('');
            if (agenceId) {
                const agence = this.agences().find(a => a.id === Number(agenceId));
                this.garesDisponibles.set(agence?.gares || []);
            } else {
                this.garesDisponibles.set([]);
            }
        });

        // Rendre optionnels ou obligatoires l'affectation agence/gare selon le rôle
        this.userForm.get('role_user')?.valueChanges.subscribe(role => {
            if (role === 'CHEF_AGENCE' || role === 'AGENT' || role === 'CHAUFFEUR') {
                this.userForm.get('agence_id')?.setValidators(Validators.required);
                this.userForm.get('gare_id')?.setValidators(Validators.required);
            } else {
                this.userForm.get('agence_id')?.clearValidators();
                this.userForm.get('gare_id')?.clearValidators();
                this.userForm.get('agence_id')?.setValue('');
                this.userForm.get('gare_id')?.setValue('');
            }
            this.userForm.get('agence_id')?.updateValueAndValidity();
            this.userForm.get('gare_id')?.updateValueAndValidity();
        });
    }

    loadUsers() {
        this.isLoading.set(true);
        this.error.set(null);
        this.userService.getUsers().subscribe({
            next: (data: any) => {
                const list = Array.isArray(data) ? data : (data.data || []);
                this.users.set(list);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error("Erreur de chargement", err);
                this.error.set("Impossible de charger la liste des utilisateurs.");
                this.isLoading.set(false);
            }
        });
    }

    loadAgences() {
        this.agenceService.getAgences().subscribe({
            next: (data: any) => {
                const list = Array.isArray(data) ? data : (data.data || []);
                this.agences.set(list);
            }
        });
    }

    toggleForm() {
        this.showCreateForm.update(v => !v);
        if (!this.showCreateForm()) this.userForm.reset({ password: 'password123' });
    }

    needsGareAssignment(): boolean {
        const role = this.userForm.get('role_user')?.value;
        return role === 'CHEF_AGENCE' || role === 'AGENT' || role === 'CHAUFFEUR';
    }

    onSubmitUser() {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.isCreating.set(true);
        const formData = this.userForm.getRawValue() as any;

        this.userService.createUser(formData).subscribe({
            next: (newUser) => {
                // Ajout visuel local
                this.users.update(users => [newUser, ...users]);
                this.isCreating.set(false);
                this.toggleForm();
                Swal.fire({
                    icon: 'success',
                    title: 'Utilisateur créé',
                    text: 'Le nouvel utilisateur a été enregistré avec succès et éventuellement affecté.',
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
                    text: 'Vérifiez les données (téléphone ou CNI peut-être déjà utilisés ?).',
                    confirmButtonColor: '#3b82f6',
                });
            }
        });
    }
}
