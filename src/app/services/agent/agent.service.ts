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
    return this.http.get<{ statut: boolean; data: any }>(`${this.API}/agent/dashboard`)
      .pipe(map((response: { statut: boolean; data: any }) => response.data));
  }

  getReservations(): Observable<any[]> {
    return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/agent/reservations`)
      .pipe(map((response: { statut: boolean; data: any[] }) => response.data));
  }

  getRoutes(): Observable<Route[]> {
    return this.http.get<{ statut: boolean; data: Route[] }>(`${this.API}/agent/routes`)
      .pipe(map((response: { statut: boolean; data: Route[] }) => response.data));
  }

  getVoyages(): Observable<Voyage[]> {
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/agent/voyages`)
      .pipe(map((response: { statut: boolean; data: Voyage[] }) => response.data));
  }

  createBooking(payload: any): Observable<any> {
    return this.http.post<{ statut: boolean; data: any }>(`${this.API}/agent/reservations`, payload)
      .pipe(map((response: { statut: boolean; data: any }) => response.data));
  }

  validateTicket(code: string): Observable<any> {
    let user = this.authService.currentUser();
    let role= "";
    if(user?.role_user === "AGENT"){
      role = "agent";
    }else{
      role = "chef-agence";
    }
    return this.http.post<{ statut: boolean; data: any }>(`${this.API}/${ role }/tickets/validate`, { code })
      .pipe(map((response: { statut: boolean; data: any }) => response.data));
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/agent/reservations/${id}`);
  }

  getReservationDetail(id: number): Observable<any> {
    return this.http.get<{ statut: boolean; data: any }>(`${this.API}/agent/reservations/${id}`)
      .pipe(map((response: { statut: boolean; data: any }) => response.data));
  }

  // ── Client Management ──
  searchClients(query: string): Observable<any[]> {
    return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/agent/clients/search?query=${query}`)
      .pipe(map((response: { statut: boolean; data: any[] }) => response.data));
  }

  createClient(payload: any): Observable<any> {
    return this.http.post<{ statut: boolean; data: any }>(`${this.API}/agent/clients`, payload)
      .pipe(map((response: { statut: boolean; data: any }) => response.data));
  }

  // ── Voyage & Seats ──
  getVoyagesByRoute(routeId: number, date: string): Observable<Voyage[]> {
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/agent/voyages/search?route_id=${routeId}&date=${date}`)
      .pipe(map((response: { statut: boolean; data: Voyage[] }) => response.data));
  }

  getAvailableSeats(voyageId: number): Observable<string[]> {
    return this.http.get<{ statut: boolean; data: string[] }>(`${this.API}/agent/voyages/${voyageId}/available-seats`)
      .pipe(map((response: { statut: boolean; data: string[] }) => response.data));
  }
}
