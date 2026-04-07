import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdminKycService, KycSubmission } from '../../../services/admin/kyc.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-kyc',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-kyc.page.html',
  styleUrls: ['./admin-kyc.page.css']
})
export class AdminKycPage implements OnInit {
  private kycService = inject(AdminKycService);
  private sanitizer = inject(DomSanitizer);

  submissions = signal<KycSubmission[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);

  // Modal de prévisualisation
  previewDocument = signal<{ url: SafeResourceUrl | string, rawUrl: string, type: string, comment: string, isPdf: boolean } | null>(null);

  ngOnInit() {
    this.loadPendingKyc();
  }

  loadPendingKyc() {
    this.isLoading.set(true);
    this.kycService.getPendingKyc().subscribe({
      next: (data: any) => {
        // En cas de retour paginé ou direct du backend
        this.submissions.set(Array.isArray(data) ? data : data.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire('Erreur', 'Impossible de charger les dossiers KYC.', 'error');
      }
    });
  }

  viewDocument(doc: any) {
    const backendUrl = 'http://127.0.0.1:8000/storage/kwc'; // Adaptez selon votre configuration
    const fullUrl = doc.chemin_fichier.startsWith('http') ? doc.chemin_fichier : `${backendUrl}/${doc.chemin_fichier}`;
    const isPdf = fullUrl.toLowerCase().endsWith('.pdf');
    const safeUrl = isPdf ? this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl) : fullUrl;
    
    this.previewDocument.set({
      url: safeUrl,
      rawUrl: fullUrl,
      type: doc.type,
      comment: doc.commentaire,
      isPdf: isPdf
    });
  }

  closePreview() {
    this.previewDocument.set(null);
  }

  approve(user: any) {
    Swal.fire({
      title: 'Approuver ce dossier ?',
      text: `Le compte de ${user.prenom} ${user.nom} sera activé.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, approuver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isProcessing.set(true);
        this.kycService.approveKyc(user.id).subscribe({
          next: () => {
            this.isProcessing.set(false);
            this.submissions.update(list => list.filter(sub => sub.user.id !== user.id));
            Swal.fire('Approuvé', 'Le dossier a été validé avec succès.', 'success');
          },
          error: (err: any) => {
            this.isProcessing.set(false);
            Swal.fire('Erreur', err.error?.message || 'Une erreur est survenue', 'error');
          }
        });
      }
    });
  }

  reject(user: any) {
    Swal.fire({
      title: 'Rejeter ce dossier ?',
      text: 'Veuillez saisir le motif du rejet :',
      input: 'textarea',
      inputPlaceholder: 'Document illisible, expiré, etc.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      preConfirm: (reason) => {
        if (!reason) {
          Swal.showValidationMessage('Un motif est obligatoire');
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.isProcessing.set(true);
        this.kycService.rejectKyc(user.id, result.value).subscribe({
          next: () => {
            this.isProcessing.set(false);
            this.submissions.update(list => list.filter(sub => sub.user.id !== user.id));
            Swal.fire('Rejeté', 'Le dossier a été rejeté.', 'success');
          },
          error: (err: any) => {
            this.isProcessing.set(false);
            Swal.fire('Erreur', err.error?.message || 'Une erreur est survenue', 'error');
          }
        });
      }
    });
  }
}
