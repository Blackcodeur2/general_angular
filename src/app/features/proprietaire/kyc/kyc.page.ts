import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProprietaireService } from '../../../services/proprietaire/proprietaire.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { KycDocument } from '../../../models/kyc';
import Swal from 'sweetalert2';

interface UploadedFile {
  file: File;
  preview: string | null;
  name: string;
  size: string;
  type: string;
}

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './kyc.page.html',
  styleUrls: ['./kyc.page.css']
})
export class KycPage implements OnInit {
  private fb = inject(FormBuilder);
  private proprietaireService = inject(ProprietaireService);
  private authService = inject(AuthService);
  private readonly API = environment.apiUrl;

  isSubmitting = signal(false);
  isLoading = signal(true);
  uploadProgress = signal(0);
  step = signal(1);
  userStatut = computed(() => this.authService.currentUser()?.statut);

  // Type de compte
  accountType = signal<'particulier' | 'entreprise'>('particulier');

  // Documents existants
  kycDocuments = signal<KycDocument[]>([]);

  // Fichiers uploadés (Particulier)
  fileFront = signal<UploadedFile | null>(null);
  fileBack = signal<UploadedFile | null>(null);
  fileSelfie = signal<UploadedFile | null>(null);

  // Fichiers uploadés (Entreprise)
  fileRccm = signal<UploadedFile | null>(null);
  fileDfe = signal<UploadedFile | null>(null);
  fileStatuts = signal<UploadedFile | null>(null);
  filePvNomination = signal<UploadedFile | null>(null);
  fileRib = signal<UploadedFile | null>(null);
  fileGerantFront = signal<UploadedFile | null>(null);
  fileGerantBack = signal<UploadedFile | null>(null);
  fileGerantSelfie = signal<UploadedFile | null>(null);

  // Erreurs de fichiers
  fileErrors = signal<Record<string, string | undefined>>({});

  // Formulaire étape 1
  infoForm = this.fb.nonNullable.group({
    document_type: ['CNI', Validators.required],
    document_number: ['', [Validators.required, Validators.maxLength(100)]],
    expiry_date: ['', [Validators.required, this.futureDateValidator]],
  });

  ngOnInit() {
    this.loadKycStatus();
  }

