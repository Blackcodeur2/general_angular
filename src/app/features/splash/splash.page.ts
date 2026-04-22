import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-container">
      <div class="logo-section">
        <div class="logo-wrapper">
          <span class="logo-icon">🚍</span>
        </div>
        <h1 class="brand-title">General Express Voyages</h1>
        <p class="brand-subtitle">Le plaisir de voyager</p>
      </div>

      <div class="loader-section">
        <div class="modern-loader">
          <div class="spinner"></div>
        </div>
        <p class="loading-message">{{ loadingMessage }}</p>
      </div>

      <div class="footer-info">
        <span>&copy; 2026 GEV - Tous droits réservés</span>
        <span class="version">v1.0.0</span>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
      height: 100vh; 
      background-color: #ffffff; 
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .splash-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 4rem 2rem;
      box-sizing: border-box;
    }

    /* --- Logo Section --- */
    .logo-section {
      text-align: center;
      margin-top: 20vh;
    }

    .logo-wrapper {
      width: 100px;
      height: 100px;
      background: #f8fafc;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      margin: 0 auto 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    .brand-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.5rem;
      letter-spacing: -0.025em;
    }

    .brand-subtitle {
      font-size: 1rem;
      color: #64748b;
      font-weight: 500;
      margin: 0;
    }

    /* --- Loader Section --- */
    .loader-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 5vh;
    }

    .modern-loader {
      position: relative;
      width: 48px;
      height: 48px;
    }

    .spinner {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-radius: 50%;
      border-top-color: #2563eb;
      animation: spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite;
    }

    .loading-message {
      font-size: 0.9rem;
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.025em;
    }

    /* --- Footer --- */
    .footer-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #cbd5e1;
      font-size: 0.75rem;
    }

    .version {
      font-weight: 600;
      background: #f1f5f9;
      color: #64748b;
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]

})
export class SplashPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  public loadingMessage = 'En route vers votre destination...';

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      // Si connecté, rediriger vers le dashboard approprié après la durée du splash
      setTimeout(() => {
        this.redirectToUserDashboard();
      }, 2000);
    } else {
      // Si non connecté, rediriger vers la landing après la durée du splash
      this.loadingMessage = 'Bienvenue chez GEV...';
      setTimeout(() => {
        this.router.navigate(['/landing']);
      }, 3000);
    }
  }

  /**
   * Redirige l'utilisateur vers son dashboard selon son rôle
   */
  private redirectToUserDashboard(): void {
    const role = this.authService.getRole();

    const roleRoutes: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'CHEF_AGENCE': '/chef_agence/dashboard',
      'CHAUFFEUR': '/chauffeur/dashboard',
      'AGENT': '/agent/dashboard',
      'PROPRIETAIRE': '/proprietaire/dashboard',
      'CLIENT': '/client/home'
    };

    const redirectPath = roleRoutes[role || ''] || '/landing';
    this.router.navigate([redirectPath]);
  }
}
