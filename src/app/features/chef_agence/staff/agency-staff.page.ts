import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';
import { User } from '../../../models/user';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-agency-staff',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, ButtonComponent, PaginationComponent],
  templateUrl: './agency-staff.page.html',
  styleUrl: './agency-staff.page.css'
})
export class AgencyStaffPage implements OnInit {
  private agencyService = inject(AgencyOpsService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  staffMembers = signal<User[]>([]);
  showForm = signal(false);
  isSubmitting = signal(false);
  isEditing = signal(false);
  editId = signal<number | null>(null);

  roles = ['AGENT', 'CHAUFFEUR'];
  currentPage = signal(1);
  pageSize = signal(5);

  paginatedStaff = computed(() => {
    const list = this.staffMembers();
    if (!Array.isArray(list)) return [];
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  totalAgents = computed(() => this.staffMembers().filter(m => m.role_user === 'AGENT').length);
  totalChauffeurs = computed(() => this.staffMembers().filter(m => m.role_user === 'CHAUFFEUR').length);

  staffForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    date_naissance: ['', Validators.required],
    num_cni: ['', Validators.required],
    telephone: ['', Validators.required],
    role_user: ['AGENT', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    gare_id: [null as number | null | undefined],
  });

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.agencyService.getStaff().subscribe({
      next: (data: User[]) => {
        this.staffMembers.set(data || []);
      },
      error: () => this.staffMembers.set([])
    });
  }

  toggleForm() {
    if (this.showForm()) {
        this.isEditing.set(false);
        this.editId.set(null);
        this.staffForm.reset({ role_user: 'AGENT' });
        this.staffForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
        // Prepare for create mode
        this.staffForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.staffForm.get('password')?.updateValueAndValidity();
    this.showForm.update(v => !v);
  }

  editStaff(member: User) {
    this.isEditing.set(true);
    this.editId.set(member.id || null);
    this.staffForm.patchValue({
        nom: member.nom,
        prenom: member.prenom,
        email: member.email,
        date_naissance: member.date_naissance,
        num_cni: member.num_cni,
        telephone: member.telephone,
        role_user: member.role_user,
        gare_id: member.gare_id
    });
    // Password is not required when editing
    this.staffForm.get('password')?.clearValidators();
    this.staffForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.staffForm.get('password')?.updateValueAndValidity();
    this.showForm.set(true);
  }

  onSubmit() {
    if (this.staffForm.invalid) return;
    this.isSubmitting.set(true);
    
    const formValue = this.staffForm.getRawValue();
    const payload = {
      ...formValue,
      id: this.editId(),
      gare_id: this.editId() ? formValue.gare_id : this.authService.currentUser()?.gare_id,
    };

    // If password is empty during edit, Remove it from payload
    if (this.isEditing() && !payload.password) {
        delete (payload as any).password;
    }

    const request = this.isEditing() 
        ? this.agencyService.updateStaff(payload)
        : this.agencyService.addStaff(payload);

    request.subscribe({
      next: (res: User) => {
        if (this.isEditing()) {
          this.staffMembers.update((list: User[]) => list.map((m: User) => m.id === this.editId() ? res : m));
          Swal.fire({ icon: 'success', title: 'Succès', text: 'Personnel mis à jour', timer: 2000, showConfirmButton: false });
        } else {
          this.staffMembers.update((list: User[]) => [res, ...list]);
          Swal.fire({ icon: 'success', title: 'Succès', text: 'Personnel ajouté', timer: 2000, showConfirmButton: false });
        }

        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.editId.set(null);
        this.staffForm.reset({ role_user: 'AGENT' });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        let errorMsg = 'Impossible d\'enregistrer le personnel';
        if (error.status === 422 && error.error?.errors) {
            errorMsg = Object.entries(error.error.errors)
                .map(([key, value]: [string, any]) => `${key}: ${value.join(', ')}`)
                .join('\n');
        }
        Swal.fire({ icon: 'error', title: 'Erreur', text: errorMsg });
      }
    });
  }
}
