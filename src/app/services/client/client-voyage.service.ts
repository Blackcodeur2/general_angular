import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/client/voyages`).pipe(
      map((res: { statut: boolean; data: Voyage[] }) => (res.data || []).map((v: any) => this.normalizeVoyage(v)))
    );
  }

  /**
   * Récupère les voyages filtrés par ville de départ et d'arrivée
   */
  searchVoyages(villeDepart: string, villeArrivee: string, dateDepart?: string): Observable<Voyage[]> {
    let params = `?ville_depart=${villeDepart}&ville_arrivee=${villeArrivee}`;
    if (dateDepart) {
      params += `&date_depart=${dateDepart}`;
    }
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/client/voyages${params}`).pipe(
      map((res: { statut: boolean; data: Voyage[] }) => (res.data || []).map((v: any) => this.normalizeVoyage(v)))
    );
  }

  /**
   * Récupère les détails d'un voyage spécifique
   */
  getVoyageDetails(voyageId: number): Observable<Voyage> {
    return this.http.get<{ statut: boolean; data: Voyage }>(`${this.API}/client/voyages/${voyageId}`).pipe(
      map((res: { statut: boolean; data: Voyage }) => this.normalizeVoyage(res.data))
    );
  }

  /**
   * Normalise les données du voyage (compatibilité VoyageRessource vs Raw Model)
   */
  private normalizeVoyage(v: any): Voyage {
    if (!v) return v;
    return {
      ...v,
      num_voyage: v.num_voyage || (v as any).numVoyage,
      ville_depart: v.ville_depart || v.trajet?.depart?.ville || v.trajet?.gare_depart?.ville,
      ville_arrivee: v.ville_arrivee || v.trajet?.arrivee?.ville || v.trajet?.gare_arrivee?.ville,
      vehicule_immatriculation: v.vehicule_immatriculation || v.bus?.immatriculation,
      prix: v.prix || v.trajet?.prix || 0,
      chauffeur: v.chauffeur || (v as any).driver ? {
        id: (v as any).driver?.id,
        nom: (v as any).driver?.name,
        prenom: '',
        telephone: (v as any).driver?.phone
      } : v.chauffeur
    };
  }

  /**
   * Récupère les sièges disponibles pour un voyage
   */
  getAvailableSeats(voyageId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/voyages/${voyageId}/available-seats`);
  }
}
