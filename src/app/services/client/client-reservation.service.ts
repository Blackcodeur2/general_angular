import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../../models/reservation';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientReservationService {
  private readonly API = environment.apiUrl;
  private http = inject(HttpClient);

  /**
   * Récupère toutes les réservations du client
   */
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API}/client/reservations`);
  }

  /**
   * Récupère les réservations du client filtrées par statut
   */
  getReservationsByStatus(status: 'confirmee' | 'en_attente' | 'annulee'): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API}/client/reservations?statut=${status}`);
  }

  /**
   * Récupère les détails d'une réservation spécifique
   */
  getReservationDetails(reservationId: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.API}/client/reservations/${reservationId}`);
  }

  /**
   * Crée une nouvelle réservation
   */
  createReservation(data: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.API}/client/reservations`, data);
  }

  /**
   * Annule une réservation
   */
  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.API}/client/reservations/${reservationId}`);
  }

  /**
   * Récupère le ticket de réservation (PDF)
   */
  getReservationTicket(reservationId: number): Observable<Blob> {
    return this.http.get(`${this.API}/client/reservations/${reservationId}/ticket`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Initie le paiement CamPay
   */
  initiatePayment(reservationId: number, phone: string): Observable<any> {
    return this.http.post(`${this.API}/client/payments/initiate`, { reservation_id: reservationId, phone });
  }

  /**
   * Vérifie le statut du paiement (Polling)
   */
  checkPaymentStatus(reference: string): Observable<any> {
    return this.http.get(`${this.API}/client/payments/status/${reference}`);
  }
}
