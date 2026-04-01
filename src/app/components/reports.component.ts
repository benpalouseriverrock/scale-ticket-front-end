import { Component, OnInit } from '@angular/core';
import {
  ReportService,
  MonthlyReport,
  AvailableMonth
} from '../services/report.service';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  availableMonths: AvailableMonth[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  report: MonthlyReport | null = null;
  loading = false;
  error = '';

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.reportService.getAvailableMonths().subscribe({
      next: (months) => {
        this.availableMonths = months;
        if (months.length > 0) {
          this.selectedYear = months[0].year;
          this.selectedMonth = months[0].month;
          this.loadReport();
        }
      },
      error: () => {
        this.loadReport();
      }
    });
  }

  loadReport() {
    this.loading = true;
    this.error = '';
    this.report = null;

    this.reportService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load report.';
        this.loading = false;
      }
    });
  }

  get monthLabel(): string {
    return `${MONTH_NAMES[this.selectedMonth]} ${this.selectedYear}`;
  }

  monthName(m: number): string {
    return MONTH_NAMES[m] || '';
  }

  formatCurrency(value: number): string {
    return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatTons(value: number): string {
    return value.toFixed(2);
  }

  get years(): number[] {
    const ys = [...new Set(this.availableMonths.map(m => m.year))].sort((a, b) => b - a);
    if (ys.length === 0) {
      const y = new Date().getFullYear();
      return [y, y - 1];
    }
    return ys;
  }

  get monthsForYear(): number[] {
    const months = this.availableMonths
      .filter(m => m.year === this.selectedYear)
      .map(m => m.month)
      .sort((a, b) => b - a);
    if (months.length === 0) {
      return Array.from({ length: 12 }, (_, i) => i + 1).reverse();
    }
    return months;
  }

  onYearChange() {
    const months = this.monthsForYear;
    if (months.length > 0) this.selectedMonth = months[0];
    this.loadReport();
  }

  onMonthChange() {
    this.loadReport();
  }
}