  loadKycStatus() {
    this.isLoading.set(true);
    
    // Si déjà approuvé, on passe direct à l'étape 3
    const user = this.authService.currentUser();
    if (user?.statut === 'approuve') {
      this.step.set(3);
    }

    this.proprietaireService.getKycStatus().subscribe({
      next: (docs) => {
        this.kycDocuments.set(docs);
        if (docs.length > 0 || user?.statut === 'approuve') {
          this.step.set(3); // Aller direct à l'état "en attente/validé/approuvé"
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /** Vérifie que la date est dans le futur (like backend: after:today) */
  private futureDateValidator(control: import('@angular/forms').AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? null : { pastDate: true };
  }

  // L'étape 2 est valide si les fichiers requis sont présents
  canProceedStep2 = computed(() => {
    if (this.accountType() === 'particulier') {
      return this.fileFront() !== null && this.fileBack() !== null && this.fileSelfie() !== null;
    } else {
      return this.fileRccm() !== null && 
             this.fileDfe() !== null && 
             this.fileStatuts() !== null && 
             this.fileRib() !== null && 
             this.fileGerantFront() !== null && 
             this.fileGerantBack() !== null && 
             this.fileGerantSelfie() !== null;
    }
  });

  nextStep() {
    if (this.step() === 1 && this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }
    this.step.update(s => s + 1);
  }

  prevStep() { this.step.update(s => s - 1); }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  // Types autorisés par le backend (mimes)
  private readonly ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']; // documents
  private readonly ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']; // selfies: pas de PDF
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10 Mo (backend: max:10240 Ko)

  private isValidFile(file: File, field: string): string | null {
    const isPhoto = field === 'selfie' || field === 'gerant_selfie';
    const allowed = isPhoto ? this.ALLOWED_PHOTO_TYPES : this.ALLOWED_DOC_TYPES;
    const label = isPhoto ? 'JPG, PNG ou WEBP' : 'JPG, PNG, WEBP ou PDF';

    if (!allowed.includes(file.type)) {
      return `Format non supporté. Utilisez ${label}.`;
    }
    if (file.size > this.MAX_SIZE) {
      return 'Fichier trop volumineux. Maximum 10 Mo.';
    }
    return null;
  }

  private createUploadedFile(file: File): Promise<UploadedFile> {
    return new Promise((resolve) => {
      const entry: UploadedFile = {
        file,
        preview: null,
        name: file.name,
        size: this.formatFileSize(file.size),
        type: file.type,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          entry.preview = e.target?.result as string;
          resolve(entry);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(entry); // PDF — pas de preview
      }
    });
  }

  async onFileSelect(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const error = this.isValidFile(file, field);
    if (error) {
      this.fileErrors.update(e => ({ ...e, [field]: error }));
      return;
    }

    // Effacer l'erreur
    this.fileErrors.update(e => ({ ...e, [field]: undefined }));

    const uploaded = await this.createUploadedFile(file);

    switch(field) {
      case 'front': this.fileFront.set(uploaded); break;
      case 'back': this.fileBack.set(uploaded); break;
      case 'selfie': this.fileSelfie.set(uploaded); break;
      case 'rccm': this.fileRccm.set(uploaded); break;
      case 'dfe': this.fileDfe.set(uploaded); break;
      case 'statuts': this.fileStatuts.set(uploaded); break;
      case 'pv_nomination': this.filePvNomination.set(uploaded); break;
      case 'rib': this.fileRib.set(uploaded); break;
      case 'gerant_front': this.fileGerantFront.set(uploaded); break;
      case 'gerant_back': this.fileGerantBack.set(uploaded); break;
      case 'gerant_selfie': this.fileGerantSelfie.set(uploaded); break;
    }
  }

  removeFile(field: string) {
    switch(field) {
      case 'front': this.fileFront.set(null); break;
      case 'back': this.fileBack.set(null); break;
      case 'selfie': this.fileSelfie.set(null); break;
      case 'rccm': this.fileRccm.set(null); break;
      case 'dfe': this.fileDfe.set(null); break;
      case 'statuts': this.fileStatuts.set(null); break;
      case 'pv_nomination': this.filePvNomination.set(null); break;
      case 'rib': this.fileRib.set(null); break;
      case 'gerant_front': this.fileGerantFront.set(null); break;
      case 'gerant_back': this.fileGerantBack.set(null); break;
      case 'gerant_selfie': this.fileGerantSelfie.set(null); break;
    }
  }

  onSubmit() {
    if (!this.canProceedStep2()) return;
    this.isSubmitting.set(true);
    this.uploadProgress.set(0);

    const formData = new FormData();
    const info = this.infoForm.getRawValue();

    if (this.accountType() === 'particulier') {
      formData.append('document_type', info.document_type);
      formData.append('document_number', info.document_number);
      formData.append('expiry_date', info.expiry_date);
      formData.append('file_front', this.fileFront()!.file);
      formData.append('file_back', this.fileBack()!.file);
      if (this.fileSelfie()) {
        formData.append('file_selfie', this.fileSelfie()!.file);
      }
    } else {
      formData.append('rccm', this.fileRccm()!.file);
      formData.append('dfe', this.fileDfe()!.file);
      formData.append('statuts', this.fileStatuts()!.file);
      if (this.filePvNomination()) {
        formData.append('pv_nomination', this.filePvNomination()!.file);
      }
      formData.append('rib', this.fileRib()!.file);
      formData.append('gerant_id_front', this.fileGerantFront()!.file);
      formData.append('gerant_id_back', this.fileGerantBack()!.file);
      formData.append('gerant_selfie', this.fileGerantSelfie()!.file);
    }

    const submitObs = this.accountType() === 'particulier' 
      ? this.proprietaireService.submitKyc(formData)
      : this.proprietaireService.submitEntrepriseKyc(formData);

    submitObs.subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response) {
          this.isSubmitting.set(false);
          this.uploadProgress.set(100);
          this.loadKycStatus(); // Recharger les documents pour passer à l'étape 3 proprement
          Swal.fire({
            icon: 'success',
            title: 'Documents envoyés',
            text: 'Votre dossier est en cours de traitement par nos administrateurs.',
            confirmButtonColor: '#10b981'
          });
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erreur d\'envoi',
          text: err.error?.message || 'Impossible d\'envoyer vos documents. Réessayez.',
          confirmButtonColor: '#7c3aed'
        });
      }
    });
  }

  shouldShowError(controlName: string): boolean {
    const control = this.infoForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }
}
