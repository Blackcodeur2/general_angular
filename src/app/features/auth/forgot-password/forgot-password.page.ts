import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth-service';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.css',
  imports: [ReactiveFormsModule, ButtonComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly appName = "Gev App";

  protected readonly forgotPasswordForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.forgotPasswordForm.invalid) return;

    const { email } = this.forgotPasswordForm.getRawValue();
    this.isLoading.set(true);

    this.authService.forgotPassword({ email }).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.successMessage.set(true);
        Swal.fire({
          icon: 'success',
          title: 'Email envoyé',
          text: response.message || 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
          confirmButtonColor: '#3b82f6',
        });
      },
      error: (error) => {
        console.error('Forgot password error', error);
        this.isLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue. Veuillez vérifier votre adresse email.',
          confirmButtonColor: '#3b82f6',
        });
      }
    });
  }

  protected shouldShowError(controlName: 'email'): boolean {
    const control = this.forgotPasswordForm.get(controlName);
    return !!control && (this.submitted() || control.touched) && control.invalid;
  }

  protected errorMessage(controlName: 'email'): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Champ obligatoire.';
    if (control.errors['email']) return 'Email invalide.';
    return 'Valeur invalide.';
  }
}
