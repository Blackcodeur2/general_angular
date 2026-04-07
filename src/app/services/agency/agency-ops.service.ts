import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Bus } from '../../models/bus';
import { Route } from '../../models/route';
import { Voyage } from '../../models/voyage';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user';
import { Gare } from '../../models/gare';

@Injectable({
    providedIn: 'root'
})
export class AgencyOpsService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private readonly API = 'http://127.0.0.1:8000/api';

    // Buses
    getBuses(): Observable<Bus[]> {
        return this.http.get<{ statut: boolean; data: Bus[] }>(`${this.API}/chef-agence/buses`)
            .pipe(map(response => response.data));
    }

    createBus(bus: Partial<Bus>): Observable<Bus> {
        return this.http.post<Bus>(`${this.API}/chef-agence/buses`, bus);
    }

    updateBus(bus: Partial<Bus>): Observable<Bus> {
        return this.http.put<Bus>(`${this.API}/chef-agence/buses/${bus.id}`, bus);
    }

    // Routes
    getRoutes(): Observable<Route[]> {
        return this.http.get<{ statut: boolean; data: Route[] }>(`${this.API}/chef-agence/trajets`)
            .pipe(map(response => response.data));
    }

    createRoute(route: Partial<Route>): Observable<Route> {
        return this.http.post<Route>(`${this.API}/chef-agence/trajets`, route);
    }

    // Gares
    getGares(): Observable<Gare[]> {
        return this.http.get<{ statut: boolean; data: Gare[] }>(`${this.API}/chef-agence/gares`)
            .pipe(map(response => response.data));
    }

    // Staff
    getStaff(): Observable<User[]> {
        return this.http.get<{ statut: boolean; data: User[] }>(`${this.API}/chef-agence/utilisateurs`)
            .pipe(map(response => response.data));
    }

    getChauffeurs(): Observable<User[]> {
        return this.http.get<{ statut: boolean; data: User[] }>(`${this.API}/chef-agence/utilisateurs`)
            .pipe(map(response => response.data.filter(user => user.role_user === 'CHAUFFEUR')));
    }

    addStaff(staff: any): Observable<User> {
        return this.http.post<User>(`${this.API}/chef-agence/staff`, staff);
    }

    // Voyages
    getVoyages(): Observable<Voyage[]> {
        return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/chef-agence/voyages`)
            .pipe(map(response => response.data));
    }

    createVoyage(voyage: Partial<Voyage>): Observable<Voyage> {
        return this.http.post<Voyage>(`${this.API}/chef-agence/voyages`, voyage);
    }
}
