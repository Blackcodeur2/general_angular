import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule,MatIconModule],
  template: `
    <div class="app-container">
      <!-- Premium Top Bar -->
      <header class="app-header">
        <div class="user-profile">
          <div class="avatar">{{ initials }}</div>
          <div class="welcome-text">
            <span class="greeting">{{ greeting }}</span>
            <span class="username">{{ currentUser()?.prenom }}</span>
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
          <a routerLink="/client/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <div class="icon-wrapper"><mat-icon>home</mat-icon></div>
            <span>Accueil</span>
          </a>
          <a routerLink="/client/voyages" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper"><mat-icon>search</mat-icon></div>
            <span>Voyages</span>
          </a>
          <a routerLink="/client/mes-reservations" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper"><mat-icon>confirmation_number</mat-icon></div>
            <span>Billets</span>
          </a>
          <a routerLink="/client/profile" routerLinkActive="active" class="nav-item">
            <div class="icon-wrapper"><mat-icon>person</mat-icon></div>
            <span>Profil</span>
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    :host { --primary: #2563EB; --bg: #F8FAFC; --text-main: #1E293B; --text-muted: #64748B; }
    
    .app-container { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }

    .app-header { 
      padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; 
      background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #F1F5F9; position: sticky; top: 0; z-index: 100;
    }
    
    .user-profile { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { 
      width: 40px; height: 40px; background: linear-gradient(135deg, #2563EB, #1D4ED8); 
      color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
    }
    
    .welcome-text { display: flex; flex-direction: column; }
    .greeting { font-size: 0.7rem; color: var(--text-muted); font-weight: 500; }
    .username { font-size: 0.95rem; font-weight: 800; color: var(--text-main); }

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
      background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
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
    
    .nav-item span { font-size: 0.65rem; font-weight: 700; }
    
    .nav-item.active { color: var(--primary); }
    .nav-item.active .icon-wrapper { background: rgba(37, 99, 235, 0.1); }

    mat-icon { font-size: 24px; width: 24px; height: 24px; }

    @media (min-width: 1024px) {
      .app-container { max-width: 480px; margin: 0 auto; box-shadow: 0 0 50px rgba(0,0,0,0.1); }
    }
  `]
})
export class ClientLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  get initials(): string {
    const u = this.currentUser();
    return u ? `${u.prenom?.[0] || ''}${u.nom?.[0] || ''}`.toUpperCase() : '?';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour,';
    if (hour < 18) return 'Bon après-midi,';
    return 'Bonsoir,';
  }

  onLogout(): void {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Voulez-vous vraiment vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563EB'
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
