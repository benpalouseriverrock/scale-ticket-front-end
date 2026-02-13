import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryRate } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeliveryRateService {
  private apiUrl = environment.apiUrl + '/delivery-rates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DeliveryRate[]> {
    return this.http.get<DeliveryRate[]>(this.apiUrl);
  }

  getById(id: number): Observable<DeliveryRate> {
    return this.http.get<DeliveryRate>(`${this.apiUrl}/${id}`);
  }

  getByMethod(method: 'location' | 'mileage'): Observable<DeliveryRate[]> {
    return this.http.get<DeliveryRate[]>(`${this.apiUrl}/method/${method}`);
  }

  create(deliveryRate: DeliveryRate): Observable<DeliveryRate> {
    return this.http.post<DeliveryRate>(this.apiUrl, deliveryRate);
  }

  update(id: number, deliveryRate: DeliveryRate): Observable<DeliveryRate> {
    return this.http.put<DeliveryRate>(`${this.apiUrl}/${id}`, deliveryRate);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
