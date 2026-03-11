import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Truck } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TruckService {
  private apiUrl = environment.apiUrl + '/trucks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Truck[]> {
    return this.http.get<Truck[]>(this.apiUrl);
  }

  getById(id: number): Observable<Truck> {
    return this.http.get<Truck>(`${this.apiUrl}/${id}`);
  }

  create(truck: Truck): Observable<Truck> {
    return this.http.post<Truck>(this.apiUrl, truck);
  }

  update(id: number, truck: Truck): Observable<Truck> {
    return this.http.put<Truck>(`${this.apiUrl}/${id}`, truck);
  }

  updateTare(id: number, tareWeight: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/tare`, { tare_weight: tareWeight });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
