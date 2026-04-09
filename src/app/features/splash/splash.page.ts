import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-scene">
      <div class="sky">
        <div class="cloud cloud-1">☁️</div>
        <div class="cloud cloud-2">☁️</div>
      </div>
      
      <div class="logo-container">
        <h1>General Express Voyages <span class="highlight"> Le plaisir de voyager</span></h1>
      </div>

      <div class="road-container">
        <div class="bus">
          <div class="bus-body">
            <div class="windows"></div>
            <div class="stripe"></div>
            <div class="door"></div>
            <div class="light front"></div>
            <div class="light back"></div>
          </div>
          <div class="wheels">
            <div class="wheel front-wheel"></div>
            <div class="wheel back-wheel"></div>
          </div>
        </div>
        <div class="road">
          <div class="road-stripes"></div>
        </div>
      </div>
      
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; background: #87CEEB; }

    .splash-scene {
      height: 100%;
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    /* --- Sky & Logo --- */
    .sky { position: absolute; top: 0; width: 100%; height: 60%; }
    .cloud { position: absolute; font-size: 3rem; opacity: 0.8; animation: moveClouds 10s linear infinite; }
    .cloud-1 { top: 10%; left: -10%; animation-duration: 15s; }
    .cloud-2 { top: 20%; left: -10%; animation-delay: 5s; animation-duration: 12s; }

    .logo-container {
      z-index: 10;
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.8);
      padding: 1rem 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: fadeIn 1s ease-out;
    }
    
    h1 { margin: 0; font-family: 'Inter', sans-serif; font-size: 2.5rem; color: #1e3a8a; }
    .highlight { color: #2563eb; }

    /* --- Road --- */
    .road-container {
      width: 100%;
      height: 120px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      overflow: hidden;
    }

    .road {
      width: 100%;
      height: 20px;
      background: #475569;
      position: absolute;
      bottom: 0;
      z-index: 1;
    }

    .road-stripes {
      position: absolute;
      top: 50%;
      left: 0;
      width: 200%;
      height: 2px;
      background: repeating-linear-gradient(to right, white 0, white 20px, transparent 20px, transparent 40px);
      animation: moveRoad 0.3s linear infinite;
    }

    /* --- Bus --- */
    .bus {
      width: 160px;
      height: 80px;
      position: relative;
      z-index: 10;
      animation: bounce 0.6s ease-in-out infinite alternate;
      margin-bottom: 15px; /* Space for wheels on road */
    }

    .bus-body {
      width: 100%;
      height: 100%;
      background: #2563eb;
      border-radius: 10px 10px 2px 2px;
      position: relative;
      box-shadow: 4px 4px 10px rgba(0,0,0,0.2);
    }
    
    .windows {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      height: 25px;
      background: #93c5fd;
      border-radius: 4px;
      border: 2px solid #1e40af;
    }

    .stripe {
      position: absolute;
      top: 50px;
      left: 0;
      width: 100%;
      height: 10px;
      background: #fbbf24;
    }

    .door {
      position: absolute;
      bottom: 0;
      right: 30px;
      background: #93c5fd;
      width: 20px;
      height: 35px;
      border: 1px solid #1e40af;
    }

    .light { position: absolute; width: 6px; height: 10px; border-radius: 2px; bottom: 10px; }
    .light.front { right: -2px; background: #fef08a; box-shadow: 0 0 10px #fef08a; }
    .light.back { left: -2px; background: #ef4444; }

    .wheels { position: absolute; bottom: -8px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; box-sizing: border-box; }
    
    .wheel {
      width: 24px;
      height: 24px;
      background: #1f2937;
      border-radius: 50%;
      border: 3px solid #6b7280;
      animation: spin 0.8s linear infinite;
      z-index: 20;
    }

    .loading-text {
      margin-top: 1rem;
      color: #1e3a8a;
      font-weight: 600;
      animation: pulseText 1.5s infinite;
    }

    /* --- Animations --- */
    @keyframes moveRoad {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-2px); }
    }

    @keyframes moveClouds {
      from { left: -20%; }
      to { left: 120%; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulseText {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]

})
export class SplashPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  public loadingMessage = 'En route vers votre destination...';

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      // Si connecté, rediriger vers le dashboard approprié après la durée du splash
      setTimeout(() => {
        this.redirectToUserDashboard();
      }, 2000);
    } else {
      // Si non connecté, rediriger vers la landing après la durée du splash
      this.loadingMessage = 'Bienvenue chez GEV...';
      setTimeout(() => {
        this.router.navigate(['/landing']);
      }, 3000);
    }
  }

  /**
   * Redirige l'utilisateur vers son dashboard selon son rôle
   */
  private redirectToUserDashboard(): void {
    const role = this.authService.getRole();

    const roleRoutes: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'CHEF_AGENCE': '/chef_agence/dashboard',
      'CHAUFFEUR': '/chauffeur/dashboard',
      'AGENT': '/agent/dashboard',
      'PROPRIETAIRE': '/proprietaire/dashboard',
      'CLIENT': '/client/home'
    };

    const redirectPath = roleRoutes[role || ''] || '/landing';
    this.router.navigate([redirectPath]);
  }
}
