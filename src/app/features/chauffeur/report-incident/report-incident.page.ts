import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { VoyageService } from '../../../services/voyage/voyage.service';
import { Incident } from '../../../models/incident';

@Component({
  selector: 'app-report-incident',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="report-container">
      <header>
        <h2>Signaler un problème</h2>
        <p>Informez l'agence d'un incident pendant votre voyage</p>
      </header>

      <form class="report-form" (submit)="onSubmit()">
        <div class="form-group">
          <label>Niveau de gravité</label>
          <div class="gravity-options">
            <label class="option low">
              <input type="radio" name="gravity" [(ngModel)]="incident.niveau_gravite" value="FAIBLE">
              <span>Faible</span>
            </label>
            <label class="option medium">
              <input type="radio" name="gravity" [(ngModel)]="incident.niveau_gravite" value="MOYEN">
              <span>Moyen</span>
            </label>
            <label class="option high">
              <input type="radio" name="gravity" [(ngModel)]="incident.niveau_gravite" value="ELEVÉ">
              <span>Elevé</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Description du problème</label>
          <textarea 
            [(ngModel)]="incident.description" 
            name="description" 
            placeholder="Détaillez le problème (panne, accident, retard, etc.)"
            rows="5"
          ></textarea>
        </div>

        <button type="submit" class="btn-send">
          <mat-icon>report_problem</mat-icon>
          Envoyer le signalement
        </button>
      </form>
    </div>
  `,
  styles: [`
    .report-container { display: flex; flex-direction: column; gap: 1.5rem; }
    header h2 { font-size: 1.5rem; color: #1E293B; font-weight: 800; }
    header p { color: #64748B; font-size: 0.9rem; }

    .report-form { display: flex; flex-direction: column; gap: 1.5rem; background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #E2E8F0; }
    
    .form-group label { display: block; font-weight: 600; font-size: 0.9rem; color: #1E293B; margin-bottom: 0.75rem; }
    
    .gravity-options { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; }
    .option { border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.75rem; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; }
    .option input { display: none; }
    .option span { font-weight: 700; font-size: 0.8rem; }
    
    .option.low:has(input:checked) { background: #ECFDF5; border-color: #10B981; color: #065F46; }
    .option.medium:has(input:checked) { background: #FFFBEB; border-color: #F59E0B; color: #92400E; }
    .option.high:has(input:checked) { background: #FEF2F2; border-color: #EF4444; color: #991B1B; }

    textarea { width: 100%; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.75rem; font-family: inherit; font-size: 0.95rem; outline: none; }
    textarea:focus { border-color: #3B82F6; }

    .btn-send { background: #E11D48; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; }
    .btn-send:hover { background: #BE123C; }
  `]
})
export class ReportIncidentPage {
  private voyageService = inject(VoyageService);
  
  incident: Incident = {
    voyage_id: 1, // Logic would be to pick current voyage
    description: '',
    niveau_gravite: 'MOYEN'
  };

  onSubmit() {
    console.log('Sending incident:', this.incident);
    // this.voyageService.signalerIncident(this.incident).subscribe(...)
    alert('Signalement envoyé avec succès !');
  }
}
