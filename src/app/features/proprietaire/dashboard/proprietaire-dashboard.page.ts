import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ProprietaireService } from '../../../services/proprietaire/proprietaire.service';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

interface Stats {
  agences: number;
  gares: number;
  buses: number;
  trajets: number;
  voyages: number;
  utilisateurs: number;
  chauffeurs: number;
  agents: number;
}

@Component({
  selector: 'app-proprietaire-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './proprietaire-dashboard.page.html',
  styleUrls: ['./proprietaire-dashboard.page.css']
})
export class ProprietaireDashboardPage implements OnInit {
  private authService = inject(AuthService);
  private proprietaireService = inject(ProprietaireService);
  
  userName = signal('');
  kycStatus = signal('');
  stats = signal<Stats | null>(null);
  isLoading = signal(true);

  statItems = [
    { key: 'agences', label: 'Agences', icon: 'business', color: '#2563eb' },
    { key: 'gares', label: 'Gares', icon: 'location_on', color: '#f59e0b' },
    { key: 'buses', label: 'Bus', icon: 'directions_bus', color: '#f59e0b' },
    { key: 'trajets', label: 'Trajets', icon: 'route', color: '#8b5cf6' },
    { key: 'voyages', label: 'Voyages', icon: 'flight_takeoff', color: '#06b6d4' },
    { key: 'utilisateurs', label: 'Utilisateurs', icon: 'people', color: '#10b981' },
  ];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(`${user.prenom} ${user.nom}`);
      this.kycStatus.set(`${user.statut}`);
    }
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.proprietaireService.getMyStatistics().subscribe({
      next: (data) => {
        const statsData = data.data || data;
        this.stats.set(statsData);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('Erreur', 'Impossible de charger les statistiques.', 'error');
      }
    });
  }

  getStatValue(key: string): number {
    const stat = this.stats();
    if (!stat) return 0;
    return (stat as any)[key] || 0;
  }
}
