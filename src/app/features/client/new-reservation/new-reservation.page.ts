import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClientVoyageService } from '../../../services/client/client-voyage.service';
import { Voyage } from '../../../models/voyage';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-new-reservation',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './new-reservation.page.html',
  styleUrl: './new-reservation.page.css'
})
export class NewReservationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private voyageService = inject(ClientVoyageService);

  // States
  voyageId = signal<number | null>(null);
  voyage = signal<Voyage | null>(null);
  occupiedSeats = signal<string[]>([]);
  selectedSeat = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Computed
  isSmallBus = computed(() => {
    const places = this.voyage()?.bus?.nb_places || 0;
    return places <= 35; // Coaster style
  });

  busColumns = computed(() => {
    return this.isSmallBus() ? 3 : 4; // 2+1 or 2+2
  });

  seatsArray = computed(() => {
    const count = this.voyage()?.bus?.nb_places || 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('voyageId');
    if (id) {
      this.voyageId.set(+id);
      this.loadData();
    } else {
      this.router.navigate(['/client/voyages']);
    }
  }

  loadData(): void {
    if (!this.voyageId()) return;
    this.isLoading.set(true);

    // Load voyage details and occupations in parallel or sequence
    this.voyageService.getVoyageDetails(this.voyageId()!).subscribe({
      next: (v) => {
        this.voyage.set(v);
        this.loadOccupations();
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('Erreur', 'Impossible de charger les détails du voyage.', 'error');
      }
    });
  }

  loadOccupations(): void {
    this.voyageService.getOccupiedSeats(this.voyageId()!).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (occupied) => this.occupiedSeats.set(occupied),
      error: () => console.error('Erreur lors du chargement des places occupées')
    });
  }

  isOccupied(seat: number): boolean {
    return this.occupiedSeats().includes(seat.toString());
  }

  selectSeat(seat: number): void {
    if (this.isOccupied(seat)) return;
    this.selectedSeat.set(seat === this.selectedSeat() ? null : seat);
  }

  confirmBooking(): void {
    if (!this.selectedSeat()) return;

    Swal.fire({
      title: 'Confirmer la réservation',
      text: `Voulez-vous réserver la place N°${this.selectedSeat()} pour ce voyage ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, réserver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitReservation();
      }
    });
  }

  submitReservation(): void {
    this.isSubmitting.set(true);
    const payload = {
      voyage_id: this.voyageId()!,
      place: this.selectedSeat()!,
      gare_id: this.voyage()?.gare?.id // Use voyage's departure gare if available
    };

    this.voyageService.createReservation(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const reservationId = res.data?.id || res.id;
        
        Swal.fire({
          title: 'Réservation Enregistrée !',
          text: 'Votre siège est réservé temporairement. Souhaitez-vous payer maintenant par Mobile Money pour valider définitivement votre place ?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Payer Maintenant',
          cancelButtonText: 'Plus tard',
          confirmButtonColor: '#2563eb'
        }).then((result) => {
          if (result.isConfirmed) {
            this.processPayment(reservationId);
          } else {
            this.router.navigate(['/client/mes-reservations']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        Swal.fire('Erreur', err.error?.message || 'Une erreur est survenue lors de la réservation.', 'error');
      }
    });
  }

  processPayment(reservationId: number): void {
    Swal.fire({
      title: 'Paiement Mobile Money',
      text: 'Entrez votre numéro de téléphone (Orange ou MTN)',
      input: 'tel',
      inputPlaceholder: '6xxxxxxxx',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Lancer le paiement',
      showLoaderOnConfirm: true,
      preConfirm: (phone) => {
        if (!phone || phone.length < 9) {
          Swal.showValidationMessage('Veuillez entrer un numéro valide');
          return false;
        }
        // Normalize phone (ensure 237 prefix if missing)
        const fullPhone = phone.startsWith('237') ? phone : `237${phone}`;
        
        return new Promise((resolve) => {
          this.voyageService.initiatePayment(reservationId, fullPhone).subscribe({
            next: (res) => resolve(res),
            error: (err) => {
              Swal.showValidationMessage(`Erreur: ${err.error?.message || 'Impossible d\'initier le paiement'}`);
              resolve(null);
            }
          });
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.startPaymentPolling(result.value.reference);
      }
    });
  }

  startPaymentPolling(reference: string): void {
    Swal.fire({
      title: 'Attente de confirmation',
      text: 'Veuillez valider l\'opération sur votre téléphone en saisissant votre code secret.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    const pollInterval = setInterval(() => {
      this.voyageService.checkPaymentStatus(reference).subscribe({
        next: (res) => {
          if (res.statut === 'SUCCESSFUL' || res.statut === 'validee') {
            clearInterval(pollInterval);
            Swal.fire({
              title: 'Paiement Confirmé !',
              text: 'Votre réservation est désormais validée. Bon voyage !',
              icon: 'success',
              confirmButtonColor: '#2563eb'
            }).then(() => {
              this.router.navigate(['/client/mes-reservations']);
            });
          } else if (res.statut === 'FAILED' || res.statut === 'echoue') {
            clearInterval(pollInterval);
            Swal.fire('Échec du paiement', 'La transaction a échoué ou a été annulée.', 'error');
          }
        },
        error: () => {
          // Continue polling or handle major error
          console.error('Erreur lors du polling du paiement');
        }
      });
    }, 5000); // Poll every 5 seconds (as per user config)

    // Timeout polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (Swal.isVisible() && Swal.isLoading()) {
        Swal.fire('Délai dépassé', 'Nous n\'avons pas reçu de confirmation. Vous pourrez vérifier le statut plus tard dans vos réservations.', 'info').then(() => {
          this.router.navigate(['/client/mes-reservations']);
        });
      }
    }, 120000);
  }

  goBack(): void {
    this.router.navigate(['/client/voyages']);
  }
}
