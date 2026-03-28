import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [CommonModule, MatIconModule, TitleCasePipe, DatePipe, ButtonComponent],
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.css']
})
export class ProfilePage implements OnInit {
    private authService = inject(AuthService);

    user = this.authService.currentUser;

    ngOnInit() {
        if (!this.user() && this.authService.isLoggedIn()) {
            this.authService.fetchUser().subscribe({
                error: (err) => console.error("Impossible de récupérer le profil", err)
            });
        }
    }

    getInitials(nom: string | undefined, prenom: string | undefined): string {
        const n = nom ? nom[0] : '';
        const p = prenom ? prenom[0] : '';
        return (p + n).toUpperCase() || 'U';
    }
}
