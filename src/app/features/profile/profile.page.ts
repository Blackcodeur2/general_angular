import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [CommonModule, MatIconModule, TitleCasePipe, DatePipe, ButtonComponent, ReactiveFormsModule],
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.css']
})
export class ProfilePage implements OnInit {
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);
    
    user = this.authService.currentUser;
    isChangingPassword = signal(false);
    isSubmitting = signal(false);

    // Toggles pour la visibilité du mot de passe
    showCurrentPassword = signal(false);
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);

    // Calcul de la force du mot de passe
    passwordStrength = computed(() => {
        const password = this.changePasswordForm.get('new_password')?.value || '';
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        return strength;
    });

    passwordStrengthLabel = computed(() => {
        const score = this.passwordStrength();
        switch (score) {
            case 0: return 'Aucun';
            case 1: return 'Très faible';
            case 2: return 'Faible';
            case 3: return 'Moyen';
            case 4: return 'Fort';
            case 5: return 'Très fort';
            default: return 'Aucun';
        }
    });

    passwordStrengthColor = computed(() => {
        const score = this.passwordStrength();
        switch (score) {
            case 1: return '#ef4444'; // rouge
            case 2: return '#f97316'; // orange
            case 3: return '#facc15'; // jaune
            case 4: return '#4ade80'; // vert clair
            case 5: return '#22c55e'; // vert
            default: return '#e5e7eb';
        }
    });

    changePasswordForm = this.fb.nonNullable.group({
        current_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    ngOnInit() {
        if (!this.user() && this.authService.isLoggedIn()) {
            this.authService.fetchUser().subscribe({
                error: (err) => console.error("Impossible de récupérer le profil", err)
            });
        }
    }

    getInitials(nom: string | undefined, prenom: string | undefined): string {
        const n = nom ? nom[0] : '';
        const p = prenom ? prenom[0] : '';
        return (p + n).toUpperCase() || 'U';
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('new_password');
        const confirmPassword = control.get('confirm_password');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        return null;
    }

    togglePasswordForm() {
        this.isChangingPassword.update(v => !v);
        if (!this.isChangingPassword()) {
            this.changePasswordForm.reset();
        }
    }

    onSubmitPassword() {
        if (this.changePasswordForm.invalid) {
            this.changePasswordForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        const data = this.changePasswordForm.getRawValue();

        this.authService.changePassword(data).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.isChangingPassword.set(false);
                this.changePasswordForm.reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Votre mot de passe a été modifié avec succès.',
                    confirmButtonColor: '#3b82f6'
                });
            },
            error: (err) => {
                this.isSubmitting.set(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: err.error?.message || 'Impossible de modifier le mot de passe. Vérifiez vos informations.',
                    confirmButtonColor: '#ef4444'
                });
            }
        });
    }

    shouldShowError(controlName: string): boolean {
        const control = this.changePasswordForm.get(controlName);
        return !!control && control.touched && control.invalid;
    }
}
