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
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.staffMembers.set(data);
        } else if (data && typeof data === 'object') {
          // Handle Laravel wrapped responses
          let arrayData = data.data || data.staff || data.users;

          if (!arrayData) {
            // If no known key, check if it's an associative array (object with numeric/string keys)
            // If the first value is an object, assume it's a list of users
            const values = Object.values(data);
            if (values.length > 0 && typeof values[0] === 'object') {
              arrayData = values;
            }
          }

          this.staffMembers.set(Array.isArray(arrayData) ? arrayData : []);
        } else {
          this.staffMembers.set([]);
        }
      },
      error: () => {
        this.staffMembers.set([]);
      }
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.staffForm.invalid) return;
    this.isSubmitting.set(true);
    const payload = {
      ...this.staffForm.getRawValue(),
      gare_id: this.authService.currentUser()?.gare_id,
    };

    this.agencyService.addStaff(payload).subscribe({
      next: (newMember) => {
        this.staffMembers.update(list => [newMember, ...list]);
        this.showForm.set(false);
        this.isSubmitting.set(false);
        this.staffForm.reset({ role_user: 'AGENT' });
        Swal.fire({ icon: 'success', title: 'Succès', text: 'Personnel ajouté', timer: 2000, showConfirmButton: false });
      },
      error: () => {
        this.isSubmitting.set(false);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible d\'ajouter le personnel' });
      }
    });
  }
}
