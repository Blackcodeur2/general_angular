import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AgencyLayoutComponent } from './layouts/agency-layout/agency-layout.component';
import { StaffLayoutComponent } from './layouts/staff-layout/staff-layout.component';
import { ChauffeurLayoutComponent } from './layouts/chauffeur-layout/chauffeur-layout.component';
import { ProprietaireLayoutComponent } from './layouts/proprietaire-layout/proprietaire-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Route par défaut - redirige vers splash
  {
    path: '',
    redirectTo: '/splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/public/landing/landing.page').then(m => m.LandingPage)
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // Auth Routes (Stand alone pages)
  {
    path: 'auth',
    canActivateChild: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login-component/login-component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register-component/register-component').then(m => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
      },
    ],
  },

  // --- ADMINISTRATION ROUTES ---

  // Super Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.page').then(m => m.AdminDashboardPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.page').then(m => m.AdminUsersPage),
      },
      {
        path: 'agencies',
        loadComponent: () => import('./features/admin/agencies/admin-agencies.page').then(m => m.AdminAgenciesPage),
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/admin/kyc/admin-kyc.page').then(m => m.AdminKycPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      },
    ]
  },

  // Chef d'agence
  {
    path: 'chef_agence',
    component: AgencyLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['CHEF_AGENCE'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/chef_agence/dashboard/agency-dashboard.page').then(m => m.AgencyDashboardPage),
      },
      {
        path: 'buses',
        loadComponent: () => import('./features/chef_agence/buses/agency-buses.page').then(m => m.AgencyBusesPage),
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/chef_agence/staff/agency-staff.page').then(m => m.AgencyStaffPage),
      },
      {
        path: 'routes',
        loadComponent: () => import('./features/chef_agence/routes/agency-routes.page').then(m => m.AgencyRoutesPage),
      },
      {
        path: 'voyages',
        loadComponent: () => import('./features/chef_agence/voyages/agency-voyages.page').then(m => m.AgencyVoyagesPage),
      },
      {
        path: 'booking',
        loadComponent: () => import('./features/staff/booking/booking.page').then(m => m.BookingPage),
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/staff/reservations/reservations.page').then(m => m.ReservationsPage),
      },
      {
        path: 'validate',
        loadComponent: () => import('./features/staff/validate/validate.page').then(m => m.ValidatePage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      },
    ]
  },

  // Agent / Staff
  {
    path: 'agent',
    component: StaffLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['AGENT'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/staff/dashboard/staff-dashboard.page').then(m => m.StaffDashboardPage),
      },
      {
        path: 'booking',
        loadComponent: () => import('./features/staff/booking/booking.page').then(m => m.BookingPage),
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/staff/reservations/reservations.page').then(m => m.ReservationsPage),
      },
      {
        path: 'validate',
        loadComponent: () => import('./features/staff/validate/validate.page').then(m => m.ValidatePage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      },
    ]
  },

  // Chauffeur
  {
    path: 'chauffeur',
    component: ChauffeurLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['CHAUFFEUR'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/chauffeur/dashboard/chauffeur-dashboard.page').then(m => m.ChauffeurDashboardPage),
      },
      {
        path: 'history',
        loadComponent: () => import('./features/chauffeur/history/voyage-history.page').then(m => m.VoyageHistoryPage),
      },
      {
        path: 'report-incident',
        loadComponent: () => import('./features/chauffeur/report-incident/report-incident.page').then(m => m.ReportIncidentPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      },
    ]
  },

  // --- OWNER / PROPRIETAIRE ROUTES ---
  {
    path: 'proprietaire',
    component: ProprietaireLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['PROPRIETAIRE'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/proprietaire/dashboard/proprietaire-dashboard.page').then(m => m.ProprietaireDashboardPage),
      },
      {
        path: 'agencies',
        loadComponent: () => import('./features/proprietaire/agencies/agencies.page').then(m => m.AgenciesPage),
      },
      {
        path: 'gares',
        loadComponent: () => import('./features/proprietaire/gares/gares.page').then(m => m.GaresPage),
      },
      {
        path: 'buses',
        loadComponent: () => import('./features/proprietaire/buses/buses.page').then(m => m.BusesPage),
      },
      {
        path: 'routes',
        loadComponent: () => import('./features/proprietaire/routes/routes.page').then(m => m.RoutesPage),
      },
      {
        path: 'voyages',
        loadComponent: () => import('./features/proprietaire/voyages/voyages.page').then(m => m.VoyagesPage),
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/proprietaire/kyc/kyc.page').then(m => m.KycPage),
      },
      {
        path: 'managers',
        loadComponent: () => import('./features/proprietaire/managers/managers.page').then(m => m.ManagersPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      },
    ]
  },

  // Routes pour le client uniquement
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] },
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/client/home-component/home-component').then(m => m.HomeComponent),
      },
      {
        path: 'voyages',
        loadComponent: () => import('./features/client/voyages/voyages.page').then(m => m.VoyagesPage),
      },
      {
        path: 'agences',
        loadComponent: () => import('./features/client/agences/agences.page').then(m => m.AgencesPage),
      },
      {
        path: 'mes-reservations',
        loadComponent: () => import('./features/client/mes-reservations/mes-reservations.page').then(m => m.MesReservationsPage),
      },
      {
        path: 'new-reservation/:voyageId',
        loadComponent: () => import('./features/client/new-reservation/new-reservation.page').then(m => m.NewReservationPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      }
    ]
  },

  // Wildcard route - redirige vers splash pour les routes non trouvées
  {
    path: '**',
    redirectTo: '/splash'
  }
];
