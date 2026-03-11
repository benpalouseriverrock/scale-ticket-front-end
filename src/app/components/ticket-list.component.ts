import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Ticket } from '../models';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  @Output() printRequested = new EventEmitter<{ id: number; mode: 'ticket' | 'invoice' }>();
  @Output() editRequested = new EventEmitter<any>();

  tickets: Ticket[] = [];
  loading = true;

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getAll().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.loading = false;
      }
    });
  }

  deleteTicket(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure?')) {
      this.ticketService.delete(id).subscribe({
        next: () => {
          this.loadTickets();
        },
        error: (error) => {
          console.error('Error deleting ticket:', error);
        }
      });
    }
  }

  printTicket(id: number | undefined, mode: 'ticket' | 'invoice') {
    if (!id) return;
    this.printRequested.emit({ id, mode });
  }

  editTicket(ticket: any) {
    this.editRequested.emit(ticket);
  }

  pushToHaulHub(id: number | undefined) {
    if (!id) return;
    if (!confirm('Push this WSDOT ticket to HaulHub?')) return;
    this.ticketService.pushToHaulHub(id).subscribe({
      next: (res: any) => {
        const ok = res.haulhub_status === 200 || res.haulhub_status === 201;
        alert(ok ? 'Ticket pushed to HaulHub successfully.' : `HaulHub responded with status ${res.haulhub_status}.`);
        this.loadTickets();
      },
      error: (error: any) => {
        alert('Failed to push to HaulHub: ' + (error.error?.error || error.message));
      }
    });
  }
}
