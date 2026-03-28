import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-chauffeur-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="chauffeur-layout">
      <!-- Top Navigation -->
      <nav class="top-nav">
        <div class="brand">
          <mat-icon>local_shipping</mat-icon>
          <span>Chauffeur Portal</span>
        </div>
        <button class="logout-btn" (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </nav>

      <!-- Main Content -->
      <main class="content">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation (Mobile App style) -->
      <nav class="bottom-nav">
        <a routerLink="/chauffeur/dashboard" routerLinkActive="active" class="nav-link">
          <mat-icon>event_note</mat-icon>
          <span>Programme</span>
        </a>
        <a routerLink="/chauffeur/history" routerLinkActive="active" class="nav-link">
          <mat-icon>history</mat-icon>
          <span>Historique</span>
        </a>
        <a routerLink="/chauffeur/profile" routerLinkActive="active" class="nav-link">
          <mat-icon>person</mat-icon>
          <span>Profil</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .chauffeur-layout { display: flex; flex-direction: column; min-height: 100vh; background: #F9FAFB; }
    
    .top-nav { height: 60px; background: #1E293B; color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .brand { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1.1rem; }
    .logout-btn { background: none; border: none; color: #FDA4AF; cursor: pointer; }

    .content { flex: 1; padding: 1rem; padding-bottom: 80px; }

    .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 70px; background: white; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
    .nav-link { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #64748B; font-size: 0.75rem; font-weight: 500; gap: 4px; }
    .nav-link.active { color: #2563EB; }
    .nav-link mat-icon { font-size: 24px; }
  `]
})
export class ChauffeurLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
