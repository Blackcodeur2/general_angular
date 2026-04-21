import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { VoyageService } from '../../../services/chauffeur/voyage.service';
import { Incident } from '../../../models/incident';

@Component({
  selector: 'app-report-incident',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="report-container">
      <header class="page-header animate-fade-in">
        <h2 class="title">Signaler un Problème</h2>
        <p class="subtitle">Informez l'agence d'un incident en temps réel</p>
      </header>

      <div class="report-card animate-scale-in">
        <div class="card-body">
          <div class="form-section">
            <label class="section-label">Type d'incident</label>
            <div class="incident-grid">
              <div class="incident-option" 
                   *ngFor="let type of incidentTypes" 
                   [class.active]="selectedType === type.id"
                   (click)="selectedType = type.id">
                <div class="icon-circle">
                  <mat-icon>{{ type.icon }}</mat-icon>
                </div>
                <span>{{ type.label }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="section-label">Niveau de gravité</label>
            <div class="gravity-selector">
              <button class="gravity-btn low" 
                      [class.active]="incident.niveau_gravite === 'FAIBLE'"
                      (click)="incident.niveau_gravite = 'FAIBLE'">
                Faible
              </button>
              <button class="gravity-btn medium" 
                      [class.active]="incident.niveau_gravite === 'MOYEN'"
                      (click)="incident.niveau_gravite = 'MOYEN'">
                Moyen
              </button>
              <button class="gravity-btn high" 
                      [class.active]="incident.niveau_gravite === 'ELEVÉ'"
                      (click)="incident.niveau_gravite = 'ELEVÉ'">
                Critique
              </button>
            </div>
          </div>

          <div class="form-section">
            <label class="section-label">Description détaillée</label>
            <div class="textarea-wrapper">
              <mat-icon class="field-icon">edit_note</mat-icon>
              <textarea 
                [(ngModel)]="incident.description" 
                name="description" 
                placeholder="Expliquez brièvement la situation..."
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button class="submit-btn" (click)="onSubmit()" [disabled]="!incident.description || !selectedType">
            <mat-icon>send</mat-icon>
            ENVOYER LE SIGNALEMENT
          </button>
        </div>
      </div>

      <div class="info-alert animate-fade-in">
        <mat-icon>info</mat-icon>
        <p>Votre position GPS sera jointe automatiquement au signalement pour une assistance rapide.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { --p: #E11D48; --bg: #F8FAFC; --slate: #1E293B; --gray: #64748B; }

    .report-container { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2rem; }

    .page-header { margin-bottom: 0.5rem; }
    .title { font-size: 1.5rem; font-weight: 800; color: var(--slate); margin: 0; }
    .subtitle { font-size: 0.85rem; color: var(--gray); margin-top: 4px; }

    .report-card { background: white; border-radius: 28px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    .card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.75rem; }

    .section-label { display: block; font-size: 0.8rem; font-weight: 800; color: var(--slate); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1rem; }

    /* Incident Grid */
    .incident-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .incident-option { 
      background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 20px; padding: 1rem 0.5rem;
      display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
    }
    .incident-option .icon-circle { width: 44px; height: 44px; background: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--gray); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .incident-option span { font-size: 0.7rem; font-weight: 700; color: var(--gray); }
    
    .incident-option.active { border-color: var(--p); background: #FFF1F2; }
    .incident-option.active .icon-circle { background: var(--p); color: white; }
    .incident-option.active span { color: var(--p); }

    /* Gravity Selector */
    .gravity-selector { display: flex; gap: 0.5rem; background: #F1F5F9; padding: 4px; border-radius: 14px; }
    .gravity-btn { flex: 1; border: none; padding: 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; color: var(--gray); background: none; }
    .gravity-btn.active { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .gravity-btn.active.low { color: #10B981; }
    .gravity-btn.active.medium { color: #F59E0B; }
    .gravity-btn.active.high { color: #EF4444; }

    /* Textarea */
    .textarea-wrapper { position: relative; }
    .field-icon { position: absolute; top: 12px; left: 12px; font-size: 20px; color: var(--gray); opacity: 0.5; }
    textarea { width: 100%; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px 12px 12px 40px; font-family: inherit; font-size: 0.95rem; resize: none; outline: none; transition: all 0.2s; }
    textarea:focus { background: white; border-color: var(--p); box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.05); }

    .card-footer { padding: 0 1.5rem 1.5rem; }
    .submit-btn { 
      width: 100%; background: var(--p); color: white; border: none; padding: 1.1rem; border-radius: 18px;
      font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 10px;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.2);
    }
    .submit-btn:disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed; }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }

    .info-alert { background: #F0F9FF; border: 1px solid #E0F2FE; border-radius: 16px; padding: 1rem; display: flex; gap: 12px; align-items: center; }
    .info-alert mat-icon { color: #0EA5E9; }
    .info-alert p { font-size: 0.75rem; color: #0369A1; line-height: 1.4; margin: 0; font-weight: 500; }

    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ReportIncidentPage {
  private voyageService = inject(VoyageService);
  
  selectedType: string = '';
  incidentTypes = [
    { id: 'panne', label: 'Panne', icon: 'build' },
    { id: 'accident', label: 'Accident', icon: 'minor_crash' },
    { id: 'bouchon', label: 'Embouteillage', icon: 'traffic' },
    { id: 'meteo', label: 'Météo', icon: 'cloudy_filled' },
    { id: 'autre', label: 'Autre', icon: 'more_horiz' }
  ];

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
