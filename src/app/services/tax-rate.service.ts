import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaxRate } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaxRateService {
  private apiUrl = environment.apiUrl + '/tax-rates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TaxRate[]> {
    return this.http.get<TaxRate[]>(this.apiUrl);
  }

  getById(id: number): Observable<TaxRate> {
    return this.http.get<TaxRate>(`${this.apiUrl}/${id}`);
  }

  getByState(state: string): Observable<TaxRate[]> {
    return this.http.get<TaxRate[]>(`${this.apiUrl}/state/${state}`);
  }

  create(taxRate: TaxRate): Observable<TaxRate> {
    return this.http.post<TaxRate>(this.apiUrl, taxRate);
  }

  update(id: number, taxRate: TaxRate): Observable<TaxRate> {
    return this.http.put<TaxRate>(`${this.apiUrl}/${id}`, taxRate);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
