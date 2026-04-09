import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientReservationService } from '../../../services/client/client-reservation.service';
import { Reservation } from '../../../models/reservation';

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-reservations.page.html',
  styleUrl: './mes-reservations.page.css'
})
export class MesReservationsPage implements OnInit {
  private reservationService = inject(ClientReservationService);
  private router = inject(Router);

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  activeFilter: 'all' | 'confirmee' | 'en_attente' | 'annulee' = 'all';
  isLoading = false;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations:', err);
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: 'all' | 'confirmee' | 'en_attente' | 'annulee'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredReservations = this.reservations;
    } else {
      this.filteredReservations = this.reservations.filter(
        res => res.statut === this.activeFilter
      );
    }
  }

  getCountByStatus(status: string): number {
    return this.reservations.filter(res => res.statut === status).length;
  }

  onViewDetails(reservationId: number): void {
    this.router.navigate(['/client/reservation-details', reservationId]);
  }

  onCancelReservation(reservationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.loadReservations(); // Recharger la liste
          alert('Réservation annulée avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de l\'annulation:', err);
          alert('Erreur lors de l\'annulation de la réservation');
        }
      });
    }
  }

  onDownloadReceipt(reservationId: number): void {
    this.reservationService.getReservationReceipt(reservationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${reservationId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement:', err);
        alert('Erreur lors du téléchargement du reçu');
      }
    });
  }

  goToVoyages(): void {
    this.router.navigate(['/client/voyages']);
  }
}
