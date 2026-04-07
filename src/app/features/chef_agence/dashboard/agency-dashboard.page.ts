import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AgencyOpsService } from '../../../services/agency/agency-ops.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Bus } from '../../../models/bus';
import { Route } from '../../../models/route';
import { Voyage } from '../../../models/voyage';
import { User } from '../../../models/user';

@Component({
  selector: 'app-agency-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agency-dashboard.page.html',
  styleUrls: ['./agency-dashboard.page.css']
})
export class AgencyDashboardPage implements OnInit {
  private agencyService = inject(AgencyOpsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(true);
  buses = signal<Bus[]>([]);
  staff = signal<User[]>([]);
  routes = signal<Route[]>([]);
  voyages = signal<Voyage[]>([]);
  user = signal<User | null>(this.authService.currentUser());

  recentReservations = signal([
    { id: 823, clientName: 'Aissa N.', route: 'Yaoundé → Douala', amount: 15800, date: '25/04/2026' },
    { id: 824, clientName: 'Jean Dupont', route: 'Douala → Kribi', amount: 21500, date: '25/04/2026' },
    { id: 825, clientName: 'Sophie T.', route: 'Bafoussam → Yaoundé', amount: 14200, date: '24/04/2026' },
    { id: 826, clientName: 'Moussa K.', route: 'Ebolowa → Douala', amount: 17600, date: '24/04/2026' }
  ]);

  agencyName = computed(() => {
    if (this.user()?.prenom) {
      return `Tableau de bord de ${this.user()?.prenom}`;
    }
    return 'Tableau de bord Agence';
  });

  agencyStatus = computed(() => {
    if (this.isLoading()) {
      return 'Chargement des données de l’agence…';
    }
    return `${this.totalBuses()} bus · ${this.totalRoutes()} lignes · ${this.activeStaff()} membres actifs`; 
  });

  totalBuses = computed(() => this.buses().length);
  totalStaff = computed(() => this.staff().length);
  totalRoutes = computed(() => this.routes().length);
  busesOnRoad = computed(() => this.buses().filter(bus => bus.statut === 'en voyage').length);
  activeStaff = computed(() => this.staff().filter(member => ['CHAUFFEUR', 'AGENT'].includes(member.role_user)).length);
  ticketsSoldToday = computed(() => Math.max(0, Math.round(this.dailyRevenue() / 2300)));
  dailyRevenue = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.voyages().filter(voyage => voyage.date_depart === today).length * 22000;
  });

  revenueChart = computed(() => {
    const today = new Date();
    const chart = [] as Array<{ day: string; amount: number; height: number }>;

    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dayKey = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const amount = this.voyages().filter(v => v.date_depart === dayKey).length * 22000;
      chart.push({ day: label, amount, height: Math.min(100, Math.max(12, Math.round(amount / 1200))) });
    }

    return chart;
  });

  fleetStatus = computed(() => {
    const total = Math.max(this.totalBuses(), 1);
    const inService = this.buses().filter(bus => bus.statut === 'en voyage').length;
    const available = this.buses().filter(bus => bus.statut === 'disponible').length;
    const maintenance = this.buses().filter(bus => bus.statut === 'en maintenance').length;
    const unavailable = this.buses().filter(bus => bus.statut === 'indisponible').length;

    return [
      { label: 'En route', count: inService, percentage: Math.round((inService / total) * 100), color: '#60A5FA' },
      { label: 'Disponible', count: available, percentage: Math.round((available / total) * 100), color: '#34D399' },
      { label: 'Maintenance', count: maintenance, percentage: Math.round((maintenance / total) * 100), color: '#FBBF24' },
      { label: 'Indisponible', count: unavailable, percentage: Math.round((unavailable / total) * 100), color: '#F87171' }
    ];
  });

  liveTrips = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.voyages()
      .filter(v => v.date_depart >= today)
      .sort((a, b) => (a.date_depart + (a.heure_depart || '')).localeCompare(b.date_depart + (b.heure_depart || '')))
      .slice(0, 5);
  });

  ngOnInit() {
    this.loadStats();
  }

  navigateTo(path: string) {
    void this.router.navigate([path]);
  }

  private loadStats() {
    this.isLoading.set(true);

    forkJoin({
      buses: this.agencyService.getBuses().pipe(catchError(() => of([] as Bus[]))),
      staff: this.agencyService.getStaff().pipe(catchError(() => of([] as User[]))),
      routes: this.agencyService.getRoutes().pipe(catchError(() => of([] as Route[]))),
      voyages: this.agencyService.getVoyages().pipe(catchError(() => of([] as Voyage[])))
    }).subscribe(({ buses, staff, routes, voyages }) => {
      this.buses.set(buses);
      this.staff.set(staff);
      this.routes.set(routes);
      this.voyages.set(voyages);
      this.isLoading.set(false);
    });
  }
}
