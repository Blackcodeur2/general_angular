import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  /**
   * Downloads the PDF ticket for a given reservation.
   * The backend handles rendering via DomPDF.
   */
  downloadTicket(reservationId: number): void {
    const url = `${this.API}/agent/reservations/${reservationId}/ticket`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `ticket-reservation-${reservationId}.pdf`;
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err: any) => {
        console.error('Erreur lors du téléchargement du ticket:', err);
      }
    });
  }

  /**
   * Opens the PDF in a new browser tab instead of downloading.
   */
  openTicket(reservationId: number): void {
    const url = `${this.API}/agent/reservations/${reservationId}/ticket`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank');
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ouverture du ticket:', err);
      }
    });
  }
}
