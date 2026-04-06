import { inject, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);

    this.authService.login({ email, password }).subscribe({
      next: (response: any) => {
        try {
          const role = this.authService.getRole();
          switch (role) {
            case 'ADMIN':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'CHEF_AGENCE':
              this.router.navigate(['/chef_agence/dashboard']);
              break;
            case 'CHAUFFEUR':
              this.router.navigate(['/chauffeur/dashboard']);
              break;
            case 'AGENT':
              this.router.navigate(['/agent/dashboard']);
              break;
            case 'PROPRIETAIRE':
              this.router.navigate(['/proprietaire/dashboard']);
              break;
            default:
              this.router.navigate(['/client/home']);
              break;
          }
        } catch (error) {
          console.error('Session save error', error);
          this.isLoading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur inattendue est survenue.',
            confirmButtonColor: '#3b82f6',
          });
        }
      },
      error: (error) => {
        console.error('Login error', error);
        this.isLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Échec de la connexion',
          text: 'Identifiants incorrects ou serveur indisponible. Veuillez réessayer.',
          confirmButtonColor: '#3b82f6',
        });
      }
    });
  }

  protected shouldShowError(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && (this.submitted() || control.touched) && control.invalid;
  }

  protected errorMessage(controlName: 'email' | 'password'): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Champ obligatoire.';
    if (control.errors['email']) return 'Email invalide.';
    if (control.errors['minlength']) return 'Mot de passe trop court.';
    return 'Valeur invalide.';
  }
}
