import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/admin/user.service';
import { AgenceService } from '../../../services/admin/agence.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.css']
})
export class AdminDashboardPage implements OnInit {
  private userService = inject(UserService);
  private agenceService = inject(AgenceService);

  totalUsers = signal(0);
  totalAgencies = signal(0);
  totalGares = signal(0);
  totalTrips = signal(0);
  totalRevenue = signal(0);
  
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    
    forkJoin({
      users: this.userService.getUsers(),
      agencies: this.agenceService.getAgences()
    }).subscribe({
      next: (res: any) => {
        const usersList = Array.isArray(res.users) ? res.users : (res.users?.data || []);
        const agenciesList = Array.isArray(res.agencies) ? res.agencies : (res.agencies?.data || []);
        
        this.totalUsers.set(usersList.length);
        this.totalAgencies.set(agenciesList.length);
        
        // Calcul robuste des gares à travers toutes les agences
        let garesCount = 0;
        agenciesList.forEach((a: any) => {
           if (Array.isArray(a.gares)) {
             garesCount += a.gares.length;
           } else if (a.nb_gares) { // Fallback si le backend renvoie juste le compte
             garesCount += Number(a.nb_gares);
           }
        });
        this.totalGares.set(garesCount);
        
        // Statistiques simulées basées sur les entités réelles
        // À remplacer par un vrai endpoint de stats globales une fois disponible
        const baseTrips = agenciesList.length * 15;
        this.totalTrips.set(baseTrips > 0 ? baseTrips + 3 : 0); 
        this.totalRevenue.set(this.totalTrips() * 5000); 
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Erreur Dashboard Admin:", err);
        this.isLoading.set(false);
      }
    });
  }
}
