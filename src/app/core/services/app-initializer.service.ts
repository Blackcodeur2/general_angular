import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Initialise l'application en vérifiant l'état d'authentification
   * et en redirigeant l'utilisateur vers la bonne page
   */
  initializeApp(): Promise<boolean> {
    return new Promise((resolve) => {
      // Vérifier si l'utilisateur est connecté
      if (this.authService.isLoggedIn()) {
        // Rediriger vers le dashboard approprié selon le rôle
        this.redirectToUserDashboard();
        resolve(true);
      } else {
        // Rediriger vers le splash screen
        this.router.navigate(['/splash']);
        resolve(true);
      }
    });
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

    const redirectPath = roleRoutes[role || ''] || '/splash';
    this.router.navigate([redirectPath]);
  }
}
