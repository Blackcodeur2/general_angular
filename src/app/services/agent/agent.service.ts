import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { Route } from '../../models/route';
import { Voyage } from '../../models/voyage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = environment.apiUrl;

  getDashboardStats(): Observable<{ sales_today: number; active_reservations: number; revenue_today: number; pending_validations: number }> {
    return this.http.get<{ statut: boolean; data: any }>(`${this.API}/agent/dashboard`).pipe(map(response => response.data));
  }

  getReservations(): Observable<any[]> {
    return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/agent/reservations`).pipe(map(response => response.data));
  }

  getRoutes(): Observable<Route[]> {
    return this.http.get<{ statut: boolean; data: Route[] }>(`${this.API}/agent/routes`).pipe(map(response => response.data));
  }

  getVoyages(): Observable<Voyage[]> {
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/agent/voyages`).pipe(map(response => response.data));
  }

  createBooking(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API}/agent/bookings`, payload);
  }

  validateTicket(code: string): Observable<any> {
    return this.http.post<any>(`${this.API}/agent/tickets/validate`, { code });
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/agent/reservations/${id}`);
  }

  getReservationDetail(id: number): Observable<any> {
    return this.http.get<{ statut: boolean; data: any }>(`${this.API}/agent/reservations/${id}`).pipe(map(response => response.data));
  }
}
