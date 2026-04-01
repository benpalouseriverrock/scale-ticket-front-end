import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MonthlySummary {
  ticket_count: number;
  total_tons: number;
  total_revenue: number;
}

export interface CustomerBreakdown {
  customer_name: string;
  ticket_count: number;
  total_tons: number;
  total_revenue: number;
}

export interface ProductBreakdown {
  product_name: string;
  ticket_count: number;
  total_tons: number;
  total_revenue: number;
}

export interface DailyEntry {
  day: number;
  ticket_count: number;
  total_tons: number;
  total_revenue: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  summary: MonthlySummary;
  by_customer: CustomerBreakdown[];
  by_product: ProductBreakdown[];
  daily: DailyEntry[];
}

export interface AvailableMonth {
  year: number;
  month: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = environment.apiUrl + '/reports';

  constructor(private http: HttpClient) {}

  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.apiUrl}/monthly?year=${year}&month=${month}`);
  }

  getAvailableMonths(): Observable<AvailableMonth[]> {
    return this.http.get<AvailableMonth[]>(`${this.apiUrl}/available-months`);
  }
}
