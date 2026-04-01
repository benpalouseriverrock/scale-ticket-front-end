import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trailer } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrailerService {
  private apiUrl = environment.apiUrl + '/trailers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Trailer[]> {
    return this.http.get<Trailer[]>(this.apiUrl);
  }

  getById(id: number): Observable<Trailer> {
    return this.http.get<Trailer>(`${this.apiUrl}/${id}`);
  }

  create(trailer: Trailer): Observable<Trailer> {
    return this.http.post<Trailer>(this.apiUrl, trailer);
  }

  update(id: number, trailer: Trailer): Observable<Trailer> {
    return this.http.put<Trailer>(`${this.apiUrl}/${id}`, trailer);
  }

  updateTare(id: number, tare_weight: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/tare`, { tare_weight });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
