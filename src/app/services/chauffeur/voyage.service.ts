import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Voyage } from '../../models/voyage';
import { Incident } from '../../models/incident';


@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = 'http://127.0.0.1:8000/api/voyages';
  private incidentUrl = 'http://127.0.0.1:8000/api/incidents';

  constructor(private http: HttpClient) {}

  // Get current and upcoming program for the connected chauffeur
  getProgrammeChauffeur(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/chauffeur/programme`);
  }

  // Get past trips completed by the chauffeur
  getHistoriqueChauffeur(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/chauffeur/historique`);
  }

  // Report an incident for a specific voyage
  signalerIncident(incident: Incident): Observable<any> {
    return this.http.post<any>(this.incidentUrl, incident);
  }
}
