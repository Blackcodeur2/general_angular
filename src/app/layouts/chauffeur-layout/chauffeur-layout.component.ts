import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chauffeur-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="app-container">
      <!-- Premium Top Bar -->
      <header class="app-header">
        <div class="user-profile">
          <div class="avatar">{{ initials }}</div>
          <div class="welcome-text">
            <span class="greeting">Bonjour,</span>
            <span class="username">{{ user?.prenom }}</span>
          </div>
        </div>
        <button class="icon-btn notification">
          <mat-icon>notifications_none</mat-icon>
          <span class="dot"></span>
        </button>
      </header>

      <!-- Main Viewport -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Floating Bottom Nav -->
      <nav class="bottom-nav-container">
        <div class="bottom-nav">
          <a routerLink="/chauffeur/dashboard" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper">
              <mat-icon>dashboard</mat-icon>
            </div>
            <span>Tableau</span>
          </a>
          <a routerLink="/chauffeur/history" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper">
              <mat-icon>history</mat-icon>
            </div>
            <span>Historique</span>
          </a>
          <a routerLink="/chauffeur/report-incident" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper">
              <mat-icon>report_problem</mat-icon>
            </div>
            <span>Incident</span>
          </a>
          <a routerLink="/chauffeur/profile" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper">
              <mat-icon>person</mat-icon>
            </div>
            <span>Profil</span>
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    :host { --primary: #3B82F6; --bg: #F8FAFC; --text-main: #1E293B; --text-muted: #64748B; }
    
    .app-container { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }

    .app-header { 
      padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; 
      background: white; border-bottom: 1px solid #F1F5F9; position: sticky; top: 0; z-index: 100;
    }
    
    .user-profile { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { 
      width: 40px; height: 40px; background: linear-gradient(135deg, #3B82F6, #2563EB); 
      color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }
    
    .welcome-text { display: flex; flex-direction: column; }
    .greeting { font-size: 0.75rem; color: var(--text-muted); }
    .username { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }

    .icon-btn { 
      background: #F1F5F9; border: none; width: 40px; height: 40px; border-radius: 12px; 
      display: flex; align-items: center; justify-content: center; color: var(--text-main);
      position: relative; cursor: pointer;
    }
    .notification .dot { 
      position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; 
      background: #EF4444; border: 2px solid white; border-radius: 50%; 
    }

    .main-content { flex: 1; padding: 1.25rem; padding-bottom: 100px; }

    .bottom-nav-container { 
      position: fixed; bottom: 1.25rem; left: 1rem; right: 1rem; z-index: 1000;
    }
    
    .bottom-nav { 
      background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; padding: 0.75rem;
      display: flex; justify-content: space-around; align-items: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .nav-item { 
      text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 4px;
      color: var(--text-muted); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .icon-wrapper { 
      width: 44px; height: 32px; display: flex; align-items: center; justify-content: center;
      border-radius: 12px; transition: all 0.2s;
    }
    
    .nav-item span { font-size: 0.7rem; font-weight: 600; opacity: 0.8; }
    
    .nav-item.active { color: var(--primary); }
    .nav-item.active .icon-wrapper { background: rgba(59, 130, 246, 0.1); }
    .nav-item.active span { opacity: 1; }

    mat-icon { font-size: 24px; width: 24px; height: 24px; }
  `]
})
export class ChauffeurLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser();
  
  get initials(): string {
    if (!this.user) return '?';
    return `${this.user.prenom?.[0] || ''}${this.user.nom?.[0] || ''}`.toUpperCase();
  }

  logout() {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Voulez-vous vraiment vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, quitter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#EF4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: () => this.router.navigate(['/login']),
          error: () => this.router.navigate(['/login'])
        });
      }
    });
  }
}
