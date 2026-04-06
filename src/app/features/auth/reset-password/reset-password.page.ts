import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrl: './reset-password.page.css',
    imports: [ReactiveFormsModule, ButtonComponent, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage implements OnInit {
    protected readonly submitted = signal(false);
    protected readonly isLoading = signal(false);

    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly appName = "Gev App";

    private token: string | null = null;
    private emailParam: string | null = null;

    protected readonly resetPasswordForm = this.fb.nonNullable.group({
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    ngOnInit() {
        const queryParams = this.route.snapshot.queryParams;
        const fullQuery = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
        
        // The backend format is ?token[TOKEN]$email=[EMAIL]
        // This is caught by Angular as a single key "tokenTOKEN$email" = "EMAIL"
        // We parse the keys to find the token
        const paramKey = Object.keys(queryParams).find(k => k.startsWith('token') && k.includes('$email'));
        
        if (paramKey) {
            this.token = paramKey.replace('token', '').replace('$email', '');
            this.emailParam = queryParams[paramKey];
        } else {
            // Fallback to standard params if needed
            this.token = this.route.snapshot.queryParamMap.get('token');
            this.emailParam = this.route.snapshot.queryParamMap.get('email');
        }

        if (!this.token || !this.emailParam) {
            Swal.fire({
                icon: 'error',
                title: 'Lien invalide',
                text: 'Le lien de réinitialisation est invalide ou a expiré.',
                confirmButtonColor: '#3b82f6',
            }).then(() => {
                this.router.navigate(['/auth/forgot-password']);
            });
            return;
        }

        this.resetPasswordForm.patchValue({ email: this.emailParam });
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('password_confirmation');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            // Set error on the confirmation control as well for display purposes
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        // Clear mismatch error if exists and they match
        if (confirmPassword?.errors?.['passwordMismatch']) {
            const errors = { ...confirmPassword.errors };
            delete errors['passwordMismatch'];
            confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
        }

        return null;
    }

    onSubmit(): void {
        this.submitted.set(true);

        if (this.resetPasswordForm.invalid) return;

        if (!this.token || !this.emailParam) return;

        const { password, password_confirmation } = this.resetPasswordForm.getRawValue();
        this.isLoading.set(true);

        this.authService.resetPassword({
            email: this.emailParam,
            token: this.token,
            password,
            password_confirmation
        }).subscribe({
            next: (response: any) => {
                this.isLoading.set(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: response.message || 'Votre mot de passe a été réinitialisé avec succès.',
                    confirmButtonColor: '#3b82f6',
                }).then(() => {
                    this.router.navigate(['/auth/login']);
                });
            },
            error: (error) => {
                console.error('Reset password error', error);
                this.isLoading.set(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Une erreur est survenue lors de la réinitialisation.',
                    confirmButtonColor: '#3b82f6',
                });
            }
        });
    }

    protected shouldShowError(controlName: 'email' | 'password' | 'password_confirmation'): boolean {
        const control = this.resetPasswordForm.get(controlName);
        return !!control && (this.submitted() || control.touched) && control.invalid;
    }

    protected errorMessage(controlName: 'email' | 'password' | 'password_confirmation'): string {
        const control = this.resetPasswordForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Champ obligatoire.';
        if (controlName === 'email' && control.errors['email']) return 'Email invalide.';
        if (controlName === 'password' && control.errors['minlength']) return 'Le mot de passe doit comporter au moins 8 caractères.';
        if (controlName === 'password_confirmation' && control.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas.';
        return 'Valeur invalide.';
    }
}
