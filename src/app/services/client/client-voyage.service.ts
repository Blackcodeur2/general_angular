import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Voyage } from '../../models/voyage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientVoyageService {
  private readonly API = environment.apiUrl;
  private http = inject(HttpClient);

  /**
   * Récupère tous les voyages disponibles
   */
  getAvailableVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.API}/voyages`);
  }

  /**
   * Récupère les voyages filtrés par ville de départ et d'arrivée
   */
  searchVoyages(villeDepart: string, villeArrivee: string, dateDepart?: string): Observable<Voyage[]> {
    let params = `?ville_depart=${villeDepart}&ville_arrivee=${villeArrivee}`;
    if (dateDepart) {
      params += `&date_depart=${dateDepart}`;
    }
    return this.http.get<Voyage[]>(`${this.API}/voyages${params}`);
  }

  /**
   * Récupère les détails d'un voyage spécifique
   */
  getVoyageDetails(voyageId: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.API}/voyages/${voyageId}`);
  }

  /**
   * Récupère les sièges disponibles pour un voyage
   */
  getAvailableSeats(voyageId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/voyages/${voyageId}/available-seats`);
  }
}
