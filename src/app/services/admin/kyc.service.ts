import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user';

export interface KycDocument {
  id: number;
  type: string;
  chemin_fichier: string;
  commentaire: string;
  created_at: string;
}

export interface KycSubmission {
  user: User;
  documents: KycDocument[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminKycService {
  private http = inject(HttpClient);
  private readonly API = 'http://127.0.0.1:8000/api';

  getPendingKyc(): Observable<KycSubmission[]> {
    return this.http.get<KycSubmission[]>(`${this.API}/admin/kyc`);
  }

  approveKyc(userId: number): Observable<any> {
    return this.http.put(`${this.API}/admin/kyc/${userId}/approve`, {});
  }

  rejectKyc(userId: number, reason: string): Observable<any> {
    return this.http.post(`${this.API}/admin/kyc/${userId}/reject`, { reason });
  }
}
