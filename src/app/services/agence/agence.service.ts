import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agence } from '../../models/agence';
import { Gare } from '../../models/gare';

@Injectable({
    providedIn: 'root'
})
export class AgenceService {
    private http = inject(HttpClient);
    private readonly API = 'http://127.0.0.1:8000/api';

    getAgences(): Observable<Agence[]> {
        return this.http.get<Agence[]>(`${this.API}/admin/agences`);
    }

    createGare(gare: Partial<Gare>): Observable<Gare> {
        return this.http.post<Gare>(`${this.API}/admin/gares`, gare);
    }

    createAgence(agence: Partial<Agence>): Observable<Agence> {
        return this.http.post<Agence>(`${this.API}/admin/agences`, agence);
    }
}
