import { Component, OnInit, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth-service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterModule, MatIconModule, TitleCasePipe],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    currentUserRole = signal('admin');
    userInitials = signal('AD');

    menuItems = [
        { label: 'Tableau de bord', icon: 'dashboard', route: '/admin/dashboard' },
        { label: 'Agences', icon: 'business', route: '/admin/agencies' },
        { label: 'Utilisateurs', icon: 'people', route: '/admin/users' },
        { label: 'Mon profil', icon: 'person', route: '/admin/profile' },
    ];

    ngOnInit() {
        const role = this.authService.getRole();
        if (role) {
            this.currentUserRole.set(role);
        }
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => this.router.navigate(['/login']),
            error: () => this.router.navigate(['/login'])
        });
    }
}
