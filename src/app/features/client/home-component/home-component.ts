import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClientReservationService } from '../../../services/client/client-reservation.service';
import { Reservation } from '../../../models/reservation';
import { User } from '../../../models/user';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ClientReservationService);
  private router = inject(Router);

  currentUser: User | null = null;
  reservations: Reservation[] = [];
  upcomingReservations: Reservation[] = [];

  activeReservations = 0;
  confirmedReservations = 0;
  pendingReservations = 0;
  totalSpent = 0;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.calculateStats();
        this.getUpcomingReservations();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations:', err);
      }
    });
  }

  private calculateStats(): void {
    this.confirmedReservations = this.reservations.filter(r => r.statut === 'confirmee').length;
    this.pendingReservations = this.reservations.filter(r => r.statut === 'en_attente').length;
    this.activeReservations = this.confirmedReservations + this.pendingReservations;
    this.totalSpent = this.reservations.reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  private getUpcomingReservations(): void {
    const today = new Date();
    this.upcomingReservations = this.reservations
      .filter(r => {
        const departDate = new Date(r.voyage.date_depart);
        return departDate >= today && r.statut === 'confirmee';
      })
      .sort((a, b) => new Date(a.voyage.date_depart).getTime() - new Date(b.voyage.date_depart).getTime());
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}

