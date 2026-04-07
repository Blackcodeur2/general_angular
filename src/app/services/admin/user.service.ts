import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private readonly API = environment.apiUrl;

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.API}/admin/users`);
    }

    createUser(userData: Partial<User>): Observable<User> {
        return this.http.post<User>(`${this.API}/admin/users`, userData);
    }
}
