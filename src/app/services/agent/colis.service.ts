import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface Colis {
  id?: number;
  user_id: number;
  voyage_id: number;
  nom_colis: string;
  chemin_image?: string;
  tel_destinataire: string;
  nom_destinataire: string;
  provenance: number;
  destination: number;
  prix: number;
  poids: number;
  statut: string;
  created_at?: string;
  user?: any;
  voyage?: any;
  gareProvenance?: any;
  gareDestination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ColisService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = environment.apiUrl;

  getColis(): Observable<Colis[]> {
    return this.http.get<{ statut: boolean; data: Colis[] }>(`${this.API}/${this.getPrefix()}/colis`)
      .pipe(map(response => response.data));
  }

  createColis(payload: Partial<Colis>): Observable<Colis> {
    return this.http.post<{ statut: boolean; data: Colis }>(`${this.API}/${this.getPrefix()}/colis`, payload)
      .pipe(map(response => response.data));
  }

  updateColisStatus(id: number, statut: string): Observable<Colis> {
    return this.http.patch<{ statut: boolean; data: Colis }>(`${this.API}/${this.getPrefix()}/colis/${id}/status`, { statut })
      .pipe(map(response => response.data));
  }

  private getPrefix(): string {
    const user = this.authService.currentUser();
    return user?.role_user === 'AGENT' ? 'agent' : 'chef-agence';
  }
}
