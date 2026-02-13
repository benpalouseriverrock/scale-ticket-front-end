import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generic CRUD methods
  getAll<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${endpoint}`);
  }

  getById<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: T): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  update<T>(endpoint: string, id: number, data: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}/${id}`, data);
  }

  delete(endpoint: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}/${id}`);
  }

  // Special endpoints
  customGet(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${path}`);
  }

  customPost(path: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${path}`, data);
  }
}
