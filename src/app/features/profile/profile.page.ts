import { Component, OnInit, inject, signal } from '@angular/core';
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
