import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Bus } from '../../models/bus';
import { Route } from '../../models/route';
import { Voyage } from '../../models/voyage';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user';
import { Gare } from '../../models/gare';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AgencyOpsService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private readonly API = environment.apiUrl;

    // Buses
    getBuses(): Observable<Bus[]> {
        return this.http.get<{ statut: boolean; data: Bus[] }>(`${this.API}/chef-agence/buses`)
            .pipe(map((response: { statut: boolean; data: Bus[] }) => response.data));
    }

    getBusesDispo(): Observable<Bus[]> {
        return this.http.get<{ statut: boolean; data: Bus[] }>(`${this.API}/chef-agence/buses/dispo`)
            .pipe(map((response: { statut: boolean; data: Bus[] }) => response.data));
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
            .pipe(map((response: { statut: boolean; data: Route[] }) => response.data));
    }

    createRoute(route: Partial<Route>): Observable<Route> {
        return this.http.post<Route>(`${this.API}/chef-agence/trajets`, route);
    }

    updateRoute(route: Partial<Route>): Observable<Route> {
        return this.http.put<Route>(`${this.API}/chef-agence/trajets/${route.id}`, route);
    }

    // Gares
    getGares(): Observable<Gare[]> {
        return this.http.get<{ statut: boolean; data: Gare[] }>(`${this.API}/chef-agence/gares`)
            .pipe(map((response: { statut: boolean; data: Gare[] }) => response.data));
    }

    // Staff
    getStaff(): Observable<User[]> {
        return this.http.get<{ statut: boolean; data: User[] }>(`${this.API}/chef-agence/utilisateurs`)
            .pipe(map((response: { statut: boolean; data: User[] }) => response.data));
    }

    getChauffeurs(): Observable<User[]> {
        return this.http.get<{ statut: boolean; data: User[] }>(`${this.API}/chef-agence/utilisateurs`)
            .pipe(map((response: { statut: boolean; data: User[] }) => response.data.filter((user: User) => user.role_user === 'CHAUFFEUR')));
    }

    addStaff(staff: any): Observable<User> {
        return this.http.post<User>(`${this.API}/chef-agence/staff`, staff);
    }

    updateStaff(staff: any): Observable<User> {
        return this.http.put<User>(`${this.API}/chef-agence/staff/${staff.id}`, staff);
    }

    exportPersonnelPdf(): Observable<Blob> {
        return this.http.get(`${this.API}/chef-agence/export-personnel`, { responseType: 'blob' });
    }

    exportBusesPdf(): Observable<Blob> {
        return this.http.get(`${this.API}/chef-agence/export-buses`, { responseType: 'blob' });
    }

    exportRoutesPdf(): Observable<Blob> {
        return this.http.get(`${this.API}/chef-agence/export-trajets`, { responseType: 'blob' });
    }

    exportVoyagesPdf(): Observable<Blob> {
        return this.http.get(`${this.API}/chef-agence/export-voyages`, { responseType: 'blob' });
    }

    exportReservationsPdf(): Observable<Blob> {
        return this.http.get(`${this.API}/chef-agence/export-reservations`, { responseType: 'blob' });
    }

    // Voyages
    getVoyages(): Observable<Voyage[]> {
        return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.API}/chef-agence/voyages`)
            .pipe(map((response: { statut: boolean; data: Voyage[] }) => response.data));
    }

    createVoyage(voyage: Partial<Voyage>): Observable<Voyage> {
        return this.http.post<Voyage>(`${this.API}/chef-agence/voyages`, voyage);
    }

    updateVoyage(voyage: Partial<Voyage>): Observable<Voyage> {
        return this.http.put<Voyage>(`${this.API}/chef-agence/voyages/${voyage.id}`, voyage);
    }

    getDashboardStats(): Observable<any> {
        return this.http.get<{ statut: boolean; data: any }>(`${this.API}/chef-agence/dashboard-stats`)
            .pipe(map((response: { statut: boolean; data: any }) => response.data));
    }

    // Reservations
    getReservations(): Observable<any[]> {
        return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/chef-agence/reservations`)
            .pipe(map((response: { statut: boolean; data: any[] }) => response.data));
    }

    cancelReservation(id: number): Observable<any> {
        return this.http.delete<any>(`${this.API}/chef-agence/reservations/${id}`);
    }
}
