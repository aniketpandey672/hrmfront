import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private signupUrl = 'https://localhost:7171/api/Auth/signup';
  private loginUrl = 'https://localhost:7171/api/Auth/login';
  private resetPassUrl = 'https://localhost:7171/api/Auth/reset-password';
  private geturl ='https://localhost:7171/api/Values/get-users';
  private deleteurl = 'https://localhost:7171/api/Values/delete-user';
  private puturl ='https://localhost:7171/api/Auth'


  constructor(private http: HttpClient) {}
  registerUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
  
    return this.http.post(this.signupUrl, userData, { headers }).pipe(
      catchError((error) => {
        // Handle specific error if email exists
        if (error.status === 409) {
          return throwError(() => new Error('Email already exists'));
        }
        return throwError(() => new Error('An error occurred during registration'));
      })
    );
  }
  

  updateUser(userId: number, userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.resetPassUrl}/${userId}`, userData, { headers });
  }

  loginUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(this.loginUrl, userData, { headers });
}

getUsers(): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.get(this.geturl, { headers });
}

deleteUserById(userId: number): Observable<any> {
  return this.http.delete(`${this.deleteurl}/${userId}`);
}

updateDetails(currentUserId: number, details: { userId: number; firstName?: string; lastName?: string; email?: string; contact?: string; }): Observable<any> {
  return this.http.put(`${this.puturl}/${currentUserId}`, details); 
}

}
