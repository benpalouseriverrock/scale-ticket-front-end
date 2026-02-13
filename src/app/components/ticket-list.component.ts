import { Component, OnInit } from '@angular/core';
import { Ticket } from '../models';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
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

  printTicket(id: number | undefined) {
    if (!id) return;
    this.ticketService.markPrinted(id, 'ticket').subscribe({
      next: () => {
        alert('Ticket marked as printed');
        this.loadTickets();
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}
