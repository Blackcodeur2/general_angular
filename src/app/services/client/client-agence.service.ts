import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agence } from '../../models/agence';
import { Gare } from '../../models/gare';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientAgenceService {
  private readonly API = environment.apiUrl;
  private http = inject(HttpClient);

  /**
   * Récupère toutes les agences
   */
  getAgencies(): Observable<Agence[]> {
    return this.http.get<Agence[]>(`${this.API}/agencies`);
  }

  /**
   * Récupère les détails d'une agence spécifique avec ses gares
   */
  getAgencyDetails(agencyId: number): Observable<Agence> {
    return this.http.get<Agence>(`${this.API}/agencies/${agencyId}`);
  }

  /**
   * Récupère les gares d'une agence
   */
  getAgencyGares(agencyId: number): Observable<Gare[]> {
    return this.http.get<Gare[]>(`${this.API}/agencies/${agencyId}/gares`);
  }

  /**
   * Récupère les voyages d'une agence
   */
  getAgencyVoyages(agencyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/agencies/${agencyId}/voyages`);
  }
}
