import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
//import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../core/services/auth.service';
//import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';


@Component({
    selector: 'app-staff-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule,],
    template: `
    <div class="staff-layout">
        <!-- Sidebar -->
        <aside class="sidebar agent-mode">
            <div class="sidebar-brand">
                <span class="logo-icon"><mat-icon>confirmation_number</mat-icon></span>
                <div class="brand-text">
                    <span class="app-name">General Express</span>
                    <span class="role-badge">Agent / Guichet</span>
                </div>
            </div>
    
            <nav class="sidebar-nav">
                <a *ngFor="let item of menuItems" [routerLink]="item.route" routerLinkActive="active" class="nav-item">
                    <mat-icon class="icon">{{ item.icon }}</mat-icon>
                    <span>{{ item.label }}</span>
                </a>
            </nav>
    
            <div class="sidebar-footer">
                <button class="nav-item logout" (click)="logout()">
                    <mat-icon class="icon">logout</mat-icon>
                    <span>{{ 'nav.logout' }}</span>
                </button>
            </div>
        </aside>
    
        <!-- Main Content -->
        <div class="main-wrapper">
            <header class="top-header">
                <div class="breadcrumb">
                    <span>Staff Portal</span>
                </div>
    
                <div class="user-menu">
                
                    <div class="notifications">
                        <button class="icon-btn" [routerLink]="['/agent/notifications']">
                            <mat-icon>notifications</mat-icon>
                        </button>
                        <span class="badge" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
                    </div>
                    <div class="avatar">
                        {{ userInitials() }}
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
    /* Layout Structure similar to Admin but with Agent Theme */
    .staff-layout { display: flex; min-height: 100vh; background-color: #f3f4f6; font-family: 'Inter', sans-serif; }
    
    .sidebar { width: 250px; background: #064E3B; color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; }
    
    .sidebar-brand { height: 70px; display: flex; align-items: center; padding: 0 1.5rem; gap: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .app-name { font-weight: 700; font-size: 1rem; }
    .role-badge { font-size: 0.65rem; background: #059669; padding: 2px 6px; border-radius: 4px; color: white; display: block; width: fit-content; }
    .logo-icon { display: flex; align-items: center; justify-content: center; }

    .sidebar-nav { flex: 1; padding: 1.5rem 0.75rem; }
    
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #D1D5DB; text-decoration: none; border-radius: 6px; margin-bottom: 0.25rem; transition: all 0.2s; cursor: pointer; }
    .nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    .nav-item.active { background: #10B981; color: white; }
    
    .sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
    .logout { width: 100%; border: none; background: transparent; color: #EF4444; display: flex; align-items: center; gap: 0.75rem; }
    
    .main-wrapper { flex: 1; margin-left: 250px; display: flex; flex-direction: column; }
    .top-header { height: 70px; background: white; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
    .user-menu { display: flex; gap: 1.5rem; align-items: center; }
    .avatar { width: 36px; height: 36px; background: #E5E7EB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }
    .content-area { padding: 2rem; flex: 1; overflow-y: auto; }
    .icon-btn { background: none; border: none; cursor: pointer; color: #6B7280; display: flex; align-items: center; }
  `]
})
export class StaffLayoutComponent implements OnInit {
    //private notificationService = inject(NotificationService);
    private authService = inject(AuthService);
    private router = inject(Router);

    unreadCount = signal(0);
    userInitials = signal('AG');

    menuItems = [
        { label: 'nav.booking', icon: 'point_of_sale', route: '/agent/booking' },
        { label: 'nav.history', icon: 'history', route: '/agent/reservations' },
        { label: 'nav.dashboard', icon: 'dashboard', route: '/agent/dashboard' },
        { label: 'nav.agents', icon: 'groups', route: '/agent/agents' },
        { label: 'nav.validate', icon: 'qr_code_scanner', route: '/agent/validate' },
        { label: 'nav.profile', icon: 'person ', route: '/agent/profile' },
    ];

    ngOnInit() {
        /*this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.userInitials.set(this.getInitials(user.name));
                this.loadUnreadCount(user.id);
            }
        });*/
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    loadUnreadCount(userId: string) {
        /*this.notificationService.getUserNotifications(userId).subscribe(notes => {
            const count = notes.filter(n => !n.is_read).length;
            this.unreadCount.set(count);
        });*/
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => this.router.navigate(['/login']),
            error: () => this.router.navigate(['/login'])
        });
    }
}
