import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TicketService } from '../services/ticket.service';
import { LOGO_B64 } from './ticket-print.logo';

@Component({
  selector: 'app-ticket-print',
  templateUrl: './ticket-print.component.html',
  styleUrls: ['./ticket-print.component.css']
})
export class TicketPrintComponent implements OnInit {
  @Input() ticketId!: number;
  @Input() mode: 'ticket' | 'invoice' = 'invoice';
  @Output() done = new EventEmitter<void>();

  ticket: any = null;
  loading = true;
  error = '';
  logoSrc = LOGO_B64;

  copyLabels = [
    'Office Copy — Permanent File',
    'Office Copy — Billing',
    'Delivery Copy'
  ];

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.getById(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.loading = false;
        setTimeout(() => {
          window.print();
          this.ticketService.markPrinted(this.ticketId, this.mode).subscribe();
        }, 600);
      },
      error: () => {
        this.error = 'Failed to load ticket';
        this.loading = false;
      }
    });
  }

  getMaterialCost(): number {
    if (!this.ticket) return 0;
    return parseFloat(this.ticket.subtotal || 0) - parseFloat(this.ticket.delivery_charge || 0);
  }

  formatWeight(val: any): string {
    const n = parseFloat(val || 0);
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatMoney(val: any): string {
    const n = parseFloat(val || 0);
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  close(): void {
    this.done.emit();
  }
}
