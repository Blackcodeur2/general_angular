import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ColisService, Colis } from '../../../services/agent/colis.service';
import { AgentService } from '../../../services/agent/agent.service';
import { catchError, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-colis',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, PaginationComponent],
  template: `
    <div class="colis-page">
      <header class="page-header">
        <div class="header-content">
          <h1>Gestion des Colis</h1>
          <p>Consultez et enregistrez les expéditions de colis.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="toggleViewMode()">
            <mat-icon>{{ viewMode() === 'list' ? 'add' : 'list' }}</mat-icon>
            <span>{{ viewMode() === 'list' ? 'Nouveau Colis' : 'Retour à la liste' }}</span>
          </button>
        </div>
      </header>

      <!-- VIEW: LIST -->
      <div *ngIf="viewMode() === 'list'" class="list-view">
          <div *ngIf="isLoading()" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des colis...</p>
          </div>

          <div *ngIf="!isLoading()" class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Expéditeur</th>
                  <th>Colis</th>
                  <th>Destinataire</th>
                  <th>Trajet (Gares)</th>
                  <th>Coût & Poids</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  @for (colis of paginatedColis(); track colis.id) {
                    <tr class="res-row">
                      <td>
                        <div class="client-info">
                          <span class="name">{{ colis.user?.prenom }} {{ colis.user?.nom }}</span>
                          <span class="phone">
                            <mat-icon>phone</mat-icon>
                            {{ colis.user?.telephone }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style="font-weight: 600; color:#334155">{{ colis.nom_colis }}</span>
                      </td>
                      <td>
                        <div class="client-info">
                          <span class="name">{{ colis.nom_destinataire }}</span>
                          <span class="phone"><mat-icon>phone</mat-icon> {{ colis.tel_destinataire }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="voyage-info" *ngIf="colis.voyage">
                            <span class="trip-id" style="font-size: 0.8rem; color: #64748b;">
                                Voyage #{{ colis.voyage.num_voyage || colis.voyage.id }}<br/>
                                <span style="color: #1e293b; font-weight: 600;">
                                    {{ colis.gareProvenance?.ville?.nom || colis.gareProvenance?.nom || '...' }} &rarr; 
                                    {{ colis.gareDestination?.ville?.nom || colis.gareDestination?.nom || '...' }}
                                </span>
                            </span>
                        </div>
                      </td>
                      <td class="price-cell">
                        <span class="amount">{{ colis.prix | number:'1.0-0' }}</span> <span class="currency">FCFA</span><br/>
                        <span style="font-size:0.75rem; color:#64748b;">{{ colis.poids || 0 }} kg</span>
                      </td>
                      <td class="date-cell">
                        {{ colis.created_at | date:'dd MMM yyyy, HH:mm' }}
                      </td>
                      <td>
                        <span class="status-badge" [class]="colis.statut">
                          <mat-icon class="status-icon" *ngIf="colis.statut === 'retire'">check_circle</mat-icon>
                          <mat-icon class="status-icon" *ngIf="colis.statut === 'en attente'">schedule</mat-icon>
                          {{ colis.statut }}
                        </span>
                      </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn validate" *ngIf="colis.statut === 'en attente'" title="Marquer comme retiré" (click)="markAsRetrieved(colis.id!)">
                          <mat-icon>check_circle</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            
            <div *ngIf="colisList().length === 0" class="empty-state">
              <mat-icon>local_mall</mat-icon>
              <p>Aucun colis enregistré.</p>
            </div>
          </div>

          <gev-pagination *ngIf="!isLoading()"
            [totalItems]="colisList().length" 
            [pageSize]="pageSize()" 
            [currentPage]="currentPage()"
            (pageChange)="currentPage.set($event)">
          </gev-pagination>
      </div>

      <!-- VIEW: CREATE -->
      <div *ngIf="viewMode() === 'create'" class="create-view">
          <form [formGroup]="colisForm" (ngSubmit)="onSubmitColis()">
            <div class="form-grid">
                
                <!-- Section Expéditeur -->
                <div class="form-section">
                    <h3>1. Expéditeur (Client)</h3>
                    <div class="form-group search-group">
                        <label>Rechercher un client (Tel ou Nom) <span class="text-danger">*</span></label>
                        <div class="search-input-wrap">
                            <mat-icon>search</mat-icon>
                            <input type="text" formControlName="clientSearchQuery" placeholder="Ex: 690..." (input)="onClientSearch($event)">
                        </div>
                        <div class="search-results" *ngIf="clientSearchResults().length > 0">
                            <div class="search-item" *ngFor="let m of clientSearchResults()" (click)="selectClient(m)">
                                <span>{{ m.nom }} {{ m.prenom }}</span>
                                <span class="phone">{{ m.telephone }}</span>
                            </div>
                        </div>
                        <div *ngIf="selectedClient()" class="selected-client-card">
                            <mat-icon style="color: #10b981;">check_circle</mat-icon>
                            <div class="details">
                                <span class="name">{{ selectedClient()?.nom }} {{ selectedClient()?.prenom }}</span>
                                <span>{{ selectedClient()?.telephone }}</span>
                            </div>
                            <button type="button" class="btn-clear" (click)="clearClient()"><mat-icon>close</mat-icon></button>
                        </div>
                    </div>
                </div>

                <!-- Section Colis -->
                <div class="form-section">
                    <h3>2. Informations du colis</h3>
                    <div class="form-group">
                        <label>Description (Contenu) <span class="text-danger">*</span></label>
                        <input type="text" formControlName="nom_colis" placeholder="Carton d'effets, documents...">
                    </div>
                    <div class="flex-row">
                        <div class="form-group">
                            <label>Poids (kg)</label>
                            <input type="number" formControlName="poids" placeholder="Ex: 5" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Prix facturé (FCFA)</label>
                            <input type="number" formControlName="prix" placeholder="Ex: 2000" min="0">
                        </div>
                    </div>
                </div>

                <!-- Section Voyage & Destinataire -->
                <div class="form-section">
                    <h3>3. Voyage & Destinataire</h3>
                    <div class="form-group">
                        <label>Voyage de transport <span class="text-danger">*</span></label>
                        <select formControlName="voyage_id" (change)="onVoyageChange()">
                            <option value="">Sélectionnez le voyage prévu</option>
                            <option *ngFor="let m of availableVoyages()" [value]="m.id">
                                Voyage #{{ m.num_voyage || m.id }} : 
                                {{ m.trajet?.ville_depart_nom || m.trajet?.villeDepart?.nom || '...' }} &rarr; 
                                {{ m.trajet?.ville_arrive_nom || m.trajet?.villeArrivee?.nom || '...' }}
                                ({{ m.date_depart | date:'dd/MM HH:mm' }})
                            </option>
                        </select>
                    </div>
                  
                    <!-- Champ destination caché puisque nous le déduisons du voyage sélectionné -->
                    <input type="hidden" formControlName="destination">
                    <div class="form-group">
                        <label>Nom du destinataire <span class="text-danger">*</span></label>
                        <input type="text" formControlName="nom_destinataire" placeholder="Nom complet">
                    </div>
                    <div class="form-group">
                        <label>Téléphone du destinataire <span class="text-danger">*</span></label>
                        <input type="text" formControlName="tel_destinataire" placeholder="Numéro de téléphone">
                    </div>
                </div>

            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="toggleViewMode()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="colisForm.invalid || !selectedClient() || isSubmitting()">
                    <mat-icon *ngIf="isSubmitting()">hourglass_empty</mat-icon>
                    <span>{{ isSubmitting() ? 'Enregistrement...' : 'Enregistrer le Colis' }}</span>
                </button>
            </div>
          </form>
      </div>
    </div>
  `,
  styles: [`
    .colis-page { animation: fadeIn 0.4s ease-in; max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.85rem; font-weight: 850; color: #1e293b; margin: 0 0 0.5rem 0; letter-spacing: -0.025em; }
    .page-header p { color: #64748b; font-size: 1rem; margin: 0; }

    .btn-primary { background: #10B981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #059669; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }

    .btn-secondary { background: white; color: #4b5563; border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: background 0.2s; }
    .btn-secondary:hover { background: #f3f4f6; }

    /* TABLE LAYOUT */
    .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 1rem 1.25rem; background: #f8fafc; font-size: 0.7rem; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table td { padding: 1.25rem; font-size: 0.9rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .res-row:hover { background-color: #f8fafc; }

    .client-info, .voyage-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .client-info .name { font-weight: 700; color: #1e293b; }
    .client-info .phone { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #64748b; }
    .client-info .phone mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #94a3b8; }
    
    .price-cell .amount { font-weight: 800; color: #1e293b; font-size: 1rem; }
    .price-cell .currency { font-size: 0.65rem; font-weight: 700; color: #94a3b8; margin-left: 0.25rem; }
    
    .date-cell { font-size: 0.8rem; color: #64748b; line-height: 1.4; }
    
    .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 6px 12px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
    .status-badge .status-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .status-badge.retire { background: #dcfce7; color: #15803d; }
    .status-badge.en.attente { background: #fef9c3; color: #854d0e; }
    
    .action-buttons { display: flex; gap: 0.5rem; }
    .action-btn { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 0.5rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .action-btn:hover { border-color: #cbd5e1; background: #f8fafc; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .action-btn.validate:hover { color: #15803d; border-color: #bbf7d0; background: #f0fdf4; }
    .action-btn mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }

    .empty-state { padding: 4rem; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 6rem 0; color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top: 3px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; }

    /* FORM LAYOUT */
    .create-view { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; }
    .form-grid { display: flex; flex-direction: column; gap: 2rem; }
    .form-section { display: flex; flex-direction: column; gap: 1.5rem; background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #f1f5f9; }
    .form-section h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem 0; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; }
    
    .form-group { display: flex; flex-direction: column; gap: 0.6rem; position: relative; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
    .text-danger { color: #ef4444; }
    .form-group input, .form-group select { padding: 0.85rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: #1e293b; outline: none; transition: border-color 0.2s; font-family: inherit; }
    .form-group input:focus, .form-group select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
    
    .flex-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .search-input-wrap { position: relative; display: flex; align-items: center; }
    .search-input-wrap mat-icon { position: absolute; left: 1rem; color: #94a3b8; font-size: 1.25rem; }
    .search-input-wrap input { width: 100%; padding-left: 3rem !important; }
    
    .search-results { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 10; max-height: 200px; overflow-y: auto; }
    .search-item { padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
    .search-item:hover { background: #f8fafc; }
    .search-item .phone { color: #64748b; font-size: 0.85rem; }
    
    .selected-client-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-top: 0.5rem; }
    .selected-client-card .details { flex: 1; display: flex; flex-direction: column; }
    .selected-client-card .details .name { font-weight: 700; color: #166534; }
    .btn-clear { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; transition: color 0.2s; }
    .btn-clear:hover { color: #ef4444; }

    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ColisManagementPage implements OnInit {
  private colisService = inject(ColisService);
  private agentService = inject(AgentService);
  private fb = inject(FormBuilder);

  viewMode = signal<'list' | 'create'>('list');
  colisList = signal<Colis[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Pagination support
  currentPage = signal(1);
  pageSize = signal(10);
  paginatedColis = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.colisList().slice(start, start + this.pageSize());
  });

  // Client search support
  clientSearchQuery$ = new Subject<string>();
  clientSearchResults = signal<any[]>([]);
  selectedClient = signal<any>(null);

  // Voyages (to replace Destinations)
  availableVoyages = signal<any[]>([]);

  colisForm: FormGroup;

  constructor() {
    this.colisForm = this.fb.group({
      clientSearchQuery: [''],
      nom_colis: ['', Validators.required],
      tel_destinataire: ['', Validators.required],
      nom_destinataire: ['', Validators.required],
      voyage_id: ['', Validators.required],
      destination: ['', Validators.required], // Hidden field derived from voyage
      prix: [0, [Validators.min(0)]],
      poids: [0, [Validators.min(0)]]
    });

    // Handle Client search stream
    this.clientSearchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) return of([]);
        return this.agentService.searchClients(query).pipe(catchError(() => of([])));
      })
    ).subscribe(results => {
      this.clientSearchResults.set(results);
    });
  }

  ngOnInit() {
    this.loadColis();
    this.loadVoyages();
  }

  toggleViewMode() {
    if (this.viewMode() === 'list') {
      this.viewMode.set('create');
      this.colisForm.reset({ prix: 0, poids: 0, clientSearchQuery: '', voyage_id: '', destination: '' });
      this.selectedClient.set(null);
    } else {
      this.viewMode.set('list');
    }
  }

  loadColis() {
    this.isLoading.set(true);
    this.colisService.getColis().subscribe({
      next: (data) => {
        this.colisList.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement colis:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadVoyages() {
    this.agentService.getVoyages().subscribe({
      next: (voyages) => {
        // Keep upcoming voyages where the agent's gare is the departure point (which getVoyages naturally filters by).
        const upcomingVoyages = voyages.filter((v: any) => v.statut === 'en attente' || v.statut === 'en cours');
        this.availableVoyages.set(upcomingVoyages);
      },
      error: (err) => console.error('Erreur voyages:', err)
    });
  }

  onVoyageChange() {
    const voyageId = this.colisForm.get('voyage_id')?.value;
    const selectedVoyage = this.availableVoyages().find(v => v.id == voyageId);
    
    if (selectedVoyage) {
        // Le backend retourne souvent gare_id dans le trajet ou l'ID de la gare d'arrivée directement
        // Dans notre cas, nous avons besoin de la gare d'arrivée pour la destination du colis.
        // Si le trajet est de A -> B, la destination du colis est la gare de B.
        // Note: Dans ce système, la destination est liée à la gare de destination du trajet.
        const destinationId = selectedVoyage.trajet?.gare_id; // À vérifier si c'est bien la gare de destination
        
        // Si le trajet n'a pas explicitement d'ID de gare d'arrivée, on peut avoir besoin d'une autre logique
        // Pour l'instant, on suppose que le trajet sélectionné définit la destination.
        if (destinationId) {
            this.colisForm.patchValue({ destination: destinationId });
        }
    }
  }

  onClientSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query.length < 2) {
      this.clientSearchResults.set([]);
    } else {
      this.clientSearchQuery$.next(query);
    }
  }

  selectClient(client: any) {
    this.selectedClient.set(client);
    this.clientSearchResults.set([]);
    this.colisForm.get('clientSearchQuery')?.setValue('');
  }

  clearClient() {
    this.selectedClient.set(null);
  }

  markAsRetrieved(id: number) {
    Swal.fire({
      title: 'Confirmer le retrait',
      text: 'Voulez-vous marquer ce colis comme retiré par le destinataire ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.colisService.updateColisStatus(id, 'retire').subscribe({
          next: () => {
            this.colisList.update(list => list.map(c => c.id === id ? { ...c, statut: 'retire' } : c));
            Swal.fire('Validé !', 'Le colis a été marqué comme retiré.', 'success');
          },
          error: (err) => {
            Swal.fire('Erreur', err.error?.message || 'Une erreur est survenue.', 'error');
          }
        });
      }
    });
  }

  onSubmitColis() {
    if (this.colisForm.invalid || !this.selectedClient()) return;

    this.isSubmitting.set(true);
    const formValue = this.colisForm.value;
    
    const payload: Partial<Colis> = {
      user_id: this.selectedClient().id,
      nom_colis: formValue.nom_colis,
      tel_destinataire: formValue.tel_destinataire,
      nom_destinataire: formValue.nom_destinataire,
      destination: formValue.destination,
      voyage_id: formValue.voyage_id,
      prix: formValue.prix,
      poids: formValue.poids
    };

    this.colisService.createColis(payload).subscribe({
      next: (newColis) => {
        this.isSubmitting.set(false);
        Swal.fire('Succès', 'Colis enregistré avec succès', 'success');
        this.colisList.update(list => [newColis, ...list]);
        this.toggleViewMode();
      },
      error: (err) => {
        console.error('Registration error', err);
        this.isSubmitting.set(false);
        Swal.fire('Erreur', err.error?.message || 'Erreur lors de l\'enregistrement.', 'error');
      }
    });
  }
}
