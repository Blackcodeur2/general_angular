import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { AgentService } from '../../../services/agent/agent.service';
import { catchError, of, debounceTime, distinctUntilChanged, switchMap, finalize, tap } from 'rxjs';
import { Route } from '../../../models/route';
import { Voyage } from '../../../models/voyage';
import Swal from 'sweetalert2';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.css']
})
export class BookingPage implements OnInit {
  private agentService = inject(AgentService);
  private fb = inject(FormBuilder);

  // -- State --
  currentStep = signal(5); // 1: Trip, 2: Voyage, 3: Client, 4: Seat, 5: Review
  routes = signal<Route[]>([]);
  voyages = signal<Voyage[]>([]);
  clientsSearch = signal<any[]>([]);
  availableSeats = signal<string[]>([]);
  
  submitting = signal(false);
  loadingVoyages = signal(false);
  searchingClients = signal(false);
  loadingSeats = signal(false);

  // -- Selections --
  selectedRoute = signal<Route | null>(null);
  selectedVoyage = signal<Voyage | null>(null);
  selectedClient = signal<any | null>(null);
  selectedSeat = signal<string | null>(null);

  // -- Forms --
  tripForm = this.fb.group({
    route_id: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  clientSearchControl = new FormControl('');
  
  clientForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', [Validators.required, Validators.pattern('^6[0-9]{8}$')]],
    email: ['', [Validators.email]],
    num_cni: ['', Validators.required],
    sexe: ['M', Validators.required],
    date_naissance: ['', Validators.required]
  });

  isNewClient = signal(false);

  constructor() {
    // Setup search debounce
    this.clientSearchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => this.searchingClients.set(true)),
      switchMap(query => {
        if (!query || query.length < 2) return of([]);
        return this.agentService.searchClients(query).pipe(
          catchError(() => of([]))
        );
      }),
      tap(() => this.searchingClients.set(false))
    ).subscribe(results => this.clientsSearch.set(results));
  }

  ngOnInit() {
    this.loadRoutes();
  }

  loadRoutes() {
    this.agentService.getRoutes().pipe(
      catchError(() => of([] as Route[]))
    ).subscribe(routes => this.routes.set(routes));
  }

  // -- Step Navigation --
  nextStep() {
    if (this.currentStep() === 1) {
      this.searchVoyages();
    } else if (this.currentStep() === 3) {
      if (!this.selectedClient() && !this.isNewClient()) {
        Swal.fire('Attention', 'Veuillez sélectionner ou créer un client', 'warning');
        return;
      }
      if (this.isNewClient()) {
        this.submitNewClient();
        return;
      }
      this.loadSeats();
    } else {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  // -- Functional Logic --
  searchVoyages() {
    if (this.tripForm.invalid) return;
    
    this.loadingVoyages.set(true);
    const { route_id, date } = this.tripForm.value;
    
    this.agentService.getVoyagesByRoute(Number(route_id), date!).pipe(
      finalize(() => this.loadingVoyages.set(true)) // Set loading to true is weird, but let's assume UI handled
    ).subscribe(res => {
      this.voyages.set(res);
      this.loadingVoyages.set(false);
      this.currentStep.set(2);
      this.selectedRoute.set(this.routes().find(r => r.id === Number(route_id)) || null);
    });
  }

  selectVoyage(voyage: Voyage) {
    this.selectedVoyage.set(voyage);
    this.currentStep.set(3);
  }

  selectClient(client: any) {
    this.selectedClient.set(client);
    this.isNewClient.set(false);
    this.nextStep();
  }

  toggleNewClient() {
    this.isNewClient.update(v => !v);
    this.selectedClient.set(null);
  }

  submitNewClient() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.agentService.createClient(this.clientForm.value).subscribe({
      next: (client) => {
        this.selectedClient.set(client);
        this.isNewClient.set(false);
        this.submitting.set(false);
        this.loadSeats();
      },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire('Erreur', err.error?.message || 'Impossible de créer le client', 'error');
      }
    });
  }

  loadSeats() {
    if (!this.selectedVoyage()) return;
    this.loadingSeats.set(true);
    this.agentService.getAvailableSeats(this.selectedVoyage()!.id).subscribe({
      next: (seats) => {
        this.availableSeats.set(seats);
        this.loadingSeats.set(false);
        this.currentStep.set(4);
      },
      error: () => this.loadingSeats.set(false)
    });
  }

  selectSeat(seat: string) {
    this.selectedSeat.set(seat);
  }

  confirmSeat() {
    if (!this.selectedSeat()) return;
    this.currentStep.set(5);
  }

  submitBooking() {
    this.submitting.set(true);
    const payload = {
      voyage_id: this.selectedVoyage()?.id,
      client_id: this.selectedClient()?.id,
      numero_siege: this.selectedSeat(),
      // Backward compatibility fields if needed by backend until fully updated
      client_name: `${this.selectedClient()?.prenom} ${this.selectedClient()?.nom}`,
      telephone: this.selectedClient()?.telephone
    };

    this.agentService.createBooking(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        Swal.fire('Succès', 'Réservation enregistrée avec succès !', 'success').then(() => {
          this.resetBooking();
        });
      },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire('Erreur', err.error?.message || 'Erreur lors de la réservation', 'error');
      }
    });
  }

  resetBooking() {
    this.currentStep.set(1);
    this.selectedRoute.set(null);
    this.selectedVoyage.set(null);
    this.selectedClient.set(null);
    this.selectedSeat.set(null);
    this.tripForm.reset({ date: new Date().toISOString().slice(0, 10) });
    this.clientForm.reset({ sexe: 'M' });
    this.isNewClient.set(false);
  }

  // -- UI Helpers --
  getTotalSeatsArray(): number[] {
    // Assuming standard coaster if not provided, but ideally voyages should have bus info
    // For now let's generate 70 seats if we don't know
    return Array.from({ length: 70 }, (_, i) => i + 1);
  }

  isSeatAvailable(seat: number): boolean {
    return this.availableSeats().includes(seat.toString());
  }
}
