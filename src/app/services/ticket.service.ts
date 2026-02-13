import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = environment.apiUrl + '/tickets';

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 20): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  create(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  markPrinted(id: number, printedAs: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${id}/print`, { printed_as: printedAs });
  }

  pushToHaulHub(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/haulhub`, {});
  }
}
