import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientReservationService } from '../../../services/client/client-reservation.service';
import { Reservation } from '../../../models/reservation';

import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './mes-reservations.page.html',
  styleUrl: './mes-reservations.page.css'
})
export class MesReservationsPage implements OnInit {
  private reservationService = inject(ClientReservationService);
  private router = inject(Router);

  // Source of truth
  reservations = signal<Reservation[]>([]);
  
  // Search & Filters
  searchTerm = signal<string>('');
  activeFilter = signal<'all' | 'validee' | 'en_attente' | 'annule'>('all');
  isLoading = signal<boolean>(false);

  // Statistics
  stats = computed(() => {
    const all = this.reservations();
    const validated = all.filter(r => r.statut === 'validee');
    const totalSpent = validated.reduce((sum, r) => sum + Number(r.prix), 0);
    
    // Check for upcoming trips (departure date >= today)
    const today = new Date().toISOString().split('T')[0];
    const upcoming = validated.filter(r => r.voyage.date_depart.split('T')[0] >= today).length;

    return {
      total: all.length,
      upcoming,
      spent: totalSpent,
      validated: validated.length,
      pending: all.filter(r => r.statut === 'en attente' || r.statut === 'en_attente').length
    };
  });

  // Derived list
  filteredReservations = computed(() => {
    let list = this.reservations();
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase();

    if (filter !== 'all') {
      list = list.filter(r => r.statut === filter);
    }

    if (search) {
      list = list.filter(r => 
        r.num_reservation.toLowerCase().includes(search) ||
        (r.voyage?.trajet?.depart?.ville || '').toLowerCase().includes(search) ||
        (r.voyage?.trajet?.arrivee?.ville || '').toLowerCase().includes(search)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (response: any) => {
        // Handle both raw array and {data: []} response
        const data = Array.isArray(response) ? response : (response.data || []);
        this.reservations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations:', err);
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: 'all' | 'validee' | 'en_attente' | 'annule'): void {
    this.activeFilter.set(filter);
  }

  getCountByStatus(status: string): number {
    return this.reservations().filter(res => res.statut === status).length;
  }

  onViewDetails(reservationId: number): void {
    this.router.navigate(['/client/reservation-details', reservationId]);
  }

  onCancelReservation(reservationId: number): void {
    Swal.fire({
      title: 'Annuler la réservation ?',
      text: 'Cette action libérera votre siège pour d\'autres voyageurs.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Conserver',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading.set(true);
        this.reservationService.cancelReservation(reservationId).subscribe({
          next: () => {
            this.loadReservations();
            Swal.fire({
              title: 'Annulée',
              text: 'Votre réservation a été annulée avec succès.',
              icon: 'success',
              confirmButtonColor: '#2563eb'
            });
          },
          error: (err) => {
            console.error('Erreur lors de l\'annulation:', err);
            this.isLoading.set(false);
            Swal.fire({
              title: 'Erreur',
              text: 'Impossible d\'annuler la réservation pour le moment.',
              icon: 'error',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }

  // Helper for CSS classes
  getStatusClass(status: string): string {
    return status ? status.replace(' ', '_') : '';
  }

  onPayReservation(reservation: Reservation): void {
    // Re-use logic from NewReservationPage (could be factorized in a service/util later)
    Swal.fire({
      title: 'Paiement Mobile Money',
      text: `Payer ${reservation.prix} XAF pour la réservation ${reservation.num_reservation}`,
      input: 'tel',
      inputPlaceholder: '6xxxxxxxx',
      showCancelButton: true,
      confirmButtonText: 'Lancer le paiement',
      showLoaderOnConfirm: true,
      preConfirm: (phone) => {
        if (!phone || phone.length < 9) {
          Swal.showValidationMessage('Veuillez entrer un numéro valide');
          return false;
        }
        const fullPhone = phone.startsWith('237') ? phone : `237${phone}`;
        return new Promise((resolve) => {
          this.reservationService.initiatePayment(reservation.id, fullPhone).subscribe({
            next: (res: any) => resolve(res),
            error: (err: any) => {
              Swal.showValidationMessage(`Erreur: ${err.error?.message || 'Impossible d\'initier le paiement'}`);
              resolve(null);
            }
          });
        });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.startPaymentPolling(result.value.reference);
      }
    });
  }

  startPaymentPolling(reference: string): void {
    Swal.fire({
      title: 'Attente de confirmation',
      text: 'Veuillez valider l\'opération sur votre téléphone.',
      allowOutsideClick: false,
      willOpen: () => { Swal.showLoading(); }
    });

    const pollInterval = setInterval(() => {
      this.reservationService.checkPaymentStatus(reference).subscribe({
        next: (res: any) => {
          if (res.statut === 'SUCCESSFUL' || res.statut === 'validee') {
            clearInterval(pollInterval);
            Swal.fire('Succès', 'Paiement confirmé ! Votre réservation est validée.', 'success');
            this.loadReservations();
          } else if (res.statut === 'FAILED' || res.statut === 'echoue') {
            clearInterval(pollInterval);
            Swal.fire('Échec', 'Le paiement a échoué.', 'error');
          }
        }
      });
    }, 5000);

    setTimeout(() => clearInterval(pollInterval), 120000);
  }

  onDownloadTicket(reservation: Reservation): void {
    this.reservationService.getReservationTicket(reservation.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ticket-${reservation.num_reservation}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement:', err);
        alert('Erreur lors du téléchargement du ticket');
      }
    });
  }

  goToVoyages(): void {
    this.router.navigate(['/client/voyages']);
  }
}
