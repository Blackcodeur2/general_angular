import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KycDocument } from '../../models/kyc';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminKycService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getPendingKyc(): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.API}/admin/kyc`);
  }

  approveKyc(doc_id: number): Observable<any> {
    return this.http.put(`${this.API}/admin/kyc/${doc_id}/approve`, {});
  }

  rejectKyc(doc_id: number, reason: string): Observable<any> {
    return this.http.post(`${this.API}/admin/kyc/${doc_id}/reject`, { reason });
  }
}
