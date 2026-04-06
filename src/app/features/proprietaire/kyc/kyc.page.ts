import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
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
export class KycPage {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private readonly API = 'http://127.0.0.1:8000/api';

  isSubmitting = signal(false);
  uploadProgress = signal(0);
  step = signal(1);

  // Fichiers uploadés
  fileFront = signal<UploadedFile | null>(null);
  fileBack = signal<UploadedFile | null>(null);
  fileSelfie = signal<UploadedFile | null>(null);

  // Erreurs de fichiers
  fileErrors = signal<{ front?: string; back?: string; selfie?: string }>({});

  // Formulaire étape 1
  infoForm = this.fb.nonNullable.group({
    document_type: ['CNI', Validators.required],
    document_number: ['', [Validators.required, Validators.maxLength(100)]],
    expiry_date: ['', [Validators.required, this.futureDateValidator]],
  });

  /** Vérifie que la date est dans le futur (like backend: after:today) */
  private futureDateValidator(control: import('@angular/forms').AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? null : { pastDate: true };
  }

  // L'étape 2 est valide si les 3 fichiers requis sont présents
  canProceedStep2 = computed(() => {
    const requiresSelfie = true; // peut être conditionnel
    return this.fileFront() !== null && this.fileBack() !== null && (!requiresSelfie || this.fileSelfie() !== null);
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
  private readonly ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']; // recto & verso
  private readonly ALLOWED_SELFIE_TYPES = ['image/jpeg', 'image/png', 'image/webp']; // selfie: pas de PDF
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10 Mo (backend: max:10240 Ko)

  private isValidFile(file: File, field: 'front' | 'back' | 'selfie'): string | null {
    const allowed = field === 'selfie' ? this.ALLOWED_SELFIE_TYPES : this.ALLOWED_DOC_TYPES;
    const label = field === 'selfie' ? 'JPG, PNG ou WEBP' : 'JPG, PNG, WEBP ou PDF';

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

  async onFileSelect(event: Event, field: 'front' | 'back' | 'selfie') {
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

    if (field === 'front') this.fileFront.set(uploaded);
    else if (field === 'back') this.fileBack.set(uploaded);
    else this.fileSelfie.set(uploaded);
  }

  removeFile(field: 'front' | 'back' | 'selfie') {
    if (field === 'front') this.fileFront.set(null);
    else if (field === 'back') this.fileBack.set(null);
    else this.fileSelfie.set(null);
  }

  onSubmit() {
    if (!this.canProceedStep2()) return;
    this.isSubmitting.set(true);
    this.uploadProgress.set(0);

    const formData = new FormData();
    const info = this.infoForm.getRawValue();
    formData.append('document_type', info.document_type);
    formData.append('document_number', info.document_number);
    formData.append('expiry_date', info.expiry_date);
    formData.append('file_front', this.fileFront()!.file);
    formData.append('file_back', this.fileBack()!.file);
    if (this.fileSelfie()) {
      formData.append('file_selfie', this.fileSelfie()!.file);
    }

    this.http.post(`${this.API}/client/kyc/submit`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response) {
          this.isSubmitting.set(false);
          this.uploadProgress.set(100);
          this.step.set(3);
        }
      },
      error: (err) => {
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
