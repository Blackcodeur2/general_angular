import { inject, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth-service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-register-component',
  imports: [ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly registerForm = this.fb.nonNullable.group({
    num_cni: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    date_naissance: ['', [Validators.required]],
    telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.registerForm.invalid) return;

    const rawValue = this.registerForm.getRawValue();
    const data = {
        ...rawValue,
        role_user: 'CLIENT'
    };
    
    this.isLoading.set(true);

    this.authService.register(data).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie',
          text: 'Votre compte a été créé avec succès.',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/client/home']); // Redirection vers landing page après inscription
        });
      },
      error: (error) => {
        console.error('Registration error', error);
        this.isLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error?.message || 'Une erreur est survenue lors de l\'inscription.',
          confirmButtonColor: '#3b82f6',
        });
      }
    });
  }

  protected shouldShowError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && (this.submitted() || control.touched) && control.invalid;
  }

  protected errorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Champ obligatoire.';
    if (control.errors['email']) return 'Email invalide.';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères.`;
    if (control.errors['pattern']) return 'Format invalide.';
    if (control.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas.';
    return 'Valeur invalide.';
  }
}
