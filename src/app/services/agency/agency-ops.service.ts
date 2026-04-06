import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bus } from '../../models/bus';
import { Route } from '../../models/route';
import { Voyage } from '../../models/voyage';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user';

@Injectable({
    providedIn: 'root'
})
export class AgencyOpsService {
    private http = inject(HttpClient);
    private readonly API = 'http://127.0.0.1:8000/api';

    private authService = inject(AuthService);
    
    // Buses
    getBuses(): Observable<Bus[]> {
        const user = this.authService.currentUser();
        return this.http.get<Bus[]>(`${this.API}/agency/buses/${user?.gare_id}`);
    }

    createBus(bus: Partial<Bus>): Observable<Bus> {
        return this.http.post<Bus>(`${this.API}/agency/buses`, bus);
    }

    updateBus(bus: Partial<Bus>): Observable<Bus> {
        return this.http.put<Bus>(`${this.API}/agency/buses/bus/${bus.id}`, bus);
    }

    // Routes
    getRoutes(): Observable<Route[]> {
        const user = this.authService.currentUser();
        return this.http.get<Route[]>(`${this.API}/agency/trajets/${user?.gare_id}`);
    }

    createRoute(route: Partial<Route>): Observable<Route> {
        return this.http.post<Route>(`${this.API}/agency/trajets/`, route);
    }

    // Staff
    getStaff(): Observable<User[]> {
        const user = this.authService.currentUser();
        return this.http.get<User[]>(`${this.API}/agency/staff/${user?.gare_id}`);
    }

    getChauffeurs(): Observable<User[]> {
        const user = this.authService.currentUser();
        return this.http.get<User[]>(`${this.API}/agency/staff/ch/${user?.gare_id}`);
    }

    addStaff(staff: any): Observable<User> {
        return this.http.post<User>(`${this.API}/agency/staff`, staff);
    }

    // Voyages
    getVoyages(): Observable<Voyage[]> {
        return this.http.get<Voyage[]>(`${this.API}/agency/voyages`);
    }

    createVoyage(voyage: Partial<Voyage>): Observable<Voyage> {
        return this.http.post<Voyage>(`${this.API}/agency/voyages/v`, voyage);
    }
}
