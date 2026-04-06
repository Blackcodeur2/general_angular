import { Component, OnInit, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-agency-layout',
    standalone: true,
    imports: [RouterModule, MatIconModule, TitleCasePipe],
    template: `
    <div class="agency-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <span class="logo-icon"><mat-icon>business</mat-icon></span>
                <div class="brand-text">
                    <span class="app-name">Espace Agence</span>
                    <span class="role-badge">Chef d'Agence</span>
                </div>
            </div>
    
            <nav class="sidebar-nav">
                @for (item of menuItems; track item.route) {
                    <a [routerLink]="item.route" routerLinkActive="active" class="nav-item">
                        <mat-icon class="icon">{{ item.icon }}</mat-icon>
                        <span>{{ item.label }}</span>
                    </a>
                }
            </nav>
    
            <div class="sidebar-footer">
                <button class="nav-item logout" (click)="logout()">
                    <mat-icon class="icon">logout</mat-icon>
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    
        <!-- Main Content -->
        <div class="main-wrapper">
            <header class="top-header">
                <div class="breadcrumb">
                    <span>Espace Agence</span> / <span>{{ authService.getRole() | titlecase }}</span>
                </div>
    
                <div class="user-menu">
                    <div class="avatar">
                        {{ getInitials() }}
                    </div>
                </div>
            </header>
    
            <main class="content-area">
                <router-outlet></router-outlet>
            </main>
        </div>
    </div>
  `,
    styles: [`
    /* Agency specific styles - Dark Blue/Slate */
    .agency-layout { display: flex; min-height: 100vh; background-color: #f3f4f6; font-family: 'Inter', system-ui, sans-serif; }
    
    .sidebar { width: 250px; background: #1e3a8a; color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; }
    
    .sidebar-brand { height: 70px; display: flex; align-items: center; padding: 0 1.5rem; gap: 0.75rem; background: rgba(0,0,0,0.1); }
    .app-name { font-weight: 700; font-size: 1rem; }
    .role-badge { font-size: 0.65rem; background: #3b82f6; padding: 2px 6px; border-radius: 4px; color: white; display: block; width: fit-content; }
    .logo-icon { display: flex; align-items: center; justify-content: center; }

    .sidebar-nav { flex: 1; padding: 1.5rem 0.75rem; }
    
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #DBEAFE; text-decoration: none; border-radius: 6px; margin-bottom: 0.25rem; transition: all 0.2s; cursor: pointer; }
    .nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    .nav-item.active { background: white; color: #1e3a8a; font-weight: 600; }
    
    .sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
    .logout { width: 100%; border: none; background: transparent; color: #93C5FD; display: flex; align-items: center; justify-content: flex-start; gap: 0.75rem; padding-left: 1rem; }
    .logout:hover { color: white; }

    .main-wrapper { flex: 1; margin-left: 250px; display: flex; flex-direction: column; }
    .top-header { height: 70px; background: white; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
    .user-menu { display: flex; gap: 1.5rem; align-items: center; }
    .avatar { width: 36px; height: 36px; background: #DBEAFE; color: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; }
    .content-area { padding: 2rem; flex: 1; overflow-y: auto; }
  `]
})
export class AgencyLayoutComponent implements OnInit {
    public authService = inject(AuthService);
    private router = inject(Router);

    menuItems = [
        { label: 'Tableau de bord', icon: 'dashboard', route: '/chef_agence/dashboard' },
        { label: 'Bus', icon: 'directions_bus', route: '/chef_agence/buses' },
        { label: 'Personnel', icon: 'groups', route: '/chef_agence/staff' },
        { label: 'Lignes', icon: 'map', route: '/chef_agence/routes' },
        { label: 'Voyages', icon: 'event_note', route: '/chef_agence/voyages' },
        { label: 'Réservations', icon: 'history', route: '/chef_agence/reservations' },
        { label: 'Validation', icon: 'qr_code_scanner', route: '/chef_agence/validate' },
        { label: 'Mon profil', icon: 'person', route: '/chef_agence/profile' }
    ];

    ngOnInit() {
    }

    getInitials(): string {
        const user = this.authService.currentUser();
        if (!user) return 'CA';
        const n = user.nom ? user.nom[0] : '';
        const p = user.prenom ? user.prenom[0] : '';
        return (p + n).toUpperCase() || 'CA';
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => this.router.navigate(['/login']),
            error: () => this.router.navigate(['/login'])
        });
    }
}
