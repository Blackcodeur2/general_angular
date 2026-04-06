import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-proprietaire-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './proprietaire-dashboard.page.html',
  styleUrls: ['./proprietaire-dashboard.page.css']
})
export class ProprietaireDashboardPage implements OnInit {
  private authService = inject(AuthService);
  
  userName = signal('');
  kycStatus = signal<'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_STARTED'>('NOT_STARTED');
  
  stats = [
    { label: 'Agences', value: 0, icon: 'business', color: '#3b82f6' },
    { label: 'Gérants', value: 0, icon: 'supervisor_account', color: '#10b981' },
    { label: 'Voyages en cours', value: 0, icon: 'directions_bus', color: '#f59e0b' },
    { label: 'Revenus (Mensuel)', value: '0 XAF', icon: 'payments', color: '#8b5cf6' }
  ];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(`${user.prenom} ${user.nom}`);
    }
    // Simulate fetching owner data
    // this.kycStatus.set('NOT_STARTED');
  }
}
