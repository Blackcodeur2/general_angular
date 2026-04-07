import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../../models/user';

export interface AuthResponse {
  user: User;
  token?: string;
  access_token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API = 'http://127.0.0.1:8000/api';

  // État réactif de l'utilisateur avec Signal
  public readonly currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) { }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(response => {
        const token = response.token || response.access_token;
        if (token && response.user) {
          this.saveSession(response.user, token);
        }
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    const role = data.role_user?.toLowerCase() || 'client';
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(response => {
        const token = response.token || response.access_token;
        if (token && response.user) {
          this.saveSession(response.user, token);
        }
      })
    );
  }

  saveSession(user: User, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role_user);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this.http.post(`${this.API}/forgot-password`, data);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.API}/reset-password`, data);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  fetchUser(): Observable<User> {
    return this.http.get<User>(`${this.API}/user`).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}).pipe(
      tap({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      })
    );
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const user = this.currentUser();
    return user ? user.role_user : localStorage.getItem('role');
  }
}
