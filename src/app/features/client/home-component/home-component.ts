import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ClientReservationService } from '../../../services/client/client-reservation.service';
import { Reservation } from '../../../models/reservation';
import { User } from '../../../models/user';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="client-home">
      <!-- Welcome Section -->
      <header class="home-header animate-fade-in">
        <div class="header-top">
          <div class="welcome-text">
            <h1 class="welcome-title">Où souhaitez-vous <span class="highlight">aller ?</span></h1>
            <p class="subtitle">Réservez votre voyage en quelques clics</p>
          </div>
          <button class="logout-btn" (click)="onLogout()" title="Se déconnecter">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </header>

      <!-- Quick Action Grid -->
      <section class="action-grid animate-scale-in">
        <button class="action-card search" (click)="navigate('/client/voyages')">
          <div class="icon-box"><mat-icon>search</mat-icon></div>
          <span>Réserver</span>
        </button>
        <button class="action-card tickets" (click)="navigate('/client/mes-reservations')">
          <div class="icon-box"><mat-icon>confirmation_number</mat-icon></div>
          <span>Mes Billets</span>
        </button>
        <button class="action-card agencies" (click)="navigate('/client/agences')">
          <div class="icon-box"><mat-icon>storefront</mat-icon></div>
          <span>Agences</span>
        </button>
        <button class="action-card promo">
          <div class="icon-box"><mat-icon>sell</mat-icon></div>
          <span>Promos</span>
        </button>
      </section>

      <!-- Active Reservation Card (The Hero) -->
      <section class="hero-section animate-scale-in" *ngIf="upcomingTrips().length > 0">
        <div class="section-header">
          <h3 class="section-title">Prochain voyage</h3>
          <span class="active-badge">Confirmé</span>
        </div>
        
        <div class="active-trip-card" (click)="navigate('/client/mes-reservations')">
          <div class="trip-header">
            <div class="bus-company">General Express Voyage</div>
            <div class="trip-date">{{ upcomingTrips()[0].voyage.date_depart | date:'dd MMM yyyy' }}</div>
          </div>
          
          <div class="trip-route">
            <div class="city-info">
              <span class="city-name">{{ upcomingTrips()[0].voyage.ville_depart }}</span>
              <span class="city-code">{{ upcomingTrips()[0].voyage.ville_depart.substring(0,3).toUpperCase() }}</span>
            </div>
            <div class="route-visual">
              <div class="dot"></div>
              <div class="line">
                <mat-icon>directions_bus</mat-icon>
              </div>
              <div class="dot"></div>
            </div>
            <div class="city-info align-right">
              <span class="city-name">{{ upcomingTrips()[0].voyage.ville_arrivee }}</span>
              <span class="city-code">{{ upcomingTrips()[0].voyage.ville_arrivee.substring(0,3).toUpperCase() }}</span>
            </div>
          </div>

          <div class="trip-footer">
            <div class="footer-item">
              <mat-icon>schedule</mat-icon>
              <span>{{ upcomingTrips()[0].voyage.heure_depart }}</span>
            </div>
            <div class="footer-item">
              <mat-icon>event_seat</mat-icon>
              <span>Siège N° {{ upcomingTrips()[0] }}</span>
            </div>
            <mat-icon class="qr-preview">qr_code_2</mat-icon>
          </div>
        </div>
      </section>

      <!-- Stats / Balance Section -->
      <section class="wallet-section animate-fade-in">
        <div class="wallet-card">
          <div class="wallet-info">
            <span class="label">Total dépensé</span>
            <span class="amount">{{ stats().spent | number }} <small>FCFA</small></span>
          </div>
          <div class="wallet-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
        </div>
      </section>

      <!-- Promotions / Banner -->
      <section class="promo-banner animate-fade-in">
        <div class="banner-content">
          <h4>Programme Fidélité</h4>
          <p>Voyagez 5 fois et bénéficiez de -50% sur le 6ème voyage !</p>
          <button class="btn-banner">En savoir plus</button>
        </div>
        <div class="banner-image">
          <mat-icon>stars</mat-icon>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { --primary: #2563EB; --secondary: #1E293B; --bg: #F8FAFC; --gray: #64748B; }

    .client-home { display: flex; flex-direction: column; gap: 1.75rem; }

    /* Header */
    .home-header { margin-top: 0.5rem; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .welcome-title { font-size: 1.75rem; font-weight: 900; color: var(--secondary); line-height: 1.2; margin: 0; }
    .welcome-title .highlight { color: var(--primary); }
    .subtitle { font-size: 0.9rem; color: var(--gray); margin: 6px 0 0 0; font-weight: 500; }
    .logout-btn { background: #F1F5F9; color: var(--gray); border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .logout-btn:active { transform: scale(0.9); background: #FEE2E2; color: #EF4444; }

    /* Action Grid */
    .action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .action-card { 
      background: white; border: 1px solid #F1F5F9; border-radius: 20px; padding: 1rem 0.25rem;
      display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    .icon-box { width: 44px; height: 44px; background: #F8FAFC; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--secondary); transition: all 0.2s; }
    .action-card span { font-size: 0.65rem; font-weight: 700; color: var(--gray); }
    
    .action-card:active { transform: scale(0.95); background: #F1F5F9; }
    .action-card:active .icon-box { background: var(--primary); color: white; }

    /* Hero Section (Active Trip) */
    .section-title { font-size: 1.1rem; font-weight: 800; color: var(--secondary); margin: 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .active-badge { background: #DCFCE7; color: #15803D; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; }

    .active-trip-card { 
      background: linear-gradient(135deg, #1E293B, #0F172A); color: white; border-radius: 28px; padding: 1.5rem;
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15);
    }
    .trip-header { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 600; color: #94A3B8; margin-bottom: 1.5rem; }
    
    .trip-route { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .city-info { display: flex; flex-direction: column; gap: 2px; }
    .city-name { font-size: 0.8rem; color: #94A3B8; font-weight: 600; }
    .city-code { font-size: 1.5rem; font-weight: 900; }
    .align-right { text-align: right; }

    .route-visual { flex: 1; display: flex; align-items: center; gap: 8px; padding: 0 1rem; }
    .route-visual .line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); position: relative; display: flex; justify-content: center; align-items: center; }
    .route-visual mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--primary); }
    .route-visual .dot { width: 6px; height: 6px; background: white; border-radius: 50%; }

    .trip-footer { 
      display: flex; gap: 1.25rem; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.25rem;
      position: relative;
    }
    .footer-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: #CBD5E1; }
    .footer-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--primary); }
    .qr-preview { position: absolute; right: 0; font-size: 32px; width: 32px; height: 32px; opacity: 0.5; }

    /* Wallet Section */
    .wallet-card { background: white; border-radius: 24px; padding: 1.25rem 1.5rem; border: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
    .wallet-info { display: flex; flex-direction: column; }
    .wallet-info .label { font-size: 0.75rem; font-weight: 700; color: var(--gray); text-transform: uppercase; margin-bottom: 4px; }
    .wallet-info .amount { font-size: 1.5rem; font-weight: 900; color: var(--secondary); }
    .wallet-info .amount small { font-size: 0.8rem; color: var(--gray); font-weight: 600; }
    .wallet-icon { width: 48px; height: 48px; background: #EEF2FF; color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; }

    /* Promo Banner */
    .promo-banner { 
      background: linear-gradient(135deg, #4F46E5, #3730A3); color: white; border-radius: 24px; padding: 1.5rem;
      display: flex; justify-content: space-between; align-items: center; overflow: hidden; position: relative;
    }
    .banner-content { position: relative; z-index: 1; }
    .banner-content h4 { font-size: 1.1rem; font-weight: 800; margin: 0 0 8px 0; }
    .banner-content p { font-size: 0.8rem; color: rgba(255,255,255,0.8); margin: 0 0 1rem 0; line-height: 1.4; max-width: 80%; }
    .btn-banner { background: white; color: #4F46E5; border: none; padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; cursor: pointer; }
    .banner-image { position: absolute; right: -10px; bottom: -10px; opacity: 0.2; transform: rotate(-15deg); }
    .banner-image mat-icon { font-size: 100px; width: 100px; height: 100px; }

    /* Animations */
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ClientReservationService);
  private router = inject(Router);

  // Signals
  currentUser = signal<User | null>(null);
  reservations = signal<Reservation[]>([]);
  isLoading = signal<boolean>(false);

  // Dynamic Greeting
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  });

  // Derived Statistics
  stats = computed(() => {
    const all = this.reservations();
    const confirmed = all.filter(r => r.statut === 'validee').length;
    const pending = all.filter(r => r.statut === 'en_attente').length;
    const spent = all.filter(r => r.statut === 'validee')
                     .reduce((sum, r) => sum + Number(r.prix || 0), 0);

    return {
      active: confirmed + pending,
      confirmed,
      pending,
      spent
    };
  });

  // Curated Upcoming Trips
  upcomingTrips = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.reservations()
      .filter(r => r.statut === 'validee' && r.voyage.date_depart.split('T')[0] >= today)
      .sort((a, b) => new Date(a.voyage.date_depart).getTime() - new Date(b.voyage.date_depart).getTime())
      .slice(0, 3);
  });

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.reservations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations:', err);
        this.isLoading.set(false);
      }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}

